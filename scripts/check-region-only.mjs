import { readFileSync } from 'fs';

const src = readFileSync('src/data/venueContent.ts', 'utf8');
const venuesSrc = readFileSync('src/data/venues.ts', 'utf8');

// Parse venue info
const venueInfo = {};
const venueRegex = /id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?seoArea:\s*'([^']+)'/g;
let m;
while ((m = venueRegex.exec(venuesSrc)) !== null) {
  venueInfo[m[1]] = { name: m[2], seoArea: m[3] };
}

// Extract each venue content block
const ids = Object.keys(venueInfo);
const blocks = {};
for (const id of ids) {
  const start = src.indexOf(`'${id}':`);
  if (start === -1) continue;
  // Find next venue block or end
  let end = src.length;
  for (const otherId of ids) {
    if (otherId === id) continue;
    const otherStart = src.indexOf(`'${otherId}':`);
    if (otherStart > start && otherStart < end) {
      end = otherStart;
    }
  }
  blocks[id] = src.slice(start, end);
}

// 지역단어 목록 (호빠 빼고 순수 지역명만)
const regionWords = ['강남', '역삼', '건대', '장안동', '해운대', '부산', '수원', '인계동', '대전', '둔산동', '봉명동', '광주', '상무지구', '창원', '상남동', '광안리', '연산동', '하단', '마린시티'];

console.log('=== 모든 업소 본문 내 지역단어 개수 ===\n');

const results = [];

for (const id of ids) {
  const info = venueInfo[id];
  const block = blocks[id];
  if (!block) continue;

  const label = `${info.seoArea}호빠 ${info.name}`;
  let total = 0;
  const detail = [];

  for (const rw of regionWords) {
    const count = (block.match(new RegExp(rw, 'g')) || []).length;
    if (count > 0) {
      detail.push(`${rw}(${count})`);
      total += count;
    }
  }

  results.push({ label, total, detail: detail.join(', ') });
}

// 정렬: 원래 순서 유지
for (const r of results) {
  console.log(`${r.label}: 지역단어 ${r.total}개`);
  console.log(`  ${r.detail}`);
  console.log('');
}

console.log('=== 요약 ===');
console.log('업소명 | 지역단어 합계');
console.log('-'.repeat(50));
for (const r of results) {
  console.log(`${r.label} | ${r.total}`);
}
console.log('-'.repeat(50));
console.log(`전체 합계 | ${results.reduce((s, r) => s + r.total, 0)}`);
console.log(`평균 | ${(results.reduce((s, r) => s + r.total, 0) / results.length).toFixed(1)}`);
