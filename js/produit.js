// Fiche produit : lit ?id=, affiche les options et construit le lien WhatsApp.
import { initPage, creerCarte, el } from './main.js';
import { formaterPrix, STATUTS } from './data.js';
import { lienCommande } from './whatsapp.js';

const PLACEHOLDER = 'assets/img/placeholder.svg';
const donnees = await initPage();
const conteneur = document.getElementById('produit');

function introuvable() {
  conteneur.replaceChildren(
    el(
      'div',
      { class: 'empty' },
      el('p', {}, 'Cet article est introuvable.'),
      el('a', { class: 'btn', href: 'catalogue.html' }, 'Voir le catalogue')
    )
  );
}

function groupeOptions(nom, legende, valeurs) {
  const auto = valeurs.length === 1;
  return el(
    'fieldset',
    { class: 'option-group' },
    el('legend', {}, legende),
    el(
      'div',
      { class: 'options' },
      valeurs.map((v, i) =>
        el(
          'label',
          { class: 'option' },
          el('input', { type: 'radio', name: nom, value: v, checked: auto && i === 0 }),
          el('span', {}, v)
        )
      )
    )
  );
}

if (donnees) {
  const { config, produits, categories } = donnees;
  const id = new URLSearchParams(location.search).get('id');
  const p = produits.find((x) => x.id === id);

  if (!p) {
    document.title = `Article introuvable — ${config.nom}`;
    introuvable();
  } else {
    document.title = `${p.nom} — ${config.nom}`;
    const photos = p.photos && p.photos.length ? p.photos : [PLACEHOLDER];
    const sansPhoto = !(p.photos && p.photos.length);

    // Galerie
    const principale = el('img', {
      src: photos[0],
      alt: sansPhoto ? `${p.nom} (photo à venir)` : p.nom,
      width: 800,
      height: 1000,
    });
    const galerie = el('div', { class: 'gallery' }, el('div', { class: 'gallery__main' }, principale));
    if (photos.length > 1) {
      const vignettes = photos.map((src, i) => {
        const b = el(
          'button',
          { type: 'button', 'aria-label': `Photo ${i + 1}`, 'aria-current': String(i === 0) },
          el('img', { src, alt: '', width: 64, height: 80, loading: 'lazy' })
        );
        b.addEventListener('click', () => {
          principale.src = src;
          vignettes.forEach((v) => v.setAttribute('aria-current', String(v === b)));
        });
        return b;
      });
      galerie.append(el('div', { class: 'gallery__thumbs' }, vignettes));
    }

    // Infos + options
    const cat = categories.find((c) => c.id === p.categorie);
    const epuise = p.statut === 'epuise';
    const erreur = el('p', { class: 'form-error', role: 'alert' });
    const bouton = el(
      'a',
      { class: 'btn btn--wa btn--block', href: '#', 'aria-disabled': epuise ? 'true' : false },
      epuise ? 'Article épuisé' : 'Commander sur WhatsApp'
    );
    const form = el(
      'form',
      { novalidate: true },
      p.tailles.length ? groupeOptions('taille', 'Taille', p.tailles) : null,
      p.couleurs.length ? groupeOptions('couleur', 'Couleur', p.couleurs) : null,
      erreur,
      bouton
    );

    // Taille / couleur : obligatoires seulement si l'article en propose
    const choix = () => ({
      taille: form.querySelector('input[name="taille"]:checked')?.value,
      couleur: form.querySelector('input[name="couleur"]:checked')?.value,
    });
    const manque = ({ taille, couleur }) => [
      p.tailles.length && !taille ? 'une taille' : null,
      p.couleurs.length && !couleur ? 'une couleur' : null,
    ].filter(Boolean);

    function majLien() {
      const c = choix();
      const { taille, couleur } = c;
      if (!manque(c).length && !epuise) {
        bouton.href = lienCommande(config, p, taille, couleur);
        bouton.target = '_blank';
        bouton.rel = 'noopener';
        erreur.textContent = '';
      }
    }
    form.addEventListener('change', majLien);
    form.addEventListener('submit', (e) => e.preventDefault());
    bouton.addEventListener('click', (e) => {
      if (epuise) return e.preventDefault();
      const m = manque(choix());
      if (m.length) {
        e.preventDefault();
        erreur.textContent = `Choisis ${m.join(' et ')}.`;
      }
    });
    majLien();

    const infos = el(
      'div',
      { class: 'product__info' },
      el('span', { class: `badge badge--${p.statut}` }, STATUTS[p.statut] || p.statut),
      el('h1', {}, p.nom),
      el('p', { class: 'product__price' }, formaterPrix(p.prix)),
      el('p', {}, p.description),
      form,
      el(
        'p',
        { class: 'note' },
        p.statut === 'precommande'
          ? 'Article en pré-commande : il arrive avec le prochain drop. '
          : '',
        el('a', { href: 'a-propos.html' }, 'Comment ça marche ?')
      )
    );

    conteneur.replaceChildren(
      el(
        'p',
        { class: 'breadcrumb container' },
        el('a', { href: 'catalogue.html' }, 'Catalogue'),
        cat ? ' / ' : '',
        cat ? el('a', { href: `catalogue.html?cat=${cat.id}` }, cat.nom) : ''
      ),
      el('div', { class: 'container product' }, galerie, infos)
    );

    // Autres articles de la même catégorie
    const proches = produits.filter((x) => x.id !== p.id && x.categorie === p.categorie).slice(0, 4);
    if (proches.length) {
      conteneur.append(
        el(
          'section',
          { class: 'section container', 'aria-labelledby': 't-proches' },
          el('p', { class: 'eyebrow' }, 'Dans la même catégorie'),
          el('h2', { id: 't-proches' }, 'À voir aussi'),
          el('ul', { class: 'grid-products' }, proches.map(creerCarte))
        )
      );
    }
  }
}
