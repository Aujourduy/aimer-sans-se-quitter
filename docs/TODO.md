# TODO technique — Aimer sans se quitter

Tâches techniques en attente (≠ `content/sujets-todo.json` qui liste les sujets de textes à écrire).

## À faire

_(rien pour l'instant)_

## Fait

- [x] **Résilience du déploiement GitHub Pages** (retry ×3 + timeout) — poussé le 2026-07-06 (commit `803a82f`). Le token `gh` a désormais le scope `workflow`. Les échecs transitoires « Deployment failed, try again later » sont retentés automatiquement → plus de mails d'erreur.

## Idées / à voir plus tard

- [ ] Routage Tailscale : `:8444` (PWA danphu de dev) pointe vers `:4321` au lieu de `:4322`, et rien n'écoute ces ports. Sans impact (danphu.com est utilisé directement) mais la PWA de dev sur tél est morte. Corriger si encore utile.
