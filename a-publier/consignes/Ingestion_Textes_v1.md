# Carte d'ingestion des textes — pour Claude Code
*Duy DANG. Comment remplir automatiquement les corps de texte du site à partir des corpus sources.*

Ce document dit à Claude Code **où trouver le corps de chaque texte**, **comment le nettoyer**, et **avec quels réglages le poser**. Il s'utilise avec : `BriefClaudeCode_Site_v5.md` (build), `Selection_Textes_Site_v6.md` (la carte des textes et catégories), et les deux fichiers sources ci-dessous.

## Fichiers sources (à placer dans `sources/` du dépôt)
- `sources/Corpus_Posts_Facebook_v1.md` — corpus principal (titres en `## …`).
- `sources/Principes_Sexualite_Sensible.md` — compendium (titres en `### **…**`, souvent versions plus longues).
- `sources/poissonne_complete.txt` — corps complet de *La poissonne rouge et le têtard* (cas spécial, voir plus bas).

---

## 1. Pour chaque texte de `Selection_Textes_Site_v6.md`
Créer un fichier `src/content/textes/<slug>.md`. La catégorie, l'ordre et les drapeaux se déduisent de la position et du marquage dans v6.

**Slug** : `<categorie>-<titre-en-kebab-case>` (ex. `amour-presence-le-plus-grand-malentendu.md`). Les trois textes d'entrée gardent les noms `entree-1-reconnaissance.md`, `entree-2-deplacement.md`, `entree-3-mecanisme.md`.

**`category`** : la section v6 où figure le texte → `amour-presence` · `desir-verite` · `peur-masque` · `fables-paradoxes` · `desir-intimite`.

**`order`** : numérotation continue dans la catégorie, en suivant l'ordre d'apparition v6 de haut en bas (d'abord les « En tête », puis « Au cœur », puis « En appui »). Premier = 1.

**`entry` / `entryRole`** : `true` + le rôle (`reconnaissance` / `deplacement` / `mecanisme`) uniquement pour les trois textes d'entrée.

**`excerpt`** : reprendre la glose qui suit le tiret « — » dans la ligne v6 du texte (la reformuler en une phrase sépia ≤ 16 mots si besoin). Ne pas inventer au-delà.

**`draft`** (règle unique, à appliquer strictement) : mettre `draft: true` si la ligne v6 porte **l'un** de ces marqueurs — `[édit]`, `[édit léger]`, `[édit fort]`, `[sensible]`, `[biographique léger]`, `[accord cliente]` — **ou** si le texte est dans la catégorie *Désir et intimité* — **ou** s'il est annoté « à relire », « (aphorisme) », « titre à revoir ». Sinon `draft: false` (le texte est publié). *Conséquence voulue : les textes purement relationnels partent en ligne ; tout ce qui demande un recadrage éditorial, un accord, ou touche une zone sensible reste en brouillon pour validation ultérieure.*

**`body`** : extrait du corpus source puis nettoyé (§2, §3).

---

## 2. Trouver le corps dans les sources (matching)
Pour chaque titre v6, chercher le titre **le plus proche** dans les deux fichiers sources (la casse et la ponctuation varient : FB est souvent en MAJUSCULES, Principes en `**Gras**`).
- Ignorer les suffixes `(à terminer)`, `(2)`, `(3)`, `(Bis)` et les coquilles (ex. `MERCI DE M'AVOIR QUITTÉE QUITTEE`).
- Si le texte existe dans les deux sources, **préférer la version la plus complète et la plus propre** (souvent Principes pour les versions longues ; sinon la version FB en MAJUSCULES finale).
- Un titre source marqué `(à terminer)` ne doit jamais servir de corps : si c'est la seule version, créer le fichier en `draft: true` avec un corps `<!-- À RÉDIGER : version source incomplète -->`.

**Pièges de doublons (ne créer qu'un seul fichier, prendre la meilleure version) :**
- *Masque ou pas masque* ≈ *Le tigre et le masque* → un seul fichier (*Le tigre et le masque*).
- *Le crocodile et l'antilope* ≈ *Le crocodile traumatisé par une gazelle* → garder la version « gazelle » (retravaillée).
- *Comment tourner enfin la page* = *La voiture avec vices cachés* → un seul fichier.
- *Aux funérailles je pleure de gratitude* = *Je pleure de joie aux funérailles* → un seul fichier.

**Cas spécial — la poissonne :** pour *La poissonne rouge et le têtard*, ne pas extraire des corpus (versions tronquées). Utiliser **`sources/poissonne_complete.txt`** comme corps (il est déjà propre).

---

## 3. Nettoyage du corps (déterministe — appliquer à tout corps extrait)
Garder uniquement le texte de l'essai. Couper le corps **au premier** de ces marqueurs et supprimer tout ce qui suit :
- une ligne `Duy Dang` / `Duy DANG` / `Duy` seule (signature) ;
- `Inspirateur de Sexualité sensible`, `Frère de Sexualité sensible`, `Frère-Révélateur…`, `Accompagnateur vers la Sexualité sensible`, `Sensiblement,` ;
- `*** PLUS D'INFOS ***`, `/**** FLASH INFOS ****/`, `/* Infos spéciales */`, `*** LES INFOS ***` ;
- une ligne de tirets séparatrice (`------…`).

Supprimer aussi, partout dans le corps :
- toute URL (`www.…`, `https://…`, liens Facebook/Calendly/Lydia) et les lignes promo `=> …`, `1/ …`, `2/ …`, `PS :`, `PPS :` ;
- la ligne de date sous les titres FB (ex. `*26 novembre 2021*`) ;
- les jetons de mention `@[…:Duy Dang]` et les `{#ancre}` des titres Principes ;
- les lignes vides en triple, les `###` résiduels en fin de bloc Principes.

Ne rien réécrire d'autre. Le nettoyage est mécanique : on retire l'emballage de l'ancienne offre, on ne touche pas à la prose.

---

## 4. Après ingestion — rappel des règles transverses (de v6)
- Le texte d'entrée *Comment l'histoire de sa vie se retourne en 10 minutes* met en scène une vraie cliente → `draft: true` (en attente d'accord + anonymat).
- *Du fumier ou de l'or* : retirer la phrase évoquant l'envie passée d'arrêter de vivre.
- Plusieurs textes portent des mentions biographiques très intimes (virginité tardive, divorce) ; ils sont déjà en `draft` par la règle du §1, donc non publiés — ne pas chercher à les corriger automatiquement.

## 5. Résultat attendu
Tous les textes de v6 présents comme fichiers `.md` réels, rangés dans leurs cinq catégories, corps nettoyés. Les textes relationnels en ligne ; les textes à recadrer / sensibles / intimes en `draft`. Aucun pied de page de l'ancienne offre ne subsiste. La poissonne est complète.
