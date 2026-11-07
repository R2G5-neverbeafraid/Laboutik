// Animation de marque : cercle (K) qui se dessine, mots qui défilent, pastilles de couleur.
// Une seule source pour deux usages :
//  - variante « site »    : filigrane derrière le titre de l'accueil (boucle de 12 s, très légère, sans fichier vidéo) ;
//  - variante « reseaux » : vidéo verticale 1080×1920 (boucle de 15 s) rendue en MP4 par outils/animation/rendre.js.
// Tout est animé avec l'API Web Animations (opacité, déplacement) : la même timeline se rejoue image par image pour la vidéo.
const NS = 'http://www.w3.org/2000/svg';
const OUT = 'cubic-bezier(.16,1,.3,1)';
const INOUT = 'cubic-bezier(.65,0,.35,1)';
const POLICES = ['900 100px Archivo', '600 100px Saira', '500 20px "IBM Plex Mono"'];
const PASTILLES = ['#0e0e0e', '#5b6340', '#d8c4a0', '#6b4a32', '#8fc6ee'];
const OLIVE_CLAIR = '#a9b37e';
const BLANC = '#f4f4f1';

const el = (tag, style = {}, texte, cls) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  Object.assign(n.style, style);
  if (texte != null) n.textContent = texte;
  return n;
};

function formaterTel(n) {
  const s = String(n || '').replace(/\D/g, '');
  if (s.startsWith('243') && s.length === 12) return `+243 ${s.slice(3, 5)} ${s.slice(5, 8)} ${s.slice(8, 10)} ${s.slice(10)}`;
  return s ? `+${s}` : '';
}
function pseudo(url) {
  try {
    const p = new URL(url).pathname.split('/').filter(Boolean)[0] || '';
    return p ? (p.startsWith('@') ? p : `@${p}`) : '';
  } catch {
    return '';
  }
}

