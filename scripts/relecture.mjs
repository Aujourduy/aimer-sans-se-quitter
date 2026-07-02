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
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { networkInterfaces } from 'node:os';
import { spawn } from 'node:child_process';
import matter from 'gray-matter';
import { genererLivres } from './generer-livres.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEXTES_DIR = join(__dirname, '..', 'src', 'content', 'textes');
// Todolist des sujets de textes à écrire — JSON versionné (suivi git).
const SUJETS_FILE = join(__dirname, '..', 'content', 'sujets-todo.json');
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

// --- Todolist des sujets ---------------------------------------------------
// Persistée dans content/sujets-todo.json : [{ id, titre, fait, cree }].

function readSujets() {
  try {
    if (!existsSync(SUJETS_FILE)) return [];
    const arr = JSON.parse(readFileSync(SUJETS_FILE, 'utf8'));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeSujets(sujets) {
  mkdirSync(dirname(SUJETS_FILE), { recursive: true });
  writeFileSync(SUJETS_FILE, JSON.stringify(sujets, null, 2) + '\n', 'utf8');
}

function addSujet(titre) {
  const t = String(titre || '').trim();
  if (!t) throw new Error('Sujet vide');
  const sujets = readSujets();
  // id monotone (Date.now peut être indispo dans certains contextes ; ici on est
  // dans un serveur Node classique, Date.now est disponible).
  const id = 's' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  sujets.unshift({ id, titre: t, fait: false, cree: new Date().toISOString() });
  writeSujets(sujets);
  return sujets;
}

function toggleSujet(id) {
  const sujets = readSujets();
  const s = sujets.find((x) => x.id === id);
  if (!s) throw new Error('Sujet introuvable');
  s.fait = !s.fait;
  writeSujets(sujets);
  return sujets;
}

function deleteSujet(id) {
  const sujets = readSujets().filter((x) => x.id !== id);
  writeSujets(sujets);
  return sujets;
}

// --- Rebuild auto de la PWA de dev ------------------------------------------
// Après chaque écriture dans un .md, on régénère `dist-dev/` (build avec
// brouillons) pour que l'appli dev (:8444) reflète le changement. Débounced
// (les édits rapprochés fusionnent) et non concurrent (un seul build à la fois ;
// si une écriture survient pendant un build, on en relance un après). Le rebuild
// tourne en arrière-plan : l'UI de relecture n'attend jamais.
const PROJECT_DIR = join(__dirname, '..');
let rebuildTimer = null;
let rebuilding = false;
let rebuildAgain = false;

function runBuildDrafts() {
  rebuilding = true;
  console.log('  ↻ rebuild PWA dev (build:drafts)…');
  // On invoque astro via le node courant (process.execPath) et le binaire local,
  // sans dépendre de `npm` dans le PATH — le service systemd a un PATH minimal.
  const astroBin = join(PROJECT_DIR, 'node_modules', 'astro', 'astro.js');
  const child = spawn(process.execPath, [astroBin, 'build', '--outDir', 'dist-dev'], {
    cwd: PROJECT_DIR,
    stdio: 'ignore',
    env: { ...process.env, INCLUDE_DRAFTS: 'true' },
  });
  child.on('exit', (code) => {
    rebuilding = false;
    console.log(code === 0 ? '  ✓ PWA dev à jour' : `  ✗ rebuild échoué (code ${code})`);
    // Une écriture est arrivée pendant le build → on relance une fois.
    if (rebuildAgain) {
      rebuildAgain = false;
      runBuildDrafts();
    }
  });
  child.on('error', (e) => {
    rebuilding = false;
    console.log('  ✗ rebuild impossible : ' + e.message);
  });
}

function rebuildDev() {
  if (rebuilding) {
    rebuildAgain = true; // sera relancé à la fin du build en cours
    return;
  }
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(runBuildDrafts, 3000); // débounce 3 s
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
  rebuildDev(); // un draft/validation modifié → régénère la PWA dev
  return !current;
}

// Renvoie le CORPS markdown brut (tout ce qui suit le frontmatter), pour l'éditer.
function readCorps(slug) {
  const raw = readFileSync(join(TEXTES_DIR, slug + '.md'), 'utf8');
  const { content } = matter(raw);
  return content;
}

// Réécrit le CORPS markdown en préservant le frontmatter OCTET POUR OCTET
// (même philosophie que toggleField : on ne reformate jamais le YAML).
// On retrouve la fin du frontmatter (le « --- » fermant) et on remplace tout
// ce qui suit. La nouvelle valeur garde une ligne vide après le frontmatter.
function writeCorps(slug, corps) {
  const path = join(TEXTES_DIR, slug + '.md');
  const raw = readFileSync(path, 'utf8');

  // Le frontmatter va du premier « --- » au « --- » fermant.
  if (!raw.startsWith('---')) {
    // Pas de frontmatter : on réécrit tout le fichier comme corps.
    writeFileSync(path, normaliseCorps(corps), 'utf8');
    rebuildDev();
    return;
  }
  const close = raw.indexOf('\n---', 3);
  if (close === -1) throw new Error('Frontmatter non terminé dans ' + slug);
  // Fin de la ligne « --- » fermante.
  const afterMarker = raw.indexOf('\n', close + 1);
  const frontmatter = afterMarker === -1 ? raw : raw.slice(0, afterMarker); // inclut le « --- » fermant
  writeFileSync(path, frontmatter + '\n\n' + normaliseCorps(corps) + '\n', 'utf8');
  rebuildDev();
}

// Normalise le corps reçu : retire les CR (\r) et les blancs en fin, garde le
// texte tel que saisi pour le reste.
function normaliseCorps(s) {
  return String(s).replace(/\r\n/g, '\n').replace(/\s+$/, '');
}

// Réécrit le TITRE (ligne `title:` du frontmatter) de façon CHIRURGICALE :
// on ne touche qu'à cette ligne, le reste du fichier est préservé octet pour
// octet (mêmes garanties que toggleField). Le titre est toujours réécrit entre
// guillemets doubles (format des 116 fichiers). On nettoie le titre reçu :
// pas de saut de ligne, espaces en trop retirés, guillemets doubles internes
// remplacés par des guillemets typographiques pour ne pas casser le YAML.
function writeTitre(slug, titre) {
  const path = join(TEXTES_DIR, slug + '.md');
  const raw = readFileSync(path, 'utf8');

  const clean = String(titre)
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/"/g, '”'); // un " dans le titre casserait le YAML → guillemet courbant
  if (!clean) throw new Error('Titre vide');

  // Bornes du frontmatter (entre les deux premiers « --- »).
  const fmEnd = raw.indexOf('\n---', 3);
  const head = fmEnd === -1 ? raw : raw.slice(0, fmEnd);
  const rest = fmEnd === -1 ? '' : raw.slice(fmEnd);

  const lineRe = /^(\s*title\s*:\s*).*$/m;
  if (!lineRe.test(head)) throw new Error('Ligne title introuvable dans ' + slug);
  const newHead = head.replace(lineRe, `$1"${clean}"`);

  writeFileSync(path, newHead + rest, 'utf8');
  rebuildDev();
  return clean;
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
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#1A2D4A">
<link rel="apple-touch-icon" href="/pwa/icon-192.png">
<link rel="icon" type="image/png" href="/pwa/icon-192.png">
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
  /* --- Todolist des sujets --- */
  .sujets{border:1px solid var(--filet);border-radius:.5rem;padding:.6rem;margin-bottom:.9rem;background:#fbf8f2;}
  .sujets-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;}
  .sujets-head h2{font-size:.78rem;font-weight:700;color:var(--bleu);margin:0;text-transform:uppercase;letter-spacing:.03em;}
  .sujets-toggle{font-size:.68rem;color:var(--sepia);background:none;border:none;cursor:pointer;text-decoration:underline;padding:0;}
  .sujet-add{display:flex;gap:.3rem;margin-bottom:.5rem;}
  .sujet-add input{flex:1;min-width:0;padding:.35rem .5rem;border:1px solid var(--filet);border-radius:.4rem;font-size:.82rem;}
  .sujet-add button{padding:.35rem .6rem;border:1px solid var(--bleu);background:var(--bleu);color:#fff;border-radius:.4rem;cursor:pointer;font-size:.82rem;}
  .sujet{display:flex;align-items:flex-start;gap:.45rem;padding:.28rem .1rem;font-size:.83rem;line-height:1.3;}
  .sujet input[type=checkbox]{margin-top:.15rem;cursor:pointer;accent-color:var(--vert);}
  .sujet-titre{flex:1;color:var(--encre);cursor:pointer;}
  .sujet.fait .sujet-titre{text-decoration:line-through;color:var(--sepia);opacity:.7;}
  .sujet-del{background:none;border:none;color:var(--filet);cursor:pointer;font-size:.9rem;line-height:1;padding:0 .1rem;}
  .sujet-del:hover{color:#b04a3a;}
  .sujets-empty{font-size:.76rem;color:var(--sepia);font-style:italic;}
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
  .actions button.edit-btn{margin-left:auto;}
  .editor{width:100%;min-height:300px;font-family:Georgia,serif;font-size:1.05rem;line-height:1.7;color:var(--encre);background:#fff;border:1px solid var(--filet);border-radius:.4rem;padding:.9rem 1rem;resize:vertical;box-sizing:border-box;}
  .titre-input{width:100%;font-family:Georgia,serif;font-size:1.5rem;color:var(--bleu);background:#fff;border:1px solid var(--filet);border-radius:.4rem;padding:.5rem .7rem;box-sizing:border-box;}
  .editor:focus{outline:2px solid var(--bleu);outline-offset:1px;}
  .edit-actions{display:flex;gap:.6rem;align-items:center;margin-top:.8rem;flex-wrap:wrap;}
  .save-btn{font-size:.9rem;padding:.5rem 1rem;border-radius:.4rem;cursor:pointer;border:1px solid var(--bleu);background:var(--bleu);color:#fff;}
  .cancel-btn{font-size:.9rem;padding:.5rem 1rem;border-radius:.4rem;cursor:pointer;border:1px solid var(--filet);background:#fff;color:var(--sepia);}
  .edit-msg{font-size:.82rem;color:var(--sepia);}
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
    <input class="search" id="search" placeholder="Rechercher (mots-clés, OU, fautes tolérées)…">
    <section class="sujets">
      <div class="sujets-head">
        <h2>Sujets à écrire</h2>
        <button class="sujets-toggle" id="sujets-toggle">masquer les faits</button>
      </div>
      <form class="sujet-add" id="sujet-add">
        <input id="sujet-input" placeholder="Nouveau sujet de texte…" autocomplete="off">
        <button type="submit">+</button>
      </form>
      <div id="sujets-list"></div>
    </section>
    <button class="gen" id="gen">Régénérer les livres</button>
    <div class="gen-msg" id="gen-msg"></div>
    <div id="list"></div>
  </aside>
  <main class="main" id="main"><p class="empty">Sélectionne un texte à gauche.</p></main>
</div>
<script>
const LIVRE_FLAGS=${JSON.stringify(LIVRE_FLAGS)};
let TEXTES=[], filter='all', q='', sel=null;
let SUJETS=[], masquerFaits=false;
const $=s=>document.querySelector(s);

// --- Recherche floue : chaque mot toléré aux fautes, mots reliés par OU -------
function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,''); }
// Distance de Levenshtein (bornée : on s'arrête si > max pour la perf).
function lev(a,b,max){
  const la=a.length, lb=b.length;
  if(Math.abs(la-lb)>max) return max+1;
  let prev=Array.from({length:lb+1},(_,i)=>i);
  for(let i=1;i<=la;i++){
    let cur=[i]; let best=i;
    for(let j=1;j<=lb;j++){
      const cost=a[i-1]===b[j-1]?0:1;
      const v=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+cost);
      cur[j]=v; if(v<best)best=v;
    }
    if(best>max) return max+1;
    prev=cur;
  }
  return prev[lb];
}
// Un mot-clé « matche » un texte si : sous-chaîne exacte, OU un mot du texte est
// à faible distance de Levenshtein (tolérance ∝ longueur du mot recherché).
function motMatche(mot, texteNorm, motsTexte){
  if(!mot) return true;
  if(texteNorm.includes(mot)) return true;
  const tol = mot.length<=4?1:(mot.length<=7?2:3);
  for(const w of motsTexte){ if(lev(mot,w,tol)<=tol) return true; }
  return false;
}
// Requête entière : au moins UN mot-clé matche (OU). Champs = titre (+ autres).
function matcheRecherche(champs){
  if(!q) return true;
  const mots=q.split(/\\s+/).filter(Boolean);
  if(!mots.length) return true;
  const texteNorm=norm(champs);
  const motsTexte=texteNorm.split(/[^a-z0-9]+/).filter(Boolean);
  return mots.some(m=>motMatche(m, texteNorm, motsTexte));
}

async function load(){
  TEXTES=await (await fetch('/api/textes')).json();
  SUJETS=await (await fetch('/api/sujets')).json();
  render(); renderSujets();
}

function visible(t){
  if(filter==='todo'&&t.verifieParDuy)return false;
  if(filter==='ok'&&!t.verifieParDuy)return false;
  if(filter==='draft'&&!t.draft)return false;
  if(filter==='pub'&&t.draft)return false;
  if(filter.startsWith('flag:')&&!t[filter.slice(5)])return false;
  if(q&&!matcheRecherche(t.title))return false;
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

// --- Rendu de la todolist des sujets ---------------------------------------
function renderSujets(){
  const cont=$('#sujets-list'); if(!cont) return;
  let items=SUJETS.slice();
  if(masquerFaits) items=items.filter(s=>!s.fait);
  if(q) items=items.filter(s=>matcheRecherche(s.titre));
  // Les sujets non faits d'abord, puis les faits.
  items.sort((a,b)=>(a.fait?1:0)-(b.fait?1:0));
  if(!items.length){ cont.innerHTML='<p class="sujets-empty">'+(SUJETS.length?'Aucun sujet ne correspond.':'Aucun sujet pour le moment.')+'</p>'; return; }
  cont.innerHTML=items.map(s=>
    '<div class="sujet'+(s.fait?' fait':'')+'">'
    +'<input type="checkbox" '+(s.fait?'checked':'')+' onchange="toggleSujet(\\''+s.id+'\\')">'
    +'<span class="sujet-titre" onclick="toggleSujet(\\''+s.id+'\\')">'+esc(s.titre)+'</span>'
    +'<button class="sujet-del" title="Supprimer" onclick="deleteSujet(\\''+s.id+'\\')">×</button>'
    +'</div>'
  ).join('');
}
async function addSujet(titre){
  const r=await (await fetch('/api/sujets/add',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({titre})})).json();
  if(r.ok){ SUJETS=r.sujets; renderSujets(); }
}
async function toggleSujet(id){
  const r=await (await fetch('/api/sujets/toggle',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id})})).json();
  if(r.ok){ SUJETS=r.sujets; renderSujets(); }
}
async function deleteSujet(id){
  const r=await (await fetch('/api/sujets/delete',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id})})).json();
  if(r.ok){ SUJETS=r.sujets; renderSujets(); }
}
window.toggleSujet=toggleSujet; window.deleteSujet=deleteSujet;

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
var SRC='';      // markdown brut du texte ouvert (pour l'édition)
var TITRE='';    // titre courant du texte ouvert (pour l'édition)
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
async function open_(slug){
  sel=slug; render();
  const d=await (await fetch('/api/texte/'+slug)).json();
  SRC=d.source||'';
  TITRE=d.title||'';
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
    +'<button class="edit-btn" onclick="titreStart(\\''+slug+'\\')">✎ Titre</button>'
    +'<button class="edit-btn" onclick="editStart(\\''+slug+'\\')">✎ Modifier le texte</button>'
    +'</div>'
    +'<div class="actions livre-actions"><span class="livre-label">Livres :</span>'+livreBtns+'</div>'
    +'<h2 class="read-title" id="read-title">'+esc(d.title)+'</h2><div class="prose" id="prose">'+d.html+'</div>';
}

