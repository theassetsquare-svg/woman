/**
 * Round 3: Fix newly introduced shared bigrams
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

// === FIX: "합류" shared between aura(8), changwon(7), menz(3) ===
src = processVenueBlock(src, 'busan-aura', [
  ['합류', '점입'],
]);
src = processVenueBlock(src, 'changwon-avengers', [
  ['합류됨', '도착됨'],
  ['합류', '착임'],
]);

// === FIX: "헤드" shared between menz(6 from 헤드카운트) and changwon(10) ===
src = processVenueBlock(src, 'busan-menz', [
  ['헤드카운트', '넘버링'],
  ['카운터', '바캐비넷'],
]);
src = processVenueBlock(src, 'changwon-avengers', [
  ['헤드가', '수장이'],
  ['헤드에게', '수장에게'],
  ['헤드', '수장'],
]);

// === FIX: "VIP"/"VI"/"IP" shared between gangnam-i(3) and daejeon-eclipse(10) ===
src = processVenueBlock(src, 'daejeon-eclipse', [
  ['VIP석', '특등석'],
  ['VIP', '특등'],
]);

// === FIX: "0인" shared between aura(30인 5x) and menz(40인 6x) ===
src = processVenueBlock(src, 'busan-aura', [
  ['30인', '삼십인'],
]);
src = processVenueBlock(src, 'busan-menz', [
  ['40인', '사십인'],
]);

// === FIX: "30" shared between boston(5) and aura(6) ===
src = processVenueBlock(src, 'gangnam-boston', [
  ['300m', '삼백미터'],
  ['22:30', '열시반'],
]);

// === FIX: "카운터석" shared between theking(6) and busan-w(has 카운터) ===
src = processVenueBlock(src, 'busan-theking', [
  ['카운터석에', '바스툴에'],
  ['카운터석', '바스툴'],
]);

// === FIX: "자리" shared between gangnam-i(3) and daejeon-eclipse(6) ===
src = processVenueBlock(src, 'daejeon-eclipse', [
  ['자리가', '좌정이'],
  ['자리에', '좌정에'],
  ['자리', '좌정'],
]);

// === FIX remaining repeat violations ===
// busan-aura: 전체원(5), 교대(5)
src = processVenueBlock(src, 'busan-aura', [
  ['전체원이', '풀원이'],
  ['전체원', '풀원'],
  ['교대가', '릴레이가'],
  ['교대', '릴레이'],
]);

// busan-menz: 진용(5)
src = processVenueBlock(src, 'busan-menz', [
  ['진용이', '구성원이'],
  ['진용', '라인'],
]);

// busan-w: 반송동(5), 문열기(5), 시트(5)
src = processVenueBlock(src, 'busan-w', [
  ['문열기', '개관'],
  ['시트가', '석이'],
  ['시트를', '석을'],
  ['시트', '석'],
]);

// daejeon-eclipse: VIP석→특등석(9), 장부(7), 위엄(6), 개시(5), 기재(5)
src = processVenueBlock(src, 'daejeon-eclipse', [
  ['특등석에서', '프라이빗에서'],
  ['특등석에', '프라이빗에'],
  ['특등석을', '프라이빗을'],
  ['특등석', '프라이빗'],
  ['장부를', '대장을'],
  ['장부에', '대장에'],
  ['장부', '대장'],
  ['위엄을', '기개를'],
  ['위엄', '기개'],
]);

// changwon: 수장(10→), 안내(8), 마이석(7)
src = processVenueBlock(src, 'changwon-avengers', [
  ['수장이', '총괄이'],
  ['수장에게', '총괄에게'],
  ['수장', '총괄'],
  ['안내됨', '공지됨'],
  ['안내', '공지'],
  ['마이석에', '전용자리에'],
  ['마이석', '전용자리'],
]);

// busan-js: 인지됨(8), 측정됨(6), 독방(5)
src = processVenueBlock(src, 'busan-js', [
  ['인지됨', '간파됨'],
  ['측정됨', '계측됨'],
  ['독방', '단독실'],
]);

// busan-michelin-jisung: 미팅(7)
src = processVenueBlock(src, 'busan-michelin-jisung', [
  ['미팅을', '접견을'],
  ['미팅이', '접견이'],
  ['미팅', '접견'],
]);

// jangan-cube: 다섯번게이트(8)
src = processVenueBlock(src, 'jangan-cube', [
  ['다섯번게이트', '5호출입구'],
]);

// gwangju-w: 중심지(7), 독보(6), 상무지구(5)
src = processVenueBlock(src, 'gwangju-w', [
  ['중심지에서', '핵심부에서'],
  ['중심지', '핵심부'],
  ['독보적인', '비교불가'],
  ['독보', '비교불가'],
]);

writeFileSync('src/data/venueContent.ts', src);
console.log('Round 3 fixes complete.');
