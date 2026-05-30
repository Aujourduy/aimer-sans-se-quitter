# Aimer sans se quitter

Site d'auteur sobre construit avec [Astro](https://astro.build), contenu en
markdown, sortie 100 % statique. L'auteur ajoute ses textes en déposant un
fichier `.md` dans `src/content/textes/` — sans toucher à la mise en page.

## Développer en local

```bash
npm install      # une seule fois
npm run dev      # http://localhost:4321
npm run build    # construit dans dist/
npm run preview  # prévisualise le build
```

## Ajouter un texte

Créez un fichier `.md` dans `src/content/textes/`. Le nom du fichier devient
l'adresse de la page. Exemple :

```md
---
title: "Le titre du texte"
excerpt: "Une ligne, affichée sur la carte."
category: "amour-presence"   # ou desir-verite, peur-masque, fables-paradoxes
order: 2
# entry: true                  # (optionnel) met le texte en avant
# entryRole: "reconnaissance"  # si entry: true → reconnaissance|deplacement|mecanisme
# draft: true                  # (optionnel) masque le texte en production
---

Le corps du texte, en markdown.
```

| `category`         | Affiché             |
| ------------------ | ------------------- |
| `amour-presence`   | Amour et présence   |
| `desir-verite`     | Désir et vérité     |
| `peur-masque`      | Peur et masque      |
| `fables-paradoxes` | Fables et paradoxes |

## Ajouter le portrait

Les pages « À propos » et « Conversation exploratoire » affichent un
placeholder crème. Pour une vraie photo : placez l'image dans
`src/assets/portrait.jpg`, puis dans `src/pages/a-propos.astro` remplacez le
bloc `<div class="portrait">…</div>` par un composant `<Image>` d'Astro.

## Calendly

La page « Conversation exploratoire » renvoie vers Calendly via la constante
`CALENDLY_URL`, en haut de `src/pages/conversation-exploratoire.astro`.
Remplacez `https://calendly.com/REMPLACER` par votre vrai lien. Configurez les
questions d'invité dans Calendly (pas de formulaire sur le site) :

- Qu'est-ce qui vous amène ?
- Qu'avez-vous déjà compris ou essayé ?
- Qu'aimeriez-vous ne plus répéter ?
- _Le cadre est de quatre mois, au tarif de 6 000 euros. Si la conversation
  confirme que le travail est juste, cette décision est-elle envisageable ?_

## Déploiement — GitHub Pages (automatique)

Le workflow `.github/workflows/deploy.yml` reconstruit et publie le site à
chaque push sur `main`.

**Étape unique à faire une fois :** Settings → Pages → Build and deployment →
Source → **« GitHub Actions »**.

Le site sera publié sur : **https://aujourduy.github.io/aimer-sans-se-quitter/**

### Domaine personnalisé

1. dans `astro.config.mjs` : `site: 'https://votre-domaine.fr'` et `base: '/'` ;
2. ajoutez `public/CNAME` contenant votre domaine ;
3. Settings → Pages → Custom domain.

### Autres hébergeurs

`npm run build` produit `dist/`, déployable tel quel sur Netlify, Vercel ou
un serveur Nginx (pensez à remettre `base: '/'` pour un déploiement à la
racine du domaine).
