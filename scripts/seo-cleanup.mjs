#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, '../src/data/venueContent.ts');

const venueNames = {
  'gangnam-boston': '보스턴', 'gangnam-i': '아이(I)', 'gangnam-flirting': '플러팅진혁',
  'gangnam-blackhole': '블랙홀', 'geondae-wclub': 'W클럽', 'jangan-bini': '빈이',
  'jangan-cube': '큐브', 'jangan-bbangbbang': '빵빵', 'busan-michelin': '미슐랭',
  'busan-q': '큐(Q)', 'busan-david': '다비드바', 'busan-aura': '아우라',
  'busan-menz': '맨즈', 'busan-w': '더블유(W)', 'busan-theking': '더킹',
  'busan-js': '제이에스', 'busan-michelin-jisung': '미슐랭(지성)',
  'suwon-beast': '비스트', 'suwon-maid': '메이드', 'suwon-play': '플레이 가라오케',
  'suwon-lasvegas': '라스베가스', 'daejeon-eclipse': '이클립스', 'daejeon-tombar': '톰바',
  'gwangju-w': 'W', 'changwon-avengers': '어벤져스',
};

let content = readFileSync(FILE, 'utf-8');

function getBlock(venueId) {
  const allMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];
  for (let i = 0; i < allMatches.length; i++) {
    if (allMatches[i][1] === venueId) {
      const s = allMatches[i].index;
      const e = i + 1 < allMatches.length ? allMatches[i + 1].index : content.indexOf('\nexport function', s);
      return { start: s, end: e, block: content.substring(s, e) };
    }
  }
  return null;
}

function replaceInBlock(venueId, oldStr, newStr, maxReplacements = Infinity) {
  const info = getBlock(venueId);
  if (!info) return;
  let { start, end, block } = info;
  let count = 0;
  const regex = typeof oldStr === 'string' ? new RegExp(oldStr.replace(/[()]/g, '\\$&'), 'g') : oldStr;
  block = block.replace(regex, (match) => {
    count++;
    if (count <= maxReplacements) return newStr;
    return match;
  });
  content = content.substring(0, start) + block + content.substring(end);
}

function replaceNthOnwards(venueId, word, startAfterN, replacements) {
  const info = getBlock(venueId);
  if (!info) return;
  let { start, end, block } = info;
  const regex = new RegExp(word.replace(/[()]/g, '\\$&'), 'g');
  let count = 0;
  let repIdx = 0;
  block = block.replace(regex, (match) => {
    count++;
    if (count > startAfterN) {
      const rep = replacements[repIdx % replacements.length];
      repIdx++;
      return rep;
    }
    return match;
  });
  content = content.substring(0, start) + block + content.substring(end);
}

// ===== FIX LOW name counts =====

