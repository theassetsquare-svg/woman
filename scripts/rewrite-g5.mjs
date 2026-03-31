import { readFileSync, writeFileSync } from 'fs';

let src = readFileSync('src/data/venueContent.ts', 'utf8');

function replaceVenue(source, venueId, newBlock) {
  const marker = `'${venueId}':`;
  const idx = source.indexOf(marker);
  if (idx === -1) { console.log('NOT FOUND: ' + venueId); return source; }

  let braceStart = source.indexOf('{', idx);
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    if (depth === 0) {
      return source.slice(0, idx) + `'${venueId}': ` + newBlock + source.slice(i + 1);
    }
  }
  return source;
}

// ============================================================
// 1. daejeon-eclipse — 하오체 (archaic polite ~하오/~되오/~하시오)
//    Keyword: "대전호빠 이클립스" exactly 3 times
//    Unique vocab: 좌정, 개관, 명부, 격식, 별실
// ============================================================
const daejeonEclipse = `{
  summary: [
    '소재: 둔산동 982, 대전 서구 중심.',
    '개관 시각: 밤 9시, 폐관: 새벽 5시.',
    '별실 12석 — 충청권 유일 격식 좌석.',
    '대전 내 경쟁 부재, 단독 1위 좌정.',
    '세종·청주 편도 50분 내 접근 권역.',
    '명부 등재 시 별실 우선 배정되오.',
  ],
  intro: \`대전호빠 이클립스는 둔산동 982에 좌정한 충청 유일의 격식 공간이오. 개관 12주년을 맞아 별실 좌석과 명부 체계를 갖추었으니, 충청권 어디에서든 발걸음할 만하오.\`,
  sections: [
    {
      title: '좌정 위치와 접근',
      body: \`둔산동 중심가 좌정. 택시 8분, 세종 35분, 청주 50분 내 도달되오.\`,
    },
    {
      title: '별실 격식 좌석 배치',
      body: \`별실 12석, 간격 1.8m 확보. 명부 사전 등재자에겐 우선 배정하오.\`,
    },
    {
      title: '대전호빠 이클립스 명부 등재 절차',
      body: \`유선 한 통으로 명부에 기입되오. 금토 별실은 당일 오후 6시 전 등재 필수.\`,
    },
    {
      title: '개관 후 시간별 현황',
      body: \`개관 직후 한산, 22시 반부터 격식 좌석 채워지오. 주중은 여유롭소.\`,
    },
  ],
  quickPlan: {
    decision: '명부 등재 후 별실 좌정이 최선이오.',
    scenarios: [
      '세종 원정 — 편도 35분, 별실 좌정 권장',
      '주중 첫 내방 — 화수 22시 전 개관 직후',
      '금토 격식 모임 — 오후 6시 전 명부 등재 필수',
    ],
    costNote: '명부 등재 시 유선 문의하시오.',
  },
  faq: [
    { q: '별실 좌석 수는?', a: '12석이오' },
    { q: '명부 등재법은?', a: '유선 기입' },
    { q: '세종서 오래 걸리오?', a: '35분 소요' },
    { q: '개관 시각은?', a: '밤 9시' },
    { q: '카드 수납되오?', a: '수납 가하오' },
    { q: '주차 가하오?', a: '공영 2곳 도보 3분' },
  ],
  conclusion: \`대전호빠 이클립스 — 둔산동 좌정, 충청 단독 1위. 명부 한 줄이면 별실 격식 좌석이 열리오.\`,
}`;

