// Éléments communs : header, footer, menu mobile, remplissage depuis la config, cartes produit.
import { chargerDonnees, formaterPrix, STATUTS, srcPhoto, fondCouleur } from './data.js';
import { lienContact } from './whatsapp.js';
import { el, icone } from './dom.js';
import { toast } from './toast.js';
import { etatVide } from './etat-vide.js';
import { initStats, vuePage, suivre } from './stats.js';
import { EVENEMENT, estFavori, basculerFavori, favoris, nombrePanier, nettoyer } from './stockage.js';

export { el, icone };

const PLACEHOLDER = 'assets/img/placeholder.svg';

/** N'accepte que les liens http(s) (config.json est une donnée, pas du code de confiance). */
function urlSure(u) {
  try {
    const x = new URL(u);
    return x.protocol === 'https:' || x.protocol === 'http:' ? x.href : null;
  } catch {
    return null;
  }
}

/** Boutons de contact : WhatsApp toujours, Instagram / TikTok seulement s'ils ont un lien dans config.json. */
export function creerLiensContact(config) {
  const liens = [
    ['WhatsApp', lienContact(config), 'btn btn--wa'],
    ['Instagram', urlSure(config.instagram), 'btn btn--ghost'],
    ['TikTok', urlSure(config.tiktok), 'btn btn--ghost'],
  ].filter(([, href]) => href);
  return el(
    'div',
    { class: 'contact-links' },
    liens.map(([nom, href, classe]) =>
      el('a', { class: classe, href, target: '_blank', rel: 'noopener' }, nom)
    )
  );
}

// ---------- Cœur « j'aime » et compteurs de l'en-tête ----------
/** Bouton cœur : ajoute ou retire l'article des favoris (mémorisé dans le navigateur). */
export function boutonCoeur(id, nom, classe = '') {
  const b = el(
    'button',
    {
      type: 'button',
      class: `heart-btn ${classe}`.trim(),
      'data-id': id,
      'aria-label': `J'aime : ${nom}`,
      title: "J'aime",
      'aria-pressed': String(estFavori(id)),
    },
    icone('coeur')
  );
  b.addEventListener('click', () => {
    const ajoute = basculerFavori(id);
    if (ajoute) suivre('favori', { article: id, nom });
    if (ajoute) toast(`« ${nom} » ajouté aux favoris`, { action: { texte: 'Voir mes favoris', href: 'favoris.html' } });
  });
  return b;
}

function majInterface() {
  const fav = new Set(favoris());
  document.querySelectorAll('.heart-btn').forEach((b) => b.setAttribute('aria-pressed', String(fav.has(b.dataset.id))));
  const nombres = { favoris: fav.size, panier: nombrePanier() };
  const noms = { favoris: 'Mes favoris', panier: 'Mon panier' };
  document.querySelectorAll('[data-compteur]').forEach((lien) => {
    const type = lien.dataset.compteur;
    const n = nombres[type];
    const pastille = lien.querySelector('.header-badge');
    pastille.textContent = String(n);
    pastille.hidden = n === 0;
    lien.setAttribute('aria-label', n ? `${noms[type]} (${n})` : noms[type]);
  });
}
window.addEventListener(EVENEMENT, majInterface);
window.addEventListener('storage', majInterface); // un autre onglet a changé les favoris ou le panier

function lienIcone(type, href, titre) {
  return el(
    'a',
    {
      class: 'icon-link',
      href,
      'data-compteur': type,
      'aria-label': titre,
      title: titre,
      'aria-current': document.body.dataset.page === type ? 'page' : false,
    },
    icone(type === 'favoris' ? 'coeur' : 'panier'),
    el('span', { class: 'header-badge', hidden: true, 'aria-hidden': 'true' }, '0')
  );
}

/** Pastille ronde de couleur (décorative : le nom est donné par le texte ou le title). */
export function pastille(nom) {
  return el('span', { class: 'swatch', style: `background: ${fondCouleur(nom)}`, title: nom, 'aria-hidden': 'true' });
}

/** Petites pastilles des coloris sous le prix d'une carte (seulement s'il y a un choix). */
function pastillesCarte(produit) {
  const cs = produit.couleurs || [];
  if (cs.length < 2) return null;
  const MAX = 4;
  return el(
    'p',
    { class: 'card__swatches', 'aria-label': `${cs.length} coloris : ${cs.join(', ')}` },
    cs.slice(0, MAX).map(pastille),
    cs.length > MAX ? el('span', { class: 'card__more' }, `+${cs.length - MAX}`) : null
  );
}

/** Adresse de la page courante avec la position de défilement : le bouton « Retour » de la fiche y ramène exactement. */
function urlAvecPosition() {
  const u = new URL(location.href);
  u.searchParams.set('y', String(Math.round(window.scrollY)));
  return (u.pathname.split('/').pop() || 'index.html') + u.search;
}

