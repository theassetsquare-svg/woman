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

// ===== 1. gangnam-i: ~에요/~이에요 체 (polite informal) =====
src = replaceVenue(src, 'gangnam-i', `{
  summary: [
    '역삼동 소재, 조선호텔 인근 골목이에요.',
    '17년째 같은 자리를 지키고 있어요.',
    '오후 8시 문 열고 새벽 6시에 닫아요.',
    '완전 사전 연락제로만 받아요.',
    'VIP 전담 배정이 기본이에요.',
    '소수 정예 멤버만 두고 있어요.',
  ],
  intro: \`강남호빠 아이(I)는 역삼동 조선호텔 인근 골목에 자리 잡은 곳이에요. 17년 동안 단 한 번도 위치를 옮기지 않았어요. 완전 사전 연락제라서 당일 워크인은 어려워요.\`,
  sections: [
    {
      title: '전담 배정 절차',
      body: \`연락 주시면 담당자가 먼저 붙어요. 인원·취향 파악 후 VIP 전담 멤버를 골라 드려요.\`,
    },
    {
      title: '시간대별 특징',
      body: \`강남호빠 아이(I) 저녁 8시~10시 한산해요. 자정 이후 조용하고 깊은 대화 나누기 좋아요.\`,
    },
    {
      title: '역삼동 오시는 길',
      body: \`역삼역 3번 출구, 조선호텔 방면 도보 7분이에요. 외관 간판 작으니 미리 물어봐 주세요.\`,
    },
  ],
  quickPlan: {
    decision: '강남호빠 아이(I)는 특별한 날 소규모 2~3인 모임에 잘 맞아요.',
    scenarios: [
      '기념일 2인 — 이틀 전 연락, 맞춤 세팅',
      '소모임 3인 — 일주일 전 통화, 별도 좌석',
      '단독 내방 — 사전 상담 후 1:1 배정',
    ],
    costNote: '통화 시 담당자가 구성을 알려 드려요.',
  },
  faq: [
    { q: '당일 입장 돼요?', a: '사전 연락 필수예요.' },
    { q: '복장 기준?', a: '스마트캐주얼 이상.' },
    { q: '주차 되나요?', a: '인근 유료 주차장.' },
    { q: '몇 시가 좋아요?', a: '밤 10시 전후.' },
    { q: '1인 괜찮아요?', a: '네, 단독 배정해요.' },
    { q: '카드 쓸 수 있어요?', a: '카드·현금 둘 다요.' },
  ],
  conclusion: \`강남호빠 아이(I)는 17년 한자리, 완전 사전 연락제, VIP 전담 배정 — 이 세 줄로 요약돼요. 특별한 밤이 필요하다면 먼저 한 통 걸어 보세요.\`,
}`);

// ===== 2. gangnam-flirting: ~다/~한다 체 (plain declarative, 반말) =====
src = replaceVenue(src, 'gangnam-flirting', `{
  summary: [
    '강남대로 320, 신논현역 근처다.',
    'PM9 개시, AM5 종료다.',
    '무한초이스 — 교체 횟수 상한 없다.',
    '착석 후 스태프가 먼저 의향 묻는다.',
    '20대 후반~30대 초반 여성 내방 많다.',
    '교체 자유, 추가 청구 없다.',
  ],
  intro: \`강남호빠 플러팅, 강남대로 320번지. 무한초이스가 이 점포 정체성이다. 맞지 않으면 바로 바꾼다. 상한 따위 없다.\`,
  sections: [
    {
      title: '무한초이스 작동 원리',
      body: \`강남호빠 플러팅 무한초이스: 착석 → 첫 인원 합류 → 10분 뒤 스태프 의향 점검 → 교체 자유. 눈치 볼 것 없다.\`,
    },
    {
      title: '기본 세트 내역',
      body: \`음료·안주 포함. 양주 등급 올리면 차액만 붙는다. 세부 항목은 내방 전 문의한다.\`,
    },
    {
      title: '금토 vs 주초 차이',
      body: \`금토 자정은 밀도 최고, 대기 짧다. 수목 저녁은 한산하고 선택 폭 넓다.\`,
    },
    {
      title: '오는 길',
      body: \`강남역·신논현역 양쪽 도보 5~7분. 대로변이라 택시 승하차 간편하다.\`,
    },
  ],
  quickPlan: {
    decision: '강남호빠 플러팅은 다양한 상대 만나보려는 2~4인에게 맞다.',
    scenarios: [
      '친구 셋 수요일 — 10시 워크인, 무한초이스 활용',
      '둘이 금요일 — 10시 내방, 2~3시간 느긋히',
      '혼자 목요일 — 9시 반 착석, 취향 탐색',
    ],
    costNote: '세트 외 업그레이드 선택 시만 추가 금액 발생한다.',
  },
  faq: [
    { q: '교체 진짜 무한?', a: '상한 없다.' },
    { q: '워크인 되나?', a: '주초 OK, 주말 연락 권장.' },
    { q: '세트에 뭐 들어가?', a: '음료·안주 포함.' },
    { q: '적정 인원?', a: '2~3명 최적.' },
    { q: '남성 입장?', a: '불허.' },
    { q: '복장 규정?', a: '깔끔한 외출복이면 된다.' },
  ],
  conclusion: \`강남호빠 플러팅 — 무한초이스, 교체 자유, 강남대로 320. 부담 없이 여러 사람 만나볼 밤이라면 여기가 답이다.\`,
}`);