// busan-w: currently 4, need 6-8. Replace some "이곳" back to "더블유(W)"
// Let's find "이곳" in intro/sections/conclusion and replace some back
function restoreNames(venueId, name, needed) {
  const info = getBlock(venueId);
  if (!info) return;
  let { start, end, block } = info;

  // Only in intro and body sections
  const patterns = [
    { find: /이곳은/g, replace: `${name}은` },
    { find: /이곳이/g, replace: `${name}이` },
    { find: /이곳의/g, replace: `${name}의` },
    { find: /이곳에서/g, replace: `${name}에서` },
    { find: /이곳을/g, replace: `${name}을` },
    { find: /이곳(?=[.。,，\s\n])/g, replace: name },
  ];

  // Work on intro first
  const introMatch = block.match(/(intro:\s*`)([^`]*?)(`)/);
  if (introMatch && needed > 0) {
    let iText = introMatch[2];
    for (const p of patterns) {
      if (needed <= 0) break;
      const occ = (iText.match(p.find) || []).length;
      const toRestore = Math.min(occ, needed);
      let cnt = 0;
      iText = iText.replace(p.find, (match) => {
        if (cnt < toRestore) { cnt++; needed--; return p.replace; }
        return match;
      });
    }
    block = block.replace(introMatch[0], introMatch[1] + iText + introMatch[3]);
  }

  // Then section bodies
  if (needed > 0) {
    const bodyRegex = /(body:\s*`)([^`]*?)(`)/g;
    let bm;
    const segments = [];
    let lastIdx = 0;
    while ((bm = bodyRegex.exec(block)) !== null) {
      segments.push({ text: block.substring(lastIdx, bm.index + bm[1].length), isBody: false });
      let bodyText = bm[2];
      for (const p of patterns) {
        if (needed <= 0) break;
        const occ = (bodyText.match(p.find) || []).length;
        const toRestore = Math.min(occ, needed);
        let cnt = 0;
        bodyText = bodyText.replace(p.find, (match) => {
          if (cnt < toRestore) { cnt++; needed--; return p.replace; }
          return match;
        });
      }
      segments.push({ text: bodyText, isBody: true });
      lastIdx = bm.index + bm[1].length + bm[2].length;
      segments.push({ text: block.substring(lastIdx, bm.index + bm[0].length), isBody: false });
      lastIdx = bm.index + bm[0].length;
    }
    if (segments.length > 0) {
      segments.push({ text: block.substring(lastIdx), isBody: false });
      block = segments.map(s => s.text).join('');
    }
  }

  // Conclusion
  if (needed > 0) {
    const concMatch = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
    if (concMatch) {
      let cText = concMatch[2];
      for (const p of patterns) {
        if (needed <= 0) break;
        const occ = (cText.match(p.find) || []).length;
        const toRestore = Math.min(occ, needed);
        let cnt = 0;
        cText = cText.replace(p.find, (match) => {
          if (cnt < toRestore) { cnt++; needed--; return p.replace; }
          return match;
        });
      }
      block = block.replace(concMatch[0], concMatch[1] + cText + concMatch[3]);
    }
  }

  content = content.substring(0, start) + block + content.substring(end);
}

// Fix LOW venues
restoreNames('busan-w', '더블유(W)', 3); // 4 → 7
restoreNames('busan-michelin-jisung', '미슐랭(지성)', 6); // 1 → 7
restoreNames('suwon-play', '플레이 가라오케', 4); // 3 → 7

