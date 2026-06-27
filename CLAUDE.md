# CLAUDE.md

Guide à l'usage des assistants IA (Claude Code) travaillant sur ce dépôt.
Tout le projet — code, contenu, commits, interface — est en **français** :
garder cette langue dans le code produit, les commentaires et les messages de
commit.

## Le projet en une phrase

**Aimer sans se quitter** est le site d'auteur de Duy Dang (accompagnement
relationnel) : un site **statique** construit avec **Astro 5**, dont le contenu
est rédigé en Markdown et déployé automatiquement sur **GitHub Pages** au
domaine **duydang.fr**.

Principe directeur : l'auteur ajoute un texte en déposant un fichier `.md` dans
`src/content/textes/`, **sans jamais toucher à la mise en page**. La sobriété
éditoriale prime ; on n'ajoute pas de dépendance ni de complexité sans raison.

## Commandes

```bash
npm install        # une seule fois
npm run dev        # serveur de dev → http://localhost:4321
npm run build      # build statique dans dist/
npm run preview    # prévisualise le build
npm run relecture  # outil de relecture LOCAL → http://localhost:4455 (jamais déployé)
npm run livres     # (re)génère docs/livres/ depuis les indicateurs des textes
```

Il n'y a ni tests automatisés ni linter configuré. La validation se fait par
`npm run build` (qui exécute la vérification du schéma de contenu Astro) et par
relecture visuelle en `npm run dev`.

## Architecture

- **Astro 5, sortie 100 % statique.** Aucun runtime serveur. Pas de framework
  UI tiers : composants `.astro` uniquement.
- **`astro.config.mjs`** — `site: 'https://duydang.fr'`, `base: '/'` (domaine
  personnalisé servi à la racine). Pour repasser à l'URL `github.io`, voir le
  commentaire en tête du fichier.
- **Déploiement** — `.github/workflows/deploy.yml` reconstruit et publie à
  chaque `push` sur **`main`** (et via `workflow_dispatch`). **Le site ne se
  déploie QUE depuis `main`.** `public/CNAME` (= `duydang.fr`) maintient le
  domaine à chaque build.

### Arborescence `src/`

| Chemin | Rôle |
| --- | --- |
| `src/content/textes/*.md` | **Les textes** — un fichier = un texte = une page. Le slug vient du nom de fichier. |
| `src/content.config.ts` | Schéma (Zod) de la collection `textes`. Source de vérité du frontmatter. |
| `src/lib/categories.ts` | Libellés, sous-titres, intros et **ordre** des 5 catégories. |
| `src/lib/url.ts` | Helper `url()` qui préfixe les liens internes avec `base`. À utiliser pour tout `href` interne. |
| `src/pages/` | Pages éditoriales (`index`, `a-propos`, `accompagnement`, `mentions-legales`, `conversation-exploratoire`). |
| `src/pages/textes/` | Routage des textes : `index.astro` (sommaire), `[category].astro` (page de thème), `[...slug].astro` (texte). |
| `src/layouts/Base.astro` | Layout unique (head, `<Header>`, `<main>`, `<Footer>`). |
| `src/components/` | Composants : `Header`, `Footer`, `TextCard`, `NavTexte`, `Pont`, `Fleuron`, `Button`, `DebugMode`. |
| `src/styles/global.css` | **Toute la CSS**, centralisée. Variables de réglage dans le bloc `:root`. |

### Les 5 catégories (clés de `category`)

`amour-presence`, `desir-verite`, `peur-masque`, `fables-paradoxes`,
`desir-intimite`. Cet ensemble est **fermé** : il est défini à la fois dans
`src/content.config.ts` (enum Zod) et dans `src/lib/categories.ts`. Toute
modification doit être répercutée aux deux endroits (ainsi que dans les scripts
`scripts/*.mjs` qui dupliquent ces libellés).

## Ajouter ou modifier un texte

Créer un `.md` dans `src/content/textes/`. Frontmatter (voir le schéma dans
`src/content.config.ts`) :

