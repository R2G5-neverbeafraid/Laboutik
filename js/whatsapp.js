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
    `- Taille : ${taille}`,
    `- Couleur : ${couleur}`,
    `- Prix : ${formaterPrix(produit.prix)}`,
    `- Statut : ${STATUTS[produit.statut] || produit.statut}`,
  ].join('\n');
}

export function lienCommande(config, produit, taille, couleur) {
  return lienWhatsApp(config, messageCommande(config, produit, taille, couleur));
}

export function lienContact(config) {
  return lienWhatsApp(config, `Bonjour ${config.nom}, j'ai une question.`);
}
