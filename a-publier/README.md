# À publier — dossier de travail

Boîte de dépôt entre **Duy** et l'assistant. **Ne fait pas partie du site
publié** : Astro ne construit que `src/`, donc rien ici n'apparaît sur le site
en ligne.

## Que mettre où

- **`consignes/`** — les consignes / briefs venant de claude.ai
  (fichiers `.md`, `.txt`, notes, captures…).
- **`textes/`** — les textes à publier (brouillons), **un fichier par texte**.
  L'assistant les reprend, les met en forme et les place dans
  `src/content/textes/` avec le bon en-tête (titre, `excerpt`, `category`,
  `order`).

## Comment ça marche

1. Tu déposes un fichier ici (sur github.com → **Add file**, ou en me
   l'envoyant directement dans la conversation).
2. Tu me dis simplement : « traite le dossier à-publier » (ou tel fichier
   précis).
3. Je transforme, je publie dans `src/`, et je te confirme — puis on peut
   archiver ou supprimer le brouillon ici.

> ⚠️ **Visibilité.** Le dépôt étant public (nécessaire pour GitHub Pages
> gratuit), le contenu de ce dossier est visible sur GitHub — mais **pas** sur
> le site web. Pour un brouillon que tu ne veux pas rendre visible, ne le mets
> pas ici : envoie-le-moi directement dans la conversation.
