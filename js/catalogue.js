// Page catalogue : grille + filtres par gamme et par catégorie (?gamme= et ?cat= dans l'URL).
// Seules les gammes/catégories qui contiennent des articles sont proposées.
import { initPage, creerCarte, el } from './main.js';

const donnees = await initPage();

if (donnees) {
  const { gammes, categories, produits } = donnees;
  const grille = document.getElementById('catalogue-grille');
  const zoneFiltres = document.getElementById('catalogue-filtres');
  const compteur = document.getElementById('catalogue-compteur');
  const selectTri = document.getElementById('catalogue-tri');

  const utiles = (liste, cle) => liste.filter((x) => produits.some((p) => p[cle] === x.id));
  const listes = {
    gamme: utiles(gammes, 'gamme'),
    categorie: utiles(categories, 'categorie'),
  };
  const params = new URLSearchParams(location.search);
  const actif = {
    gamme: listes.gamme.some((g) => g.id === params.get('gamme')) ? params.get('gamme') : 'tous',
    categorie: listes.categorie.some((c) => c.id === params.get('cat')) ? params.get('cat') : 'tous',
  };
  const TRIS = { 'prix-asc': (a, b) => a.prix - b.prix, 'prix-desc': (a, b) => b.prix - a.prix };
  let tri = TRIS[params.get('tri')] ? params.get('tri') : '';
  selectTri.value = tri;
  selectTri.addEventListener('change', () => {
    tri = selectTri.value;
    afficher();
  });
  const PARAM = { gamme: 'gamme', categorie: 'cat' };
  const LEGENDE = { gamme: 'Gamme', categorie: 'Catégorie' };

  function afficher() {
    const liste = produits.filter(
      (p) =>
        (actif.gamme === 'tous' || p.gamme === actif.gamme) &&
        (actif.categorie === 'tous' || p.categorie === actif.categorie)
    );
    if (tri) liste.sort(TRIS[tri]);
    grille.replaceChildren(
      ...(liste.length ? liste.map(creerCarte) : [el('li', { class: 'empty' }, 'Aucun article dans cette sélection.')])
    );
    compteur.textContent = `${liste.length} article${liste.length > 1 ? 's' : ''}`;
    zoneFiltres.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(actif[b.dataset.type] === b.dataset.val));
    });
    const url = new URL(location.href);
    for (const type of Object.keys(PARAM)) {
      if (actif[type] === 'tous') url.searchParams.delete(PARAM[type]);
      else url.searchParams.set(PARAM[type], actif[type]);
    }
    if (tri) url.searchParams.set('tri', tri);
    else url.searchParams.delete('tri');
    history.replaceState(null, '', url);
  }

  function groupe(type) {
    const boutons = [{ id: 'tous', nom: 'Tous' }, ...listes[type]].map((x) => {
      const b = el(
        'button',
        { type: 'button', class: 'chip', 'data-type': type, 'data-val': x.id, 'aria-pressed': 'false' },
        x.nom
      );
      b.addEventListener('click', () => {
        actif[type] = x.id;
        afficher();
      });
      return b;
    });
    return el('div', { class: 'filters', role: 'group', 'aria-label': LEGENDE[type] }, boutons);
  }

  // Un groupe de filtres n'a d'intérêt que s'il offre un vrai choix (au moins 2 options)
  zoneFiltres.replaceChildren(...Object.keys(listes).filter((t) => listes[t].length > 1).map(groupe));
  afficher();
}
