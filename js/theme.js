// Thème clair / sombre. Script classique, chargé dans le <head> de chaque page pour appliquer le thème AVANT l'affichage (pas de flash).
// - Par défaut : le réglage du navigateur (prefers-color-scheme), géré en CSS.
// - Dès que le visiteur touche le bouton lune / soleil de l'en-tête, son choix est mémorisé (lb-theme) et appliqué partout.
// main.js se sert de window.LBTheme pour ce bouton.
(function () {
  var CLE = 'lb-theme';
  var racine = document.documentElement;

  function lire() {
    try {
      var t = localStorage.getItem(CLE);
      return t === 'light' || t === 'dark' ? t : null;
    } catch (e) {
      return null;
    }
  }
  function systeme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function actuel() {
    return racine.getAttribute('data-theme') || systeme();
  }
  function changer(t) {
    racine.setAttribute('data-theme', t);
    try {
      localStorage.setItem(CLE, t);
    } catch (e) {
      /* stockage indisponible : le choix vaut pour cette visite */
    }
    document.dispatchEvent(new CustomEvent('lb-theme', { detail: t }));
  }

  var choix = lire();
  if (choix) racine.setAttribute('data-theme', choix);

  window.LBTheme = {
    actuel: actuel,
    basculer: function () {
      changer(actuel() === 'dark' ? 'light' : 'dark');
    },
  };

  // Le réglage du navigateur change (jour / nuit) tant que le visiteur n'a rien choisi : on prévient l'en-tête.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var prevenir = function () {
      document.dispatchEvent(new CustomEvent('lb-theme', { detail: actuel() }));
    };
    if (mq.addEventListener) mq.addEventListener('change', prevenir);
  }
})();
