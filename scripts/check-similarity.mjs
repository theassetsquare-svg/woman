/**
 * check-similarity.mjs
 *
 * Calculates trigram-based Jaccard similarity between all venue page pairs.
 * Combines text from venueContent.ts (intro, sections, summary, quickPlan, faq, conclusion)
 * and venues.ts (description, card_hook) for each venue.
 *
 * Usage: node scripts/check-similarity.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// 1. Parse venueContent.ts — extract the content record
// ---------------------------------------------------------------------------
const contentRaw = readFileSync(resolve(ROOT, 'src/data/venueContent.ts'), 'utf-8');

/**
 * Evaluate the TS content object in a safe-ish way.
 * We strip the TS type annotations and eval the plain JS object literal.
 */
function parseContentTs(raw) {
  // Extract everything between `const content: Record<string, VenueContent> = {` and the closing `};`
  const startMarker = /const\s+content[^=]*=\s*\{/;
  const startMatch = raw.match(startMarker);
  if (!startMatch) throw new Error('Could not find content object start');

  const startIdx = startMatch.index + startMatch[0].length - 1; // include the opening {
  // Find matching closing brace
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx; i < raw.length; i++) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) throw new Error('Could not find content object end');

  const objectStr = raw.substring(startIdx, endIdx + 1);

  // Clean up TS-specific syntax for eval
  // - template literals with backticks are valid JS
  // - single-quoted keys are valid JS
  // We wrap in parentheses so eval returns the value
  const fn = new Function(`return (${objectStr})`);
  return fn();
}

const contentData = parseContentTs(contentRaw);

// ---------------------------------------------------------------------------
// 2. Parse venues.ts — extract venue array
// ---------------------------------------------------------------------------
const venuesRaw = readFileSync(resolve(ROOT, 'src/data/venues.ts'), 'utf-8');

function parseVenuesTs(raw) {
  // Extract the venues array
  const startMarker = /export\s+const\s+venues\s*:\s*Venue\[\]\s*=\s*\[/;
  const startMatch = raw.match(startMarker);
  if (!startMatch) throw new Error('Could not find venues array start');

  const startIdx = startMatch.index + startMatch[0].length - 1; // include [
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx; i < raw.length; i++) {
    if (raw[i] === '[') depth++;
    else if (raw[i] === ']') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) throw new Error('Could not find venues array end');

  let arrayStr = raw.substring(startIdx, endIdx + 1);
  // Remove TS `as const` if present
  arrayStr = arrayStr.replace(/\bas\s+const\b/g, '');

  const fn = new Function(`return (${arrayStr})`);
  return fn();
}

const venuesData = parseVenuesTs(venuesRaw);

// Build a map from venue id to { description, card_hook }
const venueInfoMap = {};
for (const v of venuesData) {
  venueInfoMap[v.id] = {
    name: v.name,
    description: v.description || '',
    card_hook: v.card_hook || '',
  };
}

// ---------------------------------------------------------------------------
// 3. Combine all text for each venue
// ---------------------------------------------------------------------------
function extractAllText(venueId) {
  const parts = [];

  // From venues.ts
  const info = venueInfoMap[venueId];
  if (info) {
    parts.push(info.description);
    parts.push(info.card_hook);
  }

  // From venueContent.ts
  const c = contentData[venueId];
  if (c) {
    // intro
    if (c.intro) parts.push(c.intro);

    // summary
    if (c.summary && Array.isArray(c.summary)) {
      parts.push(c.summary.join(' '));
    }

    // sections
    if (c.sections && Array.isArray(c.sections)) {
      for (const s of c.sections) {
        if (s.title) parts.push(s.title);
        if (s.body) parts.push(s.body);
      }
    }

    // quickPlan
    if (c.quickPlan) {
      if (c.quickPlan.decision) parts.push(c.quickPlan.decision);
      if (c.quickPlan.scenarios) parts.push(c.quickPlan.scenarios.join(' '));
      if (c.quickPlan.costNote) parts.push(c.quickPlan.costNote);
    }

    // faq
    if (c.faq && Array.isArray(c.faq)) {
      for (const f of c.faq) {
        if (f.q) parts.push(f.q);
        if (f.a) parts.push(f.a);
      }
    }

    // conclusion
    if (c.conclusion) parts.push(c.conclusion);
  }

  return parts.join('\n');
}

// Get all venue IDs (union of both sources)
const allVenueIds = [...new Set([
  ...Object.keys(contentData),
  ...venuesData.map(v => v.id),
])];

// Build text map
const venueTexts = {};
for (const id of allVenueIds) {
  venueTexts[id] = extractAllText(id);
}

// ---------------------------------------------------------------------------
// 4. Trigram-based Jaccard similarity
// ---------------------------------------------------------------------------

/**
 * Generate a Set of character trigrams from a string.
 * Whitespace and punctuation are kept — they're part of the text rhythm.
 * However, we normalize whitespace to single spaces to reduce noise.
 */
function trigrams(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const set = new Set();
  for (let i = 0; i <= normalized.length - 3; i++) {
    set.add(normalized.substring(i, i + 3));
  }
  return set;
}

