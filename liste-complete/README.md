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
titre:    # titre clair et descriptif
source:   # corpus | principes | partages
date:     # si connue (posts FB) ; vide sinon
statut:   # brouillon (contenu réel) | à-terminer (vide / fragment / logistique)
doublon:  # false, ou chemin du fichier de référence si corps identique
sujet:    # 1 phrase résumant le propos (rempli sur les brouillons)
motscles: # mots-clés thématiques
enrichi:  # true sur les 824 fichiers
```

## État

- Phase 1 (faite) : découpage verbatim + détection doublons + statuts + index.
- Phase 2 (faite) : titres affinés, `sujet`, `motscles`, relecture
  orthographe/grammaire + typographie française (espace fine insécable,
  guillemets `« »`), retrait du boilerplate Facebook (signatures, PS, liens
  promo, CTA) → les 824 fichiers sont `enrichi: true`.

Répartition : **522 brouillon** (contenu réel, prêts à relire/publier) ·
**302 à-terminer** (corps vide, fragment, ou post purement logistique :
accueils de groupe, stats, annonces, liens seuls).

Doublons détectés : 58 fichiers (corps identique) — conservés tels quels et
**marqués** (champ `doublon`) plutôt que supprimés, pour décider au cas par cas.

Le sommaire complet (titre, sujet, mots-clés, statut, doublons) est dans `INDEX.md`.
