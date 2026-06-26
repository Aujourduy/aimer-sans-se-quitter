// Génère les dossiers de livres À PARTIR des indicateurs cochés sur les textes.
//
// Source de vérité = les champs booléens `livre*` du frontmatter de chaque
// .md (basculés dans l'outil de relecture). Pour chaque indicateur, on
// (re)crée dans docs/livres/ :
//   - <slug>/                un dossier avec les .md retenus (copie)
//   - <slug>.md              un fichier concaténé (sans frontmatter, par thème)
//
// Lancement :  npm run livres   (ou via le bouton de l'outil de relecture)
//
// Réimporté par relecture.mjs : exporte genererLivres() qui renvoie un résumé.

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
  mkdirSync,
  copyFileSync,
  existsSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEXTES_DIR = join(__dirname, '..', 'src', 'content', 'textes');
const LIVRES_DIR = join(__dirname, '..', 'docs', 'livres');

// Les cinq livres : champ (frontmatter) → titre + slug de dossier/fichier.
const LIVRES = [
  { key: 'livreFableDanPhu', title: 'Fable de Dan Phu', slug: 'fable-de-dan-phu' },
  { key: 'livreAnalyseConte', title: 'Analyse de conte', slug: 'analyse-de-conte' },
  { key: 'livreMetaphore', title: 'Métaphore', slug: 'metaphore' },
  { key: 'livreVersus', title: 'Versus', slug: 'versus' },
  {
    key: 'livreAimerSansDisparaitre',
    title: 'Aimer sans disparaître',
    slug: 'aimer-sans-disparaitre',
  },
];

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

function loadTextes() {
  return readdirSync(TEXTES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = readFileSync(join(TEXTES_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      return { file, data, content: content.trim() };
    });
}

function sortItems(items) {
  return items.sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.data.category);
    const cb = CATEGORY_ORDER.indexOf(b.data.category);
    const ra = ca < 0 ? 99 : ca;
    const rb = cb < 0 ? 99 : cb;
    if (ra !== rb) return ra - rb;
    const oa = a.data.order ?? 999;
    const ob = b.data.order ?? 999;
    if (oa !== ob) return oa - ob;
    return (a.data.title ?? a.file).localeCompare(b.data.title ?? b.file, 'fr');
  });
}

// Concatène les textes en un .md lisible, groupés par thème, sans frontmatter.
function buildConcat(title, items, today) {
  let out = `# ${title}\n\n_${items.length} textes — généré le ${today}._\n`;
  let lastCat = null;
  for (const it of items) {
    if (it.data.category !== lastCat) {
      out += `\n\n---\n\n# ${CATEGORY_LABELS[it.data.category] ?? it.data.category}\n`;
      lastCat = it.data.category;
    }
    const draftMark = it.data.draft ? ' *(brouillon)*' : '';
    out += `\n\n## ${it.data.title ?? it.file}${draftMark}\n\n${it.content}\n`;
  }
  return out.trim() + '\n';
}

// Génère tous les livres. `today` est passé en paramètre (pas de Date.now ici
// pour rester déterministe / testable). Renvoie un résumé par livre.
export function genererLivres(today = new Date().toISOString().slice(0, 10)) {
  const textes = loadTextes();
  if (!existsSync(LIVRES_DIR)) mkdirSync(LIVRES_DIR, { recursive: true });
  const resume = [];

  for (const livre of LIVRES) {
    const items = sortItems(textes.filter((t) => t.data[livre.key] === true));

    // (Re)crée le dossier du livre, propre.
    const dir = join(LIVRES_DIR, livre.slug);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    for (const it of items) {
      copyFileSync(join(TEXTES_DIR, it.file), join(dir, it.file));
    }

    // Fichier concaténé.
    const concatPath = join(LIVRES_DIR, `${livre.slug}.md`);
    writeFileSync(concatPath, buildConcat(livre.title, items, today), 'utf8');

    resume.push({ title: livre.title, slug: livre.slug, count: items.length });
  }
  return resume;
}

// Exécution directe en CLI.
if (import.meta.url === `file://${process.argv[1]}`) {
  const resume = genererLivres();
  console.log('\n  Livres générés depuis les indicateurs :\n');
  for (const r of resume) {
    console.log(`  ${String(r.count).padStart(3)}  ${r.title}  (docs/livres/${r.slug}/)`);
  }
  console.log('');
}