function jaccardSimilarity(setA, setB) {
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  if (union === 0) return 0;
  return intersection / union;
}

// Pre-compute trigram sets
const trigramSets = {};
for (const id of allVenueIds) {
  trigramSets[id] = trigrams(venueTexts[id]);
}

// ---------------------------------------------------------------------------
// 5. Calculate all pairwise similarities
// ---------------------------------------------------------------------------
const pairs = [];
for (let i = 0; i < allVenueIds.length; i++) {
  for (let j = i + 1; j < allVenueIds.length; j++) {
    const idA = allVenueIds[i];
    const idB = allVenueIds[j];
    const sim = jaccardSimilarity(trigramSets[idA], trigramSets[idB]);
    pairs.push({ a: idA, b: idB, similarity: sim });
  }
}

// Sort by similarity descending
pairs.sort((x, y) => y.similarity - x.similarity);

// ---------------------------------------------------------------------------
// 6. Output results
// ---------------------------------------------------------------------------
function venueName(id) {
  const info = venueInfoMap[id];
  return info ? `${info.name} (${id})` : id;
}

function pct(v) {
  return (v * 100).toFixed(2) + '%';
}

console.log('='.repeat(80));
console.log('  VENUE PAGE TEXT SIMILARITY ANALYSIS (Trigram Jaccard)');
console.log('='.repeat(80));
console.log();
console.log(`Total venues analyzed: ${allVenueIds.length}`);
console.log(`Total pairs compared: ${pairs.length}`);

// Overall average
const avgSim = pairs.reduce((acc, p) => acc + p.similarity, 0) / pairs.length;
console.log(`\nOverall average similarity: ${pct(avgSim)}`);

// Top 10 most similar
console.log('\n' + '-'.repeat(80));
console.log('  TOP 10 MOST SIMILAR PAIRS');
console.log('-'.repeat(80));
for (let i = 0; i < Math.min(10, pairs.length); i++) {
  const p = pairs[i];
  console.log(`  ${(i + 1).toString().padStart(2)}. ${pct(p.similarity).padStart(7)}  ${venueName(p.a)}  <->  ${venueName(p.b)}`);
}

// Bottom 5 least similar
console.log('\n' + '-'.repeat(80));
console.log('  BOTTOM 5 LEAST SIMILAR PAIRS');
console.log('-'.repeat(80));
const bottom = pairs.slice(-5).reverse();
for (let i = 0; i < bottom.length; i++) {
  const p = bottom[i];
  console.log(`  ${(i + 1).toString().padStart(2)}. ${pct(p.similarity).padStart(7)}  ${venueName(p.a)}  <->  ${venueName(p.b)}`);
}

// Per-venue average similarity
console.log('\n' + '-'.repeat(80));
console.log('  PER-VENUE AVERAGE SIMILARITY (each venue vs all others)');
console.log('-'.repeat(80));

const perVenue = {};
for (const id of allVenueIds) {
  perVenue[id] = { total: 0, count: 0 };
}
for (const p of pairs) {
  perVenue[p.a].total += p.similarity;
  perVenue[p.a].count++;
  perVenue[p.b].total += p.similarity;
  perVenue[p.b].count++;
}

const perVenueAvg = allVenueIds.map(id => ({
  id,
  avg: perVenue[id].count > 0 ? perVenue[id].total / perVenue[id].count : 0,
  charCount: venueTexts[id].length,
  trigramCount: trigramSets[id].size,
}));

perVenueAvg.sort((a, b) => b.avg - a.avg);

console.log(`  ${'Rank'.padEnd(5)} ${'Avg Sim'.padStart(8)}  ${'Chars'.padStart(7)}  ${'Trigrams'.padStart(8)}  Venue`);
console.log('  ' + '-'.repeat(75));
for (let i = 0; i < perVenueAvg.length; i++) {
  const v = perVenueAvg[i];
  console.log(`  ${(i + 1).toString().padEnd(5)} ${pct(v.avg).padStart(8)}  ${v.charCount.toString().padStart(7)}  ${v.trigramCount.toString().padStart(8)}  ${venueName(v.id)}`);
}

// Quick distribution summary
console.log('\n' + '-'.repeat(80));
console.log('  SIMILARITY DISTRIBUTION');
console.log('-'.repeat(80));
const brackets = [
  { label: '>=50%', min: 0.50, max: 1.01 },
  { label: '40-50%', min: 0.40, max: 0.50 },
  { label: '30-40%', min: 0.30, max: 0.40 },
  { label: '20-30%', min: 0.20, max: 0.30 },
  { label: '10-20%', min: 0.10, max: 0.20 },
  { label: '<10%', min: 0, max: 0.10 },
];
for (const b of brackets) {
  const count = pairs.filter(p => p.similarity >= b.min && p.similarity < b.max).length;
  const bar = '#'.repeat(Math.round(count / pairs.length * 60));
  console.log(`  ${b.label.padEnd(8)} ${count.toString().padStart(4)} pairs  ${bar}`);
}

console.log('\n' + '='.repeat(80));
