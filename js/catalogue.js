// Page catalogue : recherche + filtres (?q= ?cat= ?type= ?marque= ?tri= dans l'URL, pour retrouver la même vue en revenant en arrière).
// Tous les articles sont mélangés.
// - Catégories : celles marquées « toujours_visible » dans config.json, plus celles qui contiennent des articles.
// - Types : proposés seulement quand une catégorie est choisie, et uniquement ceux de cette catégorie.
import { initPage, creerCarte, el, restaurerPosition } from './main.js';
import { norm, marquesDe } from './data.js';

const donnees = await initPage();

if (donnees) {
  const { categories, types, produits } = donnees;
  const grille = document.getElementById('catalogue-grille');
  const zoneFiltres = document.getElementById('catalogue-filtres');
  const compteur = document.getElementById('catalogue-compteur');
  const selectTri = document.getElementById('catalogue-tri');
  const selectMarque = document.getElementById('catalogue-marque');
  const champRecherche = document.getElementById('recherche-globale');

  const categoriesVisibles = categories.filter(
    (c) => c.toujours_visible || produits.some((p) => p.categorie === c.id)
  );
  const typesDe = (idCategorie) => {
    const cat = categories.find((c) => c.id === idCategorie);
    return ((cat && cat.types) || []).map((id) => types.find((t) => t.id === id)).filter(Boolean);
  };

  // Marques : « Nike × Syna World » compte pour Nike et pour Syna World
  const toutes = new Set(produits.map((p) => norm(p.marque || '')).filter(Boolean));
  const dedoublonne = new Map(); // clé normalisée -> nom affiché
  for (const p of produits) {
    p.marquesListe = marquesDe(p, toutes);
    for (const m of p.marquesListe) if (!dedoublonne.has(norm(m))) dedoublonne.set(norm(m), m);
  }
  const marquesCles = (p) => p.marquesListe.map(norm);
  const listeMarques = [...dedoublonne.entries()]
    .map(([cle, nom]) => ({ cle, nom, n: produits.filter((p) => marquesCles(p).includes(cle)).length }))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
  selectMarque.replaceChildren(
    el('option', { value: '' }, 'Toutes'),
    ...listeMarques.map((m) => el('option', { value: m.cle }, `${m.nom} (${m.n})`))
  );

  // Texte de recherche de chaque article (sans accents ni majuscules)
  const nomCat = (id) => (categories.find((c) => c.id === id) || {}).nom || '';
  const nomType = (id) => (types.find((t) => t.id === id) || {}).nom || '';
  for (const p of produits) {
    p.recherche = norm(
      [p.nom, p.marque, p.description, (p.couleurs || []).join(' '), nomCat(p.categorie), nomType(p.type)].join(' ')
    );
  }

  const params = new URLSearchParams(location.search);
  const etat = { categorie: 'tous', type: 'tous' };
  if (categoriesVisibles.some((c) => c.id === params.get('cat'))) etat.categorie = params.get('cat');
  if (typesDe(etat.categorie).some((t) => t.id === params.get('type'))) etat.type = params.get('type');

  // Les articles sans prix passent toujours en dernier
  const cmp = (sens) => (a, b) => {
    if (a.prix == null || b.prix == null) return (a.prix == null) - (b.prix == null);
    return sens * (a.prix - b.prix);
  };
  const parMarque = (a, b) => {
    if (!a.marque || !b.marque) return (!a.marque) - (!b.marque); // sans marque en dernier
    return a.marquesListe[0].localeCompare(b.marquesListe[0], 'fr', { sensitivity: 'base' });
  };
  const TRIS = { 'prix-asc': cmp(1), 'prix-desc': cmp(-1), marque: parMarque };
  let tri = TRIS[params.get('tri')] ? params.get('tri') : '';
  selectTri.value = tri;
  selectTri.addEventListener('change', () => {
    tri = selectTri.value;
    afficher();
  });

  let marque = listeMarques.some((m) => m.cle === params.get('marque')) ? params.get('marque') : '';
  selectMarque.value = marque;
  selectMarque.addEventListener('change', () => {
    marque = selectMarque.value;
    afficher();
  });

  let requete = (params.get('q') || '').slice(0, 80);
  champRecherche.value = requete;
  let minuteur;
  champRecherche.addEventListener('input', () => {
    clearTimeout(minuteur);
    minuteur = setTimeout(() => {
      requete = champRecherche.value.trim();
      afficher();
    }, 150);
  });
  champRecherche.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') champRecherche.blur(); // referme le clavier sur téléphone
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
    const mots = norm(requete).split(/\s+/).filter(Boolean);
    const liste = produits.filter(
      (p) =>
        (etat.categorie === 'tous' || p.categorie === etat.categorie) &&
        (etat.type === 'tous' || p.type === etat.type) &&
        (!marque || marquesCles(p).includes(marque)) &&
        mots.every((m) => p.recherche.includes(m))
    );
    if (tri) liste.sort(TRIS[tri]);
    grille.replaceChildren(
      ...(liste.length
        ? liste.map(creerCarte)
        : [
            el(
              'li',
              { class: 'empty' },
              requete || marque || etat.categorie !== 'tous'
                ? 'Aucun article ne correspond. Essaie un autre mot ou retire un filtre.'
                : "Aucun article pour l'instant. Reviens bientôt."
            ),
          ])
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
    if (marque) url.searchParams.set('marque', marque);
    else url.searchParams.delete('marque');
    if (requete) url.searchParams.set('q', requete);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }

  zoneFiltres.replaceChildren(
    groupe('categorie', categoriesVisibles),
    conteneurType
  );
  majGroupeType();
  afficher();
  restaurerPosition();
}
