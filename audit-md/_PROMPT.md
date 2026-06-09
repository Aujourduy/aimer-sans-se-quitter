# Prompt — Export des pages en Markdown pour relecture éditoriale

Prompt réutilisable pour régénérer les fichiers d'audit copywriting à partir du
site. À relancer après chaque modification importante des pages fixes.

> ℹ️ La page **Écrits** (`/textes`) n'est volontairement **pas** traitée ici :
> ses contenus existent déjà sous forme de `.md` dans `src/content/textes/`.

---

Analyse le site local et exporte chaque page principale en markdown propre pour relecture éditoriale.

Pages à traiter :
- Accueil
- À propos
- Accompagnement
- Conversation exploratoire

Pour chaque page, crée un fichier .md séparé dans le dossier `/audit-md`.

Contraintes :
- Garde le menu/navigation uniquement dans le fichier accueil.md.
- Pour les autres pages, ne garde pas le menu sauf s’il contient un élément différent.
- Supprime le CSS, les classes, les scripts, les imports, les composants techniques.
- Conserve la structure éditoriale : titres, sous-titres, paragraphes, boutons, liens internes, CTA.
- Indique les boutons sous cette forme :
  CTA : [texte du bouton] → [destination]
- Indique les liens texte sous cette forme :
  Lien : [texte] → [destination]
- Ne réécris pas le contenu.
- Ne corrige pas le style.
- Ne résume pas.
- Garde les accents et la ponctuation d’origine.

Format attendu pour chaque fichier :

```
# Nom de la page

Objectif de la page :
Public visé :
Action souhaitée :
Doute principal de la lectrice :

## Navigation
...

## Section : Hero
...

## Section : ...
...
```

À la fin de chaque fichier, ajoute :

```
## Inventaire des CTA
- ...
```
