/**
 * gen:card-copy — Reads venues.ts and validates card copy fields.
 * Run: npm run gen:card-copy
 */
import { readFileSync } from 'fs';

const BANNED = ['해당', '이곳', '공간', '매장', '감도', '기준'];
const MAX_REPEAT = 3;

const src = readFileSync('src/data/venues.ts', 'utf8');

// Extract card_hook values
const hooks = [...src.matchAll(/card_hook:\s*'([^']+)'/g)].map(m => m[1]);
const values = [...src.matchAll(/card_value:\s*'([^']+)'/g)].map(m => m[1]);
const tags = [...src.matchAll(/card_tags:\s*'([^']+)'/g)].map(m => m[1]);

let errors = 0;

// Check banned words
const allCopy = [...hooks, ...values, ...tags].join(' ');
for (const word of BANNED) {
  if (allCopy.includes(word)) {
    console.error(`BANNED WORD FOUND: "${word}"`);
    errors++;
  }
}

// Check hook line count (max 2 lines via \n)
hooks.forEach((h, i) => {
  const lines = h.split('\\n').length;
  if (lines > 2) {
    console.error(`Hook #${i + 1} has ${lines} lines (max 2): ${h.substring(0, 40)}...`);
    errors++;
  }
});

// Check value length (max ~60 chars for 1-line fit)
values.forEach((v, i) => {
  if (v.length > 60) {
    console.error(`Value #${i + 1} too long (${v.length} chars, max 60): ${v.substring(0, 40)}...`);
    errors++;
  }
});

// Check repetition: count meaningful words (>2 chars) across all copy
const wordCount = {};
const words = allCopy.replace(/[\\n·,—\-()]/g, ' ').split(/\s+/).filter(w => w.length > 2);
for (const w of words) {
  wordCount[w] = (wordCount[w] || 0) + 1;
}
const overused = Object.entries(wordCount).filter(([, c]) => c > MAX_REPEAT);
if (overused.length > 0) {
  console.warn('REPETITION WARNINGS (> 3 uses):');
  overused.forEach(([w, c]) => console.warn(`  "${w}" × ${c}`));
  // Allow region names and store names as exceptions
}

// Check uniqueness: no duplicate hooks
const uniqueHooks = new Set(hooks);
if (uniqueHooks.size !== hooks.length) {
  console.error('DUPLICATE HOOKS DETECTED');
  errors++;
}

// Summary
console.log(`\n--- gen:card-copy QA ---`);
console.log(`Venues: ${hooks.length}`);
console.log(`Hooks: ${hooks.length} | Values: ${values.length} | Tags: ${tags.length}`);
console.log(`Banned words: ${errors === 0 ? 'CLEAN' : errors + ' issues'}`);
console.log(`Duplicate hooks: ${uniqueHooks.size === hooks.length ? 'NONE' : 'FOUND'}`);
console.log(errors === 0 ? 'QA PASSED' : `QA FAILED (${errors} errors)`);
process.exit(errors > 0 ? 1 : 0);
