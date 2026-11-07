// Page « Mon panier » : lignes (article, taille, couleur, quantité), total, et commande groupée sur WhatsApp.
// Le paiement et la livraison se règlent ensuite sur WhatsApp : il n'y a pas de paiement en ligne.
import { initPage, el } from './main.js';
import { formaterPrix, srcPhoto, couleursPhoto, memeCouleur } from './data.js';
import { ouvrirCommande } from './commande.js';
import { etatVide } from './etat-vide.js';
import { EVENEMENT, panier, cleLigne, changerQuantite, retirerDuPanier, viderPanier } from './stockage.js';

const PLACEHOLDER = 'assets/img/placeholder.svg';
const donnees = await initPage();

if (donnees) {
  const { config, produits } = donnees;
  const zone = document.getElementById('panier');

  /** Photo de la ligne : celle de la couleur choisie si elle existe, sinon la première. */
  function photoDe(p, couleur) {
    const photos = p.photos || [];
    const liee = couleur && photos.find((ph) => couleursPhoto(ph).some((c) => memeCouleur(c, couleur)));
    const choisie = liee || photos[0];
    return choisie ? srcPhoto(choisie) : PLACEHOLDER;
  }

  function ligne(l, p) {
    const cle = cleLigne(l);
    const options = [l.taille ? `Taille ${l.taille}` : null, l.couleur ? `Couleur ${l.couleur}` : null].filter(Boolean).join(' · ');
    const bouton = (action, texte, label) =>
      el('button', { type: 'button', class: 'qty-btn', 'data-action': action, 'data-cle': cle, 'aria-label': label }, texte);
    return el(
      'li',
      { class: 'cart-line' },
      el(
        'a',
        { class: 'cart-line__photo', href: `produit.html?id=${encodeURIComponent(p.id)}&retour=panier.html` },
        el('img', { src: photoDe(p, l.couleur), alt: p.nom, width: 80, height: 100, loading: 'lazy' })
      ),
      el(
        'div',
        { class: 'cart-line__body' },
        p.marque ? el('p', { class: 'card__brand' }, p.marque) : null,
        el('a', { class: 'cart-line__title', href: `produit.html?id=${encodeURIComponent(p.id)}&retour=panier.html` }, p.nom),
        options ? el('p', { class: 'note cart-line__opts' }, options) : null,
        el(
          'div',
          { class: 'cart-line__row' },
          el(
            'div',
            { class: 'qty', role: 'group', 'aria-label': `Quantité de ${p.nom}` },
            bouton('moins', '−', 'Retirer un exemplaire'),
            el('span', { class: 'qty__n', 'aria-live': 'polite' }, String(l.qte)),
            bouton('plus', '+', 'Ajouter un exemplaire')
          ),
          el('p', { class: 'cart-line__price' }, p.prix == null ? 'Prix à confirmer' : `${p.prix * l.qte} $`)
        ),
        el('button', { type: 'button', class: 'link-btn', 'data-action': 'retirer', 'data-cle': cle }, 'Retirer')
      )
    );
  }

  function afficher() {
    const par = new Map(produits.map((p) => [p.id, p]));
    const lignes = panier()
      .filter((l) => par.has(l.id))
      .map((l) => ({ ...l, produit: par.get(l.id) }));

    if (!lignes.length) {
      zone.replaceChildren(
        etatVide({
          icone: 'panier',
          titre: 'Ton panier est vide',
          texte: 'Ajoute des articles depuis le catalogue : tu pourras les commander tous en une fois sur WhatsApp.',
          actions: [
            { texte: 'Voir le catalogue', href: 'catalogue.html' },
            { texte: 'Mes favoris', href: 'favoris.html', secondaire: true },
          ],
        })
      );
      return;
    }

    let total = 0;
    let inconnus = 0;
    for (const l of lignes) {
      if (l.produit.prix == null) inconnus += l.qte;
      else total += l.produit.prix * l.qte;
    }
    const nb = lignes.reduce((n, l) => n + l.qte, 0);

    const donneesLignes = lignes.map((l) => ({ produit: l.produit, taille: l.taille, couleur: l.couleur, qte: l.qte }));
    const commander = el('button', { type: 'button', class: 'btn btn--wa btn--block' }, 'Commander');
    // « Commander » ouvre la fenêtre de commande : adresse de livraison, puis Annuler / Confirmer
    commander.addEventListener('click', () => ouvrirCommande(config, donneesLignes, commander));

    zone.replaceChildren(
      el('p', { class: 'note' }, `${nb} article${nb > 1 ? 's' : ''}`),
      el('ul', { class: 'cart-list' }, lignes.map((l) => ligne(l, l.produit))),
      el(
        'section',
        { class: 'cart-summary', 'aria-label': 'Récapitulatif' },
        el('p', { class: 'cart-summary__total' }, el('span', {}, 'Total'), el('strong', {}, `${total} $`)),
        inconnus
          ? el('p', { class: 'note' }, `+ ${inconnus} article${inconnus > 1 ? 's' : ''} au prix à confirmer (on te donne le prix sur WhatsApp).`)
          : null,
        el('p', { class: 'note' }, 'Le paiement se fait sur WhatsApp, après ta commande. ', el('a', { href: 'a-propos.html#paiement' }, 'Comment payer ?')),
        commander,
        el('button', { type: 'button', class: 'link-btn', 'data-action': 'vider' }, 'Vider le panier')
      )
    );
  }

  zone.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    const { action, cle } = b.dataset;
    if (action === 'plus') changerQuantite(cle, 1);
    else if (action === 'moins') changerQuantite(cle, -1);
    else if (action === 'retirer') retirerDuPanier(cle);
    else if (action === 'vider' && confirm('Vider tout le panier ?')) viderPanier();
  });

  afficher();
  window.addEventListener(EVENEMENT, afficher);
}
