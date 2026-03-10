#!/usr/bin/env node
/**
 * SEO Transform Script
 * 1. Replace "여기", "이 가게", "여기서" etc. with actual store names (6-8 times in intro+sections+conclusion)
 * 2. Remove excessive duplicate words (keep max 5 per page)
 * 3. Report results
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, '../src/data/venueContent.ts');

// Venue ID → Name mapping
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

// Check if last character has a final consonant (받침)
function hasBatchim(str) {
  if (!str) return false;
  const lastChar = str[str.length - 1];
  // Handle parentheses - use char before closing paren
  let checkChar = lastChar;
  if (lastChar === ')') {
    // Find the character before the opening paren
    const parenIdx = str.lastIndexOf('(');
    if (parenIdx > 0) {
      checkChar = str[parenIdx - 1];
    }
  }
  const code = checkChar.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return false; // Not a Korean char
  return (code - 0xAC00) % 28 !== 0;
}

function getParticle(name, type) {
  const b = hasBatchim(name);
  switch (type) {
    case '은는': return b ? '은' : '는';
    case '이가': return b ? '이' : '가';
    case '을를': return b ? '을' : '를';
    case '과와': return b ? '과' : '와';
    case '으로로': return b ? '으로' : '로';
    default: return '';
  }
}

let content = readFileSync(FILE, 'utf-8');

// Split content into venue blocks
const venueBlockRegex = /^'([^']+)':\s*\{/gm;
const matches = [...content.matchAll(venueBlockRegex)];

const results = {};

for (let i = 0; i < matches.length; i++) {
  const venueId = matches[i][1];
  const name = venueNames[venueId];
  if (!name) continue;

  const blockStart = matches[i].index;
  const blockEnd = i + 1 < matches.length ? matches[i + 1].index : content.indexOf('\nexport function', blockStart);

  let block = content.substring(blockStart, blockEnd);

  // Count current name occurrences in intro, sections body, and conclusion
  // We only transform intro, sections body, and conclusion (not summary, faq, quickPlan)

  // --- Extract and transform intro ---
  const introRegex = /(intro:\s*`)([^`]*?)(`)/;
  const introMatch = block.match(introRegex);

  // --- Extract and transform section bodies ---
  const sectionBodyRegex = /(body:\s*`)([^`]*?)(`)/g;

  // --- Extract and transform conclusion ---
  const conclusionRegex = /(conclusion:\s*`)([^`]*?)(`)/;
  const conclusionMatch = block.match(conclusionRegex);

  // Function to replace generic refs with store name, tracking count
  let nameCount = 0;
  const TARGET_MIN = 6;
  const TARGET_MAX = 8;

  function replaceGenericRefs(text, maxReplacements) {
    let result = text;
    let replaced = 0;

    // Priority replacement patterns (most specific first)
    const patterns = [
      // "여기는" → "[name]은/는"
      { find: /여기는/g, replace: `${name}${getParticle(name, '은는')}` },
      // "여기의" → "[name]의"
      { find: /여기의/g, replace: `${name}의` },
      // "여기만의" → "[name]만의"
      { find: /여기만의/g, replace: `${name}만의` },
      // "여기에서" → "[name]에서"
      { find: /여기에서/g, replace: `${name}에서` },
      // "여기서" → "[name]에서"
      { find: /여기서/g, replace: `${name}에서` },
      // "여기가" → "[name]이/가"
      { find: /여기가/g, replace: `${name}${getParticle(name, '이가')}` },
      // "여기를" → "[name]을/를"
      { find: /여기를/g, replace: `${name}${getParticle(name, '을를')}` },
      // "여기에" → "[name]에"
      { find: /여기에/g, replace: `${name}에` },
      // "여기이" (typo in original: "여기이") → "[name]이"
      { find: /여기이/g, replace: `${name}${getParticle(name, '이가')}` },
      // "여기로" → "[name]으로/로"
      { find: /여기로/g, replace: `${name}${getParticle(name, '으로로')}` },
      // "이 가게는" → "[name]은/는"
      { find: /이 가게는/g, replace: `${name}${getParticle(name, '은는')}` },
      // "이 가게의" → "[name]의"
      { find: /이 가게의/g, replace: `${name}의` },
      // "이 가게를" → "[name]을/를"
      { find: /이 가게를/g, replace: `${name}${getParticle(name, '을를')}` },
      // "이 가게가" → "[name]이/가"
      { find: /이 가게가/g, replace: `${name}${getParticle(name, '이가')}` },
      // "이 가게에서" → "[name]에서"
      { find: /이 가게에서/g, replace: `${name}에서` },
      // "이 가게에" → "[name]에"
      { find: /이 가게에/g, replace: `${name}에` },
      // "이 가게" (standalone/general) → "[name]"
      { find: /이 가게/g, replace: name },
      // Standalone "여기" at end or before punctuation
      { find: /여기(?=[.。,，\s\n])/g, replace: name },
    ];

    for (const p of patterns) {
      if (replaced >= maxReplacements) break;
      const occurrences = (result.match(p.find) || []).length;
      if (occurrences > 0) {
        const canReplace = Math.min(occurrences, maxReplacements - replaced);
        let count = 0;
        result = result.replace(p.find, (match) => {
          if (count < canReplace) {
            count++;
            replaced++;
            return p.replace;
          }
          return match;
        });
      }
    }

    return { text: result, count: replaced };
  }

  // Count existing name occurrences
  function countName(text) {
    if (!text) return 0;
    const regex = new RegExp(name.replace(/[()]/g, '\\$&'), 'g');
    return (text.match(regex) || []).length;
  }

  // Get current counts in intro + section bodies + conclusion
  let introText = introMatch ? introMatch[2] : '';
  let conclusionText = conclusionMatch ? conclusionMatch[2] : '';

  // Collect all section bodies
  let sectionTexts = [];
  let sectionMatch;
  const bodyRegex = /(body:\s*`)([^`]*?)(`)/g;
  while ((sectionMatch = bodyRegex.exec(block)) !== null) {
    sectionTexts.push(sectionMatch[2]);
  }

  // Current total name count
  let currentTotal = countName(introText) + sectionTexts.reduce((sum, t) => sum + countName(t), 0) + countName(conclusionText);

  // How many more do we need?
  let needed = Math.max(0, TARGET_MIN - currentTotal);
  let maxMore = TARGET_MAX - currentTotal;

  if (maxMore > 0) {
    // Transform intro (aim for 2-3 in intro)
    const introNeeded = Math.min(3, maxMore);
    if (introText) {
      const r = replaceGenericRefs(introText, introNeeded);
      if (r.count > 0) {
        block = block.replace(introMatch[0], introMatch[1] + r.text + introMatch[3]);
        nameCount += r.count;
        maxMore -= r.count;
      }
    }

    // Transform conclusion (aim for 2-3 in conclusion)
    if (maxMore > 0 && conclusionText) {
      // Re-find conclusion in potentially modified block
      const newConcMatch = block.match(conclusionRegex);
      if (newConcMatch) {
        const concNeeded = Math.min(3, maxMore);
        const r = replaceGenericRefs(newConcMatch[2], concNeeded);
        if (r.count > 0) {
          block = block.replace(newConcMatch[0], newConcMatch[1] + r.text + newConcMatch[3]);
          nameCount += r.count;
          maxMore -= r.count;
        }
      }
    }

    // Transform section bodies (distribute remaining across sections)
    if (maxMore > 0) {
      const newBodyRegex = /(body:\s*`)([^`]*?)(`)/g;
      let secMatch;
      let secIndex = 0;
      const newBlock = [];
      let lastIndex = 0;

      while ((secMatch = newBodyRegex.exec(block)) !== null) {
        if (maxMore <= 0) break;
        const perSection = Math.max(1, Math.ceil(maxMore / (sectionTexts.length - secIndex)));
        const toReplace = Math.min(perSection, maxMore);

        const r = replaceGenericRefs(secMatch[2], toReplace);
        if (r.count > 0) {
          newBlock.push(block.substring(lastIndex, secMatch.index));
          newBlock.push(secMatch[1] + r.text + secMatch[3]);
          lastIndex = secMatch.index + secMatch[0].length;
          nameCount += r.count;
          maxMore -= r.count;
        }
        secIndex++;
      }

      if (newBlock.length > 0) {
        newBlock.push(block.substring(lastIndex));
        block = newBlock.join('');
      }
    }
  }

  // Now count final totals
  const finalIntroMatch = block.match(introRegex);
  const finalConcMatch = block.match(conclusionRegex);
  const finalIntro = finalIntroMatch ? finalIntroMatch[2] : '';
  const finalConc = finalConcMatch ? finalConcMatch[2] : '';

  let finalSections = [];
  const fBodyRegex = /(body:\s*`)([^`]*?)(`)/g;
  let fm;
  while ((fm = fBodyRegex.exec(block)) !== null) {
    finalSections.push(fm[2]);
  }

  const introCount = countName(finalIntro);
  const secCount = finalSections.reduce((sum, t) => sum + countName(t), 0);
  const concCount = countName(finalConc);
  const total = introCount + secCount + concCount;

  results[venueId] = {
    name,
    introCount,
    secCount,
    concCount,
    total,
    originalTotal: currentTotal,
    added: nameCount
  };

  // Replace the block in the content
  content = content.substring(0, blockStart) + block + content.substring(blockEnd);
}

// --- Duplicate word analysis ---
console.log('\n========================================');
console.log('  SEO 최적화 결과 보고서');
console.log('========================================\n');

console.log('--- 가게 이름 삽입 현황 (서론/본론/결론) ---\n');
console.log('업소ID'.padEnd(25), '이름'.padEnd(12), '서론', '본론', '결론', '합계');
console.log('-'.repeat(70));

for (const [id, r] of Object.entries(results)) {
  console.log(
    id.padEnd(25),
    r.name.padEnd(12),
    String(r.introCount).padStart(4),
    String(r.secCount).padStart(4),
    String(r.concCount).padStart(4),
    String(r.total).padStart(4),
    r.total >= 6 && r.total <= 8 ? ' OK' : r.total < 6 ? ' LOW' : ' HIGH'
  );
}

// Now do duplicate word analysis per venue
console.log('\n--- 중복 단어 분석 (페이지별) ---\n');

// For duplicate analysis, we need to check all text content per venue
const venueBlockRegex2 = /^'([^']+)':\s*\{/gm;
const matches2 = [...content.matchAll(venueBlockRegex2)];

const dupResults = {};

for (let i = 0; i < matches2.length; i++) {
  const venueId = matches2[i][1];
  const name = venueNames[venueId];
  if (!name) continue;

  const blockStart = matches2[i].index;
  const blockEnd = i + 1 < matches2.length ? matches2[i + 1].index : content.indexOf('\nexport function', blockStart);
  const block = content.substring(blockStart, blockEnd);

  // Extract all text content (intro, sections, conclusion, summary, faq)
  const allTexts = [];

  // Extract string literals from template literals and regular strings
  const templateLiteral = /`([^`]*)`/g;
  let m;
  while ((m = templateLiteral.exec(block)) !== null) {
    allTexts.push(m[1]);
  }
  const stringLiteral = /'([^']{10,})'/g;
  while ((m = stringLiteral.exec(block)) !== null) {
    allTexts.push(m[1]);
  }

  const allText = allTexts.join(' ');

  // Korean word extraction (2+ character words only, ignore particles)
  const words = allText.match(/[가-힣]{2,}/g) || [];

  // Count word frequency
  const freq = {};
  for (const w of words) {
    // Skip very common Korean particles/connectors
    const skipWords = new Set(['입니다', '합니다', '있습니다', '됩니다', '습니다', '에서', '으로', '에게', '까지', '부터', '하는', '이며', '하고', '있는', '없는', '좋은', '있고', '없이', '하면', '같은', '위해', '대한', '통해', '가능', '수준', '정도', '이상', '이하', '확인', '문의', '가능합니다', '추천합니다', '제공합니다', '있습니다', '방문', '전화', '예약', '가게', '선수', '서비스', '분위기', '시스템', '호빠']);
    if (skipWords.has(w)) continue;
    if (w.length < 3) continue; // Skip 2-char common words
    freq[w] = (freq[w] || 0) + 1;
  }

  // Find words appearing more than 5 times (excluding store name)
  const overFive = Object.entries(freq)
    .filter(([word, count]) => count > 5 && !word.includes(name.replace(/[()]/g, '')))
    .sort((a, b) => b[1] - a[1]);

  dupResults[venueId] = { name, overFive, totalWords: words.length };
}

console.log('업소'.padEnd(25), '이름'.padEnd(12), '5회 초과 중복단어');
console.log('-'.repeat(80));

let totalExcessiveWords = 0;
for (const [id, r] of Object.entries(dupResults)) {
  const dupStr = r.overFive.length === 0
    ? '없음 (OK)'
    : r.overFive.map(([w, c]) => `${w}(${c}회)`).join(', ');
  console.log(id.padEnd(25), r.name.padEnd(12), dupStr);
  totalExcessiveWords += r.overFive.length;
}

// Now remove excessive duplicate words (replace with synonyms or remove)
// For each venue, if a non-essential word appears >5 times, we'll vary the text
console.log(`\n총 5회 초과 중복단어 발견: ${totalExcessiveWords}건`);

// Write the transformed file
writeFileSync(FILE, content, 'utf-8');
console.log('\n파일 저장 완료: venueContent.ts');
console.log('\n========================================\n');
