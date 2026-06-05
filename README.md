# Aimer sans se quitter

Site d'auteur sobre construit avec [Astro](https://astro.build), contenu en
markdown, sortie 100 % statique. L'auteur ajoute ses textes en déposant un
fichier `.md` dans `src/content/textes/` — sans toucher à la mise en page.

**Site en ligne :** https://aujourduy.github.io/aimer-sans-se-quitter/

## Développer en local

```bash
npm install      # une seule fois
npm run dev      # http://localhost:4321
npm run build    # construit dans dist/
npm run preview  # prévisualise le build
```

## Modifier le site soi-même

Le site est hébergé **automatiquement par GitHub Pages**. À chaque `push` sur
`main`, GitHub reconstruit et republie le site (voir « Déploiement » plus bas).
Il n'y a donc **aucun serveur à administrer** : on modifie le code source, on
pousse, et la mise en ligne se fait seule en 1 à 2 minutes.

> ⚠️ On édite **toujours** les fichiers de `src/`, **jamais** `dist/`
> (le site construit, régénéré automatiquement par GitHub et ignoré par git).

### Depuis son ordinateur (VS Code)

```bash
git pull origin main      # 1. récupérer la dernière version AVANT d'éditer
npm install               #    (la première fois seulement)
npm run dev               # 2. aperçu en direct sur http://localhost:4321
                          # 3. modifier les fichiers dans src/ avec VS Code
git add -A                # 4. publier
git commit -m "Ma modification"
git push origin main
```

Le déploiement se suit dans l'onglet **Actions** du dépôt (vert = en ligne).

### Depuis github.com (sans rien installer, pratique sur mobile)

Ouvrir le fichier sur GitHub, cliquer sur le crayon ✏️ (« Edit this file »),
modifier, puis « Commit changes ». On peut aussi créer un fichier
(« Add file → Create new file ») — utile pour ajouter un texte.

> ⚠️ **Toujours committer sur la branche `main`.** Le site ne se déploie QUE
> depuis `main`. Avant de cliquer « Commit changes », vérifiez que le sélecteur
> de branche (en haut de la page du fichier) indique bien **`main`** — sinon la
> modification ne partira pas en ligne. Le plus sûr est de définir `main` comme
> branche par défaut du dépôt (Settings → Branches).

### Où modifier quoi

| Pour changer… | Fichier |
| --- | --- |
| Les couleurs, polices, largeurs (réglages globaux) | `src/styles/global.css` → bloc `:root` |
| Un style précis (boutons, cartes, séparateurs…) | `src/styles/global.css` → la classe concernée |
| Le texte d'une page | `src/pages/…` (ex. `accompagnement.astro`) |
| Ajouter un texte | un fichier `.md` dans `src/content/textes/` (voir ci-dessous) |

> 💡 **Repérer quoi modifier — le mode debug.** Sur le site, le bouton « $ »
> (en bas à droite) active une bulle qui, au survol/tap d'un élément, affiche
> son identifiant de bloc (`data-dbg`), ses **classes** et ses propriétés CSS.
> Pratique pour savoir exactement quelle classe ou quelle variable changer.

> ⚠️ **Coordination.** Comme les modifications de l'assistant et les vôtres
> vont toutes sur `main`, faites toujours `git pull` avant d'éditer, et évitez
> de modifier le **même fichier** au même moment, pour ne pas créer de conflit.

## Réglages rapides (variables CSS)

Les principaux réglages visuels sont centralisés en **variables** dans le bloc
`:root`, en haut de `src/styles/global.css`. Changer une variable se répercute
partout où elle est utilisée — un seul endroit à modifier.

