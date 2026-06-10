// Libellés affichés et ordre des catégories de la collection « textes ».
export const CATEGORY_LABELS = {
  'amour-presence': 'Amour et présence',
  'desir-verite': 'Désir et vérité',
  'peur-masque': 'Peur et masque',
  'fables-paradoxes': 'Fables et paradoxes',
  'desir-intimite': 'Désir et intimité',
} as const;

export type Category = keyof typeof CATEGORY_LABELS;

// Description courte affichée sur les CARTES du sommaire (page « Écrits »).
// En italique sépia sous le nom de chaque thème.
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  'amour-presence':
    'Présence, relation à soi, l’amour déjà là, le manque, l’après-rupture.',
  'desir-verite':
    'Vérité, non-dits, se montrer, clarté, don vs investissement, dire ses peurs.',
  'peur-masque': 'Le masque, la peur, le trauma du passé, les reproches.',
  'fables-paradoxes':
    'Récits, déplacements de regard, vérités qui apparaissent indirectement.',
  'desir-intimite':
    'Le registre intime, en bas de page — un seuil qu’on franchit volontairement.',
};

// Sous-titre court affiché en TÊTE de chaque page de thème (sous le titre).
export const CATEGORY_SUBTITLES: Record<Category, string> = {
  'amour-presence':
    'Présence, relation à soi, manque, séparation et retour à soi.',
  'desir-verite':
    'Vérité, non-dits, clarté, vulnérabilité, peur de se montrer et courage de dire.',
  'peur-masque': 'Peur, protection, adaptation, reproches et histoires du passé.',
  'fables-paradoxes':
    'Certaines choses se comprennent mieux lorsqu’on cesse d’essayer de les expliquer.',
  'desir-intimite': 'Le registre intime.',
};

// Intro longue (un ou plusieurs paragraphes) affichée en haut de chaque page de
// thème, après le sous-titre. Chaque entrée est un tableau de paragraphes.
export const CATEGORY_INTROS: Record<Category, string[]> = {
  'amour-presence': [
    'Certains de ces textes ont été écrits après une rupture.',
    'D’autres au cœur même d’une relation.',
    'Tous reviennent pourtant à une même question :',
    'Que reste-t-il lorsque l’on cesse de courir après ce qui manque ?',
  ],
  'desir-verite': [
    'Beaucoup de souffrances relationnelles ne viennent pas de ce que nous ressentons.',
    'Elles viennent de ce que nous n’osons pas reconnaître.',
    'Ou de ce que nous reconnaissons déjà mais que nous n’osons pas encore dire.',
    'Les textes rassemblés ici parlent de vérité.',
    'Pas d’une vérité abstraite.',
    'D’une vérité vécue.',
    'Celle qui apparaît lorsqu’on cesse peu à peu de négocier avec ce que l’on sait déjà.',
    'Ils parlent des non-dits.',
    'Des peurs.',
    'Du désir.',
    'De ce que nous risquons lorsque nous nous montrons tels que nous sommes.',
    'Et de ce qui devient parfois possible lorsque nous le faisons malgré tout.',
  ],
  'peur-masque': [
    'Nous portons rarement un masque par hasard.',
    'Nous le portons pour protéger quelque chose.',
    'Pour éviter une douleur.',
    'Une honte.',
    'Un rejet.',
    'Une peur ancienne.',
    'Les textes rassemblés ici explorent ces mouvements souvent invisibles.',
    'Les façons dont nous nous adaptons.',
    'Les rôles que nous adoptons.',
    'Les reproches que nous formulons parfois à l’autre pour ne pas regarder ce qui se joue en nous.',
    'Ils ne cherchent pas à faire disparaître la peur.',
    'Ils cherchent à la rendre visible.',
    'Car ce que l’on voit clairement commence déjà à perdre une partie de son pouvoir.',
  ],
  'fables-paradoxes': [
    'Les textes rassemblés ici empruntent parfois le détour d’une histoire.',
    'D’une image.',
    'D’un paradoxe.',
    'Non pour rendre les choses plus compliquées.',
    'Mais parce que certaines vérités deviennent soudain évidentes lorsqu’on les regarde de côté.',
    'Ces textes parlent d’amour, de désir, de peur, de séparation et de présence.',
    'Comme les autres.',
    'Mais ils le font autrement.',
    'Ils laissent davantage de place à la découverte qu’à l’explication.',
  ],
  'desir-intimite': [
    'Le désir est parfois l’endroit où il devient le plus difficile de se mentir.',
    'Le corps sait.',
    'Les émotions savent.',
    'Quelque chose en nous sait déjà.',
    'Bien avant que la tête accepte de le voir.',
    'Les textes rassemblés ici parlent du désir, du corps, de l’intimité et de cette rencontre fragile entre ce que nous ressentons et ce que nous sommes prêts à reconnaître.',
    'Ils ne sont pas là pour enseigner une manière de faire.',
    'Ils sont là pour montrer qu’une autre manière d’aimer, de désirer et d’être présent à soi-même existe.',
    'Pour que la part de vous qui le pressentait sache qu’elle ne se trompait pas.',
  ],
};

// Texte d’accueil du registre intime, affiché sous la carte « Désir et
// intimité » du sommaire (page « Écrits »).
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
