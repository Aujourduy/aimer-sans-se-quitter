#!/usr/bin/env bash
# Pousse docs/etat-projet.md vers le Gist secret lu par claude.ai.
# Le repo étant privé, ce gist est le seul moyen pour claude.ai de connaître
# l'état du projet. À lancer après chaque mise à jour de docs/etat-projet.md
# (idéalement avant un commit significatif).
#
# Usage : ./bin/sync-gist.sh
set -euo pipefail

GIST_ID="273af1d2a61f635c61a5db3df192a437"
ROOT="$(git rev-parse --show-toplevel)"
FILE="$ROOT/docs/etat-projet.md"

[ -f "$FILE" ] || { echo "✗ $FILE introuvable"; exit 1; }

gh gist edit "$GIST_ID" -f etat-projet.md "$FILE"
echo "✓ Gist synchronisé : https://gist.github.com/Aujourduy/$GIST_ID"
