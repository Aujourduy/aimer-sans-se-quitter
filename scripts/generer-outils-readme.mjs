// Régénère la section « Outils » du README à partir de package.json et des
// commentaires d'en-tête des scripts. Idempotent : réécrit uniquement le bloc
// entre les balises <!-- OUTILS:START --> et <!-- OUTILS:END -->.
//
// Lancé par le hook .githooks/pre-commit, ou à la main : `npm run outils-readme`.
// Sortie : code 0 toujours ; écrit le README seulement s'il a changé.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const README = join(ROOT, 'README.md');
const PKG = join(ROOT, 'package.json');

const START = '<!-- OUTILS:START -->';
const END = '<!-- OUTILS:END -->';

// Descriptions courtes des commandes qui n'ont pas de script .mjs dédié
// (commandes Astro natives). Les autres sont lues dans l'en-tête du .mjs.
const DESCR_NATIVES = {
  dev: 'Serveur de développement Astro, avec indicateurs de relecture (http://localhost:4321).',
  build: 'Construit le site de production dans `dist/`.',
  'build:drafts': 'Construit le site **avec les brouillons** dans `dist-dev/` (aperçu de relecture).',
  preview: 'Prévisualise le dernier build de production.',
  astro: 'Passe-plat vers la CLI Astro (`npm run astro -- <cmd>`).',
};

// Lit la 1re phrase du commentaire d'en-tête d'un script .mjs.
function descriptionDuScript(cmd) {
  const m = /node\s+(scripts\/[\w.-]+\.mjs)/.exec(SCRIPTS[cmd] || '');
  if (!m) return DESCR_NATIVES[cmd] || '';
  const path = join(ROOT, m[1]);
  if (!existsSync(path)) return DESCR_NATIVES[cmd] || '';
  const head = readFileSync(path, 'utf8').split('\n');
  // Concatène les lignes de commentaire initiales jusqu'à la 1re ligne vide/code.
  const buf = [];
  for (const line of head) {
    const t = line.trim();
    if (t.startsWith('//')) buf.push(t.replace(/^\/\/\s?/, ''));
    else if (buf.length) break;
  }
  const texte = buf.join(' ').trim();
  // 1re phrase (jusqu'au premier point suivi d'espace ou fin).
  const phrase = (texte.match(/^.*?\.(\s|$)/) || [texte])[0].trim();
  return phrase || DESCR_NATIVES[cmd] || '';
}

const pkg = JSON.parse(readFileSync(PKG, 'utf8'));
const SCRIPTS = pkg.scripts || {};

// Ordre stable : on garde l'ordre de package.json.
const lignes = Object.keys(SCRIPTS).map((cmd) => {
  const desc = descriptionDuScript(cmd);
  return `| \`npm run ${cmd}\` | ${desc} |`;
});

const bloc = [
  START,
  '',
  '> _Section générée automatiquement par `scripts/generer-outils-readme.mjs`',
  '> (hook pre-commit). Ne pas éditer à la main : modifier les scripts ou leur',
  '> commentaire d’en-tête, puis committer._',
  '',
  '| Commande | Rôle |',
  '| --- | --- |',
  ...lignes,
  '',
  'Fichiers systemd fournis dans `scripts/` : `relecture.service` (outil de',
  'relecture en service permanent), `danphu-dev.service` (aperçu de dev).',
  '',
  END,
].join('\n');

const readme = readFileSync(README, 'utf8');
if (!readme.includes(START) || !readme.includes(END)) {
  console.error(
    `⚠ Balises ${START} / ${END} absentes du README. Ajoute-les où doit vivre la section « Outils ».`
  );
  process.exit(0); // ne bloque pas le commit
}

const re = new RegExp(`${START}[\\s\\S]*?${END}`);
const next = readme.replace(re, bloc);
if (next !== readme) {
  writeFileSync(README, next, 'utf8');
  console.log('✓ README : section « Outils » régénérée.');
} else {
  console.log('README : section « Outils » déjà à jour.');
}
