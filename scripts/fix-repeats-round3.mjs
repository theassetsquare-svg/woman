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
    block = block.replace(new RegExp(from), to);
  }
  return source.slice(0, startIdx) + block + source.slice(blockEnd);
}

// busan-q: 해변(5→4)
src = processVenueBlock(src, 'busan-q', [['해변', '연안']]);

// busan-michelin-jisung: 접견(5→4)
src = processVenueBlock(src, 'busan-michelin-jisung', [['접견', '대면']]);

// suwon-beast: 배치(6→4)
src = processVenueBlock(src, 'suwon-beast', [['배치', '투입']]);
src = processVenueBlock(src, 'suwon-beast', [['배치', '동원']]);

// daejeon-eclipse: 좌정(6→4)
src = processVenueBlock(src, 'daejeon-eclipse', [['좌정', '안좌']]);
src = processVenueBlock(src, 'daejeon-eclipse', [['좌정', '착좌']]);

// changwon-avengers: 착임(5→4)
src = processVenueBlock(src, 'changwon-avengers', [['착임', '배치']]);

// Fix busan-theking <-> busan-js (10.1%) - differentiate vocabulary
src = processVenueBlock(src, 'busan-js', [['입증됨', '검증됨']]);
src = processVenueBlock(src, 'busan-js', [['산정됨', '측량됨']]);
src = processVenueBlock(src, 'busan-theking', [['시팅', '앉는곳']]);

writeFileSync('src/data/venueContent.ts', src);
console.log('Round 3 repeat fixes complete.');
