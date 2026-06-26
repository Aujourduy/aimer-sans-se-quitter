// Outil de relecture LOCAL (dev only) — JAMAIS déployé.
//
// Sert une page web pour relire les textes et basculer, d'un clic, les champs
// `verifieParDuy` (validé) et `draft` (brouillon/publié) directement dans les
// fichiers .md. Résout le problème : retrouver le bon fichier parmi ~100 noms
// qui se ressemblent au début.
//
// Lancement :  npm run relecture   →   http://localhost:4455
//
// Aucune dépendance au site Astro : lit/écrit seulement src/content/textes/*.md.

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { networkInterfaces } from 'node:os';
import matter from 'gray-matter';
import { genererLivres } from './generer-livres.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEXTES_DIR = join(__dirname, '..', 'src', 'content', 'textes');
const PORT = 4455;
// Adresse d'écoute. Par défaut 0.0.0.0 (localhost + réseau local + Tailscale).
// En service permanent, on fixe RELECTURE_HOST à l'IP Tailscale pour n'être
// joignable QUE sur le réseau Tailscale (ni localhost public, ni LAN).
const HOST = process.env.RELECTURE_HOST || '0.0.0.0';

// Libellés et ordre des thématiques (repris de src/lib/categories.ts).
const CATEGORY_LABELS = {
  'amour-presence': 'Amour et présence',
  'desir-verite': 'Désir et vérité',
  'peur-masque': 'Peur et masque',
  'fables-paradoxes': 'Fables et paradoxes',
  'desir-intimite': 'Désir et intimité',
};
const CATEGORY_ORDER = [
  'amour-presence',
  'desir-verite',
  'peur-masque',
  'fables-paradoxes',
  'desir-intimite',
];

// Indicateurs de classement par livre / type (booléens, basculés dans l'UI).
// `key` = nom du champ dans le frontmatter ; `label` = libellé affiché.
const LIVRE_FLAGS = [
  { key: 'livreFableDanPhu', label: 'Fable de Dan Phu' },
  { key: 'livreAnalyseConte', label: 'Analyse de conte' },
  { key: 'livreMetaphore', label: 'Métaphore' },
  { key: 'livreVersus', label: 'Versus' },
  { key: 'livreAimerSansDisparaitre', label: 'Aimer sans disparaître' },
];
// Champs booléens autorisés au toggle (relecture + indicateurs de livre).
const TOGGLEABLE = ['verifieParDuy', 'draft', ...LIVRE_FLAGS.map((f) => f.key)];

// --- Lecture des fichiers --------------------------------------------------

function slugOf(file) {
  return file.replace(/\.md$/, '');
}

function listTextes() {
  const files = readdirSync(TEXTES_DIR).filter((f) => f.endsWith('.md'));
  const items = files.map((file) => {
    const raw = readFileSync(join(TEXTES_DIR, file), 'utf8');
    const { data } = matter(raw);
    const item = {
      slug: slugOf(file),
      title: data.title ?? slugOf(file),
      category: data.category ?? '(sans thème)',
      order: data.order ?? 0,
      verifieParDuy: data.verifieParDuy === true,
      draft: data.draft === true,
    };
    for (const f of LIVRE_FLAGS) item[f.key] = data[f.key] === true;
    return item;
  });
  // Tri par thème (ordre défini) puis par order puis titre.
  items.sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title, 'fr');
  });
  return items;
}

function readTexte(slug) {
  const raw = readFileSync(join(TEXTES_DIR, slug + '.md'), 'utf8');
  const { data, content } = matter(raw);
  return { data, content };
}

