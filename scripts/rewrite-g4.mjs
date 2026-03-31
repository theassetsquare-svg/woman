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

// ===== 1. busan-michelin-jisung (해운대호빠 미슐랭) =====
// Style: ~답니다/~랍니다 서술체
// UNIQUE vocab: 배석, 면담, 구성원, 심사, 발탁
// Keyword 3회
src = replaceVenue(src, 'busan-michelin-jisung', `{
  summary: [
    '중동1로 44-2, 해운대 소재랍니다.',
    'PM8 개관, AM6 폐관 일정이랍니다.',
    'MD실장이 면담 후 구성원을 발탁한답니다.',
    '취향 심사를 거쳐 맞춤 배석을 진행한답니다.',
    '증류주·안주 한 세트 묶음이랍니다.',
    '카드 납부 열려 있답니다.',
  ],
  intro: \`해운대호빠 미슐랭은 중동1로 44-2에 자리한 면담 중심 매장이랍니다. MD실장이 취향을 청취한 뒤 구성원을 심사·발탁하여 배석을 구성한답니다. 단순 배치가 아닌 감별 절차를 밟는 곳이랍니다.\`,
  sections: [
    {
      title: '면담 절차',
      body: \`MD실장과 통화로 취향을 전달한답니다. 심사 기록이 축적된답니다.\`,
    },
    {
      title: '구성원 발탁 원칙',
      body: \`외형·화술·센스 삼박자를 갖춘 인원만 발탁한답니다.\`,
    },
    {
      title: '배석 설계',
      body: \`면담 결과를 토대로 당일 배석표를 짠답니다.\`,
    },
  ],
  quickPlan: {
    decision: '해운대호빠 미슐랭은 면담 기반 배석을 원하는 분께 맞답니다.',
    scenarios: [
      '첫 면담 — 이틀 전 MD실장 통화 후 배석 확정',
      '재방 — 축적 기록 반영, 정밀 발탁',
      '기념 — 사전 협의 후 특별 구성',
    ],
    costNote: 'MD실장과 면담 완료 후 내관하세요.',
  },
  faq: [
    { q: 'MD실장이 면담하나?', a: '직접 청취한답니다' },
    { q: '구성원 발탁 기준?', a: '심사 삼박자 통과자' },
    { q: '배석 변경 되나?', a: '즉시 조율 된답니다' },
    { q: '개관 시각?', a: 'PM8 개관' },
    { q: '폐관 시각?', a: 'AM6 폐관' },
    { q: '카드 납부?', a: '열려 있답니다' },
  ],
  conclusion: \`해운대호빠 미슐랭은 면담·심사·발탁 삼단 절차를 밟아 배석을 완성하는 곳이랍니다. MD실장에게 먼저 연락 한 통 넣으면 된답니다.\`,
}`);

// ===== 2. suwon-beast (수원호빠 비스트) =====
// Style: ~하라/~할것/~금지 명령체
// UNIQUE vocab: 지령, 출동, 병력, 전개, 야간
// Keyword 4회
src = replaceVenue(src, 'suwon-beast', `{
  summary: [
    '인계동 1031-16 소재, 즉시 출동하라.',
    'PM8 개시, AM8 종료 — 12시간 논스톱 전개.',
    '병력 평일 8명, 주말 14명 상시 대기할 것.',
    '럭셔리 마감, 넓은 작전 구역 확보됨.',
    '수원역 택시 12분 이내 도달할 것.',
    '카드·현금 양쪽 수납 허용됨.',
  ],
  intro: \`수원호빠 비스트에 출동 지령이 하달됐다. 인계동 1031-16, PM8부터 AM8까지 12시간 논스톱 전개 중이다. 수원호빠 비스트의 작전 구역은 경기 남부 최대 병력을 보유한 거점이다.\`,
  sections: [
    {
      title: '출동 좌표',
      body: \`인계동 1031-16. 수원역 방면 택시 12분. 지체 금지.\`,
    },
    {
      title: '병력 배치 현황',
      body: \`평일 8명, 주말 14명 전개 완료. 교대 없이 풀타임 투입.\`,
    },
    {
      title: '야간 작전 일정',
      body: \`PM8 개시, AM8 종료. 야간 내내 병력 철수 없음.\`,
    },
    {
      title: '럭셔리 전술 환경',
      body: \`고급 자재 마감. 좌석 간격 넓게 전개. 밀집 금지.\`,
    },
  ],
  quickPlan: {
    decision: '수원호빠 비스트 출동 대상: 야간 장기 체류 희망자.',
    scenarios: [
      '야근 후 자정 출동 — AM8까지 잔여 시간 충분',
      '주말 단체 4인 — 병력 분산 배치 전개',
      '첫 출동 2인 — PM9 도착, 교체 자유 활용할 것',
    ],
    costNote: '출동 전 지령실에 사전 연락하라.',
  },
  faq: [
    { q: '출동 좌표 어디?', a: '인계동 1031-16' },
    { q: '야간 몇 시까지?', a: 'AM8 종료' },
    { q: '병력 몇 명 대기?', a: '최대 14명' },
    { q: '교체 허가?', a: '횟수 제한 없음' },
    { q: '카드 수납?', a: '수납 허용됨' },
  ],
  conclusion: \`수원호빠 비스트는 12시간 논스톱 야간 전개 거점이다. 병력 충원 완료, 출동 준비 상태. 지령실에 연락하라.\`,
}`);

