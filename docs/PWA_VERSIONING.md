# PWA Versioning — Mise à jour automatique sur mobile

## Comment ça marche

À chaque build Astro, la version du `package.json` s'injecte dans `manifest.webmanifest`.
Le client (mobile) télécharge le manifest toutes les 30 secondes et recharge la page si la version a changé.

## À faire avant chaque push significatif

Bump la version dans `package.json` (format `X.Y.Z`) :

```bash
# Avant de commit/push
npm version patch    # 0.1.0 → 0.1.1
# ou
npm version minor    # 0.1.0 → 0.2.0
# ou éditer manuellement : "version": "0.2.0"
```

Puis build et commit normalement :

```bash
npm run build
git add -A
git commit -m "..."
git push
```

## Flow utilisateur

1. **Mobile a l'ancienne version** (0.1.0)
2. **Tu pushes avec version 0.1.1** → GitHub Pages le déploie
3. **Client recharge la page** → télécharge le nouveau manifest.webmanifest
4. **Version 0.1.1 ≠ 0.1.0** → `location.reload()` force le rafraîchissement
5. **PWA mise à jour** ✅

## Notes

- **Silencieux** : pas de popup, pas de dérangement. La page recharge en arrière-plan.
- **Session Storage** : la version est vérifiée dans `sessionStorage`, donc une fermeture/réouverture de l'onglet suffit si la vérification n'a pas yet eu lieu.
- **Offline** : si pas de réseau, on skip le check (essaye toutes les 30s)
- **Dev** : le build de relecture (`INCLUDE_DRAFTS=true`) a son propre versioning (distinct)

## Quand bump ?

- ✅ Bug fix, nouvelle feature, contenu modifié
- ❌ Typos ou changements invisibles au user ? Optionnel (pas grave)
- ❌ Avant chaque test local (seulement avant push prod)
