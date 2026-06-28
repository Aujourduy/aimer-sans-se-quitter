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
npm run relecture # outil de relecture local (voir « Relire et valider les textes »)
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
> _(Actuellement **masqué** : pour le réactiver, dé-commenter l'import et la
> balise `<DebugMode />` dans `src/layouts/Base.astro`.)_

> ⚠️ **Coordination.** Comme les modifications de l'assistant et les vôtres
> vont toutes sur `main`, faites toujours `git pull` avant d'éditer, et évitez
> de modifier le **même fichier** au même moment, pour ne pas créer de conflit.

## Réglages rapides (variables CSS)

Les principaux réglages visuels sont centralisés en **variables** dans le bloc
`:root`, en haut de `src/styles/global.css`. Changer une variable se répercute
partout où elle est utilisée — un seul endroit à modifier.

| Variable | Rôle | Exemples de valeurs |
| --- | --- | --- |
| `--ech-corps` | Échelle du corps de texte | `1` = normal · `1.2` = +20 % · `0.9` = −10 % |
| `--ech-h1` / `--ech-h2` / `--ech-h3` | Échelle des titres de page | idem (un coefficient par niveau) |
| `--ech-hero` | Échelle du gros titre + accroche de l'accueil | idem |
| `--creme` | Fond (jamais blanc pur) | `#F4EFE6` |
| `--encre` | Couleur du texte | `#1F1B17` |
| `--bleu` | Couleur signature (titres, boutons, lettrine, pont, exergue) | `#1A2D4A` |
| `--sepia` | Texte secondaire (sous-titres, légendes, folios) | `#6B6258` |
| `--filet` | Couleur des bordures fines (**tous** les filets de séparation) | `#CFC3B4` |
| `--filet-court-largeur` | Longueur des traits de séparation centrés | `30%` |
| `--filet-court-epaisseur` | Épaisseur de ces traits | `1px` |
| `--filet-court-couleur` | Couleur de ces traits | `var(--filet)` |
| `--lecture` | Largeur de la colonne de texte | `680px` |
| `--baseline` | Pas de la **grille de base** (demi-ligne du corps) — l'unité de tout le rythme vertical | `calc((1.19rem*1.6)/2)` ≈ `0.952rem` |
| `--silence-court` / `-moyen` / `-long` / `-seuil` | Les quatre **silences** verticaux (multiples entiers de `--baseline`) | `×2` / `×4` / `×8` / `×12` |

### Grille de base et silences verticaux

