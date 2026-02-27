/**
 * FULL SITE HUMAN-QUALITY AUDIT
 * Checks all hard gates from the final prompt.
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

// ── Load sources ──
const venuesSource = readFileSync(resolve(root, 'src/data/venues.ts'), 'utf-8');
const contentSource = readFileSync(resolve(root, 'src/data/venueContent.ts'), 'utf-8');
const html = readFileSync(resolve(root, 'index.html'), 'utf-8');
const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf-8');
const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf-8');
const detailPage = readFileSync(resolve(root, 'src/pages/VenueDetailPage.tsx'), 'utf-8');
const homePage = readFileSync(resolve(root, 'src/pages/HomePage.tsx'), 'utf-8');
const regionPage = readFileSync(resolve(root, 'src/pages/RegionPage.tsx'), 'utf-8');
const venueCard = readFileSync(resolve(root, 'src/components/VenueCard.tsx'), 'utf-8');
const searchBox = readFileSync(resolve(root, 'src/components/SearchBox.tsx'), 'utf-8');
const layout = readFileSync(resolve(root, 'src/components/Layout.tsx'), 'utf-8');

// Parse venues
const venues = [];
const vRe = /id:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)',\s*\n\s*region:\s*'([^']+)'/g;
let m;
while ((m = vRe.exec(venuesSource)) !== null) {
  venues.push({ id: m[1], name: m[2], region: m[3] });
}

// Parse content blocks
const blockRe = /'([a-z]+-[a-z0-9-]+)':\s*\{/g;
const ids = [];
let bm;
while ((bm = blockRe.exec(contentSource)) !== null) {
  ids.push({ id: bm[1], start: bm.index });
}
function getBlock(i) {
  const start = ids[i].start;
  const end = i + 1 < ids.length ? ids[i + 1].start : contentSource.length;
  return contentSource.slice(start, end);
}

// ══════════════════════════════════════════
// (1) BANNED WORDS — Rule 2
// ══════════════════════════════════════════
console.log('(1) Banned words...');
const BANNED = ['해당', '이곳', '공간', '매장', '감도', '기준'];
for (const word of BANNED) {
  const re = new RegExp(word, 'g');
  const cM = contentSource.match(re);
  if (cM) fail('banned', `venueContent.ts: "${word}" ${cM.length}x`);
  const vM = venuesSource.match(re);
  if (vM) fail('banned', `venues.ts: "${word}" ${vM.length}x`);
  const hM = homePage.match(re);
  if (hM) fail('banned', `HomePage: "${word}" ${hM.length}x`);
  const rM = regionPage.match(re);
  if (rM) fail('banned', `RegionPage: "${word}" ${rM.length}x`);
}
if (!failures.some(f => f.cat === 'banned')) pass('Banned words: 0 across all files');

// ══════════════════════════════════════════
// (2) STORE NAME FREQUENCY — Rule 4 (8~10)
// ══════════════════════════════════════════
console.log('(2) Store name frequency (8-10)...');
for (let i = 0; i < ids.length; i++) {
  const block = getBlock(i);
  const name = venues.find(v => v.id === ids[i].id)?.name;
  if (!name) continue;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const count = (block.match(new RegExp(escaped, 'g')) || []).length;
  if (count < 8) fail('name-freq', `${ids[i].id}: "${name}" ${count}x (min 8)`);
  if (count > 10) fail('name-freq', `${ids[i].id}: "${name}" ${count}x (max 10)`);
}
if (!failures.some(f => f.cat === 'name-freq')) pass('Store name frequency: all 8-10');

// ══════════════════════════════════════════
// (3) CROSS-PAGE HEADING UNIQUENESS
// ══════════════════════════════════════════
console.log('(3) Cross-page heading uniqueness...');
const headingRe = /title:\s*'([^']+)'/g;
const allHeadings = [];
let hm;
while ((hm = headingRe.exec(contentSource)) !== null) allHeadings.push(hm[1]);
const headingCounts = {};
for (const h of allHeadings) headingCounts[h] = (headingCounts[h] || 0) + 1;
for (const [h, c] of Object.entries(headingCounts)) {
  if (c > 1) fail('heading-dupe', `"${h}" used ${c}x across venues`);
}
if (!failures.some(f => f.cat === 'heading-dupe')) pass('Headings: all unique across venues');

// ══════════════════════════════════════════
// (4) CROSS-VENUE SENTENCE DUPLICATION
// ══════════════════════════════════════════
console.log('(4) Cross-venue sentence duplication...');
function extractStrings(src) {
  const strings = [];
  const tplRe = /`([^`]*)`/gs;
  let sm;
  while ((sm = tplRe.exec(src)) !== null) strings.push(sm[1]);
  return strings.join(' ');
}
const allText = extractStrings(contentSource);
// Check per-block: find sentences that appear in 2+ venue blocks
const blockTexts = {};
for (let bi = 0; bi < ids.length; bi++) {
  const block = getBlock(bi);
  const texts = [];
  const btRe = /`([^`]*)`/gs;
  let btm;
  while ((btm = btRe.exec(block)) !== null) texts.push(btm[1]);
  blockTexts[ids[bi].id] = texts.join(' ');
}
const sentenceMap = {};
for (const [vid, text] of Object.entries(blockTexts)) {
  const sentences = text.split(/[.!?。]+/).filter(s => s.trim().length > 30);
  for (const sent of sentences) {
    const trimmed = sent.trim();
    if (!sentenceMap[trimmed]) sentenceMap[trimmed] = [];
    sentenceMap[trimmed].push(vid);
  }
}
const crossDupes = Object.entries(sentenceMap).filter(([,vids]) => new Set(vids).size > 1);
if (crossDupes.length > 0) {
  fail('phrase-dupe', `${crossDupes.length} sentences duplicated across venues`);
  for (const [sent, vids] of crossDupes.slice(0, 3)) {
    fail('phrase-dupe', `  → [${[...new Set(vids)].join(',')}]: "${sent.slice(0, 60)}..."`);
  }
} else {
  pass('Cross-venue sentences: no duplicates');
}

// ══════════════════════════════════════════
// (5) FAQ OPENER DIVERSITY
// ══════════════════════════════════════════
console.log('(5) FAQ opener diversity...');
for (let i = 0; i < ids.length; i++) {
  const block = getBlock(i);
  const faqRe = /q:\s*['"`]([^'"`]+)['"`]/g;
  const questions = [];
  let fm;
  while ((fm = faqRe.exec(block)) !== null) questions.push(fm[1]);
  if (questions.length < 10) fail('faq', `${ids[i].id}: ${questions.length} FAQ (min 10)`);
  const openers = questions.map(q => q.slice(0, 3));
  const opSet = new Set(openers);
  if (opSet.size < openers.length) {
    const dupes = openers.filter((o, idx) => openers.indexOf(o) !== idx);
    fail('faq', `${ids[i].id}: FAQ opener dupes: ${[...new Set(dupes)].join(', ')}`);
  }
}
if (!failures.some(f => f.cat === 'faq')) pass('FAQ: all ≥10, openers unique');

// ══════════════════════════════════════════
// (6) AI CONNECTOR OVERUSE
// ══════════════════════════════════════════
console.log('(6) AI connector overuse...');
const connectors = ['그리고', '또한', '하지만', '따라서', '즉,'];
for (const c of connectors) {
  const count = (allText.match(new RegExp(c, 'g')) || []).length;
  if (count > 20) fail('ai-connector', `"${c}" ${count}x (limit 20)`);
}
if (!failures.some(f => f.cat === 'ai-connector')) pass('AI connectors: within limits');

// ══════════════════════════════════════════
// (7) SEO CHECKS — Rule 5, 6, 9
// ══════════════════════════════════════════
console.log('(7) SEO checks...');
// JSON-LD schemas
if (html.includes('"@type": "WebSite"')) pass('WebSite schema'); else fail('seo', 'Missing WebSite schema');
if (html.includes('"@type": "Organization"')) pass('Organization schema'); else fail('seo', 'Missing Organization schema');
if (html.includes('"@type": "ItemList"')) pass('ItemList schema'); else fail('seo', 'Missing ItemList schema');
// Title starts with store name
if (detailPage.includes('`${venue.name}')) pass('Title: store name first'); else fail('seo', 'Title not store-name-first');
// BreadcrumbList + FAQPage
if (detailPage.includes("'@type': 'BreadcrumbList'")) pass('BreadcrumbList JSON-LD'); else fail('seo', 'Missing BreadcrumbList');
if (detailPage.includes("'@type': 'FAQPage'")) pass('FAQPage JSON-LD'); else fail('seo', 'Missing FAQPage');
// Sitemap
if (!sitemap.includes('/venue/')) pass('Sitemap: no old /venue/ URLs'); else fail('seo', 'Sitemap has old /venue/ URLs');
if (!sitemap.includes('/region/')) pass('Sitemap: no old /region/ URLs'); else fail('seo', 'Sitemap has old /region/ URLs');
// Robots
if (robots.includes('Sitemap:')) pass('robots.txt has Sitemap'); else fail('seo', 'robots.txt missing Sitemap');
if (robots.includes('Yeti')) pass('robots.txt allows Yeti'); else fail('seo', 'robots.txt missing Yeti');
if (robots.includes('GPTBot')) pass('robots.txt allows GPTBot'); else fail('seo', 'robots.txt missing GPTBot');
// OG image absolute URL
if (detailPage.includes("image: `/og/${venue.id}.svg`")) pass('OG image set'); else fail('seo', 'OG image not set');
// Meta
if (html.includes('content="index, follow"')) pass('meta robots=index,follow'); else fail('seo', 'Missing meta robots');
// RSS
if (existsSync(resolve(root, 'public/rss.xml'))) pass('RSS feed present'); else fail('seo', 'RSS missing');
if (html.includes('application/rss+xml')) pass('RSS link tag'); else fail('seo', 'Missing RSS link tag');
// llms.txt
if (existsSync(resolve(root, 'public/llms.txt'))) pass('llms.txt present'); else fail('seo', 'llms.txt missing');
// ItemList URLs
if (!html.includes('/venue/seoul-boston')) pass('ItemList: new URLs'); else fail('seo', 'ItemList still has old URLs');
// URL dedup
const slugTs = readFileSync(resolve(root, 'src/utils/slug.ts'), 'utf-8');
if (slugTs.includes('venueSlug') && slugTs.includes('venuePath')) pass('URL dedup utils'); else fail('seo', 'URL dedup missing');

// ══════════════════════════════════════════
// (8) UI CHECKS — Rule 6, 7
// ══════════════════════════════════════════
console.log('(8) UI checks...');
// Thumbnail above H1
const thumbIdx = detailPage.indexOf('/og/${venue.id}.svg');
const h1Idx = detailPage.indexOf('<h1');
if (thumbIdx > 0 && h1Idx > 0 && thumbIdx < h1Idx) pass('Thumbnail above H1');
else fail('ui', 'Thumbnail not above H1');

// Container consistency
if (detailPage.includes('max-w-[760px] mx-auto')) pass('Detail: centered container');
else fail('ui', 'Detail page missing center container');
if (homePage.includes('max-w-6xl mx-auto')) pass('Home: centered container');
else fail('ui', 'Home missing center container');
if (regionPage.includes('max-w-6xl mx-auto')) pass('Region: centered container');
else fail('ui', 'Region missing center container');

// ══════════════════════════════════════════
// (9) FUNCTIONAL CHECKS — Rule 8
// ══════════════════════════════════════════
console.log('(9) Functional checks...');
// target="_blank" everywhere
if (venueCard.includes('target="_blank"')) pass('VenueCard: new tab'); else fail('func', 'VenueCard missing target="_blank"');
if (searchBox.includes('target="_blank"')) pass('SearchBox: new tab'); else fail('func', 'SearchBox missing target="_blank"');
if (detailPage.includes('google.com/maps/search')) pass('Map link present'); else fail('func', 'Map link missing');
// Old URL redirect
const appTs = readFileSync(resolve(root, 'src/App.tsx'), 'utf-8');
if (appTs.includes('/venue/:id') && appTs.includes('Navigate')) pass('Old URL redirects'); else fail('func', 'Old URL redirect missing');

// ══════════════════════════════════════════
// (10) PHONE NUMBER CHECK — Rule 10
// ══════════════════════════════════════════
console.log('(10) Phone number in content check...');
// Check venueContent.ts for phone numbers (010-xxxx pattern)
const phoneInContent = contentSource.match(/01[0-9]-[0-9]{3,4}-[0-9]{4}/g);
if (phoneInContent) fail('privacy', `venueContent.ts has phone numbers: ${phoneInContent.join(', ')}`);
else pass('venueContent.ts: no phone numbers');

// ══════════════════════════════════════════
// (11) HOMEPAGE EDITORIAL
// ══════════════════════════════════════════
console.log('(11) Homepage/category editorial...');
if (homePage.includes('에디터') || homePage.includes('안내') || homePage.includes('editor')) {
  pass('Homepage: editorial section');
} else {
  fail('editorial', 'Homepage lacks editorial section');
}

// ══════════════════════════════════════════
// (12) CARD COPY UNIQUENESS
// ══════════════════════════════════════════
console.log('(12) Card copy uniqueness...');
const hooks = [];
const hookRe = /card_hook:\s*'([^']+)'/g;
while ((m = hookRe.exec(venuesSource)) !== null) hooks.push(m[1]);
const hookSet = new Set(hooks);
if (hookSet.size < hooks.length) fail('card', 'Duplicate card hooks');
else pass('Card hooks: all unique');

// ══════════════════════════════════════════
// (13) SECTION STRUCTURE DIVERSITY
// ══════════════════════════════════════════
console.log('(13) Section structure diversity...');
const sectionCounts = [];
for (let i = 0; i < ids.length; i++) {
  const block = getBlock(i);
  const secCount = (block.match(/title:\s*'/g) || []).length;
  sectionCounts.push({ id: ids[i].id, count: secCount });
}
// Check if all have same number of sections (template sign)
const countSet = new Set(sectionCounts.map(s => s.count));
if (countSet.size === 1 && sectionCounts.length > 3) {
  fail('template', `All ${sectionCounts.length} venues have exactly ${[...countSet][0]} sections — template pattern`);
} else {
  pass(`Section counts vary: ${[...countSet].sort().join(', ')}`);
}

// ══════════════════════════════════════════
// (14) PER-PARAGRAPH STORE NAME DENSITY (max 2 per ¶)
// ══════════════════════════════════════════
console.log('(14) Per-paragraph store name density...');
let paraDensityFails = 0;
for (let i = 0; i < ids.length; i++) {
  const block = getBlock(i);
  const name = venues.find(v => v.id === ids[i].id)?.name;
  if (!name) continue;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Extract intro and section bodies
  const bodyRe = /body:\s*`([^`]+)`/gs;
  const introRe = /intro:\s*`([^`]+)`/gs;
  const allBodies = [];
  let bm2;
  while ((bm2 = bodyRe.exec(block)) !== null) allBodies.push(bm2[1]);
  while ((bm2 = introRe.exec(block)) !== null) allBodies.push(bm2[1]);
  for (const body of allBodies) {
    const paras = body.split(/\n\n+/);
    for (const para of paras) {
      const ct = (para.match(new RegExp(escaped, 'g')) || []).length;
      if (ct > 2) {
        paraDensityFails++;
        if (paraDensityFails <= 3) {
          fail('para-density', `${ids[i].id}: "${name}" ${ct}x in one paragraph`);
        }
      }
    }
  }
}
if (paraDensityFails > 3) fail('para-density', `...and ${paraDensityFails - 3} more`);
if (paraDensityFails === 0) pass('Per-paragraph name density: all ≤2');

// ══════════════════════════════════════════
// (15) AI SUMMARY COMPLETENESS
// ══════════════════════════════════════════
console.log('(15) AI summary completeness...');
const summaryCount = (contentSource.match(/summary:\s*\[/g) || []).length;
if (summaryCount === 25) pass('AI Summary: all 25 venues');
else fail('content', `AI Summary: only ${summaryCount}/25`);

// ══════════════════════════════════════════
// REPORT
// ══════════════════════════════════════════
console.log('\n' + '='.repeat(60));
console.log('FULL SITE AUDIT REPORT');
console.log('='.repeat(60));

if (failures.length === 0) {
  console.log('\n✅ ALL CLEAR — 0 failures');
} else {
  console.log(`\n❌ ${failures.length} issues:\n`);
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
