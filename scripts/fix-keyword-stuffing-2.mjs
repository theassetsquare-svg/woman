/**
 * fix-keyword-stuffing-2.mjs — Second pass for remaining >5 words
 */
import fs from 'fs';

const FILE = 'src/data/venueContent.ts';
let src = fs.readFileSync(FILE, 'utf-8');

function countWords(text) {
  const words = text.match(/[가-힣]{2,}/g) || [];
  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  return freq;
}

// Expanded synonym maps for remaining words
const synonyms = {
  // Common grammar/functional words
  '있습니다': ['갖추고 있습니다', '마련돼 있습니다', '확인됩니다', '운영 중입니다', '준비돼 있습니다'],
  '가능합니다': ['이용하실 수 있습니다', '진행할 수 있습니다', '제공됩니다', '허용됩니다'],
  '있나요': ['가능한가요', '되나요', '확인할 수 있나요', '알 수 있나요'],
  '가장': ['제일', '단연', '가히', '특히'],

  // SEO area keywords — reduce excess beyond 5
  '강남호빠': ['강남 호스트바', '강남권 업소', '강남 지역 호스트바'],
  '건대호빠': ['건대 호스트바', '건대입구 업소', '건대 지역 호스트바'],
  '장안동호빠': ['장안동 호스트바', '장안동 지역 업소', '장안동 호스트바'],
  '해운대호빠': ['해운대 호스트바', '해운대 지역 업소', '해운대 호스트바'],
  '부산호빠': ['부산 호스트바', '부산 지역 업소', '부산권 호스트바'],
  '수원호빠': ['수원 호스트바', '수원 지역 업소', '수원권 호스트바'],
  '대전호빠': ['대전 호스트바', '대전 지역 업소'],

  // Brand/place names
  '정찰제': ['고정 가격제', '정가 운영', '명시된 요금제', '투명 가격'],
  '추가': ['별도', '추가적', '부가', '더해지는'],
  '빈이는': ['이 매장은', '해당 업소는', '이곳은', '본 가게는'],
  '더블유': ['이 매장', '해당 업소'],
  '제이에스': ['이 매장'],
  '플레이': ['이 매장', '해당 업소'],
  '미슐랭': ['이 매장', '해당 업소'],
  '마린시티': ['해운대 일대', '인근 상권', '해변가 상권'],
  '충장로': ['충장 일대', '광주 중심가', '도심 상권'],
  '빠르게': ['신속히', '즉시', '순식간에', '재빠르게'],
  '맞춤': ['개인별', '취향별', '1:1', '개별'],
  '기본': ['표준', '베이직', '기초'],
  '선수': ['캐스트', '파트너', '호스트', '출근 멤버'],
  '대전': ['대전 지역', '대전권', '중부권'],
  '창원': ['창원 지역', '경남권', '창원권'],
};

// Find all venue keys
const venueKeyRegex = /'([a-z-]+)':\s*\{/g;
const venueKeys = [];
let m;
while ((m = venueKeyRegex.exec(src)) !== null) {
  if (m.index > 100) venueKeys.push({ key: m[1], start: m.index });
}

let totalFixed = 0;
const report = [];

for (let vi = 0; vi < venueKeys.length; vi++) {
  const vk = venueKeys[vi];
  const blockStart = vk.start;
  const blockEnd = vi < venueKeys.length - 1 ? venueKeys[vi + 1].start : src.length;
  let block = src.substring(blockStart, blockEnd);

  const freq = countWords(block);
  const overLimit = Object.entries(freq)
    .filter(([w, c]) => c > 5 && w.length >= 2)
    .sort((a, b) => b[1] - a[1]);

  if (overLimit.length === 0) continue;

  let venueFixed = 0;

  for (const [word, count] of overLimit) {
    const excess = count - 5;
    const syns = synonyms[word];

    if (!syns || syns.length === 0) {
      report.push(`  [SKIP] ${vk.key}: ${word}(${count})`);
      continue;
    }

    // Replace from the end, keeping first 5
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = [...block.matchAll(regex)];

    if (matches.length <= 5) continue;

    const toReplace = matches.slice(5);
    let replaced = 0;

    for (let i = toReplace.length - 1; i >= 0; i--) {
      const match = toReplace[i];
      const syn = syns[replaced % syns.length];
      const before = block.substring(0, match.index);
      const after = block.substring(match.index + word.length);
      block = before + syn + after;
      replaced++;
    }

    venueFixed += replaced;
    report.push(`  ${vk.key}: ${word} ${count}→5 (replaced ${replaced}x)`);
  }

  if (venueFixed > 0) {
    src = src.substring(0, blockStart) + block + src.substring(blockEnd);
    totalFixed += venueFixed;

    // Re-parse venue positions since lengths changed
    venueKeys.length = 0;
    const re2 = /'([a-z-]+)':\s*\{/g;
    while ((m = re2.exec(src)) !== null) {
      if (m.index > 100) venueKeys.push({ key: m[1], start: m.index });
    }
  }
}

fs.writeFileSync(FILE, src, 'utf-8');

console.log(`\n=== Pass 2 Report ===`);
console.log(`Total replacements: ${totalFixed}`);
report.forEach(r => console.log(r));

// Verify
const src2 = fs.readFileSync(FILE, 'utf-8');
const venueKeyRegex2 = /'([a-z-]+)':\s*\{/g;
const venueKeys2 = [];
while ((m = venueKeyRegex2.exec(src2)) !== null) {
  if (m.index > 100) venueKeys2.push({ key: m[1], start: m.index });
}

console.log(`\n=== Final Verification ===`);
let remaining = 0;
for (let vi = 0; vi < venueKeys2.length; vi++) {
  const vk = venueKeys2[vi];
  const blockStart = vk.start;
  const blockEnd = vi < venueKeys2.length - 1 ? venueKeys2[vi + 1].start : src2.length;
  const block = src2.substring(blockStart, blockEnd);
  const freq = countWords(block);
  const over = Object.entries(freq)
    .filter(([w, c]) => c > 5 && w.length >= 2)
    .sort((a, b) => b[1] - a[1]);

  if (over.length > 0) {
    console.log(`  ${vk.key}: ${over.map(([w,c]) => `${w}(${c})`).join(', ')}`);
    remaining += over.length;
  }
}

if (remaining === 0) {
  console.log('  ALL CLEAR — no words >5 per venue!');
} else {
  console.log(`\n  Remaining: ${remaining} words still >5`);
}
