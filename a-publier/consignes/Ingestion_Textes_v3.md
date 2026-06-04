# Carte d'ingestion des textes — pour Claude Code (v9)
*Duy DANG. Comment (re)remplir les corps de texte du site à partir des corpus sources, conformément à `Selection_Textes_Site_v9.md`.*

S'utilise avec : `Selection_Textes_Site_v9.md` (la carte des textes, catégories, niveaux, marqueurs) et les fichiers sources ci-dessous. Le site (structure Astro, pages de thème, navigation, design) existe déjà ; cette passe **régénère uniquement le contenu** `src/content/textes/`.

## Fichiers sources (dans `sources/`)
- `sources/Corpus_Posts_Facebook_v1.md` — corpus principal (titres en `## …`).
- `sources/Principes_Sexualite_Sensible.md` — compendium (titres en `### **…**`, versions souvent plus complètes).
- `sources/poissonne_complete.txt` — corps complet de *La poissonne rouge et le têtard* (cas spécial).

---

## 0. Régénération propre
Supprimer tous les fichiers existants de `src/content/textes/` puis régénérer depuis `Selection_Textes_Site_v9.md`. Ainsi les textes que la v9 archive ou écarte disparaissent d'eux-mêmes.

Ajouter au schéma de la collection `textes` un champ **optionnel** `draftReason` (chaîne) s'il n'existe pas déjà.

## 1. Quels textes créer
Créer un fichier **uniquement** pour les textes listés dans les sections de revue de la v9 :
- les **trois textes d'entrée** ;
- les cinq catégories : *Amour et présence*, *Désir et vérité*, *Peur et masque*, *Fables et paradoxes*, et *Désir et intimité — en retenue* (ses trois textes seulement).

**Ne créer aucun fichier** pour les sections **« Archive intime (hors revue) »** et **« Écartés »** de la v9. Ces textes ne sont pas dans la revue.

## 2. Frontmatter de chaque fichier
- **Slug / nom de fichier** : `<categorie>-<titre-en-kebab-case>.md`. Les entrées gardent `entree-1-reconnaissance.md`, `entree-2-deplacement.md`, `entree-3-mecanisme.md`.
- **`category`** : la section v9 → `amour-presence` · `desir-verite` · `peur-masque` · `fables-paradoxes` · `desir-intimite`.
- **`order`** : numérotation continue dans la catégorie, dans l'ordre d'apparition v9 (En tête, puis Au cœur, puis En appui). Premier = 1.
- **`entry` / `entryRole`** : `true` + rôle (`reconnaissance` / `deplacement` / `mecanisme`) pour les trois entrées seulement.
- **`excerpt`** : la glose après le tiret « — » de la ligne v9 (reformulée en une phrase sépia ≤ 16 mots si besoin). Ne pas inventer au-delà.
- **`draft`** (règle unique) : `draft: true` si la ligne v9 porte `[édit]`, `[édit léger]`, `[édit fort]`, `[sensible]`, `[biographique léger]`, `[accord cliente]`, **ou** si le texte est en *Désir et intimité*, **ou** s'il est annoté « à relire / titre revu / titre à revoir / (aphorisme) ». Sinon `draft: false`.
- **`draftReason`** (seulement si `draft: true`) : raison courte, déduite du marqueur v9 —
  - `[édit]` / `[édit léger]` / `[édit fort]` → « thème sexuel à recadrer vers le relationnel »
  - `[sensible]` → « zone sensible à valider »
  - `[biographique léger]` → « mention biographique intime à alléger »
  - `[accord cliente]` → « accord + anonymat cliente requis »
  - catégorie *Désir et intimité* → « registre intime, tenu en retenue »
  - « titre revu » / « titre à revoir » → « titre à valider »
  - « à relire » / « (aphorisme) » → « forme à retravailler »
  - Si plusieurs marqueurs, les combiner (ex. « zone sensible à valider ; mention biographique intime à alléger »).

