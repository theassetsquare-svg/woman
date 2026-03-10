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
  return cnt;
}

// jangan-bbangbbang: "캐스트" 7→4
rv('jangan-bbangbbang', '캐스트', '선수', 2);
rv('jangan-bbangbbang', '캐스트', '호스트', 1);

// busan-aura: "30인" 6→4
rv('busan-aura', '30인', '삼십 명', 1);
rv('busan-aura', '30인', '서른 인원', 1);

// busan-menz: "라인업" 6→4, "조명" 5→4, "캐스트" 5→4
rv('busan-menz', '라인업', '구성원', 1);
rv('busan-menz', '라인업', '포진', 1);
rv('busan-menz', '조명', '불빛', 1);
rv('busan-menz', '캐스트', '파트너', 1);

// busan-michelin-jisung: "큐레이션" 8→4, "매칭" 7→4, "담당자" 6→4, "기록" 5→4
rv('busan-michelin-jisung', '큐레이션', '선별', 2);
rv('busan-michelin-jisung', '큐레이션', '추천', 2);
rv('busan-michelin-jisung', '매칭', '연결', 2);
rv('busan-michelin-jisung', '매칭', '배정', 1);
rv('busan-michelin-jisung', '담당자', '실장', 1);
rv('busan-michelin-jisung', '담당자', '매니저', 1);
rv('busan-michelin-jisung', '기록', '이력', 1);

writeFileSync(fp, c, 'utf-8');
console.log('✅ Fixed');
