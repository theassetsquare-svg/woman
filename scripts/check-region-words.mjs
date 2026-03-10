import { readFileSync } from 'fs';

const src = readFileSync('src/data/venueContent.ts', 'utf8');
const venuesSrc = readFileSync('src/data/venues.ts', 'utf8');

// Parse venue info from venues.ts for seoArea + name
const venueInfo = {};
const venueRegex = /id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?seoArea:\s*'([^']+)'/g;
let m;
while ((m = venueRegex.exec(venuesSrc)) !== null) {
  venueInfo[m[1]] = { name: m[2], seoArea: m[3] };
}

// Extract each venue's content block
const venueBlocks = {};
const blockRegex = /'([a-z]+-[a-z0-9-]+)':\s*\{/g;
const blockStarts = [];
while ((m = blockRegex.exec(src)) !== null) {
  blockStarts.push({ id: m[1], start: m.index });
}

for (let i = 0; i < blockStarts.length; i++) {
  const { id, start } = blockStarts[i];
  const end = i + 1 < blockStarts.length ? blockStarts[i + 1].start : src.length;
  venueBlocks[id] = src.slice(start, end);
}

// Region keywords to check
const regionKeywords = ['강남', '건대', '장안동', '해운대', '부산', '수원', '대전', '광주', '창원', '인계동', '광안리', '연산동', '하단', '봉명동', '둔산동', '상무지구', '상남동', '역삼', '마린시티'];

console.log('=== 각 업소 본문 내 지역 단어 수 ===\n');

const allResults = [];

for (const [id, block] of Object.entries(venueBlocks)) {
  const info = venueInfo[id];
  if (!info) continue;

  const label = `${info.seoArea}호빠 ${info.name}`;
  const seoAreaKeyword = `${info.seoArea}호빠`;

  // Count each region keyword
  const counts = {};
  let total = 0;

  for (const kw of regionKeywords) {
    const regex = new RegExp(kw, 'g');
    const matches = block.match(regex);
    const count = matches ? matches.length : 0;
    if (count > 0) {
      counts[kw] = count;
      total += count;
    }
  }

  // Also count "호빠" specifically
  const hobbaMatches = block.match(/호빠/g);
  const hobbaCount = hobbaMatches ? hobbaMatches.length : 0;

  // Count full venue label (가게이름 = 지역호빠 상호명)
  const labelRegex = new RegExp(label.replace(/[()]/g, '\\$&'), 'g');
  const labelMatches = block.match(labelRegex);
  const labelCount = labelMatches ? labelMatches.length : 0;

  // Count seoArea호빠 keyword
  const seoAreaRegex = new RegExp(seoAreaKeyword, 'g');
  const seoAreaMatches = block.match(seoAreaRegex);
  const seoAreaCount = seoAreaMatches ? seoAreaMatches.length : 0;

  const result = {
    id,
    label,
    seoAreaKeyword,
    labelCount,
    seoAreaCount,
    hobbaCount,
    regionCounts: counts,
    totalRegion: total,
  };
  allResults.push(result);

  const regionDetail = Object.entries(counts).map(([k, v]) => `${k}(${v})`).join(', ');

  console.log(`${label}`);
  console.log(`  가게이름(${label}): ${labelCount}회`);
  console.log(`  지역호빠(${seoAreaKeyword}): ${seoAreaCount}회`);
  console.log(`  호빠: ${hobbaCount}회`);
  console.log(`  지역단어 상세: ${regionDetail || '없음'}`);
  console.log(`  지역단어 합계: ${total}회`);
  console.log('');
}

// Summary table
console.log('\n=== 요약 테이블 ===');
console.log('업소명 | 가게이름 | 지역호빠 | 호빠 | 지역단어합계');
console.log('-'.repeat(70));
for (const r of allResults) {
  console.log(`${r.label} | ${r.labelCount} | ${r.seoAreaCount} | ${r.hobbaCount} | ${r.totalRegion}`);
}

// Totals
const totalLabel = allResults.reduce((s, r) => s + r.labelCount, 0);
const totalSeoArea = allResults.reduce((s, r) => s + r.seoAreaCount, 0);
const totalHobba = allResults.reduce((s, r) => s + r.hobbaCount, 0);
const totalRegion = allResults.reduce((s, r) => s + r.totalRegion, 0);
console.log('-'.repeat(70));
console.log(`합계 | ${totalLabel} | ${totalSeoArea} | ${totalHobba} | ${totalRegion}`);
