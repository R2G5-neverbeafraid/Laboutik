// Construction des liens wa.me avec message pré-rempli.
import { formaterPrix, STATUTS } from './data.js';

function numeroPropre(numero) {
  return String(numero || '').replace(/\D/g, '');
}

export function lienWhatsApp(config, message) {
  return `https://wa.me/${numeroPropre(config.whatsapp)}?text=${encodeURIComponent(message)}`;
}

export function messageCommande(config, produit, taille, couleur) {
  return [
    `Bonjour ${config.nom}, je souhaite commander :`,
    `- Article : ${produit.nom}`,
    taille ? `- Taille : ${taille}` : null,
    couleur ? `- Couleur : ${couleur}` : null,
    `- Prix : ${produit.prix == null ? 'à confirmer' : formaterPrix(produit.prix)}`,
    `- Statut : ${STATUTS[produit.statut] || produit.statut}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Message pour tout le panier : une ligne par article, puis le total des articles dont le prix est connu. */
export function messagePanier(config, lignes) {
  let total = 0;
  let inconnus = 0;
  const detail = lignes.map(({ produit: p, taille, couleur, qte }, i) => {
    if (p.prix == null) inconnus += qte;
    else total += p.prix * qte;
    const options = [taille ? 'taille ' + taille : null, couleur || null].filter(Boolean).join(', ');
    const prix =
      p.prix == null
        ? 'prix à confirmer' + (qte > 1 ? ' (x ' + qte + ')' : '')
        : formaterPrix(p.prix) + (qte > 1 ? ' x ' + qte + ' = ' + p.prix * qte + ' $' : '');
    return i + 1 + '. ' + p.nom + (options ? ' (' + options + ')' : '') + ' : ' + prix;
  });
  const suite = inconnus ? ' + ' + inconnus + ' article' + (inconnus > 1 ? 's' : '') + ' au prix à confirmer' : '';
  return ['Bonjour ' + config.nom + ', je souhaite commander :', ...detail, 'Total : ' + total + ' $' + suite].join('\n');
}

export function lienCommande(config, produit, taille, couleur) {
  return lienWhatsApp(config, messageCommande(config, produit, taille, couleur));
}

export function lienContact(config) {
  return lienWhatsApp(config, `Bonjour ${config.nom}, j'ai une question.`);
}
