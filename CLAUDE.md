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
- **Nom du site : LA BOUTIK** (décision RG, novembre 2026 ; l'ancien nom était LA BOUTIQUE). Le **logo** : le cercle (monogramme) affiche « (K) », le K entre parenthèses, à la place de « LB » ; le texte à côté reste « LA BOUTIK ». Mêmes couleurs et mêmes polices (Saira pour le logo). Dans la config : `nom` = « LA BOUTIK » (titres, texte du logo, messages WhatsApp, pied de page), `logo_monogramme` = « (K) » (texte du cercle ; l'icône d'onglet `favicon.svg` affiche aussi « (K) »). Les anciens fichiers de suivi gardent leur nom `LA_BOUTIQUE_*.docx` / `.xlsx`. Photos de profil des réseaux sociaux (1080×1080, cercle à 78 % pour le recadrage en rond) : `assets/img/logo-k-clair.png` (fond blanc cassé, anneau olive) et `assets/img/logo-k-sombre.png` (fond noir encre, anneau olive clair). Bannières des réseaux (dossier `assets/img/bannieres/`, fond noir encre, logo (K) + LA BOUTIK + slogan + KINSHASA, bloc central dans la zone sûre) : Facebook 1640×624, X 1500×500, YouTube 2560×1440. Le fichier design (artefact claude.ai « LA BOUTIK — Identité visuelle ») a été mis à jour avec le nom et le (K) le 7 novembre 2026.
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
├── a-propos.html         # comment ça marche : pré-commande, délais, grille de livraison, échange/retour, paiement
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
│   ├── livraison.js      # formulaire d'adresse (commune, quartier, avenue, repère, nom)
│   ├── commande.js       # fenêtre « Finaliser ta commande » (récap + adresse + Annuler / Confirmer)
│   ├── toast.js          # notifications (toasts) : toast(message, { action, duree, type })
│   ├── etat-vide.js      # composant « état vide » (icône, titre, texte, boutons)
│   ├── dom.js            # el() (création d'éléments) et icone() (icônes SVG)
│   ├── theme.js          # thème clair/sombre, chargé dans le <head> de CHAQUE page (pas de script en ligne)
│   ├── page-404.js       # page 404 (en-tête et pied de page seulement)
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

## 6 ter bis. Publication sur GitHub (règle de RG, 9 novembre 2026)

**Après chaque modification du site, faire un commit et un `git push origin main`**, sans redemander. Le dossier `interne/` reste exclu (`.gitignore`) : jamais de prix d'achat, de numéros de paiement ni d'infos fournisseurs sur GitHub. Dépôt : `R2G5-neverbeafraid/laboutik` (privé), GitHub Pages sert `main` depuis la racine.

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

## 6 quater. Commande avec adresse de livraison (demande de RG, 7 novembre 2026)

- **Commande directe (fiche)** et **panier** : le bouton « Commander » ouvre une **fenêtre (modal) « Finaliser ta commande »** (`js/commande.js`) avec le récapitulatif, le total, l'adresse de livraison et deux boutons **Annuler** / **Confirmer** (Échap, croix et clic sur le fond annulent aussi ; le focus revient sur le bouton). Rien n'est affiché en ligne sur la fiche ni sur le panier (demande de RG, 9 novembre 2026). **Confirmer** vérifie l'adresse, ferme la fenêtre, ouvre WhatsApp avec le message complet et affiche un toast. Dans la fenêtre, le client choisit sa **commune** (liste de la grille de livraison) puis remplit **quartier, avenue, n° de parcelle (facultatif), point de repère (facultatif) et nom**. Commune, quartier, avenue et nom sont obligatoires. L'adresse est ajoutée au message WhatsApp avec les **frais de livraison** de la zone (en FC, à payer en plus de l'article en $). Elle est mémorisée sur l'appareil du client (`localStorage`, clé `lb-livraison`).
- La **grille de livraison** est dans `data/config.json` → `livraison.grille` (zones, communes, frais en FC) : une seule source pour le formulaire et la page `a-propos.html` (« Comment ça marche »). Pour ajouter une commune ou changer un tarif, modifier ce fichier seulement.
- **Pas de page « Livraison » séparée** (décision RG, 7 novembre 2026) : la grille de livraison, l'échange et retour et le paiement sont dans la page « Comment ça marche » (`a-propos.html`, ancres `#livraison`, `#echange`, `#paiement`).
- **Paiement (décision RG)** : pas de paiement sur le site pour l'instant. Le client paie **sur WhatsApp** après sa commande (Airtel Money : acompte pour une pré-commande, paiement total avant livraison pour un article en stock). Les **numéros de paiement ne sont pas affichés sur le site** (privés, dans `interne/infos-paiement.md`) ; RG voudra peut-être les ajouter plus tard pour payer directement depuis le site.

## 6 quinquies. Mode clair / mode sombre (demande de RG, 7 novembre 2026)

Le site suit le réglage du navigateur (`prefers-color-scheme`) tant que le visiteur n'a pas choisi ; un **bouton rond lune / soleil dans l'en-tête**, à droite de la barre de recherche, bascule clair ↔ sombre (choix mémorisé sous `lb-theme`). Le sélecteur du pied de page a été supprimé (mauvais design, jamais découvert). La logique est dans **`js/theme.js`**, un fichier unique appelé par `<script src="js/theme.js"></script>` dans le `<head>` de toutes les pages (appliqué avant l'affichage, donc sans flash) : plus aucun script de thème en ligne. Les couleurs claires sont celles de la charte, inchangées ; la palette sombre est dans `css/variables.css` (fond `#121210`, texte `#F4F4F1`, accent olive clair `#A9B37E`). Le bandeau du haut, le bloc « drop » et le pied de page restent foncés dans les deux thèmes (`--c-dark`). Toute nouvelle couleur doit passer par un token de `variables.css`, jamais en dur.

## 6 quinquies bis. Toasts, états vides, pied de page (demande de RG, 9 novembre 2026)

- **Toasts** (`js/toast.js`) : un message d'ajout (panier, favoris) n'est plus écrit dans la page mais affiché en notification flottante en bas de l'écran, **6 s** par défaut (8 s après la confirmation WhatsApp), avec un lien d'action (« Voir le panier », « Voir mes favoris »), une croix, et une pause au survol/focus. Maximum 3 à la fois ; zone `aria-live` pour les lecteurs d'écran.
- **États vides** (`js/etat-vide.js`) : un seul composant (icône ronde, titre, texte, boutons) pour tous les cas : panier vide, aucun favori, recherche sans résultat (bouton « Tout afficher » qui réinitialise filtres et recherche), catalogue vide, article introuvable, erreur de chargement (bouton « Recharger »), et la page 404. Pour un nouvel écran vide, réutiliser ce composant, ne pas écrire de HTML à part.
- **Pied de page** : le contenu, puis une **ligne de séparation** et dessous le copyright « © année LA BOUTIK · Site powered by © 25 Labs ».
- Tests faits : Playwright à 320 / 360 / 1100 px, clair et sombre, 160 fiches, aucune erreur console.

## 6 quinquies ter. Quantité et sélection multiple sur la fiche (demande de RG, 10 novembre 2026)

- La fiche produit a un sélecteur de **quantité** (− / +, de 1 à 99) qui s'applique à la taille et à la couleur choisies. « Ajouter au panier » ajoute cette quantité (`ajouterAuPanier({ id, taille, couleur, qte })`), affiche un toast détaillé (« 3 × « nom » (taille M, couleur) ajoutés au panier ») puis remet la quantité à 1. « Commander » commande directement le choix courant × la quantité.
- **Plusieurs couleurs ou tailles du même article** : on choisit la première, on ajoute, puis on change de pastille et on ajoute encore. Chaque combinaison est une ligne distincte du panier (`cleLigne` = id|taille|couleur).
- Sous les boutons, un bloc **« Ta sélection pour cet article »** liste les lignes déjà au panier pour cet article, avec − / + et « Retirer », et un bouton **« Commander ces N articles »** qui ouvre la fenêtre de commande avec toutes ces lignes (un seul message WhatsApp, une ligne par couleur/taille avec son sous-total). Il se met à jour tout seul (événement `lb-change`).
- Correctifs faits au passage : (1) cliquer une pastille de couleur puis « Ajouter » tout de suite pouvait ajouter l'ancienne couleur, car le défilement de la photo rebasculait la pastille ; le gestionnaire est maintenant ignoré 1,2 s après un défilement déclenché par un clic. (2) L'en-tête collant (≈ 120 px) cachait les éléments atteints par ancre ou au clavier : `scroll-padding-top: 8.5rem` sur `html` (`css/base.css`), qui remplace l'ancien `scroll-margin-top` des titres.

## 6 sexies. Animation de marque (demande de RG, 8 novembre 2026)

- **Sur le site** : filigrane animé derrière le titre de l'accueil (fond gris conservé), boucle de 12 s : le cercle (K) se dessine, les mots VÊTEMENTS / ACCESSOIRES / COUVRE-CHEF / PRÉ-COMMANDE / LIVRAISON À KINSHASA défilent avec des pastilles de couleur, puis LA BOUTIK. Code : `js/animation-marque.js` (variante « site »), lancée par `js/hero-anim.js`. Aucun fichier vidéo : c'est du code léger. Elle s'arrête hors écran, reste immobile si le visiteur a demandé « moins d'animations » ou active l'économiseur de données, et suit le thème clair/sombre.
- **Vidéo pour les réseaux** (Instagram, TikTok, WhatsApp) : même animation, variante « reseaux », MP4 vertical 1080×1920, 15 s, muette, avec carte finale (WhatsApp, Instagram, TikTok lus dans `data/config.json`). Elle se régénère avec `node outils/animation/rendre.js reseaux sortie.mp4` (serveur local `python3 -m http.server 8797` lancé à la racine ; Playwright + ffmpeg). Fichiers de sortie conservés dans `interne/` (non publié).
- Pour changer les mots ou les temps : `js/animation-marque.js`, puis régénérer la vidéo.

## 7. Informations données par RG (7 novembre 2026)

- **WhatsApp** : 243 973094820. **Instagram** : laboutik_243. **TikTok** : @la.boutique243 (liens dans `data/config.json`, sans paramètres de suivi).
- **Pré-commande** : délai 1 semaine et demie à 2 semaines ; acompte à la commande ; article en stock : paiement total avant la livraison ; paiement par Airtel Money (numéros **privés**, notés dans `interne/infos-paiement.md`, donnés sur WhatsApp ; pas affichés sur le site pour l'instant, paiement sur le site = plus tard).
- **Livraison à Kinshasa** : tout le district de la Lukunga (Barumbu, Gombe, Kinshasa, Kintambo, Lingwala, Mont-Ngafula, Ngaliema) + Limete, Bandal, Selembao, Lemba. Frais : 7 000 FC pour la Lukunga, 10 000 FC pour les autres communes. Délai : 3 à 4 jours après l'arrivée. Échange/retour : si l'article n'est ni utilisé ni porté et que l'étiquette est attachée.
- **Marques confirmées** : Saint Michael (VET-082), Kailas (VET-033), Essentials (VET-055), Suvene (VET-075), Supreme (VET-091).
- **Dépôt GitHub** : R2G5-neverbeafraid/Laboutik. Pas encore mis en ligne (voir points ouverts).

## 8. Points encore ouverts (à demander à RG)

- Mise en ligne GitHub Pages : confirmer (dépôt public ou privé ? photos de vendeurs tiers à remplacer avant une mise en ligne publique ; la connexion GitHub de cet environnement n'est pas autorisée, il faudra un accès).
- Dates de clôture et d'arrivée du drop en cours ; texte du bandeau noir ; description du drop.
- Coloris des 18 articles sans coloris ; pointures des casquettes Yankees ; tailles des articles enfant et des chaussettes.
- Marque de VET-066 et VET-067 (Lululemon ?) ; formulation « acheté auprès d'un revendeur officiel » ; catégorie Parfums ; catégorie Femme.
- Photos des 16 articles sans photo ; photo d'accueil ; photos officielles.
- Fichier Canva du logo à jour avec le « (K) » (le fichier design claude.ai l'est déjà).
- Autres villes à ajouter plus tard ; retrait en main propre ; nom de domaine.