// ============================================================
// 2. daejeon-tombar — 청유체 (~하자/~보자/~가자)
//    Keyword: "대전호빠 톰바" exactly 4 times
//    Unique vocab: 캠퍼스, 학구, 동아리, 축제, 원정
// ============================================================
const daejeonTombar = `{
  summary: [
    '위치: 봉명동 547-1, 유성구 학구 밀집지.',
    '카이스트·충남대 캠퍼스 도보권.',
    '개점: 밤 9시, 마감: 새벽 5시.',
    '동아리 뒤풀이 연계 코스로 인기.',
    '축제철 봉명동 원정 수요 급증.',
    '유선 뒤 출발하자 — 좌석 한정.',
  ],
  intro: \`대전호빠 톰바, 봉명동 547-1 캠퍼스 골목으로 가 보자. 카이스트와 충남대 사이 학구 상권 한복판, 동아리 뒤풀이 코스에서 빠지지 않는 곳이니 함께 가 보자.\`,
  sections: [
    {
      title: '캠퍼스 골목 학구 입지',
      body: \`봉명동 547-1, 두 캠퍼스 사이 학구 상권 중심. 축제 끝나고 걸어가자.\`,
    },
    {
      title: '동아리 뒤풀이 코스',
      body: \`대전호빠 톰바 주변 식당가에서 밥 먹고 골목 따라 이동하자. 원정 없이 완결.\`,
    },
    {
      title: '축제철 원정 수요',
      body: \`충남대·카이스트 축제 시즌엔 타 도시 원정 유입 폭증. 사전 유선 필수.\`,
    },
    {
      title: '좌석 확보 요령',
      body: \`대전호빠 톰바 좌석 한정이니 유선 먼저 넣자. 주말은 오후부터 마감.\`,
    },
  ],
  quickPlan: {
    decision: '캠퍼스 근처라면 걸어가자.',
    scenarios: [
      '동아리 모임 후 — 봉명동 식당 거쳐 도보 이동',
      '축제 마무리 — 원정 동반 수용, 유선 선행',
      '주중 소모임 — 화수목 저녁 여유롭게 출발하자',
    ],
    costNote: '유선 뒤 결제 수단 맞춰 보자.',
  },
  faq: [
    { q: '봉명동 몇 번지?', a: '547-1' },
    { q: '캠퍼스서 걸어갈까?', a: '도보 수용' },
    { q: '축제 때 빈자리?', a: '유선 필수' },
    { q: '동아리 단체 되나?', a: '사전 조율' },
    { q: '몇 시에 열어?', a: '밤 9시 개점' },
    { q: '카드 쓸 수 있나?', a: '유선 뒤 확정' },
  ],
  conclusion: \`대전호빠 톰바 — 봉명동 캠퍼스 학구 골목, 동아리 뒤풀이와 축제 원정의 마무리. 유선 한 통 넣고 가자.\`,
}`;

// ============================================================
// 3. gwangju-w — 비유체 (~ㄴ 셈이다/~ㄴ 격이다/~와 같다)
//    Keyword: "광주호빠 W" exactly 5 times
//    Unique vocab: 단독, 지표, 원점, 축, 거점
// ============================================================
const gwangjuW = `{
  summary: [
    '소재: 상무번영로 53, 상무지구 거점.',
    '개점: 밤 9시 30분, 폐점: 새벽 5시.',
    '광주 단독 — 호남권 유일한 축.',
    '상무지구가 곧 원점인 셈.',
    '10시 반 이후 열기 지표 급상승.',
    '1인 내방도 자연스러운 격.',
  ],
  intro: \`광주호빠 W는 상무번영로 53에 자리한 호남의 단독 거점과 같다. 광주호빠 W를 기준 원점으로 놓으면 호남권 전체 지표가 이 한 곳으로 수렴하는 셈.\`,
  sections: [
    {
      title: '상무지구 거점 축',
      body: \`상무번영로 53 — 광주호빠 W가 곧 호남 밤문화 축인 격이다.\`,
    },
    {
      title: '단독 지표로서의 위상',
      body: \`경쟁처 부재, 광주호빠 W 단독 지표. 비교 원점 자체가 없는 셈.\`,
    },
    {
      title: '열기 지표 변동',
      body: \`10시 반 전후 무드 전환. 11시엔 피크 지표 도달과 같다.\`,
    },
    {
      title: '1인 내방 구조',
      body: \`혼자 와도 스태프 선제 배석. 거점 특유의 자연스러운 흐름과 같다.\`,
    },
  ],
  quickPlan: {
    decision: '상무지구 원점에서 출발하면 도보 거점 도달인 셈.',
    scenarios: [
      '식사 후 도보 — 상무 식당가에서 걸어가는 격',
      '단독 내방 — 1인도 자연스러운 거점 구조',
      '주말 피크 — 토요 11시, 유선 선행 필수인 셈',
    ],
    costNote: '유선 뒤 세부 지표 파악하는 격.',
  },
  faq: [
    { q: '상무지구 몇 번지?', a: '번영로 53' },
    { q: '호남 단독 맞나?', a: '유일한 축' },
    { q: '몇 시 개점?', a: '밤 9시 반' },
    { q: '혼자 가도 되나?', a: '자연스러운 격' },
    { q: '카드 수납?', a: '수납 가한 셈' },
    { q: '주차 어디서?', a: '인근 거점 주차장' },
  ],
  conclusion: \`광주호빠 W — 상무지구 거점, 호남 단독 축. 원점을 이 한 곳에 놓으면 다른 지표는 불필요한 셈.\`,
}`;

