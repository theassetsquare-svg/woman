/**
 * Phase 2: Aggressive grammar pattern diversification
 * Targets FAQ question endings and sentence endings per venue
 */
import { readFileSync, writeFileSync } from 'fs';

let src = readFileSync('src/data/venueContent.ts', 'utf8');

// FAQ question ending diversification per venue group
// Group A (keep ~나요/~가요): gangnam-boston, busan-michelin, suwon-beast (3 venues)
// Group B (change to ~는지요/~ㄹ까요): gangnam-i, busan-q, suwon-maid
// Group C (change to ~습니까/~됩니까): geondae-wclub, busan-david, daejeon-eclipse
// Group D (change to ~는건가/~인건가): gangnam-flirting, busan-aura, daejeon-tombar
// Group E (change to ~나/~가/~지): gangnam-blackhole, busan-menz, gwangju-w
// Group F (change to ~요/~죠): jangan-bini, busan-w, suwon-play
// Group G (change to ~던데/~거든): jangan-cube, busan-theking, suwon-lasvegas
// Group H (change to ~인지/~는지): jangan-bbangbbang, busan-js, changwon-avengers, busan-michelin-jisung

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

// Group B: ~나요 → ~는지요, ~가요 → ~ㄹ까요, ~세요 → ~시지요
const groupB = ['gangnam-i', 'busan-q', 'suwon-maid'];
for (const id of groupB) {
  src = processVenueBlock(src, id, [
    ['있나요', '있는지요'], ['되나요', '되는지요'], ['인가요', '인지요'],
    ['할 수 있나요', '할 수 있는지요'], ['하나요', '하는지요'],
    ['인가요', '인지요'], ['볼 수 있나요', '볼 수 있는지요'],
    ['가능한가요', '가능한지요'], ['궁금합니다', '궁금한데요'],
    ['알려주세요', '알려주시겠어요'],
  ]);
}

// Group C: ~나요 → ~습니까, ~가요 → ~겠습니까
const groupC = ['geondae-wclub', 'busan-david', 'daejeon-eclipse'];
for (const id of groupC) {
  src = processVenueBlock(src, id, [
    ['있나요', '있습니까'], ['되나요', '됩니까'], ['인가요', '입니까'],
    ['할 수 있나요', '할 수 있습니까'], ['하나요', '합니까'],
    ['볼 수 있나요', '볼 수 있습니까'], ['가능한가요', '가능합니까'],
    ['어떤가요', '어떻습니까'], ['궁금합니다', '알고 싶습니다'],
    ['알려주세요', '말씀해 주십시오'],
  ]);
}

// Group D: ~나요 → ~는건가, ~가요 → ~인건가
const groupD = ['gangnam-flirting', 'busan-aura', 'daejeon-tombar'];
for (const id of groupD) {
  src = processVenueBlock(src, id, [
    ['있나요', '있는 건가'], ['되나요', '되는 건가'], ['인가요', '인 건가'],
    ['할 수 있나요', '할 수 있는 건가'], ['하나요', '하는 건가'],
    ['가능한가요', '가능한 건가'], ['어떤가요', '어떤 건가'],
    ['궁금합니다', '궁금하다'], ['알려주세요', '알려달라'],
  ]);
}

// Group E: ~나요 → ~나, ~가요 → ~가
const groupE = ['gangnam-blackhole', 'busan-menz', 'gwangju-w'];
for (const id of groupE) {
  src = processVenueBlock(src, id, [
    ['있나요', '있나'], ['되나요', '되나'], ['인가요', '인가'],
    ['할 수 있나요', '할 수 있나'], ['하나요', '하나'],
    ['가능한가요', '가능한가'], ['어떤가요', '어떤가'],
    ['궁금합니다', '궁금하다'], ['알려주세요', '알려줘'],
  ]);
}

// Group F: ~나요 → ~요, restructure
const groupF = ['jangan-bini', 'busan-w', 'suwon-play'];
for (const id of groupF) {
  src = processVenueBlock(src, id, [
    ['있나요', '있죠'], ['되나요', '되죠'], ['인가요', '이죠'],
    ['할 수 있나요', '할 수 있죠'], ['하나요', '하죠'],
    ['가능한가요', '가능하죠'], ['어떤가요', '어떻죠'],
    ['궁금합니다', '궁금해요'], ['알려주세요', '알려줘요'],
  ]);
}

// Group G: ~나요 → ~던데, restructure
const groupG = ['jangan-cube', 'busan-theking', 'suwon-lasvegas'];
for (const id of groupG) {
  src = processVenueBlock(src, id, [
    ['있나요', '있던가요'], ['되나요', '되던가요'], ['인가요', '이던가요'],
    ['할 수 있나요', '할 수 있던가요'], ['하나요', '하던가요'],
    ['가능한가요', '가능하던가요'], ['어떤가요', '어떻던가요'],
    ['궁금합니다', '알고싶어요'], ['알려주세요', '부탁드려요'],
  ]);
}

// Group H: ~나요 → ~는지, ~가요 → ~인지
const groupH = ['jangan-bbangbbang', 'busan-js', 'changwon-avengers', 'busan-michelin-jisung'];
for (const id of groupH) {
  src = processVenueBlock(src, id, [
    ['있나요', '있는지'], ['되나요', '되는지'], ['인가요', '인지'],
    ['할 수 있나요', '할 수 있는지'], ['하나요', '하는지'],
    ['가능한가요', '가능한지'], ['어떤가요', '어떤지'],
    ['궁금합니다', '알려주길'], ['알려주세요', '전해주길'],
  ]);
}

// Additional sentence ending diversification for worst offenders
// gangnam-boston: convert remaining 합니다 → 입니다 variations
src = processVenueBlock(src, 'gangnam-boston', [
  ['수 있습니다', '수 있겠습니다'],
  ['않습니다', '않겠습니다'],
]);

// geondae-wclub: strengthen 하십시오체
src = processVenueBlock(src, 'geondae-wclub', [
  ['수 있습니다', '수 있사옵니다'],
  ['하시기 바랍니다', '하시길 권합니다'],
]);

writeFileSync('src/data/venueContent.ts', src);
console.log('Phase 2 diversification complete.');