## 3. Trouver le corps (matching)
Chercher dans les deux sources le titre le plus proche (casse/ponctuation variables : FB en MAJUSCULES, Principes en `**Gras**`). Ignorer les suffixes `(à terminer)`, `(2)`, `(Bis)` et les coquilles. Si le texte existe dans les deux, **préférer la version la plus complète et propre**. Un titre source `(à terminer)` ne sert jamais de corps.

**Renommages et cas particuliers de la v9 :**
- **Il n'y a rien à devenir** : le corps se trouve sous le titre source « La question piégée : devenir pleinement une femme / un homme ». Garder ce corps, mais titre = *Il n'y a rien à devenir*, `draft: true`, `draftReason: « titre à valider »`.
- **Le tigre et le masque** : prendre le corps de la version la plus complète du conte du sel et des tigres — c'est le texte source **« Sexualité ou pas : le masque »** (Principes). Titre affiché = *Le tigre et le masque*.
- **C'est cacher qui rend vulnérable** : corps dans `sources/Principes_Sexualite_Sensible.md` (Achille et Siegfried).
- **La poissonne rouge et le têtard** : corps = `sources/poissonne_complete.txt`.

**Doublons — ne créer qu'un fichier (déjà géré par la v9, mais vigilance) :**
- *Le tigre et le masque* = *Masque ou pas masque* = *Sexualité ou pas : le masque* → un seul.
- *Le crocodile et l'antilope* ≈ *Le crocodile traumatisé par une gazelle* → garder « gazelle ».
- *Comment tourner enfin la page* = *La voiture avec vices cachés* → un seul.
- *Aux funérailles je pleure de gratitude* = *Je pleure de joie aux funérailles* → un seul.
- **Ne pas créer** *La nuit noire* : c'est un fragment de *C'est cacher qui rend vulnérable*.

## 4. Nettoyage du corps (déterministe)
Garder seulement l'essai. Couper au premier de ces marqueurs et supprimer la suite : ligne `Duy Dang` / `Duy DANG` / `Duy` seule ; `Inspirateur de Sexualité sensible`, `Frère de Sexualité sensible`, `Accompagnateur vers la Sexualité sensible`, `Sensiblement,` ; `*** PLUS D'INFOS ***`, `/**** FLASH INFOS ****/`, `/* Infos spéciales */` ; ligne de tirets séparatrice.
Supprimer aussi partout : URLs (`www.…`, `https://…`, Facebook/Calendly/Lydia) et lignes promo `=> …`, `1/ …`, `PS :`, `PPS :` ; date sous les titres FB (`*26 novembre 2021*`) ; mentions `@[…:Duy Dang]` et ancres `{#…}` ; triples lignes vides et `###` résiduels. Ne rien réécrire d'autre.

## 5. Rappels transverses (de la v9)
- *Comment l'histoire de sa vie se retourne en 10 minutes* (entrée 3) → `draft: true`, `draftReason: « accord + anonymat cliente requis »`.
- *Du fumier ou de l'or* : retirer la phrase évoquant l'envie passée d'arrêter de vivre.
- Ne pas tenter de recadrer automatiquement les textes `[édit]` : ils restent en brouillon, corps nettoyé tel quel.
- *Osez ceci, cessez cela : stop à l'impératif* : le corps source est **tronqué** (il s'arrête en plein milieu). Garder le corps partiel tel quel, `draft: true`, `draftReason: « fin à compléter »`.
- *Excitation vs présence* : `draft: false`, mais alléger la seule comparaison sexuelle du corps (« comme les premières fois qu'on fait l'amour »).

## 6. Résultat attendu
Tous les textes des sections de revue de la v9 présents comme `.md`, rangés dans leurs cinq catégories, corps nettoyés. Les relationnels en ligne ; les autres en `draft` avec un `draftReason` lisible. Aucun texte des sections Archive / Écartés. Aucun pied de page de l'ancienne offre. La poissonne complète. `npm run build` passe.