// ============================================================
// 4. changwon-avengers — 공문체 (~바람/~요망/~완료)
//    Keyword: "창원호빠 어벤져스" exactly 3 times
//    Unique vocab: 담당관, 배속, 편제, 지정석, 통보
// ============================================================
const changwonAvengers = `{
  summary: [
    '소재: 마디미로37번길 12, 상남동.',
    '담당관 1인 전담 배속 편제 적용.',
    '개점: 21시, 폐점: 05시.',
    '지정석 배정 후 담당관 통보 완료.',
    '경남 3구(창원·마산·진해) 30분 내.',
    '유선 선행 후 지정석 확보 요망.',
  ],
  intro: \`창원호빠 어벤져스, 마디미로37번길 12 상남동 소재. 담당관 1인 전담 배속 편제로 작동하며, 지정석 사전 통보 시 즉각 배정 완료.\`,
  sections: [
    {
      title: '담당관 배속 편제',
      body: \`입장 전 담당관 면담 5분. 성향 파악 후 편제 배속 통보 완료.\`,
    },
    {
      title: '지정석 배정 절차',
      body: \`유선 통보 → 담당관 세팅 → 지정석 확정. 사전 통보 시 대기 없음.\`,
    },
    {
      title: '경남 3구 접근 경로',
      body: \`마산 12분, 진해 20분, 성산 15분. 경남 전역 30분 내 도달 요망.\`,
    },
    {
      title: '창원호빠 어벤져스 단체 편제',
      body: \`4인 이상 단체 시 복수 담당관 배속. 유선 사전 통보 요망.\`,
    },
  ],
  quickPlan: {
    decision: '유선 통보 선행 후 지정석 확보 요망.',
    scenarios: [
      '출장 접대 — 담당관 사전 배속 통보',
      '단체 4인 — 복수 편제 지정석 배정',
      '1인 내방 — 담당관 전담 배속 완료',
    ],
    costNote: '담당관 유선 통보 시 세부 내역 전달 완료.',
  },
  faq: [
    { q: '담당관 배속이란?', a: '1인 전담 편제' },
    { q: '지정석 확보법?', a: '유선 통보' },
    { q: '마산서 몇 분?', a: '12분 소요' },
    { q: '단체 편제 되나?', a: '복수 배속 완료' },
    { q: '카드 수납?', a: '수납 완료' },
    { q: '개점 시각은?', a: '21시' },
  ],
  conclusion: \`창원호빠 어벤져스 — 상남동 소재, 담당관 전담 배속 편제. 지정석 유선 통보 한 건이면 배정 완료.\`,
}`;

// Apply replacements
src = replaceVenue(src, 'daejeon-eclipse', daejeonEclipse);
src = replaceVenue(src, 'daejeon-tombar', daejeonTombar);
src = replaceVenue(src, 'gwangju-w', gwangjuW);
src = replaceVenue(src, 'changwon-avengers', changwonAvengers);

writeFileSync('src/data/venueContent.ts', src);
console.log('Group 5 rewrite complete.');

// ============================================================
// Verification: keyword counts and banned word checks
// ============================================================
function countOccurrences(text, keyword) {
  let count = 0;
  let pos = 0;
  while ((pos = text.indexOf(keyword, pos)) !== -1) {
    count++;
    pos += keyword.length;
  }
  return count;
}

const banned = ['방문', '가능', '확인', '운영', '분위기', '전화', '가게', '선수', '호스트', '손님', '고객', '서비스', '시스템', '프리미엄', '경험', '체험', '이용', '안내', '예약', '추천'];
const bannedEndings = ['합니다', '됩니다', '있습니다', '없습니다', '입니다'];

const venues = [
  { id: 'daejeon-eclipse', keyword: '대전호빠 이클립스', target: 3, block: daejeonEclipse },
  { id: 'daejeon-tombar', keyword: '대전호빠 톰바', target: 4, block: daejeonTombar },
  { id: 'gwangju-w', keyword: '광주호빠 W', target: 5, block: gwangjuW },
  { id: 'changwon-avengers', keyword: '창원호빠 어벤져스', target: 3, block: changwonAvengers },
];

console.log('\n=== VERIFICATION ===');
for (const v of venues) {
  const kc = countOccurrences(v.block, v.keyword);
  console.log(`\n[${v.id}] keyword "${v.keyword}": ${kc} (target: ${v.target}) ${kc === v.target ? 'OK' : 'MISMATCH!'}`);

  // Check banned words
  for (const bw of banned) {
    const bc = countOccurrences(v.block, bw);
    if (bc > 0) console.log(`  BANNED "${bw}": ${bc} occurrences!`);
  }

  // Check banned endings
  for (const be of bannedEndings) {
    const ec = countOccurrences(v.block, be);
    if (ec > 0) console.log(`  BANNED ENDING "${be}": ${ec} occurrences!`);
  }

  // Check word repetition (5+ times)
  const korean = v.block.match(/[가-힣]+/g) || [];
  const freq = {};
  for (const w of korean) {
    if (w.length >= 2) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  for (const [word, count] of Object.entries(freq)) {
    if (count >= 5) {
      console.log(`  REPEAT 5+ "${word}": ${count} times`);
    }
  }

  // Character count
  console.log(`  Total chars: ${v.block.length}`);
}
