// Favoris (« j'aime ») et panier, mémorisés dans le navigateur (localStorage) : pas de compte, pas de serveur.
// Chaque changement déclenche l'événement « lb-change » pour mettre à jour l'en-tête, les cœurs et les pages.
export const EVENEMENT = 'lb-change';
const CLE_FAVORIS = 'lb-favoris';
const CLE_PANIER = 'lb-panier';
const QTE_MAX = 99;
const secours = {}; // utilisé si le navigateur bloque le stockage (navigation privée…)

const texte = (v) => (typeof v === 'string' ? v.slice(0, 60) : '');

function lire(cle) {
  try {
    const v = JSON.parse(localStorage.getItem(cle) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return Array.isArray(secours[cle]) ? secours[cle] : [];
  }
}

function ecrire(cle, valeur) {
  secours[cle] = valeur;
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    /* stockage indisponible : on garde la valeur en mémoire pour cette visite */
  }
  window.dispatchEvent(new Event(EVENEMENT));
}

// ---------- Favoris ----------
export const favoris = () => lire(CLE_FAVORIS).filter((id) => typeof id === 'string' && id);
export const estFavori = (id) => favoris().includes(id);

/** Ajoute ou retire un favori. Renvoie true si l'article est maintenant en favori. */
export function basculerFavori(id) {
  const liste = favoris();
  const i = liste.indexOf(id);
  if (i >= 0) liste.splice(i, 1);
  else liste.unshift(id);
  ecrire(CLE_FAVORIS, liste);
  return i < 0;
}

// ---------- Panier : lignes { id, taille, couleur, qte } ----------
export const cleLigne = (l) => `${l.id}|${l.taille}|${l.couleur}`;

export function panier() {
  return lire(CLE_PANIER)
    .filter((l) => l && typeof l.id === 'string' && l.id)
    .map((l) => ({
      id: l.id,
      taille: texte(l.taille),
      couleur: texte(l.couleur),
      qte: Math.min(QTE_MAX, Math.max(1, parseInt(l.qte, 10) || 1)),
    }));
}

export const nombrePanier = () => panier().reduce((n, l) => n + l.qte, 0);

export function ajouterAuPanier({ id, taille = '', couleur = '' }) {
  const lignes = panier();
  const nouvelle = { id, taille: texte(taille), couleur: texte(couleur), qte: 1 };
  const existante = lignes.find((l) => cleLigne(l) === cleLigne(nouvelle));
  if (existante) existante.qte = Math.min(QTE_MAX, existante.qte + 1);
  else lignes.push(nouvelle);
  ecrire(CLE_PANIER, lignes);
}

export function changerQuantite(cle, delta) {
  const lignes = panier()
    .map((l) => (cleLigne(l) === cle ? { ...l, qte: Math.min(QTE_MAX, l.qte + delta) } : l))
    .filter((l) => l.qte > 0);
  ecrire(CLE_PANIER, lignes);
}

export const retirerDuPanier = (cle) => ecrire(CLE_PANIER, panier().filter((l) => cleLigne(l) !== cle));
export const viderPanier = () => ecrire(CLE_PANIER, []);

/** Retire des favoris et du panier les articles qui ne sont plus au catalogue. */
export function nettoyer(idsValides) {
  const f = favoris();
  const fOk = f.filter((id) => idsValides.has(id));
  if (fOk.length !== f.length) ecrire(CLE_FAVORIS, fOk);
  const p = panier();
  const pOk = p.filter((l) => idsValides.has(l.id));
  if (pOk.length !== p.length) ecrire(CLE_PANIER, pOk);
}
