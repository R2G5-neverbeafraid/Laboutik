// Statistiques de visites et de commandes, anonymes et sans cookies (service Umami).
// Inactif tant que `statistiques.site_id` est vide dans data/config.json : le site marche pareil, rien n'est envoyé.
// Jamais de nom, d'adresse ni de numéro dans ce qui est envoyé : seulement la page, l'article, les quantités, le total, la commune.

let actif = false;
const attente = []; // appels faits avant que le script du service soit chargé

function envoyer(args) {
  if (!actif) return;
  if (window.umami?.track) {
    try {
      window.umami.track(...args);
    } catch {
      /* les statistiques ne doivent jamais casser le site */
    }
  } else if (attente.length < 50) attente.push(args);
}

/** À appeler une fois par page, avec la config du site. */
export function initStats(config) {
  const s = config?.statistiques;
  if (actif || !s?.site_id) return;
  actif = true;
  const script = document.createElement('script');
  script.defer = true;
  script.src = s.script || 'https://cloud.umami.is/script.js';
  script.dataset.websiteId = s.site_id;
  script.dataset.autoTrack = 'false'; // on envoie nous-mêmes les pages, pour avoir une ligne par article
  if (s.domaines) script.dataset.domains = s.domaines; // ne compte que le vrai site (pas les tests)
  script.addEventListener('load', () => attente.splice(0).forEach(envoyer));
  script.addEventListener('error', () => {
    actif = false;
    attente.length = 0;
  });
  document.head.append(script);
}

/** Compte une visite de page. `chemin` remplace l'adresse (ex. « /produit/vet-102 »), `titre` le titre affiché dans le tableau de bord. */
export function vuePage(chemin, titre) {
  envoyer([(props) => ({ ...props, url: chemin || props.url, title: titre || document.title })]);
}

/** Compte un événement (ajout au panier, commande…). `donnees` : valeurs simples seulement. */
export function suivre(nom, donnees) {
  envoyer(donnees ? [nom, donnees] : [nom]);
}
