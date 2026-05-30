# Brief Claude Code — Site « Aimer sans se quitter »
*Prompt autonome. Duy DANG — 29 mai 2026.*

Tu es Claude Code. Construis intégralement le site web ci-dessous. Ce document se suffit : ne demande aucune autre ressource. Tout est spécifié — stack, design, structure, contenu, contraintes. **La seule chose que l'humain remplira manuellement après, ce sont les corps de textes** (marqués `[À REMPLACER]`). Tout le reste, y compris la copy des pages, doit être en place et fonctionnel.

---

## 1. Mission

Un site d'auteur sobre, type « revue littéraire », pour un accompagnement relationnel privé. L'autorité passe par les textes, pas par des codes de coaching. Cinq pages : Accueil, Textes, À propos, Accompagnement, Conversation exploratoire.

**Stack imposée : Astro, contenu en markdown (content collections), sortie 100 % statique.** Minimum de dépendances, le moins de JavaScript possible (idéalement zéro hors le strict nécessaire). Raison : l'auteur ajoute ses textes en déposant un fichier `.md`, sans jamais toucher la mise en page.

Livrable : un projet Astro complet, qui build sans erreur (`npm run build`), prêt à déployer sur n'importe quel hébergeur statique (Netlify, Vercel, GitHub Pages, ou un serveur Nginx). Inclure un `README.md` court : comment lancer en dev, comment ajouter un texte, comment builder, comment déployer.

---

## 2. Setup projet

- `npm create astro@latest` — template minimal/vide, TypeScript en mode souple.
- Pas de framework UI (pas de React/Vue). Astro pur + composants `.astro`.
- Polices : EB Garamond + Inter via `@fontsource` (auto-hébergées, pas de requête Google externe) — `@fontsource/eb-garamond` (400, 400-italic, 600) et `@fontsource/inter` (400, 500).
- Une seule feuille de style globale (tokens + base), importée dans le layout.
- Arborescence attendue :
  ```
  src/
    content/
      textes/           # un .md par texte
      config.ts         # schéma de la collection
    layouts/
      Base.astro
    components/
      Header.astro
      Footer.astro
      TextCard.astro
      Pont.astro        # encart de pont vers l'accompagnement
      Button.astro
    pages/
      index.astro                 # Accueil
      textes/index.astro          # liste guidée
      textes/[...slug].astro      # un texte
      a-propos.astro
      accompagnement.astro
      conversation-exploratoire.astro
    styles/
      global.css
    assets/
      portrait.jpg      # placeholder à remplacer
  public/
  ```

---

## 3. Design system — à implémenter exactement

Aucune autre couleur, police ou effet que ce qui suit. Ne rien inventer.

### Variables CSS (dans `global.css`, sur `:root`)

```css
:root {
  --creme:      #F4EFE6; /* fond, jamais blanc pur */
  --encre:      #1F1B17; /* corps de texte, jamais noir pur */
  --bleu:       #1A2D4A; /* signature : titre, filet, bouton, exergue. JAMAIS dans le corps */
  --sepia:      #6B6258; /* secondaire : sous-titres, légendes, métadonnées */
  --filet:      #CFC3B4; /* bordures fines */

  --serif: "EB Garamond", Georgia, serif;
  --sans:  "Inter", system-ui, sans-serif;

  --lecture: 680px;   /* colonne de texte */
  --conteneur: 1120px;
  --hero-max: 1240px;
}
```

### Règles typographiques

