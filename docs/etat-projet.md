# État courant — Aimer sans se quitter (danphu.com)

> Fichier volontairement **court** : état présent, chantiers en cours, TODO.
> Synchronisé vers un Gist secret (lu par claude.ai) via `bin/sync-gist.sh`.
> Détail technique : `README.md`. TODO technique : `docs/TODO.md`.
> Matière éditoriale (marqueurs livres/parcours) : `docs/corpus-marque.md`.

**Dernière mise à jour :** 2026-07-07
**Prod :** ✅ https://danphu.com (site statique Astro → GitHub Pages, déploiement auto à chaque push sur `main`)
**Repo :** `Aujourduy/aimer-sans-se-quitter` (privé)

## Nature du projet

Site d'auteur sobre pour **Duy Dang / Dan Phu** : textes sur la relation, le désir,
l'humain et la vie. Construit avec **Astro 5** (contenu markdown, sortie 100 % statique).
L'auteur ajoute ses textes en déposant un `.md` dans `src/content/textes/`.

Positionnement : développer l'autorité et l'expertise de Duy sur la compréhension
de l'humain et de la vie (élargi depuis « la relation amoureuse »).

## Contenu

- **250 textes** (`src/content/textes/*.md`) : **152 publiés · 98 brouillons**.
- **3 validés** par Duy (`verifieParDuy`) — la relecture ne fait que commencer.
- **5 catégories thématiques** (frontmatter `category`, source unique `src/lib/categories.data.mjs`) :
  Le lien et la relation · Le vrai de soi · Le corps qui dit vrai · Le regard sur la vie · La pratique et la posture.
- **Marqueurs éditoriaux** (booléens frontmatter, source unique de vérité des livres/parcours,
  invisibles sur le site public, cochés dans l'outil de relecture) :
  Flagship/ASD 202 · Versus 93 · Métaphore 76 · Fable 18 · Conte 18 · Parcours 164.
- **Convention slug** : le nom de fichier est un identifiant STABLE, sans préfixe de thème,
  jamais rencommé (le titre change dans le frontmatter, pas le fichier).

## Outils

- **Site public** : `npm run build` → `dist/`, déployé par GitHub Actions (retry ×3 sur le deploy).
- **Outil de relecture** (`npm run relecture`, `scripts/relecture.mjs`, port 4455) : cocher marqueurs,
  valider (`verifieParDuy`), éditer titre/corps, filtres cumulables (ET), sujets à écrire.
  Accessible en PWA via Tailscale (`:8443`). LOCAL uniquement, jamais déployé.
- **Doc auto** : `docs/tous-les-ecrits.md` (concat des 250 textes, `npm run tous-ecrits`),
  section « Outils » du README auto-générée (hook pre-commit).

## Chantier en cours

- **Relecture éditoriale** : 3/250 validés. Le gros du travail à venir = relire/valider les textes
  et construire les tables des matières des livres à partir de `docs/corpus-marque.md`.

## TODO (voir `docs/TODO.md` pour le détail)

- 🔴 **Typographie des pages `.astro`** (6 pages fixes) — espaces fines insécables, reportée
  (les 250 textes .md sont déjà traités). Script prêt.
- 🟡 **Astro 7 bloqué** par le plugin PWA (`@vite-pwa/astro` ≤ Astro 5). Rester en v5.
- 🟡 **`audit-md/section-*.md`** : anciens noms de thème (dette doc, hors build).
- 🟢 Routage Tailscale `:8444` (PWA de dev) pointe sur le mauvais port — sans impact (danphu.com direct).

## Repères

- **Déploiement** : push sur `main` → GitHub Actions → GitHub Pages. DNS chez IONOS, `public/CNAME` = danphu.com.
- **Dernier commit :** `9f621ca` (total de textes affichés sur la ligne titre de l'outil de relecture).
