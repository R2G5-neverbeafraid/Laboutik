# LA BOUTIK — brief pour Claude Code

Site vitrine + catalogue de LA BOUTIK (anciennement LA BOUTIQUE), à Kinshasa (RDC) : vêtements, accessoires, puis parfums et d'autres catégories au fur et à mesure.

**Mot d'ordre : « Des vêtements et des accessoires de qualité pour tous. »**

Porteur du projet : RG (Rahel Lukunku), étudiant en L1 Informatique à l'UPC. Projets signés « 25 (TwentyFive) Labs » / 25 Corporations.

Ce fichier est la source de vérité partagée entre la conversation claude.ai (Projet « LA BOUTIQUE ») et Claude Code. Mets-le à jour quand une décision change.

---

## 1. Objectif du site

- Montrer le catalogue (photos, prix en USD, tailles, couleurs).
- Faire commander le client **via WhatsApp** (bouton qui ouvre un message pré-rempli avec l'article, la taille et la couleur). Pas de paiement en ligne pour la v1.
- Mettre en avant les **drops / pré-commandes** (arrivages groupés).
- Inspirer confiance : prix clairs, délais d'arrivage, livraison à Kinshasa, contact.

Public : jeunes de Kinshasa (12–30 ans), consultation surtout **sur téléphone**, souvent avec une connexion lente → site léger et rapide.

## 2. Positionnement et ton

- « Au milieu » : moins cher que Kin Sport / Josk / g.j_store1 (ensembles à 80–90 $), plus soigné que l'entrée de gamme.
- **Nom du site : LA BOUTIK** (décision RG, novembre 2026 ; l'ancien nom était LA BOUTIQUE). Le **logo** : le cercle (monogramme) affiche « (K) », le K entre parenthèses, à la place de « LB » ; le texte à côté reste « LA BOUTIK ». Mêmes couleurs et mêmes polices (Saira pour le logo). Dans la config : `nom` = « LA BOUTIK » (titres, texte du logo, messages WhatsApp, pied de page), `logo_monogramme` = « (K) » (texte du cercle ; l'icône d'onglet `favicon.svg` affiche aussi « (K) »). Les anciens fichiers de suivi gardent leur nom `LA_BOUTIQUE_*.docx` / `.xlsx`. Photos de profil des réseaux sociaux (1080×1080, cercle à 78 % pour le recadrage en rond) : `assets/img/logo-k-clair.png` (fond blanc cassé, anneau olive) et `assets/img/logo-k-sombre.png` (fond noir encre, anneau olive clair). Le fichier design (artefact claude.ai « LA BOUTIK — Identité visuelle ») a été mis à jour avec le nom et le (K) le 7 novembre 2026.
- Style visuel **épuré mais classe**. Le logo officiel est celui généré sur Canva : original dans `assets/img/logo-canva.png` ; le site affiche sa version « en ligne » (monogramme (K) dans un cercle + nom en Saira, voir `main.js`). Pour utiliser un autre fichier, renseigner `logo` dans `data/config.json`.
- **Identité visuelle** : définie dans l'artefact claude.ai « LA BOUTIQUE — Identité visuelle » (https://claude.ai/artifact/Vm4SuFaCyg9HLWb2Vpfs3R), reprise dans `css/variables.css`. Couleurs : noir encre `#0E0E0E`, blanc cassé `#F4F4F1`, gris pierre `#9A9A95`, accent unique olive `#5B6340` (`#A9B37E` sur fond noir). Polices (hébergées dans `assets/fonts/`) : Archivo (titres/texte), IBM Plex Mono (prix, détails), Saira (logo). Si l'artefact change, mettre à jour `variables.css`.
- **Pas de gammes séparées** (décision RG) : tous les articles sont mélangés dans le même catalogue, sans section « premium / non premium ». Seuls les prix diffèrent. Le champ `marque` des articles reste disponible (vide par défaut).
- Catégories : **Vêtements**, **Accessoires**, **Couvre-chef** (casquettes, skull caps, bonnets…), puis **Parfums** et d'autres plus tard (les skull caps sont en Couvre-chef, pas en Accessoires). Types par catégorie (filtres du catalogue) : Vêtements = jogging, hoodie, veste, haut, ensemble ; Couvre-chef = bonnet, skull cap, casquette ; Accessoires = à définir. Pas de type « enfant » ni « bonnet » dans Vêtements. Accessoires et Couvre-chef sont affichés même vides (`toujours_visible`). → le site doit permettre d'ajouter une catégorie ou un type sans toucher au code (listes dans `data/config.json`).
- Langue du site : français.
- **Bandeau noir du haut** : texte dans `annonce` (`data/config.json`), à actualiser à chaque drop/nouveauté. Pour l'instant : « Pré-commandes ouvertes sur WhatsApp » (les pré-commandes sur le site viendront plus tard).
- **Provenance** : ne jamais préciser sur le site d'où viennent les vêtements (pas de « Chine », « importé », etc.).
- **Pied de page** : « © année LA BOUTIK · Site powered by © 25 Labs » (pas de mention des prix).
- **Kinshasa** : affiché seulement au-dessus du titre de l'accueil et dans « Livraison partout à Kinshasa. » (à l'essai, le temps d'ajouter d'autres villes). Pas ailleurs dans les textes du site.

## 3. Prix (USD)

**RG fixe lui-même les prix finaux**, y compris ceux d'éventuels articles de marque. La grille ci-dessous est l'estimation de départ.

| Article | Prix |
|---|---|
| Skull cap / bonnet | 12 |
| T-shirt épais | 25 |
| Polo maille zippé | 29 |
| Jogging | 35 |
| Zip hoodie uni | 42 |
| Pull / maille | 45 |
| Veste rétro brodée | 45 |
| Hoodie délavé / brodé | 50 |
| Coupe-vent | 59 |
| Softshell | 59 |
| Ensemble complet | 75 |
| Pack zip hoodie + jogging | 69 (ou 72, à trancher) |

Règle : marge ≥ 40 % du prix de vente. Pas de promo qui descend sous 40 % → offrir plutôt un cadeau (ex. skull cap offert).
Les prix vivent dans **un seul fichier de données** (voir §5) pour être modifiés sans toucher au code.

## 4. Catalogue de départ

Source : liste d'articles de RG (codes VET-001…VET-057, ACC-001…ACC-005, COU-001…COU-003, prix d'achat et fournisseurs en privé dans `interne/`, **jamais publiés** : dossier ignoré par git). Catalogue mélangé :

