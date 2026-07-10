#!/usr/bin/env bash
# Stop hook Claude Code : rappelle de documenter le README quand un tour a modifié
# la MÉCANIQUE du projet sans toucher README.md.
#
# Déclenché à la fin de chaque tour de Claude (event Stop). Compare le working
# tree (fichiers modifiés non encore commités : staged + non-staged) à HEAD.
# Si des fichiers structurels ont bougé mais pas README.md → exit 2 : le message
# sur stderr est réinjecté à Claude comme feedback, pour qu'il documente ou
# justifie l'omission avant de rendre la main.
#
# Non destructif : n'écrit rien, ne bloque aucun commit. Rappel seulement.
# Le README est la mémoire longue entre sessions ; un changement de mécanique
# non documenté se perd d'une session à l'autre.

set -euo pipefail

# Se placer à la racine du dépôt (le hook peut être lancé depuis ailleurs).
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$ROOT"

# Fichiers modifiés non commités (staged + working tree, ajouts/suppressions/renommages).
CHANGED="$(git status --porcelain 2>/dev/null | sed 's/^...//')" || exit 0
[ -z "$CHANGED" ] && exit 0

# Fichiers « structurels » = la mécanique du projet.
STRUCTUREL="$(printf '%s\n' "$CHANGED" | grep -E '^(src/content\.config\.ts|scripts/.*\.(mjs|sh)|\.githooks/[^/]+|astro\.config\.mjs|package\.json)$' || true)"
[ -z "$STRUCTUREL" ] && exit 0

# README touché dans le même lot ? Alors rien à signaler.
if printf '%s\n' "$CHANGED" | grep -qE '^README\.md$'; then
  exit 0
fi

# Fichiers structurels modifiés sans README → rappel (exit 2 = feedback à Claude).
{
  echo "Rappel README (Stop hook) : ce tour a modifié la mécanique du projet sans toucher README.md :"
  printf '  - %s\n' $STRUCTUREL
  echo "Si un futur toi (ou l'auteur) a besoin de connaître ce changement, ajoute une note au README.md."
  echo "Sinon, indique brièvement pourquoi ce n'est pas nécessaire, puis rends la main."
} >&2
exit 2
