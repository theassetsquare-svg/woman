import { readFileSync } from 'fs';

const src = readFileSync('src/data/venueContent.ts', 'utf8');
const venuesSrc = readFileSync('src/data/venues.ts', 'utf8');

// Parse venue info - skip regions array by starting after 'export const venues'
const venuesStart = venuesSrc.indexOf('export const venues');
const venuesPart = venuesSrc.slice(venuesStart);

const venueInfo = {};
const vRegex = /id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?seoArea:\s*'([^']+)'/g;
let m;
while ((m = vRegex.exec(venuesPart)) !== null) {
  venueInfo[m[1]] = { name: m[2], seoArea: m[3] };
}

const regionWords = [
  '상무지구', '마린시티', '장안동', '인계동', '해운대', '봉명동', '둔산동',
  '상남동', '광안리', '연산동', '강남', '역삼', '건대', '부산', '수원',
  '대전', '광주', '창원', '하단'
];

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Get ordered IDs from content file
const orderedIds = [];
for (const id of Object.keys(venueInfo)) {
  const pos = src.indexOf(`'${id}':`);
  if (pos !== -1) orderedIds.push({ id, pos });
}
orderedIds.sort((a, b) => a.pos - b.pos);

console.log('=== 최종 검증: 25개 업소 본문 지역단어 (가게이름 제외) ===\n');
console.log('업소명 | 지역단어 | 상세');
console.log('-'.repeat(65));

let total = 0;
let overCount = 0;
let venueCount = 0;

for (let vi = 0; vi < orderedIds.length; vi++) {
  const { id } = orderedIds[vi];
  const info = venueInfo[id];
  if (!info) continue;
  const seoArea = info.seoArea;
  const label = `${seoArea}호빠 ${info.name}`;

  const marker = `'${id}':`;
  const blockStart = src.indexOf(marker);
  if (blockStart === -1) continue;

  let blockEnd = src.length;
  for (let j = vi + 1; j < orderedIds.length; j++) {
    const nm = `'${orderedIds[j].id}':`;
    const np = src.indexOf(nm, blockStart + marker.length);
    if (np !== -1) { blockEnd = np; break; }
  }

  const block = src.slice(blockStart, blockEnd);

  let matches = [];
  for (const rw of regionWords) {
    const re = new RegExp(esc(rw), 'g');
    let hit;
    while ((hit = re.exec(block)) !== null) {
      const afterStr = block.slice(hit.index + rw.length, hit.index + rw.length + 2);
      if (rw === seoArea && afterStr.startsWith('호빠')) continue;
      matches.push({ index: hit.index, word: rw, length: rw.length });
    }
  }

  matches.sort((a, b) => a.index - b.index || b.length - a.length);
  const deduped = [];
  for (const mm of matches) {
    if (deduped.length > 0) {
      const last = deduped[deduped.length - 1];
      if (mm.index < last.index + last.length) continue;
    }
    deduped.push(mm);
  }

  const wordCounts = {};
  for (const d of deduped) wordCounts[d.word] = (wordCounts[d.word] || 0) + 1;
  const detail = Object.entries(wordCounts).map(([k, v]) => `${k}(${v})`).join(', ');
  const count = deduped.length;
  const status = count > 5 ? ' *** 초과!' : '';

  console.log(`${label} | ${count}개${status} | ${detail || '-'}`);
  total += count;
  if (count > 5) overCount++;
  venueCount++;
}

console.log('-'.repeat(65));
console.log(`총 ${venueCount}개 업소 | 합계: ${total}개 | 평균: ${(total / venueCount).toFixed(1)}개`);
console.log(`5개 초과: ${overCount}개`);
