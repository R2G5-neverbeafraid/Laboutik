// Page catalogue : grille + filtres par catégorie (?cat= dans l'URL).
import { initPage, creerCarte, el } from './main.js';

const donnees = await initPage();

if (donnees) {
  const { categories, produits } = donnees;
  const grille = document.getElementById('catalogue-grille');
  const filtres = document.getElementById('catalogue-filtres');
  const compteur = document.getElementById('catalogue-compteur');

  const idsValides = new Set(categories.map((c) => c.id));
  let active = new URLSearchParams(location.search).get('cat');
  if (!idsValides.has(active)) active = 'tous';

  function afficher() {
    const liste = active === 'tous' ? produits : produits.filter((p) => p.categorie === active);
    grille.replaceChildren(...liste.map(creerCarte));
    compteur.textContent = `${liste.length} article${liste.length > 1 ? 's' : ''}`;
    filtres.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.cat === active));
    });
    const url = new URL(location.href);
    if (active === 'tous') url.searchParams.delete('cat');
    else url.searchParams.set('cat', active);
    history.replaceState(null, '', url);
  }

  const boutons = [{ id: 'tous', nom: 'Tous' }, ...categories].map((c) => {
    const b = el('button', { type: 'button', class: 'chip', 'data-cat': c.id, 'aria-pressed': 'false' }, c.nom);
    b.addEventListener('click', () => {
      active = c.id;
      afficher();
    });
    return b;
  });
  filtres.replaceChildren(...boutons);
  afficher();
}
