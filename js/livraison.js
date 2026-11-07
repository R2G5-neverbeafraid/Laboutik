// Formulaire « Livraison à Kinshasa » : commune, quartier, avenue, numéro, point de repère, nom.
// Utilisé sur la fiche article (commande directe) et sur la page panier. Les infos partent dans le message WhatsApp.
import { el } from './main.js';
import { communesLivraison, formaterFC, fraisPour } from './data.js';
import { lireLivraison, ecrireLivraison } from './stockage.js';

const CHAMPS = [
  // id, étiquette, requis, aide
  ['nom', 'Nom et prénom', true, 'Pour le livreur'],
  ['quartier', 'Quartier', true, 'ex. Righini, Binza, Kauka…'],
  ['avenue', 'Avenue', true, "Nom de l'avenue ou de la rue"],
  ['numero', 'N° de la maison ou de la parcelle', false, 'Si tu le connais'],
  ['repere', 'Point de repère', false, "ex. en face de l'école, près de l'arrêt de bus…"],
];

/** Renvoie { element, lire(), valider() } : lire() donne les valeurs, valider() vérifie les champs obligatoires. */
export function creerFormulaireLivraison(config) {
  const sauve = lireLivraison();
  const communes = communesLivraison(config);
  const grille = (config.livraison && config.livraison.grille) || [];

  const select = el(
    'select',
    { id: 'liv-commune', name: 'commune', required: true, autocomplete: 'off' },
    el('option', { value: '' }, 'Choisis ta commune'),
    grille.map((z) =>
      el(
        'optgroup',
        { label: `${z.zone} · ${formaterFC(z.frais_fc)}` },
        z.communes.map((nom) => el('option', { value: nom }, nom))
      )
    )
  );
  if (communes.some((c) => c.nom === sauve.commune)) select.value = sauve.commune;

  const frais = el('p', { class: 'delivery__fee', 'aria-live': 'polite' });
  const majFrais = () => {
    const c = fraisPour(config, select.value);
    frais.textContent = c ? `Frais de livraison : ${formaterFC(c.frais)} (${c.zone}), à régler en plus de l'article.` : '';
  };
  majFrais();

  const entrees = {};
  const champs = CHAMPS.map(([id, libelle, requis, aide]) => {
    const input = el('input', {
      id: `liv-${id}`,
      name: id,
      type: 'text',
      maxlength: '80',
      required: requis,
      autocomplete: 'off',
      placeholder: aide,
      value: sauve[id] || '',
    });
    entrees[id] = input;
    return el('div', { class: 'field' }, el('label', { for: `liv-${id}` }, libelle, requis ? el('span', { class: 'field__req', 'aria-hidden': 'true' }, ' *') : el('span', { class: 'field__opt' }, ' (facultatif)')), input);
  });

  const lire = () => ({
    commune: select.value,
    nom: entrees.nom.value.trim(),
    quartier: entrees.quartier.value.trim(),
    avenue: entrees.avenue.value.trim(),
    numero: entrees.numero.value.trim(),
    repere: entrees.repere.value.trim(),
  });

  const sauver = () => ecrireLivraison(lire());
  select.addEventListener('change', () => {
    select.removeAttribute('aria-invalid');
    majFrais();
    sauver();
  });
  Object.values(entrees).forEach((i) =>
    i.addEventListener('input', () => {
      i.removeAttribute('aria-invalid');
      sauver();
    })
  );

  const champCommune = el('div', { class: 'field' }, el('label', { for: 'liv-commune' }, 'Commune', el('span', { class: 'field__req', 'aria-hidden': 'true' }, ' *')), select);

  const element = el(
    'fieldset',
    { class: 'delivery' },
    el('legend', {}, 'Livraison à Kinshasa'),
    el('p', { class: 'note delivery__intro' }, "Dis-nous où te livrer : ça part dans ton message WhatsApp. ", el('a', { href: 'a-propos.html#livraison' }, 'Voir la grille de livraison')),
    champCommune,
    frais,
    champs,
    el('p', { class: 'note' }, 'Ta commune n’est pas dans la liste ? Écris-nous sur WhatsApp, on regarde ensemble.')
  );

  /** Vérifie les champs obligatoires ; marque les champs vides et renvoie la liste des libellés manquants. */
  function valider(focuser = true) {
    const d = lire();
    const manques = [];
    const verifier = (champ, libelle, noeud) => {
      if (!d[champ]) {
        manques.push(libelle);
        noeud.setAttribute('aria-invalid', 'true');
      }
    };
    verifier('commune', 'la commune', select);
    verifier('quartier', 'le quartier', entrees.quartier);
    verifier('avenue', "l'avenue", entrees.avenue);
    verifier('nom', 'ton nom', entrees.nom);
    if (manques.length && focuser) {
      const premier = element.querySelector('[aria-invalid="true"]');
      if (premier) premier.focus({ preventScroll: false });
    }
    return { ok: manques.length === 0, manques, donnees: d };
  }

  return { element, lire, valider };
}

/** « la commune, le quartier et l'avenue » */
export function listeFrancaise(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
}
