import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fp = resolve(__dirname, '..', 'src/data/venueContent.ts');
let c = readFileSync(fp, 'utf-8');

function replaceInVenue(venueId, old, neu, max = 1) {
  const sp = `'${venueId}': {`;
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

// jangan-cube: "대기인원" 5→4
replaceInVenue('jangan-cube', '대기인원', '출근 멤버', 1);

// busan-q: "관광객" 8→4, "골목" 7→4, "숙소" 5→4
replaceInVenue('busan-q', '관광객', '여행자', 2);
replaceInVenue('busan-q', '관광객', '방문자', 2);
replaceInVenue('busan-q', '골목', '거리', 2);
replaceInVenue('busan-q', '골목', '일대', 1);
replaceInVenue('busan-q', '숙소', '호텔', 1);

// busan-theking: "금요밤" 8→4, "건배" 6→4, "소주" 6→4, "맥주" 5→4, "대화" 5→4, "호스트" 5→4
replaceInVenue('busan-theking', '금요밤', '주말 저녁', 2);
replaceInVenue('busan-theking', '금요밤', '불금', 2);
replaceInVenue('busan-theking', '건배', '한잔', 1);
replaceInVenue('busan-theking', '건배', '축배', 1);
replaceInVenue('busan-theking', '소주', '증류주', 1);
replaceInVenue('busan-theking', '소주', '한국술', 1);
replaceInVenue('busan-theking', '맥주', '생맥', 1);
replaceInVenue('busan-theking', '대화', '토크', 1);
replaceInVenue('busan-theking', '호스트', '파트너', 1);

// suwon-beast: "면적" 8→4, "8시" 6→4, "대형" 5→4, "설비" 5→4
replaceInVenue('suwon-beast', '면적', '크기', 2);
replaceInVenue('suwon-beast', '면적', '넓이', 2);
replaceInVenue('suwon-beast', '8시', '저녁', 1);
replaceInVenue('suwon-beast', '8시', '오후 여덟시', 1);
replaceInVenue('suwon-beast', '대형', '초대규모', 1);
replaceInVenue('suwon-beast', '설비', '시설', 1);

// daejeon-tombar: "대학" 5→4
replaceInVenue('daejeon-tombar', '대학', '캠퍼스', 1);

writeFileSync(fp, c, 'utf-8');
console.log('✅ Agent stuffing issues fixed');
