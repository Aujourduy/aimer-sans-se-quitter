// Catégories thématiques de la collection « textes ».
// La DONNÉE vit dans categories.data.mjs (source unique, partagée avec les
// scripts .mjs). Ce fichier ne fait qu'ajouter le typage TypeScript pour le
// site Astro. Ne PAS redéfinir les libellés ici — les modifier dans le .mjs.
import {
  CATEGORY_LABELS as LABELS,
  CATEGORY_DESCRIPTIONS as DESCRIPTIONS,
  CATEGORY_SUBTITLES as SUBTITLES,
  CATEGORY_INTROS as INTROS,
  CATEGORY_ORDER as ORDER,
  ENTRY_ROLE_ORDER as ENTRIES,
} from './categories.data.mjs';

export const CATEGORY_LABELS = LABELS as Record<string, string>;

export type Category = keyof typeof LABELS;

export const CATEGORY_DESCRIPTIONS = DESCRIPTIONS as Record<Category, string>;
export const CATEGORY_SUBTITLES = SUBTITLES as Record<Category, string>;
export const CATEGORY_INTROS = INTROS as Record<Category, string[]>;
export const CATEGORY_ORDER = ORDER as Category[];
export const ENTRY_ROLE_ORDER = ENTRIES as readonly string[];
