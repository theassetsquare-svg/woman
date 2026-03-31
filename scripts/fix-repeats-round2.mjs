/**
 * Fix remaining 18 repeat violations after round 1
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
    // Replace only FIRST occurrence
    block = block.replace(new RegExp(from), to);
  }
  return source.slice(0, startIdx) + block + source.slice(blockEnd);
}

// busan-q: 해변(5→4)
src = processVenueBlock(src, 'busan-q', [['해변', '해안']]);

// busan-aura: 릴레이(5→4)
src = processVenueBlock(src, 'busan-aura', [['릴레이', '순환제']]);

// busan-menz: 라인(5→4)
src = processVenueBlock(src, 'busan-menz', [['라인', '팀']]);

// busan-michelin-jisung: 접견(6→4)
src = processVenueBlock(src, 'busan-michelin-jisung', [['접견', '만남']]);
src = processVenueBlock(src, 'busan-michelin-jisung', [['접견', '상면']]);

// suwon-beast: 배치(6→4), 집결(5→4), 대원(5→4)
src = processVenueBlock(src, 'suwon-beast', [['배치', '포진']]);
src = processVenueBlock(src, 'suwon-beast', [['배치', '세팅']]);
src = processVenueBlock(src, 'suwon-beast', [['집결', '소집']]);
src = processVenueBlock(src, 'suwon-beast', [['대원', '인력']]);

// daejeon-eclipse: 프라이빗(7→4), 대장(6→4), 좌정(6→4), 기개(5→4)
src = processVenueBlock(src, 'daejeon-eclipse', [['프라이빗', '밀실']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['프라이빗', '독실']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['프라이빗', '룸']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['대장', '부책']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['대장', '기록부']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['좌정', '정위']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['좌정', '입좌']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['기개', '위풍']]);

// daejeon-tombar: 유성거리(5→4)
src = processVenueBlock(src, 'daejeon-tombar', [['유성거리', '유성가']]);

// gwangju-w: 핵심부(6→4), 비교불가(5→4)
src = processVenueBlock(src, 'gwangju-w', [['핵심부', '중심가']]);
src = processVenueBlock(src, 'gwangju-w', [['핵심부', '요충지']]);
src = processVenueBlock(src, 'gwangju-w', [['비교불가', '독보적']]);

// changwon-avengers: 총괄(7→4), 개인석(5→4), 착임(5→4), 공지(5→4)
src = processVenueBlock(src, 'changwon-avengers', [['총괄', '본부장']]);
src = processVenueBlock(src, 'changwon-avengers', [['총괄', '관리자']]);
src = processVenueBlock(src, 'changwon-avengers', [['총괄', '주임']]);
src = processVenueBlock(src, 'changwon-avengers', [['개인석', '마이좌']]);
src = processVenueBlock(src, 'changwon-avengers', [['착임', '발령']]);
src = processVenueBlock(src, 'changwon-avengers', [['공지', '전달']]);

// Also fix busan-theking <-> busan-js similarity (10.0%)
// Need to differentiate their vocabulary slightly
src = processVenueBlock(src, 'busan-theking', [['좌석', '시팅']]);
src = processVenueBlock(src, 'busan-js', [['확정됨', '판명됨']]);

writeFileSync('src/data/venueContent.ts', src);
console.log('Round 2 repeat fixes complete.');
