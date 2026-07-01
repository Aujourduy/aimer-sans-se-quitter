// Serveur statique LOCAL (dev only) — sert le build de production `dist/` du
// site danphu, pour pouvoir l'utiliser comme PWA installable via Tailscale.
//
// Pourquoi un build et non `astro dev` : le service worker (@vite-pwa/astro)
// n'est actif qu'en build de production, pas en mode dev. On sert donc `dist/`.
//
// Lancement :  npm run serve-dist   →   http://localhost:4321
// Régénérer le contenu :  npm run build  (puis le SW autoUpdate rafraîchit).
//
// N'écoute que sur l'IP Tailscale (comme relecture) → jamais LAN ni Internet.
// Tailscale serve place le HTTPS par-dessus (requis pour installer la PWA).

import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'dist');
const PORT = Number(process.env.DANPHU_PORT) || 4321;
const HOST = process.env.DANPHU_HOST || '0.0.0.0';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function resolveFile(pathname) {
  // Empêche la remontée hors de ROOT.
  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, safe);
  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    return file;
  } catch {
    // Astro sort en pages/dossier : /textes/foo → /textes/foo/index.html
    try {
      const alt = join(ROOT, safe, 'index.html');
      statSync(alt);
      return alt;
    } catch {
      return null;
    }
  }
}

const server = createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
    const file = resolveFile(pathname);
    if (!file) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      return res.end('404');
    }
    const body = readFileSync(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('500 ' + String(e));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n  danphu (dist) servi sur http://${HOST}:${PORT}\n  (build de prod avec PWA ; régénérer : npm run build)\n`);
});