// Bascule un champ booléen dans le frontmatter.
//
// Édition CHIRURGICALE par regex sur la seule ligne du champ : on ne réécrit
// pas tout le YAML via gray-matter, car sa sérialisation reformate les autres
// champs (guillemets perdus) et surtout altère les caractères spéciaux comme
// l'espace insécable (« vide : » devient « vide\_: »). On ne touche donc qu'à
// la ligne ciblée, tout le reste du fichier est préservé octet pour octet.
function toggleField(slug, field) {
  if (!TOGGLEABLE.includes(field)) {
    throw new Error('Champ non autorisé : ' + field);
  }
  const path = join(TEXTES_DIR, slug + '.md');
  const raw = readFileSync(path, 'utf8');

  // Bornes du frontmatter (entre les deux premiers « --- »).
  const fmEnd = raw.indexOf('\n---', 3);
  const head = fmEnd === -1 ? raw : raw.slice(0, fmEnd);
  const rest = fmEnd === -1 ? '' : raw.slice(fmEnd);

  const lineRe = new RegExp(`^(\\s*${field}\\s*:\\s*)(true|false)\\s*$`, 'm');
  const m = head.match(lineRe);

  let current;
  let newHead;
  if (m) {
    current = m[2] === 'true';
    newHead = head.replace(lineRe, `$1${!current}`);
  } else {
    // Champ absent du frontmatter (valeur par défaut = false) : on l'ajoute.
    current = false;
    newHead = head.replace(/^---\n/, `---\n${field}: true\n`);
  }

  writeFileSync(path, newHead + rest, 'utf8');
  return !current;
}