- Fond de page : `--creme`. Corps : `--encre` en `--serif`, 1.19rem (19px) desktop / 1.1rem mobile, interligne 1.6, fer à gauche (jamais justifié), `margin-bottom: 1.5rem` entre paragraphes, `widows/orphans: 3`.
- Titres en `--serif`. **h1 en italique** (`font-style: italic`, 400), 2.8rem/2.1rem, interligne 1.15, letter-spacing +0.01em. h2 semibold (600) 1.6/1.4rem interligne 1.25 letter-spacing −0.01em. h3 semibold 1.2/1.1rem interligne 1.3 letter-spacing −0.01em.
- Le bleu d'encre `--bleu` colore uniquement : le titre principal, les filets de séparation, les boutons, et les exergues (citation en italique). **Jamais le corps de texte.**
- Sépia `--sepia` : sous-titres, légendes, métadonnées de carte. Jamais une phrase importante.
- Exergue : `--serif` italique, `--bleu`, 1.4rem/1.25rem.
- `--sans` (Inter) : navigation, boutons, légendes, mentions légales seulement. Jamais une phrase de fond.
- OpenType actif sur le corps : `font-feature-settings: "liga" 1, "dlig" 1, "onum" 1, "kern" 1;`
- **Typographie française** : guillemets « » (avec espaces fines insécables), tirets cadratins —, apostrophe courbe ’, espace insécable avant `: ; ? !` et dans « 6 000 euros ». Mettre en place ces conventions dans le contenu rendu.
- Maximum 6 tailles de texte par page. Une idée par bloc.

### Mise en page

- Conteneur de lecture (textes, sections de prose) : `max-width: var(--lecture)`, centré, marges latérales 8% min sur mobile.
- Conteneur global : `var(--conteneur)`. Hero jusqu'à `var(--hero-max)`.
- Sections espacées de 6rem (vertical). Grandes respirations possibles jusqu'à 160px sur l'accueil.
- Beaucoup de blanc. Si une page paraît vide, c'est probablement bon.

### Boutons (composant `Button.astro`)

Inter 500, 1rem, letter-spacing +0.02em. Deux variantes : **principal** (texte `--creme` sur fond `--bleu`) et **secondaire** (texte `--bleu`, bordure 1px `--bleu`, fond transparent). Coins très légèrement arrondis (2–3px) ou droits. Pas d'ombre portée, pas de dégradé, pas d'animation tape-à-l'œil ; transition de couleur discrète au survol.

### Interdits absolus (ne jamais générer)

Pas de photo de décor, de stock, de silhouette, de draps, de rideau, de couple, d'imagerie wellness. Pas de fond sombre à texte clair sur le site. Pas d'encadré de couleur (tout vit dans le fil du texte). Pas d'emoji, d'icônes décoratives, de flèches, de badges. Pas de dégradés, d'ombres marquées, d'animations d'apparition. Pas d'indigo `#2E3346` (utiliser le vrai `--bleu`). Pas de seconde police serif. Pas de pop-up, de bandeau cookie agressif, de compte à rebours, de « places limitées » factices.

---

## 4. Modèle de contenu — collection `textes`

`src/content/config.ts` :

```ts
import { defineCollection, z } from 'astro:content';

const textes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),                 // une ligne, affichée sur la carte
    category: z.enum(['amour-presence','desir-verite','peur-masque','fables-paradoxes']),
    entry: z.boolean().default(false),   // true = texte d'entrée mis en avant
    entryRole: z.enum(['reconnaissance','deplacement','mecanisme']).optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collection = { textes };
```

Les pages ne montrent jamais les `draft: true` en production. Le slug vient du nom de fichier.

**Catégories (libellés affichés) :**
- `amour-presence` → « Amour et présence »
- `desir-verite` → « Désir et vérité »
- `peur-masque` → « Peur et masque »
- `fables-paradoxes` → « Fables et paradoxes » *(catégorie-signature)*

---

## 5. Pages — spécifications

> Convention de copy : les blocs notés **[FINAL]** sont à reproduire **mot pour mot**. Les blocs **[BROUILLON]** sont la copy de lancement, en place et affichée, que l'auteur affinera plus tard. Les corps de textes de la collection sont **[À REMPLACER]**.

### 5.1 Accueil (`index.astro`)

Très épuré. De haut en bas :

1. **Hero** : le nom *Aimer sans se quitter* (h1 italique, bleu, bas de casse). Dessous, une phrase **[BROUILLON]** : *Quand votre manière d'aimer vous éloigne de vous-même.*
2. **Deux boutons** : principal **« Commencer par un texte »** → `/textes`. Secondaire, visible dès le premier écran mais discret, **« Découvrir l'accompagnement »** → `/accompagnement`.
3. **Section** (prose courte, **[BROUILLON]**) : la rupture est un révélateur, pas le sujet. 2–3 phrases.
4. **Micro-section deux chemins [BROUILLON]** : *Vous pouvez commencer par lire. Ou, si quelque chose est déjà clair pour vous, demander une conversation exploratoire.* (avec liens vers `/textes` et `/conversation-exploratoire`).
5. **Parcours « Commencer ici »** : trois pas numérotés, sobres — 1. Commencer par un texte · 2. Comprendre l'accompagnement · 3. Demander une conversation. (liens respectifs)

