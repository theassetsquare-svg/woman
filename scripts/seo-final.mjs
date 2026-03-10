#!/usr/bin/env node
/**
 * SEO Final Pass
 * 1. Reduce store name in intro/sections/conclusion to exactly 6-8 (replace excess with "이곳" variants)
 * 2. Fix remaining 35 duplicate words
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, '../src/data/venueContent.ts');

const venueNames = {
  'gangnam-boston': '보스턴',
  'gangnam-i': '아이(I)',
  'gangnam-flirting': '플러팅진혁',
  'gangnam-blackhole': '블랙홀',
  'geondae-wclub': 'W클럽',
  'jangan-bini': '빈이',
  'jangan-cube': '큐브',
  'jangan-bbangbbang': '빵빵',
  'busan-michelin': '미슐랭',
  'busan-q': '큐(Q)',
  'busan-david': '다비드바',
  'busan-aura': '아우라',
  'busan-menz': '맨즈',
  'busan-w': '더블유(W)',
  'busan-theking': '더킹',
  'busan-js': '제이에스',
  'busan-michelin-jisung': '미슐랭(지성)',
  'suwon-beast': '비스트',
  'suwon-maid': '메이드',
  'suwon-play': '플레이 가라오케',
  'suwon-lasvegas': '라스베가스',
  'daejeon-eclipse': '이클립스',
  'daejeon-tombar': '톰바',
  'gwangju-w': 'W',
  'changwon-avengers': '어벤져스',
};

function hasBatchim(str) {
  if (!str) return false;
  let c = str[str.length - 1];
  if (c === ')') { const p = str.lastIndexOf('('); if (p > 0) c = str[p - 1]; }
  const code = c.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false;
  return (code - 0xAC00) % 28 !== 0;
}
function getP(name, type) {
  const b = hasBatchim(name);
  return { '은는': b?'은':'는', '이가': b?'이':'가', '을를': b?'을':'를' }[type] || '';
}

let content = readFileSync(FILE, 'utf-8');

// ===============================
// STEP 1: Reduce store name to 6-8 in intro/sections/conclusion
// ===============================

const venueBlockRegex = /^'([^']+)':\s*\{/gm;
let allMatches = [...content.matchAll(venueBlockRegex)];

for (let i = 0; i < allMatches.length; i++) {
  const venueId = allMatches[i][1];
  const name = venueNames[venueId];
  if (!name) continue;

  const blockStart = allMatches[i].index;
  const blockEnd = i + 1 < allMatches.length ? allMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  let block = content.substring(blockStart, blockEnd);

  const nameEsc = name.replace(/[()]/g, '\\$&');
  const nameRegex = new RegExp(nameEsc, 'g');

  // Count in sections only (not in title, summary, faq questions, etc.)
  // We need to reduce in section BODIES only (they have the most excess)
  const bodyRegex = /(body:\s*`)([^`]*?)(`)/g;
  let bm;
  let sectionBodies = [];
  while ((bm = bodyRegex.exec(block)) !== null) {
    const count = (bm[2].match(nameRegex) || []).length;
    sectionBodies.push({ text: bm[2], count, offset: bm.index, full: bm[0], prefix: bm[1], suffix: bm[3] });
  }

  // Count in intro
  const introMatch = block.match(/(intro:\s*`)([^`]*?)(`)/);
  const introCount = introMatch ? (introMatch[2].match(nameRegex) || []).length : 0;

  // Count in conclusion
  const concMatch = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
  const concCount = concMatch ? (concMatch[2].match(nameRegex) || []).length : 0;

  const secTotalCount = sectionBodies.reduce((s, b) => s + b.count, 0);
  const totalCount = introCount + secTotalCount + concCount;

  // Target: keep 6-8 total. Keep intro names (max 3), conclusion (max 2), distribute 2-3 in sections
  const TARGET = 7;

  if (totalCount > 8) {
    // We need to reduce. Replace excess in section bodies with "이곳" variants
    const toRemove = totalCount - TARGET;
    let removed = 0;

    // Replace in section bodies first (starting from later sections)
    for (let s = sectionBodies.length - 1; s >= 0 && removed < toRemove; s--) {
      const sec = sectionBodies[s];
      if (sec.count === 0) continue;

      const canRemove = Math.min(sec.count, toRemove - removed);
      let secRemoved = 0;
      let secCount = 0;

      // Replace name with "이곳" variants
      const replacements = [
        { find: new RegExp(`${nameEsc}은`, 'g'), replace: '이곳은' },
        { find: new RegExp(`${nameEsc}는`, 'g'), replace: '이곳은' },
        { find: new RegExp(`${nameEsc}이`, 'g'), replace: '이곳이' },
        { find: new RegExp(`${nameEsc}가`, 'g'), replace: '이곳이' },
        { find: new RegExp(`${nameEsc}을`, 'g'), replace: '이곳을' },
        { find: new RegExp(`${nameEsc}를`, 'g'), replace: '이곳을' },
        { find: new RegExp(`${nameEsc}의`, 'g'), replace: '이곳의' },
        { find: new RegExp(`${nameEsc}에서`, 'g'), replace: '이곳에서' },
        { find: new RegExp(`${nameEsc}에`, 'g'), replace: '이곳에' },
        { find: new RegExp(`${nameEsc}만의`, 'g'), replace: '이곳만의' },
        { find: new RegExp(`${nameEsc}(?=[.。,，\\s\\n'"\`])`, 'g'), replace: '이곳' },
        { find: new RegExp(nameEsc, 'g'), replace: '이곳' },
      ];

      let newText = sec.text;
      for (const r of replacements) {
        if (secRemoved >= canRemove) break;
        let cnt = 0;
        newText = newText.replace(r.find, (match) => {
          cnt++;
          if (secRemoved < canRemove) {
            secRemoved++;
            removed++;
            return r.replace;
          }
          return match;
        });
      }

      // Update the block
      if (secRemoved > 0) {
        block = block.replace(sec.prefix + sec.text + sec.suffix, sec.prefix + newText + sec.suffix);
      }
    }

    // If still need to reduce, remove from intro
    if (removed < toRemove && introCount > 3) {
      const introExcess = Math.min(introCount - 3, toRemove - removed);
      let introRemoved = 0;
      const newIntroMatch = block.match(/(intro:\s*`)([^`]*?)(`)/);
      if (newIntroMatch) {
        let iText = newIntroMatch[2];
        let cnt = 0;
        iText = iText.replace(nameRegex, (match) => {
          cnt++;
          if (cnt > 3 && introRemoved < introExcess) {
            introRemoved++;
            removed++;
            return '이곳';
          }
          return match;
        });
        block = block.replace(newIntroMatch[0], newIntroMatch[1] + iText + newIntroMatch[3]);
      }
    }

    // If still need to reduce from conclusion
    if (removed < toRemove && concCount > 2) {
      const concExcess = Math.min(concCount - 2, toRemove - removed);
      let concRemoved = 0;
      const newConcMatch = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
      if (newConcMatch) {
        let cText = newConcMatch[2];
        let cnt = 0;
        cText = cText.replace(nameRegex, (match) => {
          cnt++;
          if (cnt > 2 && concRemoved < concExcess) {
            concRemoved++;
            removed++;
            return '이곳';
          }
          return match;
        });
        block = block.replace(newConcMatch[0], newConcMatch[1] + cText + newConcMatch[3]);
      }
    }
  }

  content = content.substring(0, blockStart) + block + content.substring(blockEnd);
}

// ===============================
// STEP 2: Fix remaining duplicate words
// ===============================

// Specific fixes per venue for identified issues
const specificFixes = {
  'geondae-wclub': {
    'W클럽은': { max: 5, replacements: ['이곳은', '건대 대표 호빠는', '이 장소는'] }
  },
  'busan-david': {
    '이벤트': { max: 5, replacements: ['행사', '프로그램', '참여형 활동'] }
  },
  'busan-aura': {
    '선수가': { max: 5, replacements: ['호스트가', '출근자가', '멤버가'] },
    '선수를': { max: 5, replacements: ['호스트를', '파트너를', '담당자를'] }
  },
  'busan-w': {
    '더블유': { max: 5, replacements: ['이곳', '이 장소', '부산 최장수 가게'] }
  },
  'busan-js': {
    '분리된': { max: 5, replacements: ['독립된', '개별', '별도의', '전용', '구획된'] },
    '없습니다': { max: 5, replacements: ['않습니다', '아닙니다'] },
    '깨끗한': { max: 5, replacements: ['청결한', '위생적인', '정돈된', '쾌적한'] },
    '프라이버시가': { max: 5, replacements: ['사생활이', '개인 공간이', '비공개성이'] },
    '전화로': { max: 5, replacements: ['연락으로', '통화로', '유선으로'] }
  },
  'busan-michelin-jisung': {
    '미슐랭': { max: 5, replacements: ['이곳', '이 브랜드', '이 업소', '해운대 명소'] },
    '실장의': { max: 5, replacements: ['담당자의', '매니저의', '운영자의'] },
    '서비스를': { max: 5, replacements: ['응대를', '케어를', '서비스 품질을'] },
    '경험을': { max: 5, replacements: ['체험을', '시간을', '순간을'] }
  },
  'suwon-maid': {
    '플레이': { max: 5, replacements: ['인근 가게', '다른 업소', '주변 매장'] }
  },
  'suwon-play': {
    '플레이': { max: 5, replacements: ['이곳', '이 매장', '노래방 호빠'] },
    '가라오케는': { max: 5, replacements: ['이곳은', '이 매장은', '노래방 호빠는'] }
  },
  'suwon-lasvegas': {
    '원하면': { max: 5, replacements: ['바란다면', '희망하면', '기대한다면', '선호하면'] },
    '화려한': { max: 5, replacements: ['눈부신', '세련된', '돋보이는', '화사한'] }
  },
  'daejeon-eclipse': {
    '대전에서': { max: 5, replacements: ['이 도시에서', '중부권에서', '이 지역에서'] },
    '프리미엄': { max: 5, replacements: ['최상급', '상위급', '하이엔드'] }
  },
  'daejeon-tombar': {
    '대학가': { max: 5, replacements: ['학교 인근', '캠퍼스 근처', '젊은 동네'] },
    '분위기를': { max: 5, replacements: ['무드를', '에너지를', '감성을'] },
    '가게가': { max: 5, replacements: ['이곳이', '매장이', '업소가'] }
  },
  'gwangju-w': {
    '호빠를': { max: 5, replacements: ['호스트바를', '이 업종을', '이런 곳을'] },
    '유일한': { max: 5, replacements: ['독보적인', '대체 불가한', '유일무이한'] },
    '확인하세요': { max: 5, replacements: ['알아보세요', '체크하세요', '문의하세요'] }
  },
  'changwon-avengers': {
    '전국에서': { max: 5, replacements: ['각지에서', '여러 도시에서', '전역에서'] },
    '호빠를': { max: 5, replacements: ['호스트바를', '이 업종을', '이런 곳을'] },
    '전화로': { max: 5, replacements: ['연락으로', '통화로', '유선으로'] }
  },
  'gangnam-blackhole': {
    '프리미엄': { max: 5, replacements: ['상위급', '하이엔드', '고급'] }
  },
  'jangan-cube': {
    '없습니다': { max: 5, replacements: ['않습니다', '아닙니다'] },
    '무제한': { max: 5, replacements: ['제한 없는', '자유로운', '횟수 무관'] }
  },
  'jangan-bbangbbang': {
    '분에게': { max: 5, replacements: ['고객에게', '손님에게', '이용자에게'] },
    '시간을': { max: 5, replacements: ['타이밍을', '일정을', '때를'] }
  }
};

allMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];

for (let i = 0; i < allMatches.length; i++) {
  const venueId = allMatches[i][1];
  const fixes = specificFixes[venueId];
  if (!fixes) continue;

  const blockStart = allMatches[i].index;
  const blockEnd = i + 1 < allMatches.length ? allMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  let block = content.substring(blockStart, blockEnd);

  for (const [word, config] of Object.entries(fixes)) {
    const regex = new RegExp(word.replace(/[()]/g, '\\$&'), 'g');
    const occurrences = (block.match(regex) || []).length;

    if (occurrences > config.max) {
      let count = 0;
      let repIdx = 0;
      block = block.replace(regex, (match) => {
        count++;
        if (count > config.max) {
          const rep = config.replacements[repIdx % config.replacements.length];
          repIdx++;
          return rep;
        }
        return match;
      });
    }
  }

  content = content.substring(0, blockStart) + block + content.substring(blockEnd);
}

// ===============================
// FINAL REPORT
// ===============================

console.log('\n========================================');
console.log('  최종 SEO 최적화 보고서');
console.log('========================================\n');

allMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];

console.log('--- 가게 이름 삽입 현황 (서론/본론/결론) ---\n');
console.log('업소ID'.padEnd(25), '이름'.padEnd(15), '서론', '본론', '결론', '합계', '상태');
console.log('-'.repeat(80));

const nameResults = {};
for (let i = 0; i < allMatches.length; i++) {
  const venueId = allMatches[i][1];
  const name = venueNames[venueId];
  if (!name) continue;

  const blockStart = allMatches[i].index;
  const blockEnd = i + 1 < allMatches.length ? allMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  const block = content.substring(blockStart, blockEnd);

  const nameEsc = name.replace(/[()]/g, '\\$&');
  const nameRegex = new RegExp(nameEsc, 'g');

  const introMatch = block.match(/(intro:\s*`)([^`]*?)(`)/);
  const introCount = introMatch ? (introMatch[2].match(nameRegex) || []).length : 0;

  const bodyRegex = /(body:\s*`)([^`]*?)(`)/g;
  let secCount = 0;
  let bm;
  while ((bm = bodyRegex.exec(block)) !== null) secCount += (bm[2].match(nameRegex) || []).length;

  const concMatch = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
  const concCount = concMatch ? (concMatch[2].match(nameRegex) || []).length : 0;

  const total = introCount + secCount + concCount;
  const status = total >= 6 && total <= 8 ? 'OK' : total < 6 ? 'LOW' : 'HIGH';
  console.log(venueId.padEnd(25), name.padEnd(15), String(introCount).padStart(4), String(secCount).padStart(4), String(concCount).padStart(4), String(total).padStart(4), ` ${status}`);
  nameResults[venueId] = { name, introCount, secCount, concCount, total };
}

console.log('\n--- 중복 단어 최종 현황 ---\n');
console.log('업소'.padEnd(25), '이름'.padEnd(15), '5회 초과 중복단어');
console.log('-'.repeat(80));

allMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];
let totalExcess = 0;
const dupResults = {};

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
  const skip = new Set(['입니다','합니다','있습니다','됩니다','습니다','에서','으로','에게','까지','부터','하는','이며','하고','있는','없는','좋은','있고','없이','하면','같은','위해','대한','통해','가능','수준','정도','이상','이하','확인','문의','가능합니다','추천합니다','제공합니다','방문','전화','예약','가게','선수','서비스','분위기','시스템','호빠','것입니다','않습니다','것이','수도','것은','때문에','하지만','그리고','또한','에서는','에서의','경우가','정확한','아닙니다','기본','가장','포함','됩니다','이런','어떤','이라는','이곳은','이곳이','이곳의','이곳에','이곳을','이곳에서','이곳만의','이곳','가능하며','방문하는','경우가','경우는','방문한다면','것이며','것이다','추천합니다','시간은','분위기가','시간이','것이다','좋습니다','원합니다','됩니다','있으니','바랍니다','없습니다','드립니다','보세요']);
  for (const w of words) {
    if (skip.has(w) || w.length < 3) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  const nameClean = name.replace(/[()]/g, '');
  const overFive = Object.entries(freq)
    .filter(([word, count]) => count > 5 && !word.includes(nameClean))
    .sort((a, b) => b[1] - a[1]);

  const dupStr = overFive.length === 0 ? 'OK (5이하)' : overFive.map(([w, c]) => `${w}(${c}회)`).join(', ');
  console.log(venueId.padEnd(25), name.padEnd(15), dupStr);
  totalExcess += overFive.length;
  dupResults[venueId] = overFive;
}

console.log(`\n총 5회 초과 중복단어: ${totalExcess}건`);

writeFileSync(FILE, content, 'utf-8');
console.log('\n파일 저장 완료\n');
