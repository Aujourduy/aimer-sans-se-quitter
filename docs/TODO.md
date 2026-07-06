# TODO technique — Aimer sans se quitter

Tâches techniques en attente (≠ `content/sujets-todo.json` qui liste les sujets de textes à écrire).

## À faire

- [ ] **Pousser le commit CI de résilience du déploiement** (`1e1985f` — retry + timeout sur GitHub Pages).
  Bloqué : le token `gh` n'a pas le scope `workflow`, donc le push d'un fichier `.github/workflows/` est refusé.
  Débloquer : `gh auth refresh -h github.com -s workflow` (aller au bout de l'autorisation navigateur : entrer le code sur https://github.com/login/device + « Authorize »), vérifier `gh auth status` (scope `workflow` présent), puis `git push origin main`.
  Effet attendu : plus de mails d'erreur après push (les échecs transitoires « Deployment failed, try again later » sont retentés 3 fois).

## Idées / à voir plus tard

- [ ] Routage Tailscale : `:8444` (PWA danphu de dev) pointe vers `:4321` au lieu de `:4322`, et rien n'écoute ces ports. Sans impact (danphu.com est utilisé directement) mais la PWA de dev sur tél est morte. Corriger si encore utile.