Objectif de la page : produire un premier « ah, ça me parle ».

### 5.2 Textes — liste guidée (`textes/index.astro`)

C'est le cœur du site. La page **guide**, elle n'étale pas.

1. Titre de page (h1) + une ligne de sous-titre **[BROUILLON]** : *Fragments sur l'amour, le désir, la peur, le corps et les endroits où l'on se perd.*
2. **« Trois textes pour entrer »** : afficher d'abord les `entry: true`, triés par `entryRole` (reconnaissance, puis deplacement, puis mecanisme). Mise en avant légèrement plus grande que les autres cartes.
3. **Ensuite, par catégorie**, dans cet ordre : Amour et présence · Désir et vérité · Peur et masque · Fables et paradoxes. Titre de catégorie en h2, puis les `TextCard` de la catégorie (triées par `order`).
4. Pas de pagination façon blog, pas de dates, pas de tags visibles.

`TextCard.astro` : titre du texte (serif, lien), une ligne d'`excerpt` (sépia), et le mot « Lire ». Bordure basse fine `1px var(--filet)`, fond transparent, padding vertical 28px. Aucune image.

Objectif : « il voit vraiment ».

### 5.3 Un texte (`textes/[...slug].astro`)

- Colonne de lecture 680px. h1 italique bleu = titre. Corps en encre.
- En bas, le composant **`Pont.astro`** (voir §6) : l'encart sobre qui relie vers l'accompagnement.
- Pas de barre de partage, pas de « articles liés » bruyants, pas de commentaires.

### 5.4 À propos (`a-propos.astro`)

Montre d'où l'auteur regarde, ne prouve pas une légitimité. Colonne 680px.

- Le **portrait** (grand) en haut : `src/assets/portrait.jpg` (placeholder — image neutre crème en attendant, avec un commentaire indiquant de la remplacer). Lumière naturelle, sobre.
- Titre de page = la **phrase propriétaire [FINAL]** :
  > Ma pratique consiste à voir, avec une femme, là où elle commence à se quitter dans la relation.
  >
  > Aimer sans se quitter soi-même.
- Corps **[BROUILLON]** : ouverture → trajectoire → manière de travailler → influences digérées (sans liste de diplômes) → invitation à lire les textes. Prévoir ~4–6 paragraphes de lorem sobre en français marqué `[BROUILLON — bio à écrire]`.

### 5.5 Accompagnement (`accompagnement.astro`)

Tout dans le fil du texte, aucun encadré coloré. Colonne 680px. Sections dans cet ordre exact :

