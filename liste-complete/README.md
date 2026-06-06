# liste-complete/ — corpus de travail

Extraction **complète** des textes sources, un fichier par texte, pour les
retravailler plus tard. **Non publié** : Astro ne construit que `src/`, donc
rien ici n'apparaît sur le site.

## Contenu

- `corpus/` — les 463 posts Facebook (`Corpus_Posts_Facebook_v1.md`).
- `principes/` — les 338 principes / chapitres (`Principes Sexualité Sensible`).
- `partages/` — les 23 textes longs (« Posts, partages, fables… »), classés par thème.
- `INDEX.md` — sommaire complet : titre, date, thème, statut, doublons.

## En-tête de chaque fichier

```yaml
titre:    # titre repris de la source (souvent à affiner)
source:   # corpus | principes | partages
date:     # si connue (posts FB)
statut:   # brouillon | à-terminer (ébauche vide ou marquée « à terminer »)
doublon:  # false, ou chemin du fichier de référence si corps identique
sujet:    # À ENRICHIR : 1 phrase résumant le propos
motscles: # À ENRICHIR : mots-clés
enrichi:  # false tant que sujet/motscles/relecture ne sont pas faits
```

## État

- Phase 1 (faite) : découpage verbatim + détection doublons + statuts + index.
- Phase 2 (à faire, par lots) : `sujet`, `motscles`, relecture orthographe/grammaire
  (même standard que les 116 textes publiés) → passer `enrichi: true`.

Doublons détectés : 58 fichiers (corps identique) répartis en
44 groupes — voir fin de `INDEX.md`. Conservés tels quels et **marqués**
(champ `doublon`) plutôt que supprimés, pour décider au cas par cas.
