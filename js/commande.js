// Fenêtre « Finaliser ta commande » : récapitulatif des articles, adresse de livraison, boutons Annuler / Confirmer.
// Confirmer ouvre WhatsApp avec le message complet (articles + adresse + frais de livraison). Aucun paiement sur le site.
import { el, icone } from './dom.js';
import { formaterPrix, srcPhoto, couleursPhoto, memeCouleur } from './data.js';
import { lienWhatsApp, messageCommande, messagePanier } from './whatsapp.js';
import { creerFormulaireLivraison, listeFrancaise } from './livraison.js';
import { toast } from './toast.js';

const PLACEHOLDER = 'assets/img/placeholder.svg';

function photoDe(p, couleur) {
  const photos = p.photos || [];
  const liee = couleur && photos.find((ph) => couleursPhoto(ph).some((c) => memeCouleur(c, couleur)));
  const choisie = liee || photos[0];
  return choisie ? srcPhoto(choisie) : PLACEHOLDER;
}

/**
 * @param {object} config
 * @param {Array<{ produit: object, taille: string, couleur: string, qte: number }>} lignes
 * @param {HTMLElement} [declencheur] bouton à qui rendre le focus à la fermeture
 */
export function ouvrirCommande(config, lignes, declencheur) {
  if (!lignes.length || document.querySelector('dialog.modal')) return;

  let total = 0;
  let inconnus = 0;
  for (const l of lignes) {
    if (l.produit.prix == null) inconnus += l.qte;
    else total += l.produit.prix * l.qte;
  }

  const dialogue = el('dialog', { class: 'modal', 'aria-labelledby': 'cmd-titre' });
  const fermer = el('button', { type: 'button', class: 'modal__close', 'aria-label': 'Fermer la fenêtre' }, icone('fermer', 22));
  const livraison = creerFormulaireLivraison(config);
  const erreur = el('p', { class: 'form-error', role: 'alert' });
  const annuler = el('button', { type: 'button', class: 'btn btn--ghost' }, 'Annuler');
  const confirmer = el('button', { type: 'button', class: 'btn btn--wa' }, 'Confirmer');

  const recap = el(
    'ul',
    { class: 'cmd-list' },
    lignes.map((l) => {
      const options = [l.taille ? `Taille ${l.taille}` : null, l.couleur || null].filter(Boolean).join(' · ');
      const prix = l.produit.prix == null ? 'Prix à confirmer' : `${l.produit.prix * l.qte} $`;
      return el(
        'li',
        { class: 'cmd-line' },
        el('span', { class: 'cmd-line__photo' }, el('img', { src: photoDe(l.produit, l.couleur), alt: '', width: 56, height: 70 })),
        el(
          'span',
          { class: 'cmd-line__body' },
          el('span', { class: 'cmd-line__nom' }, l.produit.nom),
          options || l.qte > 1 ? el('span', { class: 'cmd-line__opts' }, [options, l.qte > 1 ? `× ${l.qte}` : null].filter(Boolean).join(' · ')) : null
        ),
        el('span', { class: 'cmd-line__prix' }, prix)
      );
    })
  );

  dialogue.append(
    el('div', { class: 'modal__head' }, el('h2', { id: 'cmd-titre', class: 'modal__titre' }, 'Finaliser ta commande'), fermer),
    el(
      'div',
      { class: 'modal__body' },
      recap,
      el(
        'div',
        { class: 'cmd-total' },
        el('span', {}, 'Total des articles'),
        el('strong', {}, `${total} $`)
      ),
      inconnus ? el('p', { class: 'note cmd-note' }, `+ ${inconnus} article${inconnus > 1 ? 's' : ''} au prix à confirmer (on te donne le prix sur WhatsApp).`) : null,
      livraison.element,
      el('p', { class: 'note cmd-note' }, "Confirmer ouvre WhatsApp avec ta commande. Le paiement se fait ensuite là-bas : rien n'est débité sur le site."),
      erreur
    ),
    el('div', { class: 'modal__foot' }, annuler, confirmer)
  );

  const racine = document.documentElement;
  const nettoyer = () => {
    racine.classList.remove('modal-open');
    dialogue.remove();
    if (declencheur && document.contains(declencheur)) declencheur.focus();
  };
  dialogue.addEventListener('close', nettoyer);
  dialogue.addEventListener('cancel', () => {}); // Échap : fermeture native
  dialogue.addEventListener('click', (e) => {
    if (e.target === dialogue) dialogue.close(); // clic sur le fond sombre
  });
  fermer.addEventListener('click', () => dialogue.close());
  annuler.addEventListener('click', () => dialogue.close());

  confirmer.addEventListener('click', () => {
    const v = livraison.valider();
    erreur.textContent = v.ok ? '' : `Pour livrer, indique ${listeFrancaise(v.manques)}.`;
    if (!v.ok) return;
    const simple = lignes.length === 1 && lignes[0].qte === 1;
    const message = simple
      ? messageCommande(config, lignes[0].produit, lignes[0].taille, lignes[0].couleur, v.donnees)
      : messagePanier(config, lignes, v.donnees);
    const lien = el('a', { href: lienWhatsApp(config, message), target: '_blank', rel: 'noopener' });
    document.body.append(lien);
    lien.click();
    lien.remove();
    dialogue.close();
    toast("WhatsApp s'ouvre : envoie le message pour valider ta commande.", { duree: 8000, type: 'info' });
  });

  document.body.append(dialogue);
  racine.classList.add('modal-open');
  dialogue.showModal();
}
