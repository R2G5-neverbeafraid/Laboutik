// Page d'accueil : drop en cours, catégories, nouveautés, avis.
import { initPage, creerCarte, el } from './main.js';

const donnees = await initPage();

if (donnees) {
  const { config, categories, produits } = donnees;

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
          el('dt', {}, 'Arrivée estimée à Kinshasa'),
          el('dd', {}, config.drop.arrivee)
        ),
        el('a', { class: 'btn', href: 'catalogue.html' }, 'Voir les articles du drop')
      )
    );
  } else {
    zoneDrop.closest('section').hidden = true;
  }

  // Catégories
  document.getElementById('categories').replaceChildren(
    ...categories.map((c) => el('a', { class: 'cat-tile', href: `catalogue.html?cat=${c.id}` }, c.nom))
  );

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
