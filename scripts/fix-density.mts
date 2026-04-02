/**
 * Fix keyword density for all venue pages → 1.5-2.5%
 * Strategy:
 * 1. Remove keyword from body text (keep only 1st in intro)
 * 2. Calculate exact padding needed
 * 3. Expand intro with category-specific natural text
 */
import { venues, getVenueLabel } from '../src/data/venues.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentPath = join(__dirname, '..', 'src/data/venueContent.ts');

// Read the ORIGINAL file (before any modifications)
let src = readFileSync(contentPath, 'utf-8');

function getKw(v: typeof venues[0]) { return getVenueLabel(v); }
function getSubKw(v: typeof venues[0]) {
  const a = v.seoArea;
  const m: Record<string, string> = { club: '클럽', lounge: '라운지', room: '룸', yojeong: '요정', hoppa: '호빠' };
  return `${a} ${m[v.category || 'night'] || '나이트'}`;
}

function countKw(text: string, kw: string): number {
  let c = 0, p = 0;
  while ((p = text.indexOf(kw, p)) !== -1) { c++; p += kw.length; }
  return c;
}

function buildPageText(v: typeof venues[0], contentText: string): string {
  const label = getKw(v);
  return [
    `홈 ${v.area} ${v.name}`, label, v.area,
    v.contact ? `${v.contact} 실장` : '', v.card_hook,
    `${label} 상세 정보`, v.description, v.tags.join(' '),
    `${label} 핵심 요약`, `${getSubKw(v)} 이용 가이드`,
    contentText, `30초 플랜`, `${label} FAQ`, `${getSubKw(v)} 방문 전 확인`,
  ].join(' ');
}

function extractBlock(id: string): { block: string; start: number; end: number } | null {
  const marker = `'${id}': {`;
  const si = src.indexOf(marker);
  if (si === -1) return null;
  let depth = 0, i = src.indexOf('{', si);
  const start = i;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    if (src[i] === '}') depth--;
    if (depth === 0) break;
  }
  return { block: src.slice(start, i + 1), start, end: i + 1 };
}

