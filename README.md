# LA BOUTIQUE

Site vitrine + catalogue de LA BOUTIQUE : vêtements importés de Chine, vendus à Kinshasa. Commande via WhatsApp.
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
- **Photos** : WebP compressées dans `assets/img/`, puis les lister dans `photos` du produit (4:5 recommandé, ~800×1000).

La section « Avis clients » de l'accueil reste masquée tant que `avis` est vide : n'y mettre que de vrais avis.

## Structure

```
index.html · catalogue.html · produit.html · a-propos.html
css/   variables, base, layout, components
js/    data, whatsapp, main (commun), catalogue, produit, accueil, a-propos
data/  produits.json, config.json
assets/img/
```

## Mise en ligne (GitHub Pages)

Pousser sur GitHub, puis Settings → Pages → Deploy from a branch → `main` / racine.
