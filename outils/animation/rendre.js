// Rend l'animation de marque en MP4, image par image (30 i/s), avec Playwright + ffmpeg.
// Usage (serveur local lancé à la racine du projet, ex. python3 -m http.server 8797) :
//   node outils/animation/rendre.js reseaux  <sortie.mp4>   → vidéo verticale 1080×1920 (Instagram, TikTok, WhatsApp)
//   node outils/animation/rendre.js site     <sortie.mp4>   → capture de l'accueil (1280 px) avec l'animation en filigrane
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const mode = process.argv[2] || 'reseaux';
const sortie = path.resolve(process.argv[3] || `animation-${mode}.mp4`);
const base = process.env.BASE || 'http://localhost:8797/';
const FPS = 30;

(async () => {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'rendu-'));
  const nav = await chromium.launch();
  let page, duree, clip;
  if (mode === 'reseaux') {
    page = await nav.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    await page.goto(base + 'outils/animation/scene.html');
    await page.waitForFunction('window.__pret === true');
    duree = await page.evaluate('window.__ctrl.duree');
    clip = { x: 0, y: 0, width: 1080, height: 1920 };
  } else {
    page = await nav.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    await page.goto(base + 'index.html');
    await page.waitForSelector('.hero__anim > div');
    await page.waitForTimeout(800);
    duree = 12;
    const r = await page.evaluate(() => { const b = document.querySelector('.hero').getBoundingClientRect(); return { x: 0, y: Math.round(b.top + scrollY), width: 1280, height: Math.round(b.height) }; });
    r.height -= r.height % 2;
    clip = r;
    await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
  }
  const n = Math.round(duree * FPS);
  for (let i = 0; i < n; i++) {
    const t = i / FPS;
    if (mode === 'reseaux') await page.evaluate((t) => window.__ctrl.seek(t), t);
    else await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t * 1000; }), t);
    await page.screenshot({ path: path.join(dossier, String(i).padStart(4, '0') + '.png'), clip, fullPage: mode !== 'reseaux' });
  }
  await nav.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dossier, '%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'slow', '-movflags', '+faststart', sortie]);
  fs.rmSync(dossier, { recursive: true, force: true });
  console.log(`${mode}: ${n} images, ${duree} s → ${sortie}`);
})();
