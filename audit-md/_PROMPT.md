# Prompt — Export des pages en Markdown pour relecture éditoriale

Prompt réutilisable pour régénérer les fichiers d'audit copywriting à partir du
site. À relancer après chaque modification importante des pages.

> ℹ️ Le **corps des textes** (les ~116 écrits) n'est pas traité ici : il existe
> déjà sous forme de `.md` dans `src/content/textes/`. On traite seulement le
> **copy de présentation** de la page Écrits et de chaque section.

---

Analyse le site local et exporte chaque page principale en markdown propre pour relecture éditoriale.

Pages à traiter :
- Accueil
- À propos
- Accompagnement
- Conversation exploratoire
- Écrits (la page sommaire `/textes` : intro + cartes des thématiques)
- Une page par section thématique (présentation de chaque thème : titre + description) :
  - Amour et présence
  - Désir et vérité
  - Peur et masque
  - Fables et paradoxes
  - Désir et intimité (inclut aussi l'intro du « registre intime »)

Pour chaque page, crée un fichier .md séparé dans le dossier `/audit-md` :
- `accueil.md`, `a-propos.md`, `accompagnement.md`, `conversation-exploratoire.md`
- `ecrits.md` (page sommaire `/textes`)
- `section-amour-presence.md`, `section-desir-verite.md`, `section-peur-masque.md`,
  `section-fables-paradoxes.md`, `section-desir-intimite.md`

Contraintes :
- Garde le menu/navigation uniquement dans le fichier accueil.md.
- Pour les autres pages, ne garde pas le menu sauf s’il contient un élément différent.
- Supprime le CSS, les classes, les scripts, les imports, les composants techniques.
- Conserve la structure éditoriale : titres, sous-titres, paragraphes, boutons, liens internes, CTA.
- Pour la page Écrits et les sections, ne déroule PAS le corps des textes : seulement le copy de présentation (intro de page, libellé + description de chaque thème, intro du registre intime).
- Indique les boutons sous cette forme :
  CTA : [texte du bouton] → [destination]
- Indique les liens texte sous cette forme :
  Lien : [texte] → [destination]
- Ne réécris pas le contenu.
- Ne corrige pas le style.
- Ne résume pas.
- Garde les accents et la ponctuation d’origine.

Format attendu pour chaque fichier :

```
# Nom de la page

Objectif de la page :
Public visé :
Action souhaitée :
Doute principal de la lectrice :

## Navigation
...

## Section : Hero
...

## Section : ...
...
```

À la fin de chaque fichier, ajoute :

```
## Inventaire des CTA
- ...
```

---

## Où vit le contenu (pour la réinjection)

Quand le copy est retravaillé, le reporter dans les **fichiers sources** :

| Fichier audit | Source(s) à modifier |
| --- | --- |
| `accueil.md` | `src/pages/index.astro` |
| `a-propos.md` | `src/pages/a-propos.astro` |
| `accompagnement.md` | `src/pages/accompagnement.astro` |
| `conversation-exploratoire.md` | `src/pages/conversation-exploratoire.astro` |
| `ecrits.md` | intro : `src/pages/textes/index.astro` — cartes des thèmes : voir lignes ci-dessous |
| `section-*.md` | **`src/lib/categories.ts`** : `CATEGORY_LABELS` (libellé) + `CATEGORY_DESCRIPTIONS` (description). Pour « Désir et intimité », l'intro du registre intime est la constante `DESIR_INTIMITE_INTRO` du même fichier. |

> ⚠️ Le copy des **sections** n'est PAS dans un `.astro` mais dans
> `src/lib/categories.ts` (libellés + descriptions partagés par la page Écrits
> ET les pages de section). Modifier là met à jour les deux d'un coup.
