# Portfolio de Zoltan Babko

Portfolio multi-pages de Zoltan Babko, développeur web freelance à Paris et étudiant en 4e année à Epitech.

## Pages

- `index.html` : accueil et sélecteur de besoin freelance.
- `a-propos.html` : profil, repères et compétences.
- `parcours.html` : expériences et formation avec onglets.
- `projets.html` : projets avec filtres par catégorie.
- `contact.html` : formulaire qui prépare un email sans stocker de données.

## Contenu et langues

Les textes français et anglais sont dans `js/content.json`. Le fichier est chargé par `js/app.js` et le choix de langue est conservé dans le navigateur.

Pour modifier un texte, il suffit de changer la valeur correspondante dans `content.json` pour `fr` et `en`.

## Stack

- HTML5 sémantique
- CSS3 avec une interface modulaire sombre, une grille technique et des accents violet/cyan
- JavaScript vanilla
- Données bilingues en JSON
- Assets statiques déployés avec Cloudflare

## Lancer en local

```bash
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

Pour utiliser l'environnement Cloudflare :

```bash
npx wrangler dev
```

## Contact

- Email : zoltan.babko@epitech.eu
- LinkedIn : https://www.linkedin.com/in/zoltan-babko/
- GitHub : https://github.com/zoltanbabko