function anneau(taille, rayon, epaisseur, couleur) {
  const c0 = taille / 2;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${taille} ${taille}`);
  svg.setAttribute('width', taille);
  svg.setAttribute('height', taille);
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';
  const g = document.createElementNS(NS, 'g');
  g.style.transformOrigin = `${c0}px ${c0}px`;
  const cercle = document.createElementNS(NS, 'circle');
  cercle.setAttribute('cx', c0);
  cercle.setAttribute('cy', c0);
  cercle.setAttribute('r', rayon);
  cercle.setAttribute('fill', 'none');
  cercle.setAttribute('stroke', couleur);
  cercle.setAttribute('stroke-width', epaisseur);
  cercle.setAttribute('stroke-linecap', 'round');
  cercle.setAttribute('pathLength', '1');
  cercle.style.strokeDasharray = '1';
  cercle.style.strokeDashoffset = '1';
  cercle.style.transformOrigin = `${c0}px ${c0}px`;
  cercle.style.transform = 'rotate(-90deg)';
  g.append(cercle);
  svg.append(g);
  return { svg, g, cercle };
}

/** Monte l'animation dans `conteneur`. Renvoie { duree, anims, pause, play, seek(t) }. */
export async function monterAnimation(conteneur, variante = 'site', { config = {}, fixe = false } = {}) {
  await Promise.all(POLICES.map((f) => document.fonts.load(f).catch(() => {})));
  const site = variante === 'site';
  const T = site ? 12 : 15;
  const W = site ? 600 : 1080;
  const H = site ? 600 : 1920;
  const anims = [];

  /** keyframes à temps absolus (secondes) : pts = [[t, props, easing?], …] */
  function piste(e, pts) {
    const k = pts.map(([t, props, easing]) => ({ offset: Math.min(1, Math.max(0, t / T)), ...props, ...(easing ? { easing } : {}) }));
    if (k[0].offset > 0) k.unshift({ ...k[0], offset: 0, easing: undefined });
    if (k[k.length - 1].offset < 1) k.push({ ...k[k.length - 1], offset: 1, easing: undefined });
    anims.push(e.animate(k, { duration: T * 1000, iterations: Infinity, fill: 'both' }));
  }
  /** apparaît à t0, disparaît à t1 (fondu + glissement) */
  function visible(e, t0, t1, o = {}) {
    const { entree = 0.5, sortie = 0.4, de = 'translateY(30px)', vers = 'translateY(0px)', fin = 'translateY(-20px)' } = o;
    const cache = (tr) => ({ opacity: 0, transform: tr });
    piste(e, [[0, cache(de)], [t0, cache(de), OUT], [t0 + entree, { opacity: 1, transform: vers }], [t1, { opacity: 1, transform: vers }, INOUT], [t1 + sortie, cache(fin)]]);
  }
  /** dessine le cercle entre t0 et t0+d, l'efface entre t1 et t1+d2 (même sens) */
  function dessiner(c, t0, d, t1, d2) {
    piste(c, [[0, { strokeDashoffset: 1 }], [t0, { strokeDashoffset: 1 }, INOUT], [t0 + d, { strokeDashoffset: 0 }], [t1, { strokeDashoffset: 0 }, INOUT], [t1 + d2, { strokeDashoffset: -1 }]]);
  }
  function pulse(g, t0, d, amp = 1.06) {
    piste(g, [[0, { transform: 'scale(1)' }], [t0, { transform: 'scale(1)' }, INOUT], [t0 + d / 2, { transform: `scale(${amp})` }, INOUT], [t0 + d, { transform: 'scale(1)' }]]);
  }
  /** taille de police réduite si le texte dépasse la largeur disponible */
  function ajuster(span, max, largeur) {
    span.style.fontSize = `${max}px`;
    const w = span.offsetWidth;
    if (w > largeur) span.style.fontSize = `${Math.floor((max * largeur) / w)}px`;
  }

  const scene = el('div', { position: 'absolute', left: '0', top: '0', width: `${W}px`, height: `${H}px`, overflow: 'hidden' });
  scene.setAttribute('aria-hidden', 'true');
  conteneur.append(scene);

  if (site) construireSite();
  else construireReseaux();

  // ---------------------------------------------------------------- site (600 × 600, couleur = texte du thème)
  function construireSite() {
    scene.style.color = 'var(--c-text)';
    const cx = 300;
    const cy = 250;
    const mot = (txt, top, taille, poids, famille, extra = {}) =>
      el('div', { position: 'absolute', left: '0', top: `${top}px`, width: `${W}px`, textAlign: 'center', fontFamily: famille, fontWeight: poids, fontSize: `${taille}px`, lineHeight: '1', ...extra }, txt);

    const a = anneau(W, 150, 4, 'currentColor');
    a.g.style.transformOrigin = `${cx}px ${cy}px`;
    a.cercle.setAttribute('cx', cx);
    a.cercle.setAttribute('cy', cy);
    a.cercle.style.transformOrigin = `${cx}px ${cy}px`;
    scene.append(a.svg);
    dessiner(a.cercle, 0.3, 1.7, 10.9, 0.9);
    pulse(a.g, 9.6, 1.0, 1.05);

    const k = mot('(K)', cy - 62, 124, 600, 'var(--font-logo)', { letterSpacing: '0.03em' });
    scene.append(k);
    visible(k, 1.1, 11.2, { entree: 0.8, sortie: 0.6, de: 'translateY(18px) scale(.9)', vers: 'translateY(0px) scale(1)', fin: 'translateY(-12px) scale(1)' });

    const mots = ['Vêtements', 'Accessoires', 'Couvre-chef', 'Pré-commande', 'Livraison à Kinshasa'];
    const fenetre = el('div', { position: 'absolute', left: '0', top: '440px', width: `${W}px`, height: '72px', overflow: 'hidden' });
    scene.append(fenetre);
    const debut = 2.4;
    const pas = 1.3;
    mots.forEach((m, i) => {
      const s = el('div', { position: 'absolute', left: '0', top: '0', width: `${W}px`, height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
      const t = el('span', { fontFamily: 'var(--font-title)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }, m);
      s.append(t);
      fenetre.append(s);
      ajuster(t, 46, W - 60);
      const t0 = debut + i * pas;
      visible(s, t0, t0 + pas - 0.3, { entree: 0.4, sortie: 0.3, de: 'translateY(60px)', vers: 'translateY(0px)', fin: 'translateY(-60px)' });
    });
    const final = el('div', { position: 'absolute', left: '0', top: '0', width: `${W}px`, height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
    const ft = el('span', { fontFamily: 'var(--font-logo)', fontWeight: 600, letterSpacing: '0.1em', whiteSpace: 'nowrap' }, 'LA BOUTIK');
    final.append(ft);
    fenetre.append(final);
    ajuster(ft, 46, W - 60);
    visible(final, debut + mots.length * pas, 11.0, { entree: 0.5, sortie: 0.4, de: 'translateY(60px)', vers: 'translateY(0px)', fin: 'translateY(-60px)' });

    const rang = el('div', { position: 'absolute', left: '0', top: '540px', width: `${W}px`, display: 'flex', justifyContent: 'center', gap: '16px' });
    scene.append(rang);
    PASTILLES.forEach((c, i) => {
      const p = el('span', { width: '16px', height: '16px', borderRadius: '50%', background: c, boxShadow: '0 0 0 1px rgba(128,128,128,.5)' });
      rang.append(p);
      const t0 = debut + i * pas;
      piste(p, [
        [0, { opacity: 0, transform: 'scale(.2)' }],
        [t0, { opacity: 0, transform: 'scale(.2)' }, OUT],
        [t0 + 0.4, { opacity: 1, transform: 'scale(1.6)' }, INOUT],
        [t0 + pas, { opacity: 1, transform: 'scale(1.6)' }, OUT],
        [t0 + pas + 0.4, { opacity: 1, transform: 'scale(1)' }],
        [10.6, { opacity: 1, transform: 'scale(1)' }, INOUT],
        [11.2, { opacity: 0, transform: 'scale(.4)' }],
      ]);
    });
  }

  // ---------------------------------------------------------------- réseaux (1080 × 1920, fond noir encre)
  function construireReseaux() {
    scene.style.background = '#0e0e0e';
    scene.style.color = BLANC;
    const TITRE = "'Archivo', sans-serif";
    const LOGO = "'Saira', sans-serif";
    const MONO = "'IBM Plex Mono', monospace";
    const centre = (txt, top, taille, poids, famille, couleur, extra = {}) =>
      el('div', { position: 'absolute', left: '0', top: `${top}px`, width: `${W}px`, textAlign: 'center', fontFamily: famille, fontWeight: poids, fontSize: `${taille}px`, color: couleur, lineHeight: '1', ...extra }, txt);

    // fond : grands cercles discrets qui dérivent doucement
    [[-120, 1180, 760], [620, 250, 520], [260, 1560, 420]].forEach(([x, y, d], i) => {
      const f = el('div', { position: 'absolute', left: `${x}px`, top: `${y}px`, width: `${d}px`, height: `${d}px`, borderRadius: '50%', border: '2px solid #1f1f1d' });
      scene.append(f);
      const dx = i % 2 ? -50 : 50;
      piste(f, [[0, { transform: 'translate(0px,0px)' }], [T / 2, { transform: `translate(${dx}px,-60px)` }, INOUT], [T, { transform: 'translate(0px,0px)' }]]);
    });

    // lettres une à une
    function lettres(txt, top, taille, poids, famille, couleur, t0, ecart = 0.06, spacing = '0.05em', t1 = 4.2, sortie = 0.5) {
      const ligne = el('div', { position: 'absolute', left: '0', top: `${top}px`, width: `${W}px`, textAlign: 'center', fontFamily: famille, fontWeight: poids, fontSize: `${taille}px`, color: couleur, lineHeight: '1', letterSpacing: spacing, whiteSpace: 'pre' });
      scene.append(ligne);
      [...txt].forEach((ch, i) => {
        const s = el('span', { display: 'inline-block' }, ch === ' ' ? ' ' : ch);
        ligne.append(s);
        visible(s, t0 + i * ecart, t1, { entree: 0.5, sortie, de: 'translateY(60px)', vers: 'translateY(0px)', fin: 'translateY(-40px)' });
      });
    }

    // ---- A : présentation (0 → 4,8 s)
    const grA = el('div', { position: 'absolute', left: '0', top: '0', width: `${W}px`, height: `${H}px` });
    scene.append(grA);
    piste(grA, [[0, { opacity: 1, transform: 'translateY(0px)' }], [4.2, { opacity: 1, transform: 'translateY(0px)' }, INOUT], [4.8, { opacity: 0, transform: 'translateY(-120px)' }]]);
    const bigA = el('div', { position: 'absolute', left: `${540 - 250}px`, top: `${640 - 250}px`, width: '500px', height: '500px' });
    grA.append(bigA);
    const rA = anneau(500, 210, 9, OLIVE_CLAIR);
    bigA.append(rA.svg);
    dessiner(rA.cercle, 0.4, 1.8, 99, 0.1);
    const kA = centre('(K)', 640 - 100, 200, 600, LOGO, BLANC, { letterSpacing: '0.03em' });
    grA.append(kA);
    visible(kA, 1.4, 99, { entree: 0.9, de: 'translateY(30px) scale(.88)', vers: 'translateY(0px) scale(1)', fin: 'translateY(0px) scale(1)' });
    lettres('LA BOUTIK', 960, 128, 600, LOGO, BLANC, 2.0);
    const tagA = centre('DES VÊTEMENTS ET DES ACCESSOIRES\nDE QUALITÉ POUR TOUS', 1125, 34, 500, MONO, '#b5b5b0', { whiteSpace: 'pre', lineHeight: '1.5', letterSpacing: '0.06em' });
    scene.append(tagA);
    visible(tagA, 3.0, 4.2, { entree: 0.6, sortie: 0.5 });
    const kinA = el('div', { position: 'absolute', left: '0', top: '1275px', width: `${W}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' });
    const ligneK = () => el('div', { width: '90px', height: '3px', background: OLIVE_CLAIR });
    kinA.append(ligneK(), el('div', { fontFamily: LOGO, fontWeight: 500, fontSize: '30px', letterSpacing: '0.5em', color: OLIVE_CLAIR, paddingLeft: '0.5em' }, 'KINSHASA'), ligneK());
    scene.append(kinA);
    visible(kinA, 3.4, 4.2, { entree: 0.6, sortie: 0.5 });

    // ---- B : marque en petit + mots qui défilent
    const mini = el('div', { position: 'absolute', left: '0', top: '262px', width: `${W}px`, height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '22px' });
    const boite = el('div', { position: 'relative', width: '96px', height: '96px' });
    const rm = anneau(96, 44, 4, OLIVE_CLAIR);
    boite.append(rm.svg, el('div', { position: 'absolute', left: '0', top: '0', width: '96px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LOGO, fontWeight: 600, fontSize: '40px' }, '(K)'));
    mini.append(boite, el('div', { fontFamily: LOGO, fontWeight: 600, fontSize: '46px', letterSpacing: '0.05em' }, 'LA BOUTIK'));
    scene.append(mini);
    visible(mini, 4.7, 12.6, { entree: 0.6, sortie: 0.4, de: 'translateY(-20px)', vers: 'translateY(0px)', fin: 'translateY(-20px)' });
    dessiner(rm.cercle, 4.7, 1.0, 12.4, 0.4);

    const FEN_TOP = 640;
    const FEN_H = 440;
    const fenetre = el('div', { position: 'absolute', left: '0', top: `${FEN_TOP}px`, width: `${W}px`, height: `${FEN_H}px`, overflow: 'hidden' });
    scene.append(fenetre);
    const mot = (txt, couleur, famille = TITRE, poids = 900, max = 150) => {
      const s = el('div', { position: 'absolute', left: '0', top: '0', width: `${W}px`, height: `${FEN_H}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' });
      const t = el('span', { fontFamily: famille, fontWeight: poids, textTransform: 'uppercase', color: couleur, textAlign: 'center', lineHeight: '0.92', whiteSpace: 'pre', letterSpacing: '0.01em' }, txt);
      s.append(t);
      fenetre.append(s);
      ajuster(t, max, W - 120);
      return s;
    };
    const mots = ['Vêtements', 'Accessoires', 'Couvre-chef', 'Livraison\nà Kinshasa'];
    const t0 = 4.9;
    const pas = 1.2;
    mots.forEach((m, i) => {
      const s = mot(m, BLANC);
      const a = t0 + i * pas;
      visible(s, a, a + pas - 0.3, { entree: 0.45, sortie: 0.3, de: `translateY(${FEN_H}px)`, vers: 'translateY(0px)', fin: `translateY(-${FEN_H}px)` });
    });
    const rang = el('div', { position: 'absolute', left: '0', top: '1160px', width: `${W}px`, display: 'flex', justifyContent: 'center', gap: '28px' });
    scene.append(rang);
    PASTILLES.slice(0, 4).forEach((c, i) => {
      const p = el('span', { width: '34px', height: '34px', borderRadius: '50%', background: c, boxShadow: '0 0 0 2px rgba(244,244,241,.35)' });
      rang.append(p);
      const a = t0 + i * pas;
      piste(p, [
        [0, { opacity: 0, transform: 'scale(.2)' }],
        [a, { opacity: 0, transform: 'scale(.2)' }, OUT],
        [a + 0.4, { opacity: 1, transform: 'scale(1.5)' }, INOUT],
        [a + pas, { opacity: 1, transform: 'scale(1.5)' }, OUT],
        [a + pas + 0.35, { opacity: 0.55, transform: 'scale(.9)' }],
        [10.6, { opacity: 0.55, transform: 'scale(.9)' }, INOUT],
        [11.1, { opacity: 0, transform: 'scale(.3)' }],
      ]);
    });

    // ---- C : pré-commandes
    const pre = mot('Pré-commandes\nouvertes', OLIVE_CLAIR, TITRE, 900, 132);
    visible(pre, 9.9, 12.7, { entree: 0.5, sortie: 0.4, de: `translateY(${FEN_H}px)`, vers: 'translateY(0px)', fin: `translateY(-${FEN_H}px)` });
    const sous = centre('SUR WHATSAPP  ·  LIVRAISON À KINSHASA', 1130, 34, 500, MONO, BLANC, { letterSpacing: '0.08em' });
    scene.append(sous);
    visible(sous, 10.5, 12.5, { entree: 0.6, sortie: 0.4 });

    // ---- D : carte finale (contacts)
    const bigD = el('div', { position: 'absolute', left: `${540 - 220}px`, top: `${600 - 220}px`, width: '440px', height: '440px' });
    scene.append(bigD);
    const rD = anneau(440, 180, 8, OLIVE_CLAIR);
    bigD.append(rD.svg);
    dessiner(rD.cercle, 12.9, 1.0, 14.6, 0.4);
    const kD = centre('(K)', 600 - 84, 170, 600, LOGO, BLANC, { letterSpacing: '0.03em' });
    scene.append(kD);
    visible(kD, 13.2, 14.6, { entree: 0.6, sortie: 0.4, de: 'translateY(24px) scale(.9)', vers: 'translateY(0px) scale(1)', fin: 'translateY(0px) scale(1)' });
    lettres('LA BOUTIK', 890, 104, 600, LOGO, BLANC, 13.3, 0.045, '0.05em', 14.6, 0.4);
    const wa = formaterTel(config.whatsapp);
    const ig = pseudo(config.instagram);
    const tt = pseudo(config.tiktok);
    const contacts = [['WHATSAPP', wa], ['INSTAGRAM', ig], ['TIKTOK', tt]].filter(([, v]) => v);
    contacts.forEach(([nom, val], i) => {
      const bloc = el('div', { position: 'absolute', left: '0', top: `${1040 + i * 118}px`, width: `${W}px`, textAlign: 'center', lineHeight: '1' });
      bloc.append(el('div', { fontFamily: MONO, fontWeight: 500, fontSize: '26px', letterSpacing: '0.3em', color: OLIVE_CLAIR, paddingLeft: '0.3em' }, nom), el('div', { fontFamily: TITRE, fontWeight: 800, fontSize: '50px', marginTop: '14px', letterSpacing: '0.01em' }, val));
      scene.append(bloc);
      visible(bloc, 13.6 + i * 0.18, 14.6, { entree: 0.5, sortie: 0.4 });
    });
  }

  // mise à l'échelle (site) : le décor carré est calé à droite et occupe la hauteur de la section
  let observeur = null;
  if (site && !fixe) {
    const ajusterEchelle = () => {
      const cw = conteneur.clientWidth;
      const ch = conteneur.clientHeight;
      if (!cw || !ch) return;
      const s = Math.min(cw, ch * 1.1) / W;
      scene.style.left = 'auto';
      scene.style.right = '0';
      scene.style.top = '50%';
      scene.style.transformOrigin = '100% 50%';
      scene.style.transform = `translateY(-50%) scale(${s})`;
    };
    ajusterEchelle();
    observeur = new ResizeObserver(ajusterEchelle);
    observeur.observe(conteneur);
  }

  return {
    duree: T,
    anims,
    pause: () => anims.forEach((a) => a.pause()),
    play: () => anims.forEach((a) => a.play()),
    seek: (t) =>
      anims.forEach((a) => {
        a.pause();
        a.currentTime = (((t % T) + T) % T) * 1000;
      }),
    arreter: () => observeur && observeur.disconnect(),
  };
}
