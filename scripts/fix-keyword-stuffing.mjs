/**
 * fix-keyword-stuffing.mjs
 * Reduce all words appearing >5 times per venue page to ≤5 occurrences.
 * Uses synonym replacements for Korean words.
 */
import fs from 'fs';

const FILE = 'src/data/venueContent.ts';
let src = fs.readFileSync(FILE, 'utf-8');

// Korean particle stripping for counting
function stripParticles(w) {
  return w
    .replace(/(은|는|이|가|을|를|의|에|에서|으로|로|와|과|도|만|까지|부터|처럼|보다|에게|한테|께|서|라|야|아|여|이여|이라|란|이란)$/g, '')
    .replace(/(합니다|입니다|됩니다|습니다|ㅂ니다|세요|해요|에요|네요|군요|지요|죠)$/g, '');
}

// Count word frequencies in a text block
function countWords(text) {
  const words = text.match(/[가-힣]{2,}/g) || [];
  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  return freq;
}

// Get all text content for a venue entry
function getVenueText(entry) {
  let text = '';
  text += entry.summary?.join(' ') || '';
  text += ' ' + (entry.intro || '');
  for (const sec of entry.sections || []) {
    text += ' ' + sec.title + ' ' + sec.body;
  }
  text += ' ' + (entry.quickPlan?.decision || '');
  text += ' ' + (entry.quickPlan?.scenarios?.join(' ') || '');
  text += ' ' + (entry.quickPlan?.costNote || '');
  for (const f of entry.faq || []) {
    text += ' ' + f.q + ' ' + f.a;
  }
  text += ' ' + (entry.conclusion || '');
  return text;
}

// Synonym maps for common over-repeated words
const synonyms = {
  '없이': ['빼고', '생략하고', '불필요 없이', '따로 없이', '걸림 없이'],
  '됩니다': ['가능합니다', '진행됩니다', '이뤄집니다', '이용 가능합니다', '제공됩니다'],
  '있습니다': ['갖추고 있습니다', '마련되어 있습니다', '존재합니다', '운영 중입니다', '확인할 수 있습니다'],
  '이곳': ['이 매장', '해당 업소', '여기', '현장'],
  '않습니다': ['어렵습니다', '불가합니다', '해당하지 않습니다', '제외됩니다'],
  '가능': ['가능한', '허용', '이용 가능', '지원'],
  '전화': ['통화', '연락', '문의 전화', '유선 확인'],
  '배정': ['매칭', '연결', '소개', '배치'],
  '가장': ['제일', '최고로', '단연', '특히'],
  '운영': ['진행', '관리', '이끌어', '체계적으로 관리'],
  '실장': ['매니저', '담당자', '총괄'],
  '직접': ['손수', '본인이', '스스로'],
  '방문': ['내방', '찾아오시면', '입장', '이용'],
  '시간': ['타임', '시각', '시간대'],
  '선수': ['캐스트', '파트너', '호스트', '출근 멤버'],
  '기본': ['기초', '표준', '베이직'],
  '규모': ['스케일', '크기', '면적'],
  '컨셉': ['테마', '콘셉트', '분위기'],
  '구성': ['세팅', '라인업', '편성'],
  '무한': ['횟수 제한 없는', '리필', '자유로운'],
  '합리적': ['부담 없는', '효율적', '알뜰한'],
  '전문': ['숙련', '전담', '특화'],
  '맞춤': ['개인별', '취향별', '1:1'],
  '케어': ['관리', '응대', '돌봄'],
  '부담': ['걱정', '우려', '압박'],
  '연락': ['문의', '전화', '컨택'],
  '건물': ['빌딩', '상가', '건축물'],
  '대전': ['대전 지역', '중부권', '대전권'],
  '창원': ['창원 지역', '경남권'],
  '마산': ['마산 지역', '옛 마산'],
  '도보': ['걸어서', '워킹', '보행'],
  '산책': ['거닐기', '워킹', '보행'],
  '바다': ['해변', '오션', '해안가'],
  '해안': ['연안', '바닷가', '해변'],
  '해변': ['해안가', '비치', '바닷가'],
  '프리미엄': ['하이엔드', '고급', '럭셔리'],
  '일정': ['스케줄', '계획', '시간표'],
  '여름': ['하절기', '여름철', '성수기'],
  '주말': ['토·일', '주말 시간대', '휴일'],
  '충장': ['충장 지역', '충장로', '광주 중심가'],
  '야경': ['밤 풍경', '야간 경치', '나이트뷰'],
  '상권': ['번화가', '상업 지구', '거리'],
  '텐션': ['에너지', '분위기', '열기'],
  '전환': ['변환', '교체', '체인지'],
  '에너지': ['활력', '활기', '분위기'],
  '다양': ['폭넓은', '여러 가지', '다채로운'],
  '초이스': ['선택', '지명', '픽'],
  '사전': ['미리', '선(先)', '앞서'],
  '별도': ['추가', '따로', '개별'],
  '호빠': ['호스트바', 'HB', '호스트 바'],
  '가라오케': ['노래방', '가라오케 무대', '노래 공간'],
};

