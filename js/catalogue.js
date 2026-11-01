// Page catalogue : grille + filtres (?cat= ?type= ?tri= dans l'URL). Tous les articles sont mélangés.
// - Catégories : celles marquées « toujours_visible » dans config.json, plus celles qui contiennent des articles.
// - Types : proposés seulement quand une catégorie est choisie, et uniquement ceux de cette catégorie.
import { initPage, creerCarte, el } from './main.js';

const donnees = await initPage();

if (donnees) {
  const { categories, types, produits } = donnees;
  const grille = document.getElementById('catalogue-grille');
  const zoneFiltres = document.getElementById('catalogue-filtres');
  const compteur = document.getElementById('catalogue-compteur');
  const selectTri = document.getElementById('catalogue-tri');

  const categoriesVisibles = categories.filter(
    (c) => c.toujours_visible || produits.some((p) => p.categorie === c.id)
  );
  const typesDe = (idCategorie) => {
    const cat = categories.find((c) => c.id === idCategorie);
    return ((cat && cat.types) || []).map((id) => types.find((t) => t.id === id)).filter(Boolean);
  };

  const params = new URLSearchParams(location.search);
  const etat = { categorie: 'tous', type: 'tous' };
  if (categoriesVisibles.some((c) => c.id === params.get('cat'))) etat.categorie = params.get('cat');
  if (typesDe(etat.categorie).some((t) => t.id === params.get('type'))) etat.type = params.get('type');

  const TRIS = { 'prix-asc': (a, b) => a.prix - b.prix, 'prix-desc': (a, b) => b.prix - a.prix };
  let tri = TRIS[params.get('tri')] ? params.get('tri') : '';
  selectTri.value = tri;
  selectTri.addEventListener('change', () => {
    tri = selectTri.value;
    afficher();
  });

  const PARAM = { categorie: 'cat', type: 'type' };
  const LEGENDE = { categorie: 'Catégorie', type: 'Type' };

  function groupe(cle, options) {
    const boutons = [{ id: 'tous', nom: 'Tous' }, ...options].map((x) => {
      const b = el(
        'button',
        { type: 'button', class: 'chip', 'data-cle': cle, 'data-val': x.id, 'aria-pressed': 'false' },
        x.nom
      );
      b.addEventListener('click', () => {
        etat[cle] = x.id;
        if (cle === 'categorie') {
          etat.type = 'tous'; // les types dépendent de la catégorie
          majGroupeType();
        }
        afficher();
      });
      return b;
    });
    return el('div', { class: 'filters', role: 'group', 'aria-label': LEGENDE[cle] }, boutons);
  }

  // Le groupe « Type » est reconstruit à chaque changement de catégorie
  const conteneurType = el('div', {});
  function majGroupeType() {
    const options = etat.categorie === 'tous' ? [] : typesDe(etat.categorie);
    conteneurType.replaceChildren(...(options.length ? [groupe('type', options)] : []));
  }

  function afficher() {
    const liste = produits.filter(
      (p) =>
        (etat.categorie === 'tous' || p.categorie === etat.categorie) &&
        (etat.type === 'tous' || p.type === etat.type)
    );
    if (tri) liste.sort(TRIS[tri]);
    grille.replaceChildren(
      ...(liste.length
        ? liste.map(creerCarte)
        : [el('li', { class: 'empty' }, "Aucun article pour l'instant. Reviens bientôt.")])
    );
    compteur.textContent = `${liste.length} article${liste.length > 1 ? 's' : ''}`;
    zoneFiltres.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(etat[b.dataset.cle] === b.dataset.val));
    });
    const url = new URL(location.href);
    for (const cle of Object.keys(PARAM)) {
      if (etat[cle] === 'tous') url.searchParams.delete(PARAM[cle]);
      else url.searchParams.set(PARAM[cle], etat[cle]);
    }
    if (tri) url.searchParams.set('tri', tri);
    else url.searchParams.delete('tri');
    history.replaceState(null, '', url);
  }

  zoneFiltres.replaceChildren(
    groupe('categorie', categoriesVisibles),
    conteneurType
  );
  majGroupeType();
  afficher();
}
