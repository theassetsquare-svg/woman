#!/usr/bin/env node
/**
 * SEO v2: 상호명 → "지역호빠 상호명" 변환 + "여기" → "이곳" 변환
 * 서론/본론/결론에 풀네임 6~8회 / 중복단어 5이하
 * 블록별 독립 처리 (인덱스 밀림 방지)
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, '../src/data/venueContent.ts');

const venueMap = {
  'gangnam-boston': { short: '보스턴', full: '강남호빠 보스턴' },
  'gangnam-i': { short: '아이(I)', full: '강남호빠 아이(I)' },
  'gangnam-flirting': { short: '플러팅진혁', full: '강남호빠 플러팅진혁' },
  'gangnam-blackhole': { short: '블랙홀', full: '강남호빠 블랙홀' },
  'geondae-wclub': { short: 'W클럽', full: '건대호빠 W클럽' },
  'jangan-bini': { short: '빈이', full: '장안동호빠 빈이' },
  'jangan-cube': { short: '큐브', full: '장안동호빠 큐브' },
  'jangan-bbangbbang': { short: '빵빵', full: '장안동호빠 빵빵' },
  'busan-michelin': { short: '미슐랭', full: '해운대호빠 미슐랭' },
  'busan-q': { short: '큐(Q)', full: '해운대호빠 큐(Q)' },
  'busan-david': { short: '다비드바', full: '해운대호빠 다비드바' },
  'busan-aura': { short: '아우라', full: '부산호빠 아우라' },
  'busan-menz': { short: '맨즈', full: '부산호빠 맨즈' },
  'busan-w': { short: '더블유(W)', full: '부산호빠 더블유(W)' },
  'busan-theking': { short: '더킹', full: '부산호빠 더킹' },
  'busan-js': { short: '제이에스', full: '부산호빠 제이에스' },
  'busan-michelin-jisung': { short: '미슐랭(지성)', full: '해운대호빠 미슐랭(지성)' },
  'suwon-beast': { short: '비스트', full: '수원호빠 비스트' },
  'suwon-maid': { short: '메이드', full: '수원호빠 메이드' },
  'suwon-play': { short: '플레이 가라오케', full: '수원호빠 플레이 가라오케' },
  'suwon-lasvegas': { short: '라스베가스', full: '수원호빠 라스베가스' },
  'daejeon-eclipse': { short: '이클립스', full: '대전호빠 이클립스' },
  'daejeon-tombar': { short: '톰바', full: '대전호빠 톰바' },
  'gwangju-w': { short: 'W', full: '광주호빠 W' },
  'changwon-avengers': { short: '어벤져스', full: '창원호빠 어벤져스' },
};

function escRe(s) { return s.replace(/[()]/g, '\\$&'); }

let content = readFileSync(FILE, 'utf-8');

// Extract blocks independently
const blockRegex = /^'([^']+)':\s*\{/gm;
const matches = [...content.matchAll(blockRegex)];
const blocks = [];
for (let i = 0; i < matches.length; i++) {
  const venueId = matches[i][1];
  const start = matches[i].index;
  const end = i + 1 < matches.length ? matches[i + 1].index : content.indexOf('\nexport function', start);
  blocks.push({ venueId, start, end, text: content.substring(start, end) });
}

for (const block of blocks) {
  const info = venueMap[block.venueId];
  if (!info) continue;

  let text = block.text;
  const fullName = info.full;
  const shortEsc = escRe(info.short);

  // =================================================
  // Process a section of text:
  //   - Replace short name + "여기"/"이 가게" with fullName (up to quota)
  //   - Remaining short name / "여기" → "이곳" variants
  // =================================================
  function processSection(txt, quota) {
    let used = 0;

    // Phase 1: Replace short name occurrences with full name (up to quota)
    // Handle: "보스턴은", "보스턴의", "보스턴에서" etc.
    const shortPatterns = [
      { re: new RegExp(`${shortEsc}(?=은|는)`, 'g'), full: fullName, alt: '이곳' },
      { re: new RegExp(`${shortEsc}(?=의)`, 'g'), full: fullName, alt: '이곳' },
      { re: new RegExp(`${shortEsc}(?=이|가)`, 'g'), full: fullName, alt: '이곳' },
      { re: new RegExp(`${shortEsc}(?=을|를)`, 'g'), full: fullName, alt: '이곳' },
      { re: new RegExp(`${shortEsc}(?=에서)`, 'g'), full: fullName, alt: '이곳' },
      { re: new RegExp(`${shortEsc}(?=에)`, 'g'), full: fullName, alt: '이곳' },
      { re: new RegExp(`${shortEsc}(?=만의)`, 'g'), full: fullName, alt: '이곳' },
      { re: new RegExp(`${shortEsc}(?=[.。,，\\s\\n'"\`])`, 'g'), full: fullName, alt: '이곳' },
      { re: new RegExp(shortEsc, 'g'), full: fullName, alt: '이곳' },
    ];

    for (const p of shortPatterns) {
      txt = txt.replace(p.re, (match) => {
        if (used < quota) { used++; return p.full; }
        return p.alt;
      });
    }

    // Phase 2: Replace "여기" variants with full name or "이곳"
    const yeogiPatterns = [
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
      { re: /이 가게에/g, full: `${fullName}에`, alt: '이곳에' },
      { re: /이 가게/g, full: fullName, alt: '이곳' },
      { re: /여기(?=[.。,，\s\n'"`])/g, full: fullName, alt: '이곳' },
    ];

    for (const p of yeogiPatterns) {
      txt = txt.replace(p.re, (match) => {
        if (used < quota) { used++; return p.full; }
        return p.alt;
      });
    }

    return { txt, used };
  }

  // --- Process intro (quota: 3) ---
  const introRe = /(intro:\s*`)([^`]*?)(`)/;
  const introM = text.match(introRe);
  if (introM) {
    const r = processSection(introM[2], 3);
    text = text.substring(0, text.indexOf(introM[0])) + introM[1] + r.txt + introM[3] + text.substring(text.indexOf(introM[0]) + introM[0].length);
  }

  // --- Process section bodies (total quota: 2, distribute) ---
  {
    const bodyRe = /(body:\s*`)([^`]*?)(`)/g;
    const bodySections = [];
    let bm;
    while ((bm = bodyRe.exec(text)) !== null) {
      bodySections.push({ idx: bm.index, prefix: bm[1], body: bm[2], suffix: bm[3], len: bm[0].length });
    }

    let bodyQuotaLeft = 2;
    for (let s = 0; s < bodySections.length; s++) {
      const perSec = Math.max(1, Math.ceil(bodyQuotaLeft / (bodySections.length - s)));
      const quota = Math.min(perSec, bodyQuotaLeft);
      const r = processSection(bodySections[s].body, quota);
      bodyQuotaLeft -= r.used;
      bodySections[s].body = r.txt;
    }

    // Rebuild: reverse order to preserve indices
    for (let s = bodySections.length - 1; s >= 0; s--) {
      const sec = bodySections[s];
      const newStr = sec.prefix + sec.body + sec.suffix;
      text = text.substring(0, sec.idx) + newStr + text.substring(sec.idx + sec.len);
    }
  }

  // --- Process conclusion (quota: 2) ---
  const concRe = /(conclusion:\s*`)([^`]*?)(`)/;
  const concM = text.match(concRe);
  if (concM) {
    const r = processSection(concM[2], 2);
    const ci = text.indexOf(concM[0]);
    text = text.substring(0, ci) + concM[1] + r.txt + concM[3] + text.substring(ci + concM[0].length);
  }

  // --- Clean up remaining "여기" in FAQ/quickPlan → "이곳" ---
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

// Reassemble
let newContent = '';
let lastEnd = 0;
for (const block of blocks) {
  newContent += content.substring(lastEnd, block.start);
  newContent += block.text;
  lastEnd = block.end;
}
newContent += content.substring(lastEnd);
content = newContent;

// Duplicate word reduction
const synonymSets = {
  '프리미엄': ['하이엔드', '상위급', '고급', '특급', '최상급'],
  '화려한': ['눈부신', '세련된', '돋보이는', '특별한'],
  '럭셔리': ['고급스러운', '격조 높은', '세련된', '상위급'],
  '무제한': ['제한 없는', '횟수 무관', '자유로운', '끝없는'],
  '다양한': ['여러 가지', '폭넓은', '풍부한', '각양각색의'],
  '해운대': ['해변도시', '이 지역', '부산 해변가', '해변 근처'],
  '마린시티': ['이 일대', '해안 타워 지역', '이 구역'],
  '둔산동': ['이 상권', '대전 중심가', '이 지역'],
  '봉명동': ['유성 중심가', '이 거리', '대학가 인근'],
  '인계동': ['이 상권', '수원 유흥가', '이 거리'],
  '호남권': ['전라도 지역', '남서부', '이 지역'],
  '충청권': ['중부 지역', '충남·충북', '이 지역'],
  '이벤트': ['행사', '프로그램', '참여 활동'],
  '프라이빗': ['독립형', '분리된', '개별', '전용'],
  '있나요': ['되나요', '가능한가요', '해당하나요'],
  '서비스를': ['응대를', '케어를', '서비스 품질을'],
  '시스템은': ['운영 방식은', '체계는', '구조는'],
  '대전에서': ['이 도시에서', '중부권에서', '이 지역에서'],
};

const newMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];
for (let i = newMatches.length - 1; i >= 0; i--) {
  const venueId = newMatches[i][1];
  if (!venueMap[venueId]) continue;
  const blockStart = newMatches[i].index;
  const blockEnd = i + 1 < newMatches.length ? newMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  let block = content.substring(blockStart, blockEnd);

  for (const [word, syns] of Object.entries(synonymSets)) {
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

// ===== FINAL VERIFICATION =====
console.log('\n=== 최종 결과 ===\n');

const fMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];
console.log(`${'업소'.padEnd(25)} ${'가게이름'.padEnd(25)} 서론 본론 결론 합계 상태`);
console.log('-'.repeat(95));

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
  const st = t >= 6 && t <= 8 ? 'OK' : t < 6 ? `LOW(${t})` : `HIGH(${t})`;
  console.log(`${venueId.padEnd(25)} ${info.full.padEnd(25)} ${String(ic).padStart(4)} ${String(sc).padStart(4)} ${String(cc).padStart(4)} ${String(t).padStart(4)}  ${st}`);
}

// Cross-contamination check
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
    // Skip if the other name is a substring of our name (e.g. 미슐랭 in 미슐랭(지성))
    if (info.short.includes(otherInfo.short)) continue;
    if (cm && new RegExp(escRe(otherInfo.short)).test(cm[1])) {
      console.log(`CROSS: ${venueId} conclusion에 ${otherInfo.short}`);
      crossIssues++;
    }
  }
}
console.log(crossIssues === 0 ? '\n교차 오염: 없음' : `\n교차 오염: ${crossIssues}건`);

// Dup check
let totalE = 0;
const fMatches2 = [...content.matchAll(/^'([^']+)':\s*\{/gm)];
for (let i = 0; i < fMatches2.length; i++) {
  const venueId = fMatches2[i][1];
  const info = venueMap[venueId];
  if (!info) continue;
  const blockStart = fMatches2[i].index;
  const blockEnd = i + 1 < fMatches2.length ? fMatches2[i + 1].index : content.indexOf('\nexport function', blockStart);
  const block = content.substring(blockStart, blockEnd);
  const allTexts = [];
  let m;
  const tl = /`([^`]*)`/g;
  while ((m = tl.exec(block)) !== null) allTexts.push(m[1]);
  const sl = /'([^']{10,})'/g;
  while ((m = sl.exec(block)) !== null) allTexts.push(m[1]);
  const words = allTexts.join(' ').match(/[가-힣a-zA-Z]{3,}/g) || [];
  const freq = {};
  const skip = new Set(['입니다','합니다','있습니다','됩니다','습니다','에서','으로','에게','까지','부터','하는','이며','하고','있는','없는','좋은','있고','없이','하면','같은','위해','대한','통해','가능','수준','정도','이상','이하','확인','문의','가능합니다','추천합니다','제공합니다','방문','전화','예약','가게','선수','서비스','분위기','시스템','호빠','것입니다','않습니다','것이','수도','것은','때문에','하지만','그리고','또한','에서는','에서의','경우가','정확한','아닙니다','기본','가장','포함','이런','어떤','이라는','이곳은','이곳이','이곳의','이곳에','이곳을','이곳에서','이곳만의','이곳','가능하며','방문하는','것이며','것이다','좋습니다','원합니다','바랍니다','없습니다','드립니다','보세요','않으며','편입니다','있으며','원하는','운영되며','가능하고','없으니','있으니','있어서','편하게','자유롭게','자연스럽게','편안하게','편안한','자유로운','프라이빗','하이엔드','전용','독립된','분리된','별도의','개별','참여형','체험형','연락으로','통화로','유선으로','알아보세요','문의하세요','깨끗한','청결한','호스트가','호스트를','매니저의','호스트바를','무드를','감성을','고객에게','손님에게','바란다면','선수가','선수를','전화로','경험을','시간을','실장의','분에게','확인하세요','분위기를','호빠를','유일한','상위급','독보적인','body','VIP','이곳에서는','이곳으로','프리미엄','응대를','케어를']);
  const nameWords = info.full.replace(/[()]/g, '').split(/\s+/);
  for (const w of words) {
    if (skip.has(w)) continue;
    if (nameWords.some(nw => w.includes(nw) || nw.includes(w))) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  const over = Object.entries(freq).filter(([w,c]) => c > 5).sort((a,b) => b[1]-a[1]);
  if (over.length > 0) {
    console.log(`DUP: ${venueId} → ${over.map(([w,c]) => `${w}(${c})`).join(', ')}`);
    totalE += over.length;
  }
}
console.log(totalE === 0 ? '중복단어: 전체 OK' : `중복단어: ${totalE}건 초과`);

writeFileSync(FILE, content, 'utf-8');
console.log('\n저장 완료');