// ===== 3. gangnam-blackhole: English-Korean hybrid =====
src = replaceVenue(src, 'gangnam-blackhole', `{
  summary: [
    'Location: 역삼동 832-7, new open spot.',
    'Open PM8, close AM6, daily schedule.',
    'Again team DNA 계승한 crew 포진.',
    'Dark tone wall + neon light design.',
    'Whisky or wine set 기본 package.',
    'Member change unlimited, no extra charge.',
  ],
  intro: \`강남호빠 블랙홀 — 역삼동 832-7에 new open. Again team의 DNA를 물려받은 crew가 floor를 채운다. Dark wall과 neon line이 space 전체의 tone을 잡는다.\`,
  sections: [
    {
      title: 'Again DNA Crew',
      body: \`강남호빠 블랙홀 crew는 대화 lead 능력 검증 완료. 침묵 전에 topic 전환, pace 조율 탁월.\`,
    },
    {
      title: 'Dark Tone Interior',
      body: \`무광 black wall, neon accent light. 얼굴 natural하게 보이면서 과한 밝기 zero.\`,
    },
    {
      title: 'Sound Design',
      body: \`Hip-hop track과 jazz가 time zone별 cross. 대화 volume 방해 없는 level 유지.\`,
    },
    {
      title: 'Access Route',
      body: \`역삼역 3번 exit, 직진 7min. Map app에 번지 입력하면 정확히 guide 됨.\`,
    },
  ],
  quickPlan: {
    decision: '강남호빠 블랙홀은 감각 중시 2~3인 group에 best match.',
    scenarios: [
      '금요일 둘 — PM10 check-in, neon 아래 2.5hr',
      '직장 동료 셋 — PM11 walk-in, hip-hop beat 배경 2hr',
      '단독 탐방 — 평일 PM9, tone check 90min',
    ],
    costNote: '내방 전 call로 당일 seat 여건 check 필수.',
  },
  faq: [
    { q: 'Again과 관계?', a: 'DNA 계승, 별도 open.' },
    { q: 'Basic set 구성?', a: 'Whisky or wine + snack.' },
    { q: 'Walk-in OK?', a: '평일 OK, weekend 연락 권장.' },
    { q: '역삼역 거리?', a: '3번 exit 도보 7min.' },
    { q: 'Member 교체?', a: 'Unlimited, free.' },
    { q: 'Payment method?', a: 'Card·cash both OK.' },
  ],
  conclusion: \`강남호빠 블랙홀 — dark tone space, again DNA crew, neon light atmosphere. 역삼동 832-7에서 new chapter가 열린다.\`,
}`);

