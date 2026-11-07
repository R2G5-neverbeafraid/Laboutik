// État vide réutilisable : icône, titre, explication et boutons d'action. Utilisé partout où il n'y a rien à montrer
// (panier vide, aucun favori, recherche sans résultat, article introuvable, chargement impossible…).
import { el, icone } from './dom.js';

/**
 * @param {{ icone?: string, titre: string, texte?: string, actions?: Array<{ texte: string, href?: string, onClick?: Function, secondaire?: boolean }> }} o
 */
export function etatVide({ icone: nomIcone = 'introuvable', titre, texte, actions = [] }) {
  return el(
    'div',
    { class: 'empty-state' },
    el('span', { class: 'empty-state__icone' }, icone(nomIcone, 34)),
    el('h2', { class: 'empty-state__titre' }, titre),
    texte ? el('p', { class: 'empty-state__texte' }, texte) : null,
    actions.length
      ? el(
          'div',
          { class: 'empty-state__actions' },
          actions.map((a) => {
            const classe = a.secondaire ? 'btn btn--ghost' : 'btn';
            if (a.href) return el('a', { class: classe, href: a.href }, a.texte);
            const b = el('button', { type: 'button', class: classe }, a.texte);
            if (a.onClick) b.addEventListener('click', a.onClick);
            return b;
          })
        )
      : null
  );
}
