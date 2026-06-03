# Brief Claude Code — Site « Aimer sans se quitter »
*Prompt autonome. Duy DANG — 29 mai 2026.*

Tu es Claude Code. Construis intégralement le site web ci-dessous. Ce document se suffit : ne demande aucune autre ressource. Tout est spécifié — stack, design, structure, contenu, contraintes, déploiement. **La seule chose que l'humain remplira manuellement après, ce sont les corps de textes** (marqués `[À REMPLACER]`). Tout le reste, y compris la copy des pages, doit être en place et fonctionnel.

---

## 1. Mission

Un site d'auteur sobre, type « revue littéraire », pour un accompagnement relationnel privé. L'autorité passe par les textes, pas par des codes de coaching. Cinq pages : Accueil, Textes, À propos, Accompagnement, Conversation exploratoire.

**Stack imposée : Astro, contenu en markdown (content collections), sortie 100 % statique.** Minimum de dépendances, le moins de JavaScript possible. L'auteur ajoute ses textes en déposant un fichier `.md`, sans toucher la mise en page.

**Hébergement cible : GitHub Pages** (voir §9 — `base`, workflow Actions, liens base-aware). Le site doit fonctionner servi sous un sous-chemin de projet.

Livrable : projet Astro complet qui build sans erreur (`npm run build`), déployé via GitHub Actions sur GitHub Pages, plus un `README.md` court (dev, ajout d'un texte, build, déploiement, réglage du domaine).

---

**Remplissage des textes :** le site n'est pas livré avec des corps vides. Les corps sont **extraits et nettoyés automatiquement** depuis les corpus sources, selon `Ingestion_Textes_v1.md`. Les textes purement relationnels sont publiés ; les textes à recadrer, sensibles ou intimes sont posés en `draft`. Voir §7.

## 2. Setup projet

- `npm create astro@latest` — template minimal/vide, TypeScript souple.
- Pas de framework UI (pas de React/Vue). Astro pur + composants `.astro`.
- Polices auto-hébergées via `@fontsource` : `@fontsource/eb-garamond` (400, 400-italic, 600) et `@fontsource/inter` (400, 500).
- Une feuille de style globale (tokens + base), importée dans le layout.
- Arborescence :
  ```
  src/
    content/textes/        # un .md par texte
    content/config.ts
    layouts/Base.astro
    components/ Header.astro Footer.astro TextCard.astro Pont.astro Button.astro
    pages/ index.astro  textes/index.astro  textes/[...slug].astro
           a-propos.astro  accompagnement.astro  conversation-exploratoire.astro
    styles/global.css
    assets/portrait.jpg     # placeholder
  public/.nojekyll
  .github/workflows/deploy.yml
  ```

---

## 3. Design system — à implémenter exactement

### Variables CSS (`global.css`, sur `:root`)

```css
:root {
  --creme:#F4EFE6; --encre:#1F1B17; --bleu:#1A2D4A; --sepia:#6B6258; --filet:#CFC3B4;
  --serif:"EB Garamond",Georgia,serif; --sans:"Inter",system-ui,sans-serif;
  --lecture:680px; --conteneur:1120px; --hero-max:1240px;
}
```

### Règles typographiques

- Fond `--creme`. Corps `--encre` en `--serif`, 19px desktop / 1.1rem mobile, interligne 1.6, fer à gauche, `margin-bottom:1.5rem`, `widows/orphans:3`.
- h1 **italique** (400) 2.8/2.1rem, 1.15, +0.01em ; h2 semibold 1.6/1.4rem, 1.25, −0.01em ; h3 semibold 1.2/1.1rem, 1.3, −0.01em.
- `--bleu` uniquement : titre, filets, boutons, exergues. **Jamais le corps.**
- `--sepia` : sous-titres, légendes, métadonnées.
- Exergue : `--serif` italique, `--bleu`, 1.4/1.25rem.
- `--sans` (Inter) : nav, boutons, légendes, mentions.
- Corps : `font-feature-settings:"liga" 1,"dlig" 1,"onum" 1,"kern" 1;`
- Typographie française : « » (espaces fines insécables), tirets cadratins —, apostrophe ’, espace insécable avant `: ; ? !` et dans « 6 000 euros ».
- 6 tailles max par page.

### Mise en page

- Colonne de lecture `var(--lecture)`, centrée, marges latérales 8% min mobile. Conteneur global `var(--conteneur)` ; hero jusqu'à `var(--hero-max)`. Sections espacées de 6rem. Beaucoup de blanc.

### Boutons (`Button.astro`)

Inter 500, 1rem, +0.02em. Principal : `--creme` sur `--bleu`. Secondaire : `--bleu`, bordure 1px `--bleu`, fond transparent. Coins quasi droits. Pas d'ombre ni dégradé.

### Interdits absolus (ne jamais générer)

Photo de décor, stock, silhouette, draps, rideau, fenêtre, couple, imagerie wellness. Fond sombre à texte clair. Encadré de couleur. Emoji, icônes décoratives, flèches, badges. Dégradés, ombres marquées, animations d'apparition. Indigo `#2E3346` (utiliser le vrai `--bleu`). Seconde police serif. Pop-up, bandeau d'urgence, compte à rebours, « places limitées ». **Et, sur l'accueil : pas de liste de douleurs en bullets, pas de section « ma méthode/ma manière d'accompagner » en étapes, pas de bloc qui vend l'accompagnement (la home oriente, elle ne vend pas).** **Pour les textes : pas d'accordéons ni de menus déroulants — chaque texte a sa propre page (motif index → page). Pas de boutons de partage social ; un seul « copier le lien ».**

---

## 4. Modèle de contenu — collection `textes`

`src/content/config.ts` :

```ts
import { defineCollection, z } from 'astro:content';
const textes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.enum(['amour-presence','desir-verite','peur-masque','fables-paradoxes','desir-intimite']),
    entry: z.boolean().default(false),
    entryRole: z.enum(['reconnaissance','deplacement','mecanisme']).optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});
export const collection = { textes };
```

Les `draft:true` ne s'affichent pas en production. Le slug vient du nom de fichier.
Catégories : `amour-presence` → « Amour et présence » · `desir-verite` → « Désir et vérité » · `peur-masque` → « Peur et masque » · `fables-paradoxes` → « Fables et paradoxes » · `desir-intimite` → « Désir et intimité » (registre intime, toujours en dernier).

**Anneau des thèmes** (ordre fixe, utilisé pour la navigation de bord et l'ordre d'affichage) : `amour-presence → desir-verite → peur-masque → fables-paradoxes → desir-intimite`, **bouclé** (après `desir-intimite`, on revient à `amour-presence`).

---

## 5. Pages

> **[FINAL]** = mot pour mot. **[BROUILLON]** = copy de lancement, affichée, à affiner plus tard. Corps de collection = **[À REMPLACER]**.

### 5.1 Accueil (`index.astro`) — une porte qui voit déjà

L'accueil ne vend pas plus, il prouve le regard plus tôt : il fait, en miniature, ce que fait un texte. De haut en bas :

1. **Hero** : nom *Aimer sans se quitter* (h1 italique, bleu, bas de casse). Dessous, **[BROUILLON]** : *Quand votre manière d'aimer vous éloigne de vous-même.*
2. **Passage incarné, deuxième personne, ~5–8 lignes** (bloc `[BROUILLON — passage incarné à écrire]`) : prévoir l'emplacement et le style (prose en colonne 680px, ton calme, pas de liste). C'est le premier « ah, il voit ». Mettre un placeholder en français qui montre l'intention : *« Vous venez en pensant… on découvre souvent autre chose : le moment où vous… »*. **Ne pas mettre de liste à puces ici.**
3. **Les trois textes d'entrée, affichés directement sur l'accueil** : récupérer de la collection les `entry: true`, triés par `entryRole` (reconnaissance, deplacement, mecanisme), et les afficher en `TextCard` (titre + excerpt + « Lire »). C'est le showroom surfacé dès la home.
4. **Deux boutons** : principal **« Commencer par un texte »** → `/textes` ; secondaire visible mais discret **« Découvrir l'accompagnement »** → `/accompagnement`.
5. **Micro-section deux chemins [BROUILLON]** : *Vous pouvez commencer par lire. Ou, si quelque chose est déjà clair pour vous, demander une conversation exploratoire.* (liens vers `/textes` et `/conversation-exploratoire`).
6. **Parcours « Commencer ici »** : trois pas — 1. Commencer par un texte · 2. Comprendre l'accompagnement · 3. Demander une conversation.

### 5.2 Textes — liste guidée (`textes/index.astro`)
1. Titre + sous-titre **[BROUILLON]** : *Fragments sur l'amour, la vérité, la peur et les endroits où l'on se perd.*
2. **« Trois textes pour entrer »** : les `entry: true`, triés par `entryRole`, légèrement mis en avant.
3. **Puis par catégorie**, ordre de l'anneau : Amour et présence · Désir et vérité · Peur et masque · Fables et paradoxes · **Désir et intimité** (registre intime, toujours en dernier). Titre de catégorie en h2 **cliquable vers sa page de thème** (§5.2bis), puis `TextCard` triées par `order`. **Aucun accordéon : les textes ne sont jamais repliés ; la carte mène à la page du texte.**
4. Pas de pagination, pas de dates, pas de tags visibles.

`TextCard.astro` : titre (serif, lien), une ligne d'`excerpt` (sépia), « Lire ». Bordure basse `1px var(--filet)`, fond transparent, padding vertical 28px. Aucune image.

### 5.2bis Page de thème (`textes/[category].astro`)
Une page par catégorie (cinq au total), générée depuis la collection. C'est la destination des liens de bord de `NavTexte` (§5.3) et des titres de catégorie de la page Textes. Contenu : h1 = nom de la catégorie, sous-titre sépia optionnel, puis les `TextCard` de cette catégorie triées par `order`. Même sobriété que la page Textes, pas d'accordéon. URL : `/textes/amour-presence`, `/textes/desir-verite`, `/textes/peur-masque`, `/textes/fables-paradoxes`, `/textes/desir-intimite`.

### 5.3 Un texte (`textes/[...slug].astro`)
Colonne 680px. h1 italique bleu = titre. Corps en encre. Pas de « articles liés », pas de commentaires, pas de dates. En bas du texte, dans l'ordre :
1. **`Pont.astro`** (§6) — l'invitation douce vers l'accompagnement.
2. **`NavTexte.astro`** (§6) — la circulation dans l'œuvre, une ligne sobre ‹ précédent · copier le lien · suivant ›. La page se termine donc sur la circulation, pas sur l'accompagnement.
   - **Au milieu d'une catégorie** : « précédent » / « suivant » mènent au texte voisin **de la même catégorie** (tri par `order`).
   - **Aux bords d'une catégorie** : le lien change de nature. Sur le dernier texte, « suivant » devient « [Nom du thème suivant] → » et mène à la **page du thème** suivant (§5.2bis) ; sur le premier, « précédent » devient « ← [Nom du thème précédent] » et mène à la page du thème précédent.
   - **Anneau bouclé, aucun cul-de-sac** : le tout dernier texte de `desir-intimite` propose « Amour et présence → » ; le tout premier d'`amour-presence` propose « ← Désir et intimité ».
   - **Partage = « copier le lien » uniquement** : copie l'URL canonique absolue du texte dans le presse-papier, confirmation discrète (« Lien copié »). **Aucun bouton de réseau social.**

### 5.4 À propos (`a-propos.astro`)
Portrait (grand) en haut (`src/assets/portrait.jpg`, placeholder à remplacer). Titre = **phrase propriétaire [FINAL]** :
> Ma pratique consiste à voir, avec une femme, là où elle commence à se quitter dans la relation.
>
> Aimer sans se quitter soi-même.

Corps **[BROUILLON]** : ouverture → trajectoire → manière de travailler → influences digérées (sans diplômes) → invitation à lire. ~4–6 paragraphes placeholder marqués `[BROUILLON — bio à écrire]`. Colonne 680px.

### 5.5 Accompagnement (`accompagnement.astro`)
Tout dans le fil, aucun encadré coloré. Colonne 680px. Sections :

1. **Ce que nous regardons** — liste verticale aérée **[BROUILLON]**.
2. **Ce qui devient possible** **[BROUILLON]**, comportements observables (jamais « vous retrouverez l'amour ») :
   - Reconnaître plus tôt le moment où vous commencez à attendre.
   - Sentir quand votre corps sait déjà ce que votre tête négocie encore.
   - Ne plus prendre la peur pour une preuve d'amour.
   - Pouvoir aimer sans vous adapter aussitôt pour préserver le lien.
   - Revenir à une parole plus simple, plus vraie.
3. **Comment nous travaillons** **[BROUILLON]** :
   > Nous partons de situations réelles : un message que vous voulez envoyer, un silence qui vous trouble, une peur qui revient, une parole que vous n'osez pas dire, un endroit où votre corps sait déjà mais où votre tête négocie encore.
   >
   > Le travail n'est pas de produire une bonne réponse. Il est de voir le mouvement exact par lequel vous vous éloignez de vous-même.
4. **Le cadre**, faits nus : 4 mois · 8 séances de 90 min · réponses vocales 2×/semaine à horaires fixes (lundi + jeudi, 9–10h) · un point de vérité à 30 jours.
5. **Le prix** — cadrage **[BROUILLON]** : *Ce cadre n'est pas fait pour apaiser quelques jours après une rupture. Il est fait pour regarder ce que cette rupture rend visible dans votre manière d'aimer.* Puis **[FINAL]** : *Le tarif est de 6 000 euros pour les quatre mois.* Mention possible : *Paiement en plusieurs fois possible après accord.*
6. **Pour qui** — **[FINAL]** : *Pour les femmes qui ont déjà beaucoup compris sur elles-mêmes — sauf ce qui se passe quand elles aiment.*
7. **Attention, ce n'est pas** — décrit ce que le travail *n'est pas* (la lectrice se retire d'elle-même, on ne la pointe pas). **[FINAL]** :
   > Attention, ce n'est pas :
   > - un accompagnement pour récupérer quelqu'un ou le faire revenir ;
   > - un lieu pour apprendre à contrôler l'autre ou le lien ;
   > - une méthode rapide pour ne plus rien sentir ;
   > - un espace où l'on peut éviter de regarder sa propre part.
8. **Point de vérité à 30 jours** **[BROUILLON]** : ce qu'on a vu, ce qui bouge, ce qui résiste ; on continue, on réoriente, ou on arrête proprement.
9. **CTA** : **« Demander une conversation exploratoire »** → `/conversation-exploratoire`.

### 5.6 Conversation exploratoire (`conversation-exploratoire.astro`)
Colonne 680px. Petit **portrait** discret près du texte. Texte **[BROUILLON]** : ce n'est pas un appel de vente. **Pas de formulaire.** Bouton principal **« Réserver la conversation »** vers `CALENDLY_URL` (constante en haut du fichier, placeholder `https://calendly.com/REMPLACER`). Sous le bouton, note **[BROUILLON]** : quelques questions seront posées lors de la réservation (configurées dans Calendly — §8).

---

## 6. Composants

- **Header.astro** : nom à gauche (lien accueil, serif italique bleu, petit), nav à droite Inter : Accueil · Textes · À propos · Accompagnement · Conversation exploratoire. Fond crème, filet bas optionnel. Mobile : toggle minimal. **Liens internes base-aware (§9).**
- **Footer.astro** : nom, ligne discrète sépia/Inter, mentions légales (placeholder). Pas de réseaux en gros, pas de newsletter pop.
- **Pont.astro** : encart de fin de texte, dans le fil, sans boîte, filet fin. **[BROUILLON]** :
  > Si ce texte nomme quelque chose que vous vivez en ce moment, l'accompagnement est peut-être l'espace pour le regarder de plus près.
  
  + lien discret vers `/accompagnement`.
- **NavTexte.astro** : reçoit `slug`, `category`, `order` du texte courant. À partir de `getCollection('textes')` (hors `draft`), calcule le texte précédent/suivant **dans la même catégorie** (tri par `order`). Aux bords, renvoie vers la page de thème voisine selon l'anneau (§5.3, bouclé). Rendu : une seule ligne Inter, sépia, filet fin au-dessus ; trois emplacements ‹ gauche · centre · droite › = ‹ précédent · copier le lien · suivant ›. « copier le lien » = petit bouton texte appelant `navigator.clipboard.writeText(<URL absolue base-aware>)` puis affichant « Lien copié » ~2 s. Liens base-aware (§9). Aucune icône sociale.
- **Button.astro** : voir §3.

---

## 7. Remplissage des textes — ingestion depuis les sources

Ne plus créer de fichiers à corps `[À REMPLACER]`. À la place, **peupler la collection automatiquement** :

1. Lire `Selection_Textes_Site_v6.md` (la carte : tous les textes, leurs catégories, leur ordre, leurs marqueurs).
2. Pour chaque texte, suivre **`Ingestion_Textes_v1.md`** : trouver le corps dans `sources/Corpus_Posts_Facebook_v1.md` ou `sources/Principes_Sexualite_Sensible.md` (matching par titre, versions complètes préférées, pièges de doublons signalés), puis appliquer le **nettoyage déterministe** (retrait des pieds de page / signatures / URLs / dates / mentions de l'ancienne offre).
3. Écrire chaque `src/content/textes/<slug>.md` avec le frontmatter calculé : `title`, `excerpt` (glose v6), `category`, `order` (continu dans la catégorie), `entry`/`entryRole` pour les trois textes d'entrée, et `draft` selon la **règle unique** : `draft: true` dès qu'un marqueur `[édit]`, `[édit léger]`, `[édit fort]`, `[sensible]`, `[biographique léger]`, `[accord cliente]` est présent, ou si le texte est en *Désir et intimité*, ou s'il est « à relire / aphorisme / titre à revoir ». Sinon `draft: false`.
4. **Cas spécial** : *La poissonne rouge et le têtard* utilise `sources/poissonne_complete.txt` comme corps.
5. Conséquence : les `draft: true` ne s'affichent pas en production ; le site est riche et vivant, mais seuls les textes relationnels prêts sont en ligne.

Le slug vient du nom de fichier. README : montrer comment publier un brouillon (passer `draft` à `false`) et comment ajouter un texte.

## 8. Calendly (à documenter dans le README)

Le site renvoie vers `CALENDLY_URL`. Documenter que l'auteur configure dans Calendly les **questions d'invité** :
- Qu'est-ce qui vous amène ?
- Qu'avez-vous déjà compris ou essayé ?
- Qu'aimeriez-vous ne plus répéter ?
- *Le cadre est de quatre mois, au tarif de 6 000 euros. Si la conversation confirme que le travail est juste, cette décision est-elle envisageable pour vous ?*

---

## 9. Déploiement — GitHub Pages

- **`astro.config.mjs`** : `site: 'https://USERNAME.github.io'`, `base: '/REPO'` (placeholders, commenter). Si domaine personnalisé ou page utilisateur (`USERNAME.github.io`), `base: '/'`.
- **Liens base-aware** : tous les liens et assets respectent `base` (utiliser `import.meta.env.BASE_URL` ou un helper). Le site fonctionne sous sous-chemin sans liens cassés.
- **`public/.nojekyll`** présent.
- **`.github/workflows/deploy.yml`** : workflow officiel Astro pour Pages — `actions/checkout`, install + `npm run build`, puis `withastro/action` (ou `actions/configure-pages` + `upload-pages-artifact` sur `dist/` + `deploy-pages`). Déclenché sur push `main`. Permissions `pages: write`, `id-token: write`.
- **README** : régler GitHub → Settings → Pages → Source : « GitHub Actions » ; renseigner `site`/`base` ; passer à un domaine personnalisé.

---

## 10. Qualité & accessibilité

HTML sémantique, contraste ≥ 4.5:1, `lang="fr"`, `title`/meta description par page, Open Graph minimal, favicon sobre. Responsive mobile-first, lecture aérée. `npm run build` sans erreur. Lighthouse ≥ 95 perf et accessibilité.

---

## 11. Définition du « terminé »

- [ ] Projet Astro qui build proprement, sortie statique.
- [ ] Pages principales (Accueil, Textes, À propos, Accompagnement, Conversation) reliées par la navigation, + pages de thème et de texte générées depuis la collection.
- [ ] Design system exact (4 couleurs, EB Garamond + Inter, micro-typo, typographie française).
- [ ] Aucun interdit du §3 présent (y compris : accueil non transformé en page de coach).
- [ ] Accueil enrichi : hero + passage incarné (placeholder, sans liste) + trois textes d'entrée affichés + deux chemins + parcours.
- [ ] Collection `textes` à **cinq** catégories (dont `desir-intimite`) ; page Textes guidée (3 entrées puis catégories, titres cliquables, sans accordéon) ; **une page de thème par catégorie** ; page texte avec `Pont` puis `NavTexte`.
- [ ] **Textes peuplés depuis les sources** (pas de corps `[À REMPLACER]`) : relationnels en ligne, textes à recadrer/sensibles/intimes en `draft` ; pieds de page de l'ancienne offre retirés ; poissonne complète.
- [ ] `NavTexte` : précédent/suivant dans la catégorie, bascule vers la page de thème aux bords, anneau bouclé incluant `desir-intimite`, « copier le lien » sans réseau social.
- [ ] Copy `[FINAL]` mot pour mot (dont « Attention, ce n'est pas ») ; `[BROUILLON]` en place ; prix « 6 000 euros ».
- [ ] Conversation = texte + bouton Calendly, sans formulaire.
- [ ] GitHub Pages : `base` correct, liens base-aware, `.nojekyll`, workflow Actions, README clair.

Construis maintenant l'ensemble du projet.
