// Chargement des données (data/*.json). Résultats mis en cache pour la session.
let cache = null;

async function charger(url) {
  const rep = await fetch(url);
  if (!rep.ok) throw new Error(`Impossible de charger ${url} (${rep.status})`);
  return rep.json();
}

export function chargerDonnees() {
  if (!cache) {
    cache = Promise.all([charger('data/config.json'), charger('data/produits.json')])
      .then(([config, catalogue]) => ({
        config,
        categories: config.categories || [],
        types: config.types || [],
        produits: catalogue.produits,
      }))
      .catch((err) => {
        cache = null; // permet de réessayer
        throw err;
      });
  }
  return cache;
}

export const STATUTS = {
  dispo: 'En stock',
  precommande: 'Pré-commande',
  epuise: 'Épuisé',
};

export function formaterPrix(prix) {
  return prix == null ? 'Prix à confirmer' : `${prix} $`;
}

/** Une photo est soit un chemin (texte), soit { src, couleur } pour lier la photo à une couleur. */
export const srcPhoto = (ph) => (typeof ph === 'string' ? ph : ph.src);
/** Couleur(s) liée(s) à une photo : toujours une liste (vide si la photo n'est pas liée à une couleur). */
export const couleursPhoto = (ph) => (typeof ph === 'string' || !ph.couleur ? [] : [].concat(ph.couleur));

export const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’`]/g, "'");

// Teintes des pastilles (clés sans accents). Une couleur composée (« Noir / gris », « Noir liseré gris ») donne une pastille bicolore.
const TEINTES = {
  'noir': '#121212', 'gris neon': '#c4dc3a', 'blanc casse': '#ece8df', 'blanc': '#f7f7f4', 'gris clair': '#cfcfcb', 'gris chine': '#b4b4b0',
  'gris fonce': '#585858', 'gris': '#9a9a96', 'anthracite': '#3b3d40', 'beige sable': '#d9c7a3', 'beige': '#d8c4a0', 'camel': '#c9a77a',
  'creme': '#f0e6cf', 'marron': '#6b4a32', 'chocolat': '#4a2e1f', 'bordeaux': '#6d1a2b', 'rouge': '#c0272d',
  'rose': '#f0509a', 'peche': '#f8b79a', 'orange': '#f08a2c', 'jaune': '#f2d94e', 'vert olive': '#6b6b3a', 'vert fluo': '#b6f21c',
  'kaki': '#7a7a4a', "vert d'eau": '#a7d8c5', 'vert menthe': '#9fe5c9', 'menthe': '#9fe5c9', 'vert': '#3f8f55',
  'turquoise': '#2fc6b3', 'bleu ciel': '#8fc6ee', 'bleu poudre': '#8fa9cf', 'bleu clair': '#a9cdee', 'bleu roi': '#2748c5', 'bleu marine': '#1c2a4d',
  'bleu nuit': '#101b3a', 'bleu': '#2f6fd1', 'marine': '#1c2a4d', 'lavande': '#b9a6e0', 'violet': '#7a3fb0',
  'transparent': '#e6eef2', 'camouflage': '#5b6340',
};
const CLES = Object.keys(TEINTES).sort((a, b) => b.length - a.length);

/** Fond CSS d'une pastille de couleur à partir de son nom (jusqu'à 2 teintes reconnues). */
export function fondCouleur(nom) {
  let reste = norm(nom);
  const trouvees = [];
  for (const cle of CLES) {
    const i = reste.indexOf(cle);
    if (i >= 0) {
      trouvees.push([i, TEINTES[cle]]);
      reste = reste.slice(0, i) + ' '.repeat(cle.length) + reste.slice(i + cle.length);
    }
  }
  const hex = trouvees.sort((a, b) => a[0] - b[0]).map((t) => t[1]).slice(0, 2);
  if (!hex.length) return '#cfcfcb';
  return hex.length === 1 ? hex[0] : `linear-gradient(135deg, ${hex[0]} 50%, ${hex[1]} 50%)`;
}

export const memeCouleur = (a, b) => norm(a) === norm(b);

/**
 * Marques d'un article, pour le filtre « Marque » : « Nike × Syna World » → Nike et Syna World.
 * Un nom entre parenthèses (« NOCTA (Nike x Drake) ») n'est gardé que s'il est lui-même une marque du catalogue.
 */
export function marquesDe(produit, toutesLesMarques) {
  const brut = produit.marque || '';
  if (!brut) return [];
  const dansParentheses = (brut.match(/\(([^)]*)\)/) || [])[1];
  const principal = brut.replace(/\([^)]*\)/, '').split(/\s*(?:×|\/)\s*/).map((m) => m.trim()).filter(Boolean);
  const bonus = dansParentheses
    ? dansParentheses.split(/\s+x\s+/i).map((m) => m.trim()).filter((m) => toutesLesMarques.has(norm(m)))
    : [];
  return [...new Set([...principal, ...bonus])];
}