// --- Rendu markdown minimal (titres, gras/italique, paragraphes, > cit.) ---

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderMarkdown(md) {
  const lines = md.split('\n');
  const html = [];
  let inQuote = false;
  for (let line of lines) {
    let t = line.trimEnd();
    if (t.trim() === '') {
      if (inQuote) {
        html.push('</blockquote>');
        inQuote = false;
      }
      continue;
    }
    const quote = t.startsWith('>');
    if (quote) {
      t = t.replace(/^>\s?/, '');
      if (!inQuote) {
        html.push('<blockquote>');
        inQuote = true;
      }
    } else if (inQuote) {
      html.push('</blockquote>');
      inQuote = false;
    }
    let h = escapeHtml(t);
    // inline : **gras**, *italique*
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
    const head = h.match(/^(#{1,4})\s+(.*)$/);
    if (head) {
      const lvl = head[1].length;
      html.push(`<h${lvl}>${head[2]}</h${lvl}>`);
    } else {
      html.push(`<p>${h}</p>`);
    }
  }
  if (inQuote) html.push('</blockquote>');
  return html.join('\n');
}

// --- Page HTML -------------------------------------------------------------

function pageHtml() {
  return `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Relecture — Aimer sans se quitter</title>
<style>
  :root{--creme:#F4EFE6;--encre:#1F1B17;--bleu:#1A2D4A;--sepia:#6B6258;--filet:#CFC3B4;--vert:#1f7a3d;--ocre:#b08900;}
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,sans-serif;color:var(--encre);background:var(--creme);}
  .app{display:grid;grid-template-columns:380px 1fr;height:100vh;}
  .side{border-right:1px solid var(--filet);overflow-y:auto;padding:1rem;}
  .main{overflow-y:auto;padding:2rem 3rem;max-width:760px;}
  h1.app-title{font-size:1rem;margin:0 0 .25rem;color:var(--bleu);}
  .stats{font-size:.8rem;color:var(--sepia);margin-bottom:.75rem;}
  .filters{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.75rem;}
  .filters button{font-size:.72rem;padding:.2rem .5rem;border:1px solid var(--filet);background:#fff;border-radius:1rem;cursor:pointer;color:var(--sepia);}
  .filters button.active{background:var(--bleu);color:#fff;border-color:var(--bleu);}
  .search{width:100%;padding:.4rem .6rem;border:1px solid var(--filet);border-radius:.4rem;margin-bottom:.75rem;font-size:.85rem;}
  .cat{font-size:.75rem;font-weight:700;color:var(--bleu);margin:.9rem 0 .3rem;text-transform:uppercase;letter-spacing:.03em;}
  .row{padding:.4rem .5rem;border-radius:.4rem;cursor:pointer;display:flex;flex-direction:column;gap:.25rem;}
  .row:hover{background:#ece5d8;}
  .row.sel{background:#e3d9c8;}
  .row-title{font-size:.85rem;line-height:1.25;}
  .badges{display:flex;gap:.3rem;}
  .b{font-size:.62rem;font-weight:600;padding:.05rem .4rem;border-radius:.6rem;line-height:1.4;}
  .b-ok{background:var(--vert);color:#fff;} .b-todo{background:#e7e0d4;color:var(--sepia);border:1px solid var(--filet);}
  .b-draft{background:var(--ocre);color:#fff;} .b-pub{background:#e7e0d4;color:var(--sepia);border:1px solid var(--filet);}
  .b-livre{background:var(--bleu);color:#fff;}
  .livre-actions{align-items:center;gap:.4rem;margin-top:-.8rem;}
  .livre-label{font-size:.78rem;color:var(--sepia);margin-right:.2rem;}
  .b-livre-btn{font-size:.78rem;padding:.35rem .7rem;border-radius:1rem;cursor:pointer;border:1px solid var(--filet);background:#fff;color:var(--sepia);}
  .b-livre-btn.on-livre{background:var(--bleu);color:#fff;border-color:var(--bleu);}
  .main h2.read-title{font-family:Georgia,serif;color:var(--bleu);font-size:1.8rem;margin:.2rem 0 1rem;}
  .actions{display:flex;gap:.6rem;margin-bottom:1.5rem;flex-wrap:wrap;}
  .actions button{font-size:.85rem;padding:.45rem .8rem;border-radius:.4rem;cursor:pointer;border:1px solid var(--filet);background:#fff;color:var(--encre);}
  .actions button.on-ok{background:var(--vert);color:#fff;border-color:var(--vert);}
  .actions button.on-draft{background:var(--ocre);color:#fff;border-color:var(--ocre);}
  .prose{font-family:Georgia,serif;line-height:1.7;}
  .prose p{margin:0 0 1rem;} .prose blockquote{border-left:3px solid var(--filet);margin:1rem 0;padding-left:1rem;color:var(--sepia);}
  .empty{color:var(--sepia);font-style:italic;margin-top:3rem;}
  .gen{width:100%;margin-bottom:.4rem;padding:.5rem;border:1px solid var(--bleu);background:var(--bleu);color:#fff;border-radius:.4rem;cursor:pointer;font-size:.82rem;}
  .gen:hover{background:#16243b;} .gen:disabled{opacity:.6;cursor:default;}
  .gen-msg{font-size:.72rem;color:var(--sepia);margin-bottom:.6rem;min-height:1em;white-space:pre-line;}
  .back{display:none;}
  /* --- Mobile : une seule colonne, navigation liste <-> lecture --- */
  @media (max-width:760px){
    .app{grid-template-columns:1fr;height:auto;min-height:100vh;}
    .side{border-right:none;height:auto;overflow:visible;padding:.8rem;}
    .main{padding:1rem 1.1rem 3rem;max-width:none;}
    /* En mode "lecture", on masque la liste et on montre le texte ; et inversement. */
    .app.reading .side{display:none;}
    .app:not(.reading) .main{display:none;}
    .back{display:inline-block;margin-bottom:1rem;padding:.5rem .9rem;border:1px solid var(--bleu);
      background:#fff;color:var(--bleu);border-radius:.4rem;font-size:.9rem;cursor:pointer;}
    /* Zones tactiles plus grandes */
    .filters button{font-size:.85rem;padding:.4rem .7rem;}
    .row{padding:.7rem .5rem;}
    .row-title{font-size:1rem;}
    .b{font-size:.7rem;}
    .search{font-size:1rem;padding:.6rem .7rem;}
    .actions{gap:.5rem;}
    .actions button,.b-livre-btn{font-size:.95rem;padding:.6rem .9rem;flex:1 1 auto;text-align:center;}
    .livre-actions{flex-direction:column;align-items:stretch;margin-top:0;}
    .livre-label{margin:.3rem 0 0;}
    .read-title{font-size:1.5rem;}
  }
</style></head>
<body>
<div class="app">
  <aside class="side">
    <h1 class="app-title">Relecture — outil local</h1>
    <div class="stats" id="stats"></div>
    <div class="filters" id="filters">
      <button data-f="all" class="active">Tous</button>
      <button data-f="todo">À valider</button>
      <button data-f="ok">Validés</button>
      <button data-f="draft">Brouillons</button>
      <button data-f="pub">Publiés</button>
      ${LIVRE_FLAGS.map((f) => `<button data-f="flag:${f.key}">${f.label}</button>`).join('')}
    </div>
    <input class="search" id="search" placeholder="Filtrer par titre…">
    <button class="gen" id="gen">Régénérer les livres</button>
    <div class="gen-msg" id="gen-msg"></div>
    <div id="list"></div>
  </aside>
  <main class="main" id="main"><p class="empty">Sélectionne un texte à gauche.</p></main>
</div>
<script>
const LIVRE_FLAGS=${JSON.stringify(LIVRE_FLAGS)};
let TEXTES=[], filter='all', q='', sel=null;
const $=s=>document.querySelector(s);

async function load(){ TEXTES=await (await fetch('/api/textes')).json(); render(); }

function visible(t){
  if(filter==='todo'&&t.verifieParDuy)return false;
  if(filter==='ok'&&!t.verifieParDuy)return false;
  if(filter==='draft'&&!t.draft)return false;
  if(filter==='pub'&&t.draft)return false;
  if(filter.startsWith('flag:')&&!t[filter.slice(5)])return false;
  if(q&&!t.title.toLowerCase().includes(q))return false;
  return true;
}
function render(){
  const ok=TEXTES.filter(t=>t.verifieParDuy).length;
  let s=ok+'/'+TEXTES.length+' validés · '+TEXTES.filter(t=>t.draft).length+' brouillons';
  s+=' · '+LIVRE_FLAGS.map(f=>f.label+' '+TEXTES.filter(t=>t[f.key]).length).join(' · ');
  $('#stats').textContent=s;
  const cats={};
  TEXTES.filter(visible).forEach(t=>{(cats[t.category]=cats[t.category]||[]).push(t);});
  const order=['amour-presence','desir-verite','peur-masque','fables-paradoxes','desir-intimite'];
  const labels={'amour-presence':'Amour et présence','desir-verite':'Désir et vérité','peur-masque':'Peur et masque','fables-paradoxes':'Fables et paradoxes','desir-intimite':'Désir et intimité'};
  let h='';
  for(const c of order){ if(!cats[c])continue;
    h+='<div class="cat">'+(labels[c]||c)+' ('+cats[c].length+')</div>';
    for(const t of cats[c]) h+=rowHtml(t);
  }
  $('#list').innerHTML=h||'<p class="empty">Aucun texte.</p>';
}
function rowHtml(t){
  return '<div class="row'+(sel===t.slug?' sel':'')+'" onclick="open_(\\''+t.slug+'\\')">'
    +'<div class="row-title">'+t.title+'</div>'
    +'<div class="badges">'+badge(t)+'</div></div>';
}
function badge(t){
  let h='<span class="b '+(t.verifieParDuy?'b-ok':'b-todo')+'">'+(t.verifieParDuy?'✓ validé':'◯ à valider')+'</span>'
    +'<span class="b '+(t.draft?'b-draft':'b-pub')+'">'+(t.draft?'brouillon':'publié')+'</span>';
  // Pastilles des livres cochés uniquement (pour ne pas surcharger la liste).
  for(const f of LIVRE_FLAGS){ if(t[f.key]) h+='<span class="b b-livre">'+f.label+'</span>'; }
  return h;
}
async function open_(slug){
  sel=slug; render();
  const d=await (await fetch('/api/texte/'+slug)).json();
  const t=TEXTES.find(x=>x.slug===slug);
  let livreBtns='';
  for(const f of LIVRE_FLAGS){
    livreBtns+='<button class="b-livre-btn'+(t[f.key]?' on-livre':'')+'" onclick="toggle(\\''+slug+'\\',\\''+f.key+'\\')">'+(t[f.key]?'✓ ':'+ ')+f.label+'</button>';
  }
  document.querySelector('.app').classList.add('reading');
  window.scrollTo(0,0);
  $('#main').innerHTML='<button class="back" onclick="backToList()">‹ Liste</button>'
    +'<div class="actions">'
    +'<button class="'+(t.verifieParDuy?'on-ok':'')+'" onclick="toggle(\\''+slug+'\\',\\'verifieParDuy\\')">'+(t.verifieParDuy?'✓ Validé':'◯ Marquer validé')+'</button>'
    +'<button class="'+(t.draft?'on-draft':'')+'" onclick="toggle(\\''+slug+'\\',\\'draft\\')">'+(t.draft?'brouillon → publier':'publié → brouillon')+'</button>'
    +'</div>'
    +'<div class="actions livre-actions"><span class="livre-label">Livres :</span>'+livreBtns+'</div>'
    +'<h2 class="read-title">'+d.title+'</h2><div class="prose">'+d.html+'</div>';
}
async function toggle(slug,field){
  const r=await (await fetch('/api/toggle',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({slug,field})})).json();
  const t=TEXTES.find(x=>x.slug===slug); t[field]=r.value;
  render(); open_(slug);
}
$('#filters').addEventListener('click',e=>{if(e.target.dataset.f){filter=e.target.dataset.f;[...$('#filters').children].forEach(b=>b.classList.toggle('active',b===e.target));render();}});
function backToList(){ document.querySelector('.app').classList.remove('reading'); window.scrollTo(0,0); }
$('#search').addEventListener('input',e=>{q=e.target.value.toLowerCase();render();});
$('#gen').addEventListener('click',async()=>{
  const btn=$('#gen'); btn.disabled=true; btn.textContent='Génération…'; $('#gen-msg').textContent='';
  try{
    const r=await (await fetch('/api/generer-livres',{method:'POST'})).json();
    if(r.ok){ $('#gen-msg').textContent=r.resume.map(x=>x.count+' — '+x.title).join('\\n'); }
    else { $('#gen-msg').textContent='Erreur : '+(r.error||'inconnue'); }
  }catch(e){ $('#gen-msg').textContent='Erreur : '+e; }
  btn.disabled=false; btn.textContent='Régénérer les livres';
});
load();
</script>
</body></html>`;
}

// --- Serveur ---------------------------------------------------------------

function json(res, obj, code = 200) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(pageHtml());
    }
    if (req.method === 'GET' && url.pathname === '/api/textes') {
      return json(res, listTextes());
    }
    if (req.method === 'GET' && url.pathname.startsWith('/api/texte/')) {
      const slug = decodeURIComponent(url.pathname.replace('/api/texte/', ''));
      const { data, content } = readTexte(slug);
      return json(res, { title: data.title ?? slug, html: renderMarkdown(content) });
    }
    if (req.method === 'POST' && url.pathname === '/api/toggle') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const { slug, field } = JSON.parse(body);
          const value = toggleField(slug, field);
          json(res, { ok: true, value });
        } catch (e) {
          json(res, { ok: false, error: String(e) }, 400);
        }
      });
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/generer-livres') {
      const resume = genererLivres();
      return json(res, { ok: true, resume });
    }
    json(res, { error: 'not found' }, 404);
  } catch (e) {
    json(res, { error: String(e) }, 500);
  }
});

