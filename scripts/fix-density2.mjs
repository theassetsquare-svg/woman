import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fp = resolve(__dirname, '..', 'src/data/venueContent.ts');
let c = readFileSync(fp, 'utf-8');

function rv(vid, old, neu, max = 1) {
  const sp = `'${vid}': {`;
  const si = c.indexOf(sp);
  if (si === -1) return 0;
  let ei = c.length;
  const r = /\n'[a-z]+-[a-z]/g;
  r.lastIndex = si + sp.length;
  const m = r.exec(c);
  if (m) ei = m.index;
  let sec = c.substring(si, ei);
  let cnt = 0, li = sec.length;
  while (cnt < max) {
    const idx = sec.lastIndexOf(old, li - 1);
    if (idx === -1) break;
    sec = sec.substring(0, idx) + neu + sec.substring(idx + old.length);
    li = idx; cnt++;
  }
  c = c.substring(0, si) + sec + c.substring(ei);
  console.log(`  ${vid}: "${old}" → "${neu}" x${cnt}`);
  return cnt;
}

// jangan-bini: 1.64% (5x) → 4x = 1.31%
rv('jangan-bini', '장안동호빠 빈이', '빈이', 1);

// busan-david: 1.58% (4x) → 3x = 1.19%
rv('busan-david', '해운대호빠 다비드바', '다비드바', 1);

// suwon-beast: 1.57% (3x) → 2x = 1.05%
rv('suwon-beast', '수원호빠 비스트', '비스트', 1);

// suwon-lasvegas: 1.63% (3x) → 2x = 1.09%
rv('suwon-lasvegas', '수원호빠 라스베가스', '라스베가스', 1);

writeFileSync(fp, c, 'utf-8');
console.log('\n✅ Density fine-tuning done');
