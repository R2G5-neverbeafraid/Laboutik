// Page « Mes favoris » : les articles marqués d'un cœur (mémorisés dans ce navigateur).
import { initPage, creerCarte, el, restaurerPosition } from './main.js';
import { EVENEMENT, favoris } from './stockage.js';

const donnees = await initPage();

if (donnees) {
  const { produits } = donnees;
  const grille = document.getElementById('favoris-grille');
  const compteur = document.getElementById('favoris-compteur');

  function afficher() {
    const ids = favoris();
    const liste = ids.map((id) => produits.find((p) => p.id === id)).filter(Boolean);
    compteur.textContent = liste.length ? `${liste.length} article${liste.length > 1 ? 's' : ''}` : '';
    grille.replaceChildren(
      ...(liste.length
        ? liste.map(creerCarte)
        : [
            el(
              'li',
              { class: 'empty' },
              el('p', {}, "Tu n'as pas encore de favori. Touche le cœur sur un article pour le retrouver ici."),
              el('a', { class: 'btn', href: 'catalogue.html' }, 'Voir le catalogue')
            ),
          ])
    );
  }

  afficher();
  window.addEventListener(EVENEMENT, afficher); // un cœur retiré fait disparaître la carte
  restaurerPosition();
}