| Variable | Rôle | Exemples de valeurs |
| --- | --- | --- |
| `--echelle-texte` | Taille du corps de texte (pas les titres) | `1` = normal · `1.2` = +20 % · `0.9` = −10 % |
| `--creme` | Fond (jamais blanc pur) | `#F4EFE6` |
| `--encre` | Couleur du texte | `#1F1B17` |
| `--bleu` | Couleur signature (titres, boutons, filets) | `#1A2D4A` |
| `--sepia` | Texte secondaire (sous-titres, légendes) | `#6B6258` |
| `--filet` | Couleur des bordures fines | `#CFC3B4` |
| `--filet-court-largeur` | Longueur des traits de séparation centrés | `30%` |
| `--filet-court-epaisseur` | Épaisseur de ces traits | `1px` |
| `--filet-court-couleur` | Couleur de ces traits | `var(--filet)` |
| `--lecture` | Largeur de la colonne de texte | `680px` |

### Tailles selon l'écran (responsive)

Les **variables** ci-dessus sont identiques sur ordinateur et sur mobile. En
revanche, certaines **tailles** ont une valeur réduite en dessous de **640 px**
de large (`@media (max-width: 640px)` dans `global.css`) — l'adaptation mobile
est donc automatique :

| Élément | Ordinateur | Mobile (< 640 px) |
| --- | --- | --- |
| Corps de texte (`body`) | `1.19rem` | `1.1rem` |
| Titre `h1` | `2.8rem` | `2.1rem` |
| Titre `h2` | `1.6rem` | `1.4rem` |
| Titre `h3` | `1.2rem` | `1.1rem` |
| Citation (`blockquote`) | `1.4rem` | `1.25rem` |
| Marges latérales (`.lecture`, `.conteneur`) | `1.5rem` | `8 %` |
| Hero — titre (`.hero h1`) | `3.4rem` | `2.3rem` |
| Hero — accroche (`.hero-lede`) | `1.35rem` | `1.2rem` |
| Carte mise en avant (`.text-card--featured`) | `1.45rem` | `1.25rem` |

La variable `--echelle-texte` multiplie **les deux** colonnes : régler `1.2`
agrandit le texte de 20 % sur ordinateur **et** sur mobile, tout en gardant le
mobile un peu plus compact (ce qui est voulu, pour la lisibilité).

### Régler la taille du texte

Dans `:root` (`src/styles/global.css`) :

```css
--echelle-texte: 1.2;   /* 1 = normal · 1.2 = +20 % · 0.9 = -10 % */
```

Ce seul nombre ajuste le corps de texte **sur ordinateur et sur mobile** en même
temps. Les titres (`h1`/`h2`/`h3`) gardent leur taille propre.

### Traits de séparation (.separateur)

