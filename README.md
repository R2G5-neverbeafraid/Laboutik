# LA BOUTIQUE

Site vitrine + catalogue de LA BOUTIQUE : vêtements et accessoires, vendus à Kinshasa. Commande via WhatsApp.
HTML + CSS + JavaScript vanilla, sans build. Brief complet : [CLAUDE.md](CLAUDE.md).

## Lancer en local

Les données sont chargées avec `fetch`, il faut donc un petit serveur (pas d'ouverture directe du fichier) :

```bash
python3 -m http.server 8000
```

Puis ouvrir <http://localhost:8000>.

## Modifier le contenu (sans toucher au code)

- **Prix, tailles, couleurs, statut, photos** : `data/produits.json`
  (statut : `dispo`, `precommande` ou `epuise`).
- **Numéro WhatsApp, réseaux, drop en cours, délais, livraison, avis** : `data/config.json`
  (`whatsapp` au format international sans `+`, ex. `243812345678`).
- **Logo** : déposer le fichier dans `assets/img/` et renseigner `logo` dans `config.json`.
- **Photos** : déposer les images dans `assets/img/produits/`, en WebP compressé (portrait 4:5, environ 800×1000, moins de 150 Ko).
  Nom conseillé : `<id-du-produit>-1.webp`, `<id-du-produit>-2.webp`… (ex. `vet-001-1.webp`).
  Puis lister les chemins dans `photos` du produit, dans `data/produits.json` :
  `"photos": ["assets/img/produits/vet-001-1.webp", "assets/img/produits/vet-001-2.webp"]`.
  La première photo est celle de la carte ; les suivantes apparaissent en vignettes sur la fiche.
  Pour lier une photo à une couleur, écrire `{ "src": "assets/img/produits/vet-011-1.webp", "couleur": "Noir" }` au lieu du simple chemin : quand le client choisit « Noir », cette photo s'affiche.
- **Catégories et types** : listes `categories` et `types` dans `data/config.json` (pas de séparation en gammes : tous les articles sont mélangés).
  Chaque catégorie liste ses propres `types` (ex. Couvre-chef : bonnet, skull-cap, casquette). `"toujours_visible": true` affiche la catégorie même sans article ; sinon elle apparaît dès qu'un article la contient.
  Sur chaque article (`data/produits.json`) : `categorie` et `type` doivent correspondre à ces listes.

La section « Avis clients » de l'accueil reste masquée tant que `avis` est vide : n'y mettre que de vrais avis.

## Structure

```
index.html · catalogue.html · produit.html · a-propos.html · 404.html
css/   variables, base, layout, components
js/    data, whatsapp, main (commun), catalogue, produit, accueil, a-propos
data/  produits.json, config.json
assets/img/
```

## Mise en ligne (GitHub Pages)

Pousser sur GitHub, puis Settings → Pages → Deploy from a branch → `main` / racine.
