/**
 * fix-keyword-stuffing-3.mjs — Third pass: fix synonyms that contained the original word
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

// Clean synonyms that DON'T contain the original word
const synonyms = {
  '있습니다': ['운영 중입니다', '마련됐습니다', '제공 중입니다', '준비됐습니다', '갖춰졌습니다'],
  '건대': ['건국대 인근', '이 지역', '근처'],
  '해운대': ['이 지역', '해변 일대', '해안가'],
  '대전': ['중부권', '이 지역', '충청권', '현지'],
  '창원': ['경남권', '이 지역', '현지'],
};

const venueKeyRegex = /'([a-z-]+)':\s*\{/g;
let venueKeys = [];
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
    const syns = synonyms[word];
    if (!syns) {
      report.push(`  [SKIP] ${vk.key}: ${word}(${count})`);
      continue;
    }

    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = [...block.matchAll(regex)];
    if (matches.length <= 5) continue;

    const toReplace = matches.slice(5);
    let replaced = 0;

    for (let i = toReplace.length - 1; i >= 0; i--) {
      const match = toReplace[i];
      const syn = syns[replaced % syns.length];
      block = block.substring(0, match.index) + syn + block.substring(match.index + word.length);
      replaced++;
    }

    venueFixed += replaced;
    report.push(`  ${vk.key}: ${word} ${count}→5 (replaced ${replaced}x)`);
  }

  if (venueFixed > 0) {
    src = src.substring(0, blockStart) + block + src.substring(blockEnd);
    totalFixed += venueFixed;

    // Re-parse positions
    venueKeys = [];
    const re2 = /'([a-z-]+)':\s*\{/g;
    while ((m = re2.exec(src)) !== null) {
      if (m.index > 100) venueKeys.push({ key: m[1], start: m.index });
    }
  }
}

fs.writeFileSync(FILE, src, 'utf-8');

console.log(`\n=== Pass 3 Report ===`);
console.log(`Total replacements: ${totalFixed}`);
report.forEach(r => console.log(r));

// Final verification
const src2 = fs.readFileSync(FILE, 'utf-8');
const re3 = /'([a-z-]+)':\s*\{/g;
const vks = [];
while ((m = re3.exec(src2)) !== null) {
  if (m.index > 100) vks.push({ key: m[1], start: m.index });
}

console.log(`\n=== FINAL Verification ===`);
let remaining = 0;
for (let vi = 0; vi < vks.length; vi++) {
  const vk = vks[vi];
  const s = vk.start;
  const e = vi < vks.length - 1 ? vks[vi + 1].start : src2.length;
  const block = src2.substring(s, e);
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
