# Aimer sans se quitter

Site d'auteur sobre construit avec [Astro](https://astro.build), contenu en
markdown, sortie 100 % statique. L'auteur ajoute ses textes en déposant un
fichier `.md` dans `src/content/textes/` — sans toucher à la mise en page.

**Site en ligne :** https://danphu.com

## Table des matières

- [Repartir d'un serveur neuf (reprise après crash)](#repartir-dun-serveur-neuf-reprise-après-crash)
- [Développer en local](#développer-en-local)
- [Outils (scripts npm)](#outils-scripts-npm)
- [Suivi et tâches](#suivi-et-tâches)
- [Modifier le site soi-même](#modifier-le-site-soi-même)
  - [Depuis son ordinateur (VS Code)](#depuis-son-ordinateur-vs-code)
  - [Depuis github.com (sans rien installer, pratique sur mobile)](#depuis-githubcom-sans-rien-installer-pratique-sur-mobile)
  - [Où modifier quoi](#où-modifier-quoi)
- [Réglages rapides (variables CSS)](#réglages-rapides-variables-css)
  - [Grille de base et silences verticaux](#grille-de-base-et-silences-verticaux)
  - [Filets : une seule grammaire](#filets--une-seule-grammaire)
  - [Polices (auto-hébergées, sans FOUT)](#polices-auto-hébergées-sans-fout)
  - [Tailles selon l'écran (responsive)](#tailles-selon-lécran-responsive)
  - [Direction : la soustraction](#direction--la-soustraction)
- [Modifier le contenu du site](#modifier-le-contenu-du-site)
  - [Les textes (page « Textes »)](#les-textes-page--textes-)
  - [Relire et valider les textes (suivi `verifieParDuy`)](#relire-et-valider-les-textes-suivi-verifieparduy)
  - [La page « Textes » : thématiques et organisation](#la-page--textes---thématiques-et-organisation)
  - [Marqueurs éditoriaux (livres + parcours)](#marqueurs-éditoriaux-livres--parcours)
  - [Les autres pages (fixes)](#les-autres-pages-fixes)
- [Audit éditorial (copywriting)](#audit-éditorial-copywriting)
- [Portrait (photo)](#portrait-photo)
- [Réservation (TidyCal)](#réservation-tidycal)
- [Mémoire de lecture (discrète, locale)](#mémoire-de-lecture-discrète-locale)
- [Application installable (PWA, lecture hors-ligne)](#application-installable-pwa-lecture-hors-ligne)
- [Déploiement — GitHub Pages (automatique)](#déploiement--github-pages-automatique)
  - [Domaine personnalisé](#domaine-personnalisé)
  - [Autres hébergeurs](#autres-hébergeurs)

## Repartir d'un serveur neuf (reprise après crash)

Tout le nécessaire est dans ce dépôt. Sur une machine vierge :

```bash
# 1. Récupérer le code
git clone https://github.com/Aujourduy/aimer-sans-se-quitter.git
cd aimer-sans-se-quitter
npm install                 # restaure node_modules/ (non versionné)

# 2. Le site se redéploie SEUL
#    GitHub Actions reconstruit et publie à chaque push sur main (voir
#    « Déploiement » plus bas). Rien à installer côté hébergement.
```

**Outil de relecture en service permanent** (facultatif, seulement si tu veux
l'outil accessible en continu via Tailscale) :

```bash
cp scripts/relecture.service ~/.config/systemd/user/relecture.service
# Adapter dans ce fichier si l'environnement a changé :
#   - RELECTURE_HOST = l'IP Tailscale de la nouvelle machine
#   - ExecStart      = le chemin de node (ex. via `which node`)
#   - WorkingDirectory = le chemin du dépôt cloné
systemctl --user daemon-reload
systemctl --user enable --now relecture.service
loginctl enable-linger "$USER"   # survit aux déconnexions SSH
systemctl --user status relecture.service   # vérifier
```

**Accès mobile via Tailscale HTTPS** — le site de dev et l'outil de relecture
sont joignables sur le téléphone en HTTPS, uniquement sur le tailnet.

| Appli | URL | Nature |
| --- | --- | --- |
| Dan Phu (site **de dev**, brouillons compris) | `https://server-dang.tail4fa970.ts.net:8444/` | `astro dev` → raccourci plein écran (pas de service worker) |
| Relecture (outil) | `https://server-dang.tail4fa970.ts.net:8443/` | vraie PWA installable (manifest + SW) |

- **danphu (:8444)** proxifie vers `astro dev` (port 4322), qui affiche les
  **brouillons** et les repères de relecture — utile pour relire depuis le tél.
  Comme c'est le serveur de dev (pas un build), il n'a pas de service worker :
  Chrome propose « Ajouter à l'écran d'accueil » (raccourci), pas « Installer ».
  Pour que l'accès par nom Tailscale passe, `astro.config.mjs` autorise l'hôte
  via `vite.server.allowedHosts` (sans effet sur le build/prod).
- **relecture (:8443)** est une vraie PWA installable (menu ⋮ → Installer).

Mise en place (une fois) :

```bash
# 1. Relecture en service systemd permanent (voir bloc plus haut).
#    danphu de dev : lancer `npm run dev -- --host --port 4322` (ou en service).
systemctl --user enable --now relecture.service
loginctl enable-linger "$USER"

# 2. HTTPS via Tailscale (prérequis : admin console → activer « Serve », et
#    `sudo tailscale set --operator=$USER` une fois). Le port 443 est occupé
#    par le container Docker nextcloud-nginx → on utilise 8443 / 8444.
tailscale serve --bg --https=8444 http://127.0.0.1:4322   # danphu (astro dev)
tailscale serve --bg --https=8443 http://127.0.0.1:4455   # relecture
tailscale serve status                                    # vérifier
```

La config `tailscale serve` survit aux reboots. `astro dev` doit tourner pour
que :8444 réponde (le contenu se met à jour tout seul, c'est du dev).

**Ce qui N'est PAS dans le dépôt** (volontairement — se régénère ou vit ailleurs) :

| Élément | Où le retrouver |
| --- | --- |
| `node_modules/` | `npm install` |
| `dist/` (site construit) | régénéré par `npm run build` / GitHub Actions |
| DNS du domaine **danphu.com** | chez le registrar **IONOS** (4 enregistrements `A` vers `185.199.108–111.153` pour l'apex + `CNAME www → aujourduy.github.io`) — voir « Domaine personnalisé » |
| Domaine perso côté GitHub | fichier `public/CNAME` (= `danphu.com`, versionné) ; Settings → Pages le relit au déploiement |

> En cas de crash : un `git clone` restaure le site, les 250 textes, l'outil de
> relecture et sa config systemd. Seul le **DNS** se gère chez IONOS (il n'est pas
> affecté par un crash du serveur de toute façon).

## Développer en local

```bash
npm install      # une seule fois
npm run dev      # http://localhost:4321
npm run build    # construit dans dist/
npm run preview  # prévisualise le build
npm run relecture # outil de relecture local (voir « Relire et valider les textes »)
```

## Outils (scripts npm)

Tous les outils du projet sont des commandes `npm run …`. La liste ci-dessous
est **générée automatiquement** depuis `package.json` (hook pre-commit).

> Après un `git clone`, activer le hook une fois : `git config core.hooksPath .githooks`.
> Il régénère cette section à chaque commit qui touche `package.json` ou un
> script. On peut aussi la régénérer à la main : `npm run outils-readme`.

<!-- OUTILS:START -->

> _Section générée automatiquement par `scripts/generer-outils-readme.mjs`
> (hook pre-commit). Ne pas éditer à la main : modifier les scripts ou leur
> commentaire d’en-tête, puis committer._

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement Astro, avec indicateurs de relecture (http://localhost:4321). |
| `npm run build` | Construit le site de production dans `dist/`. |
| `npm run preview` | Prévisualise le dernier build de production. |
| `npm run relecture` | Outil de relecture LOCAL (dev only) — JAMAIS déployé. |
| `npm run build:drafts` | Construit le site **avec les brouillons** dans `dist-dev/` (aperçu de relecture). |
| `npm run serve-dist` | Serveur statique LOCAL (dev only) — sert le build de production `dist/` du site danphu, pour pouvoir l'utiliser comme PWA installable via Tailscale. |
| `npm run livres` | Génère les dossiers de livres À PARTIR des indicateurs cochés sur les textes. |
| `npm run tous-ecrits` | Génère docs/tous-les-ecrits.md : tous les textes à plat (titre + corps), en un seul fichier. |
| `npm run outils-readme` | Régénère la section « Outils » du README à partir de package.json et des commentaires d'en-tête des scripts. |
| `npm run astro` | Passe-plat vers la CLI Astro (`npm run astro -- <cmd>`). |

Fichiers systemd fournis dans `scripts/` : `relecture.service` (outil de
relecture en service permanent), `danphu-dev.service` (aperçu de dev).

<!-- OUTILS:END -->

## Suivi et tâches

Deux listes distinctes :

- **`docs/TODO.md`** — tâches **techniques** en attente (bugs, CI, config, dette).
- **`content/sujets-todo.json`** — **sujets de textes** à écrire, éditables dans l'outil de relecture (section « Sujets à écrire »).

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
| `--corps` | Taille du corps de texte (desktop). La grille en dérive : changer `--corps` ré-accorde tout. | `1.31rem` |
| `--creme` | Fond (jamais blanc pur) | `#F4EFE6` |
| `--encre` | Couleur du texte | `#1F1B17` |
| `--bleu` | Couleur signature (titres, liens, filets de fin) | `#1A2D4A` |
| `--sepia` | Texte secondaire (sous-titres, étiquettes, numéros, légendes) | `#6B6258` |
| `--filet` | Couleur des traits fins (en-tête, pied, rangées, fin de texte) | `#CFC3B4` |
| `--colonne` | Largeur de la colonne (réglée par page : 36rem accueil · 40rem index/thème · 38rem lecture) | `38rem` |
| `--baseline` | Pas de la **grille de base** (demi-ligne du corps) — l'unité de tout le rythme vertical | `calc(var(--corps)*1.6/2)` ≈ `1.05rem` |
| `--silence-court` / `-moyen` / `-long` / `-seuil` | Les quatre **silences** verticaux (multiples entiers de `--baseline`) | `×2` / `×4` / `×8` / `×12` |

> **Agrandir / réduire tout le texte d'un coup :** changer `--corps` dans `:root`
> (et la valeur mobile dans le bloc `@media (max-width: 640px)`). La grille de base
> suit automatiquement (le texte reste calé sur le pas vertical).

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

Les traits fins sont en `--filet` (en-tête, pied, et le filet bas des **rangées**
du sommaire d'Écrits et des pages de thème). Le **bleu** n'est pas un filet de
séparation : il ne sert qu'au soulignement fin des **liens** (porte d'accueil,
appel d'accompagnement, deux liens de fin de texte).

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

Le `:root` est identique partout ; seul le **corps** est réduit en dessous de
**640 px** (`@media (max-width: 640px)` dans `global.css`). Les titres s'adaptent
seuls (ils sont en `clamp(...)`, qui suit la largeur de l'écran).

| Élément | Ordinateur | Mobile (< 640 px) |
| --- | --- | --- |
| Corps de texte (`--corps`) | `1.31rem` | `1.19rem` |
| Titre de page (`h1`) | `clamp(2rem, 5.5vw, 2.7rem)` — s'adapte à l'écran |
| Faux-titre d'accueil | `clamp(2.1rem, 6.5vw, 3.3rem)` |
| Marges latérales | `1.5rem` | `1.25rem` (et `1rem` ≤ 380 px) |

> 💡 **Tester sans recompiler.** Avec `npm run dev`, chaque modification du
> `.css` **rafraîchit la page automatiquement** (hot-reload). Le serveur de dev
> est joignable depuis un téléphone via Tailscale (l'URL réseau s'affiche au
> démarrage), pratique pour régler le rendu mobile en direct.

### Direction : la soustraction

Le site suit un principe de **soustraction** (esprit Fitzcarraldo / Gallimard
Blanche) : **aucun ornement**. Pas de lettrine, pas de fleuron, pas d'exergue,
pas de filet décoratif, pas de bouton. La force est dans le **texte** et le
**silence** (la grille de base). Les seuls « gestes » sont :

- **Numérotation romaine** (`I`–`V`) du sommaire d'Écrits et de la gouttière des
  pages de thème, en **EB Garamond italique sépia** (jamais en Inter). Générée
  automatiquement (`src/lib/romain.ts`).
- **Titre courant** en tête de page de lecture : le nom du thème, en petites
  capitales sépia (Inter), discret et non cliquable.
- **Page de lecture** : le texte s'ouvre un peu plus bas (un blanc d'ouverture, le
  *sink*) puis coule en **paragraphes égaux**, sans aucune mise en forme. La page
  se termine par **deux liens de poids égal** (« Continuer par un autre texte » /
  *ou* / « Découvrir l'accompagnement »), soulignés d'un filet bleu fin.
- **Tout appel est un lien** souligné fin bleu (`.porte` / `.appel` / `.fin a`),
  **jamais un bouton**.

La couleur **terre cuite** (`--terre`) reste déclarée mais **désactivée** : aucune
utilisation. (Si un jour un seul accent chaud était voulu, il faudrait d'abord
décider où — ne pas l'introduire sans décision.)

## Modifier le contenu du site

Le contenu se range en deux familles : **les textes** (collection markdown qui
alimente la page « Textes ») et **les pages fixes** (accueil, accompagnement, à
propos…), qui sont des fichiers `.astro`.

### Les textes (page « Textes »)

Chaque texte est un fichier `.md` dans `src/content/textes/`. Le **nom du
fichier** (le « slug ») devient l'adresse de la page (`le-tigre-et-le-masque.md`
→ `/textes/le-tigre-et-le-masque`).

> **Convention importante — le nom de fichier est un identifiant stable.**
> - On **ne renomme pas** un fichier une fois créé, même si son titre change.
>   Le titre vit dans le frontmatter (`title:`) et se modifie librement ;
>   le nom de fichier reste figé. C'est lui qui sert d'ancre dans les listes
>   des livres et du parcours (`docs/corpus-marque.md`) et dans l'URL.
> - Le nom **n'encode pas la catégorie** : celle-ci vit dans le frontmatter
>   (`category:`). Choisir un slug court et descriptif du sujet, sans préfixe
>   de thème (ex. `le-tigre-et-le-masque`, pas `peur-masque-le-tigre…`).

En-tête (« frontmatter ») de chaque fichier, suivi du corps en markdown :

```md
---
verifieParDuy: false                # suivi de relecture (voir plus bas) — true = relu/validé
title: "Le titre du texte"          # titre affiché
excerpt: "Une ligne, sur la carte." # résumé affiché dans la liste
category: "lien-relation"           # voir le tableau plus bas
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
  existant), avec un nom de fichier court et descriptif du sujet, **sans
  préfixe de thème** (il devient l'URL et l'identifiant stable — voir la
  convention ci-dessus).
- **Supprimer** → supprimer le fichier `.md` (ou mettre `draft: true` pour le
  cacher sans l'effacer).
- **Mettre en avant** → `entry: true` + un `entryRole` : le texte apparaît dans
  « Trois textes pour entrer », en haut de la page Textes.

Catégories disponibles :

| `category`         | Affiché             |
| ------------------ | ------------------- |
| `lien-relation`     | Le lien et la relation    |
| `vrai-de-soi`       | Le vrai de soi            |
| `corps-desir`       | Le corps qui dit vrai     |
| `regard-vie`        | Le regard sur la vie      |
| `pratique-posture`  | La pratique et la posture |

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
  'lien-relation':    'Le lien et la relation',    // ← texte de droite = ce qui s'affiche
  'vrai-de-soi':      'Le vrai de soi',
  'corps-desir':      'Le corps qui dit vrai',
  'regard-vie':       'Le regard sur la vie',
  'pratique-posture': 'La pratique et la posture',
};

export const CATEGORY_ORDER = [   // ← ordre des sections sur la page
  'lien-relation',
  'vrai-de-soi',
  'corps-desir',
  'regard-vie',
  'pratique-posture',
];
```

- **Renommer** une thématique affichée → changer le libellé de droite
  (ex. `'Amour et présence'` → `'Aimer et être présent'`). La clé de gauche
  (`'lien-relation'`) ne change pas : c'est elle qui relie les textes.
- **Réordonner** les thématiques → changer l'ordre dans `CATEGORY_ORDER`.

**Déplacer un texte / changer son ordre dans une thématique** — l'en-tête du
`.md` du texte :

```md
---
category: "lien-relation"    # ← la thématique où le texte apparaît
order: 4                     # ← sa position dans la thématique (petit = en premier)
---
```

- **Déplacer** un texte vers une autre thématique → changer `category`.
- **Réordonner** dans une thématique → changer `order`.

> Une thématique n'apparaît sur la page que si elle contient **au moins un
> texte** (hors textes mis en avant via `entry: true`).

### Marqueurs éditoriaux (livres + parcours)

En plus de la `category` (la thématique **affichée sur le site**), chaque texte
porte des **marqueurs éditoriaux** — des booléens dans le frontmatter, **internes
à l'outil de relecture, invisibles sur le site public**. Ils servent à préparer
les livres et le parcours de lecture. Un texte peut en porter **plusieurs**.

| Champ frontmatter | Marqueur (outil) | Sens |
| --- | --- | --- |
| `livreAimerSansDisparaitre` | Flagship / ASD | Nourrit l'essai relationnel « Aimer sans disparaître » |
| `livreFableDanPhu` | Fable | Fable inventée ou histoire vécue à bascule |
| `livreAnalyseConte` | Conte | Relecture d'un conte/mythe connu |
| `livreVersus` | Versus | Paire contrastée « X vs Y » |
| `livreMetaphore` | Métaphore | Image qui fait voir d'un coup, sans récit |
| `parcours` | Parcours | Entre dans le chemin de lecture (douleur → conversation) |

Ces marqueurs se cochent dans l'outil de relecture (filtres cumulables en ET),
et alimentent `npm run livres` (dossiers de livres). Le **détail complet** du
marquage (résumé réel de chaque texte, fonction par livre, mouvement et niveau
d'intimité du parcours, diagnostic des déséquilibres, textes forts) est dans
**`docs/corpus-marque.md`** — la matière brute pour concevoir les tables des
matières. Régénéré par une analyse du corps de chaque texte (jamais le titre).

> Distinction clé : la `category` trie par **thème** (site public) ; les
> marqueurs de livre trient par **forme** ; le `parcours` trie par **fonction**
> dans une progression émotionnelle. Les trois sont indépendants.

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
| `audit-md/section-*.md` | Présentations des thèmes _(noms de fichiers d'après l'**ancienne** taxonomie — voir note)_ |

> ⚠️ Les fichiers `audit-md/section-*.md` portent les **anciens** noms de thème
> (`amour-presence`, `desir-verite`, `peur-masque`, `fables-paradoxes`,
> `desir-intimite`). Les thématiques du site ont été refondues en
> `lien-relation`, `vrai-de-soi`, `corps-desir`, `regard-vie`,
> `pratique-posture` (voir « La page Textes »). Ces fichiers d'audit n'ont pas
> été renommés ; à retravailler si l'audit copywriting reprend.

Le **corps des ~250 textes** n'y figure pas : il vit déjà sous forme de `.md`
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

## Mémoire de lecture (discrète, locale)

Le site garde une trace **locale** de la lecture, dans le navigateur du visiteur
(`localStorage`, espace de noms `danphu:`) — rien n'est envoyé au serveur, aucun
compte, aucun bouton. Logique factorisée dans `src/scripts/lecture-memoire.js`.

- **Dernier texte ouvert** (`danphu:dernier`) : écrit à l'ouverture d'un texte.
  Sur la page « Écrits », une seule ligne discrète apparaît alors :
  « Reprendre — ‹titre› ». Absente tant qu'aucun texte n'a été ouvert.
- **Textes lus** (`danphu:lus`) : un texte est marqué « lu » quand le lecteur
  atteint sa fin. Sur « Écrits » et les pages de thème, le **titre** d'un texte
  lu passe d'encre à sépia (couleur seulement, pas de pastille ni de compteur).
- Robuste : en navigation privée (où `localStorage` peut être bloqué), le site
  se comporte exactement comme avant, sans erreur.

## Application installable (PWA, lecture hors-ligne)

Le site est une **PWA** : on peut l'installer (« Ajouter à l'écran d'accueil »)
et relire hors-ligne les textes déjà visités. Configuration dans
`astro.config.mjs` via le plugin officiel `@vite-pwa/astro` (le service worker
est généré par Workbox, `registerType: 'autoUpdate'` → toujours à jour en ligne).

Les **icônes** sont dans `public/` : `pwa-192.png`, `pwa-512.png` et
`pwa-maskable-512.png`. Elles sont générées à partir du wordmark de marque
`docs/DanPhucarre.png` (« DAN PHU » bleu d'encre sur crème). Pour les
régénérer après une mise à jour du wordmark :

```bash
convert docs/DanPhucarre.png -resize 192x192 -background "#F4EFE6" -flatten public/pwa-192.png
convert docs/DanPhucarre.png -resize 512x512 -background "#F4EFE6" -flatten public/pwa-512.png
convert docs/DanPhucarre.png -resize 410x410 -background "#F4EFE6" -gravity center -extent 512x512 public/pwa-maskable-512.png
```

(La variante *maskable* garde le wordmark dans la zone sûre du masque.) Les
couleurs du manifeste (`theme_color`, `background_color`) sont la crème du site.

## Déploiement — GitHub Pages (automatique)

Le workflow `.github/workflows/deploy.yml` reconstruit et publie le site à
chaque push sur `main`.

**Étape unique à faire une fois :** Settings → Pages → Build and deployment →
Source → **« GitHub Actions »**.

Le site est publié sur le domaine personnalisé : **https://danphu.com**
(via `public/CNAME`). Sans domaine perso, GitHub publierait sur
`https://aujourduy.github.io/aimer-sans-se-quitter/`.

### Domaine personnalisé

1. dans `astro.config.mjs` : `site: 'https://votre-domaine.fr'` et `base: '/'` ;
2. ajoutez `public/CNAME` contenant votre domaine ;
3. Settings → Pages → Custom domain.

### Autres hébergeurs

`npm run build` produit `dist/`, déployable tel quel sur Netlify, Vercel ou
un serveur Nginx (pensez à remettre `base: '/'` pour un déploiement à la
racine du domaine).
