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

// gangnam-blackhole: 힙합6→4, 대화6→4, 캐스트진5→4, 라운지뮤직5→4, 캐스트5→4
rv('gangnam-blackhole', '힙합', '어반 비트', 2);
rv('gangnam-blackhole', '대화', '토크', 2);
rv('gangnam-blackhole', '캐스트진', '멤버진', 1);
rv('gangnam-blackhole', '라운지뮤직', '배경음', 1);
rv('gangnam-blackhole', '캐스트', '멤버', 1);

// jangan-bini: 매장8→4, 위스키6→4, 강북권5→4, 감각배정5→4
rv('jangan-bini', '매장', '가게', 2);
rv('jangan-bini', '매장', '공간', 2);
rv('jangan-bini', '위스키', '양주', 1);
rv('jangan-bini', '위스키', '증류주', 1);
rv('jangan-bini', '강북권', '서울 동북부', 1);
rv('jangan-bini', '감각배정', '직감배정', 1);

// busan-david: 다비드바11→10, MC10→4, 게임7→4, 긴장해소7→4, 입문자6→4, 축하5→4
rv('busan-david', '다비드바', '이곳', 1);
rv('busan-david', 'MC', '진행자', 4);
rv('busan-david', 'MC', '사회자', 2);
rv('busan-david', '게임', '놀이', 2);
rv('busan-david', '게임', '액티비티', 1);
rv('busan-david', '긴장해소', '긴장완화', 2);
rv('busan-david', '긴장해소', '부담제거', 1);
rv('busan-david', '입문자', '초보자', 1);
rv('busan-david', '입문자', '첫손님', 1);
rv('busan-david', '축하', '기념', 1);

// suwon-maid: 몰입6→4, 의상5→4
rv('suwon-maid', '몰입', '빠져듦', 1);
rv('suwon-maid', '몰입', '흡입력', 1);
rv('suwon-maid', '의상', '복장', 1);

// suwon-play: 마이크5→4, 반주5→4, 듀엣5→4
rv('suwon-play', '마이크', '보컬장비', 1);
rv('suwon-play', '반주', '음원', 1);
rv('suwon-play', '듀엣', '이중창', 1);

writeFileSync(fp, c, 'utf-8');
console.log('✅ All stuffing fixed');