// --- Édition du TITRE -------------------------------------------------------
function titreStart(slug){
  const h=$('#read-title'); if(!h) return;
  h.innerHTML='<input id="titre-input" class="titre-input" type="text">'
    +'<span class="edit-actions" style="display:flex;gap:.6rem;align-items:center;margin-top:.6rem">'
    +'<button class="save-btn" onclick="titreSave(\\''+slug+'\\')">Enregistrer</button>'
    +'<button class="cancel-btn" onclick="open_(\\''+slug+'\\')">Annuler</button>'
    +'<span id="titre-msg" class="edit-msg"></span></span>';
  const inp=$('#titre-input'); inp.value=TITRE; inp.focus(); inp.select();
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){e.preventDefault();titreSave(slug);} if(e.key==='Escape'){open_(slug);} });
}
async function titreSave(slug){
  const inp=$('#titre-input'); if(!inp) return;
  const msg=$('#titre-msg'); msg.textContent='Enregistrement…';
  try{
    const r=await (await fetch('/api/titre',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({slug,titre:inp.value})})).json();
    if(r.ok){
      TITRE=r.title;
      const t=TEXTES.find(x=>x.slug===slug); if(t) t.title=r.title; // MAJ la liste sans recharger
      msg.textContent='✓ Enregistré'; setTimeout(()=>{ render(); open_(slug); },400);
    } else { msg.textContent='Erreur : '+(r.error||'inconnue'); }
  }catch(e){ msg.textContent='Erreur : '+e; }
}

