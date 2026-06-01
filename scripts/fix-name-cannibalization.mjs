// 같은 지역 타 업소 상호명 교차오염 제거.
// 각 업소 블록 안에서 "경쟁 업소 이름"을 자기중심/일반 표현으로 치환해
// 각 가게가 자기 이름으로만 상위노출되도록 한다. (block-scoped 치환)
import fs from 'node:fs';

const FILE = 'src/data/venueContent.ts';
let src = fs.readFileSync(FILE, 'utf8');

// 블록 경계 찾기
function blockRange(id) {
  const start = src.indexOf(`'${id}':`);
  if (start < 0) return null;
  const after = src.slice(start + id.length + 3);
  const rel = after.search(/\n'[a-z0-9-]+':\s*\{/);
  const end = rel < 0 ? src.length : start + id.length + 3 + rel;
  return [start, end];
}

// 블록 내 치환 적용
function inBlock(id, fn) {
  const r = blockRange(id);
  if (!r) { console.warn('블록 없음:', id); return; }
  const [s, e] = r;
  const block = src.slice(s, e);
  const out = fn(block);
  src = src.slice(0, s) + out + src.slice(e);
}

const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 표준 비교문 제거: comp(경쟁 상호 핵심)를 블록 내에서 일반표현으로
function genericComp(id, comp) {
  inBlock(id, (b) => {
    const c = esc(comp);
    return b
      // 섹션 제목 "○○과의 차이(점)"
      .replace(new RegExp(`'${c}(와|과)의 차이(점)?'`, 'g'), `'이곳만의 차별점'`)
      // FAQ 질문 "○○과 뭐가 다른가?" / "○○와 차이?"
      .replace(new RegExp(`'${c}(와|과) ?(뭐가 다른가|차이)\\??'`, 'g'), `'어떤 분위기인가?'`)
      // 시나리오/문장 "○○ 말고/대신"
      .replace(new RegExp(`${c} 말고`, 'g'), '다른 곳 말고')
      .replace(new RegExp(`${c} 대신`, 'g'), '다른 곳 대신')
      // 요약 "○○ 대비 차별화/아늑"
      .replace(new RegExp(`${c} 대비 차별화\\.`, 'g'), '확실한 차별화.')
      .replace(new RegExp(`${c} 대비 아늑\\.`, 'g'), '한층 아늑.')
      // 본문 "○○이/가/는/도/보다/와/과 …"
      .replace(new RegExp(`${c}이 `, 'g'), '다른 곳이 ')
      .replace(new RegExp(`${c}가 `, 'g'), '다른 곳이 ')
      .replace(new RegExp(`${c}는 `, 'g'), '다른 곳은 ')
      .replace(new RegExp(`${c}도`, 'g'), '다른 곳도')
      .replace(new RegExp(`${c}보다`, 'g'), '다른 곳보다')
      .replace(new RegExp(`${c}(와|과) `, 'g'), '다른 곳과 ')
      // 남은 단독 토큰
      .replace(new RegExp(c, 'g'), '다른 곳');
  });
}

// ── 1) 열거형/특수 문장 먼저 정확 치환 ──
const specific = [
  // 대구 바밤바: "한국관도, 호박도 아닌 곳을 찾는다면 여기다." + 시나리오
  ['daegu-babamba-night', '한국관도, 호박도 아닌 곳을 찾는다면 여기다.', '정통 나이트도 시스템형도 아닌, 색다른 곳을 찾는다면 여기다.'],
  ['daegu-babamba-night', '한국관 호박 말고 — 제3의 선택', '정통도 시스템도 말고 — 제3의 선택'],
  // 대구 토토가: "한국관은 전통, 호박은 시스템, 바밤바는 개성."
  ['daegu-totoga-night', '한국관은 전통, 호박은 시스템, 바밤바는 개성.', '대구토토가나이트는 개성으로 승부하는 또 하나의 선택지다.'],
  // 광주 MGM: "상무가 전통, 토토밤이 매칭, 첨단이 젊음이라면, MGM은 화려함이다."
  ['gwangju-mgm-night', '상무가 전통, 토토밤이 매칭, 첨단이 젊음이라면, MGM은 화려함이다.', '광주MGM나이트는 화려함으로 승부하는 곳이다.'],
  // 광주 올: "상무, 토토밤, 첨단, MGM에 이어 다섯 번째 선택지다."
  ['gwangju-all-night', '상무, 토토밤, 첨단, MGM에 이어 다섯 번째 선택지다.', '광주에서 또 하나의 새로운 선택지다.'],
];
for (const [id, find, repl] of specific) {
  const r = blockRange(id);
  if (!r) continue;
  const [s, e] = r;
  const block = src.slice(s, e).replace(find, repl);
  src = src.slice(0, s) + block + src.slice(e);
}

// ── 2) 표준 비교문 제거 (block-scoped) ──
const generic = [
  ['nowon-star-night', '호박'],
  ['ilsan-mul-night', '샴푸'],
  ['gimpo-sseom-night', '호박'],
  ['suwon-korea-night', '찬스돔'],
  ['seongnam-shampoo-night', '국빈관'],
  ['bucheon-gorae-night', '메리트'],
  ['ansan-dontellmama-night', '히트'],
  ['cheonan-korea-night', '스타돔'],
  ['cheongju-hobak-night', '돈텔마마'],
  ['daegu-hobak-night', '한국관'],
  ['ulsan-champion-night', '뉴월드'],
  // 남은 토큰 정리 (열거형 처리 후 잔여)
  ['daegu-babamba-night', '한국관'],
  ['daegu-babamba-night', '호박'],
  ['daegu-totoga-night', '한국관'],
  ['daegu-totoga-night', '호박'],
  ['daegu-totoga-night', '바밤바'],
  ['gwangju-mgm-night', '토토밤'],
  ['gwangju-all-night', '토토밤'],
  ['gwangju-all-night', 'MGM'],
];
for (const [id, comp] of generic) genericComp(id, comp);

fs.writeFileSync(FILE, src);
console.log('교차오염 제거 완료:', generic.length, '패스 +', specific.length, '특수문장');
