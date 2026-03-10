import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fp = resolve(__dirname, '..', 'src/data/venueContent.ts');
let c = readFileSync(fp, 'utf-8');

function rv(vid, old, neu, max = 1) {
  const sp = `'${vid}': {`;
  const si = c.indexOf(sp);
  if (si === -1) { console.log(`  ⚠️ ${vid} not found`); return 0; }
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

console.log('=== Final round: boston <-> flirting ===\n');

// Target "강남" (contrib 24.4) in boston: 4→2
rv('gangnam-boston', '강남', '도심 핵심가', 2);

// Target unique shared terms (contrib 6.4 each) - eliminate from boston
rv('gangnam-boston', '전부다', '모두', 1);
rv('gangnam-boston', '수요일', '주초', 1);
rv('gangnam-boston', '솔직한', '꾸밈없는', 1);
rv('gangnam-boston', '외출복이면', '깔끔한 차림이면', 1);

// Target from flirting side
rv('gangnam-flirting', '목요일은', '주중 저녁은', 1);
rv('gangnam-flirting', '시스템의', '운영 방식의', 1);
rv('gangnam-flirting', '없나요', '없을까요', 1);
rv('gangnam-flirting', '시스템', '운영 방식', 2);

// Target "처음" (contrib 8.1) in boston: 5→3
rv('gangnam-boston', '처음', '첫 방문', 2);

writeFileSync(fp, c, 'utf-8');
console.log('\n✅ Final cosine fixes applied');
