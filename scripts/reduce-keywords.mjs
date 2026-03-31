/**
 * Reduce keyword mentions to exactly 2 per venue (1 in intro, 1 in conclusion)
 * This dramatically reduces shared bigrams between same-region venues
 */
import { readFileSync, writeFileSync } from 'fs';

let src = readFileSync('src/data/venueContent.ts', 'utf8');

function reduceKeywordInVenue(source, venueId, keyword, shortName) {
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

  // Find section boundaries
  const summaryEnd = block.indexOf('intro:');
  const sectionsStart = block.indexOf('sections:');
  const conclusionStart = block.indexOf('conclusion:');

  if (summaryEnd === -1 || sectionsStart === -1 || conclusionStart === -1) {
    console.log('STRUCTURE NOT FOUND:', venueId);
    return source;
  }

  // Split into parts
  let summary = block.slice(0, summaryEnd);
  let intro = block.slice(summaryEnd, sectionsStart);
  let middle = block.slice(sectionsStart, conclusionStart);
  let conclusion = block.slice(conclusionStart);

  // Summary: remove ALL keyword mentions
  summary = summary.replaceAll(keyword, shortName);

  // Intro: keep FIRST occurrence, replace rest
  const firstIdx = intro.indexOf(keyword);
  if (firstIdx !== -1) {
    const before = intro.slice(0, firstIdx + keyword.length);
    const after = intro.slice(firstIdx + keyword.length);
    intro = before + after.replaceAll(keyword, shortName);
  }

  // Middle (sections, quickPlan, faq): remove ALL
  middle = middle.replaceAll(keyword, shortName);

  // Conclusion: keep FIRST occurrence, replace rest
  const concFirstIdx = conclusion.indexOf(keyword);
  if (concFirstIdx !== -1) {
    const before = conclusion.slice(0, concFirstIdx + keyword.length);
    const after = conclusion.slice(concFirstIdx + keyword.length);
    conclusion = before + after.replaceAll(keyword, shortName);
  }

  block = summary + intro + middle + conclusion;
  return source.slice(0, startIdx) + block + source.slice(blockEnd);
}

// Apply to all venues: [venueId, keyword, shortName replacement]
const venues = [
  ['gangnam-boston', '강남호빠 보스턴', '보스턴'],
  ['gangnam-i', '강남호빠 아이(I)', '아이(I)'],
  ['gangnam-flirting', '강남호빠 플러팅', '플러팅'],
  ['gangnam-blackhole', '강남호빠 블랙홀', '블랙홀'],
  ['geondae-wclub', '건대호빠 W클럽', 'W클럽'],
  ['jangan-bini', '장안동호빠', '이곳'],
  ['jangan-cube', '장안동호빠 큐브', '큐브'],
  ['jangan-bbangbbang', '장안동호빠 빵빵', '빵빵'],
  ['busan-michelin', '해운대호빠 미슐랭', '미슐랭'],
  ['busan-q', '해운대호빠 큐(Q)', '큐(Q)'],
  ['busan-david', '해운대호빠 다비드바', '다비드바'],
  ['busan-aura', '부산호빠 아우라', '아우라'],
  ['busan-menz', '부산호빠 맨즈', '맨즈'],
  ['busan-w', '부산호빠 더블유(W)', '더블유(W)'],
  ['busan-theking', '부산호빠 더킹', '더킹'],
  ['busan-js', '부산호빠 제이에스(JS)', '제이에스(JS)'],
  ['busan-michelin-jisung', '해운대호빠 미슐랭', '미슐랭'],
  ['suwon-beast', '수원호빠 비스트', '비스트'],
  ['suwon-maid', '수원호빠 메이드', '메이드'],
  ['suwon-play', '수원호빠 플레이 가라오케', '플레이 가라오케'],
  ['suwon-lasvegas', '수원호빠 라스베가스', '라스베가스'],
  ['daejeon-eclipse', '대전호빠 이클립스', '이클립스'],
  ['daejeon-tombar', '대전호빠 톰바', '톰바'],
  ['gwangju-w', '광주호빠 W', 'W'],
  ['changwon-avengers', '창원호빠 어벤져스', '어벤져스'],
];

for (const [id, keyword, shortName] of venues) {
  const before = (src.match(new RegExp(keyword.replace(/[()]/g, '\\$&'), 'g')) || []).length;
  src = reduceKeywordInVenue(src, id, keyword, shortName);
  const after = (src.match(new RegExp(keyword.replace(/[()]/g, '\\$&'), 'g')) || []).length;
  console.log(`${id}: "${keyword}" ${before} → ${after}`);
}

// Also remove region-specific words from body text that cause shared bigrams
// Replace location references with generic terms per venue

// gangnam venues: reduce "강남역" mentions
src = src.replace(/강남역 2번출구/g, '2번출구');

// suwon venues: reduce "인계동" mentions in body (not in address facts)
// These need per-venue treatment

writeFileSync('src/data/venueContent.ts', src);
console.log('\nKeyword reduction complete.');
