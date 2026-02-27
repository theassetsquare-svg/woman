/**
 * Phase 5 – Search index verification
 * Asserts that every store name returns at least 1 result.
 * Run: node scripts/test-search.mjs
 */

// Inline search logic (mirrors src/utils/searchIndex.ts)
// We import venues data directly since we can't import TS in Node

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const venuesPath = resolve(__dirname, '../src/data/venues.ts');
const source = readFileSync(venuesPath, 'utf-8');

// Extract venue names from source
const nameRegex = /name:\s*'([^']+)'/g;
const names = [];
let match;
while ((match = nameRegex.exec(source)) !== null) {
  names.push(match[1]);
}

// Extract venue ids
const idRegex = /id:\s*'([^']+)'/g;
const ids = [];
while ((match = idRegex.exec(source)) !== null) {
  ids.push(match[1]);
}

// Extract all searchable fields per venue
const venueBlocks = source.split(/\n  \{/).slice(1);

function normalize(s) {
  return s.toLowerCase().replace(/\s+/g, '').trim();
}

// Build simple index from extracted names
const entries = [];
for (let i = 0; i < names.length; i++) {
  // Extract tags for this venue
  const block = venueBlocks[i] || '';
  const tagsMatch = block.match(/tags:\s*\[([^\]]+)\]/);
  const tags = tagsMatch
    ? tagsMatch[1].match(/'([^']+)'/g)?.map((t) => t.replace(/'/g, '')) || []
    : [];

  const areaMatch = block.match(/area:\s*'([^']+)'/);
  const area = areaMatch ? areaMatch[1] : '';

  const regionMatch = block.match(/region:\s*'([^']+)'/);
  const region = regionMatch ? regionMatch[1] : '';

  entries.push({
    name: names[i],
    id: ids[i],
    tokens: [names[i], area, region, ...tags].map(normalize),
  });
}

function search(query) {
  const q = normalize(query);
  if (!q) return [];

  const results = [];
  const seen = new Set();

  // Exact name match
  for (const e of entries) {
    if (normalize(e.name) === q) {
      results.push({ ...e, matchType: 'exact' });
      seen.add(e.id);
    }
  }

  // Partial match
  for (const e of entries) {
    if (seen.has(e.id)) continue;
    if (e.tokens.some((t) => t.includes(q)) || normalize(e.name).includes(q)) {
      results.push({ ...e, matchType: 'partial' });
      seen.add(e.id);
    }
  }

  return results;
}

// ===== TESTS =====
let passed = 0;
let failed = 0;

console.log('=== Search Index Test ===\n');
console.log(`Found ${names.length} venues\n`);

// Test 1: Every store name returns at least 1 result
console.log('--- Test: store name exact search ---');
for (const name of names) {
  const results = search(name);
  if (results.length === 0) {
    console.log(`  FAIL: "${name}" returned 0 results`);
    failed++;
  } else {
    const first = results[0];
    if (first.matchType === 'exact') {
      passed++;
    } else {
      console.log(`  WARN: "${name}" matched as partial, not exact (got ${first.name})`);
      passed++;
    }
  }
}

// Test 2: Partial name search
console.log('\n--- Test: partial name search ---');
const partialTests = [
  ['보스', '보스턴'],
  ['미슐', '미슐랭'],
  ['비스', '비스트'],
  ['플러', '플러팅진혁'],
  ['어벤', '어벤져스'],
];

for (const [query, expected] of partialTests) {
  const results = search(query);
  const found = results.some((r) => r.name === expected);
  if (found) {
    passed++;
  } else {
    console.log(`  FAIL: "${query}" did not find "${expected}"`);
    failed++;
  }
}

// Test 3: Region search
console.log('\n--- Test: region/area search ---');
const regionTests = [
  ['강남', 2],  // At least 2 강남 venues
  ['해운대', 3], // At least 3 해운대 venues
  ['수원', 4],  // 4 수원 venues
];

for (const [query, minCount] of regionTests) {
  const results = search(query);
  if (results.length >= minCount) {
    passed++;
  } else {
    console.log(`  FAIL: "${query}" returned ${results.length} results, expected >= ${minCount}`);
    failed++;
  }
}

// Test 4: Empty query
const emptyResults = search('');
if (emptyResults.length === 0) {
  passed++;
} else {
  console.log('  FAIL: empty query returned results');
  failed++;
}

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nAll search tests PASSED!');
}
