/**
 * Targeted stuffing fix: remove "X의 경우, " prefix ONLY from sentences
 * where the venue name appears AGAIN later in the same sentence.
 * This preserves uniqueness and density while fixing stuffing.
 */
import { venues, getVenueLabel } from '../src/data/venues.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const p = join(__dirname, '..', 'src/data/venueContent.ts');
let src = readFileSync(p, 'utf-8');

function countKw(t: string, kw: string): number { let c = 0, p = 0; while ((p = t.indexOf(kw, p)) !== -1) { c++; p += kw.length; } return c; }

let totalFixes = 0;

for (const v of venues) {
  const kw = getVenueLabel(v);
  const name = v.name;
  const escName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Find sentences in this venue's block that have 2+ kw mentions
  const blockStart = src.indexOf(`'${v.id}': {`);
  if (blockStart === -1) continue;
  let d = 0, end = src.indexOf('{', blockStart);
  for (; end < src.length; end++) { if (src[end] === '{') d++; if (src[end] === '}') d--; if (d === 0) break; }

  let block = src.slice(blockStart, end + 1);
  let modified = false;

  // For both name and keyword patterns, fix double-mentions
  for (const term of [name, kw]) {
    if (term.length < 2) continue;
    const escTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Pattern: "X의 경우, ...X..." → remove "X의 경우, " to leave just one X
    const pattern = new RegExp(escTerm + '의 경우, ((?:(?!' + escTerm + ')[\\s\\S]){0,200}?' + escTerm + ')', 'g');
    const before = block;
    block = block.replace(pattern, '$1');
    if (block !== before) { modified = true; totalFixes++; }
  }

  // Also fix: "X의 간판을 찾아 골목을 걷다 X..." patterns
  for (const term of [name, kw]) {
    const escTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Generic: where term appears in sentence prefix AND again later
    const p2 = new RegExp('(' + escTerm + '[^.!?다요함임음]{0,30})\\s+' + escTerm + '의 경우,', 'g');
    const before = block;
    block = block.replace(p2, '$1');
    if (block !== before) { modified = true; totalFixes++; }
  }

  if (modified) {
    src = src.slice(0, blockStart) + block + src.slice(end + 1);
  }
}

writeFileSync(p, src);
console.log(`Targeted fixes applied: ${totalFixes}`);
