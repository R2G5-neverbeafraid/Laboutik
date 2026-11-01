# LA BOUTIQUE — brief pour Claude Code

Site vitrine + catalogue de LA BOUTIQUE : vêtements importés de Chine (Pinduoduo / 1688 / Taobao), vendus à Kinshasa (RDC).
Porteur du projet : RG (Rahel Lukunku), étudiant en L1 Informatique à l'UPC. Projets signés « 25 (TwentyFive) Labs » / 25 Corporations.

Ce fichier est la source de vérité partagée entre la conversation claude.ai (Projet « LA BOUTIQUE ») et Claude Code. Mets-le à jour quand une décision change.

---

## 1. Objectif du site

- Montrer le catalogue (photos, prix en USD, tailles, couleurs).
- Faire commander le client **via WhatsApp** (bouton qui ouvre un message pré-rempli avec l'article, la taille et la couleur). Pas de paiement en ligne pour la v1.
- Mettre en avant les **drops / pré-commandes** (arrivages groupés depuis la Chine).
- Inspirer confiance : prix clairs, délais d'arrivage, livraison à Kinshasa, contact.

Public : jeunes de Kinshasa, consultation surtout **sur téléphone**, souvent avec une connexion lente → site léger et rapide.

## 2. Positionnement et ton

- « Au milieu » : moins cher que Kin Sport / Josk / g.j_store1 (ensembles à 80–90 $), plus soigné que l'entrée de gamme.
- Style visuel **épuré mais classe**. Le logo officiel est celui généré sur Canva → à placer dans `assets/img/logo.*` (RG le fournit).
- **Positionnement premium (décision RG)** : on ne met plus en avant « sans logo ». Le site propose des vêtements et accessoires de qualité, et le catalogue accueillera aussi des **articles de marque** (Nike, Adidas, Chrome Hearts…). **Uniquement des produits authentiques : aucune contrefaçon ni copie.** Les marques ne figurent pas dans le slogan ni les titres de pages ; elles apparaissent dans les fiches produits concernées.
- Langue du site : français.

## 3. Grille de prix (USD) — décidée par RG

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

Source : `Plan_achat_vetements_Chine.xlsx` (fichier du Projet claude.ai). Articles de départ (sans marque) :

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
Photos : RG fournit ses propres photos (pas d'images de concurrents ni de photos de vendeurs chinois avec logos). En attendant, utiliser des placeholders neutres.

## 5. Structure du code (règle impérative de RG)

**Jamais tout dans un seul `index.html`.** Fichiers séparés et organisés, commités dans un ordre logique.

```
la-boutique/
├── index.html            # accueil : hero, drop en cours, catégories, avis, contact
├── catalogue.html        # grille produits + filtres par catégorie
├── produit.html          # fiche produit (lit ?id= dans l'URL)
├── a-propos.html         # comment ça marche : pré-commande, délais, livraison
├── css/
│   ├── variables.css     # couleurs, polices, espacements (tokens)
│   ├── base.css          # reset + typographie
│   ├── layout.css        # header, footer, grilles
│   └── components.css    # cartes produit, boutons, badges, filtres
├── js/
│   ├── data.js           # chargement de data/produits.json
│   ├── catalogue.js      # affichage + filtres
│   ├── produit.js        # fiche produit, choix taille/couleur
│   ├── whatsapp.js       # construction du lien wa.me pré-rempli
│   └── main.js           # menu mobile, éléments communs
├── data/
│   ├── produits.json     # id, nom, catégorie, prix, couleurs, tailles, photos, statut (dispo / précommande / épuisé)
│   └── config.json       # numéro WhatsApp, nom de la boutique, liens réseaux, drop en cours
├── assets/img/           # logo, photos produits (WebP compressées)
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

## 7. Points encore ouverts (à demander à RG)

- Numéro WhatsApp de la boutique et liens Instagram / TikTok.
- Nom exact affiché sur le site (« LA BOUTIQUE » ou autre) et fichier du logo Canva.
- Pack hoodie + jogging : 69 $ ou 72 $.
- Frais et zones de livraison à Kinshasa.
- Délai annoncé pour les pré-commandes (dépend du transitaire, hypothèses de coûts encore à confirmer par devis).
- Nom du dépôt GitHub.