Le trait court centré entre les cartes de textes — et la classe réutilisable
`.separateur` (utilisable n'importe où via `<hr class="separateur" />`) — sont
pilotés par les trois variables `--filet-court-*`. Les modifier change **tous**
les traits d'un coup.

## Modifier le contenu du site

Le contenu se range en deux familles : **les textes** (collection markdown qui
alimente la page « Textes ») et **les pages fixes** (accueil, accompagnement, à
propos…), qui sont des fichiers `.astro`.

### Les textes (page « Textes »)

Chaque texte est un fichier `.md` dans `src/content/textes/`. Le **nom du
fichier** devient l'adresse de la page (`mon-texte.md` → `/textes/mon-texte`).

En-tête (« frontmatter ») de chaque fichier, suivi du corps en markdown :

```md
---
verifieParDuy: false                # suivi de relecture (voir plus bas) — true = relu/validé
title: "Le titre du texte"          # titre affiché
excerpt: "Une ligne, sur la carte." # résumé affiché dans la liste
category: "amour-presence"          # voir le tableau plus bas
order: 2                            # ordre dans la catégorie (petit = en premier)
# entry: true                       # (optionnel) met le texte en avant
# entryRole: "reconnaissance"       # si entry: true → reconnaissance | deplacement | mecanisme
# draft: true                       # (optionnel) masque le texte (non publié)
---

Le corps du texte, en **markdown**.
```

- **Mettre à jour un texte** → ouvrir le `.md` et modifier le corps (sous le
  second `---`) et/ou les champs de l'en-tête.
  _(Les textes actuels contiennent un corps `[À REMPLACER]` à remplacer par le vrai contenu.)_
- **Ajouter un texte** → créer un nouveau `.md` (le plus simple : copier un
  existant), avec un nom de fichier court (il devient l'URL).
- **Supprimer** → supprimer le fichier `.md` (ou mettre `draft: true` pour le
  cacher sans l'effacer).
- **Mettre en avant** → `entry: true` + un `entryRole` : le texte apparaît dans
  « Trois textes pour entrer », en haut de la page Textes.

Catégories disponibles :

| `category`         | Affiché             |
| ------------------ | ------------------- |
| `amour-presence`   | Amour et présence   |
| `desir-verite`     | Désir et vérité     |
| `desir-intimite`   | Désir et intimité   |
| `peur-masque`      | Peur et masque      |
| `fables-paradoxes` | Fables et paradoxes |

> Pour créer une **nouvelle** catégorie, il faut aussi la déclarer dans
> `src/content.config.ts` (liste `category`) **et** `src/lib/categories.ts`
> (libellé + ordre d'affichage). En cas de doute, demandez à l'assistant.

### Relire et valider les textes (suivi `verifieParDuy`)

Chaque texte porte, **en tête de son en-tête**, un champ `verifieParDuy` (défaut
`false`). Il sert à **suivre la relecture** : on le passe à `true` une fois le
texte relu et validé.

```md
---
verifieParDuy: true   # ← passer de false à true quand le texte est relu/validé
title: "…"
---
```

Un **indicateur visuel s'affiche uniquement en local** (`npm run dev`), jamais
en production :

- sur **`/textes`** : un tableau de bord « **Relecture — N/116 validés** »,
  déroulable par thématique (avec le compteur de chaque thème), qui liste chaque
  texte avec `✓` / `◯` et un lien direct. Les **brouillons y sont inclus** (et
  visibles aussi sur les pages de thématique en local), pour pouvoir tout relire ;
- sur chaque **carte de texte** : une pastille verte `✓ validé` ou grise
  `◯ à valider`.

**Marche à suivre :** `npm run dev` → ouvrir `/textes` pour voir ce qui reste →
lire un texte, ouvrir son `.md`, passer `verifieParDuy` à `true` → le compteur et
les pastilles se mettent à jour automatiquement.

> En **production**, rien n'apparaît : ni tableau de bord, ni pastille. C'est un
> outil de relecture interne, sans effet sur le site en ligne.

Suivi possible aussi en ligne de commande :

```bash
grep -l  "verifieParDuy: true"  src/content/textes/*.md | wc -l   # validés
grep -rL "verifieParDuy: true"  src/content/textes/*.md | wc -l   # restants
```

### La page « Textes » : thématiques et organisation

La page qui présente les textes (titre, « Trois textes pour entrer », puis les
**thématiques** avec leurs textes) est alimentée par **trois sources** selon ce
que l'on veut changer :

| Ce que vous voulez modifier | Fichier à éditer |
| --- | --- |
| Le **titre / texte d'intro** de la page (« Textes », la phrase dessous, « Trois textes pour entrer ») | `src/pages/textes/index.astro` |
| Le **nom des thématiques** et leur **ordre d'affichage** | `src/lib/categories.ts` |
| **Quel texte** va dans **quelle thématique** et son **ordre** | l'en-tête du `.md` du texte (`category`, `order`) |

**Renommer ou réordonner les thématiques** — `src/lib/categories.ts` :

```ts
export const CATEGORY_LABELS = {
  'amour-presence':  'Amour et présence',    // ← texte de droite = ce qui s'affiche
  'desir-verite':    'Désir et vérité',
  'peur-masque':     'Peur et masque',
  'fables-paradoxes':'Fables et paradoxes',
};

export const CATEGORY_ORDER = [   // ← ordre des sections sur la page
  'amour-presence',
  'desir-verite',
  'peur-masque',
  'fables-paradoxes',
];
```

- **Renommer** une thématique affichée → changer le libellé de droite
  (ex. `'Amour et présence'` → `'Aimer et être présent'`). La clé de gauche
  (`'amour-presence'`) ne change pas : c'est elle qui relie les textes.
- **Réordonner** les thématiques → changer l'ordre dans `CATEGORY_ORDER`.

**Déplacer un texte / changer son ordre dans une thématique** — l'en-tête du
`.md` du texte :

```md
---
category: "amour-presence"   # ← la thématique où le texte apparaît
order: 4                     # ← sa position dans la thématique (petit = en premier)
---
```

- **Déplacer** un texte vers une autre thématique → changer `category`.
- **Réordonner** dans une thématique → changer `order`.

> Une thématique n'apparaît sur la page que si elle contient **au moins un
> texte** (hors textes mis en avant via `entry: true`).

### Les autres pages (fixes)

Ce sont des fichiers `.astro` dans `src/pages/`. Le texte se modifie
directement dans la balise correspondante (entre les `>` et `<`).

| Page | Adresse | Fichier |
| --- | --- | --- |
| Accueil | `/` | `src/pages/index.astro` |
| Textes (liste) | `/textes` | `src/pages/textes/index.astro` |
| Gabarit d'un texte | `/textes/…` | `src/pages/textes/[...slug].astro` |
| À propos | `/a-propos` | `src/pages/a-propos.astro` |
| Accompagnement | `/accompagnement` | `src/pages/accompagnement.astro` |
| Conversation exploratoire | `/conversation-exploratoire` | `src/pages/conversation-exploratoire.astro` |
| Mentions légales | `/mentions-legales` | `src/pages/mentions-legales.astro` |
| En-tête / pied (toutes pages) | — | `src/components/Header.astro` / `Footer.astro` |

> 💡 Le **mode debug** (bouton « $ », en bas à droite du site) affiche
> l'identifiant de chaque bloc (ex. `accompagnement__cta`) : pratique pour
> repérer quel fichier et quel bloc éditer.

## Portrait (photo)

La photo de la page « À propos » est dans `src/assets/portrait.jpg`, affichée
via le composant `<Image>` d'Astro (optimisation + versions responsive
automatiques). Pour **la remplacer** : déposez une nouvelle image à cet
emplacement (même nom de fichier), ou changez l'`import` en haut de
`src/pages/a-propos.astro`. Le **cadrage** se règle avec `object-position` sur
`.portrait img` dans `global.css`.

La page « Conversation exploratoire » conserve un petit placeholder carré
(`portrait--petit`) ; même principe pour y poser une photo.

## Réservation (TidyCal)

La page « Conversation exploratoire » renvoie vers TidyCal via la constante
`RESERVATION_URL`, en haut de `src/pages/conversation-exploratoire.astro`
(actuellement `https://tidycal.com/duy-dang/conversation-exploratoire`).
Configurez les questions d'invité dans TidyCal (pas de formulaire sur le site) :

- Qu'est-ce qui vous amène ?
- Qu'avez-vous déjà compris ou essayé ?
- Qu'aimeriez-vous ne plus répéter ?
- _Le cadre est de quatre mois, au tarif de 6 000 euros. Si la conversation
  confirme que le travail est juste, cette décision est-elle envisageable ?_

## Déploiement — GitHub Pages (automatique)

Le workflow `.github/workflows/deploy.yml` reconstruit et publie le site à
chaque push sur `main`.

**Étape unique à faire une fois :** Settings → Pages → Build and deployment →
Source → **« GitHub Actions »**.

Le site sera publié sur : **https://aujourduy.github.io/aimer-sans-se-quitter/**

### Domaine personnalisé

1. dans `astro.config.mjs` : `site: 'https://votre-domaine.fr'` et `base: '/'` ;
2. ajoutez `public/CNAME` contenant votre domaine ;
3. Settings → Pages → Custom domain.

### Autres hébergeurs

`npm run build` produit `dist/`, déployable tel quel sur Netlify, Vercel ou
un serveur Nginx (pensez à remettre `base: '/'` pour un déploiement à la
racine du domaine).
