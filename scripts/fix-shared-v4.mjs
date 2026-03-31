/**
 * Final fixes for last 4 pages over 10%
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

// === FIX: busan-aura ↔ busan-menz (10.8%) ===
// Shared: 십인(30), 로1(12), 부산(8), 0분(8), 10(6)

// "삼십인" and "사십인" share "십인" bigram
src = processVenueBlock(src, 'busan-aura', [
  ['삼십인', 'thirty'],
  ['광남로 106', '광남 백여번지'],
  ['10분', '약간'],
  ['탐색', '스캔'],
]);

src = processVenueBlock(src, 'busan-menz', [
  ['사십인', 'forty'],
  ['광안해변로 179', '광안 해변쪽 빌딩'],
  ['0분', '여분'],
  ['10', '열'],
]);

// === FIX: gangnam-i ↔ changwon-avengers (10.4%) ===
// Shared: 자리(24), 배정(20), 전담(12), 선행(10), 구성(6)

src = processVenueBlock(src, 'changwon-avengers', [
  ['전용자리', '개인석'],
  ['자리에', '데에'],
  ['자리', '위치'],
  ['배정됨', '지목됨'],
  ['배정', '지목'],
  ['전담', '원투원'],
  ['구성', '짜임'],
]);

src = processVenueBlock(src, 'gangnam-i', [
  ['선행 컨택', '프리 컨택'],
  ['선행', '프리'],
]);

writeFileSync('src/data/venueContent.ts', src);
console.log('Final fixes complete.');
