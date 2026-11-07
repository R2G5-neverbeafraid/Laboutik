// Petits outils DOM partagés (pas d'import circulaire avec main.js).

/** Crée un élément DOM (textContent uniquement : pas d'injection HTML). */
export function el(tag, attrs = {}, ...enfants) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') n.className = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const e of enfants.flat()) {
    if (e == null) continue;
    n.append(e.nodeType ? e : document.createTextNode(e));
  }
  return n;
}

const NS = 'http://www.w3.org/2000/svg';

// Icônes : chemins SVG (trait, 24 × 24). Le contenu est écrit ici, jamais construit à partir de données.
const ICONES = {
  coeur: '<path d="M12 20.3s-7.6-4.6-7.6-10.3A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.6 2.6c0 5.7-7.6 10.3-7.6 10.3z" stroke-linejoin="round"/>',
  panier: '<path d="M5.2 7.5h13.6l-1.1 11a1.6 1.6 0 0 1-1.6 1.4H7.9a1.6 1.6 0 0 1-1.6-1.4l-1.1-11z" stroke-linejoin="round"/><path d="M9 7.5V6.4a3 3 0 0 1 6 0v1.1" stroke-linecap="round"/>',
  lune: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" stroke-linejoin="round"/>',
  soleil: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" stroke-linecap="round"/>',
  recherche: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21" stroke-linecap="round"/>',
  introuvable: '<path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5z" stroke-linejoin="round"/><path d="M4 7.5 12 11l8-3.5M12 11v9" stroke-linejoin="round"/>',
  carte: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z" stroke-linejoin="round"/>',
  alerte: '<path d="M12 4 3 19.5h18z" stroke-linejoin="round"/><path d="M12 10v4.5M12 17v.2" stroke-linecap="round"/>',
  fermer: '<path d="M6 6l12 12M18 6 6 18" stroke-linecap="round"/>',
};

/** Icône SVG décorative (trait = currentColor). */
export function icone(nom, taille = 22) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(taille));
  svg.setAttribute('height', String(taille));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', `icone icone--${nom}`);
  svg.innerHTML = ICONES[nom] || '';
  return svg;
}
