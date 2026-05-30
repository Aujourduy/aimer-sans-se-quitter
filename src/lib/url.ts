// Préfixe tous les liens internes avec le `base` du site (sous-dossier
// GitHub Pages). Astro gère `base` pour les assets, mais pas pour les
// attributs href : on le fait donc à la main via ce petit utilitaire.
const BASE = import.meta.env.BASE_URL; // ex. '/aimer-sans-se-quitter/'

export function url(path: string): string {
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}` || '/';
}
