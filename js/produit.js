// Fiche produit : lit ?id=, affiche les options et construit le lien WhatsApp.
import { initPage, creerCarte, el, pastille, restaurerPosition } from './main.js';
import { formaterPrix, STATUTS, srcPhoto, couleursPhoto, memeCouleur } from './data.js';
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

/** Choix de couleur : pastilles rondes (le nom de la couleur choisie s'affiche à côté du titre). */
function groupeCouleurs(valeurs) {
  const auto = valeurs.length === 1;
  const courante = el('span', { class: 'option-current' }, auto ? valeurs[0] : '');
  return el(
    'fieldset',
    { class: 'option-group' },
    el('legend', {}, 'Couleur', el('span', { class: 'option-sep' }, ' : '), courante),
    el(
      'div',
      { class: 'options options--swatches' },
      valeurs.map((v, i) =>
        el(
          'label',
          { class: 'swatch-opt', title: v },
          el('input', { type: 'radio', name: 'couleur', value: v, checked: auto && i === 0, 'aria-label': v }),
          pastille(v)
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
    const brutes = p.photos && p.photos.length ? p.photos : [PLACEHOLDER];
    const photos = brutes.map((ph) => ({ src: srcPhoto(ph), couleurs: couleursPhoto(ph) }));
    const sansPhoto = !(p.photos && p.photos.length);

    // Galerie : on glisse d'une photo à l'autre (défilement horizontal), les vignettes servent de repères
    const piste = el('div', {
      class: 'gallery__track',
      tabindex: '0',
      role: 'group',
      'aria-roledescription': 'carrousel',
      'aria-label': photos.length > 1 ? `Photos de ${p.nom} : glisse pour voir les autres` : `Photo de ${p.nom}`,
    });
    photos.forEach(({ src }, i) =>
      piste.append(
        el(
          'div',
          { class: 'gallery__slide' },
          el('img', {
            src,
            alt: sansPhoto ? `${p.nom} (photo à venir)` : `${p.nom}, photo ${i + 1}`,
            width: 800,
            height: 1000,
            loading: i === 0 ? 'eager' : 'lazy',
            decoding: 'async',
            draggable: 'false',
          })
        )
      )
    );
    const galerie = el('div', { class: 'gallery' }, el('div', { class: 'gallery__main' }, piste));
    let vignettes = [];
    let courante = 0;
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function afficherPhoto(i, defiler = true) {
      courante = i;
      vignettes.forEach((v, j) => v.setAttribute('aria-current', String(j === i)));
      if (defiler) piste.scrollTo({ left: i * piste.clientWidth, behavior: reduit ? 'auto' : 'smooth' });
    }
    if (photos.length > 1) {
      vignettes = photos.map(({ src, couleurs }, i) => {
        const b = el(
          'button',
          { type: 'button', 'aria-label': couleurs.length === 1 ? `Photo ${i + 1} (${couleurs[0]})` : `Photo ${i + 1}`, 'aria-current': String(i === 0) },
          el('img', { src, alt: '', width: 64, height: 80, loading: 'lazy' })
        );
        b.addEventListener('click', () => afficherPhoto(i));
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
      p.couleurs.length ? groupeCouleurs(p.couleurs) : null,
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
    // Choisir une couleur affiche la photo de cette couleur ; glisser vers une photo d'une couleur choisit cette couleur
    const nomCouleur = form.querySelector('.option-current');
    function marquerCouleur(nom) {
      if (nomCouleur) nomCouleur.textContent = nom || '';
    }
    form.addEventListener('change', (e) => {
      if (e.target.name !== 'couleur') return;
      marquerCouleur(e.target.value);
      const i = photos.findIndex((ph) => ph.couleurs.some((c) => memeCouleur(c, e.target.value)));
      if (i >= 0 && i !== courante) afficherPhoto(i);
    });
    let minuteur;
    piste.addEventListener('scroll', () => {
      clearTimeout(minuteur);
      minuteur = setTimeout(() => {
        const i = Math.round(piste.scrollLeft / piste.clientWidth);
        if (i === courante || i < 0 || i >= photos.length) return;
        afficherPhoto(i, false);
        const { couleurs } = photos[i];
        if (couleurs.length !== 1) return;
        const radio = [...form.querySelectorAll('input[name="couleur"]')].find((r) => memeCouleur(r.value, couleurs[0]));
        if (radio && !radio.checked) {
          radio.checked = true;
          marquerCouleur(radio.value);
          majLien();
        }
      }, 90);
    });
    piste.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' && courante < photos.length - 1) afficherPhoto(courante + 1);
      if (e.key === 'ArrowLeft' && courante > 0) afficherPhoto(courante - 1);
    });
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
      p.marque ? el('p', { class: 'eyebrow' }, p.marque) : null,
      el('h1', {}, p.nom),
      el('p', { class: 'product__price' }, formaterPrix(p.prix)),
      p.description ? el('p', {}, p.description) : null,
      form,
      el(
        'p',
        { class: 'note' },
        p.statut === 'precommande'
          ? p.marque
            ? "Article de marque en précommande : acheté auprès d'un revendeur officiel après ta commande, puis livré. "
            : 'Article en pré-commande : il arrive avec le prochain drop. '
          : '',
        el('a', { href: 'a-propos.html' }, 'Comment ça marche ?')
      )
    );

    // Bouton « Retour » : ramène à la page d'où l'on vient, avec ses filtres et sa position (adresse transmise par la carte)
    const retourBrut = new URLSearchParams(location.search).get('retour') || '';
    const retour = /^[\w-]+\.html(\?[^#\s]*)?$/.test(retourBrut) ? retourBrut : 'catalogue.html';
    const boutonRetour = el('a', { class: 'back-link', href: retour }, '← Retour');
    conteneur.replaceChildren(
      el(
        'p',
        { class: 'breadcrumb container' },
        boutonRetour,
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

restaurerPosition();
