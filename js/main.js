// Éléments communs : header, footer, menu mobile, remplissage depuis la config, cartes produit.
import { chargerDonnees, formaterPrix, STATUTS } from './data.js';
import { lienContact } from './whatsapp.js';

const PLACEHOLDER = 'assets/img/placeholder.svg';

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

export function creerCarte(produit) {
  const photo = produit.photos && produit.photos[0] ? produit.photos[0] : PLACEHOLDER;
  const img = el('img', {
    src: photo,
    alt: produit.photos && produit.photos[0] ? produit.nom : `${produit.nom} (photo à venir)`,
    width: 400,
    height: 500,
    loading: 'lazy',
    decoding: 'async',
  });
  return el(
    'li',
    {},
    el(
      'article',
      { class: 'card' },
      el(
        'a',
        { class: 'card__link', href: `produit.html?id=${encodeURIComponent(produit.id)}` },
        el('div', { class: 'card__media' }, img),
        el(
          'div',
          { class: 'card__body' },
          el('h3', { class: 'card__title' }, produit.nom),
          el('p', { class: 'card__price' }, formaterPrix(produit.prix))
        )
      ),
      el('span', { class: `badge badge--${produit.statut}` }, STATUTS[produit.statut] || produit.statut)
    )
  );
}

const LIENS = [
  ['index.html', 'Accueil', 'accueil'],
  ['catalogue.html', 'Catalogue', 'catalogue'],
  ['a-propos.html', 'Comment ça marche', 'a-propos'],
];

function creerHeader(config) {
  const page = document.body.dataset.page;
  const marque = el(
    'a',
    { class: 'brand', href: 'index.html' },
    config.logo ? el('img', { src: config.logo, alt: '', height: 36 }) : null,
    config.nom
  );
  const nav = el(
    'nav',
    { id: 'site-nav', class: 'site-nav', 'aria-label': 'Navigation principale' },
    el(
      'ul',
      {},
      LIENS.map(([href, texte, id]) =>
        el('li', {}, el('a', { href, 'aria-current': page === id ? 'page' : false }, texte))
      )
    )
  );
  const bouton = el(
    'button',
    { class: 'nav-toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'site-nav' },
    'Menu'
  );
  bouton.addEventListener('click', () => {
    const ouvert = nav.classList.toggle('is-open');
    bouton.setAttribute('aria-expanded', String(ouvert));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      bouton.setAttribute('aria-expanded', 'false');
      bouton.focus();
    }
  });
  return el('header', { class: 'site-header' }, el('div', { class: 'container header-inner' }, marque, bouton, nav));
}

function creerFooter(config) {
  const reseaux = [
    ['Instagram', config.instagram],
    ['TikTok', config.tiktok],
  ].filter(([, url]) => url);
  return el(
    'footer',
    { class: 'site-footer' },
    el(
      'div',
      { class: 'container' },
      el(
        'div',
        { class: 'footer-grid' },
        el('div', {}, el('h2', {}, config.nom), el('p', {}, config.slogan), el('p', {}, config.ville)),
        el(
          'div',
          {},
          el('h2', {}, 'Navigation'),
          el('ul', {}, LIENS.map(([href, texte]) => el('li', {}, el('a', { href }, texte))))
        ),
        el(
          'div',
          {},
          el('h2', {}, 'Contact'),
          el(
            'ul',
            {},
            el('li', {}, el('a', { href: lienContact(config), target: '_blank', rel: 'noopener' }, 'WhatsApp')),
            reseaux.map(([nom, url]) =>
              el('li', {}, el('a', { href: url, target: '_blank', rel: 'noopener' }, nom))
            )
          )
        )
      ),
      el('p', { class: 'footer-note' }, `© ${new Date().getFullYear()} ${config.nom} · Prix en dollars US ($).`)
    )
  );
}

/** Remplit les éléments [data-config="chemin.dans.config"] et les liens [data-wa]. */
function remplirDepuisConfig(config) {
  document.querySelectorAll('[data-config]').forEach((n) => {
    const valeur = n.dataset.config.split('.').reduce((o, k) => (o ? o[k] : undefined), config);
    if (valeur != null) n.textContent = valeur;
  });
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = lienContact(config);
    a.target = '_blank';
    a.rel = 'noopener';
  });
}

export async function initPage() {
  try {
    const donnees = await chargerDonnees();
    const { config } = donnees;
    const header = creerHeader(config);
    document.querySelector('.skip-link').after(header);
    if (config.annonce) header.before(el('div', { class: 'announce' }, el('p', { class: 'container' }, config.annonce)));
    document.body.append(creerFooter(config));
    remplirDepuisConfig(config);
    return donnees;
  } catch (err) {
    console.error(err);
    const main = document.querySelector('main');
    if (main) {
      main.prepend(
        el(
          'p',
          { class: 'empty', role: 'alert' },
          'Le catalogue ne peut pas se charger pour le moment. Vérifie ta connexion et recharge la page.'
        )
      );
    }
    return null;
  }
}
