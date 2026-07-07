# TODO technique — Aimer sans se quitter

Tâches techniques en attente (≠ `content/sujets-todo.json` qui liste les sujets de textes à écrire).

## À faire

- [ ] **Mise à jour Astro (5 → 7) bloquée par la PWA.** `@vite-pwa/astro` en est
  resté à `1.2.0`, compatible Astro `≤5` uniquement (aucune version ne supporte
  Astro 6/7). Passer à Astro 7 casserait la PWA installable de l'outil de
  relecture. → Rester en Astro 5.x tant que le plugin PWA ne suit pas ; revérifier
  `npm info @vite-pwa/astro peerDependencies` de temps en temps.
- [ ] **Fichiers `audit-md/section-*.md`** portent les anciens noms de thème
  (amour-presence, desir-verite, peur-masque, fables-paradoxes, desir-intimite).
  À renommer/retravailler si l'audit copywriting reprend. Sans impact (hors build).

## Fait

- [x] **Résilience du déploiement GitHub Pages** (retry ×3 + timeout) — poussé le 2026-07-06 (commit `803a82f`). Le token `gh` a désormais le scope `workflow`. Les échecs transitoires « Deployment failed, try again later » sont retentés automatiquement → plus de mails d'erreur.

## Idées / à voir plus tard

- [ ] Routage Tailscale : `:8444` (PWA danphu de dev) pointe vers `:4321` au lieu de `:4322`, et rien n'écoute ces ports. Sans impact (danphu.com est utilisé directement) mais la PWA de dev sur tél est morte. Corriger si encore utile.
