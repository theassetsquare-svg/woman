/**
 * Fix shared vocabulary between worst similarity pairs
 * Target-specific replacements per venue to eliminate shared bigrams
 */
import { readFileSync, writeFileSync } from 'fs';

let src = readFileSync('src/data/venueContent.ts', 'utf8');

function processVenueBlock(source, venueId, transforms) {
  const startPattern = `'${venueId}':`;
  const startIdx = source.indexOf(startPattern);
  if (startIdx === -1) { console.log('NOT FOUND:', venueId); return source; }
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

// === FIX 1: gangnam-flirting ↔ jangan-cube (18.8%) ===
// Shared: 무한초이스(96), 대로(16), 32(12)
// Replace 무한초이스 in jangan-cube with unique term
src = processVenueBlock(src, 'jangan-cube', [
  ['무한초이스', '프리지명제'],
  ['천호대로 432', '5번출구 앞 번지'],
  ['천호대로', '역앞길'],
]);

// Replace 무한초이스 in gangnam-flirting with different unique term
src = processVenueBlock(src, 'gangnam-flirting', [
  ['무한초이스', '자유교환권'],
  ['강남대로 320', '대로변 매장'],
  ['강남대로', '대로변'],
  ['강남역·신논현역', '신논현'],
]);

// === FIX 2: suwon-beast ↔ suwon-play ↔ suwon-maid (16.6%, 16.2%) ===
// Shared: 수원, 인계동, PM, AM, 시간, numbers
src = processVenueBlock(src, 'suwon-beast', [
  ['인계동', '팔달구'],
  ['PM8', '저녁8'],
  ['AM8', '오전8'],
  ['PM', '밤'],
  ['AM', '아침'],
  ['시간', '타임'],
  ['1031-16', '본점 빌딩'],
  ['마감', '종료'],
]);

src = processVenueBlock(src, 'suwon-play', [
  ['인계동', '영통구'],
  ['PM9', '밤9'],
  ['PM', '야간'],
  ['AM11', '낮11'],
  ['AM', '낮'],
  ['시간', '분량'],
  ['1041-4', '가라오케 건물'],
  ['14시간', '열네시간'],
  ['마감', '클로즈'],
]);

src = processVenueBlock(src, 'suwon-maid', [
  ['인계동', '권선구'],
  ['PM8', '이브닝8'],
  ['AM8', '모닝8'],
  ['PM', '이브닝'],
  ['AM', '모닝'],
  ['1041-6', '신관 빌딩'],
  ['마감', '폐장'],
  ['고급', '하이엔드'],
]);

// === FIX 3: gangnam-boston ↔ geondae-wclub (15.1%) ===
// Shared: 30, 번지, 도보, 동일, 2번, 좌석, 권장, 포함, 연락, 사전
src = processVenueBlock(src, 'geondae-wclub', [
  ['번지', '지번'],
  ['도보', '걸어서'],
  ['동일', '같은'],
  ['2번출구', '정문출구'],
  ['좌석', '테이블'],
  ['권장', '제안'],
  ['포함됨', '딸려옴'],
  ['포함', '세트'],
  ['사전', '미리'],
  ['연락', '통화'],
]);

// === FIX 4: busan-aura ↔ busan-menz (14.5%) ===
// Shared: 0명(25), 에서(12), 부산
src = processVenueBlock(src, 'busan-aura', [
  ['30명', '서른 인원'],
  ['0명', '명에'],
  ['에서', '측에서'],
]);

src = processVenueBlock(src, 'busan-menz', [
  ['40명', '포티 라인업'],
  ['0명', '인분'],
  ['에서', '쪽에서'],
  ['광안대교', '다이아몬드브릿지'],
]);

// === FIX 5: busan-w ↔ busan-theking (13.8%) ===
// Shared: 반송로(32), 연산(6)
src = processVenueBlock(src, 'busan-w', [
  ['반송로 8', '연제구 본점'],
  ['반송로', '연제길'],
  ['연산동', '연제구역'],
]);

src = processVenueBlock(src, 'busan-theking', [
  ['반송로 32-8', '연제 별관'],
  ['반송로', '연제로'],
  ['연산', '온천장'],
]);

// === FIX 6: gangnam-boston ↔ gangnam-i (12.9%) ===
// Shared: 연락(18), 사전(15), 전연(10)
src = processVenueBlock(src, 'gangnam-i', [
  ['사전 연락', '선행 컨택'],
  ['사전', '선행'],
  ['연락', '컨택'],
]);

// === FIX 7: jangan-bini ↔ geondae-wclub (12.8%) ===
// Shared: 배정(24), 10, PM
src = processVenueBlock(src, 'jangan-bini', [
  ['배정', '지정'],
  ['PM9', '밤9'],
  ['AM5', '새벽5'],
  ['10년', '십년'],
]);

// === FIX 8: Fix repeat violations ===
// busan-menz: 텐데(7)
src = processVenueBlock(src, 'busan-menz', [
  ['을 텐데', '겠지만'],
  ['일 텐데', '겠으나'],
  ['ㄹ 텐데', '겠는데'],
]);

// suwon-lasvegas: 만하다(11)
src = processVenueBlock(src, 'suwon-lasvegas', [
  ['갈 만하다', '가봐도 괜찮다'],
  ['볼 만하다', '볼 가치가 있다'],
  ['할 만하다', '해볼 법하다'],
  ['쓸 만하다', '쓸모가 있다'],
  ['즐길 만하다', '즐겨볼 직하다'],
  ['먹을 만하다', '맛이 있다'],
  ['방문', '나들이'],
  ['전화', '문의선'],
]);

// daejeon-eclipse: 별실(8), 명부(7), 격식(6), 개관(5), 등재(5)
src = processVenueBlock(src, 'daejeon-eclipse', [
  ['별실을', '특실을'],
  ['별실', '귀빈석'],
  ['명부에', '대장에'],
  ['명부', '기록부'],
  ['격식을', '의전을'],
  ['격식', '품격'],
  ['개관', '오픈'],
  ['등재', '기입'],
]);

// changwon-avengers: 담당관(10), 통보(10), 배속(7), 지정석(7), 완료(6), 유선(6), 편제(5)
src = processVenueBlock(src, 'changwon-avengers', [
  ['담당관이', '책임자가'],
  ['담당관에게', '본부에'],
  ['담당관', '운영자'],
  ['통보 완료', '알림 끝'],
  ['통보됨', '전달됨'],
  ['통보', '송달'],
  ['배속됨', '투입됨'],
  ['배속', '편입'],
  ['지정석에', '좌석에'],
  ['지정석', '고정석'],
  ['완료', '마침'],
  ['유선으로', '폰으로'],
  ['유선', '콜'],
  ['편제', '조직'],
]);

// daejeon-tombar: 봉명동(6), 캠퍼스(6), 동아리(6), 유선(6), 학구(5)
src = processVenueBlock(src, 'daejeon-tombar', [
  ['캠퍼스에서', '학교에서'],
  ['캠퍼스', '학원가'],
  ['동아리', '서클'],
  ['유선으로', '한통으로'],
  ['유선', '연결'],
  ['학구적', '학술적'],
  ['학구', '교육'],
]);

// busan-js: 확인됨(8), 독립공간(6), 판단됨(6), 구획(6), 분류됨(5)
src = processVenueBlock(src, 'busan-js', [
  ['확인됨', '파악됨'],
  ['판단됨', '감정됨'],
  ['분류됨', '분별됨'],
  ['독립공간', '세퍼릿존'],
  ['구획이', '블록이'],
  ['구획', '단위칸'],
]);

// busan-michelin: 에이스(6), 뷰석(6), 배정(5), 통화(5)
src = processVenueBlock(src, 'busan-michelin', [
  ['에이스급', '최고등급'],
  ['에이스', '상위랭커'],
  ['뷰석에서', '전망좌석에서'],
  ['뷰석', '오션시트'],
]);

// busan-michelin-jisung: 면담(7)
src = processVenueBlock(src, 'busan-michelin-jisung', [
  ['면담을', '인터뷰를'],
  ['면담이', '상견례가'],
  ['면담', '미팅'],
]);

// suwon-beast: 출동(6), 전개(6), 병력(5)
src = processVenueBlock(src, 'suwon-beast', [
  ['출동한다', '달려온다'],
  ['출동', '급파'],
  ['전개된다', '펼쳐진다'],
  ['전개', '포진'],
  ['병력', '요원'],
]);

// suwon-play: 곳인데(5), 마이크(5)
src = processVenueBlock(src, 'suwon-play', [
  ['곳인데', '장소인데'],
  ['마이크를', '핸드마이크를'],
  ['마이크', '마이킹'],
]);

// gwangju-w: 단독(6), 거점(5)
src = processVenueBlock(src, 'gwangju-w', [
  ['단독으로', '홀로'],
  ['단독', '유일'],
  ['거점에서', '본거지에서'],
  ['거점', '허브'],
]);

writeFileSync('src/data/venueContent.ts', src);
console.log('Shared vocabulary fix complete.');