1. Jogging molleton ample (gris, noir, marine…)
2. Zip hoodie molleton assorti au jogging
3. Veste rétro col montant brodée (noir / blanc)
4. Pull rayé manches longues oversize
5. Skull cap / bonnet fin brodé
6. Skull cap camouflage pixel
7. Polo maille zippé côtelé
8. Hoodie à capuche doublée satin
9. Veste coupe-vent bicolore à capuche
10. Veste softshell imperméable à capuche
11. Ensemble survêtement « air layer » (veste + pantalon)
12. Maillot style foot rétro (design perso)

Ajouts prévus dans la version à 20 articles : zip hoodie épais, coupe-vent color-block, pantalon running, doudoune légère, jogging tech fleece, sweat poche manche, veste coupe-pluie foot, ensemble « Torom ».
Catégorie Accessoires : articles et prix à venir, fournis par RG.
Photos : RG fournit ses propres photos (pas d'images reprises aux concurrents). En attendant, utiliser des placeholders neutres.

**Articles de marque (à venir, décision RG)** : ils seront mélangés aux autres dans la catégorie Vêtements (ou la catégorie qui convient), sans section séparée ; seuls les prix diffèrent. **Fonctionnement (décision RG)** : ce sont des **précommandes** : le client paie, puis RG achète l'article chez un revendeur officiel (ex. Courir en France) et le livre. Les fiches affichent la marque, « Prix à confirmer » tant que RG n'a pas fixé le prix, et la mention « acheté auprès d'un revendeur officiel après ta commande ». Photos : officielles, à fournir par RG (pas les captures d'annonces d'autres vendeurs). Les articles sans logo « inspirés de marque » gardent un nom neutre (ex. « Jogging molleton technique fuselé », pas « tech fleece »).

**Précisions de RG** : VET-050 = vieux maillot Espagne, collab Travis Scott ; VET-037 = pull Polo Ralph Lauren ; VET-039 = jogger complet On. Pas encore sur le site : VET-034 (maillots de clubs, trop vague), VET-036 (articles Ami, modèle inconnu), VET-048 (ensemble « Torom », produit d'un concurrent à 200 $).

**Règles du catalogue** : articles sans marque **et** articles de marque (en pré-commande, voir ci-dessus), mélangés. Pas d'articles marqués comme copies, de baskets, de photos de personnes ni de captures avec icônes d'appli. Les modèles identiques en plusieurs couleurs forment **un seul article** avec des pastilles de couleur et une photo par coloris. Articles sans prix : « Prix à confirmer » (aujourd'hui tous ont un prix). Couleurs « à confirmer » : champ `couleurs` vide (la fiche ne demande pas de couleur). État au moment de ce changement de nom : 160 articles ; 16 sans photo (affichés « Photo à venir »).

## 5. Structure du code (règle impérative de RG)

**Jamais tout dans un seul `index.html`.** Fichiers séparés et organisés, commités dans un ordre logique.

```
la-boutique/
├── index.html            # accueil : hero, drop en cours, catégories, avis, contact
├── catalogue.html        # grille produits + filtres par catégorie et type
├── produit.html          # fiche produit (lit ?id= dans l'URL)
├── a-propos.html         # comment ça marche : pré-commande, délais, livraison
├── favoris.html          # articles aimés (cœur)
├── panier.html           # panier : quantités, total, commande groupée WhatsApp
├── 404.html
├── css/
│   ├── variables.css     # couleurs, polices, espacements (tokens)
│   ├── base.css          # reset + typographie
│   ├── layout.css        # header, footer, grilles
│   └── components.css    # cartes produit, boutons, badges, filtres
├── js/
│   ├── data.js           # chargement de data/produits.json
│   ├── catalogue.js      # affichage + filtres
│   ├── produit.js        # fiche produit, choix taille/couleur
│   ├── whatsapp.js       # construction du lien wa.me pré-rempli (article seul ou panier)
│   ├── stockage.js       # favoris et panier (localStorage)
│   ├── favoris.js        # page favoris
│   ├── panier.js         # page panier
│   └── main.js           # en-tête (logo, recherche, cœur, panier), pied de page, cartes, retour à la position
├── data/
│   ├── produits.json     # id, nom, catégorie (vêtements / accessoires / couvre-chef / parfums…), type, marque, prix, couleurs, tailles, photos, statut (dispo / précommande / épuisé)
│   └── config.json       # numéro WhatsApp, nom de la boutique, liens réseaux, drop en cours, listes des catégories et types
├── assets/img/           # logo, photos produits (WebP compressées)
├── outils/               # maj_inventaires.py + inventaire.js : régénère l'inventaire Word et le fichier des prix (interne/)
├── interne/              # PRIVÉ, ignoré par git : inventaire, prix, listes à compléter, images reçues
├── README.md
└── CLAUDE.md
```

Stack : HTML + CSS + JavaScript vanilla, sans framework ni build. Hébergement **GitHub Pages**.

Ordre de commits suggéré :
1. structure + `CLAUDE.md` + `README.md`
2. `variables.css` + `base.css` + `layout.css` (header / footer)
3. `data/produits.json` + `data/config.json`
4. page catalogue (`catalogue.html` + `data.js` + `catalogue.js` + `components.css`)
5. fiche produit + `whatsapp.js`
6. page d'accueil
7. page « comment ça marche »
8. optimisation mobile, images, mise en ligne GitHub Pages

## 6. Exigences techniques

- Mobile-first. Tester à 360 px de large.
- Pages légères : images WebP, `loading="lazy"`, pas de grosse librairie.
- Accessibilité de base : contrastes suffisants, `alt` sur les images, boutons utilisables au clavier.
- Prix toujours affichés en **$**.
- Lien WhatsApp : `https://wa.me/<numéro>?text=<message encodé>` ; le message reprend le nom de l'article, la taille, la couleur et le prix.

## 6 bis. Suivi du catalogue : mise à jour des deux fichiers (règle impérative de RG)

**Après CHAQUE modification du catalogue** (ajout, suppression, fusion, changement de prix, de nom, de photo, de coloris ou d'ordre dans `data/produits.json`), il faut :
1. lancer `python3 outils/maj_inventaires.py` ; il régénère, dans `interne/` (dossier non publié) :
   - `LA_BOUTIQUE_inventaire.docx` : inventaire des articles du site (photos, détails, case prix) ;
   - `LA_BOUTIQUE_prix.xlsx` : prix de chaque article **classés par marque** (+ feuille « Résumé par marque ») ; après le script, recalculer avec le script `recalc.py` du skill xlsx si disponible ;
2. envoyer ces deux fichiers à RG dans la conversation (SendUserFile) ;
3. republier l'Artifact de test si le site a changé.
Les prix saisis par RG dans l'inventaire sont la référence : ils sont déjà dans `data/produits.json` (tous les articles ont un prix). Un article co-signé (« Nike × Syna World ») est classé sous sa première marque dans le fichier des prix ; l'ordre du catalogue place en tête le Polo Ralph Lauren gris, le Tech Fleece Nike, le Tech Fleece NOCTA bleu ciel et la casquette Yankees « Historic Champs ».

## 6 ter. Favoris et panier (demande de RG)

Cœur « j'aime » sur chaque carte et chaque fiche, page `favoris.html`; bouton « Ajouter au panier » sur la fiche, page `panier.html` (quantités, total, commande groupée sur WhatsApp, pas de paiement en ligne). Icônes cœur et panier avec compteur dans l'en-tête. Tout est stocké dans le navigateur (`js/stockage.js`). Ces fonctions ne changent pas le catalogue : pas de mise à jour de l'inventaire nécessaire.

## 7. Points encore ouverts (à demander à RG)

- Numéro WhatsApp de la boutique et liens Instagram / TikTok.
- Fichier du logo Canva à jour avec le nouveau nom et le « (K) ». Le site affiche déjà ce logo en texte.
- Liste et prix des articles de la catégorie Accessoires.
- Pack hoodie + jogging : 69 $ ou 72 $.
- Frais et zones de livraison à Kinshasa.
- Délai annoncé pour les pré-commandes (dépend du transitaire, coûts encore à confirmer par devis).
- Nom du dépôt GitHub.
