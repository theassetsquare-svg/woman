#!/usr/bin/env node
/**
 * SEO Full Name Optimization
 * 가게이름 = "지역호빠 상호명" (예: "강남호빠 보스턴")
 * 서론/본론/결론에 6~8회 삽입 + 중복단어 5이하
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, '../src/data/venueContent.ts');

// venue ID → { short: 상호명, full: "지역호빠 상호명" }
const venueMap = {
  'gangnam-boston': { short: '보스턴', seo: '강남', full: '강남호빠 보스턴' },
  'gangnam-i': { short: '아이(I)', seo: '강남', full: '강남호빠 아이(I)' },
  'gangnam-flirting': { short: '플러팅진혁', seo: '강남', full: '강남호빠 플러팅진혁' },
  'gangnam-blackhole': { short: '블랙홀', seo: '강남', full: '강남호빠 블랙홀' },
  'geondae-wclub': { short: 'W클럽', seo: '건대', full: '건대호빠 W클럽' },
  'jangan-bini': { short: '빈이', seo: '장안동', full: '장안동호빠 빈이' },
  'jangan-cube': { short: '큐브', seo: '장안동', full: '장안동호빠 큐브' },
  'jangan-bbangbbang': { short: '빵빵', seo: '장안동', full: '장안동호빠 빵빵' },
  'busan-michelin': { short: '미슐랭', seo: '해운대', full: '해운대호빠 미슐랭' },
  'busan-q': { short: '큐(Q)', seo: '해운대', full: '해운대호빠 큐(Q)' },
  'busan-david': { short: '다비드바', seo: '해운대', full: '해운대호빠 다비드바' },
  'busan-aura': { short: '아우라', seo: '부산', full: '부산호빠 아우라' },
  'busan-menz': { short: '맨즈', seo: '부산', full: '부산호빠 맨즈' },
  'busan-w': { short: '더블유(W)', seo: '부산', full: '부산호빠 더블유(W)' },
  'busan-theking': { short: '더킹', seo: '부산', full: '부산호빠 더킹' },
  'busan-js': { short: '제이에스', seo: '부산', full: '부산호빠 제이에스' },
  'busan-michelin-jisung': { short: '미슐랭(지성)', seo: '해운대', full: '해운대호빠 미슐랭(지성)' },
  'suwon-beast': { short: '비스트', seo: '수원', full: '수원호빠 비스트' },
  'suwon-maid': { short: '메이드', seo: '수원', full: '수원호빠 메이드' },
  'suwon-play': { short: '플레이 가라오케', seo: '수원', full: '수원호빠 플레이 가라오케' },
  'suwon-lasvegas': { short: '라스베가스', seo: '수원', full: '수원호빠 라스베가스' },
  'daejeon-eclipse': { short: '이클립스', seo: '대전', full: '대전호빠 이클립스' },
  'daejeon-tombar': { short: '톰바', seo: '대전', full: '대전호빠 톰바' },
  'gwangju-w': { short: 'W', seo: '광주', full: '광주호빠 W' },
  'changwon-avengers': { short: '어벤져스', seo: '창원', full: '창원호빠 어벤져스' },
};

let content = readFileSync(FILE, 'utf-8');

const blockRegex = /^'([^']+)':\s*\{/gm;

function getBlocks() {
  return [...content.matchAll(blockRegex)];
}

function escRe(s) { return s.replace(/[()]/g, '\\$&'); }

// For each venue, in intro/sections/conclusion:
// 1. First, replace existing short name occurrences with full name (up to target count)
// 2. Keep remaining short names as "이곳" variants
// Target: 6-8 full name occurrences spread across intro(2-3), sections(2-3), conclusion(1-2)

for (const [venueId, info] of Object.entries(venueMap)) {
  let allMatches = getBlocks();
  const matchIdx = allMatches.findIndex(m => m[1] === venueId);
  if (matchIdx === -1) continue;

  const blockStart = allMatches[matchIdx].index;
  const blockEnd = matchIdx + 1 < allMatches.length
    ? allMatches[matchIdx + 1].index
    : content.indexOf('\nexport function', blockStart);
  let block = content.substring(blockStart, blockEnd);

  const shortEsc = escRe(info.short);
  const fullEsc = escRe(info.full);
  const fullName = info.full;

  // Count current full name occurrences in intro/body/conclusion
  const fullR = new RegExp(fullEsc, 'g');
  const shortR = new RegExp(shortEsc, 'g');

  function countInSection(regex, sectionType) {
    if (sectionType === 'intro') {
      const m = block.match(/(intro:\s*`)([^`]*?)(`)/);
      return m ? (m[2].match(regex) || []).length : 0;
    }
    if (sectionType === 'conclusion') {
      const m = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
      return m ? (m[2].match(regex) || []).length : 0;
    }
    if (sectionType === 'body') {
      const br = /(body:\s*`)([^`]*?)(`)/g;
      let total = 0, bm;
      while ((bm = br.exec(block)) !== null) total += (bm[2].match(regex) || []).length;
      return total;
    }
    return 0;
  }

  // Strategy: Replace short name with full name in intro, body, conclusion
  // Target distribution: intro=3, body=2, conclusion=2 = 7 total
  const TARGET = { intro: 3, body: 2, conclusion: 2 };

  // Process intro
  const introMatch = block.match(/(intro:\s*`)([^`]*?)(`)/);
  if (introMatch) {
    let iText = introMatch[2];
    // Replace short name with full name (first N occurrences)
    let replaced = 0;
    iText = iText.replace(new RegExp(shortEsc, 'g'), (match) => {
      if (replaced < TARGET.intro) {
        replaced++;
        return fullName;
      }
      return '이곳';
    });
    // Also replace "이곳은", "이곳의" etc. with full name for remaining quota
    if (replaced < TARGET.intro) {
      const need = TARGET.intro - replaced;
      let r2 = 0;
      iText = iText.replace(/이곳/g, (match) => {
        if (r2 < need) { r2++; replaced++; return fullName; }
        return match;
      });
    }
    block = block.replace(introMatch[0], introMatch[1] + iText + introMatch[3]);
  }

  // Process section bodies
  {
    const bodyRegex2 = /(body:\s*`)([^`]*?)(`)/g;
    let bm;
    let totalBodyReplaced = 0;
    const segments = [];
    let lastIdx = 0;

    // Reset regex
    while ((bm = bodyRegex2.exec(block)) !== null) {
      segments.push({ pre: block.substring(lastIdx, bm.index), prefix: bm[1], text: bm[2], suffix: bm[3] });
      lastIdx = bm.index + bm[0].length;
    }

    // Distribute body replacements across sections
    const perSection = segments.length > 0 ? Math.ceil(TARGET.body / segments.length) : 0;

    let newBlock = block.substring(0, segments.length > 0 ? segments[0].pre.length ? 0 : 0 : 0);
    let rebuiltFromSegments = false;

    if (segments.length > 0) {
      let builtParts = [];
      let segLastEnd = 0;

      // Re-process from original block
      const bodyRegex3 = /(body:\s*`)([^`]*?)(`)/g;
      let bm3;
      let segIdx = 0;

      let blockParts = [];
      let lastEnd = 0;

      while ((bm3 = bodyRegex3.exec(block)) !== null) {
        blockParts.push(block.substring(lastEnd, bm3.index + bm3[1].length));

        let bodyText = bm3[2];
        const allowed = Math.min(perSection, TARGET.body - totalBodyReplaced);

        if (allowed > 0) {
          let r = 0;
          bodyText = bodyText.replace(new RegExp(shortEsc, 'g'), (match) => {
            if (r < allowed) { r++; totalBodyReplaced++; return fullName; }
            return '이곳';
          });
          // If not enough short names, try replacing "이곳"
          if (r < allowed) {
            const need = allowed - r;
            let r2 = 0;
            bodyText = bodyText.replace(/이곳/g, (match) => {
              if (r2 < need) { r2++; totalBodyReplaced++; return fullName; }
              return match;
            });
          }
        } else {
          // Replace all remaining short names with "이곳"
          bodyText = bodyText.replace(new RegExp(shortEsc, 'g'), '이곳');
        }

        blockParts.push(bodyText);
        lastEnd = bm3.index + bm3[1].length + bm3[2].length;
        blockParts.push(block.substring(lastEnd, bm3.index + bm3[0].length));
        lastEnd = bm3.index + bm3[0].length;
        segIdx++;
      }

      if (blockParts.length > 0) {
        blockParts.push(block.substring(lastEnd));
        block = blockParts.join('');
      }
    }
  }

  // Process conclusion
  const concMatch = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
  if (concMatch) {
    let cText = concMatch[2];
    let replaced = 0;
    cText = cText.replace(new RegExp(shortEsc, 'g'), (match) => {
      if (replaced < TARGET.conclusion) { replaced++; return fullName; }
      return '이곳';
    });
    if (replaced < TARGET.conclusion) {
      const need = TARGET.conclusion - replaced;
      let r2 = 0;
      cText = cText.replace(/이곳/g, (match) => {
        if (r2 < need) { r2++; replaced++; return fullName; }
        return match;
      });
    }
    block = block.replace(concMatch[0], concMatch[1] + cText + concMatch[3]);
  }

  // Also replace short names in summary, faq, quickPlan with just "이곳" (not counted toward SEO)
  // Actually, keep short names in summary/faq as they are — they're fine for UX

  content = content.substring(0, blockStart) + block + content.substring(blockEnd);
}

// ===== VERIFICATION =====

console.log('\n========================================');
console.log('  가게이름 = "지역호빠 상호명" SEO 최적화');
console.log('========================================\n');

const finalMatches = getBlocks();

console.log('--- 가게이름 삽입 현황 (서론/본론/결론) ---\n');
console.log(`${'업소ID'.padEnd(25)} ${'가게이름'.padEnd(22)} 서론 본론 결론 합계 상태`);
console.log('-'.repeat(90));

for (let i = 0; i < finalMatches.length; i++) {
  const venueId = finalMatches[i][1];
  const info = venueMap[venueId];
  if (!info) continue;

  const blockStart = finalMatches[i].index;
  const blockEnd = i + 1 < finalMatches.length ? finalMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  const block = content.substring(blockStart, blockEnd);

  const fullEsc = escRe(info.full);
  const fullR = new RegExp(fullEsc, 'g');

  const im = block.match(/(intro:\s*`)([^`]*?)(`)/);
  const ic = im ? (im[2].match(fullR)||[]).length : 0;

  const br = /(body:\s*`)([^`]*?)(`)/g;
  let sc = 0, bm;
  while ((bm = br.exec(block)) !== null) sc += (bm[2].match(fullR)||[]).length;

  const cm = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
  const cc = cm ? (cm[2].match(fullR)||[]).length : 0;

  const t = ic + sc + cc;
  const st = t >= 6 && t <= 8 ? 'OK' : t < 6 ? 'LOW' : 'HIGH';
  console.log(`${venueId.padEnd(25)} ${info.full.padEnd(22)} ${String(ic).padStart(4)} ${String(sc).padStart(4)} ${String(cc).padStart(4)} ${String(t).padStart(4)}  ${st}`);
}

// Duplicate word check
console.log('\n--- 중복 단어 현황 ---\n');
console.log(`${'업소'.padEnd(25)} 5회 초과 중복단어`);
console.log('-'.repeat(80));

let totalE = 0;
for (let i = 0; i < finalMatches.length; i++) {
  const venueId = finalMatches[i][1];
  const info = venueMap[venueId];
  if (!info) continue;

  const blockStart = finalMatches[i].index;
  const blockEnd = i + 1 < finalMatches.length ? finalMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  const block = content.substring(blockStart, blockEnd);

  const allTexts = [];
  let m;
  const tl = /`([^`]*)`/g;
  while ((m = tl.exec(block)) !== null) allTexts.push(m[1]);
  const sl = /'([^']{10,})'/g;
  while ((m = sl.exec(block)) !== null) allTexts.push(m[1]);
  const allText = allTexts.join(' ');
  const words = allText.match(/[가-힣a-zA-Z]{3,}/g) || [];
  const freq = {};
  const skip = new Set([
    '입니다','합니다','있습니다','됩니다','습니다','에서','으로','에게','까지','부터',
    '하는','이며','하고','있는','없는','좋은','있고','없이','하면','같은','위해','대한',
    '통해','가능','수준','정도','이상','이하','확인','문의','가능합니다','추천합니다',
    '제공합니다','방문','전화','예약','가게','선수','서비스','분위기','시스템','호빠',
    '것입니다','않습니다','것이','수도','것은','때문에','하지만','그리고','또한','에서는',
    '에서의','경우가','정확한','아닙니다','기본','가장','포함','이런','어떤','이라는',
    '이곳은','이곳이','이곳의','이곳에','이곳을','이곳에서','이곳만의','이곳',
    '가능하며','방문하는','것이며','것이다','좋습니다','원합니다','바랍니다','없습니다',
    '드립니다','보세요','않으며','편입니다','있으며','원하는','운영되며','가능하고',
    '없으니','있으니','있어서','편하게','자유롭게','자연스럽게','편안하게','편안한',
    '자유로운','프라이빗','프리미엄','하이엔드','전용','독립된','분리된','별도의',
    '개별','참여형','체험형','경험형','연락으로','통화로','유선으로','알아보세요',
    '체크하세요','문의하세요','깨끗한','청결한','호스트가','호스트를','멤버를','매니저의',
    '사생활','보호가','호스트바를','무드를','감성을','고객에게','손님에게','바란다면',
    '희망하면','기대한다면','선호하면','일정을','캠퍼스','학교','선수가','선수를',
    '전화로','프라이버시가','경험을','시간을','실장의','가게가','분에게','확인하세요',
    '대학가','분위기를','원하면','호빠를','유일한','전국에서','상위급','독보적인',
    'body','VIP','intro','conclusion',
  ]);

  // Build name tokens to skip
  const nameWords = info.full.replace(/[()]/g, '').split(/\s+/);

  for (const w of words) {
    if (skip.has(w)) continue;
    if (nameWords.some(nw => w.includes(nw) || nw.includes(w))) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  const over = Object.entries(freq).filter(([w,c]) => c > 5).sort((a,b) => b[1]-a[1]);
  const ds = over.length === 0 ? 'OK' : over.map(([w,c]) => `${w}(${c})`).join(', ');
  console.log(`${venueId.padEnd(25)} ${ds}`);
  totalE += over.length;
}

console.log(`\n총 5회 초과: ${totalE}건`);
writeFileSync(FILE, content, 'utf-8');
console.log('파일 저장 완료\n');
