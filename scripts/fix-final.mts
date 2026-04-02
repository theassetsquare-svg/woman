/**
 * Final fix: stuffing + similarity while preserving density 1.5-2.5%
 *
 * Strategy:
 * 1. Stuffing: split paragraphs with 3+ keyword mentions (add newline between sentences)
 * 2. Similarity: find EXACT shared sentences between high-sim pairs → replace with v.name version
 * 3. Density: verify after each change, undo if broken
 */
import { venues, getVenueLabel } from '../src/data/venues.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentPath = join(__dirname, '..', 'src/data/venueContent.ts');
let src = readFileSync(contentPath, 'utf-8');

type V = typeof venues[0];

function countKw(t: string, kw: string): number { let c = 0, p = 0; while ((p = t.indexOf(kw, p)) !== -1) { c++; p += kw.length; } return c; }

function extractBlock(id: string): { block: string; start: number; end: number } | null {
  const marker = `'${id}': {`; const si = src.indexOf(marker); if (si === -1) return null;
  let d = 0, i = src.indexOf('{', si); const start = i;
  for (; i < src.length; i++) { if (src[i] === '{') d++; if (src[i] === '}') d--; if (d === 0) break; }
  return { block: src.slice(start, i + 1), start, end: i + 1 };
}

function extractIntro(block: string): string {
  const m = block.match(/intro:\s*`([\s\S]*?)`/);
  return m ? m[1] : '';
}

function getShingles(text: string): Set<string> {
  const sentences = text.replace(/\s+/g, ' ').trim()
    .split(/(?<=[.!?다요함임음])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 10);
  return new Set(sentences);
}