// Détecte les adresses d'accès : localhost, Tailscale (100.x via tailscale0),
// et IP du réseau local. Renvoie une liste [label, url].
function accessUrls() {
  const urls = [['Local', `http://localhost:${PORT}`]];
  const ifaces = networkInterfaces();
  for (const [name, addrs] of Object.entries(ifaces)) {
    for (const a of addrs || []) {
      if (a.family !== 'IPv4' || a.internal) continue;
      let label = 'Réseau';
      if (name.startsWith('tailscale') || a.address.startsWith('100.')) {
        label = 'Tailscale';
      }
      urls.push([label, `http://${a.address}:${PORT}`]);
    }
  }
  // Tailscale en premier après Local (le plus utile pour Duy à distance).
  urls.sort((x, y) => {
    const rank = (l) => (l === 'Local' ? 0 : l === 'Tailscale' ? 1 : 2);
    return rank(x[0]) - rank(y[0]);
  });
  return urls;
}

// Écoute sur 0.0.0.0 pour être joignable via Tailscale / réseau local,
// pas seulement en localhost.
server.listen(PORT, HOST, () => {
  const n = listTextes().length;
  console.log(`\n  Relecture — ${n} textes\n`);
  for (const [label, url] of accessUrls()) {
    console.log(`  ${label.padEnd(9)} ${url}`);
  }
  console.log('\n  (outil local, n\'affecte pas le site déployé. Ctrl+C pour quitter.)\n');
});
