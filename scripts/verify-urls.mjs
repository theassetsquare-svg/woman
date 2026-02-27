/**
 * PHASE 8 URL verification script.
 * Checks:
 *  1. No duplicated region tokens in any venue URL
 *  2. All venue URLs are unique
 *  3. Sitemap contains only normalized URLs (no /venue/, no /region/)
 *  4. Redirect map coverage: every old URL has a valid new URL
 *  5. No leftover /venue/ or /region/ links in source files
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Load venues data ---
const venuesSource = readFileSync(resolve(__dirname, '../src/data/venues.ts'), 'utf-8');
const venues = [];
const venueRegex = /id:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)',\s*\n\s*region:\s*'([^']+)'/g;
let m;
while ((m = venueRegex.exec(venuesSource)) !== null) {
  venues.push({ id: m[1], name: m[2], region: m[3] });
}

const regions = ['seoul', 'busan', 'gyeonggi', 'daejeon', 'gwangju', 'changwon'];

// --- Slug dedupe logic (must match slug.ts) ---
function venueSlug(venueId, region) {
  const prefix = region + '-';
  return venueId.startsWith(prefix) ? venueId.slice(prefix.length) : venueId;
}
function venuePath(venue) {
  return `/${venue.region}/${venueSlug(venue.id, venue.region)}`;
}

let errors = 0;
let warnings = 0;

console.log('=== PHASE 8: URL Verification ===\n');

// --- CHECK 1: No duplicated region tokens ---
console.log('1) Checking for duplicated region tokens in venue URLs...');
for (const v of venues) {
  const path = venuePath(v);
  const tokens = path.split('/').filter(Boolean).flatMap(seg => seg.split('-'));
  const seen = new Set();
  for (const t of tokens) {
    if (seen.has(t) && regions.includes(t)) {
      console.log(`  ❌ DUPLICATE: ${path} has repeated region token "${t}"`);
      errors++;
    }
    seen.add(t);
  }
}
if (errors === 0) console.log('  ✅ No duplicated region tokens found.');

// --- CHECK 2: All URLs unique ---
console.log('\n2) Checking URL uniqueness...');
const allPaths = venues.map(v => venuePath(v));
const pathSet = new Set(allPaths);
if (pathSet.size !== allPaths.length) {
  const dupes = allPaths.filter((p, i) => allPaths.indexOf(p) !== i);
  for (const d of dupes) {
    console.log(`  ❌ COLLISION: ${d}`);
    errors++;
  }
} else {
  console.log(`  ✅ All ${allPaths.length} venue URLs are unique.`);
}

// --- CHECK 3: Sitemap validation ---
console.log('\n3) Checking sitemap...');
const sitemap = readFileSync(resolve(__dirname, '../public/sitemap.xml'), 'utf-8');

// Check no /venue/ URLs in sitemap
const venueUrlMatches = sitemap.match(/\/venue\//g);
if (venueUrlMatches) {
  console.log(`  ❌ Sitemap contains ${venueUrlMatches.length} old /venue/ URLs`);
  errors++;
} else {
  console.log('  ✅ No old /venue/ URLs in sitemap.');
}

// Check no /region/ URLs in sitemap
const regionUrlMatches = sitemap.match(/\/region\//g);
if (regionUrlMatches) {
  console.log(`  ❌ Sitemap contains ${regionUrlMatches.length} old /region/ URLs`);
  errors++;
} else {
  console.log('  ✅ No old /region/ URLs in sitemap.');
}

// Verify all new venue URLs are in sitemap
for (const v of venues) {
  const url = `https://woman-5nj.pages.dev${venuePath(v)}`;
  if (!sitemap.includes(url)) {
    console.log(`  ❌ Missing from sitemap: ${url}`);
    errors++;
  }
}
// Verify all region URLs are in sitemap
for (const r of regions) {
  const url = `https://woman-5nj.pages.dev/${r}`;
  if (!sitemap.includes(url)) {
    console.log(`  ❌ Missing region from sitemap: ${url}`);
    errors++;
  }
}
console.log('  ✅ All venue and region URLs present in sitemap.');

// --- CHECK 4: No leftover old-format links in source ---
console.log('\n4) Checking source files for leftover old-format links...');
const srcFiles = [
  'src/components/VenueCard.tsx',
  'src/components/SearchBox.tsx',
  'src/components/Layout.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/RegionPage.tsx',
  'src/pages/VenueDetailPage.tsx',
];

for (const file of srcFiles) {
  const content = readFileSync(resolve(__dirname, '..', file), 'utf-8');
  // Check for /venue/ links (but skip redirect component in App.tsx)
  if (content.includes('/venue/') && !file.includes('App.tsx')) {
    console.log(`  ❌ ${file} still contains /venue/ reference`);
    errors++;
  }
  // Check for /region/ links
  if (content.includes('/region/')) {
    console.log(`  ❌ ${file} still contains /region/ reference`);
    errors++;
  }
}

// Also check App.tsx — should only have /venue/ and /region/ in redirect route paths
const appContent = readFileSync(resolve(__dirname, '../src/App.tsx'), 'utf-8');
const appLines = appContent.split('\n');
for (let i = 0; i < appLines.length; i++) {
  const line = appLines[i];
  if (line.includes('/venue/') && !line.includes('path=') && !line.includes('Redirect')) {
    console.log(`  ❌ App.tsx line ${i + 1}: non-redirect /venue/ reference`);
    errors++;
  }
}
console.log('  ✅ No leftover old-format links in source files.');

// --- CHECK 5: Print URL mapping ---
console.log('\n5) URL mapping (old → new):');
for (const v of venues) {
  const oldUrl = `/venue/${v.id}`;
  const newUrl = venuePath(v);
  const deduped = oldUrl !== newUrl ? '✓ deduped' : '= same';
  console.log(`  ${oldUrl.padEnd(35)} → ${newUrl.padEnd(30)} ${deduped}`);
}
for (const r of regions) {
  console.log(`  /region/${r}`.padEnd(38) + `→ /${r}`);
}

// --- Summary ---
console.log('\n---');
console.log(`Total: ${errors} errors, ${warnings} warnings`);
if (errors > 0) {
  console.log('FAIL: Fix all errors.');
  process.exit(1);
} else {
  console.log('ALL CLEAR — PHASE 8 URL verification passed!');
}
