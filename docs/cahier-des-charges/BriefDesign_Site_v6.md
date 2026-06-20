# Brief design — Site « Aimer sans se quitter »
*Prompt autonome pour Claude Code. Duy DANG.*

Tu interviens sur le site Astro statique existant (revue littéraire pour un accompagnement relationnel privé). Ce document se suffit : il porte le contexte, le système visuel, l'intention des trois maîtres qui ont arbitré ce design, et les gestes précis à appliquer. La boussole unique, à chaque arbitrage : **est-ce que ça sert le texte et le silence, ou est-ce que ça décore ?** Si c'est de la décoration posée *sur* la page, on l'enlève. Les gestes ci-dessous ne décorent pas : ils respirent. Aucun n'ajoute de bruit ; ils retranchent ou structurent.

L'esprit : un homme calme qui voit, dans le calme. Le visiteur doit avoir l'impression d'ouvrir un beau livre, pas d'arriver sur une landing page. La retenue n'est pas du vide — c'est une discipline.

---

## 0. Le regard des trois — ce qui gouverne ce brief

Trois principes président à toutes les décisions ci-dessous. Quand un arbitrage se présente, c'est à eux qu'on revient.

**Bringhurst — la page se lit au dixième de point.** Une revue ne se juge pas à sa structure mais à sa typographie tenue. Le titre a besoin de son propre réglage optique : un italique de display ne se monte pas comme du corps. Les chiffres vivent *dans* la prose (elzéviriens), jamais comme une donnée de tableur. La mesure se compte en signes, pas en pixels : 62 à 75 caractères par ligne, sinon l'œil se perd ou s'épuise. Inter est une grotesque d'interface — irréprochable, sans odeur ; confinée aux petites capitales des labels, sa neutralité se lit comme « étiquette de revue » et non « UI d'application ». Et la ponctuation française se tient partout, jusqu'à l'insécable dans « 6 000 € ».

**Vignelli — la retenue est une discipline, pas une absence.** Un système se mesure à son élément le plus déviant : un module qui change est un bruit, donc toutes les sections obéissent au même module, sans exception. Une information ne vit qu'à un seul endroit : ce que dit une page, aucune autre ne le redit. Et toute destination primaire doit rester atteignable — cacher l'offre n'est pas du raffinement, c'est un trou de plan. Le vide n'est beau que s'il est structuré ; sinon ce n'est que du vide.

**Baron — le silence est le héros.** Le luxe, c'est la soustraction. Un objet de luxe pose une chose et laisse le silence travailler ; il ne se répète pas. Le blanc autour du titre doit être l'événement, pas un intervalle par défaut — il se compose. Et l'accès à l'offre se rend *calme*, jamais caché : Hermès ne dissimule pas qu'on peut acheter, Hermès rend l'achat tranquille. Cacher, ici, ce ne serait pas de la pudeur — ce serait de la timidité.

---

## 1. Système visuel (à respecter exactement)

```css
:root {
  --creme:#F4EFE6; --encre:#1F1B17; --bleu:#1A2D4A; --sepia:#6B6258; --filet:#CFC3B4;
  --terre:#A06A4B;            /* accent chaud — EN RÉSERVE, désactivé par défaut (voir §9) */
  --serif:"EB Garamond",Georgia,serif; --sans:"Inter",system-ui,sans-serif;
  --lecture:680px; --conteneur:1120px; --hero-max:1240px;
}
```

Fond `--creme`, jamais blanc pur. Corps en `--serif`, 19px desktop, interligne 1.6, fer à gauche, jamais justifié. `--bleu` uniquement pour titre, filets, boutons, exergues, lettrine — **jamais le corps**. `--sepia` pour sous-titres, légendes, labels, métadonnées. `--sans` (Inter) **confinée aux petites capitales** des labels et de la navigation — jamais une phrase de fond, jamais en bas de casse courante. Colonne de lecture `var(--lecture)`, beaucoup d'air vertical, mobile-first.

