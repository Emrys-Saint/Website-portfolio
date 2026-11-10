// Scans img/inspiration/ and writes img/inspiration/manifest.json,
// which the EMRYS wordmark reads at runtime to pick a random background
// painting. Run this after adding or removing files in that folder:
//
//   node generate-manifest.mjs
//
// Known works get a curated title/artist/year; anything else gets a
// best-effort title guessed from its filename.

import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = path.join(__dirname, 'img', 'inspiration');
const MANIFEST_PATH = path.join(IMAGE_DIR, 'manifest.json');
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const KNOWN = {
  'plains-of-heaven.jpg': { title: 'The Plains of Heaven', artist: 'John Martin', year: '1851–53' },
  'Belshazzar_Feast_john_martin.jpg': { title: "Belshazzar's Feast", artist: 'John Martin', year: '1820' },
  'last-judgement.jpg': { title: 'The Last Judgement', artist: 'John Martin', year: '1853' },
  'great-day-of-his-wrath.jpg': { title: 'The Great Day of His Wrath', artist: 'John Martin', year: '1851–53' },
  'Destruction_of_Pompeii_and_Herculaneum.jpg': { title: 'The Destruction of Pompeii and Herculaneum', artist: 'John Martin', year: '1822' },
  'Claude_Monet_-_Reflections_of_Clouds_on_the_Water-Lily_Pond.jpg': { title: 'Reflections of Clouds on the Water-Lily Pond', artist: 'Claude Monet', year: '1920' },
  'Saint_Jerome_Writing-Caravaggio_(1605-6).jpg': { title: 'Saint Jerome Writing', artist: 'Caravaggio', year: '1605–06' },
  'Caravaggio_-_Giuditta_e_Oloferne_(ca._1599).jpg': { title: 'Judith Beheading Holofernes', artist: 'Caravaggio', year: 'c. 1599' },
  'La_Liberté_guidant_le_peuple_-_Eugène_Delacroix_-_Musée_du_Louvre_Peintures_RF_129_-_après_restauration_2024.jpg': { title: 'Liberty Leading the People', artist: 'Eugène Delacroix', year: '1830' },
  'Paolo_Veronese_008.jpg': { title: 'The Wedding Feast at Cana', artist: 'Paolo Veronese', year: '1563' },
};

function guessTitle(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  return base
    .replace(/[_-]+/g, ' ')
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .replace(/\s*-?\s*(Google Art Project|Musée du Louvre.*|après restauration.*)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const files = await readdir(IMAGE_DIR);
const images = files
  .filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()))
  .sort()
  .map((filename) => {
    const known = KNOWN[filename];
    return {
      img: `img/inspiration/${filename}`,
      title: known?.title || guessTitle(filename),
      artist: known?.artist || '',
      year: known?.year || '',
    };
  });

await writeFile(MANIFEST_PATH, JSON.stringify(images, null, 2) + '\n', 'utf8');
console.log(`Wrote ${images.length} image(s) to ${path.relative(__dirname, MANIFEST_PATH)}`);