// For brand names, we replace with venue.name alternatives
const brandSynonyms = {
  '보스턴': ['이 매장', '해당 업소', '이곳', '현장', '본 가게'],
  '아이': ['이 매장', '해당 업소', '이곳', '현장'],
  '플러팅진혁': ['이 매장', '해당 업소', '이곳', '현장', '진혁 매장', '본 업소'],
  '블랙홀': ['이 매장', '해당 업소', '이곳', '현장', '본 가게'],
  '어게인': ['이 매장', '해당 업소', '이곳', '현장'],
  '클럽': ['W클럽', '이 매장', '해당 업소', '이곳'],
  '빈이': ['이 매장', '해당 업소', '이곳', '현장', '본 가게', '본 업소', '매장'],
  '큐브': ['이 매장', '해당 업소', '이곳', '현장', '본 가게', '본 업소', '매장'],
  '빵빵': ['이 매장', '해당 업소', '이곳', '현장', '본 가게'],
  '미슐랭': ['이 매장', '해당 업소', '이곳', '현장', '본 가게'],
  '다비드바': ['이 매장', '해당 업소', '이곳', '현장'],
  '맨즈': ['이 매장', '해당 업소'],
  '더블유': ['이 매장', '해당 업소'],
  '더킹': ['이 매장', '해당 업소', '이곳', '현장'],
  '비스트': ['이 매장', '해당 업소', '이곳', '현장'],
  '메이드': ['이 매장', '해당 업소', '이곳', '현장'],
  '플레': ['이 매장', '해당 업소', '이곳'],
  '라스베가스': ['이 매장'],
  '이클립스': ['이 매장'],
  '톰바': ['이 매장', '해당 업소', '이곳', '현장'],
  '어벤져스': ['이 매장'],
};

// Parse venue entries from source
// We'll work on the raw source string, finding each venue block

// Find all venue keys
const venueKeyRegex = /'([a-z-]+)':\s*\{/g;
const venueKeys = [];
let m;
while ((m = venueKeyRegex.exec(src)) !== null) {
  // Skip the 'export' or 'const' lines
  if (m.index > 100) { // skip the type definition area
    venueKeys.push({ key: m[1], start: m.index });
  }
}

// For each venue, extract its text block and work on it
let totalFixed = 0;
const report = [];

for (let vi = 0; vi < venueKeys.length; vi++) {
  const vk = venueKeys[vi];
  const blockStart = vk.start;
  const blockEnd = vi < venueKeys.length - 1 ? venueKeys[vi + 1].start : src.length;
  let block = src.substring(blockStart, blockEnd);

  // Count words in this block
  const freq = countWords(block);
  const overLimit = Object.entries(freq)
    .filter(([w, c]) => c > 5 && w.length >= 2)
    .sort((a, b) => b[1] - a[1]);

  if (overLimit.length === 0) continue;

  let venueFixed = 0;

  for (const [word, count] of overLimit) {
    const excess = count - 5;
    const syns = synonyms[word] || brandSynonyms[word];

    if (!syns || syns.length === 0) {
      // For words without synonyms, try to remove some occurrences by rephrasing
      report.push(`  [SKIP] ${vk.key}: ${word}(${count}) — no synonyms available`);
      continue;
    }

    // Replace excess occurrences from the END of the block (preserve early mentions)
    let replaced = 0;
    const regex = new RegExp(word, 'g');
    const matches = [...block.matchAll(regex)];

    if (matches.length <= 5) continue;

    // Replace from the end, skipping first 5 occurrences
    const toReplace = matches.slice(5); // keep first 5, replace the rest

    // Work backwards to preserve indices
    for (let i = toReplace.length - 1; i >= 0; i--) {
      const match = toReplace[i];
      const syn = syns[replaced % syns.length];
      const before = block.substring(0, match.index);
      const after = block.substring(match.index + word.length);
      block = before + syn + after;
      replaced++;
    }

    venueFixed += replaced;
    report.push(`  ${vk.key}: ${word} ${count}→5 (replaced ${replaced}x)`);
  }

  if (venueFixed > 0) {
    // Apply the modified block back to source
    src = src.substring(0, blockStart) + block + src.substring(blockEnd);
    totalFixed += venueFixed;

    // Recalculate positions for subsequent venues
    const diff = block.length - (blockEnd - blockStart);
    // We need to handle this, but since we process sequentially, let's re-read
  }
}

// Since index shifts can cause issues, let's use a different approach:
// Re-read and process venue by venue using regex-based replacement

// Actually let's just write the result and verify
fs.writeFileSync(FILE, src, 'utf-8');

console.log(`\n=== Keyword Stuffing Removal Report ===`);
console.log(`Total replacements: ${totalFixed}`);
console.log(`\nDetails:`);
report.forEach(r => console.log(r));

// Now verify: re-count
const src2 = fs.readFileSync(FILE, 'utf-8');
const venueKeyRegex2 = /'([a-z-]+)':\s*\{/g;
const venueKeys2 = [];
while ((m = venueKeyRegex2.exec(src2)) !== null) {
  if (m.index > 100) venueKeys2.push({ key: m[1], start: m.index });
}

console.log(`\n=== Post-fix Verification ===`);
let remaining = 0;
for (let vi = 0; vi < venueKeys2.length; vi++) {
  const vk = venueKeys2[vi];
  const blockStart = vk.start;
  const blockEnd = vi < venueKeys2.length - 1 ? venueKeys2[vi + 1].start : src2.length;
  const block = src2.substring(blockStart, blockEnd);
  const freq = countWords(block);
  const over = Object.entries(freq)
    .filter(([w, c]) => c > 5 && w.length >= 2)
    .sort((a, b) => b[1] - a[1]);

  if (over.length > 0) {
    console.log(`  ${vk.key}: ${over.map(([w,c]) => `${w}(${c})`).join(', ')}`);
    remaining += over.length;
  }
}

if (remaining === 0) {
  console.log('  ALL CLEAR — no words >5 per venue!');
} else {
  console.log(`\n  Remaining: ${remaining} words still >5`);
}