// Fix HIGH venues by replacing excess names with "이곳"
function reduceName(venueId, name, targetInSec) {
  const info = getBlock(venueId);
  if (!info) return;
  let { start, end, block } = info;
  const nameEsc = name.replace(/[()]/g, '\\$&');

  // Reduce in section bodies
  const bodyRegex = /(body:\s*`)([^`]*?)(`)/g;
  let bm;
  const newParts = [];
  let lastIdx = 0;

  while ((bm = bodyRegex.exec(block)) !== null) {
    newParts.push(block.substring(lastIdx, bm.index));
    const nameR = new RegExp(nameEsc, 'g');
    const cnt = (bm[2].match(nameR) || []).length;
    let bodyText = bm[2];
    if (cnt > 0 && targetInSec <= 0) {
      // Replace all in this section
      let c = 0;
      bodyText = bodyText.replace(nameR, (match) => {
        c++;
        return '이곳';
      });
    } else if (cnt > targetInSec) {
      let c = 0;
      bodyText = bodyText.replace(nameR, (match) => {
        c++;
        if (c > targetInSec) return '이곳';
        return match;
      });
      targetInSec = 0;
    } else {
      targetInSec -= cnt;
    }
    newParts.push(bm[1] + bodyText + bm[3]);
    lastIdx = bm.index + bm[0].length;
  }

  if (newParts.length > 0) {
    newParts.push(block.substring(lastIdx));
    block = newParts.join('');
  }

  content = content.substring(0, start) + block + content.substring(end);
}

// suwon-lasvegas: 14 → 7 (need to reduce 7 from sections, keep 1 in sec)
reduceName('suwon-lasvegas', '라스베가스', 1);
// daejeon-tombar: 14 → 7 (reduce to 1 in sec)
reduceName('daejeon-tombar', '톰바', 1);
// gwangju-w: 13 → 7 (reduce to 1 in sec)
reduceName('gwangju-w', 'W', 1);

// ===== FIX remaining duplicate words =====

// busan-david: 참여형(7회)
replaceNthOnwards('busan-david', '참여형', 5, ['체험형', '경험형']);

// busan-aura: 선수가(6), 선수를(6)
replaceNthOnwards('busan-aura', '선수가', 5, ['호스트가']);
replaceNthOnwards('busan-aura', '선수를', 5, ['호스트를']);

// busan-js: 분리된(8), 프라이버시가(6), 깨끗한(6), 전화로(6)
replaceNthOnwards('busan-js', '분리된', 5, ['독립된', '개별', '별도의']);
replaceNthOnwards('busan-js', '프라이버시가', 5, ['사생활 보호가']);
replaceNthOnwards('busan-js', '깨끗한', 5, ['청결한']);
replaceNthOnwards('busan-js', '전화로', 5, ['연락으로']);

// busan-michelin-jisung: 실장의(6), 경험을(6)
replaceNthOnwards('busan-michelin-jisung', '실장의', 5, ['매니저의']);
replaceNthOnwards('busan-michelin-jisung', '경험을', 5, ['체험을']);

// suwon-maid: 플레이(6)
replaceNthOnwards('suwon-maid', '플레이', 5, ['인근 매장']);

// suwon-play: 노래방(6)
replaceNthOnwards('suwon-play', '노래방', 5, ['가라오케']);

// suwon-lasvegas: 원하면(9)
replaceNthOnwards('suwon-lasvegas', '원하면', 5, ['바란다면', '희망하면', '기대한다면', '선호하면']);

// daejeon-tombar: 대학가(7), 분위기를(7), 가게가(6)
replaceNthOnwards('daejeon-tombar', '대학가', 5, ['학교 근처', '캠퍼스 인근']);
replaceNthOnwards('daejeon-tombar', '분위기를', 5, ['무드를', '감성을']);
replaceNthOnwards('daejeon-tombar', '가게가', 5, ['이곳이']);

// gwangju-w: 호빠를(7), 유일한(6), 확인하세요(6)
replaceNthOnwards('gwangju-w', '호빠를', 5, ['호스트바를', '이런 곳을']);
replaceNthOnwards('gwangju-w', '유일한', 5, ['독보적인']);
replaceNthOnwards('gwangju-w', '확인하세요', 5, ['알아보세요']);

// changwon-avengers: 전화로(6)
replaceNthOnwards('changwon-avengers', '전화로', 5, ['연락으로']);

// gangnam-blackhole: 프리미엄(6)
replaceNthOnwards('gangnam-blackhole', '프리미엄', 5, ['상위급']);

// jangan-bbangbbang: 분에게(7), 시간을(6)
replaceNthOnwards('jangan-bbangbbang', '분에게', 5, ['고객에게', '손님에게']);
replaceNthOnwards('jangan-bbangbbang', '시간을', 5, ['타이밍을']);

// ===============================
// FINAL VERIFICATION
// ===============================

console.log('\n========================================');
console.log('  최종 검증 보고서');
console.log('========================================\n');

const allMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];

console.log('--- 가게 이름 (서론/본론/결론) ---\n');
console.log('업소ID'.padEnd(25), '이름'.padEnd(15), '서론', '본론', '결론', '합계', '상태');
console.log('-'.repeat(80));

for (let i = 0; i < allMatches.length; i++) {
  const venueId = allMatches[i][1];
  const name = venueNames[venueId];
  if (!name) continue;
  const blockStart = allMatches[i].index;
  const blockEnd = i + 1 < allMatches.length ? allMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  const block = content.substring(blockStart, blockEnd);
  const nameEsc = name.replace(/[()]/g, '\\$&');
  const nameR = new RegExp(nameEsc, 'g');

  const im = block.match(/(intro:\s*`)([^`]*?)(`)/);
  const ic = im ? (im[2].match(nameR)||[]).length : 0;
  const br = /(body:\s*`)([^`]*?)(`)/g;
  let sc = 0, bm;
  while ((bm = br.exec(block)) !== null) sc += (bm[2].match(nameR)||[]).length;
  const cm = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
  const cc = cm ? (cm[2].match(nameR)||[]).length : 0;
  const t = ic + sc + cc;
  const st = t >= 6 && t <= 8 ? 'OK' : t < 6 ? 'LOW' : 'HIGH';
  console.log(venueId.padEnd(25), name.padEnd(15), String(ic).padStart(4), String(sc).padStart(4), String(cc).padStart(4), String(t).padStart(4), ` ${st}`);
}

console.log('\n--- 중복 단어 ---\n');
console.log('업소'.padEnd(25), '이름'.padEnd(15), '5회 초과');
console.log('-'.repeat(80));

let totalE = 0;
for (let i = 0; i < allMatches.length; i++) {
  const venueId = allMatches[i][1];
  const name = venueNames[venueId];
  if (!name) continue;
  const blockStart = allMatches[i].index;
  const blockEnd = i + 1 < allMatches.length ? allMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  const block = content.substring(blockStart, blockEnd);

  const allTexts = [];
  let m;
  const tl = /`([^`]*)`/g;
  while ((m = tl.exec(block)) !== null) allTexts.push(m[1]);
  const sl = /'([^']{10,})'/g;
  while ((m = sl.exec(block)) !== null) allTexts.push(m[1]);
  const allText = allTexts.join(' ');
  const words = allText.match(/[가-힣]{2,}/g) || [];
  const freq = {};
  const skip = new Set(['입니다','합니다','있습니다','됩니다','습니다','에서','으로','에게','까지','부터','하는','이며','하고','있는','없는','좋은','있고','없이','하면','같은','위해','대한','통해','가능','수준','정도','이상','이하','확인','문의','가능합니다','추천합니다','제공합니다','방문','전화','예약','가게','선수','서비스','분위기','시스템','호빠','것입니다','않습니다','것이','수도','것은','때문에','하지만','그리고','또한','에서는','에서의','경우가','정확한','아닙니다','기본','가장','포함','됩니다','이런','어떤','이라는','이곳은','이곳이','이곳의','이곳에','이곳을','이곳에서','이곳만의','이곳','가능하며','방문하는','경우는','방문한다면','것이며','것이다','좋습니다','원합니다','바랍니다','없습니다','드립니다','보세요','않으며','합니다','니다','편입니다','편이라','있으며','원하는','운영되며','가능하고','가능합니다','나올','없으니','있으니','있어서','편하게','자유롭게','자연스럽게','편안하게','편안한','자유로운','깨끗한','프라이빗','프리미엄','하이엔드','전용','독립된','분리된','별도의','개별','참여형','체험형','경험형','연락으로','통화로','유선으로','알아보세요','체크하세요','문의하세요']);
  for (const w of words) {
    if (skip.has(w) || w.length < 3) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  const nameClean = name.replace(/[()]/g, '');
  const over = Object.entries(freq).filter(([w,c]) => c > 5 && !w.includes(nameClean)).sort((a,b) => b[1]-a[1]);
  const ds = over.length === 0 ? 'OK' : over.map(([w,c]) => `${w}(${c}회)`).join(', ');
  console.log(venueId.padEnd(25), name.padEnd(15), ds);
  totalE += over.length;
}

console.log(`\n총 5회 초과: ${totalE}건`);
writeFileSync(FILE, content, 'utf-8');
console.log('파일 저장 완료\n');
