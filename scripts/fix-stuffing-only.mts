import { venues, getVenueLabel } from '../src/data/venues.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const p = join(__dirname, '..', 'src/data/venueContent.ts');
let src = readFileSync(p, 'utf-8');

let fixed = 0;
for (const v of venues) {
  const name = v.name;
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Remove all "X의 경우, " prefixes — they cause double-name in sentences
  const re = new RegExp(esc + '의 경우, ', 'g');
  const before = src;
  src = src.replace(re, '');
  if (src !== before) fixed++;
}
writeFileSync(p, src);
console.log('Fixed:', fixed, 'venues');
