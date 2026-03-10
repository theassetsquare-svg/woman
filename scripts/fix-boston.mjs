import { readFileSync, writeFileSync } from 'fs';

const contentPath = 'src/data/venueContent.ts';
let src = readFileSync(contentPath, 'utf8');

const start = src.indexOf("'gangnam-boston':");
const end = src.indexOf("'gangnam-i':");
let block = src.slice(start, end);

const regionWords = [
  '상무지구', '마린시티', '장안동', '인계동', '해운대', '봉명동', '둔산동',
  '상남동', '광안리', '연산동', '강남', '역삼', '건대', '부산', '수원',
  '대전', '광주', '창원', '하단'
];

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

function getRemovalEnd(text, pos, wordLen) {
  const after = text.slice(pos + wordLen);
  for (const s of suffixes) {
    if (after.startsWith(s)) return pos + wordLen + s.length;
  }
  return pos + wordLen;
}

// Find standalone region words (강남 not followed by 호빠)
let matches = [];
for (const rw of regionWords) {
  const re = new RegExp(rw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  let hit;
  while ((hit = re.exec(block)) !== null) {
    const afterStr = block.slice(hit.index + rw.length, hit.index + rw.length + 2);
    if (rw === '강남' && afterStr.startsWith('호빠')) continue;
    matches.push({ index: hit.index, word: rw, length: rw.length });
  }
}

matches.sort((a, b) => a.index - b.index || b.length - a.length);
const deduped = [];
for (const m of matches) {
  if (deduped.length > 0) {
    const last = deduped[deduped.length - 1];
    if (m.index < last.index + last.length) continue;
  }
  deduped.push(m);
}

console.log(`강남호빠 보스턴: 현재 standalone 지역단어 ${deduped.length}개`);
const detail = {};
for (const d of deduped) { detail[d.word] = (detail[d.word] || 0) + 1; }
console.log('상세:', Object.entries(detail).map(([k,v]) => `${k}(${v})`).join(', '));

if (deduped.length <= 5) {
  console.log('5개 이하 — 변경 없음');
  process.exit(0);
}

const toRemove = deduped.slice(5);
console.log(`${toRemove.length}개 제거`);

toRemove.sort((a, b) => b.index - a.index);
for (const item of toRemove) {
  let rStart = item.index;
  let rEnd = getRemovalEnd(block, item.index, item.length);
  const charAfter = rEnd < block.length ? block[rEnd] : '';
  const charBefore = rStart > 0 ? block[rStart - 1] : '';
  if (charAfter === ' ') rEnd++;
  else if (charBefore === ' ') rStart--;
  if (charAfter === '·') rEnd++;
  else if (charBefore === '·') rStart--;
  block = block.slice(0, rStart) + block.slice(rEnd);
}

block = block.replace(/  +/g, ' ');
block = block.replace(/ ,/g, ',');

src = src.slice(0, start) + block + src.slice(end);
writeFileSync(contentPath, src);
console.log('보스턴 처리 완료!');

// Verify
const newBlock = src.slice(src.indexOf("'gangnam-boston':"), src.indexOf("'gangnam-i':"));
let verifyMatches = [];
for (const rw of regionWords) {
  const re = new RegExp(rw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  let hit;
  while ((hit = re.exec(newBlock)) !== null) {
    const afterStr = newBlock.slice(hit.index + rw.length, hit.index + rw.length + 2);
    if (rw === '강남' && afterStr.startsWith('호빠')) continue;
    verifyMatches.push({ index: hit.index, word: rw });
  }
}
verifyMatches.sort((a, b) => a.index - b.index);
const vDeduped = [];
for (const m of verifyMatches) {
  if (vDeduped.length > 0) {
    const last = vDeduped[vDeduped.length - 1];
    if (m.index < last.index + last.word.length) continue;
  }
  vDeduped.push(m);
}
const vDetail = {};
for (const d of vDeduped) { vDetail[d.word] = (vDetail[d.word] || 0) + 1; }
console.log(`검증: ${vDeduped.length}개 — ` + Object.entries(vDetail).map(([k,v]) => `${k}(${v})`).join(', '));
