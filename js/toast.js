// Notifications courtes (toasts) : « Ajouté au panier », « Ajouté aux favoris »…
// Durée 6 s par défaut (entre 5 et 10 s). Elles se mettent en pause au survol / au focus, et se ferment avec la croix.
import { el, icone } from './dom.js';

const MAX = 3; // au plus 3 messages à l'écran

function zone() {
  let z = document.getElementById('toasts');
  if (!z) {
    z = el('div', { id: 'toasts', class: 'toasts', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'false' });
    document.body.append(z);
  }
  return z;
}

/**
 * @param {string} message
 * @param {{ action?: { texte: string, href?: string, onClick?: Function }, duree?: number, type?: 'ok'|'info' }} [options]
 */
export function toast(message, { action, duree = 6000, type = 'ok' } = {}) {
  const z = zone();
  while (z.children.length >= MAX) z.firstElementChild.remove();

  const t = el('div', { class: `toast toast--${type}` });
  const fermer = el('button', { type: 'button', class: 'toast__close', 'aria-label': 'Fermer le message' }, icone('fermer', 18));
  t.append(el('span', { class: 'toast__msg' }, message));
  if (action) {
    const a = action.href ? el('a', { class: 'toast__action', href: action.href }, action.texte) : el('button', { type: 'button', class: 'toast__action' }, action.texte);
    if (action.onClick) a.addEventListener('click', action.onClick);
    t.append(a);
  }
  t.append(fermer);
  z.append(t);

  let reste = duree;
  let debut = Date.now();
  let minuteur = null;
  const retirer = () => {
    clearTimeout(minuteur);
    t.classList.add('toast--sortie');
    setTimeout(() => t.remove(), 220);
  };
  const lancer = () => {
    debut = Date.now();
    minuteur = setTimeout(retirer, reste);
  };
  const suspendre = () => {
    clearTimeout(minuteur);
    reste -= Date.now() - debut;
  };
  t.addEventListener('mouseenter', suspendre);
  t.addEventListener('mouseleave', lancer);
  t.addEventListener('focusin', suspendre);
  t.addEventListener('focusout', lancer);
  fermer.addEventListener('click', retirer);
  lancer();
  return { fermer: retirer };
}
