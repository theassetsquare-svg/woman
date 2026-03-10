import { readFileSync } from 'fs';

const src = readFileSync('src/data/venueContent.ts', 'utf8');
const venuesSrc = readFileSync('src/data/venues.ts', 'utf8');

const venueInfo = {};
const vRegex = /id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?seoArea:\s*'([^']+)'/g;
let m;
while ((m = vRegex.exec(venuesSrc)) !== null) {
  venueInfo[m[1]] = { name: m[2], seoArea: m[3] };
}

const regionWords = [
  '상무지구', '마린시티', '장안동', '인계동', '해운대', '봉명동', '둔산동',
  '상남동', '광안리', '연산동', '강남', '역삼', '건대', '부산', '수원',
  '대전', '광주', '창원', '하단'
];

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

const orderedIds = [];
for (const id of Object.keys(venueInfo)) {
  const pos = src.indexOf(`'${id}':`);
  if (pos !== -1) orderedIds.push({ id, pos });
}
orderedIds.sort((a, b) => a.pos - b.pos);

console.log('=== 지역단어 검증 결과 (가게이름 내 지역단어 제외) ===\n');
console.log('업소명 | 지역단어 | 상세');
console.log('-'.repeat(65));

let totalAll = 0;
let overCount = 0;

for (let vi = 0; vi < orderedIds.length; vi++) {
  const { id } = orderedIds[vi];
  const info = venueInfo[id];
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
  const wordCounts = {};

  for (const rw of regionWords) {
    const re = new RegExp(escapeRe(rw), 'g');
    let hit;
    while ((hit = re.exec(block)) !== null) {
      const afterStr = block.slice(hit.index + rw.length, hit.index + rw.length + 2);
      if (rw === seoArea && afterStr.startsWith('호빠')) continue;
      matches.push({ index: hit.index, word: rw, length: rw.length });
    }
  }

  // Deduplicate overlapping
  matches.sort((a, b) => a.index - b.index || b.length - a.length);
  const deduped = [];
  for (const m of matches) {
    if (deduped.length > 0) {
      const last = deduped[deduped.length - 1];
      if (m.index < last.index + last.length) continue;
    }
    deduped.push(m);
  }

  for (const d of deduped) {
    wordCounts[d.word] = (wordCounts[d.word] || 0) + 1;
  }

  const detail = Object.entries(wordCounts).map(([k, v]) => `${k}(${v})`).join(', ');
  const count = deduped.length;
  const status = count <= 5 ? '' : ' *** 초과!';

  console.log(`${label} | ${count}개${status} | ${detail || '-'}`);
  totalAll += count;
  if (count > 5) overCount++;
}

console.log('-'.repeat(65));
console.log(`전체 합계: ${totalAll}개 | 평균: ${(totalAll / orderedIds.length).toFixed(1)}개`);
console.log(`5개 초과 업소: ${overCount}개`);