function extractText(block: string): string {
  const texts: string[] = [];
  const m1 = block.match(/summary:\s*\[([\s\S]*?)\]/);
  if (m1) { const items = m1[1].match(/'([^']*)'/g); if (items) items.forEach(s => texts.push(s.replace(/'/g, ''))); }
  const m2 = block.match(/intro:\s*`([\s\S]*?)`/);
  if (m2) texts.push(m2[1]);
  const r1 = /title:\s*'([^']*)',\s*body:\s*`([\s\S]*?)`/g;
  let m; while ((m = r1.exec(block)) !== null) { texts.push(m[1]); texts.push(m[2]); }
  const m3 = block.match(/decision:\s*'([^']*)'/);
  if (m3) texts.push(m3[1]);
  const m4 = block.match(/scenarios:\s*\[([\s\S]*?)\]/);
  if (m4) { const r = /'([^']+)'/g; let s; while ((s = r.exec(m4[1])) !== null) texts.push(s[1]); }
  const m5 = block.match(/costNote:\s*'([^']*)'/);
  if (m5) texts.push(m5[1]);
  const r2 = /q:\s*'([^']*)',\s*a:\s*'([^']*)'/g;
  while ((m = r2.exec(block)) !== null) { texts.push(m[1]); texts.push(m[2]); }
  const m6 = block.match(/conclusion:\s*`([\s\S]*?)`/);
  if (m6) texts.push(m6[1]);
  return texts.join(' ');
}

function removeKw(text: string, kw: string, keepFirst: boolean): string {
  const reps: [string, string][] = [
    [kw + '에서 확인할 수 있다', '이곳에서 확인할 수 있다'],
    [kw + '에서 확인해 보자', '이곳에서 확인해 보자'],
    [kw + '에서 느낄 수 있다', '이곳에서 느낄 수 있다'],
    [kw + '에서 경험할 수 있다', '이곳에서 경험할 수 있다'],
    [kw + '을(를) 찾고 있다면', '이런 곳을 찾고 있다면'],
    [kw + '을 찾고 있다면', '이런 곳을 찾고 있다면'],
    [kw + '를 찾고 있다면', '이런 곳을 찾고 있다면'],
    [kw + '을 고를 때', '이곳을 선택할 때'],
    [kw + '에서의 밤', '이곳에서의 밤'],
    [kw + '에서의 경험', '이곳에서의 경험'],
    [kw + ' 경험자', '이곳 경험자'],
    [kw + '만의 ', '이곳만의 '],
    [kw + '에서 ', '이곳에서 '],
    [kw + '의 ', '이곳의 '],
    [kw + '은 ', '이곳은 '],
    [kw + '는 ', '이곳은 '],
    [kw + '이 ', '이곳이 '],
    [kw + '가 ', '이곳이 '],
    [kw + '을 ', '이곳을 '],
    [kw + '를 ', '이곳을 '],
    [kw + '도 ', '이곳도 '],
    [kw + '. ', ''],
    [kw + ', ', ''],
    [kw, '이곳'],
  ];
  if (keepFirst) {
    const idx = text.indexOf(kw);
    if (idx === -1) return text;
    const before = text.slice(0, idx + kw.length);
    let after = text.slice(idx + kw.length);
    for (const [f, t] of reps) { while (after.includes(f)) after = after.replace(f, t); }
    return before + after;
  }
  let result = text;
  for (const [f, t] of reps) { while (result.includes(f)) result = result.replace(f, t); }
  return result;
}

// --- Padding pool: long, varied paragraphs by category ---
// Each ~200-350 chars. Will be concatenated as needed.
const padPool: Record<string, string[]> = {
  night: [
    '무대 위 조명이 바뀌는 순간부터 공기가 달라진다. 스피커에서 나오는 베이스라인이 가슴을 누르고, 플로어에 서 있는 사람들의 움직임이 하나로 맞아떨어지는 타이밍이 있다. 사진으로는 절대 전달되지 않는 현장의 밀도가 있다. 방문 전 영업시간과 테이블 상황을 전화로 미리 잡아두면 도착 후 어수선한 시간 없이 바로 분위기에 올라탈 수 있다.',
    '처음 가는 곳이라면 주말보다 평일 밤을 먼저 경험해보는 게 좋다. 사람이 적어서가 아니라, 공간 자체의 소리와 분위기를 온전히 느낄 수 있기 때문이다. 주말에는 인파와 에너지가 폭발하면서 전혀 다른 경험이 된다. 그 차이를 아는 사람은 요일별로 다른 즐길거리를 찾아온다. 단골이 되는 순간은 보통 그렇게 시작된다.',
    '입구를 지나는 순간 바깥 세계와 완전히 분리된다. 조명의 농도, 음악의 볼륨, 사람들의 에너지가 만드는 현장감은 온라인 리뷰보다 1분의 직접 경험이 낫다. 첫 방문이라면 일행과 함께 가는 게 부담이 적고, 혼자 와도 분위기에 자연스럽게 스며들 수 있다. 바에서 음료 하나 시키고 플로어를 바라보는 것만으로도 그날 밤의 분위기를 읽을 수 있다.',
    '새벽 두 시가 넘어서야 진짜 분위기가 올라온다고 말하는 사람이 있고, 열한 시 타임이 가장 좋다고 주장하는 사람도 있다. 정답은 없다. 다만 시간대별로 플로어 위의 에너지가 확연히 다르다는 건 공통된 경험이다. 처음이라면 한 번은 끝까지 남아봐야 그 흐름을 알 수 있다. 나와서 새벽 공기를 맞으면 그게 왜 습관이 되는지 이해하게 된다.',
    '조명이 바뀌는 순간 사람들의 표정도 바뀐다. 밝은 시간대에는 가볍게 대화하고, 자정이 지나면 모두가 무대에 집중한다. DJ의 선곡이 분위기를 쥐락펴락하는데, 한 트랙이 전환되는 순간의 함성은 현장에서만 느낄 수 있다. 바 앞에서 칵테일 하나 들고 사람들을 관찰하는 것도 이곳에서만 가능한 즐거움이다.',
    '테이블을 잡느냐 스탠딩으로 가느냐에 따라 밤의 성격이 완전히 달라진다. 테이블은 대화 중심, 스탠딩은 분위기 중심이다. 첫 방문이라면 둘 다 경험해보는 게 좋다. 같은 공간에서 위치만 바꿔도 체감이 확 달라진다. 예약은 금토 기준 최소 3일 전에 하는 것이 안전하다.',
    '음악의 장르와 볼륨이 시간대별로 변하는 곳이 있고, 처음부터 끝까지 일관된 스타일을 유지하는 곳이 있다. 어떤 쪽이 맞는지는 가봐야 안다. 리뷰만으로는 그 공간의 음향 특성을 판단하기 어렵다. 스피커 배치와 방음 구조, 천장 높이가 만드는 소리 울림은 현장에서 귀로 직접 확인하는 수밖에 없다.',
    '함께 온 일행의 분위기에 따라 자리 배치를 요청할 수 있는 곳이 많다. 사전에 전화로 인원과 분위기를 알려주면 적합한 구역으로 안내받을 수 있다. 현장에서 자리를 바꾸는 것보다 처음부터 맞는 위치에 앉는 게 훨씬 편하다. 소규모 그룹이면 벽쪽 부스, 대그룹이면 플로어 근처가 보통 좋다.',
  ],
  club: [
    'DJ가 트랙을 전환하는 순간 플로어의 공기가 바뀐다. 스피커에서 쏟아지는 비트가 몸을 먼저 반응하게 만들고, LED와 레이저가 시야를 채운다. 그 몰입감은 화면으로 절대 전달되지 않는다. 첫 방문이라면 오픈 직후보다 피크 시간에 맞춰 가야 그 공간이 왜 유명한지 이해할 수 있다. 입장 전 드레스코드와 예약 여부를 확인하면 대기 시간 없이 바로 진입 가능하다.',
    '클럽은 음악으로 고르는 거다. EDM, 힙합, 하우스 중 어떤 장르를 선호하느냐에 따라 같은 동네에서도 완전히 다른 밤이 된다. 사운드 시스템의 차이는 입장하는 순간 귀가 알려준다. 저음이 가슴을 때리는 곳이 있고, 중고음이 깔끔하게 퍼지는 곳이 있다. 그 차이를 비교하려면 최소 두 곳은 가봐야 한다.',
    '파티는 예열이 필요하다. 오픈 시간에 도착하면 한산한 플로어에 실망할 수 있지만, 자정이 지나면 같은 공간이 전혀 다른 에너지로 가득 찬다. 바에서 음료 하나 들고 플로어 옆에 서서 분위기를 읽는 시간이 있어야 밤이 완성된다. 테이블을 잡을지 스탠딩으로 즐길지는 인원과 취향에 따라 달라진다.',
    '음악이 멈추는 순간은 오지 않는다. 한 트랙이 끝나면 다음 트랙이 이어지고, 조명의 색이 바뀌면서 분위기가 새로운 국면에 들어간다. 그 전환의 순간들이 쌓여서 하나의 밤이 완성된다. 혼자 와도 음악 앞에서는 모두 같은 리듬이다. 사전에 그날의 DJ 라인업을 확인하고 가면 기대치를 정확히 맞출 수 있다.',
    '입장 심사가 있는 곳이라면 미리 드레스코드를 확인하는 게 시간을 아끼는 방법이다. 운동화와 슬리퍼는 대부분 불가하고, 스마트 캐주얼 이상이면 무난하다. 예약 없이 워크인으로 가면 대기 시간이 길어질 수 있으니 인스타그램이나 전화로 사전 확인하는 편이 좋다.',
    '같은 클럽이라도 금요일과 토요일의 분위기가 다르다. 금요일은 직장인 위주로 비교적 여유 있고, 토요일은 인파가 폭발하면서 에너지가 최고조에 이른다. 일요 새벽까지 이어지는 애프터 파티가 있는 곳도 있으니 스케줄을 미리 확인하면 좋다.',
    '바 카운터에서 시그니처 칵테일 하나를 시키고 DJ 부스 방향으로 서 있으면 그 공간의 음향 특성을 파악하기 가장 좋다. 저음이 어느 정도인지, 고음이 찢어지지 않는지, 대화가 가능한 볼륨인지를 한 곡 안에 판단할 수 있다. 마음에 들면 그때 플로어로 내려가도 늦지 않다.',
    '테이블 예약은 그룹 방문의 기본이다. 서서 즐기는 스탠딩도 좋지만 짐을 놓을 곳, 음료를 올릴 곳이 있느냐 없느냐의 차이는 밤이 길어질수록 크다. 4인 이상이면 테이블을 잡는 게 합리적이고, 2인이면 바 카운터가 오히려 분위기에 더 가깝다.',
  ],
  room: [
    '문을 닫는 순간부터 바깥과 완전히 분리된 공간이 시작된다. 조명의 밝기부터 음악의 볼륨까지 직접 조절할 수 있어서 자리의 성격에 맞춰 분위기를 만들 수 있다. 접대든 모임이든, 공간이 반은 해결한다. 사전에 인원과 목적을 전달하면 그에 맞는 룸과 세팅이 준비된다. 현장에서 즉흥적으로 결정하는 것보다 계획된 방문이 훨씬 만족도가 높다.',
    '같은 건물 안에서도 룸마다 분위기가 다르다. 넓이, 조명, 음향, 좌석 배치가 각기 다르게 설계되어 있어서 방문할 때마다 다른 룸을 경험해보는 재미가 있다. 단골이 되면 선호하는 룸을 지정할 수 있다는 것도 장점이다. 처음이라면 실장에게 모임 성격을 설명하고 추천을 받는 게 가장 효율적이다.',
    '프라이빗한 자리에서 중요한 대화를 나누거나 소규모 모임을 가질 때, 공간의 차단성이 핵심이다. 벽면의 방음 수준과 독립된 입구 구조가 외부 간섭을 차단한다. 편안한 좌석과 적절한 조명이 모임의 분위기를 만들어준다. 실장에게 미리 세팅을 요청하면 도착 시 바로 자리에 앉을 수 있다.',
    '룸의 크기는 인원에 맞춰 선택하는 게 좋다. 너무 넓으면 오히려 허전하고, 너무 좁으면 답답하다. 4~6인 기준 중형 룸이 가장 무난하며, 대규모라면 사전에 연결 가능 여부를 확인하면 된다. 좌석 배치도 원형, 일자, 분리형 등 선택지가 있는 곳이 많다.',
  ],
  yojeong: [
    '요정 문화는 단순한 식사 자리가 아니다. 한식의 격과 전통 접객이 어우러져 하나의 경험을 만들어낸다. 코스 요리가 나오는 동안 대화가 자연스럽게 이어지고, 공간의 분위기가 자리의 무게를 더해준다. 사전 예약이 필수이며, 인원과 예산을 미리 전달하면 그에 맞는 코스와 공간이 준비된다. 중요한 자리일수록 사전 소통의 밀도가 결과를 좌우한다.',
    '코스 요리 하나하나에 계절이 담긴다. 식재료의 선택부터 담음새까지 눈으로 먼저 감상하고, 맛으로 마무리하는 구조다. 서빙의 타이밍도 대화의 흐름에 맞춰 조절되기 때문에 자리가 끊기지 않는다. 처음이라면 코스를 맡기고 분위기에 집중하는 것을 추천한다.',
    '전통 공간에서의 모임은 현대식 다이닝과 질감이 다르다. 좌식인지 입식인지에 따라 분위기가 달라지고, 병풍과 장지문이 만드는 공간의 깊이가 있다. 비즈니스 접대에서 개인 모임까지, 자리의 목적에 맞는 코스와 세팅을 사전에 협의하면 완성도가 훨씬 올라간다.',
  ],
  hoppa: [
    '처음 방문하는 경우 분위기에 긴장할 수 있지만, 도착하면 안내가 먼저 시작되기 때문에 어색한 시간은 길지 않다. 호스트 선택부터 진행 방식까지 설명을 들을 수 있고, 불편한 점은 바로 전달하면 된다. 자리의 성격에 따라 분위기가 달라지니, 방문 전에 전화로 어떤 스타일을 원하는지 미리 이야기해두면 만족도가 높아진다.',
    '분위기를 만드는 건 공간이 아니라 사람이다. 호스트의 매너와 대화 능력이 그날 밤의 질을 결정한다. 좋은 호스트는 상대의 템포에 맞춰 대화를 이끌고, 적당한 거리감을 유지하면서도 분위기를 놓치지 않는다. 첫 방문이라면 실장에게 선호 스타일을 전달하면 맞춤 추천을 받을 수 있다. 재방문율이 높은 이유가 바로 이 부분이다.',
    '시간대별로 분위기가 바뀐다. 초반에는 가벼운 대화와 소개가 중심이고, 시간이 지나면서 노래와 게임이 섞이며 자연스럽게 분위기가 올라간다. 마무리 시간은 유연하게 조율 가능한 곳이 많다. 부담 없이 시작하고 싶다면 평일 저녁 시간대를 추천한다.',
    '여성 고객이 주 타겟인 만큼 안전과 편의에 대한 배려가 기본이다. 대부분의 업소가 CCTV와 비상벨을 갖추고 있고, 불편한 상황이 생기면 실장이 즉시 개입한다. 교통편이 확보된 위치에 있는 곳이 많아 늦은 귀가도 부담이 적다.',
  ],
  lounge: [
    '라운지는 볼륨이 아니라 분위기로 승부하는 공간이다. 조명의 농도가 낮고 음악이 대화를 덮지 않아서, 편하게 이야기를 나누면서도 밤의 감성을 유지할 수 있다. 주류의 품질과 서빙의 속도가 다른 업종 대비 확실히 높은 편이며, 소규모 프라이빗 모임에 가장 적합하다. 사전 예약 시 선호 좌석을 요청할 수 있고, 분위기에 맞는 음악도 조율 가능하다.',
    '시끄럽지 않아서 좋다. 음악은 깔리되 대화가 메인이 되는 구조다. 카페보다 어둡고 클럽보다 조용한, 그 사이의 공간을 찾는 사람에게 맞는 곳이다. 안주의 퀄리티가 높아서 식사 겸 방문하는 사람도 있고, 2차로 넘어오는 사람도 많다. 공간의 크기가 작아서 예약 없이 방문하면 자리가 없을 수 있다.',
    '라운지의 매력은 공간의 밀도에 있다. 넓은 곳보다 좁은 곳이 분위기가 좋은 이유는, 가까이 앉은 사람들의 대화 소리와 음악이 자연스럽게 섞이면서 독특한 공기가 만들어지기 때문이다. 좌석 간 거리가 적절히 유지되면서도 고립되지 않는 그 미묘한 균형이 좋은 라운지의 조건이다.',
    '위스키, 와인, 시그니처 칵테일 중 어떤 걸 좋아하는지에 따라 추천받을 수 있는 라운지가 달라진다. 바텐더와 대화를 나눌 수 있는 바 카운터석이 있는 곳이라면, 혼자 와도 자연스럽게 시간을 보낼 수 있다. 주류 라인업은 방문 전 전화나 인스타그램으로 확인하는 것이 좋다.',
  ],
};

// Process all venues
const report: { id: string; name: string; chars: number; count: number; density: string; status: string }[] = [];

for (let vi = 0; vi < venues.length; vi++) {
  const v = venues[vi];
  const kw = getKw(v);
  const ext = extractBlock(v.id);
  if (!ext) continue;
  let newBlock = ext.block;

  // --- Step 1: Remove keyword from all content except 1st in intro ---
  // Intro: keep first
  const introMatch = newBlock.match(/intro:\s*`([\s\S]*?)`/);
  if (introMatch && introMatch[1].includes(kw)) {
    newBlock = newBlock.replace(introMatch[0], `intro: \`${removeKw(introMatch[1], kw, true)}\``);
  }
  // Sections body: remove all
  const secBodyRegex = /body:\s*`([\s\S]*?)`/g;
  let secM;
  const secReps: [string, string][] = [];
  while ((secM = secBodyRegex.exec(newBlock)) !== null) {
    if (secM[1].includes(kw)) secReps.push([secM[0], `body: \`${removeKw(secM[1], kw, false)}\``]);
  }
  for (const [o, n] of secReps) newBlock = newBlock.replace(o, n);
  // Conclusion: remove all
  const conMatch = newBlock.match(/conclusion:\s*`([\s\S]*?)`/);
  if (conMatch && conMatch[1].includes(kw)) {
    newBlock = newBlock.replace(conMatch[0], `conclusion: \`${removeKw(conMatch[1], kw, false)}\``);
  }
  // Summary: remove
  const sumMatch = newBlock.match(/summary:\s*\[([\s\S]*?)\]/);
  if (sumMatch && sumMatch[1].includes(kw)) {
    newBlock = newBlock.replace(sumMatch[0], `summary: [${removeKw(sumMatch[1], kw, false)}]`);
  }
  // FAQ answers: remove
  const faqR = /a:\s*'([^']*)'/g;
  let faqM;
  const faqReps: [string, string][] = [];
  while ((faqM = faqR.exec(newBlock)) !== null) {
    if (faqM[1].includes(kw)) faqReps.push([faqM[0], `a: '${removeKw(faqM[1], kw, false)}'`]);
  }
  for (const [o, n] of faqReps) newBlock = newBlock.replace(o, n);
  // Decision
  const decM = newBlock.match(/decision:\s*'([^']*)'/);
  if (decM && decM[1].includes(kw)) {
    newBlock = newBlock.replace(decM[0], `decision: '${removeKw(decM[1], kw, false)}'`);
  }

  // --- Step 2: Calculate density ---
  let contentText = extractText(newBlock);
  let pageText = buildPageText(v, contentText);
  let totalChars = pageText.length;
  let kwCount = countKw(pageText, kw);
  let density = (kwCount * kw.length) / totalChars * 100;

  // --- Step 3: If over 2.5%, expand content by appending to intro ---
  if (density > 2.5) {
    const cat = v.category || 'night';
    const pool = padPool[cat] || padPool.night;
    // Also mix in night pool for variety when cat pool is small
    const mixPool = cat !== 'night' ? [...pool, ...padPool.night] : pool;
    const targetChars = Math.ceil(kwCount * kw.length / 0.020) + 100; // aim for ~2.0% with buffer
    let needed = targetChars - totalChars;

    // Collect padding paragraphs
    let padIdx = vi % mixPool.length;
    let padText = '';
    let rounds = 0;
    while (needed > 0 && rounds < 15) {
      const p = mixPool[padIdx % mixPool.length];
      padText += '\n\n' + p;
      needed -= p.length;
      padIdx++;
      rounds++;
    }

    if (padText) {
      // Append to intro (before closing backtick)
      const introRe = newBlock.match(/intro:\s*`([\s\S]*?)`/);
      if (introRe) {
        const expandedIntro = introRe[1] + padText;
        newBlock = newBlock.replace(introRe[0], `intro: \`${expandedIntro}\``);
      }

      // Recalculate
      contentText = extractText(newBlock);
      pageText = buildPageText(v, contentText);
      totalChars = pageText.length;
      kwCount = countKw(pageText, kw);
      density = (kwCount * kw.length) / totalChars * 100;
    }
  }

  // --- Step 4: If under 1.5%, too much padding (rare). Check ---
  let status = 'OK';
  if (density < 1.5) status = 'LOW';
  else if (density > 2.5) status = 'OVER';

  report.push({ id: v.id, name: kw, chars: totalChars, count: kwCount, density: density.toFixed(2), status });

  // Apply to source
  src = src.slice(0, ext.start) + newBlock + src.slice(ext.end);
}

// Write
writeFileSync(contentPath, src, 'utf-8');

// Report
console.log('page | name | chars | count | density% | status');
console.log('---|---|---|---|---|---');
for (const r of report) console.log(`${r.id} | ${r.name} | ${r.chars} | ${r.count} | ${r.density}% | ${r.status}`);

const ok = report.filter(r => r.status === 'OK').length;
const low = report.filter(r => r.status === 'LOW').length;
const over = report.filter(r => r.status === 'OVER').length;
console.log(`\n--- SUMMARY ---`);
console.log(`OK (1.5-2.5%): ${ok}`);
console.log(`LOW (<1.5%): ${low}`);
console.log(`OVER (>2.5%): ${over}`);
console.log(`Total: ${report.length}`);
if (low > 0 || over > 0) {
  console.log(`\n--- NEEDS FIX ---`);
  for (const r of report) if (r.status !== 'OK') console.log(`${r.status}: ${r.name} (${r.density}%, count=${r.count}, chars=${r.chars})`);
}
