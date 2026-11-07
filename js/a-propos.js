// Page « Comment ça marche » : infos pratiques, grille de livraison, échange et retour, paiement.
// La grille vient de config.livraison.grille (même source que le formulaire d'adresse de la commande).
import { initPage, el, restaurerPosition } from './main.js';
import { formaterFC } from './data.js';

const donnees = await initPage();

if (donnees) {
  const grille = (donnees.config.livraison && donnees.config.livraison.grille) || [];
  const zone = document.getElementById('grille-livraison');
  if (grille.length) {
    zone.replaceChildren(
      el(
        'table',
        { class: 'facts delivery-grid' },
        el('caption', { class: 'sr-only' }, 'Zones de livraison, communes et frais'),
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Zone'), el('th', { scope: 'col' }, 'Communes'), el('th', { scope: 'col' }, 'Frais'))),
        el(
          'tbody',
          {},
          grille.map((z) =>
            el('tr', {}, el('th', { scope: 'row' }, z.zone), el('td', {}, z.communes.join(', ')), el('td', { class: 'delivery-grid__fee' }, formaterFC(z.frais_fc)))
          )
        )
      )
    );
  }
  restaurerPosition();
}
