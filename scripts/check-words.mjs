import { readFileSync } from 'fs';
const content = readFileSync('/home/user/woman/src/data/venueContent.ts', 'utf8');

const venueRanges = [
  { key: 'gangnam-i', start: content.indexOf("'gangnam-i':"), end: content.indexOf("'gangnam-flirting':") },
  { key: 'gangnam-flirting', start: content.indexOf("'gangnam-flirting':"), end: content.indexOf("'gangnam-blackhole':") },
  { key: 'gangnam-blackhole', start: content.indexOf("'gangnam-blackhole':"), end: content.indexOf('// ===== 건대 =====') },
];

for (const v of venueRanges) {
  const section = content.slice(v.start, v.end);
  const words = section.match(/[가-힣]{2,}/g) || [];
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const overLimit = Object.entries(freq).filter(([w, c]) => c >= 5).sort((a, b) => b[1] - a[1]);
  console.log(`\n=== ${v.key} ===`);
  if (overLimit.length === 0) {
    console.log('OK - no word repeats 5+ times');
  } else {
    for (const [w, count] of overLimit) {
      const regex = new RegExp(w, 'g');
      let m;
      const positions = [];
      while ((m = regex.exec(section)) !== null) {
        const ctx = section.slice(Math.max(0, m.index - 15), m.index + 20);
        positions.push(ctx);
      }
      console.log(`${count}x ${w}:`);
      positions.forEach((p, i) => console.log(`  ${i + 1}: ${JSON.stringify(p)}`));
    }
  }
}