// --- Édition du corps -------------------------------------------------------
function editStart(slug){
  const prose=$('#prose'); if(!prose) return;
  prose.innerHTML='<textarea id="editor" class="editor" spellcheck="true"></textarea>'
    +'<div class="edit-actions">'
    +'<button class="save-btn" onclick="editSave(\\''+slug+'\\')">Enregistrer</button>'
    +'<button class="cancel-btn" onclick="open_(\\''+slug+'\\')">Annuler</button>'
    +'<span id="edit-msg" class="edit-msg"></span>'
    +'</div>';
  const ta=$('#editor'); ta.value=SRC;
  // hauteur auto-ajustée au contenu
  ta.style.height='auto'; ta.style.height=Math.max(300,ta.scrollHeight+20)+'px';
  ta.focus();
}
async function editSave(slug){
  const ta=$('#editor'); if(!ta) return;
  const msg=$('#edit-msg'); msg.textContent='Enregistrement…';
  try{
    const r=await (await fetch('/api/corps',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({slug,corps:ta.value})})).json();
    if(r.ok){ SRC=ta.value; msg.textContent='✓ Enregistré'; setTimeout(()=>open_(slug),500); }
    else { msg.textContent='Erreur : '+(r.error||'inconnue'); }
  }catch(e){ msg.textContent='Erreur : '+e; }
}
async function toggle(slug,field){
  const r=await (await fetch('/api/toggle',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({slug,field})})).json();
  const t=TEXTES.find(x=>x.slug===slug); t[field]=r.value;
  render(); open_(slug);
}
$('#filters').addEventListener('click',e=>{if(e.target.dataset.f){filter=e.target.dataset.f;[...$('#filters').children].forEach(b=>b.classList.toggle('active',b===e.target));render();}});
function backToList(){ document.querySelector('.app').classList.remove('reading'); window.scrollTo(0,0); }
$('#search').addEventListener('input',e=>{q=norm(e.target.value).trim();render();renderSujets();});
// --- Todolist des sujets : ajout, filtre « masquer les faits » ---
$('#sujet-add').addEventListener('submit',e=>{
  e.preventDefault();
  const inp=$('#sujet-input'); const v=inp.value.trim();
  if(v){ addSujet(v); inp.value=''; inp.focus(); }
});
$('#sujets-toggle').addEventListener('click',()=>{
  masquerFaits=!masquerFaits;
  $('#sujets-toggle').textContent=masquerFaits?'montrer les faits':'masquer les faits';
  renderSujets();
});
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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
</script>
</body></html>`;
}

// --- PWA : manifeste, service worker, icônes -------------------------------
// L'outil de relecture devient installable (appli plein écran) sur mobile via
// HTTPS (tailscale serve). Fond bleu d'encre pour se distinguer du site danphu
// (fond crème). Le SW met en cache l'app-shell ; les appels /api/* restent en
// réseau (données toujours fraîches, écriture directe dans les .md).
const PWA_MANIFEST = JSON.stringify({
  name: 'Relecture — Aimer sans se quitter',
  short_name: 'Relecture',
  lang: 'fr',
  dir: 'ltr',
  display: 'standalone',
  start_url: '/',
  scope: '/',
  background_color: '#1A2D4A',
  theme_color: '#1A2D4A',
  icons: [
    { src: '/pwa/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/pwa/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/pwa/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
});
// Service worker minimal, sans dépendance : cache l'app-shell (la page /),
// réseau d'abord pour la navigation (toujours à jour), jamais les /api/*.
const PWA_SW = `
const CACHE = 'relecture-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (u.pathname.startsWith('/api/')) return; // données : toujours réseau
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((r) => { caches.open(CACHE).then((c) => c.put('/', r.clone())); return r; })
        .catch(() => caches.match('/'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((c) => c || fetch(e.request).then((r) => {
      const copy = r.clone();
      caches.open(CACHE).then((cache) => cache.put(e.request, copy));
      return r;
    }))
  );
});
`;
const PWA_ICON_DIR = join(__dirname, '..', 'public', 'relecture-pwa');
const PWA_ICONS = {
  '/pwa/icon-192.png': 'icon-192.png',
  '/pwa/icon-512.png': 'icon-512.png',
  '/pwa/icon-maskable-512.png': 'icon-maskable-512.png',
};

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
      // `source` = markdown brut éditable ; `html` = rendu lecture.
      return json(res, { title: data.title ?? slug, html: renderMarkdown(content), source: content });
    }
    if (req.method === 'POST' && url.pathname === '/api/corps') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const { slug, corps } = JSON.parse(body);
          if (typeof slug !== 'string' || typeof corps !== 'string') {
            throw new Error('Paramètres invalides');
          }
          writeCorps(slug, corps);
          // On renvoie le rendu à jour pour rafraîchir la vue lecture.
          json(res, { ok: true, html: renderMarkdown(readCorps(slug)) });
        } catch (e) {
          json(res, { ok: false, error: String(e) }, 400);
        }
      });
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/titre') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const { slug, titre } = JSON.parse(body);
          if (typeof slug !== 'string' || typeof titre !== 'string') {
            throw new Error('Paramètres invalides');
          }
          const value = writeTitre(slug, titre);
          json(res, { ok: true, title: value });
        } catch (e) {
          json(res, { ok: false, error: String(e) }, 400);
        }
      });
      return;
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
    // --- Todolist des sujets ---
    if (req.method === 'GET' && url.pathname === '/api/sujets') {
      return json(res, readSujets());
    }
    if (req.method === 'POST' && url.pathname === '/api/sujets/add') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const { titre } = JSON.parse(body);
          json(res, { ok: true, sujets: addSujet(titre) });
        } catch (e) {
          json(res, { ok: false, error: String(e) }, 400);
        }
      });
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/sujets/toggle') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const { id } = JSON.parse(body);
          json(res, { ok: true, sujets: toggleSujet(id) });
        } catch (e) {
          json(res, { ok: false, error: String(e) }, 400);
        }
      });
      return;
    }
    if (req.method === 'POST' && url.pathname === '/api/sujets/delete') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        try {
          const { id } = JSON.parse(body);
          json(res, { ok: true, sujets: deleteSujet(id) });
        } catch (e) {
          json(res, { ok: false, error: String(e) }, 400);
        }
      });
      return;
    }
    // --- PWA ---
    if (req.method === 'GET' && url.pathname === '/manifest.webmanifest') {
      res.writeHead(200, { 'content-type': 'application/manifest+json; charset=utf-8' });
      return res.end(PWA_MANIFEST);
    }
    if (req.method === 'GET' && url.pathname === '/sw.js') {
      res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
      return res.end(PWA_SW);
    }
    if (req.method === 'GET' && PWA_ICONS[url.pathname]) {
      const buf = readFileSync(join(PWA_ICON_DIR, PWA_ICONS[url.pathname]));
      res.writeHead(200, { 'content-type': 'image/png' });
      return res.end(buf);
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
