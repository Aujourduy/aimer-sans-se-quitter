import { defineConfig } from 'astro/config';

// Site déployé sur GitHub Pages en tant que « page de projet ».
// L'URL publique est : https://aujourduy.github.io/aimer-sans-se-quitter/
// `base` est donc le sous-dossier du dépôt. Pour un domaine personnalisé,
// remplacez `site` par votre domaine et mettez `base: '/'`.
export default defineConfig({
  site: 'https://aujourduy.github.io',
  base: '/aimer-sans-se-quitter',
});
