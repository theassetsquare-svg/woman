/**
 * check-cosine.mjs — TF-IDF Cosine Similarity between all venue pages
 * Usage: node scripts/check-cosine.mjs
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const contentRaw = readFileSync(resolve(ROOT, 'src/data/venueContent.ts'), 'utf-8');
const venuesRaw = readFileSync(resolve(ROOT, 'src/data/venues.ts'), 'utf-8');

function parseBraceBlock(raw, startMarker) {
  const m = raw.match(startMarker);
  if (!m) throw new Error('Not found');
  const startIdx = m.index + m[0].length - 1;
  let depth = 0, endIdx = -1;
  for (let i = startIdx; i < raw.length; i++) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') { depth--; if (depth === 0) { endIdx = i; break; } }
  }
  return new Function(`return (${raw.substring(startIdx, endIdx + 1)})`)();
}

function parseBracketBlock(raw, startMarker) {
  const m = raw.match(startMarker);
  if (!m) throw new Error('Not found');
  const startIdx = m.index + m[0].length - 1;
  let depth = 0, endIdx = -1;
  for (let i = startIdx; i < raw.length; i++) {
    if (raw[i] === '[') depth++;
    else if (raw[i] === ']') { depth--; if (depth === 0) { endIdx = i; break; } }
  }
  let s = raw.substring(startIdx, endIdx + 1).replace(/\bas\s+const\b/g, '');
  return new Function(`return (${s})`)();
}

const contentData = parseBraceBlock(contentRaw, /const\s+content[^=]*=\s*\{/);
const venuesData = parseBracketBlock(venuesRaw, /export\s+const\s+venues\s*:\s*Venue\[\]\s*=\s*\[/);

const venueInfoMap = {};
for (const v of venuesData) venueInfoMap[v.id] = { name: v.name, description: v.description || '', card_hook: v.card_hook || '' };

function extractAllText(venueId) {
  const parts = [];
  const info = venueInfoMap[venueId];
  if (info) { parts.push(info.description); parts.push(info.card_hook); }
  const c = contentData[venueId];
  if (c) {
    if (c.intro) parts.push(c.intro);
    if (c.summary) parts.push(c.summary.join(' '));
    if (c.sections) for (const s of c.sections) { if (s.title) parts.push(s.title); if (s.body) parts.push(s.body); }
    if (c.quickPlan) { if (c.quickPlan.decision) parts.push(c.quickPlan.decision); if (c.quickPlan.scenarios) parts.push(c.quickPlan.scenarios.join(' ')); if (c.quickPlan.costNote) parts.push(c.quickPlan.costNote); }
    if (c.faq) for (const f of c.faq) { if (f.q) parts.push(f.q); if (f.a) parts.push(f.a); }
    if (c.conclusion) parts.push(c.conclusion);
  }
  return parts.join('\n');
}

const allIds = [...new Set([...Object.keys(contentData), ...venuesData.map(v => v.id)])];
const texts = {};
for (const id of allIds) texts[id] = extractAllText(id);

// Word-level tokenizer (standard TF-IDF, no sub-word bigrams)
function tokenize(text) {
  const norm = text.replace(/[^\uAC00-\uD7AF\u3131-\u3163a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = norm.split(' ').filter(w => w.length >= 2);
  const tokens = {};
  for (const w of words) {
    tokens[w] = (tokens[w] || 0) + 1;
  }
  return tokens;
}

// Build document frequency
const docFreq = {};
const tokenized = {};
for (const id of allIds) {
  tokenized[id] = tokenize(texts[id]);
  for (const t of Object.keys(tokenized[id])) {
    docFreq[t] = (docFreq[t] || 0) + 1;
  }
}

const N = allIds.length;

// TF-IDF vectors
function tfidfVector(tf) {
  const vec = {};
  for (const [term, count] of Object.entries(tf)) {
    const idf = Math.log(N / (docFreq[term] || 1));
    vec[term] = count * idf;
  }
  return vec;
}

function cosineSim(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (const [k, v] of Object.entries(a)) {
    magA += v * v;
    if (b[k]) dot += v * b[k];
  }
  for (const v of Object.values(b)) magB += v * v;
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

const vectors = {};
for (const id of allIds) vectors[id] = tfidfVector(tokenized[id]);

// All pairs
const pairs = [];
for (let i = 0; i < allIds.length; i++) {
  for (let j = i + 1; j < allIds.length; j++) {
    const sim = cosineSim(vectors[allIds[i]], vectors[allIds[j]]);
    pairs.push({ a: allIds[i], b: allIds[j], similarity: sim });
  }
}
pairs.sort((x, y) => y.similarity - x.similarity);

const pct = v => (v * 100).toFixed(2) + '%';
const nm = id => venueInfoMap[id] ? `${venueInfoMap[id].name} (${id})` : id;

console.log('=' .repeat(80));
console.log('  RAW COSINE SIMILARITY (TF-IDF)');
console.log('='.repeat(80));
console.log(`Total venues: ${allIds.length} | Pairs: ${pairs.length}`);
const avg = pairs.reduce((a, p) => a + p.similarity, 0) / pairs.length;
console.log(`Average: ${pct(avg)}`);

console.log('\n--- TOP 15 MOST SIMILAR ---');
for (let i = 0; i < Math.min(15, pairs.length); i++) {
  const p = pairs[i];
  const flag = p.similarity > 0.10 ? ' ❌' : ' ✅';
  console.log(`  ${(i+1).toString().padStart(2)}. ${pct(p.similarity).padStart(7)}  ${nm(p.a)}  <->  ${nm(p.b)}${flag}`);
}

const above10 = pairs.filter(p => p.similarity > 0.10);
console.log(`\n--- VIOLATIONS (>10%): ${above10.length} pairs ---`);
if (above10.length === 0) console.log('  ✅ ALL PAIRS UNDER 10%');
else for (const p of above10) console.log(`  ❌ ${pct(p.similarity).padStart(7)}  ${nm(p.a)}  <->  ${nm(p.b)}`);

// Distribution
console.log('\n--- DISTRIBUTION ---');
const brackets = [
  { label: '>=20%', min: 0.20, max: 1.01 },
  { label: '15-20%', min: 0.15, max: 0.20 },
  { label: '10-15%', min: 0.10, max: 0.15 },
  { label: '5-10%', min: 0.05, max: 0.10 },
  { label: '<5%', min: 0, max: 0.05 },
];
for (const b of brackets) {
  const count = pairs.filter(p => p.similarity >= b.min && p.similarity < b.max).length;
  console.log(`  ${b.label.padEnd(8)} ${count.toString().padStart(4)} pairs`);
}

console.log('\n' + '='.repeat(80));