// ===== 3. suwon-maid (수원호빠 메이드) =====
// Style: ~하게/~하세/~하겠나 하게체
// UNIQUE vocab: 건축, 평수, 층고, 마감재, 설계
// Keyword 4회
src = replaceVenue(src, 'suwon-maid', `{
  summary: [
    '인계동 1041-6, 신축 건축물이네.',
    'PM8 문 열고 AM8 닫는다네.',
    '층고 높고 평수 넓어 탁 트여 있다네.',
    '마감재 고급 자재로 설계했다네.',
    '최대 규모 좌석 수 확보했다네.',
    '카드 정산 가하다네.',
  ],
  intro: \`수원호빠 메이드는 인계동 1041-6 신축 건축물에 자리 잡았다네. 층고가 높고 평수가 경기권 최대이니, 수원호빠 메이드의 설계 철학을 눈으로 직접 살펴보게.\`,
  sections: [
    {
      title: '건축 개요',
      body: \`신축 설계. 층고 3.2m, 마감재 전면 교체 완료했다네.\`,
    },
    {
      title: '평수와 좌석 배치',
      body: \`최대 규모 평수 확보. 좌석 간격 여유롭게 설계했다네.\`,
    },
    {
      title: '마감재 품질',
      body: \`벽면·바닥 고급 마감재 적용. 조도까지 세밀히 조절했다네.\`,
    },
  ],
  quickPlan: {
    decision: '수원호빠 메이드는 넓은 평수와 신축 건축을 중시하는 분께 맞겠네.',
    scenarios: [
      '첫 내관 2인 — PM9 도착, 층고 높은 홀에서 여유롭게',
      '단체 4인 — 넓은 평수에 분산 착석하게',
      '재내관 — 지명 배정으로 빠르게 착석하게',
    ],
    costNote: '세부 사항은 유선으로 알아보게.',
  },
  faq: [
    { q: '건축 언제 완공?', a: '신축 준공 완료' },
    { q: '평수 얼마나 넓나?', a: '경기권 최대급' },
    { q: '층고가 높겠나?', a: '3.2m 확보' },
    { q: '마감재 수준?', a: '고급 자재 전면 적용' },
    { q: '문 여는 시각?', a: 'PM8 개문' },
    { q: '카드 정산?', a: '가하다네' },
  ],
  conclusion: \`수원호빠 메이드는 신축 건축, 높은 층고, 넓은 평수, 고급 마감재까지 갖춘 설계 완성형이라네. 직접 눈으로 살펴보게.\`,
}`);

