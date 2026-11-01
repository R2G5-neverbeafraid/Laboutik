// Page d'accueil : hero (image optionnelle), drop en cours, catégories, sélection, avis.
import { initPage, creerCarte, el } from './main.js';

const donnees = await initPage();

if (donnees) {
  const { config, categories, produits } = donnees;

  // Image du hero : affichée seulement si config.hero_image est renseigné
  if (config.hero_image) {
    const inner = document.getElementById('hero-inner');
    inner.classList.add('hero__inner--image');
    inner.append(
      el(
        'div',
        { class: 'hero__image' },
        el('img', { src: config.hero_image, alt: '', width: 800, height: 1000, decoding: 'async' })
      )
    );
  }

  // Drop en cours
  const zoneDrop = document.getElementById('drop');
  if (config.drop && config.drop.actif) {
    zoneDrop.replaceChildren(
      el(
        'div',
        { class: 'drop' },
        el('h2', {}, config.drop.titre),
        el('p', {}, config.drop.description),
        el(
          'dl',
          {},
          el('dt', {}, 'Clôture des pré-commandes'),
          el('dd', {}, config.drop.cloture),
          el('dt', {}, 'Arrivée estimée'),
          el('dd', {}, config.drop.arrivee)
        ),
        el('a', { class: 'btn', href: 'catalogue.html' }, 'Voir les articles du drop')
      )
    );
  } else {
    zoneDrop.closest('section').hidden = true;
  }

  // Catégories : seulement celles qui contiennent des articles (parfums etc. apparaîtront d'eux-mêmes)
  const comptes = {};
  produits.forEach((p) => (comptes[p.categorie] = (comptes[p.categorie] || 0) + 1));
  document.getElementById('categories').replaceChildren(
    ...categories
      .filter((c) => comptes[c.id])
      .map((c) =>
        el(
          'a',
          { class: 'cat-tile', href: `catalogue.html?cat=${c.id}` },
          el('span', { class: 'cat-tile__name' }, c.nom),
          el('span', { class: 'cat-tile__count' }, `${comptes[c.id]} article${comptes[c.id] > 1 ? 's' : ''}`)
        )
      )
  );

  // Gamme Marques : bande visible seulement s'il y a des articles de marque
  if (produits.some((p) => p.gamme === 'marques')) document.getElementById('marques').hidden = false;

  // Sélection (4 premiers articles)
  document.getElementById('selection').replaceChildren(...produits.slice(0, 4).map(creerCarte));

  // Avis : affichés uniquement s'il y en a de réels dans config.json
  const zoneAvis = document.getElementById('avis');
  if (config.avis && config.avis.length) {
    zoneAvis.replaceChildren(
      ...config.avis.map((a) =>
        el('blockquote', { class: 'quote' }, el('p', {}, a.texte), el('cite', {}, a.auteur))
      )
    );
  } else {
    zoneAvis.closest('section').hidden = true;
  }
}
