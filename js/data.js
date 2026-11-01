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