// ===== 4. geondae-wclub: ~ㅁ/~임/~됨/~함 축약체 =====
src = replaceVenue(src, 'geondae-wclub', `{
  summary: [
    '동일로 166, 건대입구역 도보 3분임.',
    '10년째 같은 번지 유지 중임.',
    'PM9 개점, AM5 마감임.',
    '20후반~30대 직장인 단체 입장 많음.',
    '종업원 자체 심사 통과자만 배치됨.',
    '정찰제, 기본 음료·안주 세팅 포함됨.',
  ],
  intro: \`건대호빠 W클럽. 동일로 166, 건대입구역 2번출구 도보 3분임. 10년 동일 번지 유지함. 동서울 최장수 홀임.\`,
  sections: [
    {
      title: '10년 유지 배경',
      body: \`건대호빠 W클럽 홀 관리 기준 일정함. 종업원 자체 심사 통과자만 배치됨. 단골 피드백 즉각 반영함.\`,
    },
    {
      title: '홀 구조',
      body: \`4~6인 테이블 기본 배치됨. 좌석 간격 넓음. 인접 테이블 간섭 최소화됨.\`,
    },
    {
      title: '단체 입장 절차',
      body: \`4인 이상 단체 시 홀 우선 배정됨. 일괄 결제 됨. 인원 미리 알려주면 준비 완료됨.\`,
    },
  ],
  quickPlan: {
    decision: '건대호빠 W클럽은 건국대·성수·광진권 20~30대 단체에 최적임.',
    scenarios: [
      '직장 동료 4인 — 금요 PM10:30 등록, 홀 단체석 배정',
      '친구 2인 축하 — 목요 PM10 입장, 종업원 배정',
      '즉흥 내방 — 평일 PM9 워크인, 주말은 사전 등록 권장',
    ],
    costNote: '인원 미리 알려주면 홀 좌석 배정 원활함. 세부 세팅은 문의 후 조회.',
  },
  faq: [
    { q: '기본 세팅 뭐 포함?', a: '음료·안주 포함됨.' },
    { q: '건대역서 몇 분?', a: '2번출구 도보 3분임.' },
    { q: '주말 워크인?', a: '대기 발생할 수 있음, 사전 연락 권장.' },
    { q: '종업원 교체 추가금?', a: '없음.' },
    { q: '영업 시간?', a: 'PM9~AM5임.' },
    { q: '1인 입장?', a: '됨.' },
  ],
  conclusion: \`건대호빠 W클럽 — 10년 동일 번지, 종업원 심사제, 정찰제. 동서울에서 검증된 홀임. 출입 전 연락해서 좌석 확보하면 됨.\`,
}`);

// ===== 5. jangan-bini: ~지/~죠 확인체 (confirmative) =====
src = replaceVenue(src, 'jangan-bini', `{
  summary: [
    '장안동 367에 자리 잡고 있지요.',
    'PM9부터 AM5까지 열어 두지요.',
    '10년 실장이 직접 배정하지요.',
    '칸막이 룸 중심 구조라 조용하지요.',
    '성북·중랑·광진서 택시 15분이지요.',
    '위스키 세트 정찰제로 나가지요.',
  ],
  intro: \`장안동호빠, 장안동 367번지에 있지요. 강북에서 따로 멀리 나갈 필요 없지요. 10년 실장이 룸 배정부터 마무리까지 전부 챙기지요.\`,
  sections: [
    {
      title: '실장 배정 흐름',
      body: \`들어오시면 실장이 바로 파악하지요. 동행 구성 보고 맞는 쪽으로 붙여 드리죠.\`,
    },
    {
      title: '칸막이 룸 특성',
      body: \`전 좌석 칸막이 분리되어 있지요. 옆 소리 안 새어 나오죠. 1인도 별도 룸 받지요.\`,
    },
    {
      title: '위스키 세트 내용',
      body: \`위스키 한 병에 안주가 딸려 나오지요. 얼음·탄산 기본이죠. 상위 등급 택하면 차액만 더 붙지요.\`,
    },
    {
      title: '찾아오는 길',
      body: \`장안동호빠 근처 버스 노선 다양하지요. 성북·중랑·광진서 택시비 기본료 권역이죠.\`,
    },
  ],
  quickPlan: {
    decision: '장안동호빠는 강북권 1~3인, 룸 중심 배정 원하는 분께 딱 맞지요.',
    scenarios: [
      '친구 둘 월·화 — PM9:30 도착, 칸막이 룸 2시간',
      '혼자 금요 — PM10 도착, 1인 룸 90분',
      '소모임 셋 주말 — 사전 통화 후 실장 맞춤 배정',
    ],
    costNote: '도착 전 한 통 넣으면 당일 위스키 라인업 바로 알려 주지요.',
  },
  faq: [
    { q: '기본 세트 뭐 나오죠?', a: '위스키·안주 세트.' },
    { q: '대중교통 되죠?', a: '버스 정류장 가깝지요.' },
    { q: '당일 바로 가도 되죠?', a: '월화 OK, 주말 연락 먼저.' },
    { q: '혼자 괜찮죠?', a: '1인 룸 배정하지요.' },
    { q: '교체 요청 되죠?', a: '실장에게 말씀하면 되죠.' },
    { q: '장안동호빠 마감 시간?', a: 'AM5까지이지요.' },
  ],
  conclusion: \`장안동호빠 — 강북 장안동 367, 10년 실장 직접 배정, 칸막이 룸 중심. 멀리 나가지 않아도 되지요. 오늘 밤 한 통 넣어 보시죠.\`,
}`);

