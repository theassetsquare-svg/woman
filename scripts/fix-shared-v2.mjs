/**
 * Round 2 fixes for remaining shared bigrams
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
    block = block.replace(new RegExp(from, 'g'), to);
  }
  return source.slice(0, startIdx) + block + source.slice(blockEnd);
}

// === FIX: gangnam-boston shared with many venues ===
// "호스트"(스트 bigram shared with 비스트/캐스트) → "MC"
// "12" (shared with suwon-beast 12시간) → spell out some
// "교체" (shared with flirting) → "변경"
// "주말" (shared with beast) → "토일"
src = processVenueBlock(src, 'gangnam-boston', [
  ['호스트', 'MC'],
  ['12주년', '개업후 십이년'],
  ['12년째', '십이년째'],
  ['12번째', '십이번째'],
  ['교체', '변경'],
  ['주말', '토일'],
  ['추가', '별도'],
  ['번지', '지점'],
  ['출구', '게이트'],
  ['스태프', '매니저'],
  ['대기', '웨이팅'],
]);

// === FIX: gangnam-flirting ===
// "교체"(shared boston) → already changed in boston
// "자유" too many → reduce
// "스태프" → "담당"
src = processVenueBlock(src, 'gangnam-flirting', [
  ['자유교환권', '셀프초이스'],
  ['교체 자유', '바꾸기 무한'],
  ['교체', '스위칭'],
  ['스태프', '안내원'],
  ['추가', '별도'],
  ['착석', '앉으면'],
]);

// === FIX: geondae-wclub ↔ busan-theking: 테이블(70!) ===
src = processVenueBlock(src, 'geondae-wclub', [
  ['테이블', '데스크'],
]);

// === FIX: busan-w ↔ busan-theking: 연제(24) ===
src = processVenueBlock(src, 'busan-theking', [
  ['연제구', '거제동'],
  ['연제', '거제'],
  ['테이블', '카운터석'],
]);

// === FIX: busan-w ↔ daejeon-eclipse: 좌석(42), 기록(35) ===
src = processVenueBlock(src, 'daejeon-eclipse', [
  ['좌석', '자리'],
  ['기록부', '장부'],
  ['기록', '기재'],
  ['기입', '기재'],
  ['오픈', '개시'],
]);

src = processVenueBlock(src, 'busan-w', [
  ['좌석', '시트'],
  ['기록', '히스토리'],
  ['배치', '포맷'],
  ['개장', '문열기'],
  ['연제구', '반송동'],
]);

// === FIX: busan-aura ↔ busan-menz: 인원(30) ===
src = processVenueBlock(src, 'busan-aura', [
  ['서른 인원', '30인 규모'],
  ['인원', '멤버수'],
  ['배치', '진열'],
  ['에서', '내에서'],
  ['투입', '합류'],
  ['총원', '전체원'],
]);

src = processVenueBlock(src, 'busan-menz', [
  ['포티 라인업', '40인 진용'],
  ['인원', '헤드카운트'],
  ['라인업이', '진용이'],
  ['라인업', '선두진'],
  ['에서', '에선'],
]);

// === FIX: gangnam-boston ↔ jangan-cube: 번출구(16), 번지(12) ===
src = processVenueBlock(src, 'jangan-cube', [
  ['5번출구', '다섯번게이트'],
  ['캐스트', '배우'],
  ['출구', '게이트'],
]);

// === FIX: busan-michelin ↔ busan-michelin-jisung: 해운대(30), 미슐랭(24), 심사(10), 통화(10) ===
src = processVenueBlock(src, 'busan-michelin-jisung', [
  ['심사', '리뷰'],
  ['통화', '콜'],
]);
src = processVenueBlock(src, 'busan-michelin', [
  ['통화', '텔'],
  ['배정', '분배'],
]);

// === FIX repeat violations ===
// busan-js: 파악됨(8), 세퍼릿존(6), 감정됨(6), 단위칸(6)
src = processVenueBlock(src, 'busan-js', [
  ['파악됨', '인지됨'],
  ['세퍼릿존', '독방'],
  ['감정됨', '측정됨'],
  ['단위칸', '셀'],
  ['사전', '미리'],
]);

// changwon: 운영자(10), 송달(8), 편입(7), 고정석(7)
src = processVenueBlock(src, 'changwon-avengers', [
  ['운영자가', '본부가'],
  ['운영자에게', '센터에'],
  ['운영자', '헤드'],
  ['송달됨', '알려짐'],
  ['송달', '안내'],
  ['편입됨', '합류됨'],
  ['편입', '합류'],
  ['고정석에', '마이석에'],
  ['고정석', '마이석'],
  ['조직', '구성'],
]);

// daejeon-eclipse: 귀빈석(9), 기록부(7), 품격(6)
// already fixed 기록부→장부, 좌석→자리 above
src = processVenueBlock(src, 'daejeon-eclipse', [
  ['귀빈석에', '상석에'],
  ['귀빈석을', '상석을'],
  ['귀빈석', 'VIP석'],
  ['품격을', '위엄을'],
  ['품격', '위엄'],
]);

// daejeon-tombar: 봉명동(6), 학원가(6), 연결(6), 교육(5)
src = processVenueBlock(src, 'daejeon-tombar', [
  ['학원가에서', '대학가에서'],
  ['학원가', '유성거리'],
  ['연결해', '잡아'],
  ['연결', '콜'],
  ['교육적', '학문적'],
  ['교육', '학문'],
]);

// suwon-beast: 급파(6), 포진(6), 요원(5)
src = processVenueBlock(src, 'suwon-beast', [
  ['급파된다', '투입된다'],
  ['급파', '배치'],
  ['포진한다', '늘어선다'],
  ['포진', '집결'],
  ['요원이', '대원이'],
  ['요원', '대원'],
]);

// suwon-play: 장소인데(5), 마이킹(5)
src = processVenueBlock(src, 'suwon-play', [
  ['장소인데', '공간인데'],
  ['마이킹', '송출'],
]);

// gwangju-w: 유일(6), 허브(5)
src = processVenueBlock(src, 'gwangju-w', [
  ['유일한', '독보적인'],
  ['유일', '독보'],
  ['허브에', '중심지에'],
  ['허브', '중심지'],
]);

writeFileSync('src/data/venueContent.ts', src);
console.log('Round 2 shared vocabulary fix complete.');
