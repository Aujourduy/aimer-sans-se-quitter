// Libellés affichés et ordre des catégories de la collection « textes ».
export const CATEGORY_LABELS = {
  'amour-presence': 'Amour et présence',
  'desir-verite': 'Désir et vérité',
  'peur-masque': 'Peur et masque',
  'fables-paradoxes': 'Fables et paradoxes',
  'desir-intimite': 'Désir et intimité',
} as const;

export type Category = keyof typeof CATEGORY_LABELS;

export const CATEGORY_ORDER: Category[] = [
  'amour-presence',
  'desir-verite',
  'peur-masque',
  'fables-paradoxes',
  'desir-intimite',
];

// Ordre des trois textes d'entrée.
export const ENTRY_ROLE_ORDER = [
  'reconnaissance',
  'deplacement',
  'mecanisme',
] as const;
