/**
 * Keyword density checker for all venue detail pages.
 * Simulates visible text on VenueDetailPage and counts keyword occurrences.
 * Target: 1.5-2.5%  (density = keyword_count × keyword_length / total_chars × 100)
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Parse venues.ts to extract venue data
const venuesSrc = readFileSync(join(root, 'src/data/venues.ts'), 'utf-8');
const contentSrc = readFileSync(join(root, 'src/data/venueContent.ts'), 'utf-8');

// Extract venue objects
function parseVenues() {
  const venues = [];
  const regex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*region:\s*'([^']+)',\s*area:\s*'([^']+)',\s*seoArea:\s*'([^']+)',\s*address:\s*'([^']+)',\s*description:\s*'([^']*)',\s*hours:\s*'([^']*)',\s*phone:\s*'([^']*)',\s*tags:\s*\[([^\]]*)\],\s*card_hook:\s*'([^']*(?:\\n[^']*)*)',\s*card_value:\s*'([^']*)',\s*card_tags:\s*'([^']*)'(?:,\s*keyword:\s*'([^']*)')?(?:,\s*contact:\s*'([^']*)')?(?:,\s*category:\s*'([^']*)')?\s*,?\s*\}/g;

  let m;
  while ((m = regex.exec(venuesSrc)) !== null) {
    venues.push({
      id: m[1], name: m[2], region: m[3], area: m[4], seoArea: m[5],
      address: m[6], description: m[7], hours: m[8], phone: m[9],
      tags: m[10].replace(/'/g,'').split(',').map(s=>s.trim()),
      card_hook: m[11].replace(/\\n/g,'\n'),
      card_value: m[12], card_tags: m[13],
      keyword: m[14] || '', contact: m[15] || '', category: m[16] || 'night',
    });
  }
  return venues;
}

function getVenueLabel(v) {
  if (v.keyword) return v.keyword;
  if (v.category === 'room') return `${v.seoArea}룸 ${v.name}`;
  if (v.category === 'yojeong') return `${v.seoArea}요정 ${v.name}`;
  if (v.category === 'hoppa') return `${v.seoArea}호빠 ${v.name}`;
  if (v.category === 'club') return `${v.seoArea}클럽 ${v.name}`;
  if (v.category === 'lounge') return `${v.seoArea}라운지 ${v.name}`;
  return `${v.seoArea}나이트 ${v.name}`;
}

function getSubKw(v) {
  const a = v.seoArea;
  if (v.category === 'club') return `${a} 클럽`;
  if (v.category === 'lounge') return `${a} 라운지`;
  if (v.category === 'room') return `${a} 룸`;
  if (v.category === 'yojeong') return `${a} 요정`;
  if (v.category === 'hoppa') return `${a} 호빠`;
  return `${a} 나이트`;
}

// Parse venueContent for a given id
function parseContent(id) {
  const startMarker = `'${id}': {`;
  const startIdx = contentSrc.indexOf(startMarker);
  if (startIdx === -1) return null;

  // Find matching closing brace
  let depth = 0;
  let i = contentSrc.indexOf('{', startIdx);
  const start = i;
  for (; i < contentSrc.length; i++) {
    if (contentSrc[i] === '{') depth++;
    if (contentSrc[i] === '}') depth--;
    if (depth === 0) break;
  }
  const block = contentSrc.slice(start, i + 1);

  // Extract text fields
  const texts = [];

  // summary array strings
  const summaryMatch = block.match(/summary:\s*\[([\s\S]*?)\]/);
  if (summaryMatch) {
    const items = summaryMatch[1].match(/'([^']*)'/g);
    if (items) items.forEach(s => texts.push(s.replace(/'/g,'')));
  }

  // intro
  const introMatch = block.match(/intro:\s*`([\s\S]*?)`/);
  if (introMatch) texts.push(introMatch[1]);

  // sections title + body
  const secRegex = /title:\s*'([^']*)',\s*body:\s*`([\s\S]*?)`/g;
  let sm;
  while ((sm = secRegex.exec(block)) !== null) {
    texts.push(sm[1]);
    texts.push(sm[2]);
  }

  // quickPlan
  const decMatch = block.match(/decision:\s*'([^']*)'/);
  if (decMatch) texts.push(decMatch[1]);
  const scenRegex = /'([^']+)'/g;
  const scenBlock = block.match(/scenarios:\s*\[([\s\S]*?)\]/);
  if (scenBlock) {
    let ss;
    while ((ss = scenRegex.exec(scenBlock[1])) !== null) texts.push(ss[1]);
  }
  const costMatch = block.match(/costNote:\s*'([^']*)'/);
  if (costMatch) texts.push(costMatch[1]);

  // faq
  const faqRegex = /q:\s*'([^']*)',\s*a:\s*'([^']*)'/g;
  let fm;
  while ((fm = faqRegex.exec(block)) !== null) {
    texts.push(fm[1]);
    texts.push(fm[2]);
  }

  // conclusion
  const conMatch = block.match(/conclusion:\s*`([\s\S]*?)`/);
  if (conMatch) texts.push(conMatch[1]);

  return texts.join(' ');
}

// Build full page text for a venue
function buildPageText(v) {
  const label = getVenueLabel(v);
  const subKw = getSubKw(v);
  const parts = [];

  // breadcrumb
  parts.push(`홈 ${v.area} ${v.name}`);
  // h1
  parts.push(label);
  // region area
  parts.push(`${v.area}`);
  // contact
  if (v.contact) parts.push(`${v.contact} 실장`);
  // card_hook
  parts.push(v.card_hook);
  // h2 + description (with new H2 format)
  parts.push(`${label} 상세 정보`);
  parts.push(v.description);
  // tags
  parts.push(v.tags.join(' '));

  // venueContent
  const content = parseContent(v.id);
  if (content) {
    // h2 headings with store name (after our edits)
    parts.push(`${label} 핵심 요약`);
    parts.push(`${subKw} 이용 가이드`);
    parts.push(content);
    parts.push(`30초 플랜`);
    parts.push(`${label} FAQ`);
  }

  // bottom CTA
  parts.push(`${subKw} 방문 전 확인`);

  return parts.join(' ');
}

function countOccurrences(text, keyword) {
  let count = 0;
  let pos = 0;
  while ((pos = text.indexOf(keyword, pos)) !== -1) {
    count++;
    pos += keyword.length;
  }
  return count;
}

// Main
const venues = parseVenues();
console.log(`Parsed ${venues.length} venues\n`);

const results = [];
let lowCount = 0;
let highCount = 0;
let okCount = 0;

for (const v of venues) {
  const label = getVenueLabel(v);
  const pageText = buildPageText(v);
  const totalChars = pageText.length;
  const kwCount = countOccurrences(pageText, label);
  const density = (kwCount * label.length) / totalChars * 100;

  let status = 'OK';
  if (density < 1.5) { status = 'LOW'; lowCount++; }
  else if (density > 2.5) { status = 'OVER'; highCount++; }
  else { okCount++; }

  results.push({ page: v.id, name: label, chars: totalChars, count: kwCount, density: density.toFixed(2), status });
}

// Sort: problems first
results.sort((a, b) => {
  if (a.status !== 'OK' && b.status === 'OK') return -1;
  if (a.status === 'OK' && b.status !== 'OK') return 1;
  return parseFloat(a.density) - parseFloat(b.density);
});

// Print report
console.log('page | name | chars | count | density% | status');
console.log('---|---|---|---|---|---');
for (const r of results) {
  console.log(`${r.page} | ${r.name} | ${r.chars} | ${r.count} | ${r.density}% | ${r.status}`);
}

console.log(`\n--- SUMMARY ---`);
console.log(`OK (1.5-2.5%): ${okCount}`);
console.log(`LOW (<1.5%): ${lowCount}`);
console.log(`OVER (>2.5%): ${highCount}`);
console.log(`Total: ${venues.length}`);

// Output problem venues for fixing
if (lowCount > 0 || highCount > 0) {
  console.log(`\n--- NEEDS FIX ---`);
  for (const r of results) {
    if (r.status !== 'OK') {
      console.log(`${r.status}: ${r.name} (${r.density}%, count=${r.count}, chars=${r.chars})`);
    }
  }
}