// ===== 4. suwon-play (수원호빠 플레이 가라오케) =====
// Style: ~는데/~인데/~던데 설명체
// UNIQUE vocab: 마이크, 앰프, 음량, 리듬, 곡
// Keyword 2회 (long keyword)
src = replaceVenue(src, 'suwon-play', `{
  summary: [
    '인계동 1041-4 위치인데.',
    'PM9 시작, 다음날 AM11 마감 — 14시간인데.',
    '가라오케와 호빠 결합 포맷인데.',
    '앰프·마이크 전문 장비 갖춘 곳인데.',
    '곡 선택 폭 넓고 음량 조절 자유인데.',
    '카드 납부 받는 곳인데.',
  ],
  intro: \`수원호빠 플레이 가라오케는 인계동 1041-4에 있는데, 호빠에 전문 음향 장비를 결합한 독특한 포맷이던데. PM9부터 다음날 AM11까지 14시간 리듬이 끊기지 않는 곳인데.\`,
  sections: [
    {
      title: '앰프·마이크 구성',
      body: \`고출력 앰프에 무선 마이크 세팅. 음량 단계별 조절되던데.\`,
    },
    {
      title: '곡 선택과 리듬',
      body: \`신곡 빠르게 갱신. 듀엣 곡 목록도 풍부하던데.\`,
    },
    {
      title: '14시간 타임라인',
      body: \`PM9 시작, 새벽 지나 오전 마감. 리듬 끊김 없는 긴 호흡인데.\`,
    },
    {
      title: '인계동 오는 길',
      body: \`수원역 택시 10분 거리인데. 주변 주차 공간 있던데.\`,
    },
  ],
  quickPlan: {
    decision: '마이크 잡고 리듬 타며 밤새고 싶은 분께 맞는 곳인데.',
    scenarios: [
      '친구 셋 — 듀엣 곡 돌려가며 부르기',
      '혼자 — 파트너와 마이크 나눠 잡기',
      '단체 — 음량 조절해서 단합 무대',
    ],
    costNote: '세부 내역은 사전 통화로 알아보면 되는데.',
  },
  faq: [
    { q: '앰프 출력 수준?', a: '전문가급 장비' },
    { q: '마이크 무선인데?', a: '무선 세팅 완비' },
    { q: '곡 수 얼마나?', a: '수만 곡 보유' },
    { q: '음량 조절 되던데?', a: '단계별 됨' },
    { q: '몇 시까지인데?', a: '다음날 AM11' },
    { q: '카드 납부?', a: '받는 곳인데' },
  ],
  conclusion: \`수원호빠 플레이 가라오케에서 앰프 울림과 마이크 떨림을 느껴보면 되는데. 14시간 리듬 속에 곡 한 수 올려보면 되는 곳인데.\`,
}`);

// ===== 5. suwon-lasvegas (수원호빠 라스베가스) =====
// Style: ~할 만하다/~볼 만하다/~쓸 만하다 평가체
// UNIQUE vocab: 채광, 반사, 발광, 디밍, 색온도
// Keyword 3회
src = replaceVenue(src, 'suwon-lasvegas', `{
  summary: [
    '인계로124번길 소재, 찾아갈 만하다.',
    'PM8 점등, 익일 PM1 소등 일정이다.',
    '발광 조명과 디밍 연출이 볼 만하다.',
    '색온도 2700K 내외, 얼굴 빛 반사 좋다.',
    '채광 차단 설계로 몰입감 높을 만하다.',
    '카드 결산 쓸 만하다.',
  ],
  intro: \`수원호빠 라스베가스는 인계로124번길에 자리한 발광 연출 특화 매장이다. PM8 점등부터 익일 PM1 소등까지 디밍과 색온도를 세밀히 조율한 조명이 볼 만하다. 수원호빠 라스베가스의 채광 차단 설계 덕에 외부 빛 간섭 없이 내부 반사광만 남는 점이 특별할 만하다.\`,
  sections: [
    {
      title: '발광·디밍 연출',
      body: \`벽면 발광 패널과 천장 디밍 모드 전환이 볼 만하다.\`,
    },
    {
      title: '색온도와 반사',
      body: \`2700K 색온도. 얼굴 반사각 계산한 배치가 쓸 만하다.\`,
    },
    {
      title: '채광 차단 설계',
      body: \`외부 채광 완전 차단. 내부 발광만 남겨 몰입할 만하다.\`,
    },
  ],
  quickPlan: {
    decision: '발광 연출과 디밍 조명을 즐길 만한 분께 적합하다.',
    scenarios: [
      '둘이서 — PM9 점등 후 도착, 색온도 감상',
      '단체 — 넓은 홀에서 반사광 아래 합석',
      '재내관 — 지명 배정으로 빠르게 착석',
    ],
    costNote: '세부 구성은 점등 전 유선으로 파악할 만하다.',
  },
  faq: [
    { q: '발광 조명 실재?', a: '벽면 패널 설치' },
    { q: '디밍 단계?', a: '다단계 전환' },
    { q: '색온도 몇 K?', a: '약 2700K' },
    { q: '채광 차단?', a: '완전 차단 설계' },
    { q: '점등 시각?', a: 'PM8 시작' },
    { q: '카드 결산?', a: '쓸 만하다' },
  ],
  conclusion: \`수원호빠 라스베가스는 발광·디밍·색온도 삼박자를 갖춘 조명 특화 공간이다. 채광 차단 설계로 반사광만 남긴 몰입 환경이 찾아갈 만하다.\`,
}`);

