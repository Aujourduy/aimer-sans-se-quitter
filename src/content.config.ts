import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Collection « textes » : un fichier .md par texte dans src/content/textes/.
// Le slug (l'adresse de la page) vient du nom du fichier.
const textes = defineCollection({
  // `base` est résolu en absolu à partir de ce fichier de config, pour ne pas
  // dépendre de la façon dont Astro résout la racine du projet.
  loader: glob({
    pattern: '**/*.md',
    base: new URL('./content/textes', import.meta.url),
  }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(), // une ligne, affichée sur la carte
    category: z.enum([
      'lien-relation',
      'vrai-de-soi',
      'corps-desir',
      'regard-vie',
      'pratique-posture',
    ]),
    entry: z.boolean().default(false), // true = texte d'entrée mis en avant
    entryRole: z
      .enum(['reconnaissance', 'deplacement', 'mecanisme'])
      .optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
    draftReason: z.string().optional(), // raison courte du brouillon (marqueur v9)
    verifieParDuy: z.boolean().default(false), // true = texte relu et validé par Duy
    // Indicateurs de classement par livre / type (cochés via l'outil de relecture).
    livreFableDanPhu: z.boolean().default(false),
    livreAnalyseConte: z.boolean().default(false),
    livreMetaphore: z.boolean().default(false),
    livreVersus: z.boolean().default(false),
    livreAimerSansDisparaitre: z.boolean().default(false),
    // Marqueur du « parcours de lecture » (chemin menant de la douleur à la
    // conversation exploratoire). Ce n'est pas un livre, mais un parcours.
    parcours: z.boolean().default(false),
    // Statut éditorial pour la mise en ligne (parcours v5).
    statutParcours: z
      .enum(['PRET', 'MARQUEUR', 'NETTOYAGE', 'CHAPEAU', 'RESERVE', 'JAMAIS-SITE', 'NON-PUBLIABLE'])
      .optional(),
    parcoursBloc: z.number().nullable().optional(), // 1 à 4, null si hors parcours
    parcoursSegment: z
      .enum(['colonne', 'chemin-profond', 'tag-only'])
      .nullable()
      .optional(),
  }),
});

export const collections = { textes };
