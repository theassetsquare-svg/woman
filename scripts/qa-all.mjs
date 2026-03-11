/**
 * QA script: similarity, density, repeat, meta
 * Usage: node scripts/qa-all.mjs
 */
import { readFileSync } from 'fs';

// Parse venueContent.ts to extract text per venue
const src = readFileSync('src/data/venueContent.ts', 'utf8');

// Extract venue IDs and their content blocks
function extractVenues(source) {
  const venues = {};
  // Match each venue key block
  const keyRegex = /'([a-z]+-[a-z0-9-]+)':\s*\{/g;
  let match;
  const keys = [];
  while ((match = keyRegex.exec(source)) !== null) {
    keys.push({ id: match[1], start: match.index });
  }

  for (let i = 0; i < keys.length; i++) {
    const end = i + 1 < keys.length ? keys[i + 1].start : source.length;
    const block = source.slice(keys[i].start, end);

    // Extract all string content (between backticks and quotes)
    const strings = [];
    // Backtick strings
    const btRegex = /`([^`]*)`/g;
    let m;
    while ((m = btRegex.exec(block)) !== null) strings.push(m[1]);
    // Single-quoted strings in arrays and objects
    const sqRegex = /'([^'\n\r]{10,})'/g;
    while ((m = sqRegex.exec(block)) !== null) strings.push(m[1]);

    const fullText = strings.join(' ');
    venues[keys[i].id] = fullText;
  }
  return venues;
}

const venues = extractVenues(src);
const venueIds = Object.keys(venues);

// ===== TOKENIZER =====
function tokenize(text) {
  // Korean morpheme-like tokenization: split into 2-char and 3-char shingles + words
  const cleaned = text.replace(/[^\uAC00-\uD7AF\u3130-\u318F\u1100-\u11FFa-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleaned.split(' ').filter(w => w.length >= 2);
  return words;
}

function tokenizeShingles(text, n = 2) {
  const cleaned = text.replace(/[^\uAC00-\uD7AF\u3130-\u318F\u1100-\u11FFa-zA-Z0-9]/g, '').trim();
  const shingles = [];
  for (let i = 0; i <= cleaned.length - n; i++) {
    shingles.push(cleaned.slice(i, i + n));
  }
  return shingles;
}

// ===== COSINE SIMILARITY =====
function buildVector(tokens) {
  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  return freq;
}

function cosineSim(v1, v2) {
  const allKeys = new Set([...Object.keys(v1), ...Object.keys(v2)]);
  let dot = 0, mag1 = 0, mag2 = 0;
  for (const k of allKeys) {
    const a = v1[k] || 0;
    const b = v2[k] || 0;
    dot += a * b;
    mag1 += a * a;
    mag2 += b * b;
  }
  if (mag1 === 0 || mag2 === 0) return 0;
  return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

// ===== QA: SIMILARITY =====
console.log('=== QA: SIMILARITY (raw cosine, 2-char shingles) ===');
const pairs = [];
for (let i = 0; i < venueIds.length; i++) {
  for (let j = i + 1; j < venueIds.length; j++) {
    const v1 = buildVector(tokenizeShingles(venues[venueIds[i]], 2));
    const v2 = buildVector(tokenizeShingles(venues[venueIds[j]], 2));
    const sim = cosineSim(v1, v2);
    pairs.push({ a: venueIds[i], b: venueIds[j], sim });
  }
}
pairs.sort((a, b) => b.sim - a.sim);

console.log('\nTOP 30 most similar pairs:');
for (let i = 0; i < Math.min(30, pairs.length); i++) {
  const p = pairs[i];
  console.log(`  ${(p.sim * 100).toFixed(1)}%  ${p.a} <-> ${p.b}`);
}

// Per-page MAX similarity
const pageMax = {};
for (const id of venueIds) pageMax[id] = 0;
for (const p of pairs) {
  if (p.sim > pageMax[p.a]) pageMax[p.a] = p.sim;
  if (p.sim > pageMax[p.b]) pageMax[p.b] = p.sim;
}
const sortedPages = venueIds.map(id => ({ id, max: pageMax[id] })).sort((a, b) => b.max - a.max);
console.log('\nPer-page MAX similarity:');
for (const p of sortedPages) {
  const flag = p.max > 0.10 ? ' *** OVER 10%' : '';
  console.log(`  ${(p.max * 100).toFixed(1)}%  ${p.id}${flag}`);
}

const over10 = sortedPages.filter(p => p.max > 0.10);
console.log(`\nPages over 10%: ${over10.length} / ${venueIds.length}`);

// ===== QA: DENSITY (keyword density) =====
console.log('\n=== QA: DENSITY (대표키워드 밀도) ===');

// Read venues.ts to get seoArea + name for each venue
const venuesSrc = readFileSync('src/data/venues.ts', 'utf8');
function getKeyword(venueId) {
  // Find seoArea and name for this venue
  const idRegex = new RegExp(`id:\\s*'${venueId}'[\\s\\S]*?seoArea:\\s*'([^']*)'[\\s\\S]*?(?:name:\\s*'([^']*)')?`, 'g');
  // Simpler approach: search around the id
  const idx = venuesSrc.indexOf(`'${venueId}'`);
  if (idx === -1) return null;
  const chunk = venuesSrc.slice(idx, idx + 500);
  const seoMatch = chunk.match(/seoArea:\s*'([^']*)'/);
  const nameMatch = chunk.match(/name:\s*'([^']*)'/);
  if (!seoMatch) return null;
  const seoArea = seoMatch[1];
  const name = nameMatch ? nameMatch[1] : '';
  return name ? `${seoArea}호빠 ${name}` : `${seoArea}호빠`;
}

for (const id of venueIds) {
  const keyword = getKeyword(id);
  if (!keyword) { console.log(`  ?? ${id} — keyword not found`); continue; }
  const text = venues[id];
  const totalChars = text.replace(/\s/g, '').length;
  const keywordClean = keyword.replace(/\s/g, '');
  // Count occurrences
  let count = 0;
  let pos = 0;
  const textClean = text.replace(/\s/g, '');
  while ((pos = textClean.indexOf(keywordClean, pos)) !== -1) {
    count++;
    pos += keywordClean.length;
  }
  const density = (count * keywordClean.length / totalChars * 100);
  const flag = density < 1.0 ? ' LOW' : density > 1.5 ? ' HIGH' : '';
  console.log(`  ${density.toFixed(2)}% (${count}회) ${id} — "${keyword}"${flag}`);
}

// ===== QA: REPEAT (5+ 반복 단어) =====
console.log('\n=== QA: REPEAT (의미있는 단어 5회 이상 반복) ===');
const stopwords = new Set(['있습니다','합니다','됩니다','것입니다','않습니다','그리고','하지만','때문에',
  '없습니다','입니다','위해','대한','통해','이상','이하','가장','이곳','그곳','여기','저기',
  '방문','전화','가능','운영','시간','분위기','가게','선수','호스트','캐스트','세팅','안주',
  '음료','양주','프리미엄','기본','스타일','공간','체험','경험','서비스','시스템','손님','고객',
  '수원','강남','장안동','해운대','부산','건대','대전','광주','창원','호빠','호스트바']);

let totalRepeatViolations = 0;
for (const id of venueIds) {
  const words = tokenize(venues[id]).filter(w => w.length >= 2 && !stopwords.has(w));
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const repeats = Object.entries(freq).filter(([w, c]) => c >= 5).sort((a, b) => b[1] - a[1]);
  if (repeats.length > 0) {
    totalRepeatViolations += repeats.length;
    console.log(`  ${id}: ${repeats.map(([w, c]) => `${w}(${c})`).join(', ')}`);
  }
}
if (totalRepeatViolations === 0) console.log('  No violations found.');
console.log(`Total repeat violations: ${totalRepeatViolations}`);

// ===== SUMMARY =====
console.log('\n=== SUMMARY ===');
console.log(`Total venues: ${venueIds.length}`);
console.log(`Similarity: ${over10.length} pages over 10% MAX`);
console.log(`Overall MAX similarity: ${(pairs[0]?.sim * 100 || 0).toFixed(1)}%`);
console.log(`Repeat violations: ${totalRepeatViolations}`);