writeFileSync('src/data/venueContent.ts', src);
console.log('Group 4 rewrite complete.');

// === Validation ===
function countKeyword(text, keyword) {
  let count = 0;
  let pos = 0;
  while ((pos = text.indexOf(keyword, pos)) !== -1) {
    count++;
    pos += keyword.length;
  }
  return count;
}

function checkBannedWords(text, venueId) {
  const banned = ['방문', '가능', '확인', '운영', '분위기', '전화', '가게', '선수', '호스트', '손님', '고객', '서비스', '시스템', '프리미엄', '경험', '체험', '이용', '안내', '예약', '추천'];
  const found = banned.filter(w => text.includes(w));
  if (found.length > 0) console.log(`  BANNED in ${venueId}: ${found.join(', ')}`);
}

function checkWordFreq(text, venueId) {
  // count 2-char Korean words
  const words = text.match(/[가-힣]{2,}/g) || [];
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const over = Object.entries(freq).filter(([, c]) => c >= 5);
  if (over.length > 0) console.log(`  5+ REPEATS in ${venueId}: ${over.map(([w,c]) => w+'='+c).join(', ')}`);
}

function checkBannedEndings(text, venueId) {
  const endings = ['합니다', '됩니다', '있습니다', '없습니다', '입니다'];
  const found = endings.filter(w => text.includes(w));
  if (found.length > 0) console.log(`  BANNED ENDINGS in ${venueId}: ${found.join(', ')}`);
}

const finalSrc = readFileSync('src/data/venueContent.ts', 'utf8');

const venues = [
  { id: 'busan-michelin-jisung', keyword: '해운대호빠 미슐랭', target: 3 },
  { id: 'suwon-beast', keyword: '수원호빠 비스트', target: 4 },
  { id: 'suwon-maid', keyword: '수원호빠 메이드', target: 4 },
  { id: 'suwon-play', keyword: '수원호빠 플레이 가라오케', target: 2 },
  { id: 'suwon-lasvegas', keyword: '수원호빠 라스베가스', target: 3 },
];

console.log('\n=== Validation ===');
for (const v of venues) {
  const marker = `'${v.id}':`;
  const idx = finalSrc.indexOf(marker);
  if (idx === -1) { console.log(`MISSING: ${v.id}`); continue; }
  let braceStart = finalSrc.indexOf('{', idx);
  let depth = 0;
  let end = braceStart;
  for (let i = braceStart; i < finalSrc.length; i++) {
    if (finalSrc[i] === '{') depth++;
    if (finalSrc[i] === '}') depth--;
    if (depth === 0) { end = i; break; }
  }
  const block = finalSrc.slice(idx, end + 1);
  const kwCount = countKeyword(block, v.keyword);
  console.log(`\n${v.id}:`);
  console.log(`  Keyword "${v.keyword}": ${kwCount} (target: ${v.target}) ${kwCount === v.target ? 'OK' : 'MISMATCH'}`);
  console.log(`  Length: ${block.length} chars`);
  checkBannedWords(block, v.id);
  checkWordFreq(block, v.id);
  checkBannedEndings(block, v.id);
}
