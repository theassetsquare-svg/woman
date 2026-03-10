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

console.log('=== Round 2: Reducing remaining cosine violations ===\n');

// --- gangnam-boston: reduce shared with flirting AND wclub ---
console.log('--- gangnam-boston ---');
rv('gangnam-boston', '경우가', '상황이', 2);
rv('gangnam-boston', '이벤트', '행사', 1);
rv('gangnam-boston', '추가', '별도', 2);
rv('gangnam-boston', '추가', '부가', 1);
rv('gangnam-boston', '목요일', '주중 밤', 1);
rv('gangnam-boston', '있지만', '있으나', 1);
rv('gangnam-boston', '대기가', '웨이팅이', 2);
rv('gangnam-boston', '정찰제', '고정가', 2);
rv('gangnam-boston', '발생하지', '생기지', 1);
rv('gangnam-boston', '처음이라면', '초행이라면', 1);

// --- gangnam-flirting: reduce shared with boston ---
console.log('--- gangnam-flirting ---');
rv('gangnam-flirting', '강남역', '강남 번화가', 2);
rv('gangnam-flirting', '여러', '다양한', 2);
rv('gangnam-flirting', '제일', '가장', 1);

// --- geondae-wclub: reduce shared with boston ---
console.log('--- geondae-wclub ---');
rv('geondae-wclub', '직장인', '회사원', 2);
rv('geondae-wclub', '같은', '유사한', 1);
rv('geondae-wclub', '가지', '종류', 1);

// --- busan-michelin-jisung: reduce shared with michelin ---
console.log('--- busan-michelin-jisung ---');
rv('busan-michelin-jisung', '전달하면', '말씀하시면', 2);
rv('busan-michelin-jisung', '양주', '증류주', 2);
rv('busan-michelin-jisung', '맞춤', '개별', 2);
rv('busan-michelin-jisung', '맞춤', '전용', 1);
rv('busan-michelin-jisung', '셰프', '요리장', 2);
rv('busan-michelin-jisung', '고급', '프리미엄', 2);
rv('busan-michelin-jisung', '전담', '개인', 2);
rv('busan-michelin-jisung', '해운대', '해변 도시', 1);

// --- busan-michelin: reduce shared with michelin-jisung ---
console.log('--- busan-michelin ---');
rv('busan-michelin', '해운대', '해변 권역', 2);
rv('busan-michelin', '양주', '증류주', 1);
rv('busan-michelin', '세팅', '준비', 1);

writeFileSync(fp, c, 'utf-8');
console.log('\n✅ Round 2 cosine fixes applied');