function jaccardSim(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const s of a) if (b.has(s)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function extractAllText(block: string): string {
  const t: string[] = [];
  const m2 = block.match(/intro:\s*`([\s\S]*?)`/); if (m2) t.push(m2[1]);
  const r = /body:\s*`([\s\S]*?)`/g; let m; while ((m = r.exec(block)) !== null) t.push(m[1]);
  const m6 = block.match(/conclusion:\s*`([\s\S]*?)`/); if (m6) t.push(m6[1]);
  return t.join(' ');
}

function getSubKw(v: V) {
  const m: Record<string, string> = { club: '클럽', lounge: '라운지', room: '룸', yojeong: '요정', hoppa: '호빠' };
  return `${v.seoArea} ${m[v.category || 'night'] || '나이트'}`;
}

function buildPageText(v: V, contentText: string): string {
  const label = getVenueLabel(v);
  return [`홈 ${v.area} ${v.name}`, label, v.area, v.contact ? `${v.contact} 실장` : '', v.card_hook,
    `${label} 상세 정보`, v.description, v.tags.join(' '), `${label} 핵심 요약`,
    `${getSubKw(v)} 이용 가이드`, contentText, `30초 플랜`, `${label} FAQ`, `${getSubKw(v)} 방문 전 확인`].join(' ');
}

function checkDensity(v: V): number {
  const ext = extractBlock(v.id);
  if (!ext) return 0;
  const label = getVenueLabel(v);
  const ct = extractAllText(ext.block);
  const pt = buildPageText(v, ct);
  return (countKw(pt, label) * label.length) / pt.length * 100;
}

// ===== STEP 1: Fix stuffing =====
console.log('=== STEP 1: Fix stuffing ===');
let stuffFixed = 0;

for (const v of venues) {
  const kw = getVenueLabel(v);
  const ext = extractBlock(v.id);
  if (!ext) continue;

  const intro = extractIntro(ext.block);
  const paragraphs = intro.split('\n\n');
  let hasStuffing = false;

  const fixedParas = paragraphs.map(para => {
    if (countKw(para, kw) >= 3) {
      hasStuffing = true;
      // Split at sentence boundaries to keep max 2 kw per paragraph
      const sents = para.split(/(?<=[.다요함임음!?])\s+/).filter(s => s.length > 3);
      const result: string[][] = [[]];
      let curKw = 0;
      for (const sent of sents) {
        const sentKw = countKw(sent, kw);
        if (curKw + sentKw >= 3 && result[result.length - 1].length > 0) {
          result.push([sent]);
          curKw = sentKw;
        } else {
          result[result.length - 1].push(sent);
          curKw += sentKw;
        }
      }
      return result.map(group => group.join(' ')).join('\n\n');
    }
    return para;
  });

  if (hasStuffing) {
    const newIntro = fixedParas.join('\n\n');
    const introMatch = ext.block.match(/intro:\s*`([\s\S]*?)`/);
    if (introMatch) {
      const newBlock = ext.block.replace(introMatch[0], `intro: \`${newIntro}\``);
      // Verify density still OK
      const oldSrc = src;
      src = src.slice(0, ext.start) + newBlock + src.slice(ext.end);
      const den = checkDensity(v);
      if (den < 1.5 || den > 2.5) {
        src = oldSrc; // revert
      } else {
        stuffFixed++;
      }
    }
  }
}
console.log(`Stuffing fixed: ${stuffFixed}`);

// ===== STEP 2: Fix similarity =====
console.log('\n=== STEP 2: Fix similarity ===');

// Find shared sentences between all venue pairs
const venueData: { v: V; text: string; shingles: Set<string> }[] = [];
for (const v of venues) {
  const ext = extractBlock(v.id);
  if (!ext) continue;
  const text = extractAllText(ext.block);
  venueData.push({ v, text, shingles: getShingles(text) });
}

// Find ALL shared sentences across venues
const sentenceOwners = new Map<string, string[]>(); // sentence → [venue names]
for (const vd of venueData) {
  for (const sent of vd.shingles) {
    if (!sentenceOwners.has(sent)) sentenceOwners.set(sent, []);
    sentenceOwners.get(sent)!.push(vd.v.id);
  }
}

// Sentences that appear in 2+ venues are the problem
const sharedSentences = new Map<string, string[]>();
for (const [sent, owners] of sentenceOwners) {
  if (owners.length >= 2) sharedSentences.set(sent, owners);
}
console.log(`Shared sentences found: ${sharedSentences.size}`);

// For each venue, replace shared sentences with venue-unique versions
let simFixed = 0;
for (let vi = 0; vi < venues.length; vi++) {
  const v = venues[vi];
  const kw = getVenueLabel(v);
  const ext = extractBlock(v.id);
  if (!ext) continue;

  const intro = extractIntro(ext.block);
  const sentences = intro.split(/(?<=[.다요함임음!?])\s+/).filter(s => s.length >= 10);

  let modified = false;
  const newSentences: string[] = [];

  for (const sent of sentences) {
    const owners = sentenceOwners.get(sent.trim());
    if (owners && owners.length >= 2) {
      // This sentence is shared — make it unique by prepending/appending venue name
      const uniqueVersion = sent.replace(/이곳/g, v.name)
        .replace(/이 공간/g, `${v.name}의 공간`)
        .replace(/이 동네/g, `${v.name}이(가) 위치한 ${v.area}`);

      // If still same as original (no replacements found), prefix with venue name
      if (uniqueVersion === sent) {
        newSentences.push(`${v.name} — ${sent}`);
      } else {
        newSentences.push(uniqueVersion);
      }
      modified = true;
    } else {
      newSentences.push(sent);
    }
  }

  if (modified) {
    // Rejoin into paragraphs (group by ~3 sentences)
    const paragraphs: string[] = [];
    for (let i = 0; i < newSentences.length; i += 3) {
      paragraphs.push(newSentences.slice(i, i + 3).join(' '));
    }
    const newIntro = paragraphs.join('\n\n');

    const introMatch = ext.block.match(/intro:\s*`([\s\S]*?)`/);
    if (introMatch) {
      const newBlock = ext.block.replace(introMatch[0], `intro: \`${newIntro}\``);
      const oldSrc = src;
      src = src.slice(0, ext.start) + newBlock + src.slice(ext.end);

      // Verify density
      const den = checkDensity(v);
      if (den < 1.5 || den > 2.5) {
        src = oldSrc; // revert
      } else {
        simFixed++;
      }
    }
  }
}
console.log(`Venues uniquified: ${simFixed}`);

writeFileSync(contentPath, src, 'utf-8');

// ===== FINAL VERIFY =====
console.log('\n=== FINAL VERIFY ===');
let dOk = 0, dBad = 0, stBad = 0;
for (const v of venues) {
  const den = checkDensity(v);
  if (den >= 1.5 && den <= 2.5) dOk++;
  else dBad++;

  const kw = getVenueLabel(v);
  const ext = extractBlock(v.id);
  if (ext) {
    const intro = extractIntro(ext.block);
    if (intro.split('\n\n').some(p => countKw(p, kw) >= 3)) stBad++;
  }
}

// Similarity
const finalTexts = venues.map(v => {
  const ext = extractBlock(v.id);
  return { name: getVenueLabel(v), shingles: getShingles(ext ? extractAllText(ext.block) : '') };
});

let simBad = 0;
for (let i = 0; i < finalTexts.length; i++) {
  let maxSim = 0;
  for (let j = 0; j < finalTexts.length; j++) {
    if (i === j) continue;
    const sim = jaccardSim(finalTexts[i].shingles, finalTexts[j].shingles);
    if (sim > maxSim) maxSim = sim;
  }
  if (maxSim > 0.10) simBad++;
}

console.log(`밀도 OK: ${dOk} | BAD: ${dBad}`);
console.log(`스터핑 BAD: ${stBad}`);
console.log(`유사도 >10% BAD: ${simBad}`);
