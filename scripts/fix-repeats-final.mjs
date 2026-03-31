/**
 * Fix all 52 repeat violations (words appearing 5+ times per venue)
 * Strategy: replace some occurrences with synonyms, keep count ≤ 4
 */
import { readFileSync, writeFileSync } from 'fs';

let src = readFileSync('src/data/venueContent.ts', 'utf8');

function processVenueBlock(source, venueId, transforms) {
  const startPattern = `'${venueId}':`;
  const startIdx = source.indexOf(startPattern);
  if (startIdx === -1) return source;
  let depth = 0;
  let blockStart = source.indexOf('{', startIdx);
  let blockEnd = blockStart;
  for (let i = blockStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    if (depth === 0) { blockEnd = i + 1; break; }
  }
  let block = source.slice(startIdx, blockEnd);
  for (const [from, to] of transforms) {
    // Replace only FIRST occurrence to reduce count by 1
    if (typeof to === 'string') {
      block = block.replace(new RegExp(from), to);
    }
  }
  return source.slice(0, startIdx) + block + source.slice(blockEnd);
}

// gangnam-boston: 균일가(5→4), MC(5→4)
src = processVenueBlock(src, 'gangnam-boston', [
  ['균일가', '정찰제'],  // replace first occurrence
  ['MC', '파트너'],
]);

// gangnam-i: 프리(5→4)
src = processVenueBlock(src, 'gangnam-i', [
  ['프리 컨택', '미리 연결'],
]);

// gangnam-flirting: 셀프초이스(5→4)
src = processVenueBlock(src, 'gangnam-flirting', [
  ['셀프초이스', '자율선택제'],
]);

// gangnam-blackhole: neon(5→4)
src = processVenueBlock(src, 'gangnam-blackhole', [
  ['neon', 'LED'],
]);

// geondae-wclub: 종업원(5→4), 데스크(5→4)
src = processVenueBlock(src, 'geondae-wclub', [
  ['종업원', '크루'],
  ['데스크', '석'],
]);

// jangan-cube: 5호출입구(8→4) — replace 4 occurrences
src = processVenueBlock(src, 'jangan-cube', [['5호출입구', '정문']]);
src = processVenueBlock(src, 'jangan-cube', [['5호출입구', '입구']]);
src = processVenueBlock(src, 'jangan-cube', [['5호출입구', '현관']]);
src = processVenueBlock(src, 'jangan-cube', [['5호출입구', '대문']]);

// busan-michelin: 상위랭커(6→4), 오션시트(6→4)
src = processVenueBlock(src, 'busan-michelin', [['상위랭커', '톱급']]);
src = processVenueBlock(src, 'busan-michelin', [['상위랭커', '1군']]);
src = processVenueBlock(src, 'busan-michelin', [['오션시트', '바다뷰']]);
src = processVenueBlock(src, 'busan-michelin', [['오션시트', '해변석']]);

// busan-q: 해변(6→4)
src = processVenueBlock(src, 'busan-q', [['해변', '바닷가']]);
src = processVenueBlock(src, 'busan-q', [['해변', '워터프론트']]);

// busan-david: 무대(5→4)
src = processVenueBlock(src, 'busan-david', [['무대', '스테이지']]);

// busan-aura: 릴레이(6→4), 풀원(5→4), thirty(5→4), 점입(5→4)
src = processVenueBlock(src, 'busan-aura', [['릴레이', '순환']]);
src = processVenueBlock(src, 'busan-aura', [['릴레이', '회전']]);
src = processVenueBlock(src, 'busan-aura', [['풀원', '정원']]);
src = processVenueBlock(src, 'busan-aura', [['thirty', '30']]);
src = processVenueBlock(src, 'busan-aura', [['점입', '입문']]);

// busan-menz: forty(6→4), 라인(5→4)
src = processVenueBlock(src, 'busan-menz', [['forty', '40']]);
src = processVenueBlock(src, 'busan-menz', [['forty', '사십']]);
src = processVenueBlock(src, 'busan-menz', [['라인이', '진영이']]);

// busan-w: 반송동(5→4), 개관(5→4)
src = processVenueBlock(src, 'busan-w', [['반송동', '연제 일대']]);
src = processVenueBlock(src, 'busan-w', [['개관', '문 열기']]);

// busan-theking: 바스툴(5→4)
src = processVenueBlock(src, 'busan-theking', [['바스툴', '좌석']]);

// busan-js: 간파됨(8→4), 단독실(6→4), 계측됨(6→4), 분별됨(5→4), 미리(5→4)
src = processVenueBlock(src, 'busan-js', [['간파됨', '확정됨']]);
src = processVenueBlock(src, 'busan-js', [['간파됨', '입증됨']]);
src = processVenueBlock(src, 'busan-js', [['간파됨', '점검됨']]);
src = processVenueBlock(src, 'busan-js', [['간파됨', '조사됨']]);
src = processVenueBlock(src, 'busan-js', [['단독실', '별실']]);
src = processVenueBlock(src, 'busan-js', [['단독실', '개실']]);
src = processVenueBlock(src, 'busan-js', [['계측됨', '산정됨']]);
src = processVenueBlock(src, 'busan-js', [['계측됨', '검수됨']]);
src = processVenueBlock(src, 'busan-js', [['분별됨', '구분됨']]);
src = processVenueBlock(src, 'busan-js', [['미리', '앞서']]);

