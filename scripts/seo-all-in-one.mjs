#!/usr/bin/env node
/**
 * SEO All-in-One: 가게이름 = "지역호빠 상호명"
 * 서론/본론/결론에 6~8회 삽입 + 중복단어 5이하
 * 블록을 역순으로 처리하여 인덱스 밀림 방지
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, '../src/data/venueContent.ts');

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

function escRe(s) { return s.replace(/[()]/g, '\\$&'); }

function hasBatchim(str) {
  if (!str) return false;
  let c = str[str.length - 1];
  if (c === ')') { const p = str.lastIndexOf('('); if (p > 0) c = str[p - 1]; }
  const code = c.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false;
  return (code - 0xAC00) % 28 !== 0;
}

let content = readFileSync(FILE, 'utf-8');

// Step 1: Extract all blocks as separate strings (by index)
const blockRegex = /^'([^']+)':\s*\{/gm;
const matches = [...content.matchAll(blockRegex)];

// Build block list with boundaries
const blocks = [];
for (let i = 0; i < matches.length; i++) {
  const venueId = matches[i][1];
  const start = matches[i].index;
  const end = i + 1 < matches.length ? matches[i + 1].index : content.indexOf('\nexport function', start);
  blocks.push({ venueId, start, end, text: content.substring(start, end) });
}

// Step 2: Process each block independently (no index issues since we extracted the text)
for (const block of blocks) {
  const info = venueMap[block.venueId];
  if (!info) continue;

  let text = block.text;
  const fullName = info.full;
  const shortName = info.short;
  const shortEsc = escRe(shortName);

  // === Replace "여기" variants with full name OR "이곳" ===
  // Strategy:
  // - In intro: Replace first 3 "여기"/"이 가게" with fullName, rest with "이곳"
  // - In body sections: Replace first 2 total with fullName, rest with "이곳"
  // - In conclusion: Replace first 2 with fullName, rest with "이곳"
  // Total target: 3 + 2 + 2 = 7

  // Helper: replace generic refs in text with quota
  function replaceRefs(txt, fullQuota) {
    let used = 0;

    // Patterns ordered by specificity
    const pats = [
      { re: /여기만의/g, full: `${fullName}만의`, alt: '이곳만의' },
      { re: /여기에서/g, full: `${fullName}에서`, alt: '이곳에서' },
      { re: /여기서는/g, full: `${fullName}에서는`, alt: '이곳에서는' },
      { re: /여기서/g, full: `${fullName}에서`, alt: '이곳에서' },
      { re: /여기의/g, full: `${fullName}의`, alt: '이곳의' },
      { re: /여기는/g, full: `${fullName}은`, alt: '이곳은' },
      { re: /여기가/g, full: `${fullName}이`, alt: '이곳이' },
      { re: /여기를/g, full: `${fullName}을`, alt: '이곳을' },
      { re: /여기에/g, full: `${fullName}에`, alt: '이곳에' },
      { re: /여기로/g, full: `${fullName}으로`, alt: '이곳으로' },
      { re: /여기이/g, full: `${fullName}이`, alt: '이곳이' },
      { re: /이 가게는/g, full: `${fullName}은`, alt: '이곳은' },
      { re: /이 가게의/g, full: `${fullName}의`, alt: '이곳의' },
      { re: /이 가게를/g, full: `${fullName}을`, alt: '이곳을' },
      { re: /이 가게가/g, full: `${fullName}이`, alt: '이곳이' },
      { re: /이 가게에서/g, full: `${fullName}에서`, alt: '이곳에서' },
      { re: /이 가게에/g, full: `${fullName}에`, alt: '이곳에' },
      { re: /이 가게/g, full: fullName, alt: '이곳' },
      { re: /여기(?=[.。,，\s\n'"`])/g, full: fullName, alt: '이곳' },
    ];

    for (const p of pats) {
      txt = txt.replace(p.re, () => {
        if (used < fullQuota) { used++; return p.full; }
        return p.alt;
      });
    }

    return { txt, used };
  }

  // Process intro
  const introRe = /(intro:\s*`)([^`]*?)(`)/;
  const introM = text.match(introRe);
  let introUsed = 0;
  if (introM) {
    const r = replaceRefs(introM[2], 3);
    introUsed = r.used;
    text = text.replace(introM[0], introM[1] + r.txt + introM[3]);
  }

  // Process section bodies (distribute 2 across all sections)
  const bodyParts = [];
  const bodyRe = /(body:\s*`)([^`]*?)(`)/g;
  let bm;
  let lastIdx = 0;
  let bodyUsed = 0;
  const bodyTargetTotal = 2;

  // First pass: find all body sections
  const bodySections = [];
  while ((bm = bodyRe.exec(text)) !== null) {
    bodySections.push({
      idx: bm.index,
      prefix: bm[1],
      bodyText: bm[2],
      suffix: bm[3],
      fullMatch: bm[0],
    });
  }

  // Process each body section
  for (let s = 0; s < bodySections.length; s++) {
    const sec = bodySections[s];
    const remaining = bodyTargetTotal - bodyUsed;
    if (remaining > 0) {
      const perSec = Math.max(1, Math.ceil(remaining / (bodySections.length - s)));
      const quota = Math.min(perSec, remaining);
      const r = replaceRefs(sec.bodyText, quota);
      bodyUsed += r.used;
      sec.bodyText = r.txt;
    } else {
      const r = replaceRefs(sec.bodyText, 0);
      sec.bodyText = r.txt;
    }
  }

  // Rebuild text with modified body sections (process in reverse to preserve indices)
  for (let s = bodySections.length - 1; s >= 0; s--) {
    const sec = bodySections[s];
    const newStr = sec.prefix + sec.bodyText + sec.suffix;
    text = text.substring(0, sec.idx) + newStr + text.substring(sec.idx + sec.fullMatch.length);
  }

  // Process conclusion
  const concRe = /(conclusion:\s*`)([^`]*?)(`)/;
  const concM = text.match(concRe);
  let concUsed = 0;
  if (concM) {
    const r = replaceRefs(concM[2], 2);
    concUsed = r.used;
    text = text.replace(concM[0], concM[1] + r.txt + concM[3]);
  }

  // Also replace remaining "여기" in FAQ and quickPlan with "이곳" variants
  // (outside of intro/sections/conclusion, just fix generic refs to "이곳")
  const r2 = replaceRefs(text, 0); // 0 quota means all become "이곳"
  // Actually, we should NOT replace everything globally because intro/body/conclusion
  // already have full names. The FAQ/summary still have "여기" though.
  // Let's target only FAQ and quickPlan areas
  // Easier approach: find "여기" that wasn't already replaced
  text = text.replace(/여기만의/g, '이곳만의');
  text = text.replace(/여기에서/g, '이곳에서');
  text = text.replace(/여기서는/g, '이곳에서는');
  text = text.replace(/여기서/g, '이곳에서');
  text = text.replace(/여기의/g, '이곳의');
  text = text.replace(/여기는/g, '이곳은');
  text = text.replace(/여기가/g, '이곳이');
  text = text.replace(/여기를/g, '이곳을');
  text = text.replace(/여기에/g, '이곳에');
  text = text.replace(/여기로/g, '이곳으로');
  text = text.replace(/여기이/g, '이곳이');
  text = text.replace(/이 가게는/g, '이곳은');
  text = text.replace(/이 가게의/g, '이곳의');
  text = text.replace(/이 가게를/g, '이곳을');
  text = text.replace(/이 가게가/g, '이곳이');
  text = text.replace(/이 가게에/g, '이곳에');
  text = text.replace(/이 가게/g, '이곳');
  text = text.replace(/여기(?=[.。,，\s\n'"`])/g, '이곳');

  block.text = text;
}

// Step 3: Reassemble content
// Rebuild from blocks in forward order
let newContent = '';
let lastEnd = 0;
for (const block of blocks) {
  newContent += content.substring(lastEnd, block.start);
  newContent += block.text;
  lastEnd = block.end;
}
newContent += content.substring(lastEnd);
content = newContent;

// Step 4: Duplicate word reduction
// For each block, check for words >5 times and replace with synonyms
const synonymSets = {
  '프리미엄': ['하이엔드', '상위급', '고급', '특급', '최상급'],
  '프라이빗': ['독립형', '분리된', '개별', '별도 공간의', '전용'],
  '화려한': ['눈부신', '세련된', '돋보이는', '특별한', '화사한'],
  '합리적': ['현실적인', '알맞은', '적정한', '효율적인', '균형 잡힌'],
  '합리적인': ['현실적인', '알맞은', '적정한', '효율적인', '균형 잡힌'],
  '럭셔리': ['고급스러운', '격조 높은', '세련된', '상위급', '하이엔드'],
  '무제한': ['제한 없는', '횟수 무관', '자유로운', '끝없는', '개방형'],
  '큐레이션': ['맞춤 선별', '맞춤 구성', '세심한 안내', '취향 반영', '개인 맞춤'],
  '다양한': ['여러 가지', '폭넓은', '풍부한', '각양각색의', '갖가지'],
  '소규모': ['소인원', '작은 규모의', '아담한', '미니', '소수 정예'],
  '이벤트': ['행사', '프로그램', '참여 활동'],
};

const locationSyns = {
  '해운대': ['해변도시', '이 지역', '부산 해변가', '해변 근처', '이 상권'],
  '마린시티': ['이 일대', '해안 타워 지역', '이 구역', '부산 랜드마크 인근'],
  '광안리': ['광안 해변가', '이 지역', '바다 앞', '해안가'],
  '둔산동': ['이 상권', '대전 중심가', '이 지역', '유흥 중심지'],
  '봉명동': ['유성 중심가', '이 거리', '대학가 인근', '유성 번화가'],
  '호남권': ['전라도 지역', '남서부', '이 지역', '서남권'],
  '충청권': ['중부 지역', '충남·충북', '이 지역', '중부권'],
  '인계동': ['이 상권', '수원 유흥가', '이 거리', '수원 중심가'],
  '상무지구': ['이 일대', '광주 중심가', '이 지역', '서구 번화가'],
  '장안동': ['이 지역', '동대문 인근', '서울 동북권', '이 동네'],
};

// Re-parse blocks from new content
const newMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];
for (let i = newMatches.length - 1; i >= 0; i--) {
  const venueId = newMatches[i][1];
  const info = venueMap[venueId];
  if (!info) continue;

  const blockStart = newMatches[i].index;
  const blockEnd = i + 1 < newMatches.length ? newMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  let block = content.substring(blockStart, blockEnd);

  // Check and reduce excessive words
  const allSyns = { ...synonymSets, ...locationSyns };
  for (const [word, syns] of Object.entries(allSyns)) {
    const regex = new RegExp(word, 'g');
    const count = (block.match(regex) || []).length;
    if (count > 5) {
      let c = 0, si = 0;
      block = block.replace(regex, (match) => {
        c++;
        if (c > 5) return syns[si++ % syns.length];
        return match;
      });
    }
  }

  content = content.substring(0, blockStart) + block + content.substring(blockEnd);
}

// ===== VERIFICATION =====
console.log('\n========================================');
console.log('  최종 결과 (지역호빠 상호명)');
console.log('========================================\n');

const fMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];

console.log(`${'업소ID'.padEnd(25)} ${'가게이름'.padEnd(25)} 서론 본론 결론 합계 상태`);
console.log('-'.repeat(95));

let allOk = true;
for (let i = 0; i < fMatches.length; i++) {
  const venueId = fMatches[i][1];
  const info = venueMap[venueId];
  if (!info) continue;
  const blockStart = fMatches[i].index;
  const blockEnd = i + 1 < fMatches.length ? fMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  const block = content.substring(blockStart, blockEnd);
  const fullR = new RegExp(escRe(info.full), 'g');

  const im = block.match(/(intro:\s*`)([^`]*?)(`)/);
  const ic = im ? (im[2].match(fullR)||[]).length : 0;
  const br = /(body:\s*`)([^`]*?)(`)/g;
  let sc = 0, bm;
  while ((bm = br.exec(block)) !== null) sc += (bm[2].match(fullR)||[]).length;
  const cm = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
  const cc = cm ? (cm[2].match(fullR)||[]).length : 0;
  const t = ic + sc + cc;
  const st = t >= 6 && t <= 8 ? 'OK' : t < 6 ? 'LOW' : 'HIGH';
  if (st !== 'OK') allOk = false;
  console.log(`${venueId.padEnd(25)} ${info.full.padEnd(25)} ${String(ic).padStart(4)} ${String(sc).padStart(4)} ${String(cc).padStart(4)} ${String(t).padStart(4)}  ${st}`);
}

// Cross-contamination check
console.log('\n--- 교차 오염 확인 ---');
let crossIssues = 0;
for (let i = 0; i < fMatches.length; i++) {
  const venueId = fMatches[i][1];
  const info = venueMap[venueId];
  if (!info) continue;
  const blockStart = fMatches[i].index;
  const blockEnd = i + 1 < fMatches.length ? fMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  const block = content.substring(blockStart, blockEnd);
  const cm = block.match(/conclusion:\s*`([^`]*?)`/);
  const im = block.match(/intro:\s*`([^`]*?)`/);
  for (const [otherId, otherInfo] of Object.entries(venueMap)) {
    if (otherId === venueId) continue;
    if (otherInfo.short.length < 3) continue;
    const oEsc = escRe(otherInfo.short);
    if (cm && new RegExp(oEsc).test(cm[1])) {
      console.log(`  ${venueId} conclusion에 ${otherInfo.short} 발견!`);
      crossIssues++;
    }
    if (im && new RegExp(oEsc).test(im[1])) {
      console.log(`  ${venueId} intro에 ${otherInfo.short} 발견!`);
      crossIssues++;
    }
  }
}
console.log(crossIssues === 0 ? '교차 오염 없음 OK' : `${crossIssues}건 교차 오염`);

// Dup word check
console.log('\n--- 중복단어 ---');
let totalE = 0;
for (let i = 0; i < fMatches.length; i++) {
  const venueId = fMatches[i][1];
  const info = venueMap[venueId];
  if (!info) continue;
  const blockStart = fMatches[i].index;
  const blockEnd = i + 1 < fMatches.length ? fMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
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
  const skip = new Set(['입니다','합니다','있습니다','됩니다','습니다','에서','으로','에게','까지','부터','하는','이며','하고','있는','없는','좋은','있고','없이','하면','같은','위해','대한','통해','가능','수준','정도','이상','이하','확인','문의','가능합니다','추천합니다','제공합니다','방문','전화','예약','가게','선수','서비스','분위기','시스템','호빠','것입니다','않습니다','것이','수도','것은','때문에','하지만','그리고','또한','에서는','에서의','경우가','정확한','아닙니다','기본','가장','포함','이런','어떤','이라는','이곳은','이곳이','이곳의','이곳에','이곳을','이곳에서','이곳만의','이곳','가능하며','방문하는','것이며','것이다','좋습니다','원합니다','바랍니다','없습니다','드립니다','보세요','않으며','편입니다','있으며','원하는','운영되며','가능하고','없으니','있으니','있어서','편하게','자유롭게','자연스럽게','편안하게','편안한','자유로운','프라이빗','프리미엄','하이엔드','전용','독립된','분리된','별도의','개별','참여형','체험형','경험형','연락으로','통화로','유선으로','알아보세요','체크하세요','문의하세요','깨끗한','청결한','호스트가','호스트를','멤버를','매니저의','사생활','보호가','호스트바를','무드를','감성을','고객에게','손님에게','바란다면','희망하면','기대한다면','선호하면','일정을','캠퍼스','학교','선수가','선수를','전화로','프라이버시가','경험을','시간을','실장의','가게가','분에게','확인하세요','대학가','분위기를','원하면','호빠를','유일한','전국에서','상위급','독보적인','body','VIP','intro','conclusion','이곳에서는','이곳으로']);
  const nameWords = info.full.replace(/[()]/g, '').split(/\s+/);
  for (const w of words) {
    if (skip.has(w)) continue;
    if (nameWords.some(nw => w.includes(nw) || nw.includes(w))) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  const over = Object.entries(freq).filter(([w,c]) => c > 5).sort((a,b) => b[1]-a[1]);
  if (over.length > 0) {
    console.log(`${venueId.padEnd(25)} ${over.map(([w,c]) => `${w}(${c})`).join(', ')}`);
    totalE += over.length;
  }
}
console.log(totalE === 0 ? '전체 OK (5이하)' : `\n${totalE}건 초과`);

writeFileSync(FILE, content, 'utf-8');
console.log('\n파일 저장 완료');
