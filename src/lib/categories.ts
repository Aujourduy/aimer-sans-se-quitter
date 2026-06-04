// Libellés affichés et ordre des catégories de la collection « textes ».
export const CATEGORY_LABELS = {
  'amour-presence': 'Amour et présence',
  'desir-verite': 'Désir et vérité',
  'peur-masque': 'Peur et masque',
  'fables-paradoxes': 'Fables et paradoxes',
  'desir-intimite': 'Désir et intimité',
} as const;

export type Category = keyof typeof CATEGORY_LABELS;

// Descriptions affichées (reprises de la sélection v10). En italique sépia sur
// les cartes du sommaire et en sous-titre des pages de thème.
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  'amour-presence':
    'Présence, relation à soi, l’amour déjà là, le manque, l’après-rupture.',
  'desir-verite':
    'Vérité, non-dits, se montrer, clarté, don vs investissement, dire ses peurs.',
  'peur-masque': 'Le masque, la peur, le trauma du passé, les reproches.',
  'fables-paradoxes': 'Catégorie-signature.',
  'desir-intimite':
    'Le registre intime, en bas de page — un seuil qu’on franchit volontairement.',
};

// Texte d’accueil du registre intime, affiché sous la carte « Désir et
// intimité » du sommaire et en haut de la page de thème correspondante.
export const DESIR_INTIMITE_INTRO =
  'Plus bas, des textes plus intimes. Ils ne sont pas là pour raconter, mais pour montrer qu’une autre façon d’aimer et de désirer existe — non pas en théorie, mais vécue. Pour que la part de toi qui le pressentait sache qu’elle ne se trompait pas.';

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
