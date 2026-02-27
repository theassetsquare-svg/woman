/**
 * FINAL AUDIT — Comprehensive site-wide quality check.
 * Categories: (a) AI-like text, (b) repetition, (c) UI, (d) SEO, (e) functional
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const failures = [];
const passes = [];
function fail(cat, msg) { failures.push({ cat, msg }); }
function pass(msg) { passes.push(msg); }

// ── Load data ──
const venuesSource = readFileSync(resolve(root, 'src/data/venues.ts'), 'utf-8');
const contentSource = readFileSync(resolve(root, 'src/data/venueContent.ts'), 'utf-8');
const html = readFileSync(resolve(root, 'index.html'), 'utf-8');
const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf-8');
const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf-8');

// Parse venue IDs and names
const venues = [];
const vRe = /id:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)',\s*\n\s*region:\s*'([^']+)'/g;
let m;
while ((m = vRe.exec(venuesSource)) !== null) {
  venues.push({ id: m[1], name: m[2], region: m[3] });
}

// ── (a) BANNED WORDS ──
console.log('(a) Banned words check...');
const BANNED = ['해당', '이곳', '공간', '매장', '감도', '기준'];
for (const word of BANNED) {
  const re = new RegExp(word, 'g');
  const cMatches = contentSource.match(re);
  if (cMatches) fail('banned', `venueContent.ts: "${word}" found ${cMatches.length}x`);
  const vMatches = venuesSource.match(re);
  if (vMatches) fail('banned', `venues.ts: "${word}" found ${vMatches.length}x`);
}

// ── (b) STORE NAME FREQUENCY (8-10 per venue) ──
console.log('(b) Store name frequency check...');
const blockRe = /'([a-z]+-[a-z0-9-]+)':\s*\{/g;
const ids = [];
let bm;
while ((bm = blockRe.exec(contentSource)) !== null) {
  ids.push({ id: bm[1], start: bm.index });
}
for (let i = 0; i < ids.length; i++) {
  const start = ids[i].start;
  const end = i + 1 < ids.length ? ids[i + 1].start : contentSource.indexOf('\nexport function', start) || contentSource.length;
  const block = contentSource.slice(start, end);
  const name = venues.find(v => v.id === ids[i].id)?.name;
  if (!name) continue;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const count = (block.match(new RegExp(escaped, 'g')) || []).length;
  if (count < 8) fail('repetition', `${ids[i].id}: "${name}" mentioned ${count}x (min 8)`);
  if (count > 10) fail('repetition', `${ids[i].id}: "${name}" mentioned ${count}x (max 10)`);
}

// ── (b) FAQ OPENER DIVERSITY ──
console.log('(b) FAQ opener diversity...');
for (let i = 0; i < ids.length; i++) {
  const start = ids[i].start;
  const end = i + 1 < ids.length ? ids[i + 1].start : contentSource.length;
  const block = contentSource.slice(start, end);
  const faqRe = /q:\s*['"`]([^'"`]+)['"`]/g;
  const questions = [];
  let fm;
  while ((fm = faqRe.exec(block)) !== null) questions.push(fm[1]);
  if (questions.length < 10) fail('repetition', `${ids[i].id}: Only ${questions.length} FAQ (min 10)`);
  const openers = questions.map(q => q.slice(0, 3));
  const opSet = new Set(openers);
  if (opSet.size < openers.length) {
    const dupes = openers.filter((o, idx) => openers.indexOf(o) !== idx);
    fail('repetition', `${ids[i].id}: FAQ opener dupes: ${[...new Set(dupes)].join(', ')}`);
  }
}

// ── (b) CROSS-PAGE REPEATED HEADING PATTERNS ──
console.log('(b) Cross-page heading patterns...');
const headingRe = /title:\s*'([^']+)'/g;
const allHeadings = [];
let hm;
while ((hm = headingRe.exec(contentSource)) !== null) allHeadings.push(hm[1]);
// Check for exact duplicates across venues
const headingCounts = {};
for (const h of allHeadings) {
  headingCounts[h] = (headingCounts[h] || 0) + 1;
}
for (const [h, c] of Object.entries(headingCounts)) {
  if (c > 1) fail('ai-pattern', `Heading "${h}" used ${c}x across venues`);
}

// ── (b) CROSS-PAGE REPEATED 8+ WORD PHRASES ──
console.log('(b) Cross-page repeated phrases...');
function extractAllStrings(src) {
  const strings = [];
  const tplRe = /`([^`]*)`/gs;
  let sm;
  while ((sm = tplRe.exec(src)) !== null) strings.push(sm[1]);
  return strings.join(' ');
}
const allText = extractAllStrings(contentSource);
const words = allText.split(/\s+/).filter(w => w.length > 1);
// Sample 8-word n-grams (check a reasonable subset)
const ngramMap = {};
for (let i = 0; i < words.length - 7; i++) {
  const gram = words.slice(i, i + 8).join(' ');
  ngramMap[gram] = (ngramMap[gram] || 0) + 1;
}
const repeatedPhrases = Object.entries(ngramMap).filter(([, c]) => c > 1);
if (repeatedPhrases.length > 5) {
  fail('ai-pattern', `${repeatedPhrases.length} repeated 8-word phrases found across pages`);
  for (const [phrase] of repeatedPhrases.slice(0, 3)) {
    fail('ai-pattern', `  Example: "${phrase}"`);
  }
}

// ── (a) AI-LIKE CONNECTOR OVERUSE ──
console.log('(a) AI connector overuse check...');
const connectors = ['그리고', '또한', '하지만', '따라서', '즉,'];
for (const c of connectors) {
  const count = (allText.match(new RegExp(c, 'g')) || []).length;
  if (count > 20) fail('ai-pattern', `Connector "${c}" used ${count}x across all content (limit 20)`);
}

// ── (d) SEO CHECKS ──
console.log('(d) SEO checks...');
if (!html.includes('"@type": "WebSite"')) fail('seo', 'Missing WebSite schema');
else pass('WebSite schema present');
if (!html.includes('"@type": "Organization"')) fail('seo', 'Missing Organization schema');
else pass('Organization schema present');
if (!html.includes('"@type": "ItemList"')) fail('seo', 'Missing ItemList schema');
else pass('ItemList schema present');
if (!robots.includes('Sitemap:')) fail('seo', 'robots.txt missing Sitemap');
else pass('robots.txt has Sitemap');
if (sitemap.includes('/venue/')) fail('seo', 'Sitemap has old /venue/ URLs');
else pass('Sitemap uses new URLs');
if (sitemap.includes('/region/')) fail('seo', 'Sitemap has old /region/ URLs');
else pass('Sitemap clean');

// Check ItemList URLs match new format
if (html.includes('/venue/seoul-boston')) fail('seo', 'ItemList still has old URLs');
else pass('ItemList URLs updated');

// ── (d) TITLE STORE-NAME-FIRST RULE ──
console.log('(d) Title store-name-first check...');
const detailPage = readFileSync(resolve(root, 'src/pages/VenueDetailPage.tsx'), 'utf-8');
if (!detailPage.includes('`${venue.name}')) fail('seo', 'Detail page title may not start with store name');
else pass('Title starts with store name');

// ── (c) UI CHECKS ──
console.log('(c) UI checks...');
// Thumbnail above H1
const thumbIdx = detailPage.indexOf('/og/${venue.id}.svg');
const h1Idx = detailPage.indexOf('<h1');
if (thumbIdx > 0 && h1Idx > 0 && thumbIdx < h1Idx) pass('Thumbnail above H1');
else fail('ui', 'Thumbnail may not be above H1');

// OG image set
if (detailPage.includes("image: `/og/${venue.id}.svg`")) pass('OG image uses venue SVG');
else fail('ui', 'OG image not using venue SVG');

// ── (e) FUNCTIONAL CHECKS ──
console.log('(e) Functional checks...');
// target="_blank" on VenueCard
const venueCard = readFileSync(resolve(root, 'src/components/VenueCard.tsx'), 'utf-8');
if (venueCard.includes('target="_blank"')) pass('VenueCard opens new tab');
else fail('functional', 'VenueCard missing target="_blank"');

// Search box
const searchBox = readFileSync(resolve(root, 'src/components/SearchBox.tsx'), 'utf-8');
if (searchBox.includes('target="_blank"')) pass('SearchBox results open new tab');
else fail('functional', 'SearchBox results missing target="_blank"');

// Map button
if (detailPage.includes('google.com/maps/search')) pass('Map link uses Google Maps');
else fail('functional', 'Map link not found');

// BreadcrumbList + FAQPage JSON-LD injection
if (detailPage.includes("'@type': 'BreadcrumbList'")) pass('BreadcrumbList JSON-LD injected');
else fail('seo', 'Missing BreadcrumbList in detail page');
if (detailPage.includes("'@type': 'FAQPage'")) pass('FAQPage JSON-LD injected');
else fail('seo', 'Missing FAQPage in detail page');

// URL dedupe
const slugTs = readFileSync(resolve(root, 'src/utils/slug.ts'), 'utf-8');
if (slugTs.includes('venueSlug') && slugTs.includes('venuePath')) pass('URL dedupe pipeline present');
else fail('seo', 'URL dedupe utilities missing');

// Old URL redirect
const appTs = readFileSync(resolve(root, 'src/App.tsx'), 'utf-8');
if (appTs.includes('/venue/:id') && appTs.includes('Navigate')) pass('Old URL redirect routes present');
else fail('functional', 'Old URL redirect missing');

// llms.txt
if (existsSync(resolve(root, 'public/llms.txt'))) pass('llms.txt present');
else fail('seo', 'llms.txt missing');

// RSS
if (existsSync(resolve(root, 'public/rss.xml'))) pass('RSS feed present');
else fail('seo', 'RSS feed missing');

// ── (a) HOMEPAGE/CATEGORY AI FEEL ──
console.log('(a) Homepage/Category page audit...');
const homePage = readFileSync(resolve(root, 'src/pages/HomePage.tsx'), 'utf-8');
if (!homePage.includes('첫 방문') && !homePage.includes('실수') && !homePage.includes('가이드')) {
  fail('ai-pattern', 'Homepage lacks hooking/guide section');
}

const regionPage = readFileSync(resolve(root, 'src/pages/RegionPage.tsx'), 'utf-8');
if (!regionPage.includes('처음') && !regionPage.includes('팁') && !regionPage.includes('선택')) {
  fail('ai-pattern', 'Category page lacks first-timer guidance');
}

// ── (a) CARD COPY UNIQUENESS ──
console.log('(a) Card copy uniqueness...');
const hooks = [];
const hookRe = /card_hook:\s*'([^']+)'/g;
while ((m = hookRe.exec(venuesSource)) !== null) hooks.push(m[1]);
const hookSet = new Set(hooks);
if (hookSet.size < hooks.length) fail('ai-pattern', 'Duplicate card hooks found');
else pass('All card hooks unique');

// ── REPORT ──
console.log('\n' + '='.repeat(60));
console.log('FINAL AUDIT REPORT');
console.log('='.repeat(60));

if (failures.length === 0) {
  console.log('\n✅ ALL CLEAR — 0 failures detected');
} else {
  console.log(`\n❌ ${failures.length} issues found:\n`);
  const grouped = {};
  for (const f of failures) {
    if (!grouped[f.cat]) grouped[f.cat] = [];
    grouped[f.cat].push(f.msg);
  }
  for (const [cat, msgs] of Object.entries(grouped)) {
    console.log(`[${cat.toUpperCase()}]`);
    for (const msg of msgs) console.log(`  • ${msg}`);
    console.log();
  }
}

console.log(`Passes: ${passes.length}`);
for (const p of passes) console.log(`  ✅ ${p}`);

console.log(`\nTotal: ${failures.length} failures, ${passes.length} passes`);
if (failures.length > 0) process.exit(1);
