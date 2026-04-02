/**
 * Comprehensive SEO Audit: Density + Similarity + Title + Stuffing
 * For ALL venue detail pages (103) + category pages + region pages
 */
import { venues, getVenueLabel, getVenuesByRegion, getVenueHook, getVenueSeoDescription, regions, getRegionCount } from '../src/data/venues.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentSrc = readFileSync(join(__dirname, '..', 'src/data/venueContent.ts'), 'utf-8');

// ============ HELPERS ============

function getSubKw(v: typeof venues[0]) {
  const a = v.seoArea;
  const m: Record<string, string> = { club: '클럽', lounge: '라운지', room: '룸', yojeong: '요정', hoppa: '호빠' };
  return `${a} ${m[v.category || 'night'] || '나이트'}`;
}

function countKw(text: string, kw: string): number {
  let c = 0, p = 0;
  while ((p = text.indexOf(kw, p)) !== -1) { c++; p += kw.length; }
  return c;
}

// Extract content text for a venue from venueContent.ts
function extractContentText(id: string): string {
  const marker = `'${id}': {`;
  const si = contentSrc.indexOf(marker);
  if (si === -1) return '';
  let depth = 0, i = contentSrc.indexOf('{', si);
  for (; i < contentSrc.length; i++) {
    if (contentSrc[i] === '{') depth++;
    if (contentSrc[i] === '}') depth--;
    if (depth === 0) break;
  }
  const block = contentSrc.slice(contentSrc.indexOf('{', si), i + 1);

  const texts: string[] = [];
  const m1 = block.match(/summary:\s*\[([\s\S]*?)\]/);
  if (m1) { const items = m1[1].match(/'([^']*)'/g); if (items) items.forEach(s => texts.push(s.replace(/'/g, ''))); }
  const m2 = block.match(/intro:\s*`([\s\S]*?)`/);
  if (m2) texts.push(m2[1]);
  const r1 = /title:\s*'([^']*)',\s*body:\s*`([\s\S]*?)`/g;
  let m; while ((m = r1.exec(block)) !== null) { texts.push(m[1]); texts.push(m[2]); }
  const m3 = block.match(/decision:\s*'([^']*)'/);
  if (m3) texts.push(m3[1]);
  const m4 = block.match(/scenarios:\s*\[([\s\S]*?)\]/);
  if (m4) { const r = /'([^']+)'/g; let s; while ((s = r.exec(m4[1])) !== null) texts.push(s[1]); }
  const m5 = block.match(/costNote:\s*'([^']*)'/);
  if (m5) texts.push(m5[1]);
  const r2 = /q:\s*'([^']*)',\s*a:\s*'([^']*)'/g;
  while ((m = r2.exec(block)) !== null) { texts.push(m[1]); texts.push(m[2]); }
  const m6 = block.match(/conclusion:\s*`([\s\S]*?)`/);
  if (m6) texts.push(m6[1]);
  return texts.join(' ');
}

// Build full visible page text for a venue
function buildPageText(v: typeof venues[0]): string {
  const label = getVenueLabel(v);
  const subKw = getSubKw(v);
  const content = extractContentText(v.id);
  return [
    `홈 ${v.area} ${v.name}`, label, v.area,
    v.contact ? `${v.contact} 실장` : '', v.card_hook, v.description,
    `${label} 상세 정보`, v.tags.join(' '),
    `${label} 핵심 요약`, `${subKw} 이용 가이드`,
    content, `30초 플랜`, `${label} FAQ`, `${subKw} 방문 전 확인`,
  ].join(' ');
}

// Build title for a venue
function buildTitle(v: typeof venues[0]): string {
  const label = getVenueLabel(v);
  const hook = getVenueHook(v.id);
  return `${label} — ${hook}`;
}

// Check title for duplicate words (2+ occurrences of same word)
function checkTitleDups(title: string): string[] {
  // Split by common separators, filter short words
  const words = title.split(/[\s—·,\-]+/).filter(w => w.length >= 2);
  const counts: Record<string, number> = {};
  words.forEach(w => { counts[w] = (counts[w] || 0) + 1; });
  return Object.entries(counts).filter(([, c]) => c >= 2).map(([w]) => w);
}

// Check keyword stuffing: same keyword 2+ in one sentence, 3+ in one paragraph
function checkStuffing(text: string, kw: string): string | null {
  // Split by sentences (Korean endings: 다/요/함/임/음 + space, or .!?)
  const sentences = text.split(/(?<=[.!?。다요함임음])\s+/);
  for (const sent of sentences) {
    if (countKw(sent, kw) >= 2) return `문장내 2회: "${sent.slice(0, 60)}..."`;
  }
  // Split by paragraphs (double newline)
  const paragraphs = text.split(/\n\n+/);
  for (const para of paragraphs) {
    if (countKw(para, kw) >= 3) return `문단내 3회`;
  }
  return null;
}

// ============ SIMILARITY ============
// Sentence-level similarity — SEO standard: shared sentences between pages
function getShingles(text: string): Set<string> {
  // Split into sentences (Korean sentence endings)
  const sentences = text.replace(/\s+/g, ' ').trim()
    .split(/(?<=[.!?다요함임음])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 10); // ignore very short fragments
  return new Set(sentences);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  let intersection = 0;
  for (const s of a) if (b.has(s)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ============ MAIN ============
interface PageResult {
  path: string;
  name: string;
  chars: number;
  kwCount: number;
  density: string;
  densityOk: boolean;
  titleDups: string[];
  stuffing: string | null;
  uniqueText: string; // for similarity
}

const results: PageResult[] = [];

// --- Process 103 venue pages ---
for (const v of venues) {
  const label = getVenueLabel(v);
  const pageText = buildPageText(v);
  const totalChars = pageText.length;
  const kwCount = countKw(pageText, label);
  const density = totalChars > 0 ? (kwCount * label.length) / totalChars * 100 : 0;
  const title = buildTitle(v);
  const titleDups = checkTitleDups(title);
  const contentText = extractContentText(v.id);
  const stuffing = checkStuffing(contentText, label);

  results.push({
    path: `/${v.region}/${v.id.replace(v.region + '-', '')}`,
    name: label,
    chars: totalChars,
    kwCount,
    density: density.toFixed(2),
    densityOk: density >= 1.5 && density <= 2.5,
    titleDups,
    stuffing,
    uniqueText: contentText,
  });
}

// ============ DENSITY FIX CHECK ============
const densityBad = results.filter(r => !r.densityOk);

// ============ TITLE FIX CHECK ============
const titleBad = results.filter(r => r.titleDups.length > 0);

// ============ STUFFING CHECK ============
const stuffingBad = results.filter(r => r.stuffing !== null);

// ============ SIMILARITY CHECK ============
// Build shingles for unique content of each page
const shingles = results.map(r => ({
  path: r.path,
  name: r.name,
  set: getShingles(r.uniqueText),
}));

// Compare all pairs - find max similarity for each page
const simResults: { path: string; name: string; maxSim: number; maxPair: string }[] = [];
const highSimPairs: { a: string; b: string; sim: number }[] = [];

for (let i = 0; i < shingles.length; i++) {
  let maxSim = 0;
  let maxPair = '';
  for (let j = 0; j < shingles.length; j++) {
    if (i === j) continue;
    const sim = jaccardSimilarity(shingles[i].set, shingles[j].set);
    if (sim > maxSim) {
      maxSim = sim;
      maxPair = shingles[j].name;
    }
    if (i < j && sim > 0.10) {
      highSimPairs.push({ a: shingles[i].name, b: shingles[j].name, sim });
    }
  }
  simResults.push({ path: shingles[i].path, name: shingles[i].name, maxSim, maxPair });
}

// ============ REPORT ============
console.log('');
console.log('========== SEO AUDIT REPORT ==========');
console.log('');
console.log('| 페이지 | 가게이름 | 본문길이 | 키워드횟수 | 밀도% | 유사도% | 스터핑 |');
console.log('|--------|---------|---------|----------|-------|--------|-------|');

for (let i = 0; i < results.length; i++) {
  const r = results[i];
  const sr = simResults[i];
  const dMark = r.densityOk ? '✅' : (parseFloat(r.density) < 1.5 ? '❌LOW' : '❌HIGH');
  const sMark = sr.maxSim <= 0.10 ? '✅' : '❌';
  const simPct = (sr.maxSim * 100).toFixed(1);
  const stuff = r.stuffing ? '❌' : '✅';
  console.log(`| ${r.path} | ${r.name} | ${r.chars}자 | ${r.kwCount}회 | ${r.density}% ${dMark} | ${simPct}% ${sMark} | ${stuff} |`);
}

// ============ SUMMARY ============
console.log('');
console.log('========== SUMMARY ==========');
console.log(`총 페이지: ${results.length}`);
console.log('');

// Density
const dOk = results.filter(r => r.densityOk).length;
const dLow = results.filter(r => parseFloat(r.density) < 1.5).length;
const dHigh = results.filter(r => parseFloat(r.density) > 2.5).length;
console.log(`[밀도] OK: ${dOk} | LOW: ${dLow} | OVER: ${dHigh}`);
if (dLow > 0) { console.log('  LOW:'); results.filter(r => parseFloat(r.density) < 1.5).forEach(r => console.log(`    ${r.name}: ${r.density}%`)); }
if (dHigh > 0) { console.log('  OVER:'); results.filter(r => parseFloat(r.density) > 2.5).forEach(r => console.log(`    ${r.name}: ${r.density}%`)); }

// Similarity
const sOk = simResults.filter(r => r.maxSim <= 0.10).length;
const sBad = simResults.filter(r => r.maxSim > 0.10).length;
console.log(`[유사도] OK(≤10%): ${sOk} | BAD(>10%): ${sBad}`);
if (highSimPairs.length > 0) {
  console.log('  HIGH SIMILARITY PAIRS:');
  highSimPairs.sort((a, b) => b.sim - a.sim).slice(0, 20).forEach(p => {
    console.log(`    ${p.a} ↔ ${p.b}: ${(p.sim * 100).toFixed(1)}%`);
  });
}

// Title dups
console.log(`[제목 중복단어] OK: ${results.length - titleBad.length} | BAD: ${titleBad.length}`);
if (titleBad.length > 0) {
  titleBad.forEach(r => console.log(`  ❌ ${r.name}: 중복=[${r.titleDups.join(', ')}]`));
}

// Stuffing
console.log(`[스터핑] OK: ${results.length - stuffingBad.length} | BAD: ${stuffingBad.length}`);
if (stuffingBad.length > 0) {
  stuffingBad.forEach(r => console.log(`  ❌ ${r.name}: ${r.stuffing}`));
}

console.log('');
const allGood = dLow === 0 && dHigh === 0 && sBad === 0 && titleBad.length === 0 && stuffingBad.length === 0;
console.log(allGood ? '🎯 ALL CLEAR — 모든 항목 통과!' : '⚠️ FIX NEEDED — 위 항목 수정 필요');
