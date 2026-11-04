// Copia librerías que se cargan dentro del iframe de exportación (no pasan por el bundler).
// Se ejecuta en `postinstall`, así la versión queda fijada por package-lock.json.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  ['node_modules/html2pdf.js/dist/html2pdf.bundle.min.js', 'public/vendor/html2pdf.bundle.min.js'],
];

for (const [from, to] of files) {
  const src = join(root, from);
  if (!existsSync(src)) {
    console.warn(`[copy-vendor] no se encontró ${from}; se omite.`);
    continue;
  }
  mkdirSync(dirname(join(root, to)), { recursive: true });
  copyFileSync(src, join(root, to));
  console.log(`[copy-vendor] ${from} → ${to}`);
}