**Interdits absolus :** photo de décor / stock / wellness, fond sombre à texte clair, encadré ou bloc coloré, carte ombrée, dégradé, ombre portée marquée, animation d'apparition, emoji, icône décorative, flèche, badge, pop-up, compte à rebours, « places limitées », seconde police serif, texture de papier en fond, trait d'encre ou coup de pinceau, indigo grisâtre à la place du vrai `--bleu`.

---

## 2. Accueil — pur seuil

**Intention (Baron, Vignelli) :** la homepage est une porte, pas un second essai. L'offre n'y est jamais présentée ni vendue ; elle est seulement *atteignable*, calmement. Le blanc autour du titre est l'événement — on le compose, on ne le subit pas.

De haut en bas, et **rien d'autre** :

1. **Hero** — *Aimer sans se quitter* (h1, EB Garamond **italique**, `--bleu`, bas de casse), précédé et suivi d'un blanc franc et composé (pas de marge par défaut : l'espace au-dessus et au-dessous du titre est l'événement). Dessous, une seule ligne en `--sepia` : *Quand votre manière d'aimer vous éloigne de vous-même.*
2. **Un seul paragraphe** (colonne 680px, prose calme, pas de liste) : la rupture comme révélateur, pas comme sujet. Garder le texte déjà en place s'il existe ; sinon placeholder `[BROUILLON]`.
3. **La porte des textes** — un lien-bouton secondaire discret : **« Entrer par un texte »** → `/textes`.
4. **La porte calme de l'offre** — sous la porte des textes, une seule ligne en petites capitales `--sepia`/Inter, sans bouton, sans flèche criarde : `L'accompagnement` → `/accompagnement`. Discrète, jamais cachée. *(Vignelli : destination primaire atteignable. Baron : accès calme, pas dissimulé.)*

**À retirer de l'accueil** *(Vignelli : l'info vit à un seul endroit)* : tout second passage manifeste qui redirait la même chose que la page *Écrits* (la question qui revient, « des traces », « une amie inconnue », « je ne cherche pas à expliquer l'amour »). Cette parole vit sur `/textes`. Pas de liste de douleurs, pas de section « ma méthode », pas de bloc qui vend l'accompagnement, pas de showroom de textes sur la home.

---

## 3. Écrits (`textes/index.astro`) — module unique

*(Vignelli : un système se mesure à son élément le plus déviant.)* Chaque section de catégorie suit **le même module, sans exception** : titre (h2) + **une seule ligne** de présentation en `--sepia` + lien `Explorer` en petite capitale.

La section *Désir et intimité* obéit au même module sur l'index : titre + une ligne + `Explorer`. Le paragraphe long qui explique le seuil intime **descend dans sa page de thème** (`/textes/desir-intimite`), en tête de page ; il ne figure plus sur l'index.

Au-dessus des catégories, le bloc **« Trois écrits pour entrer »** reste, en `TextCard` (voir §4). C'est le seul endroit, avant les catégories, où l'on met légèrement en avant.

---

## 4. La carte de texte — l'écran à plus fort levier

C'est la « table des matières d'une belle revue ». Si elle respire, tout le site respire.

Chaque entrée (`TextCard`) :
- **Titre** en `--serif`, seul élément cliquable, taille h3, `--encre` (ou `--bleu` au survol discret, sans soulignement criard).
- **Une ligne** de présentation (`excerpt`) en `--sepia` — une seule ligne, jamais deux.
- **« Lire »** en **petite capitale** `--sepia`/Inter, discret, après la ligne ou fer à droite — jamais un lien bleu bruyant. *(Bringhurst : l'affordance est une étiquette tenue, pas un cri.)*
- **Filet bas** `1px solid var(--filet)` sur toute la mesure de la colonne.
- **Air vertical généreux** entre les entrées : `padding-block` ≈ 1.6rem mini, pour que chaque texte ait sa respiration.

```css
.text-card { padding-block: 1.6rem; border-bottom: 1px solid var(--filet); }
.text-card a.titre { font-family: var(--serif); font-size: 1.2rem; color: var(--encre); text-decoration: none; }
.text-card .excerpt { color: var(--sepia); margin-top: .3rem; }
.text-card .lire { font-family: var(--sans); font-size: .8rem; letter-spacing: .08em; text-transform: uppercase; color: var(--sepia); margin-top: .5rem; display: inline-block; }
```

---

## 5. Réglage micro-typographique *(checklist Bringhurst)*

- **Titre principal** (h1 italique) avec son propre réglage optique, distinct du corps : `font-size` 2.8rem desktop / 2.1rem mobile, `line-height` 1.12, `letter-spacing` +0.005em. L'italique de display ne doit pas se ramollir.
- **Mesure comptée en signes** : la colonne de lecture vise **62 à 75 caractères par ligne**. `--lecture:680px` à 19px tient cette fourchette ; vérifier qu'aux paliers responsive on ne descend pas sous ~55 ni ne dépasse ~78.
- **Chiffres elzéviriens** (oldstyle) dans tout le corps de texte : `font-feature-settings:"onum" 1,"liga" 1,"dlig" 1,"kern" 1;`. « 6 000 € » et toute donnée chiffrée portent ces chiffres et une **espace insécable** (`6 000`, `6 000 €`, `4 mois`).
- **Petites capitales réelles** pour la navigation et les labels (`Explorer`, `Lire`, `L'accompagnement`) : Inter en `text-transform:uppercase; letter-spacing:.08em; font-size:.8rem;`.
- **Ponctuation pendante** (optionnelle, soignée) : sur le titre et les exergues, laisser le guillemet ouvrant « ou le tiret cadratin déborder légèrement dans la marge gauche (`text-indent` négatif ou `hanging-punctuation: first;` là où supporté) pour aligner optiquement le bord du texte.
- **Typographie française** tenue partout : guillemets « » avec fines insécables, tirets cadratins —, apostrophe ’, espace insécable avant `: ; ? !`.
- **Échelle typographique cohérente** *(Vignelli)* : **6 tailles de police maximum** par page, posées sur un rapport régulier (≈ 1.25) plutôt que choisies au cas par cas.

