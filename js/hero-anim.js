// Animation de marque en filigrane derrière le titre de l'accueil.
// Légère (aucune vidéo à télécharger) et respectueuse : immobile si le visiteur a demandé « moins d'animations »
// ou active l'économiseur de données ; en pause quand la section n'est plus à l'écran.
import { monterAnimation } from './animation-marque.js';

export async function lancerAnimationAccueil(config) {
  const zone = document.querySelector('.hero__anim');
  if (!zone) return;
  const calme =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.connection && navigator.connection.saveData);
  try {
    const anim = await monterAnimation(zone, 'site', { config });
    if (calme) {
      anim.seek(10.2); // image fixe : cercle (K), nom de la boutique et pastilles
      return;
    }
    anim.play();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? anim.play() : anim.pause()), { threshold: 0.05 }).observe(zone);
    }
  } catch (err) {
    console.error(err); // l'animation est décorative : sans elle, la page reste complète
  }
}
