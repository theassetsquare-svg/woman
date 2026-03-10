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

console.log('=== Reducing cosine similarity drivers ===\n');

// 1. suwon-beast: "인계동" 12→4 (biggest single driver: contrib 107.9)
console.log('--- suwon-beast: 인계동 12→4 ---');
rv('suwon-beast', '인계동', '수원 인계', 3);
rv('suwon-beast', '인계동', '해당 권역', 2);
rv('suwon-beast', '인계동', '현지', 2);
rv('suwon-beast', '인계동', '이 동네', 1);

// 2. suwon-beast: "수원호빠" 9→6
console.log('--- suwon-beast: 수원호빠 9→6 ---');
rv('suwon-beast', '수원호빠', '수원 지역 호빠', 3);

// 3. suwon-maid: "수원호빠" 8→6
console.log('--- suwon-maid: 수원호빠 8→6 ---');
rv('suwon-maid', '수원호빠', '수원 인계동 호빠', 2);

// 4. suwon-play: "수원호빠" 7→5
console.log('--- suwon-play: 수원호빠 7→5 ---');
rv('suwon-play', '수원호빠', '인계동 호빠', 2);

// 5. jangan-bbangbbang: "장안동호빠" 8→6
console.log('--- jangan-bbangbbang: 장안동호빠 8→6 ---');
rv('jangan-bbangbbang', '장안동호빠', '장안동 지역 호빠', 2);

// 6. jangan-bini: "장안동호빠" 7→5
console.log('--- jangan-bini: 장안동호빠 7→5 ---');
rv('jangan-bini', '장안동호빠', '장안동 인근 호빠', 2);

// 7. busan-michelin-jisung: "지성" 9→5, "미슐랭" 7→4
console.log('--- busan-michelin-jisung: 지성 9→5, 미슐랭 7→4 ---');
rv('busan-michelin-jisung', '지성', '본점', 2);
rv('busan-michelin-jisung', '지성', '이곳', 2);
rv('busan-michelin-jisung', '미슐랭', '본 업소', 2);
rv('busan-michelin-jisung', '미슐랭', '해당 매장', 1);

// 8. busan-michelin: "해운대호빠" reduce by 1
console.log('--- busan-michelin/michelin-jisung: shared term reduction ---');
rv('busan-michelin-jisung', '해운대호빠', '해운대 지역 호빠', 2);

// 9. gangnam-boston <-> geondae-wclub: reduce shared terms
console.log('--- geondae-wclub: "2번" 6→3 ---');
rv('geondae-wclub', '2번', '두 번', 3);
rv('geondae-wclub', '목요일', '평일 저녁', 1);

// 10. gangnam-boston: reduce shared terms with flirting
console.log('--- gangnam-boston: shared term reduction ---');
rv('gangnam-boston', '강남역', '역세권', 1);

// 11. suwon-maid <-> suwon-play: "캐스트가" shared
console.log('--- suwon-play: 캐스트가 → 멤버가 ---');
rv('suwon-play', '캐스트가', '멤버가', 2);

// 12. suwon-maid <-> suwon-play: "인계동" shared
console.log('--- suwon-maid: 인계동 → synonyms ---');
rv('suwon-maid', '인계동에서', '수원에서', 1);
rv('suwon-maid', '인계동', '이 거리', 1);

writeFileSync(fp, c, 'utf-8');
console.log('\n✅ Cosine similarity fixes applied');