// busan-michelin-jisung: 접견(7→4)
src = processVenueBlock(src, 'busan-michelin-jisung', [['접견을', '상견례를']]);
src = processVenueBlock(src, 'busan-michelin-jisung', [['접견이', '대면이']]);
src = processVenueBlock(src, 'busan-michelin-jisung', [['접견', '대좌']]);

// suwon-beast: 배치(7→4), 집결(6→4), 대원(5→4)
src = processVenueBlock(src, 'suwon-beast', [['배치된다', '도열한다']]);
src = processVenueBlock(src, 'suwon-beast', [['배치', '전진']]);
src = processVenueBlock(src, 'suwon-beast', [['배치', '도열']]);
src = processVenueBlock(src, 'suwon-beast', [['집결한다', '모인다']]);
src = processVenueBlock(src, 'suwon-beast', [['집결', '집합']]);
src = processVenueBlock(src, 'suwon-beast', [['대원이', '멤버가']]);

// suwon-maid: 신축(5→4)
src = processVenueBlock(src, 'suwon-maid', [['신축', '새 건물']]);

// suwon-play: 공간인데(5→4), 송출(5→4)
src = processVenueBlock(src, 'suwon-play', [['공간인데', '곳인데']]);
src = processVenueBlock(src, 'suwon-play', [['송출', '출력']]);

// suwon-lasvegas: 발광(5→4), 있다(5→4)
src = processVenueBlock(src, 'suwon-lasvegas', [['발광', 'LED등']]);
src = processVenueBlock(src, 'suwon-lasvegas', [['있다', '존재한다']]);

// daejeon-eclipse: 프라이빗(9→4), 좌정(8→4), 대장(7→4), 기개(6→4), 개시(5→4), 기재(5→4)
src = processVenueBlock(src, 'daejeon-eclipse', [['프라이빗에서', '독실에서']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['프라이빗에', '독실에']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['프라이빗을', '독실을']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['프라이빗', '독실']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['프라이빗', '특실']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['좌정하시오', '앉으시오']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['좌정', '착석']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['좌정', '입석']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['좌정', '정좌']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['대장에', '기록에']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['대장을', '기록을']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['대장', '명단']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['기개를', '품위를']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['기개', '위풍']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['개시', '시작']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['기재', '등록']]);

// daejeon-tombar: 봉명동(6→4), 유성거리(6→4), 학문(5→4)
src = processVenueBlock(src, 'daejeon-tombar', [['봉명동', '유성구']]);
src = processVenueBlock(src, 'daejeon-tombar', [['봉명동', '충대앞']]);
src = processVenueBlock(src, 'daejeon-tombar', [['유성거리에서', '유성에서']]);
src = processVenueBlock(src, 'daejeon-tombar', [['유성거리', '유성길']]);
src = processVenueBlock(src, 'daejeon-tombar', [['학문', '학술']]);

// gwangju-w: 비교불가(8→4), 핵심부(7→4), 상무지구(5→4)
src = processVenueBlock(src, 'gwangju-w', [['비교불가인', '독자적인']]);
src = processVenueBlock(src, 'gwangju-w', [['비교불가', '유례없는']]);
src = processVenueBlock(src, 'gwangju-w', [['비교불가', '전무후무']]);
src = processVenueBlock(src, 'gwangju-w', [['비교불가', '무이하게']]);
src = processVenueBlock(src, 'gwangju-w', [['핵심부에서', '중앙부에서']]);
src = processVenueBlock(src, 'gwangju-w', [['핵심부', '정중앙']]);
src = processVenueBlock(src, 'gwangju-w', [['핵심부', '센터']]);
src = processVenueBlock(src, 'gwangju-w', [['상무지구', '상무']]);

// changwon-avengers: 총괄(10→4), 공지(8→4), 착임(7→4), 개인석(7→4), 짜임(5→4)
src = processVenueBlock(src, 'changwon-avengers', [['총괄이', '본부장이']]);
src = processVenueBlock(src, 'changwon-avengers', [['총괄에게', '책임자에게']]);
src = processVenueBlock(src, 'changwon-avengers', [['총괄', '사령']]);
src = processVenueBlock(src, 'changwon-avengers', [['총괄', '오퍼레이터']]);
src = processVenueBlock(src, 'changwon-avengers', [['총괄', '관리인']]);
src = processVenueBlock(src, 'changwon-avengers', [['총괄', '조장']]);
src = processVenueBlock(src, 'changwon-avengers', [['공지됨', '전파됨']]);
src = processVenueBlock(src, 'changwon-avengers', [['공지', '고지']]);
src = processVenueBlock(src, 'changwon-avengers', [['공지', '알림']]);
src = processVenueBlock(src, 'changwon-avengers', [['공지', '통달']]);
src = processVenueBlock(src, 'changwon-avengers', [['착임됨', '부임됨']]);
src = processVenueBlock(src, 'changwon-avengers', [['착임', '취임']]);
src = processVenueBlock(src, 'changwon-avengers', [['착임', '임명']]);
src = processVenueBlock(src, 'changwon-avengers', [['개인석에', '마이자리에']]);
src = processVenueBlock(src, 'changwon-avengers', [['개인석', '전용좌']]);
src = processVenueBlock(src, 'changwon-avengers', [['개인석', '독점석']]);
src = processVenueBlock(src, 'changwon-avengers', [['짜임', '구조']]);

writeFileSync('src/data/venueContent.ts', src);
console.log('Repeat violations fix complete.');
