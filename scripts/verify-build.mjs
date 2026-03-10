import { readFileSync } from 'fs';
import { readdirSync } from 'fs';

// Find JS bundle
const assets = readdirSync('dist/assets');
const jsFile = assets.find(f => f.endsWith('.js'));
const js = readFileSync(`dist/assets/${jsFile}`, 'utf8');

const checks = [
  { name: '강남호빠 보스턴', startMark: 'gangnam-boston', endMark: 'gangnam-i', seoArea: '강남', others: [] },
  { name: '해운대호빠 미슐랭', startMark: 'busan-michelin', endMark: 'busan-q', seoArea: '해운대', others: ['부산', '마린시티'] },
  { name: '대전호빠 이클립스', startMark: 'daejeon-eclipse', endMark: 'daejeon-tombar', seoArea: '대전', others: ['둔산동', '봉명동'] },
  { name: '광주호빠 W', startMark: 'gwangju-w', endMark: 'changwon-avengers', seoArea: '광주', others: ['상무지구', '부산', '창원'] },
  { name: '수원호빠 비스트', startMark: 'suwon-beast', endMark: 'suwon-maid', seoArea: '수원', others: ['인계동', '강남'] },
  { name: '창원호빠 어벤져스', startMark: 'changwon-avengers', endMark: 'getVenueLabel', seoArea: '창원', others: ['상남동'] },
];

console.log('=== 빌드 파일 지역단어 검증 ===\n');

for (const c of checks) {
  const start = js.indexOf(c.startMark);
  const end = js.indexOf(c.endMark, start + c.startMark.length + 10);
  if (start === -1 || end === -1) {
    console.log(`${c.name}: 블록 찾기 실패 (start=${start}, end=${end})`);
    continue;
  }
  const block = js.slice(start, end);

  const allWords = [c.seoArea, ...c.others];
  let totalStandalone = 0;
  const details = [];

  for (const w of allWords) {
    const allMatches = block.match(new RegExp(w, 'g'));
    const total = allMatches ? allMatches.length : 0;
    const hobbaMatches = block.match(new RegExp(w + '호빠', 'g'));
    const hobba = hobbaMatches ? hobbaMatches.length : 0;
    const standalone = total - hobba;
    if (standalone > 0) details.push(`${w}(${standalone})`);
    totalStandalone += standalone;
  }

  const status = totalStandalone <= 5 ? 'OK' : 'OVER!';
  console.log(`${c.name}: standalone ${totalStandalone}개 [${status}] — ${details.join(', ')}`);
}
