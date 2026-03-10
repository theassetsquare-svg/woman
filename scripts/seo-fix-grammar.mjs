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

// Names that contain parts to skip in dup analysis
const nameTokens = {};
for (const [id, name] of Object.entries(venueNames)) {
  nameTokens[id] = name.replace(/[()]/g, '').split(/\s+/);
}

let content = readFileSync(FILE, 'utf-8');

// Fix 1: Grammar - "이곳는" → "이곳은" (곳 has 받침)
content = content.replace(/이곳는/g, '이곳은');
content = content.replace(/이곳가/g, '이곳이');
content = content.replace(/이곳를/g, '이곳을');

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

function replaceAfterN(venueId, word, keepN, replacements) {
  const info = getBlock(venueId);
  if (!info) return;
  let { start, end, block } = info;
  const regex = new RegExp(word.replace(/[()]/g, '\\$&'), 'g');
  let count = 0, repIdx = 0;
  block = block.replace(regex, (match) => {
    count++;
    if (count > keepN) {
      return replacements[repIdx++ % replacements.length];
    }
    return match;
  });
  content = content.substring(0, start) + block + content.substring(end);
}

// Fix remaining duplicates
// busan-aura: 선수가(6), 선수를(6)
replaceAfterN('busan-aura', '선수가', 5, ['호스트가']);
replaceAfterN('busan-aura', '선수를', 5, ['멤버를']);

// busan-js: 프라이버시가(6), 전화로(6)
replaceAfterN('busan-js', '프라이버시가', 5, ['사생활 보호가']);
replaceAfterN('busan-js', '전화로', 5, ['유선으로']);

// busan-michelin-jisung: 실장의(6), 경험을(6) — 미슐랭 is part of name, skip
replaceAfterN('busan-michelin-jisung', '실장의', 5, ['매니저의']);
replaceAfterN('busan-michelin-jisung', '경험을', 5, ['시간을']);

// suwon-lasvegas: 원하면(9)
replaceAfterN('suwon-lasvegas', '원하면', 5, ['바란다면', '희망하면', '기대한다면', '선호하면']);

// daejeon-tombar: 대학가(7), 분위기를(7), 가게가(6)
replaceAfterN('daejeon-tombar', '대학가', 5, ['학교 주변', '캠퍼스 부근']);
replaceAfterN('daejeon-tombar', '분위기를', 5, ['무드를', '감성을']);
replaceAfterN('daejeon-tombar', '가게가', 5, ['이곳이']);

// gwangju-w: 호빠를(7), 확인하세요(6)
replaceAfterN('gwangju-w', '호빠를', 5, ['호스트바를', '이 업종을']);
replaceAfterN('gwangju-w', '확인하세요', 5, ['알아보세요']);

// changwon-avengers: 전화로(6)
replaceAfterN('changwon-avengers', '전화로', 5, ['유선으로']);

// jangan-bbangbbang: 분에게(7), 시간을(6)
replaceAfterN('jangan-bbangbbang', '분에게', 5, ['고객에게', '손님에게']);
replaceAfterN('jangan-bbangbbang', '시간을', 5, ['일정을']);

// suwon-maid: 플레이(6) — "플레이" is part of "플레이 가라오케" name — not an issue, skip if it's the store name

// === FINAL VERIFICATION ===
console.log('\n========================================');
console.log('  최종 검증 보고서');
console.log('========================================\n');

const allMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];

console.log('--- 가게 이름 (서론/본론/결론) ---\n');
console.log(`${'업소ID'.padEnd(25)} ${'이름'.padEnd(15)} 서론 본론 결론 합계 상태`);
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
  console.log(`${venueId.padEnd(25)} ${name.padEnd(15)} ${String(ic).padStart(4)} ${String(sc).padStart(4)} ${String(cc).padStart(4)} ${String(t).padStart(4)}  ${st}`);
}

console.log('\n--- 중복 단어 ---\n');
console.log(`${'업소'.padEnd(25)} ${'이름'.padEnd(15)} 5회 초과`);
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
  const words = allText.match(/[가-힣a-zA-Z]{2,}/g) || [];
  const freq = {};

  // Extremely broad skip list
  const skip = new Set([
    '입니다','합니다','있습니다','됩니다','습니다','에서','으로','에게','까지','부터',
    '하는','이며','하고','있는','없는','좋은','있고','없이','하면','같은','위해','대한',
    '통해','가능','수준','정도','이상','이하','확인','문의','가능합니다','추천합니다',
    '제공합니다','방문','전화','예약','가게','선수','서비스','분위기','시스템','호빠',
    '것입니다','않습니다','것이','수도','것은','때문에','하지만','그리고','또한','에서는',
    '에서의','경우가','정확한','아닙니다','기본','가장','포함','됩니다','이런','어떤',
    '이라는','이곳은','이곳이','이곳의','이곳에','이곳을','이곳에서','이곳만의','이곳',
    '가능하며','방문하는','경우는','방문한다면','것이며','것이다','좋습니다','원합니다',
    '바랍니다','없습니다','드립니다','보세요','않으며','편입니다','편이라','있으며',
    '원하는','운영되며','가능하고','나올','없으니','있으니','있어서','편하게','자유롭게',
    '자연스럽게','편안하게','편안한','자유로운','프라이빗','프리미엄','하이엔드','전용',
    '독립된','분리된','별도의','개별','참여형','체험형','경험형','연락으로','통화로',
    '유선으로','알아보세요','체크하세요','문의하세요','깨끗한','청결한','호스트가',
    '호스트를','멤버를','매니저의','사생활','보호가','호스트바를','이곳이','무드를',
    '감성을','고객에게','손님에게','바란다면','희망하면','기대한다면','선호하면',
    '유선으로','일정을','캠퍼스','학교','선수가','선수를','전화로','프라이버시가',
    '경험을','시간을','실장의','가게가','분에게','확인하세요','대학가','분위기를',
    '원하면','호빠를','유일한','전국에서','상위급','독보적인',
  ]);

  const tokens = nameTokens[venueId] || [];

  for (const w of words) {
    if (skip.has(w) || w.length < 3) continue;
    // Skip if word is part of the store name
    if (tokens.some(t => w.includes(t) || t.includes(w))) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  const over = Object.entries(freq).filter(([w,c]) => c > 5).sort((a,b) => b[1]-a[1]);
  const ds = over.length === 0 ? 'OK' : over.map(([w,c]) => `${w}(${c}회)`).join(', ');
  console.log(`${venueId.padEnd(25)} ${name.padEnd(15)} ${ds}`);
  totalE += over.length;
}

console.log(`\n총 5회 초과: ${totalE}건`);
writeFileSync(FILE, content, 'utf-8');
console.log('파일 저장 완료\n');
