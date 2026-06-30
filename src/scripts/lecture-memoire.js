// Mémoire de lecture — module client partagé.
//
// Une seule convention de stockage, espace de noms `danphu:` dans localStorage :
//   danphu:lus     → tableau JSON de slugs de textes lus
//   danphu:dernier → { slug, titre, url } du dernier texte ouvert
//
// Le slug d'un texte = le dernier segment du pathname de sa page.
// Tout accès localStorage est enveloppé dans try/catch (peut lever en
// navigation privée) ; en cas d'indisponibilité, le site fonctionne comme avant.

const CLE_LUS = 'danphu:lus';
const CLE_DERNIER = 'danphu:dernier';

/** Slug = dernier segment non vide du pathname (sans slash final). */
export function slugDepuisPathname(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  return segments[segments.length - 1] || '';
}

/** Liste des slugs lus (tableau, jamais null). Robuste si stockage indisponible. */
export function lireLus() {
  try {
    const brut = localStorage.getItem(CLE_LUS);
    const valeur = brut ? JSON.parse(brut) : [];
    return Array.isArray(valeur) ? valeur : [];
  } catch {
    return [];
  }
}

/** Ajoute un slug à la liste des lus, sans doublon. Silencieux si indisponible. */
export function marquerLu(slug) {
  if (!slug) return;
  try {
    const lus = lireLus();
    if (lus.includes(slug)) return;
    lus.push(slug);
    localStorage.setItem(CLE_LUS, JSON.stringify(lus));
  } catch {
    /* navigation privée / quota : on ne fait rien */
  }
}

/** Enregistre le dernier texte ouvert. Silencieux si indisponible. */
export function enregistrerDernier(dernier) {
  try {
    localStorage.setItem(CLE_DERNIER, JSON.stringify(dernier));
  } catch {
    /* idem */
  }
}

/** Lit le dernier texte ouvert, ou null. */
export function lireDernier() {
  try {
    const brut = localStorage.getItem(CLE_DERNIER);
    return brut ? JSON.parse(brut) : null;
  } catch {
    return null;
  }
}
