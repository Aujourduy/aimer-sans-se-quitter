import { defineConfig } from 'astro/config';

// Site déployé sur GitHub Pages avec le domaine personnalisé danphu.com.
// Le domaine sert le site à la racine, donc `base` vaut '/'.
// Le fichier public/CNAME (copié tel quel dans le build) maintient le
// domaine personnalisé à chaque déploiement par GitHub Actions.
// Pour revenir à l'URL github.io : site 'https://aujourduy.github.io'
// + base '/aimer-sans-se-quitter', et supprimer public/CNAME.
export default defineConfig({
  site: 'https://danphu.com',
  base: '/',
});
