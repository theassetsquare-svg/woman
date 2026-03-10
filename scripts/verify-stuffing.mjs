import fs from 'fs';
const src = fs.readFileSync('src/data/venueContent.ts', 'utf-8');

function countWords(text) {
  const words = text.match(/[가-힣]{2,}/g) || [];
  const freq = {};
  for (const w of words) { freq[w] = (freq[w] || 0) + 1; }
  return freq;
}

const re = /'([a-z-]+)':\s*\{/g;
const vks = [];
let m;
while ((m = re.exec(src)) !== null) {
  if (m.index > 100) vks.push({ key: m[1], start: m.index });
}

let total = 0;
let clean = 0;
for (let vi = 0; vi < vks.length; vi++) {
  const vk = vks[vi];
  const s = vk.start;
  const e = vi < vks.length - 1 ? vks[vi + 1].start : src.length;
  const block = src.substring(s, e);
  const freq = countWords(block);
  const over = Object.entries(freq).filter(([w, c]) => c > 5 && w.length >= 2).sort((a, b) => b[1] - a[1]);
  total++;
  if (over.length > 0) {
    console.log(`  ${vk.key}: ${over.map(([w,c]) => `${w}(${c})`).join(', ')}`);
  } else {
    clean++;
  }
}
console.log(`\n${clean}/${total} venues CLEAN (0 words >5)`);
if (clean === total) console.log('ALL CLEAR!');
