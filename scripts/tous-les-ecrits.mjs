// Génère docs/tous-les-ecrits.md : tous les textes à plat (titre + corps), en un
// seul fichier. Instantané depuis src/content/textes/. Exporte genererTousEcrits()
// pour l'outil de relecture, et s'exécute en direct via `npm run tous-ecrits`.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEXTES_DIR = join(__dirname, '..', 'src', 'content', 'textes');
const OUT = join(__dirname, '..', 'docs', 'tous-les-ecrits.md');

export function genererTousEcrits(dateISO) {
  const jour = (dateISO || new Date().toISOString()).slice(0, 10);
  const files = readdirSync(TEXTES_DIR).filter((f) => f.endsWith('.md')).sort();

  let out = '# Dan Phu — tous les écrits\n\n';
  out += `_Regroupement de ${files.length} textes (source : src/content/textes/). Généré le ${jour}._\n\n---\n\n`;

  let n = 0;
  for (const f of files) {
    const raw = readFileSync(join(TEXTES_DIR, f), 'utf8');
    const { data, content } = matter(raw);
    n++;
    const titre = data.title ?? f.replace(/\.md$/, '');
    const statut = data.draft ? ' *(brouillon)*' : '';
    out += `## ${n}. ${titre}${statut}\n\n`;
    out += content.trim() + '\n\n---\n\n';
  }

  writeFileSync(OUT, out, 'utf8');
  return { count: n, path: OUT };
}

// Exécution directe : `node scripts/tous-les-ecrits.mjs` ou `npm run tous-ecrits`.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { count } = genererTousEcrits();
  console.log(`✓ docs/tous-les-ecrits.md — ${count} textes`);
}