export function creerCarte(produit) {
  const photo = produit.photos && produit.photos[0] ? srcPhoto(produit.photos[0]) : PLACEHOLDER;
  const img = el('img', {
    src: photo,
    alt: produit.photos && produit.photos[0] ? produit.nom : `${produit.nom} (photo à venir)`,
    width: 400,
    height: 500,
    loading: 'lazy',
    decoding: 'async',
  });
  const lien = el(
    'a',
    { class: 'card__link', href: `produit.html?id=${encodeURIComponent(produit.id)}` },
    el('div', { class: 'card__media' }, img),
    el(
      'div',
      { class: 'card__body' },
      produit.marque ? el('p', { class: 'card__brand' }, produit.marque) : null,
      el('h3', { class: 'card__title' }, produit.nom),
      el('p', { class: 'card__price' }, formaterPrix(produit.prix)),
      pastillesCarte(produit)
    )
  );
  // Au clic, la fiche reçoit l'adresse de la page d'où l'on vient (filtres + position) pour son bouton « Retour »
  lien.addEventListener('click', () => {
    lien.href = `produit.html?id=${encodeURIComponent(produit.id)}&retour=${encodeURIComponent(urlAvecPosition())}`;
  });
  return el(
    'li',
    {},
    el('article', { class: 'card' }, lien, boutonCoeur(produit.id, produit.nom), el('span', { class: `badge badge--${produit.statut}` }, STATUTS[produit.statut] || produit.statut))
  );
}

const LIENS = [
  ['index.html', 'Accueil', 'accueil'],
  ['catalogue.html', 'Catalogue', 'catalogue'],
  ['a-propos.html', 'Comment ça marche', 'a-propos'],
];

/** Logo : image de config.logo si fournie, sinon monogramme LB + nom (comme le logo retenu). */
function blocLogo(config) {
  if (config.logo) return el('img', { src: config.logo, alt: config.nom, height: 36 });
  return [el('span', { class: 'monogram', 'aria-hidden': 'true' }, config.logo_monogramme || 'LB'), el('span', {}, config.nom)];
}

/** Barre de recherche présente sur toutes les pages. Sur le catalogue elle filtre en direct ; ailleurs elle ouvre le catalogue. */
function creerRecherche() {
  const champ = el('input', {
    id: 'recherche-globale',
    name: 'q',
    type: 'search',
    placeholder: 'Rechercher un article, une marque…',
    autocomplete: 'off',
    enterkeyhint: 'search',
    maxlength: '80',
  });
  const form = el(
    'form',
    { class: 'header-search', role: 'search', action: 'catalogue.html', method: 'get' },
    el('label', { class: 'sr-only', for: 'recherche-globale' }, 'Rechercher un article'),
    champ,
    el('button', { type: 'submit', class: 'header-search__btn', 'aria-label': 'Rechercher' }, icone('recherche', 20))
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.body.dataset.page === 'catalogue') return champ.blur(); // le catalogue filtre déjà en direct
    const q = champ.value.trim();
    location.href = q ? `catalogue.html?q=${encodeURIComponent(q)}` : 'catalogue.html';
  });
  return el('div', { class: 'container header-bar2' }, form, boutonTheme());
}

function creerHeader(config) {
  const page = document.body.dataset.page;
  const marque = el(
    'a',
    { class: 'brand', href: 'index.html' },
    blocLogo(config)
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
  return el(
    'header',
    { class: 'site-header' },
    el(
      'div',
      { class: 'container header-inner' },
      marque,
      nav,
      el(
        'div',
        { class: 'header-actions' },
        lienIcone('favoris', 'favoris.html', 'Mes favoris'),
        lienIcone('panier', 'panier.html', 'Mon panier'),
        bouton
      )
    ),
    creerRecherche()
  );
}

// ---------- Thème : bouton lune / soleil dans l'en-tête (la logique est dans theme.js) ----------
function boutonTheme() {
  const T = window.LBTheme;
  if (!T) return null;
  const b = el('button', { type: 'button', class: 'theme-btn' });
  const maj = () => {
    const sombre = T.actuel() === 'dark';
    b.replaceChildren(icone(sombre ? 'soleil' : 'lune', 22));
    const libelle = sombre ? 'Passer en mode clair' : 'Passer en mode sombre';
    b.setAttribute('aria-label', libelle);
    b.title = libelle;
  };
  b.addEventListener('click', () => T.basculer());
  document.addEventListener('lb-theme', maj);
  maj();
  return b;
}

function creerFooter(config) {
  const reseaux = [
    ['Instagram', config.instagram],
    ['TikTok', config.tiktok],
  ].map(([nom, url]) => [nom, urlSure(url)]).filter(([, url]) => url);
  return el(
    'footer',
    { class: 'site-footer' },
    el(
      'div',
      { class: 'container' },
      el(
        'div',
        { class: 'footer-grid' },
        el('div', {}, el('p', { class: 'brand' }, blocLogo(config)), el('p', {}, config.slogan)),
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
      )
    ),
    el('div', { class: 'footer-bottom' }, el('div', { class: 'container' }, el('p', {}, `© ${new Date().getFullYear()} ${config.nom} · Site powered by © 25 Labs`)))
  );
}

/** Remplit les éléments [data-config="chemin.dans.config"] et les liens [data-wa]. */
function remplirDepuisConfig(config) {
  document.querySelectorAll('[data-config]').forEach((n) => {
    const valeur = n.dataset.config.split('.').reduce((o, k) => (o ? o[k] : undefined), config);
    if (valeur != null) n.textContent = valeur;
  });
  document.querySelectorAll('[data-contact]').forEach((n) => n.replaceChildren(creerLiensContact(config)));
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = lienContact(config);
    a.target = '_blank';
    a.rel = 'noopener';
  });
}