Tout le **rythme vertical** du site repose sur une seule unité, `--baseline`
(la demi-ligne du corps de texte). Les espaces entre blocs ne sont pas posés
« à l'œil » : ce sont quatre **silences** nommés, tous multiples de `--baseline`
(`--silence-court/-moyen/-long/-seuil`). Conséquence : le texte courant **et**
les blancs tombent sur le même pas — c'est ce qui donne au site sa tenue de
« livre relié ». **Règle :** ne jamais poser de marge verticale en valeur libre
(`2rem`, `3rem`…) dans le flux de lecture ; toujours réutiliser un silence.
Changer `--baseline` (ou l'interligne du corps dont il dérive) ré-accorde tout
le site d'un coup.

### Filets : une seule grammaire

Il n'y a que **deux** types de traits, tous en `--filet` (jamais en `--bleu`) :
un **filet de structure** pleine mesure (en-tête, pied, `<hr class="filet" />`),
et un **trait court centré** entre cartes sœurs (`.separateur` / les
`--filet-court-*`). Le **bleu** n'est jamais un filet de séparation : il est
réservé au **pont** vers l'accompagnement (qui change de registre), à la lettrine
et aux exergues. Sur l'index des thèmes, c'est **l'air** qui sépare, pas un trait.

### Polices (auto-hébergées, sans FOUT)

Les polices (EB Garamond, Inter — sous-ensemble **latin** seulement) sont
auto-hébergées dans `public/fonts/` et déclarées dans `src/styles/fonts.css` en
`font-display: optional`, avec **préchargement** des trois EB Garamond dans le
`<head>` (`src/layouts/Base.astro`) et un **repli métrique** « Garamond Fallback »
(Georgia ré-aligné) dans `global.css`. Résultat : pas de flash de police au
chargement et **aucun décalage de mise en page** (CLS = 0). Pour remplacer/ajouter
un poids : déposer le `.woff2` latin dans `public/fonts/`, ajouter un bloc
`@font-face` dans `fonts.css`, et (si c'est un poids critique du rendu initial)
un `<link rel="preload">` dans `Base.astro`.

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

Les tailles du tableau ci-dessus sont des **valeurs de base**. Chaque type de
texte est ensuite multiplié par un **coefficient d'échelle** réglable, distinct
sur ordinateur et sur mobile (voir ci-dessous).

### Régler la taille du texte (échelles par type, desktop/mobile séparés)

Cinq coefficients permettent d'agrandir/réduire **chaque type de texte
indépendamment** : `--ech-corps`, `--ech-h1`, `--ech-h2`, `--ech-h3`,
`--ech-hero`. Valeur `1` = taille de base · `1.2` = +20 % · `0.9` = −10 %.

Ils sont déclarés **à deux endroits** dans `src/styles/global.css` :

```css
/* 1) Valeurs ORDINATEUR — bloc :root, en haut du fichier */
:root {
  --ech-corps: 1;   /* corps de texte */
  --ech-h1:    1;   /* titres de page */
  --ech-h2:    1;   /* sous-titres */
  --ech-h3:    1;   /* sous-sous-titres */
  --ech-hero:  1;   /* gros titre + accroche de l'accueil */
}

/* 2) Valeurs MOBILE — dans @media (max-width: 640px), indépendantes */
@media (max-width: 640px) {
  :root {
    --ech-corps: 1;
    --ech-h1:    1;
    --ech-h2:    1;
    --ech-h3:    1;
    --ech-hero:  1;
  }
}
```

Régler par exemple `--ech-hero: 1.2;` dans le bloc `:root` agrandit le gros
titre de l'accueil de 20 % **sur ordinateur uniquement** ; pour faire de même
sur mobile, changer la valeur correspondante dans le bloc `@media`.

> 💡 **Tester sans recompiler.** Avec `npm run dev`, chaque modification du
> fichier `.css` **rafraîchit la page automatiquement** (hot-reload) — pas besoin
> de `npm run build`. Le serveur de dev est aussi joignable depuis un téléphone
> sur le même réseau / via Tailscale (l'URL réseau s'affiche au démarrage de
> `npm run dev`), pratique pour régler le rendu mobile en direct.

### Traits de séparation (.separateur)

Le trait court centré entre les cartes de textes — et la classe réutilisable
`.separateur` (utilisable n'importe où via `<hr class="separateur" />`) — sont
pilotés par les trois variables `--filet-court-*`. Les modifier change **tous**
les traits d'un coup.

Le **filet pleine mesure** `<hr class="filet" />` (couleur `--filet`, sur toute
la largeur de la colonne) sert de respiration franche : il est posé sous le hero
de l'accueil et peut séparer deux mouvements d'une page longue.

### Gestes éditoriaux : lettrine, fleuron, titre courant, folio, terre cuite

**La lettrine** (grande capitale `--bleu` en tête de texte) apparaît
automatiquement sur le **premier paragraphe des pages de lecture**
(`/textes/…`), et nulle part ailleurs. Elle est calculée en CSS — rien à faire.

> ⚠️ **Cas d'un texte qui ouvre sur un guillemet ou un tiret** (« …, — …).
> En français, la lettrine happe le signe ouvrant. Pour ces textes, enrober la
> vraie première lettre dans le `.md` : `<span class="lettrine">L</span>e
> reste du texte…` — la lettrine portera alors sur le `L`, pas sur le guillemet.

**Le fleuron** (la marque `❧`, centrée, sépia) marque une respiration entre
deux mouvements d'une page longue (page de texte, À propos, Accompagnement). Il
est posé via le composant `<Fleuron />`. Règle : **une seule marque par écran**,
jamais sur l'accueil ni sur la page Écrits, jamais cumulé avec un filet au même
endroit.

**Le titre courant et le folio** (pages de lecture uniquement) donnent l'allure
d'une page intérieure de livre : en **tête**, le nom de la thématique en petite
majuscule sépia (Inter), discret et non cliquable ; en **pied**, un **folio** —
le rang du texte dans sa série, en chiffres romains bas-de-casse (`i`, `ii`…),
sépia. Tous deux sont générés automatiquement dans `src/pages/textes/[...slug].astro`
(le folio vient du champ `order` de l'en-tête du `.md`) — rien à saisir à la main.

**La terre cuite** (`--terre`, accent chaud) est **en réserve, désactivée par
défaut**. Si la page paraît trop froide une fois finie, l'activer sur **un seul**
élément : décommenter la ligne `color: var(--terre);` dans le bloc `.fleuron` de
`global.css`. Une couleur, un seul endroit — ne pas l'étendre ailleurs.

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

Des **indicateurs visuels s'affichent uniquement en local** (`npm run dev`),
jamais en production :

- sur **`/textes`** : un tableau de bord « **Relecture — N/116 validés** »,
  déroulable par thématique (avec le compteur de chaque thème), qui liste chaque
  texte avec `✓` / `◯` et un lien direct. Les **brouillons y sont inclus** (et
  visibles aussi sur les pages de thématique en local), pour pouvoir tout relire ;
- sur chaque **carte de texte** **et sur la page du texte elle-même** : deux
  pastilles — `✓ validé` / `◯ à valider` (champ `verifieParDuy`) et
  `brouillon` / `publié` (champ `draft`). En local, les pages des brouillons
  sont aussi générées, pour pouvoir les ouvrir et les relire.

> En **production**, rien n'apparaît : ni tableau de bord, ni pastille. C'est un
> outil de relecture interne, sans effet sur le site en ligne.

#### Outil de relecture cliquable (recommandé) — `npm run relecture`

Pour **relire et valider sans avoir à retrouver le bon `.md`** parmi la centaine
de fichiers, un petit outil local est fourni :

```bash
npm run relecture        # → http://localhost:4455 (et URL Tailscale affichée)
```

Il ouvre une page web (locale, **jamais déployée**) avec, à gauche, tous les
textes groupés par thématique — avec filtres (À valider, Validés, Brouillons,
Publiés) et recherche par titre — et à droite le texte en lecture. Deux boutons
permettent, **d'un clic**, de basculer `verifieParDuy` et `draft` : le champ est
écrit directement dans le bon fichier `.md` (édition chirurgicale, seule la ligne
du champ change — le reste du fichier est préservé à l'identique).

> Lancé via `npm run relecture`, l'outil écoute sur `0.0.0.0` et affiche au
> démarrage l'URL **Tailscale** (`http://100.x.x.x:4455`) pour y accéder à
> distance (en service permanent, il n'écoute QUE sur Tailscale — voir plus
> bas). Il lit/écrit seulement
> `src/content/textes/*.md` ; il n'a aucun lien avec le site Astro déployé.
> Après une session, les `.md` modifiés sont de vrais changements git à
> **committer** (passer un texte de `draft: true` à `false` le publiera en ligne
> une fois poussé).

**Marche à suivre :** `npm run relecture` → lire un texte → cliquer « validé »
et/ou « publié » → committer les `.md` modifiés.

#### Service permanent (Tailscale uniquement)

Sur le serveur, l'outil tourne en **service systemd `--user`** qui redémarre
seul et n'écoute **que sur l'IP Tailscale** (inaccessible depuis le LAN ou
localhost). Accès : `http://100.95.124.70:4455` (depuis un appareil du réseau
Tailscale).

```bash
# état / logs / redémarrage
systemctl --user status  relecture.service
systemctl --user restart relecture.service
journalctl --user -u relecture.service -f
```

Le service est défini dans `~/.config/systemd/user/relecture.service`
(variable `RELECTURE_HOST=100.95.124.70` pour le binding Tailscale), avec
`Restart=always` et le *linger* activé (`loginctl enable-linger dang`) pour
survivre aux déconnexions. Pour écouter sur toutes les interfaces en local,
lancer simplement `npm run relecture` (défaut `0.0.0.0`).

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
> repérer quel fichier et quel bloc éditer. _(Actuellement **masqué** —
> voir `src/layouts/Base.astro`, le montage `<DebugMode />` est commenté.)_

## Audit éditorial (copywriting)

Pour retravailler les pages en copywriting (avec une IA), le dossier
`audit-md/` contient un export **markdown propre** de chaque page : contenu
éditorial seul (titres, paragraphes, CTA, liens), sans CSS ni HTML technique.
Pratique pour relire et réécrire page par page.

| Fichier | Page / contenu |
| --- | --- |
| `audit-md/accueil.md` | Accueil (`/`) |
| `audit-md/a-propos.md` | À propos (`/a-propos`) |
| `audit-md/accompagnement.md` | Accompagnement (`/accompagnement`) |
| `audit-md/conversation-exploratoire.md` | Conversation exploratoire (`/conversation-exploratoire`) |
| `audit-md/ecrits.md` | Écrits — page sommaire (`/textes`) : intro + cartes des thématiques |
| `audit-md/section-amour-presence.md` | Présentation du thème « Amour et présence » (`/textes/amour-presence`) |
| `audit-md/section-desir-verite.md` | Présentation du thème « Désir et vérité » |
| `audit-md/section-peur-masque.md` | Présentation du thème « Peur et masque » |
| `audit-md/section-fables-paradoxes.md` | Présentation du thème « Fables et paradoxes » |
| `audit-md/section-desir-intimite.md` | Présentation du thème « Désir et intimité » (+ intro du registre intime) |

Le **corps des ~116 textes** n'y figure pas : il vit déjà sous forme de `.md`
dans `src/content/textes/`. `audit-md/` ne couvre que le **copy de présentation**
(intro de page, libellé + description de chaque thème).

> ⚠️ **Réinjection — où vit le contenu.** Le copy des **sections** n'est pas
> dans un `.astro` mais dans `src/lib/categories.ts` (`CATEGORY_LABELS` +
> `CATEGORY_DESCRIPTIONS` pour la page Écrits, `CATEGORY_SUBTITLES` +
> `CATEGORY_INTROS` pour le haut de chaque page de thème) :
> modifier là met à jour la page Écrits **et** les pages de section d'un coup.
> Le détail du mapping fichier→source figure dans `audit-md/_PROMPT.md`.

**Régénérer cet export** après une modification importante des pages : relancer
le prompt enregistré dans `audit-md/_PROMPT.md` (à partir du HTML construit dans
`dist/`, donc faire `npm run build` avant).

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
