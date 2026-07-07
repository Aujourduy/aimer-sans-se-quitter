// Source de vérité UNIQUE des catégories thématiques (JS pur, sans types).
// Consommée par :
//   - src/lib/categories.ts (réexport + types TypeScript pour le site Astro)
//   - scripts/relecture.mjs (script autonome qui ne peut pas importer du .ts)
// Ne PAS dupliquer ces libellés ailleurs : importer d'ici.

export const CATEGORY_LABELS = {
  'lien-relation': 'Le lien et la relation',
  'vrai-de-soi': 'Le vrai de soi',
  'corps-desir': 'Le corps qui dit vrai',
  'regard-vie': 'Le regard sur la vie',
  'pratique-posture': 'La pratique et la posture',
};

// Description courte affichée sur les CARTES du sommaire (page « Écrits »).
export const CATEGORY_DESCRIPTIONS = {
  'lien-relation':
    'Ce qui se joue entre deux : rupture, manque, communication, don, choisir l’autre.',
  'vrai-de-soi':
    'Le masque, la peur, la suradaptation, le courage de se montrer tel que l’on est.',
  'corps-desir':
    'Le désir, le corps, l’intimité — la sexualité comme lieu où l’on cesse de se mentir.',
  'regard-vie':
    'Présence, conscience, gratitude, la vie et la mort — un regard sur l’humain.',
  'pratique-posture':
    'L’approche, la posture, la manière d’accompagner — comment je travaille.',
};

// Sous-titre court affiché en TÊTE de chaque page de thème (sous le titre).
export const CATEGORY_SUBTITLES = {
  'lien-relation':
    'Rupture, manque, communication, don, confiance et choix de l’autre.',
  'vrai-de-soi': 'Masque, peur, adaptation, honte, et le courage de se montrer.',
  'corps-desir':
    'Désir, corps, caresses, intimité — le corps comme lieu de vérité.',
  'regard-vie':
    'Présence, conscience, gratitude, sagesse — un regard sur la vie.',
  'pratique-posture': 'L’approche, la posture, la manière d’accompagner.',
};

// Intro longue (tableau de paragraphes) affichée en haut de chaque page de thème.
export const CATEGORY_INTROS = {
  'lien-relation': [
    'Certains de ces textes ont été écrits après une rupture.',
    'D’autres au cœur même d’une relation.',
    'Tous parlent de ce qui se joue entre deux êtres :',
    'le manque, les non-dits, le don, la confiance, le choix.',
    'Et de ce qui reste possible lorsque l’on cesse de courir après ce qui manque.',
  ],
  'vrai-de-soi': [
    'Nous portons rarement un masque par hasard.',
    'Nous le portons pour protéger quelque chose.',
    'Pour éviter une douleur.',
    'Une honte.',
    'Un rejet.',
    'Une peur ancienne.',
    'Les textes rassemblés ici explorent ces mouvements souvent invisibles :',
    'les façons dont nous nous adaptons, les rôles que nous adoptons.',
    'Ils ne cherchent pas à faire disparaître la peur.',
    'Ils cherchent à la rendre visible.',
    'Car ce que l’on voit clairement commence déjà à perdre une partie de son pouvoir.',
  ],
  'corps-desir': [
    'Le désir est parfois l’endroit où il devient le plus difficile de se mentir.',
    'Le corps sait.',
    'Les émotions savent.',
    'Quelque chose en nous sait déjà.',
    'Bien avant que la tête accepte de le voir.',
    'Les textes rassemblés ici parlent du désir, du corps, de l’intimité et de cette rencontre fragile entre ce que nous ressentons et ce que nous sommes prêts à reconnaître.',
    'Ils ne sont pas là pour enseigner une manière de faire.',
    'Ils sont là pour montrer qu’une autre manière d’aimer, de désirer et d’être présent à soi-même existe.',
  ],
  'regard-vie': [
    'Certaines vérités ne concernent pas seulement l’amour.',
    'Elles concernent la vie tout entière.',
    'La présence, la conscience, la gratitude.',
    'Ce que l’on voit quand on cesse de courir.',
    'Les textes rassemblés ici parlent de l’humain, du temps, de la mort, de la joie.',
    'Ils regardent la vie de côté, pour mieux la voir.',
  ],
  'pratique-posture': [
    'Ces textes parlent de la manière dont je travaille.',
    'De la posture plutôt que de la technique.',
    'De ce que j’ai appris en accompagnant, et de ce que je n’enseigne pas.',
    'Ils disent le regard depuis lequel tout le reste est écrit.',
  ],
};

export const CATEGORY_ORDER = [
  'lien-relation',
  'vrai-de-soi',
  'corps-desir',
  'regard-vie',
  'pratique-posture',
];

// Ordre des trois textes d'entrée.
export const ENTRY_ROLE_ORDER = ['reconnaissance', 'deplacement', 'mecanisme'];
