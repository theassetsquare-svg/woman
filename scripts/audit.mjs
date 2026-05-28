// 통합 SEO 감사 (24시간 CI에서 매일 실행). 회귀 발견 시 exit 1.
// 점검: ① 키워드 스터핑(단어 과반복) ② 업소내 문장 복붙 ③ 교차페이지 보일러플레이트
//      ④ 제목/설명 중복 ⑤ 길이 규격 ⑥ 빈 메타
import fs from 'fs';

const CONTENT = 'src/data/venueContent.ts';
const VENUES = 'src/data/venues.ts';
const REGION = 'src/data/regionSeo.ts';

// 허용 임계치 (자연스러운 핵심어/공통어 고려)
const MAX_WORD_FREQ = 9;        // 한 업소 본문 내 동일 단어 최대 허용
const MAX_SENT_REPEAT = 3;      // 한 업소 본문 내 동일 문장 최대 허용
const MAX_CROSS_VENUE = 5;      // 같은 문장이 등장해도 되는 업소 수 상한

let problems = 0;
const log = (s) => console.log(s);
const fail = (s) => { problems++; console.log('  ✗ ' + s); };

// ---------- 콘텐츠 분석 ----------
const content = fs.readFileSync(CONTENT, 'utf-8');
const keyRe = /'([a-z0-9-]+)':\s*\{/g;
const blocks = [];
let m;
while ((m = keyRe.exec(content)) !== null) { if (m.index > 100) blocks.push({ id: m[1], start: m.index }); }

const sentVenueCount = {};
log('\n[1] 키워드 스터핑 / 문장 복붙 (업소 본문)');
for (let i = 0; i < blocks.length; i++) {
  const s = blocks[i].start;
  const e = i < blocks.length - 1 ? blocks[i + 1].start : content.length;
  const block = content.slice(s, e);
  const fields = [...block.matchAll(/`([^`]*)`/g)].map((x) => x[1]).join('\n\n');
  // 단어 빈도
  const words = fields.match(/[가-힣]{2,}/g) || [];
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const over = Object.entries(freq).filter(([, c]) => c > MAX_WORD_FREQ).sort((a, b) => b[1] - a[1]);
  if (over.length) fail(`${blocks[i].id}: 과반복 ${over.map(([w, c]) => `${w}(${c})`).join(', ')}`);
  // 문장 빈도(업소 내)
  const sents = (fields.match(/[^.!?\n]+[.!?]/g) || []).map((x) => x.trim());
  const sf = {};
  for (const x of sents) { if (x.length > 8) sf[x] = (sf[x] || 0) + 1; }
  for (const [x, c] of Object.entries(sf)) {
    if (c > MAX_SENT_REPEAT) fail(`${blocks[i].id}: 문장 ${c}회 복붙 "${x.slice(0, 30)}…"`);
  }
  // 교차페이지 카운트
  for (const x of new Set(sents)) { if (x.length > 12) sentVenueCount[x] = (sentVenueCount[x] || 0) + 1; }
}

log('\n[2] 교차페이지 보일러플레이트(여러 업소 공통 문장)');
const cross = Object.entries(sentVenueCount).filter(([, c]) => c > MAX_CROSS_VENUE).sort((a, b) => b[1] - a[1]);
if (cross.length) for (const [x, c] of cross.slice(0, 10)) fail(`${c}개 업소 공통: "${x.slice(0, 40)}…"`);
else log('  ✓ 공통 템플릿 없음');

// ---------- 메타 중복 ----------
function parseKV(src, startMark, endMark) {
  const a = src.indexOf(startMark);
  const b = endMark ? src.indexOf(endMark, a + 1) : src.length;
  const sec = src.slice(a, b);
  const o = {};
  for (const mm of sec.matchAll(/'([a-z0-9-]+)':\s*'([^']*)'/g)) o[mm[1]] = mm[2];
  return o;
}
const venuesSrc = fs.readFileSync(VENUES, 'utf-8');
const hooks = parseKV(venuesSrc, 'const seoHooks', 'const seoDescriptions');
const vdescs = parseKV(venuesSrc, 'const seoDescriptions', null);

log('\n[3] 업소 제목/설명 중복·빈값');
function dupCheck(obj, label, maxLen) {
  const seen = {};
  let empty = 0, long = 0;
  for (const [k, v] of Object.entries(obj)) {
    if (!v.trim()) empty++;
    if (maxLen && v.length > maxLen) long++;
    (seen[v] = seen[v] || []).push(k);
  }
  const dups = Object.entries(seen).filter(([, ks]) => ks.length > 1);
  if (dups.length) fail(`${label} 중복 ${dups.length}건 (예: ${dups[0][1].join(',')})`);
  if (empty) fail(`${label} 빈값 ${empty}건`);
  if (long) fail(`${label} 길이초과(>${maxLen}) ${long}건`);
  if (!dups.length && !empty && !long) log(`  ✓ ${label}: ${Object.keys(obj).length}개 모두 고유`);
}
dupCheck(hooks, '업소 hook(제목)', null);
dupCheck(vdescs, '업소 desc', 150);

log('\n[4] 지역 제목/설명 중복·규격');
const regionSrc = fs.readFileSync(REGION, 'utf-8');
const rTitles = {}, rDescs = {};
for (const mm of regionSrc.matchAll(/'([a-z0-9-]+)':\s*\{\s*title:\s*"([^"]*)",\s*desc:\s*"([^"]*)"/g)) {
  rTitles[mm[1]] = mm[2]; rDescs[mm[1]] = mm[3];
}
dupCheck(rTitles, '지역 title', 60);
dupCheck(rDescs, '지역 desc', 150);

// ---------- 결과 ----------
log(`\n=== 감사 결과: ${problems === 0 ? 'PASS ✅' : `FAIL ❌ (${problems}건)`} ===`);
process.exit(problems === 0 ? 0 : 1);