/** Bouton WhatsApp flottant (sauf sur la fiche produit, qui a déjà son bouton de commande). */
function creerBoutonFlottant(config) {
  return el(
    'a',
    { class: 'wa-float', href: lienContact(config), target: '_blank', rel: 'noopener', 'aria-label': 'Écrire sur WhatsApp' },
    'WhatsApp'
  );
}

// ---------- Retour à la même position (précédent / suivant du navigateur) ----------
// Le contenu est construit en JavaScript : le navigateur ne peut pas retrouver tout seul la position. On la mémorise.
const cleDefilement = () => `lb-defilement:${location.pathname}${location.search}`;
let memoriser = false;
function enregistrerPosition() {
  if (!memoriser) return;
  try {
    sessionStorage.setItem(cleDefilement(), String(Math.round(window.scrollY)));
  } catch {
    /* stockage indisponible : on ignore */
  }
}
let enAttente = false;
function surDefilement() {
  if (enAttente) return;
  enAttente = true;
  requestAnimationFrame(() => {
    enAttente = false;
    enregistrerPosition();
  });
}
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('scroll', surDefilement, { passive: true });
window.addEventListener('pagehide', enregistrerPosition);

/** À appeler quand la page a fini de construire son contenu : si on revient en arrière, on remet la position d'avant. */
export function restaurerPosition() {
  const nav = performance.getEntriesByType('navigation')[0];
  let y = 0;
  // Retour demandé par le bouton « Retour » : la position est dans l'adresse (?y=…), on la retire aussitôt
  const url = new URL(location.href);
  if (url.searchParams.has('y')) {
    y = Number(url.searchParams.get('y')) || 0;
    url.searchParams.delete('y');
    history.replaceState(null, '', url);
  } else if (nav && (nav.type === 'back_forward' || nav.type === 'reload')) {
    try {
      y = Number(sessionStorage.getItem(cleDefilement())) || 0;
    } catch {
      y = 0;
    }
  }
  if (!y) {
    memoriser = true;
    return;
  }
  let fini = false;
  const arreter = () => {
    fini = true;
    memoriser = true;
  };
  ['touchstart', 'wheel', 'keydown', 'mousedown'].forEach((e) =>
    window.addEventListener(e, arreter, { once: true, passive: true })
  );
  const debut = performance.now();
  (function essayer() {
    if (fini) return;
    window.scrollTo(0, y);
    // les images chargent et la page s'allonge : on réessaie un court instant jusqu'à atteindre la position
    if (Math.abs(window.scrollY - y) > 2 && performance.now() - debut < 2500) requestAnimationFrame(essayer);
    else memoriser = true;
  })();
}

export async function initPage() {
  try {
    const donnees = await chargerDonnees();
    const { config } = donnees;
    nettoyer(new Set(donnees.produits.map((p) => p.id)));
    const header = creerHeader(config);
    document.querySelector('.skip-link').after(header);
    if (config.annonce) header.before(el('div', { class: 'announce' }, el('p', { class: 'container' }, config.annonce)));
    document.body.append(creerFooter(config));
    if (!['produit', 'panier'].includes(document.body.dataset.page)) document.body.append(creerBoutonFlottant(config));
    remplirDepuisConfig(config);
    majInterface();
    // Statistiques : une vue par page ; la fiche produit envoie la sienne (une ligne par article)
    initStats(config);
    const page = document.body.dataset.page;
    if (page === 'catalogue') {
      const q = new URLSearchParams(location.search);
      vuePage(q.get('cat') ? `/catalogue/${q.get('cat')}` : '/catalogue');
      if (q.get('q')) suivre('recherche', { mots: q.get('q').slice(0, 60) });
    } else if (page !== 'produit') vuePage(`/${page === 'accueil' ? '' : page}`);
    return donnees;
  } catch (err) {
    console.error(err);
    const main = document.querySelector('main');
    if (main) {
      main.prepend(
        el(
          'div',
          { class: 'container', role: 'alert' },
          etatVide({
            icone: 'alerte',
            titre: 'Impossible de charger le site',
            texte: 'Vérifie ta connexion internet, puis recharge la page.',
            actions: [{ texte: 'Recharger', onClick: () => location.reload() }],
          })
        )
      );
    }
    return null;
  }
}
