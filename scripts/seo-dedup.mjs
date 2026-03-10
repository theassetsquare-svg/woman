#!/usr/bin/env node
/**
 * SEO Dedup Script - Pass 2
 * 1. Replace ALL remaining "여기는/여기의/여기서" etc. with store names (in FAQ, quickPlan, summary too)
 * 2. Replace excessive duplicate words with synonyms (max 5 per page)
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, '../src/data/venueContent.ts');

const venueNames = {
  'gangnam-boston': '보스턴',
  'gangnam-i': '아이(I)',
  'gangnam-flirting': '플러팅진혁',
  'gangnam-blackhole': '블랙홀',
  'geondae-wclub': 'W클럽',
  'jangan-bini': '빈이',
  'jangan-cube': '큐브',
  'jangan-bbangbbang': '빵빵',
  'busan-michelin': '미슐랭',
  'busan-q': '큐(Q)',
  'busan-david': '다비드바',
  'busan-aura': '아우라',
  'busan-menz': '맨즈',
  'busan-w': '더블유(W)',
  'busan-theking': '더킹',
  'busan-js': '제이에스',
  'busan-michelin-jisung': '미슐랭(지성)',
  'suwon-beast': '비스트',
  'suwon-maid': '메이드',
  'suwon-play': '플레이 가라오케',
  'suwon-lasvegas': '라스베가스',
  'daejeon-eclipse': '이클립스',
  'daejeon-tombar': '톰바',
  'gwangju-w': 'W',
  'changwon-avengers': '어벤져스',
};

function hasBatchim(str) {
  if (!str) return false;
  let checkChar = str[str.length - 1];
  if (checkChar === ')') {
    const parenIdx = str.lastIndexOf('(');
    if (parenIdx > 0) checkChar = str[parenIdx - 1];
  }
  const code = checkChar.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false;
  return (code - 0xAC00) % 28 !== 0;
}

function getP(name, type) {
  const b = hasBatchim(name);
  const map = { '은는': b?'은':'는', '이가': b?'이':'가', '을를': b?'을':'를', '과와': b?'과':'와', '으로로': b?'으로':'로' };
  return map[type] || '';
}

let content = readFileSync(FILE, 'utf-8');

// Step 1: Replace ALL remaining "여기" references in each venue block
const venueBlockRegex = /^'([^']+)':\s*\{/gm;
const allMatches = [...content.matchAll(venueBlockRegex)];

for (let i = 0; i < allMatches.length; i++) {
  const venueId = allMatches[i][1];
  const name = venueNames[venueId];
  if (!name) continue;

  const blockStart = allMatches[i].index;
  const blockEnd = i + 1 < allMatches.length ? allMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  let block = content.substring(blockStart, blockEnd);

  // Replace ALL "여기" variants with store name
  block = block.replace(/여기만의/g, `${name}만의`);
  block = block.replace(/여기에서/g, `${name}에서`);
  block = block.replace(/여기서의/g, `${name}에서의`);
  block = block.replace(/여기서는/g, `${name}에서는`);
  block = block.replace(/여기서/g, `${name}에서`);
  block = block.replace(/여기의/g, `${name}의`);
  block = block.replace(/여기는/g, `${name}${getP(name, '은는')}`);
  block = block.replace(/여기가/g, `${name}${getP(name, '이가')}`);
  block = block.replace(/여기를/g, `${name}${getP(name, '을를')}`);
  block = block.replace(/여기에/g, `${name}에`);
  block = block.replace(/여기로/g, `${name}${getP(name, '으로로')}`);
  block = block.replace(/여기이/g, `${name}${getP(name, '이가')}`);
  // Standalone "여기" before punctuation or whitespace
  block = block.replace(/여기(?=[.。,，\s\n'"`])/g, name);

  content = content.substring(0, blockStart) + block + content.substring(blockEnd);
}

// Step 2: Replace excessive duplicate words with synonyms per venue
// Synonym mappings for commonly over-used words
const synonymSets = {
  '프리미엄': ['하이엔드', '상위급', '고급', '특급', '최상급'],
  '프라이빗': ['독립형', '분리된', '개별', '별도 공간의', '전용'],
  '화려한': ['눈부신', '세련된', '돋보이는', '특별한', '화사한'],
  '합리적': ['현실적인', '알맞은', '적정한', '효율적인', '균형 잡힌'],
  '합리적인': ['현실적인', '알맞은', '적정한', '효율적인', '균형 잡힌'],
  '럭셔리': ['고급스러운', '격조 높은', '세련된', '상위급', '하이엔드'],
  '무제한': ['제한 없는', '횟수 무관', '자유로운', '끝없는', '개방형'],
  '큐레이션': ['맞춤 선별', '맞춤 구성', '세심한 안내', '취향 반영', '개인 맞춤'],
  '다양한': ['여러 가지', '폭넓은', '풍부한', '각양각색의', '갖가지'],
  '선수를': ['호스트를', '담당자를', '파트너를', '함께할 분을', '상대를'],
  '선수가': ['호스트가', '담당자가', '파트너가', '멤버가', '출근자가'],
  '소규모': ['소인원', '작은 규모의', '아담한', '미니', '소수 정예'],
  '분에게': ['사람에게', '고객에게', '분께', '손님에게', '이용자에게'],
  '시간을': ['타이밍을', '일정을', '시점을', '때를', '순간을'],
  '전국에서': ['각지에서', '전역에서', '전 지역에서', '곳곳에서', '여러 도시에서'],
  '호빠를': ['호스트바를', '이곳을', '이 업종을', '이런 곳을', '해당 업소를'],
  '유일한': ['독보적인', '단 하나의', '대체 불가한', '유일무이한', '오직 하나인'],
  '시스템은': ['운영 방식은', '체계는', '구조는', '방법은', '절차는'],
  '전화로': ['연락으로', '통화로', '유선으로', '직접 문의로', '전화 한 통으로'],
  '확인하세요': ['알아보세요', '체크하세요', '점검하세요', '살펴보세요', '문의하세요'],
  '경험을': ['체험을', '시간을', '순간을', '만족감을', '기억을'],
  '서비스를': ['응대를', '케어를', '서비스 품질을', '대접을', '접객을'],
  '가게가': ['이곳이', '매장이', '업소가', '곳이', '자리가'],
  '원하면': ['바란다면', '희망하면', '원한다면', '기대한다면', '선호하면'],
  '인계동에서': ['이 상권에서', '이 거리에서', '인계동 유흥가에서', '인계동 한복판에서', '이 지역에서'],
  '있나요': ['되나요', '가능한가요', '해당되나요', '운영하나요', '지원하나요'],
  '실장의': ['담당자의', '매니저의', '관리자의', '책임자의', '운영자의'],
  '분위기를': ['무드를', '에너지를', '느낌을', '감성을', '톤을'],
};

// Re-parse blocks after step 1
const content2 = content;
const matches2 = [...content2.matchAll(/^'([^']+)':\s*\{/gm)];

for (let i = 0; i < matches2.length; i++) {
  const venueId = matches2[i][1];
  const name = venueNames[venueId];
  if (!name) continue;

  const blockStart = matches2[i].index;
  const blockEnd = i + 1 < matches2.length ? matches2[i + 1].index : content.indexOf('\nexport function', blockStart);
  let block = content.substring(blockStart, blockEnd);

  // For each synonym set, count occurrences and replace excess
  for (const [word, synonyms] of Object.entries(synonymSets)) {
    const regex = new RegExp(word, 'g');
    const occurrences = (block.match(regex) || []).length;

    if (occurrences > 5) {
      const toReplace = occurrences - 5;
      let replaced = 0;
      let synIdx = 0;

      // Replace from the END of the block to avoid messing up indices
      // But since we're doing global replace, let's count and skip first 5
      let count = 0;
      block = block.replace(regex, (match) => {
        count++;
        if (count > 5 && replaced < toReplace) {
          replaced++;
          const syn = synonyms[synIdx % synonyms.length];
          synIdx++;
          return syn;
        }
        return match;
      });
    }
  }

  // Location-specific words: reduce by varying context
  // For location words like 해운대, 둔산동, 봉명동, 마린시티, 광안리, 인계동, 호남권, 충청권
  const locationSynonyms = {
    '해운대': ['해변도시', '이 지역', '부산 해변가', '해변 근처', '이 상권'],
    '마린시티': ['이 일대', '해안 타워 지역', '이 구역', '부산 랜드마크 인근', '해안가'],
    '광안리': ['광안 해변가', '이 지역', '바다 앞', '해안가', '이 일대'],
    '둔산동': ['이 상권', '대전 중심가', '이 지역', '유흥 중심지', '번화가'],
    '봉명동': ['유성 중심가', '이 거리', '대학가 인근', '이 지역', '유성 번화가'],
    '호남권': ['전라도 지역', '남서부', '이 지역', '전남·전북', '서남권'],
    '충청권': ['중부 지역', '충남·충북', '이 지역', '중부권', '대전·세종 인근'],
    '인계동': ['이 상권', '수원 유흥가', '이 거리', '이 지역', '수원 중심가'],
    '상무지구': ['이 일대', '광주 중심가', '이 지역', '서구 번화가', '이 상권'],
    '장안동': ['이 지역', '동대문 인근', '서울 동북권', '이 동네', '이 상권'],
  };

  for (const [loc, synonyms] of Object.entries(locationSynonyms)) {
    const regex = new RegExp(loc, 'g');
    const occurrences = (block.match(regex) || []).length;

    if (occurrences > 5) {
      const toReplace = occurrences - 5;
      let replaced = 0;
      let synIdx = 0;
      let count = 0;

      block = block.replace(regex, (match) => {
        count++;
        if (count > 5 && replaced < toReplace) {
          replaced++;
          const syn = synonyms[synIdx % synonyms.length];
          synIdx++;
          return syn;
        }
        return match;
      });
    }
  }

  content = content.substring(0, blockStart) + block + content.substring(blockEnd);
}

// Final analysis
console.log('\n========================================');
console.log('  2차 최적화 결과 보고서');
console.log('========================================\n');

// Re-count name occurrences in intro/sections/conclusion
const finalMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];

console.log('--- 가게 이름 최종 현황 (서론/본론/결론) ---\n');
console.log('업소ID'.padEnd(25), '이름'.padEnd(12), '서론', '본론', '결론', '합계');
console.log('-'.repeat(70));

for (let i = 0; i < finalMatches.length; i++) {
  const venueId = finalMatches[i][1];
  const name = venueNames[venueId];
  if (!name) continue;

  const blockStart = finalMatches[i].index;
  const blockEnd = i + 1 < finalMatches.length ? finalMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  const block = content.substring(blockStart, blockEnd);

  const nameEsc = name.replace(/[()]/g, '\\$&');
  const nameRegex = new RegExp(nameEsc, 'g');

  // Extract intro
  const introMatch = block.match(/(intro:\s*`)([^`]*?)(`)/);
  const introCount = introMatch ? (introMatch[2].match(nameRegex) || []).length : 0;

  // Extract section bodies
  const bodyRegex = /(body:\s*`)([^`]*?)(`)/g;
  let secCount = 0;
  let bm;
  while ((bm = bodyRegex.exec(block)) !== null) {
    secCount += (bm[2].match(nameRegex) || []).length;
  }

  // Extract conclusion
  const concMatch = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
  const concCount = concMatch ? (concMatch[2].match(nameRegex) || []).length : 0;

  const total = introCount + secCount + concCount;
  const status = total >= 6 && total <= 8 ? ' OK' : total < 6 ? ' LOW' : ' HIGH';
  console.log(venueId.padEnd(25), name.padEnd(12), String(introCount).padStart(4), String(secCount).padStart(4), String(concCount).padStart(4), String(total).padStart(4), status);
}

// Final duplicate word analysis
console.log('\n--- 최종 중복 단어 현황 ---\n');
console.log('업소'.padEnd(25), '이름'.padEnd(12), '5회 초과 중복단어');
console.log('-'.repeat(80));

const finalMatches2 = [...content.matchAll(/^'([^']+)':\s*\{/gm)];
let totalExcess = 0;

for (let i = 0; i < finalMatches2.length; i++) {
  const venueId = finalMatches2[i][1];
  const name = venueNames[venueId];
  if (!name) continue;

  const blockStart = finalMatches2[i].index;
  const blockEnd = i + 1 < finalMatches2.length ? finalMatches2[i + 1].index : content.indexOf('\nexport function', blockStart);
  const block = content.substring(blockStart, blockEnd);

  const allTexts = [];
  const tl = /`([^`]*)`/g;
  let m;
  while ((m = tl.exec(block)) !== null) allTexts.push(m[1]);
  const sl = /'([^']{10,})'/g;
  while ((m = sl.exec(block)) !== null) allTexts.push(m[1]);
  const allText = allTexts.join(' ');

  const words = allText.match(/[가-힣]{2,}/g) || [];
  const freq = {};
  const skipWords = new Set(['입니다', '합니다', '있습니다', '됩니다', '습니다', '에서', '으로', '에게', '까지', '부터', '하는', '이며', '하고', '있는', '없는', '좋은', '있고', '없이', '하면', '같은', '위해', '대한', '통해', '가능', '수준', '정도', '이상', '이하', '가능합니다', '추천합니다', '제공합니다', '있습니다', '방문', '전화', '예약', '가게', '선수', '서비스', '분위기', '시스템', '호빠', '것입니다', '않습니다', '것이', '수도', '것은', '때문에', '하지만', '그리고', '또한', '에서는', '에서의', '경우가', '정확한', '아닙니다', '기본', '가장', '포함', '가능하며', '가능합니다', '됩니다', '이런', '어떤', '이라는']);
  for (const w of words) {
    if (skipWords.has(w)) continue;
    if (w.length < 3) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  const nameClean = name.replace(/[()]/g, '');
  const overFive = Object.entries(freq)
    .filter(([word, count]) => count > 5 && !word.includes(nameClean))
    .sort((a, b) => b[1] - a[1]);

  const dupStr = overFive.length === 0 ? 'OK (5이하)' : overFive.map(([w, c]) => `${w}(${c}회)`).join(', ');
  console.log(venueId.padEnd(25), name.padEnd(12), dupStr);
  totalExcess += overFive.length;
}

console.log(`\n총 5회 초과 중복단어: ${totalExcess}건`);

writeFileSync(FILE, content, 'utf-8');
console.log('\n파일 저장 완료\n');