---

## 6. La lettrine — le geste « beau livre »

Une capitale initiale en EB Garamond, `--bleu`, en tête du **premier paragraphe** de chaque page de lecture (`textes/[...slug].astro`) — et **nulle part ailleurs** (jamais sur l'index, jamais sur un excerpt, jamais sur un deuxième paragraphe). Elle ouvre la lecture ; elle ne décore pas. *(Bringhurst : son flanc droit s'aligne optiquement sur la colonne de texte, pas mécaniquement.)*

Méthode recommandée — `initial-letter` (calcule l'enfoncement sur 3 lignes automatiquement), avec repli `float` pour les navigateurs anciens :

```css
.texte article > p:first-of-type::first-letter {
  -webkit-initial-letter: 3;
  initial-letter: 3;            /* enfonce sur 3 lignes */
  font-family: var(--serif);
  font-weight: 400;
  font-style: normal;
  color: var(--bleu);
  margin-right: .08em;
}

/* Repli navigateurs sans initial-letter */
@supports not (initial-letter: 3) {
  .texte article > p:first-of-type::first-letter {
    float: left; line-height: .78; font-size: 3.6em;
    padding: .02em .08em 0 0; color: var(--bleu); font-family: var(--serif);
  }
}
```

**Piège français :** `::first-letter` inclut la ponctuation ouvrante. Un texte qui commence par « ou — verrait ce signe happé dans la lettrine. Pour ces textes-là, envelopper manuellement la vraie première lettre : `<span class="lettrine">L</span>` avec les mêmes propriétés. Documenter ce cas dans le README (ajout d'un texte qui ouvre sur un guillemet).

---

## 7. Les filets — le rythme

Le filet `1px solid var(--filet)` structure sans décorer. Trois usages, et pas un de plus :
- **Sous le hero** de l'accueil, avant le paragraphe (filet pleine mesure, `margin: 3rem auto`).
- **Entre les mouvements** d'une page longue (À propos, Accompagnement) si une respiration franche est nécessaire — sinon le fleuron (§8) suffit ; ne pas cumuler filet + fleuron au même endroit.
- **Sous chaque carte de texte** (déjà spécifié §4).

```css
hr.filet { border: none; border-top: 1px solid var(--filet); width: 100%; max-width: var(--lecture); margin: 3rem auto; }
```

---

## 8. Le fleuron de respiration — une seule marque pour tout le site

Un seul signe centré entre deux mouvements d'une page longue (page de lecture entre deux temps forts, À propos, Accompagnement). **Un seul type de marque** sur l'ensemble du site, **jamais deux marques sur le même écran**, usage rare. *(Baron : un objet de luxe ne se répète pas ; la marque tire sa force de sa rareté.)*

Marque retenue : la hedera **❧**, en `--sepia`, EB Garamond, centrée, beaucoup d'air autour. Sémantiquement c'est une rupture thématique ; la rendre accessible (séparateur, masquée aux lecteurs d'écran).

```html
<p class="fleuron" role="separator" aria-hidden="true">❧</p>
```
```css
.fleuron { text-align: center; color: var(--sepia); font-family: var(--serif); font-size: 1.4rem; margin: 4rem 0; line-height: 1; }
```

Ne pas placer de fleuron sur l'accueil (le seuil reste nu) ni sur l'index des textes (le filet suffit). Le fleuron est réservé aux pages où l'on *reste* et où l'on *lit*.

---

## 9. La terre cuite — en réserve, un seul interrupteur

`--terre:#A06A4B` reste **désactivée par défaut**. Elle n'entre en jeu que si, l'écran fini, la page paraît froide — pas avant. Si activée : **un seul élément récurrent** prend la couleur, et un seul. Recommandation : le fleuron (`.fleuron { color: var(--terre); }`). Jamais sur un titre, jamais sur un bloc, jamais en deux endroits. Une couleur, un endroit. Documenter l'interrupteur (une ligne CSS à décommenter) dans le README, pour que l'auteur l'essaie et la retire sans risque.

---

## 10. Définition du « terminé »

- [ ] **Accueil** réduit au seuil : hero + une ligne sépia + un seul paragraphe + porte « Entrer par un texte » + ligne calme `L'accompagnement` ; blanc composé autour du titre ; aucun second manifeste, aucun showroom, aucun bloc qui vend.
- [ ] **Écrits** : module unique pour les cinq catégories ; le texte long de *Désir et intimité* déplacé dans sa page de thème ; « Trois écrits pour entrer » conservé en `TextCard`.
- [ ] **Carte de texte** : titre seul cliquable, une ligne sépia, « Lire » en petite capitale, filet bas, air vertical généreux.
- [ ] **Micro-typo** : titre réglé en optique propre ; mesure 62–75 signes ; chiffres elzéviriens + insécables (dont « 6 000 € ») ; Inter en petites capitales pour labels/nav uniquement ; ponctuation pendante sur titre/exergues ; typographie française tenue ; 6 tailles max sur échelle régulière.
- [ ] **Lettrine** `--bleu` sur le premier paragraphe des pages de lecture seulement, via `initial-letter` + repli `float` ; alignement optique du flanc droit ; cas guillemet documenté.
- [ ] **Filets** aux trois emplacements prévus, jamais cumulés avec le fleuron.
- [ ] **Fleuron ❧** unique, sépia, sur les pages longues seulement, jamais deux par écran, absent de l'accueil et de l'index.
- [ ] **Terre cuite** présente comme token désactivé, un seul point d'activation documenté.
- [ ] `npm run build` sans erreur ; contraste ≥ 4.5:1 ; lecture mobile aussi aérée qu'en desktop ; Lighthouse perf et accessibilité ≥ 95.

Applique ces gestes au site existant maintenant. N'ajoute rien qui ne figure pas ci-dessus.
