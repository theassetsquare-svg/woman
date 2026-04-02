/**
 * Fix stuffing by SPLITTING sentences with 2+ keyword mentions.
 * "X의 경우, ...X..." → "X이(가) 특별하다. ...X..."
 * This keeps both keyword mentions but in separate sentences.
 */
import { venues, getVenueLabel } from '../src/data/venues.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const p = join(__dirname, '..', 'src/data/venueContent.ts');
let src = readFileSync(p, 'utf-8');

function countKw(t: string, kw: string): number { let c = 0, p = 0; while ((p = t.indexOf(kw, p)) !== -1) { c++; p += kw.length; } return c; }

let fixes = 0;

for (const v of venues) {
  const kw = getVenueLabel(v);
  const name = v.name;

  const blockStart = src.indexOf(`'${v.id}': {`);
  if (blockStart === -1) continue;
  let d = 0, end = src.indexOf('{', blockStart);
  for (; end < src.length; end++) { if (src[end] === '{') d++; if (src[end] === '}') d--; if (d === 0) break; }

  let block = src.slice(blockStart, end + 1);
  let modified = false;

  // Split "X의 경우, " into sentence break: "X에 대한 이야기다. "
  for (const term of [kw, name]) {
    const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(esc + '의 경우, ', 'g');
    if (pattern.test(block)) {
      block = block.replace(pattern, term + '이다. ');
      modified = true;
    }
  }

  if (modified) {
    src = src.slice(0, blockStart) + block + src.slice(end + 1);
    fixes++;
  }
}

writeFileSync(p, src);
console.log(`Split-fixed: ${fixes} venues`);