```yaml
---
title: "Titre du texte"          # requis
excerpt: "Une ligne, affichée sur la carte."  # requis
category: "desir-verite"          # requis, une des 5 clés ci-dessus
order: 3                          # tri dans la catégorie (défaut 0)
draft: false                      # true = masqué en production, visible en dev
verifieParDuy: false              # relu/validé par Duy (basculé via l'outil de relecture)
entry: false                      # true = texte d'entrée mis en avant sur le sommaire
entryRole: "reconnaissance"       # si entry : reconnaissance | deplacement | mecanisme
# Indicateurs de classement par livre (basculés via l'outil de relecture) :
livreFableDanPhu: false
livreAnalyseConte: false
livreMetaphore: false
livreVersus: false
livreAimerSansDisparaitre: false
---
```

Conventions :
- Le **slug = nom de fichier** sans `.md`. Garder le préfixe de catégorie dans
  le nom (ex. `desir-verite-de-la-clarte.md`) par cohérence avec l'existant.
- Les **brouillons** (`draft: true`) sont rendus en dev (`import.meta.env.DEV`)
  pour relecture, mais **exclus du build de production**.
- Ne pas écrire de listes à puces dans le corps des textes : le style de
  l'auteur est narratif (voir « Voix » plus bas).

## Outils locaux (jamais déployés)

- **`scripts/relecture.mjs`** (`npm run relecture`, port 4455) — petit serveur
  HTTP local qui liste les textes et permet de **basculer d'un clic** les champs
  `verifieParDuy`, `draft` et les indicateurs `livre*` directement dans les
  `.md`. Écoute sur `0.0.0.0` par défaut ; `RELECTURE_HOST` restreint l'écoute
  (usage Tailscale). N'a aucune dépendance au site Astro.
- **`scripts/generer-livres.mjs`** (`npm run livres`) — (re)génère
  `docs/livres/` à partir des indicateurs `livre*` cochés sur les textes : un
  dossier de copies + un `.md` concaténé par livre. **`docs/livres/` est un
  artefact généré** — ne pas l'éditer à la main ; modifier les indicateurs sur
  les textes puis relancer le script.

## Style et CSS

- **Tout le visuel passe par `src/styles/global.css`.** Les réglages globaux
  (couleurs, échelles de taille, largeur de lecture) sont des **variables CSS**
  dans `:root`. Modifier une variable plutôt que des valeurs en dur dispersées.
- Les variables clés : `--creme` (fond), `--encre` (texte), `--bleu`
  (signature), `--sepia` (secondaire), `--filet` (bordures), `--lecture`
  (largeur de colonne), et les `--ech-*` (échelles de corps/titres, réglables
  séparément desktop/mobile). L'adaptation mobile vit dans `@media
  (max-width: 640px)`.
- Le **mode debug** (composant `DebugMode`, bouton « $ ») et un **bandeau
  « site en construction »** existent dans `Base.astro` ; le debug est commenté.
  Les attributs `data-dbg="..."` sur les éléments servent ce mode — les
  conserver lorsqu'on copie des blocs.

## Voix éditoriale (à respecter si l'on rédige du contenu)

Style de Duy Dang : narratif, intime, vulnérable, métaphores du quotidien,
paradoxes. **Pas** de listes à puces dans le corps, pas de ton moralisateur ni
de jargon. Écrire en « je ». Laisser respirer les phrases qui frappent.

## Règles de travail

- **Éditer `src/`, jamais `dist/`** (build régénéré, ignoré par git).
- **Ne pas committer** `dist/`, `.astro/`, `node_modules/`, `tmp/`, `.claude/`
  (voir `.gitignore`).
- Garder les **deux définitions de catégories synchronisées**
  (`content.config.ts` ↔ `lib/categories.ts` ↔ scripts).
- Préférer `url()` (de `src/lib/url.ts`) pour les liens internes plutôt que des
  chemins en dur, pour rester compatible avec `base`.
- Vérifier ses changements avec `npm run build` avant de pousser.

### Branche de travail

Le site se déploie **uniquement depuis `main`**. Les contributions de
l'assistant doivent être développées et poussées sur la branche dédiée
`claude/claude-md-docs-f1g2s5`, puis fusionnées vers `main` après revue
(ne jamais pousser directement sur `main` sans autorisation explicite).
