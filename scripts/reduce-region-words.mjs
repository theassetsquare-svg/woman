import { readFileSync, writeFileSync } from 'fs';

const contentPath = 'src/data/venueContent.ts';
let src = readFileSync(contentPath, 'utf8');
const venuesSrc = readFileSync('src/data/venues.ts', 'utf8');

// Parse venue info
const venueInfo = {};
const vRegex = /id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?seoArea:\s*'([^']+)'/g;
let m;
while ((m = vRegex.exec(venuesSrc)) !== null) {
  venueInfo[m[1]] = { name: m[2], seoArea: m[3] };
}

// Region words sorted longest first
const regionWords = [
  '상무지구', '마린시티', '장안동', '인계동', '해운대', '봉명동', '둔산동',
  '상남동', '광안리', '연산동', '강남', '역삼', '건대', '부산', '수원',
  '대전', '광주', '창원', '하단'
];

// Suffixes to remove together with region word (longest first)
const suffixes = [
  '에서는', '에서도', '에서의', '에서',
  '에는', '에도', '에의', '에만', '에',
  '으로는', '으로도', '으로', '로는', '로도', '로',
  '까지는', '까지도', '까지',
  '부터는', '부터',
  '처럼', '만큼', '보다',
  '이라는', '이라면', '이라서', '이라고', '이라',
  '이며', '이든', '이고', '이나', '이지만',
  '역에서는', '역에서', '역에', '역의', '역은', '역까지', '역',
  '권에서', '권의', '권에', '권은', '권',
  '구에서', '구의', '구에', '구',
  '시에서', '시에', '시의', '시',
  '의', '은', '는', '이', '가', '도', '만',
];

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function getRemovalEnd(text, pos, wordLen) {
  const after = text.slice(pos + wordLen);
  for (const s of suffixes) {
    if (after.startsWith(s)) {
      return pos + wordLen + s.length;
    }
  }
  return pos + wordLen;
}

// Get ordered venue IDs
const orderedIds = [];
for (const id of Object.keys(venueInfo)) {
  const pos = src.indexOf(`'${id}':`);
  if (pos !== -1) orderedIds.push({ id, pos });
}
orderedIds.sort((a, b) => a.pos - b.pos);

console.log('=== 지역단어 제거 작업 ===\n');

for (let vi = 0; vi < orderedIds.length; vi++) {
  const { id } = orderedIds[vi];
  const info = venueInfo[id];
  const seoArea = info.seoArea;
  const label = `${seoArea}호빠 ${info.name}`;

  // Find block boundaries
  const marker = `'${id}':`;
  const blockStart = src.indexOf(marker);
  if (blockStart === -1) continue;

  let blockEnd = src.length;
  for (let j = vi + 1; j < orderedIds.length; j++) {
    const nm = `'${orderedIds[j].id}':`;
    const np = src.indexOf(nm, blockStart + marker.length);
    if (np !== -1) { blockEnd = np; break; }
  }

  let block = src.slice(blockStart, blockEnd);

  // Find all standalone region word matches
  let matches = [];
  for (const rw of regionWords) {
    const re = new RegExp(escapeRe(rw), 'g');
    let hit;
    while ((hit = re.exec(block)) !== null) {
      const afterStr = block.slice(hit.index + rw.length, hit.index + rw.length + 2);
      // Skip if seoArea + 호빠 (part of 가게이름)
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

  if (deduped.length <= 5) {
    console.log(`${label}: ${deduped.length}개 (변경 없음)`);
    continue;
  }

  const toRemove = deduped.slice(5);
  console.log(`${label}: ${deduped.length}개 → 5개 (${toRemove.length}개 제거)`);

  // Remove from end to preserve indices
  toRemove.sort((a, b) => b.index - a.index);

  for (const item of toRemove) {
    let rStart = item.index;
    let rEnd = getRemovalEnd(block, item.index, item.length);

    // Clean up surrounding spaces
    const charBefore = rStart > 0 ? block[rStart - 1] : '';
    const charAfter = rEnd < block.length ? block[rEnd] : '';

    if (charAfter === ' ') {
      rEnd++; // eat trailing space
    } else if (charBefore === ' ') {
      rStart--; // eat leading space
    }

    // Additional: if removing leaves "·" or "," dangling
    if (charAfter === '·' && rEnd + 1 < block.length) {
      rEnd++; // eat "·"
    } else if (charBefore === '·') {
      rStart--; // eat "·"
    }

    block = block.slice(0, rStart) + block.slice(rEnd);
  }

  // Clean up double spaces and trim spaces around newlines
  block = block.replace(/  +/g, ' ');
  block = block.replace(/ ,/g, ',');
  block = block.replace(/,\s*,/g, ',');

  src = src.slice(0, blockStart) + block + src.slice(blockEnd);
}

writeFileSync(contentPath, src);
console.log('\n파일 저장 완료!');
