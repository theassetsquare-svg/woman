/**
 * fix-all-issues.mjs
 * Fixes repeat words and reduces cosine similarity between same-region venues
 * by applying targeted text replacements in venueContent.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = resolve(__dirname, '..', 'src/data/venueContent.ts');
let content = readFileSync(filePath, 'utf-8');

// Helper: replace Nth occurrence of a pattern in a specific venue section
function replaceInVenue(venueId, oldText, newText, maxReplacements = 1) {
  // Find the venue section boundaries
  const startPattern = `'${venueId}': {`;
  const startIdx = content.indexOf(startPattern);
  if (startIdx === -1) { console.log(`  WARN: venue ${venueId} not found`); return 0; }

  // Find the next venue section or end
  let endIdx = content.length;
  const nextVenuePattern = /\n'[a-z]+-[a-z]/g;
  nextVenuePattern.lastIndex = startIdx + startPattern.length;
  const nextMatch = nextVenuePattern.exec(content);
  if (nextMatch) endIdx = nextMatch.index;

  let section = content.substring(startIdx, endIdx);
  let count = 0;

  // Replace from the END of the section (so later occurrences get replaced first)
  // This preserves important keyword occurrences in intro/title
  let lastIdx = section.length;
  while (count < maxReplacements) {
    const idx = section.lastIndexOf(oldText, lastIdx - 1);
    if (idx === -1) break;
    section = section.substring(0, idx) + newText + section.substring(idx + oldText.length);
    lastIdx = idx;
    count++;
  }

  content = content.substring(0, startIdx) + section + content.substring(endIdx);
  return count;
}

// Helper: replace from the start (first occurrences)
function replaceInVenueFromStart(venueId, oldText, newText, maxReplacements = 1) {
  const startPattern = `'${venueId}': {`;
  const startIdx = content.indexOf(startPattern);
  if (startIdx === -1) return 0;

  let endIdx = content.length;
  const nextVenuePattern = /\n'[a-z]+-[a-z]/g;
  nextVenuePattern.lastIndex = startIdx + startPattern.length;
  const nextMatch = nextVenuePattern.exec(content);
  if (nextMatch) endIdx = nextMatch.index;

  let section = content.substring(startIdx, endIdx);
  let count = 0;
  let searchFrom = 0;

  while (count < maxReplacements) {
    const idx = section.indexOf(oldText, searchFrom);
    if (idx === -1) break;
    section = section.substring(0, idx) + newText + section.substring(idx + oldText.length);
    searchFrom = idx + newText.length;
    count++;
  }

  content = content.substring(0, startIdx) + section + content.substring(endIdx);
  return count;
}

console.log('=== FIXING REPEAT WORDS ===\n');

// --- gangnam-i: "사전" 5→4 ---
let r;
r = replaceInVenue('gangnam-i', '사전 연락', '미리 연락', 1);
console.log(`gangnam-i: "사전" → replaced ${r}`);

// --- gangnam-flirting: "캐스트" 6→4, "플러팅진혁" 11→10 ---
r = replaceInVenue('gangnam-flirting', '캐스트', '호스트', 2);
console.log(`gangnam-flirting: "캐스트" → replaced ${r}`);
// For store name, replace one in the less important areas (faq/conclusion)
r = replaceInVenue('gangnam-flirting', '플러팅진혁', '이곳', 1);
console.log(`gangnam-flirting: "플러팅진혁" → replaced ${r}`);

// --- gangnam-blackhole: "블랙홀" 11→10, "사전" 5→4, "연락" 5→4 ---
r = replaceInVenue('gangnam-blackhole', '블랙홀', '이곳', 1);
console.log(`gangnam-blackhole: "블랙홀" → replaced ${r}`);
r = replaceInVenue('gangnam-blackhole', '사전 예약', '미리 예약', 1);
console.log(`gangnam-blackhole: "사전" → replaced ${r}`);
r = replaceInVenue('gangnam-blackhole', '사전 연락', '미리 연락', 1);
console.log(`gangnam-blackhole: "사전연락" → replaced ${r}`);
r = replaceInVenue('gangnam-blackhole', '연락 시', '전화 시', 1);
console.log(`gangnam-blackhole: "연락" → replaced ${r}`);

// --- geondae-wclub: "W클럽" 11→10 ---
r = replaceInVenue('geondae-wclub', 'W클럽', '이곳', 1);
console.log(`geondae-wclub: "W클럽" → replaced ${r}`);

// --- jangan-bini: "빈이" 11→10 ---
r = replaceInVenue('jangan-bini', '빈이', '이곳', 1);
console.log(`jangan-bini: "빈이" → replaced ${r}`);

// --- jangan-cube: "큐브" 12→10, "캐스트" 5→4 ---
r = replaceInVenue('jangan-cube', '큐브', '이곳', 2);
console.log(`jangan-cube: "큐브" → replaced ${r}`);
r = replaceInVenue('jangan-cube', '캐스트', '호스트', 1);
console.log(`jangan-cube: "캐스트" → replaced ${r}`);

// --- jangan-bbangbbang: "텐션" 6→4 ---
r = replaceInVenue('jangan-bbangbbang', '텐션', '활기', 1);
console.log(`jangan-bbangbbang: "텐션" 1 → replaced ${r}`);
r = replaceInVenue('jangan-bbangbbang', '텐션', '에너지', 1);
console.log(`jangan-bbangbbang: "텐션" 2 → replaced ${r}`);

// --- busan-michelin: "케어" 7→4, "사전" 5→4 ---
r = replaceInVenue('busan-michelin', '케어', '서비스', 2);
console.log(`busan-michelin: "케어" 1,2 → replaced ${r}`);
r = replaceInVenue('busan-michelin', '케어', '응대', 1);
console.log(`busan-michelin: "케어" 3 → replaced ${r}`);
r = replaceInVenue('busan-michelin', '사전 통화', '미리 통화', 1);
console.log(`busan-michelin: "사전" → replaced ${r}`);

// --- busan-q: "해안" 7→4, "바다" 6→4, "일정" 6→4, "내방" 5→4 ---
r = replaceInVenue('busan-q', '해안', '해변', 2);
console.log(`busan-q: "해안" 1,2 → replaced ${r}`);
r = replaceInVenue('busan-q', '해안', '바닷가', 1);
console.log(`busan-q: "해안" 3 → replaced ${r}`);
r = replaceInVenue('busan-q', '바다', '파도', 1);
console.log(`busan-q: "바다" 1 → replaced ${r}`);
r = replaceInVenue('busan-q', '바다', '수면', 1);
console.log(`busan-q: "바다" 2 → replaced ${r}`);
r = replaceInVenue('busan-q', '일정', '코스', 1);
console.log(`busan-q: "일정" 1 → replaced ${r}`);
r = replaceInVenue('busan-q', '일정', '동선', 1);
console.log(`busan-q: "일정" 2 → replaced ${r}`);
r = replaceInVenue('busan-q', '내방', '방문', 1);
console.log(`busan-q: "내방" → replaced ${r}`);

// --- busan-michelin-jisung: "MD" 10→4, "케어" 6→4 ---
r = replaceInVenue('busan-michelin-jisung', '전문 MD', '전문 매니저', 2);
console.log(`busan-michelin-jisung: "MD" 1,2 → replaced ${r}`);
r = replaceInVenue('busan-michelin-jisung', '담당 MD', '담당 매니저', 1);
console.log(`busan-michelin-jisung: "MD" 3 → replaced ${r}`);
r = replaceInVenue('busan-michelin-jisung', '전담 MD', '전담 실장', 1);
console.log(`busan-michelin-jisung: "MD" 4 → replaced ${r}`);
r = replaceInVenue('busan-michelin-jisung', 'MD가', '실장이', 1);
console.log(`busan-michelin-jisung: "MD" 5 → replaced ${r}`);
r = replaceInVenue('busan-michelin-jisung', 'MD에게', '담당자에게', 1);
console.log(`busan-michelin-jisung: "MD" 6 → replaced ${r}`);
r = replaceInVenue('busan-michelin-jisung', '개별 케어', '개별 응대', 1);
console.log(`busan-michelin-jisung: "케어" 1 → replaced ${r}`);
r = replaceInVenue('busan-michelin-jisung', '맞춤 케어', '맞춤 서비스', 1);
console.log(`busan-michelin-jisung: "케어" 2 → replaced ${r}`);

// --- suwon-beast: "규모" 5→4 ---
r = replaceInVenue('suwon-beast', '규모', '스케일', 1);
console.log(`suwon-beast: "규모" → replaced ${r}`);

// --- daejeon-tombar: "자연스러운" 5→4 ---
r = replaceInVenue('daejeon-tombar', '자연스러운', '편안한', 1);
console.log(`daejeon-tombar: "자연스러운" → replaced ${r}`);

// --- changwon-avengers: "지역" 5→4, "라인" 5→4 ---
r = replaceInVenue('changwon-avengers', '지역 지역', '인근 권역', 1);
console.log(`changwon-avengers: "지역 지역" → replaced ${r}`);
r = replaceInVenue('changwon-avengers', '라인', '타입', 1);
console.log(`changwon-avengers: "라인" → replaced ${r}`);

console.log('\n=== REDUCING COSINE SIMILARITY (same-region diversification) ===\n');

// ---- SUWON: diversify FAQ questions and section vocabulary ----

// suwon-beast: change FAQs to focus on SIZE and POWER
replaceInVenue('suwon-beast',
  '{ q: \'예약 없이 방문해도 되나요?\', a: \'주말은 사전 전화 확인을 권장합니다.\' }',
  '{ q: \'테이블을 미리 잡아둘 수 있나요?\', a: \'주말은 미리 전화로 좌석을 확보하는 게 좋습니다.\' }');
replaceInVenue('suwon-beast',
  '{ q: \'처음 가도 괜찮나요?\', a: \'활기찬 분위기라 첫 방문자도 어렵지 않습니다.\' }',
  '{ q: \'첫 체험인데 무엇부터 하면 되나요?\', a: \'입장하면 스태프가 시스템을 안내합니다. 걱정 없이 와도 됩니다.\' }');
console.log('suwon-beast: FAQ diversified');

// suwon-maid: add unique concept vocabulary
replaceInVenue('suwon-maid',
  '{ q: \'카드 결제 되나요?\', a: \'카드와 현금 둘 다 이용 가능합니다.\' }',
  '{ q: \'결제 방식은 어떻게 되나요?\', a: \'신용카드와 현금 모두 받습니다.\' }');
replaceInVenue('suwon-maid',
  '{ q: \'선수 교체가 가능한가요?\', a: \'네, 접수 가능합니다.\' }',
  '{ q: \'다른 호스트로 변경할 수 있나요?\', a: \'네, 직원에게 알려주면 바로 조율해 드립니다.\' }');
console.log('suwon-maid: FAQ diversified');

// suwon-play: focus on music/party vocabulary
replaceInVenue('suwon-play',
  '{ q: \'선수 교체가 되나요?\', a: \'편하게 바꿔 달라고 말씀하시면 됩니다.\' }',
  '{ q: \'호스트를 다른 사람으로 전환할 수 있나요?\', a: \'스태프에게 한마디만 하면 즉시 전환됩니다.\' }');
replaceInVenue('suwon-play',
  '{ q: \'카드 결제 가능한가요?\', a: \'네, 카드 사용할 수 있어요.\' }',
  '{ q: \'결제 수단을 알려주세요\', a: \'카드·현금 전부 가능합니다.\' }');
console.log('suwon-play: FAQ diversified');

// suwon-lasvegas: already has distinct review-style writing, diversify FAQs
replaceInVenue('suwon-lasvegas',
  '{ q: \'선수 교체 눈치 보이지 않나요?\', a: \'전혀요. 바꿔 달라고 말하면 바로 해줍니다.\' }',
  '{ q: \'호스트를 다른 분으로 바꿀 수 있나요?\', a: \'물론이에요. 자유롭게 전환 요청하세요.\' }');
console.log('suwon-lasvegas: FAQ diversified');

// ---- BUSAN: diversify between michelin/Q, W/theking, aura/menz, david/michelin-jisung ----

// busan-michelin: use luxury/elite vocabulary exclusively
replaceInVenue('busan-michelin',
  '기본 세트에 양주, 안주, 선수 배정 포함.',
  '프리미엄 양주·셰프 안주·에이스 배정이 한 번에 셋업.');
console.log('busan-michelin: vocabulary differentiated');

// busan-q: use beach/ocean vocabulary exclusively
replaceInVenue('busan-q',
  '기본 세트에 프리미엄 양주, 안주, 선수 배정 포함.',
  '해변 감성 양주와 간식 플레이트, 호스트 매칭 패키지.');
replaceInVenue('busan-q',
  '카드 결제 가능.',
  '카드 OK.');
console.log('busan-q: vocabulary differentiated');

// busan-w vs busan-theking: differentiate
replaceInVenue('busan-w',
  '{ q: \'사전 예약을 해야 하나요?\', a: \'워크인도 가능하지만, 주말은 예약하는 편이 안전합니다.\' }',
  '{ q: \'미리 전화해야 하나요?\', a: \'평일은 그냥 오셔도 됩니다. 금·토만 확인 후 오세요.\' }');
replaceInVenue('busan-theking',
  '{ q: \'교체가 가능한가요?\', a: \'횟수 상관없이 바꿀 수 있어요.\' }',
  '{ q: \'파트너를 전환할 수 있나요?\', a: \'물론이요. 원하시면 몇 번이든 전환 가능합니다.\' }');
console.log('busan-w/theking: FAQ differentiated');

// busan-aura vs busan-menz: diversify approach
replaceInVenue('busan-menz',
  '{ q: \'교체가 자유로운가요?\', a: \'횟수에 제한을 두지 않습니다.\' }',
  '{ q: \'호스트를 바꾸고 싶으면 어떻게 하나요?\', a: \'매니저에게 말씀하시면 바로 전환됩니다. 횟수 무관.\' }');
console.log('busan-aura/menz: differentiated');

// busan-david vs busan-michelin-jisung
replaceInVenue('busan-david',
  '{ q: \'결제 수단이 궁금해요\', a: \'카드 결제를 지원합니다.\' }',
  '{ q: \'어떻게 계산하나요?\', a: \'카드와 현금 모두 사용할 수 있습니다.\' }');
console.log('busan-david/michelin-jisung: differentiated');

// ---- JANGAN: diversify bini/cube/bbangbbang ----
// bini=private/expert, cube=scale/freedom, bbangbbang=energy/fun
// Already quite different, but fix shared FAQ patterns

replaceInVenue('jangan-bini',
  '{ q: \'혼자 방문해도 괜찮나요?',
  '{ q: \'1인 손님도 환영하나요?');
console.log('jangan-bini: FAQ diversified');

replaceInVenue('jangan-cube',
  '{ q: \'혼자 와도 어울릴 수 있나요?',
  '{ q: \'혼자서도 즐길 만한가요?');
console.log('jangan-cube: FAQ diversified');

// ---- GANGNAM: diversify i/blackhole ----
replaceInVenue('gangnam-blackhole',
  '{ q: \'선수를 바꿀 수 있나요?\', a: \'몇 번이든 교체 가능하니 편하게 요청하세요.\' }',
  '{ q: \'호스트 전환이 자유로운가요?\', a: \'원하시면 몇 번이든 가능합니다. 부담 없이 말씀하세요.\' }');
console.log('gangnam-i/blackhole: differentiated');

// ---- DAEJEON: diversify eclipse/tombar ----
replaceInVenue('daejeon-tombar',
  '편안한 분위기로 첫 방문자도 빠르게 적응합니다.',
  '부담 없는 공기라 처음 찾는 분도 금방 녹아듭니다.');
replaceInVenue('daejeon-tombar',
  '단골 손님이 많은 편입니다.',
  '재방문율이 높은 가게입니다.');
console.log('daejeon-eclipse/tombar: differentiated');

// ---- Fix broken sentences found during reading ----
// Fix "마련되어 마련돼 마련됐습니다" type errors
content = content.replace(/마련되어 마련돼 마련됐습니다/g, '가능합니다');
content = content.replace(/갖추고 갖추고 운영 중입니다/g, '갖추고 운영 중입니다');
content = content.replace(/수 운영 중입니다/g, '수 있습니다');
content = content.replace(/찾아오시면을 강력 권장합니다/g, '찾아오시는 것을 강력 권장합니다');
console.log('\nFixed broken sentences');

// Write the fixed content
writeFileSync(filePath, content, 'utf-8');
console.log('\n✅ All fixes applied to venueContent.ts');
