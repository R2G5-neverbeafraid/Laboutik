// Page « Comment ça marche » : le contenu dynamique (infos pratiques, lien WhatsApp) est rempli par main.js.
import { initPage, restaurerPosition } from './main.js';

await initPage();
restaurerPosition();
