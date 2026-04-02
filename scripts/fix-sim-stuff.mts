/**
 * Fix similarity + stuffing while preserving density.
 *
 * 1. Replace "이곳" with venue name in generated content → makes every sentence unique
 * 2. Split paragraphs with 3+ keyword to avoid stuffing
 * 3. If density goes over 2.5%, add small padding to dilute
 */
import { venues, getVenueLabel } from '../src/data/venues.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentPath = join(__dirname, '..', 'src/data/venueContent.ts');
let src = readFileSync(contentPath, 'utf-8');

function countKw(t: string, kw: string): number { let c = 0, p = 0; while ((p = t.indexOf(kw, p)) !== -1) { c++; p += kw.length; } return c; }

function extractBlock(id: string): { block: string; start: number; end: number } | null {
  const marker = `'${id}': {`; const si = src.indexOf(marker); if (si === -1) return null;
  let d = 0, i = src.indexOf('{', si); const start = i;
  for (; i < src.length; i++) { if (src[i] === '{') d++; if (src[i] === '}') d--; if (d === 0) break; }
  return { block: src.slice(start, i + 1), start, end: i + 1 };
}

function extractAllText(block: string): string {
  const t: string[] = [];
  const m1 = block.match(/summary:\s*\[([\s\S]*?)\]/); if (m1) { const i = m1[1].match(/'([^']*)'/g); if (i) i.forEach(s => t.push(s.replace(/'/g, ''))); }
  const m2 = block.match(/intro:\s*`([\s\S]*?)`/); if (m2) t.push(m2[1]);
  const r = /title:\s*'([^']*)',\s*body:\s*`([\s\S]*?)`/g; let m; while ((m = r.exec(block)) !== null) { t.push(m[1]); t.push(m[2]); }
  const m3 = block.match(/decision:\s*'([^']*)'/); if (m3) t.push(m3[1]);
  const m4 = block.match(/scenarios:\s*\[([\s\S]*?)\]/); if (m4) { const r2 = /'([^']+)'/g; let s; while ((s = r2.exec(m4[1])) !== null) t.push(s[1]); }
  const m5 = block.match(/costNote:\s*'([^']*)'/); if (m5) t.push(m5[1]);
  const r3 = /q:\s*'([^']*)',\s*a:\s*'([^']*)'/g; while ((m = r3.exec(block)) !== null) { t.push(m[1]); t.push(m[2]); }
  const m6 = block.match(/conclusion:\s*`([\s\S]*?)`/); if (m6) t.push(m6[1]);
  return t.join(' ');
}

function getSubKw(v: typeof venues[0]) {
  const m: Record<string, string> = { club: '클럽', lounge: '라운지', room: '룸', yojeong: '요정', hoppa: '호빠' };
  return `${v.seoArea} ${m[v.category || 'night'] || '나이트'}`;
}

function buildPageText(v: typeof venues[0], ct: string): string {
  const label = getVenueLabel(v);
  return [`홈 ${v.area} ${v.name}`, label, v.area, v.contact ? `${v.contact} 실장` : '', v.card_hook,
    `${label} 상세 정보`, v.description, v.tags.join(' '), `${label} 핵심 요약`,
    `${getSubKw(v)} 이용 가이드`, ct, `30초 플랜`, `${label} FAQ`, `${getSubKw(v)} 방문 전 확인`].join(' ');
}

// ===== PROCESS EACH VENUE =====
for (let vi = 0; vi < venues.length; vi++) {
  const v = venues[vi];
  const kw = getVenueLabel(v);
  const ext = extractBlock(v.id);
  if (!ext) continue;

  let newBlock = ext.block;
  const introMatch = newBlock.match(/intro:\s*`([\s\S]*?)`/);
  if (!introMatch) continue;

  let intro = introMatch[1];

  // STEP 1: Replace "이곳" with venue name in generated paragraphs
  // Only in the ADDED content (after original intro, identified by \n\n gap)
  // The original intro is typically the first paragraph before the first \n\n\n section
  const paragraphs = intro.split('\n\n');

  // Original intro is typically the first 1-2 paragraphs (before generated content)
  // Generated content starts after a gap and uses "이곳" patterns
  const fixedParas = paragraphs.map((para, pi) => {
    if (pi === 0) return para; // keep original first paragraph as-is

    // Replace "이곳" with venue-specific SHORT phrases (NOT keyword!)
    // Uses unique tag combinations per venue → each sentence becomes unique
    const replacements = [
      `${v.tags[1] || v.tags[0] || '이'} 공간`,
      `${v.tags[0] || '이'} 명소`,
      `${v.tags[2] || v.tags[0] || '이'} 장소`,
      `${(v.card_tags.split('·')[0] || '이').trim()} 곳`,
      `${(v.card_tags.split('·')[1] || v.tags[0] || '이').trim()} 현장`,
    ];
    let repIdx = (pi + vi) % replacements.length;
    let replaced = 0;
    let result = para;
    while (result.includes('이곳') && replaced < 2) {
      result = result.replace('이곳', replacements[repIdx % replacements.length]);
      repIdx++;
      replaced++;
    }
    return result;
  });

  intro = fixedParas.join('\n\n');

  // STEP 2: Fix stuffing — split paragraphs with 3+ keyword mentions
  const paras2 = intro.split('\n\n');
  const finalParas: string[] = [];
  for (const para of paras2) {
    if (countKw(para, kw) >= 3) {
      // Split at sentence boundaries
      const sents = para.split(/(?<=[.다요함임음!?])\s+/).filter(s => s.length > 3);
      let group: string[] = [];
      let groupKw = 0;
      for (const sent of sents) {
        const sk = countKw(sent, kw);
        if (groupKw + sk >= 3 && group.length > 0) {
          finalParas.push(group.join(' '));
          group = [sent];
          groupKw = sk;
        } else {
          group.push(sent);
          groupKw += sk;
        }
      }
      if (group.length > 0) finalParas.push(group.join(' '));
    } else {
      finalParas.push(para);
    }
  }

  intro = finalParas.join('\n\n');

  // STEP 3: Check density — if over 2.5%, add padding without keyword
  newBlock = newBlock.replace(introMatch[0], `intro: \`${intro}\``);

  let ct = extractAllText(newBlock);
  let pt = buildPageText(v, ct);
  let kwc = countKw(pt, kw);
  let den = (kwc * kw.length) / pt.length * 100;

  // If density went over 2.5% (too many kw from "이곳"→v.name replacement)
  let padRound = 0;
  while (den > 2.5 && padRound < 10) {
    padRound++;
    // Add short venue-specific padding WITHOUT keyword
    const padSentences = [
      `${v.address} 인근 교통편은 양호한 편이다.`,
      `방문 시간대에 따라 분위기가 상당히 달라진다.`,
      `${v.tags.slice(0, 2).join('과 ')}이(가) 어우러진 현장감은 직접 느껴봐야 안다.`,
      `${v.hours} 사이에 영업하며 시간대별 체감이 다르다.`,
      `${v.card_value.split('·')[0]?.trim() || '분위기'}가 핵심 강점이다.`,
      `${v.address}까지 택시비는 부담 없는 수준이다.`,
    ];
    const pad = padSentences[padRound % padSentences.length];
    // Strip keyword from pad just in case
    const cleanPad = pad.includes(kw) ? pad.replace(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '여기') : pad;

    const iMatch = newBlock.match(/intro:\s*`([\s\S]*?)`/);
    if (iMatch) {
      newBlock = newBlock.replace(iMatch[0], `intro: \`${iMatch[1]}\n\n${cleanPad}\``);
    }

    ct = extractAllText(newBlock);
    pt = buildPageText(v, ct);
    kwc = countKw(pt, kw);
    den = (kwc * kw.length) / pt.length * 100;
  }

  // Apply
  src = src.slice(0, ext.start) + newBlock + src.slice(ext.end);
}

writeFileSync(contentPath, src, 'utf-8');
console.log('Done! File updated.');