1. **Ce que nous regardons** — liste verticale aérée **[BROUILLON]** (4–6 items courts).
2. **Ce qui devient possible** **[BROUILLON]**, en comportements observables (pas de promesse type « vous retrouverez l'amour ») :
   - Reconnaître plus tôt le moment où vous commencez à attendre.
   - Sentir quand votre corps sait déjà ce que votre tête négocie encore.
   - Ne plus prendre la peur pour une preuve d'amour.
   - Pouvoir aimer sans vous adapter aussitôt pour préserver le lien.
   - Revenir à une parole plus simple, plus vraie.
3. **Comment nous travaillons** **[BROUILLON]** :
   > Nous partons de situations réelles : un message que vous voulez envoyer, un silence qui vous trouble, une peur qui revient, une parole que vous n'osez pas dire, un endroit où votre corps sait déjà mais où votre tête négocie encore.
   >
   > Le travail n'est pas de produire une bonne réponse. Il est de voir le mouvement exact par lequel vous vous éloignez de vous-même.
4. **Le cadre** — faits nus : 4 mois · 8 séances de 90 min · réponses vocales 2×/semaine à horaires fixes (lundi + jeudi, 9–10h) · un point de vérité à 30 jours.
5. **Le prix** — une phrase de cadrage **[BROUILLON]** juste avant : *Ce cadre n'est pas fait pour apaiser quelques jours après une rupture. Il est fait pour regarder ce que cette rupture rend visible dans votre manière d'aimer.* Puis, **[FINAL]** : *Le tarif est de 6 000 euros pour les quatre mois.* Mention possible, aussi nue : *Paiement en plusieurs fois possible après accord.*
6. **Pour qui** — l'**énoncé de reconnaissance [FINAL]** : *Pour les femmes qui ont déjà beaucoup compris sur elles-mêmes — sauf ce qui se passe quand elles aiment.*
7. **Pas pour vous si** **[FINAL, en liste]** : si vous cherchez une stratégie pour récupérer quelqu'un ; pour contrôler l'autre ; une méthode rapide pour ne plus sentir ; si vous n'êtes pas prête à regarder votre part avec honnêteté.
8. **Point de vérité à 30 jours** **[BROUILLON]** : ce qu'on a vu, ce qui bouge, ce qui résiste ; on continue, on réoriente, ou on arrête proprement.
9. **CTA** : bouton principal **« Demander une conversation exploratoire »** → `/conversation-exploratoire`.

Objectif : « c'est le cadre juste ».

### 5.6 Conversation exploratoire (`conversation-exploratoire.astro`)

- Colonne 680px. Petit **portrait** discret à côté ou au-dessus du texte (placeholder).
- Texte **[BROUILLON]** : ce n'est pas un appel de vente ; on sent si le travail est juste.
- **Pas de formulaire sur le site.** Un seul bouton principal **« Réserver la conversation »** pointant vers `CALENDLY_URL` (constante de config en haut du fichier, valeur placeholder `https://calendly.com/REMPLACER`).
- Sous le bouton, une note **[BROUILLON]** indiquant que quelques questions seront posées lors de la réservation. (Les questions de qualification et la question d'engagement seront configurées dans Calendly côté auteur — voir §8. Ne pas les recréer en formulaire sur le site.)

Objectif : « je suis prête à regarder ».

---

## 6. Composants transverses

- **Header.astro** : nom *Aimer sans se quitter* à gauche (lien accueil, serif italique bleu, petit), navigation à droite en Inter : Accueil · Textes · À propos · Accompagnement · Conversation exploratoire. Sobre, fond crème, filet bas fin optionnel. Responsive : menu simple sur mobile, sans hamburger animé tape-à-l'œil (un toggle minimal suffit).
- **Footer.astro** : nom, une ligne discrète en sépia/Inter, liens essentiels, mentions légales (page ou ancre — placeholder). Pas de réseaux en gros, pas de newsletter pop.
- **Pont.astro** : encart de fin de texte, dans le fil, sans boîte colorée, séparé par un filet fin. Texte **[BROUILLON]** :
  > Si ce texte nomme quelque chose que vous vivez en ce moment, l'accompagnement est peut-être l'espace pour le regarder de plus près.

  suivi d'un lien discret vers `/accompagnement`.
- **Button.astro** : voir §3.

---

## 7. Textes placeholder à générer (vraies catégories / thèmes)

Crée les fichiers `.md` suivants dans `src/content/textes/`. Frontmatter complet et réel ; **corps = placeholder** marqué `[À REMPLACER]` avec une consigne courte, pour que la structure soit visible et navigable immédiatement. Garde les vrais titres/thèmes ci-dessous (ils viennent du corpus réel de l'auteur).

**Trois textes d'entrée :**

`entree-1-reconnaissance.md`
```md
---
title: "Quand votre manière d'aimer vous éloigne de vous-même"
excerpt: "Le moment précis où, pour garder le lien, vous commencez à vous quitter."
category: "amour-presence"
entry: true
entryRole: "reconnaissance"
order: 1
---
[À REMPLACER] Texte de reconnaissance — écrit à la deuxième personne, registre « reconnaître jamais accuser ». L'auteur le rédigera via sa méthode.
```

`entree-2-deplacement.md`
```md
---
title: "La rupture n'est pas toujours le sujet"
excerpt: "Ce qu'une rupture rend visible compte souvent plus qu'elle-même."
category: "amour-presence"
entry: true
entryRole: "deplacement"
order: 2
---
[À REMPLACER] Texte de déplacement — montrer que le sujet n'est pas seulement l'autre.
```

`entree-3-mecanisme.md`
```md
---
title: "Ce que nous regardons quand vous commencez à vous quitter"
excerpt: "Le mouvement exact par lequel on s'abandonne pour préserver le lien."
category: "amour-presence"
entry: true
entryRole: "mecanisme"
order: 3
---
[À REMPLACER] Texte de mécanisme — faire comprendre la nature du travail.
```

**Un placeholder par catégorie** (titres réels du corpus) :

- `desir-verite-aphrodisiaque.md` — title: "La vérité est aphrodisiaque" · category: desir-verite · excerpt: "Le plus méconnu des aphrodisiaques n'est pas dans l'assiette." · order:1
- `peur-masque-petit-pois.md` — title: "Le petit pois" · category: peur-masque · excerpt: "Ce qui vous empêche de dormir n'est pas le manque, c'est le masque." · order:1
- `fables-piege-a-guepe.md` — title: "Le piège à guêpe" · category: fables-paradoxes · excerpt: "La sortie se trouve là où ça fait le plus mal." · order:1
- `amour-presence-attendre.md` — title: "Quand aimer devient attendre" · category: amour-presence · excerpt: "Aimer et attendre ne sont pas la même chose, même quand ça se ressemble." · order:4

Chacun avec un corps `[À REMPLACER]` court. Mets aussi un fichier d'exemple en commentaire dans le README montrant comment ajouter un nouveau texte (créer un `.md`, choisir `category`, donner `title` + `excerpt`).

---

## 8. Calendly (côté auteur, à documenter dans le README)

Le site renvoie vers Calendly via `CALENDLY_URL`. Documente dans le README que l'auteur doit, dans Calendly, configurer les **questions d'invité** suivantes sur l'événement (c'est ce qui remplace le formulaire écrit et préserve la sélection) :
- Qu'est-ce qui vous amène ?
- Qu'avez-vous déjà compris ou essayé ?
- Qu'aimeriez-vous ne plus répéter ?
- *Le cadre est de quatre mois, au tarif de 6 000 euros. Si la conversation confirme que le travail est juste, cette décision est-elle envisageable pour vous ?*

---

## 9. Qualité, accessibilité, déploiement

- HTML sémantique, contraste suffisant (encre sur crème, bleu sur crème : vérifier ≥ 4.5:1), `lang="fr"`, balises `title`/meta description par page, Open Graph minimal (titre + description, pas d'image imposée), favicon sobre (monogramme ou rien).
- Responsive mobile-first, lisible et aéré sur petit écran (le public lira beaucoup sur mobile).
- `npm run build` doit passer sans erreur ni warning bloquant. Lighthouse : viser ≥ 95 en performance et accessibilité.
- README : `npm install` / `npm run dev` / `npm run build` ; comment ajouter un texte ; comment changer `CALENDLY_URL` ; comment déployer (Netlify glisser-déposer du dossier `dist/`, ou connexion repo, ou copie `dist/` sur Nginx).

---

## 10. Définition du « terminé »

- [ ] Projet Astro qui build proprement, sortie statique.
- [ ] Cinq pages présentes et reliées par la navigation.
- [ ] Design system appliqué exactement (4 couleurs, EB Garamond + Inter, micro-typo, typographie française).
- [ ] Aucun interdit du §3 présent (zéro photo de décor, zéro fond sombre, zéro encadré coloré, zéro emoji/icône décorative).
- [ ] Collection `textes` fonctionnelle ; page Textes guidée (3 entrées puis catégories) ; page texte avec `Pont`.
- [ ] Tous les fichiers placeholder du §7 créés, navigables, corps marqués `[À REMPLACER]`.
- [ ] Copy `[FINAL]` reproduite mot pour mot ; copy `[BROUILLON]` en place ; prix écrit « 6 000 euros ».
- [ ] Page Conversation = texte + bouton Calendly (`CALENDLY_URL` placeholder), sans formulaire.
- [ ] README clair.

Construis maintenant l'ensemble du projet.
