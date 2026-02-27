/**
 * Content QA lint script for venue content.
 * Checks: banned words, FAQ opener diversity, store name mention count (8-10).
 * Run: node scripts/lint-content.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Load venues data to get store names ---
const venuesSource = readFileSync(resolve(__dirname, '../src/data/venues.ts'), 'utf-8');
const venueNames = {};
const nameRegex = /id:\s*'([^']+)',\s*name:\s*'([^']+)'/g;
let m;
while ((m = nameRegex.exec(venuesSource)) !== null) {
  venueNames[m[1]] = m[2];
}

// --- Load content data ---
const contentSource = readFileSync(resolve(__dirname, '../src/data/venueContent.ts'), 'utf-8');

// --- Config ---
const BANNED_WORDS = ['해당', '이곳', '공간', '매장', '감도', '기준'];
const MIN_NAME_MENTIONS = 8;
const MAX_NAME_MENTIONS = 10;

// --- Extract content blocks per venue ---
// We'll parse the TS file to extract all text content per venue
function extractVenueBlocks(source) {
  const venues = {};
  // Split by venue ID keys
  const blockRegex = /'([a-z]+-[a-z0-9-]+)':\s*\{/g;
  const ids = [];
  let bm;
  while ((bm = blockRegex.exec(source)) !== null) {
    ids.push({ id: bm[1], start: bm.index });
  }

  for (let i = 0; i < ids.length; i++) {
    const start = ids[i].start;
    const end = i + 1 < ids.length ? ids[i + 1].start : source.length;
    venues[ids[i].id] = source.slice(start, end);
  }
  return venues;
}

// Extract all string literals from a block
function extractStrings(block) {
  const strings = [];
  // Match template literals
  const tplRegex = /`([^`]*)`/gs;
  let sm;
  while ((sm = tplRegex.exec(block)) !== null) {
    strings.push(sm[1]);
  }
  // Match single-quoted strings (longer than 5 chars to skip keys)
  const sqRegex = /'([^']{6,})'/g;
  while ((sm = sqRegex.exec(block)) !== null) {
    strings.push(sm[1]);
  }
  return strings.join('\n');
}

// Extract FAQ questions
function extractFaqQuestions(block) {
  const questions = [];
  const faqRegex = /q:\s*['"`]([^'"`]+)['"`]/g;
  let fm;
  while ((fm = faqRegex.exec(block)) !== null) {
    questions.push(fm[1]);
  }
  return questions;
}

const venueBlocks = extractVenueBlocks(contentSource);
let totalErrors = 0;
let totalWarnings = 0;

console.log('=== Content QA Lint ===\n');

for (const [id, block] of Object.entries(venueBlocks)) {
  const name = venueNames[id];
  if (!name) continue;

  const allText = extractStrings(block);
  const errors = [];
  const warnings = [];

  // 1. Banned words check
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word, 'g');
    const matches = allText.match(regex);
    if (matches) {
      errors.push(`BANNED WORD "${word}" found ${matches.length}x`);
    }
  }

  // 2. Store name mention count
  const nameRegex = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const nameMatches = allText.match(nameRegex);
  const nameCount = nameMatches ? nameMatches.length : 0;
  if (nameCount < MIN_NAME_MENTIONS) {
    warnings.push(`Store name "${name}" mentioned ${nameCount}x (min ${MIN_NAME_MENTIONS})`);
  } else if (nameCount > MAX_NAME_MENTIONS) {
    warnings.push(`Store name "${name}" mentioned ${nameCount}x (max ${MAX_NAME_MENTIONS})`);
  }

  // 3. FAQ opener diversity
  const faqQuestions = extractFaqQuestions(block);
  if (faqQuestions.length > 0) {
    const openers = faqQuestions.map(q => q.slice(0, 3));
    const openerSet = new Set(openers);
    if (openerSet.size < openers.length) {
      const dupes = openers.filter((o, i) => openers.indexOf(o) !== i);
      warnings.push(`FAQ opener duplicates: ${[...new Set(dupes)].join(', ')}`);
    }
  }
  if (faqQuestions.length < 10) {
    errors.push(`FAQ count: ${faqQuestions.length} (min 10)`);
  }

  // Report
  if (errors.length > 0 || warnings.length > 0) {
    console.log(`[${id}] ${name}`);
    for (const e of errors) {
      console.log(`  ❌ ${e}`);
      totalErrors++;
    }
    for (const w of warnings) {
      console.log(`  ⚠️  ${w}`);
      totalWarnings++;
    }
    console.log();
  }
}

console.log('---');
console.log(`Total: ${totalErrors} errors, ${totalWarnings} warnings`);
if (totalErrors > 0) {
  console.log('FAIL: Fix all errors before deploying.');
  process.exit(1);
} else if (totalWarnings > 0) {
  console.log('PASS with warnings.');
} else {
  console.log('ALL CLEAR!');
}