writeFileSync('src/data/venueContent.ts', src);
console.log('All 5 venues rewritten successfully.');

// === Verification: count keywords and check banned words ===
const venues = {
  'gangnam-i': { keyword: '강남호빠 아이(I)', target: 4 },
  'gangnam-flirting': { keyword: '강남호빠 플러팅', target: 4 },
  'gangnam-blackhole': { keyword: '강남호빠 블랙홀', target: 4 },
  'geondae-wclub': { keyword: '건대호빠 W클럽', target: 4 },
  'jangan-bini': { keyword: '장안동호빠', target: 5 },
};

const bannedWords = ['방문', '가능', '확인', '운영', '분위기', '전화', '가게', '선수', '호스트', '손님', '고객', '서비스', '시스템', '프리미엄', '경험', '체험', '이용', '안내', '예약', '추천'];

const updated = readFileSync('src/data/venueContent.ts', 'utf8');

for (const [id, info] of Object.entries(venues)) {
  const marker = `'${id}':`;
  const idx = updated.indexOf(marker);
  if (idx === -1) { console.log(`ERROR: ${id} not found`); continue; }

  let braceStart = updated.indexOf('{', idx);
  let depth = 0;
  let endIdx = braceStart;
  for (let i = braceStart; i < updated.length; i++) {
    if (updated[i] === '{') depth++;
    if (updated[i] === '}') depth--;
    if (depth === 0) { endIdx = i; break; }
  }
  const block = updated.slice(idx, endIdx + 1);

  // Count keyword
  const kwCount = (block.match(new RegExp(info.keyword.replace(/[()]/g, '\\$&'), 'g')) || []).length;
  console.log(`${id}: keyword "${info.keyword}" count = ${kwCount} (target: ${info.target}) ${kwCount === info.target ? 'OK' : 'MISMATCH!'}`);

  // Check banned words
  const foundBanned = bannedWords.filter(w => block.includes(w));
  if (foundBanned.length > 0) {
    console.log(`  BANNED WORDS FOUND: ${foundBanned.join(', ')}`);
  } else {
    console.log(`  No banned words. OK.`);
  }

  // Check word repetition (5+ times)
  const textOnly = block.replace(/[{}[\]`'",.:;!?\/\\()=>\n\r\t]/g, ' ');
  const words = textOnly.split(/\s+/).filter(w => w.length >= 2);
  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  const repeated = Object.entries(freq).filter(([, c]) => c >= 5).sort((a, b) => b[1] - a[1]);
  if (repeated.length > 0) {
    console.log(`  REPEATED 5+ times: ${repeated.map(([w, c]) => `${w}(${c})`).join(', ')}`);
  } else {
    console.log(`  No words repeated 5+ times. OK.`);
  }

  // Character count (excluding spaces)
  const charCount = block.replace(/\s/g, '').length;
  console.log(`  Character count (no spaces): ${charCount} ${charCount <= 1500 ? 'OK' : 'OVER LIMIT!'}`);
}
