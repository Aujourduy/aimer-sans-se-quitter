// Chiffres romains bas-de-casse — grammaire de numérotation unique du site
// (sommaire d'Écrits, ouverture des pages de thème, folio des textes).
// Toujours rendus en EB Garamond italique sépia côté CSS.
export function romain(n: number): string {
  const t: [number, string][] = [
    [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'],
    [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'],
    [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
  ];
  let r = '';
  for (const [v, s] of t) while (n >= v) { r += s; n -= v; }
  return r;
}
