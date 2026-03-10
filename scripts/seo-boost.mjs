#!/usr/bin/env node
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

function getBlocks() { return [...content.matchAll(/^'([^']+)':\s*\{/gm)]; }

// For LOW venues, replace "이곳" in conclusion with full name
const lowVenues = [
  'busan-menz', 'busan-w', 'busan-theking', 'busan-js',
  'busan-michelin-jisung', 'suwon-maid', 'suwon-play',
  'suwon-lasvegas', 'daejeon-eclipse', 'daejeon-tombar',
  'changwon-avengers',
];

for (const venueId of lowVenues) {
  const info = venueMap[venueId];
  const allMatches = getBlocks();
  const idx = allMatches.findIndex(m => m[1] === venueId);
  if (idx === -1) continue;

  const blockStart = allMatches[idx].index;
  const blockEnd = idx + 1 < allMatches.length
    ? allMatches[idx + 1].index
    : content.indexOf('\nexport function', blockStart);
  let block = content.substring(blockStart, blockEnd);

  // Replace first "이곳" in conclusion with full name
  const concMatch = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
  if (concMatch) {
    let cText = concMatch[2];
    let replaced = false;
    cText = cText.replace(/이곳/, () => {
      if (!replaced) { replaced = true; return info.full; }
      return '이곳';
    });
    block = block.replace(concMatch[0], concMatch[1] + cText + concMatch[3]);
  }

  content = content.substring(0, blockStart) + block + content.substring(blockEnd);
}

// Also fix suwon-maid "플레이" false positive — it's part of "플레이 가라오케" name, just add to skip

// ===== FINAL VERIFICATION =====
console.log('\n========================================');
console.log('  최종 결과');
console.log('========================================\n');

const fm = getBlocks();
console.log(`${'업소ID'.padEnd(25)} ${'가게이름'.padEnd(25)} 서론 본론 결론 합계 상태`);
console.log('-'.repeat(95));

for (let i = 0; i < fm.length; i++) {
  const venueId = fm[i][1];
  const info = venueMap[venueId];
  if (!info) continue;
  const blockStart = fm[i].index;
  const blockEnd = i + 1 < fm.length ? fm[i + 1].index : content.indexOf('\nexport function', blockStart);
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
  console.log(`${venueId.padEnd(25)} ${info.full.padEnd(25)} ${String(ic).padStart(4)} ${String(sc).padStart(4)} ${String(cc).padStart(4)} ${String(t).padStart(4)}  ${st}`);
}

// Dup check
console.log('\n--- 중복단어 ---');
let totalE = 0;
for (let i = 0; i < fm.length; i++) {
  const venueId = fm[i][1];
  const info = venueMap[venueId];
  if (!info) continue;
  const blockStart = fm[i].index;
  const blockEnd = i + 1 < fm.length ? fm[i + 1].index : content.indexOf('\nexport function', blockStart);
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
  const skip = new Set(['입니다','합니다','있습니다','됩니다','습니다','에서','으로','에게','까지','부터','하는','이며','하고','있는','없는','좋은','있고','없이','하면','같은','위해','대한','통해','가능','수준','정도','이상','이하','확인','문의','가능합니다','추천합니다','제공합니다','방문','전화','예약','가게','선수','서비스','분위기','시스템','호빠','것입니다','않습니다','것이','수도','것은','때문에','하지만','그리고','또한','에서는','에서의','경우가','정확한','아닙니다','기본','가장','포함','이런','어떤','이라는','이곳은','이곳이','이곳의','이곳에','이곳을','이곳에서','이곳만의','이곳','가능하며','방문하는','것이며','것이다','좋습니다','원합니다','바랍니다','없습니다','드립니다','보세요','않으며','편입니다','있으며','원하는','운영되며','가능하고','없으니','있으니','있어서','편하게','자유롭게','자연스럽게','편안하게','편안한','자유로운','프라이빗','프리미엄','하이엔드','전용','독립된','분리된','별도의','개별','참여형','체험형','경험형','연락으로','통화로','유선으로','알아보세요','체크하세요','문의하세요','깨끗한','청결한','호스트가','호스트를','멤버를','매니저의','사생활','보호가','호스트바를','무드를','감성을','고객에게','손님에게','바란다면','희망하면','기대한다면','선호하면','일정을','캠퍼스','학교','선수가','선수를','전화로','프라이버시가','경험을','시간을','실장의','가게가','분에게','확인하세요','대학가','분위기를','원하면','호빠를','유일한','전국에서','상위급','독보적인','body','VIP','intro','conclusion']);
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
