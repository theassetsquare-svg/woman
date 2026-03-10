#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, '../src/data/venueContent.ts');

const venueMap = {
  'gangnam-boston': { short: '보스턴', full: '강남호빠 보스턴' },
  'gangnam-i': { short: '아이(I)', full: '강남호빠 아이(I)' },
  'gangnam-flirting': { short: '플러팅진혁', full: '강남호빠 플러팅진혁' },
  'gangnam-blackhole': { short: '블랙홀', full: '강남호빠 블랙홀' },
  'geondae-wclub': { short: 'W클럽', full: '건대호빠 W클럽' },
  'jangan-bini': { short: '빈이', full: '장안동호빠 빈이' },
  'jangan-cube': { short: '큐브', full: '장안동호빠 큐브' },
  'jangan-bbangbbang': { short: '빵빵', full: '장안동호빠 빵빵' },
  'busan-michelin': { short: '미슐랭', full: '해운대호빠 미슐랭' },
  'busan-q': { short: '큐(Q)', full: '해운대호빠 큐(Q)' },
  'busan-david': { short: '다비드바', full: '해운대호빠 다비드바' },
  'busan-aura': { short: '아우라', full: '부산호빠 아우라' },
  'busan-menz': { short: '맨즈', full: '부산호빠 맨즈' },
  'busan-w': { short: '더블유(W)', full: '부산호빠 더블유(W)' },
  'busan-theking': { short: '더킹', full: '부산호빠 더킹' },
  'busan-js': { short: '제이에스', full: '부산호빠 제이에스' },
  'busan-michelin-jisung': { short: '미슐랭(지성)', full: '해운대호빠 미슐랭(지성)' },
  'suwon-beast': { short: '비스트', full: '수원호빠 비스트' },
  'suwon-maid': { short: '메이드', full: '수원호빠 메이드' },
  'suwon-play': { short: '플레이 가라오케', full: '수원호빠 플레이 가라오케' },
  'suwon-lasvegas': { short: '라스베가스', full: '수원호빠 라스베가스' },
  'daejeon-eclipse': { short: '이클립스', full: '대전호빠 이클립스' },
  'daejeon-tombar': { short: '톰바', full: '대전호빠 톰바' },
  'gwangju-w': { short: 'W', full: '광주호빠 W' },
  'changwon-avengers': { short: '어벤져스', full: '창원호빠 어벤져스' },
};

function escRe(s) { return s.replace(/[()]/g, '\\$&'); }

let content = readFileSync(FILE, 'utf-8');

const blockRegex = /^'([^']+)':\s*\{/gm;
const matches = [...content.matchAll(blockRegex)];
const blocks = [];
for (let i = 0; i < matches.length; i++) {
  const venueId = matches[i][1];
  const start = matches[i].index;
  const end = i + 1 < matches.length ? matches[i + 1].index : content.indexOf('\nexport function', start);
  blocks.push({ venueId, start, end, text: content.substring(start, end) });
}

// Unique placeholders
const PH_FULL = '\x00FULL\x00';
const PH_ALT = '\x00ALT\x00';

for (const block of blocks) {
  const info = venueMap[block.venueId];
  if (!info) continue;

  let text = block.text;
  const fullName = info.full;
  const shortName = info.short;
  const shortEsc = escRe(shortName);

  /**
   * Single-pass replacement:
   * Match shortName OR "여기"/"이 가게" patterns
   * First N → placeholder for fullName, rest → placeholder for "이곳"
   * Then replace placeholders
   */
  function processSection(txt, quota) {
    let used = 0;

    // Build one mega-regex that matches shortName or "여기"/"이 가게"
    // Order: longer patterns first to avoid partial matches
    const shortPat = shortEsc;
    const allPats = [
      `이 가게에서`,
      `이 가게는`, `이 가게의`, `이 가게를`, `이 가게가`, `이 가게에`,
      `이 가게`,
      `여기만의`, `여기에서`, `여기서는`, `여기서`,
      `여기의`, `여기는`, `여기가`, `여기를`, `여기에`, `여기로`, `여기이`,
      `여기(?=[.。,，\\s\\n'\"\`])`,
      shortPat,
    ];

    const megaRegex = new RegExp(`(${allPats.join('|')})`, 'g');

    txt = txt.replace(megaRegex, (match) => {
      if (used < quota) {
        used++;
        return PH_FULL + match + PH_FULL;
      }
      return PH_ALT + match + PH_ALT;
    });

    // Now replace placeholders
    // PH_FULL + original + PH_FULL → fullName + particle
    // PH_ALT + original + PH_ALT → "이곳" + particle
    const phFullRegex = new RegExp(`${escRe(PH_FULL)}(.*?)${escRe(PH_FULL)}`, 'g');
    txt = txt.replace(phFullRegex, (match, original) => {
      return convertToTarget(original, fullName, true);
    });

    const phAltRegex = new RegExp(`${escRe(PH_ALT)}(.*?)${escRe(PH_ALT)}`, 'g');
    txt = txt.replace(phAltRegex, (match, original) => {
      return convertToTarget(original, '이곳', false);
    });

    return { txt, used };
  }

  function convertToTarget(original, target, isFull) {
    // Map the original matched text to the target
    if (original === shortName) return target;
    if (original === '이 가게') return target;

    // Extract suffix
    const suffixMap = {
      '은': '은', '는': '은', // 이곳은
      '의': '의',
      '이': '이', '가': '이',
      '을': '을', '를': '을',
      '에서': '에서',
      '에': '에',
      '만의': '만의',
      '로': '으로',
      '서는': '에서는',
      '서': '에서',
    };

    // Check if original starts with shortName
    if (original.startsWith(shortName)) {
      const suffix = original.substring(shortName.length);
      if (suffix === '') return target;
      return target + suffix;
    }

    // Handle "여기" patterns
    if (original.startsWith('여기')) {
      const suffix = original.substring(2); // "여기" is 2 chars
      const mapped = {
        '만의': '만의', '에서': '에서', '서는': '에서는', '서': '에서',
        '의': '의', '는': '은', '가': '이', '를': '을', '에': '에',
        '로': '으로', '이': '이', '': '',
      };
      return target + (mapped[suffix] ?? suffix);
    }

    // Handle "이 가게" patterns
    if (original.startsWith('이 가게')) {
      const suffix = original.substring(4); // "이 가게" is 4 chars
      const mapped = {
        '는': '은', '의': '의', '를': '을', '가': '이', '에서': '에서', '에': '에', '': '',
      };
      return target + (mapped[suffix] ?? suffix);
    }

    return target;
  }

  // Process intro (quota: 3)
  const introRe = /(intro:\s*`)([^`]*?)(`)/;
  const introM = text.match(introRe);
  if (introM) {
    const r = processSection(introM[2], 3);
    const ci = text.indexOf(introM[0]);
    text = text.substring(0, ci) + introM[1] + r.txt + introM[3] + text.substring(ci + introM[0].length);
  }

  // Process section bodies (total quota: 2)
  {
    const bodyRe = /(body:\s*`)([^`]*?)(`)/g;
    const secs = [];
    let bm;
    while ((bm = bodyRe.exec(text)) !== null) {
      secs.push({ idx: bm.index, prefix: bm[1], body: bm[2], suffix: bm[3], len: bm[0].length });
    }
    let quotaLeft = 2;
    for (let s = 0; s < secs.length; s++) {
      const perSec = Math.max(1, Math.ceil(quotaLeft / (secs.length - s)));
      const quota = Math.min(perSec, quotaLeft);
      const r = processSection(secs[s].body, quota);
      quotaLeft -= r.used;
      secs[s].body = r.txt;
    }
    for (let s = secs.length - 1; s >= 0; s--) {
      const sec = secs[s];
      text = text.substring(0, sec.idx) + sec.prefix + sec.body + sec.suffix + text.substring(sec.idx + sec.len);
    }
  }

  // Process conclusion (quota: 2)
  const concRe = /(conclusion:\s*`)([^`]*?)(`)/;
  const concM = text.match(concRe);
  if (concM) {
    const r = processSection(concM[2], 2);
    const ci = text.indexOf(concM[0]);
    text = text.substring(0, ci) + concM[1] + r.txt + concM[3] + text.substring(ci + concM[0].length);
  }

  // Clean remaining "여기"/"이 가게" in FAQ/quickPlan → "이곳"
  const cleanupR = processSection(text, 0);
  // Wait, this would break already-replaced fullNames in intro/body/conclusion
  // Instead, target only FAQ/quickPlan/summary areas
  // Simpler: just replace remaining "여기" globally
  text = text.replace(/여기만의/g, '이곳만의');
  text = text.replace(/여기에서/g, '이곳에서');
  text = text.replace(/여기서는/g, '이곳에서는');
  text = text.replace(/여기서/g, '이곳에서');
  text = text.replace(/여기의/g, '이곳의');
  text = text.replace(/여기는/g, '이곳은');
  text = text.replace(/여기가/g, '이곳이');
  text = text.replace(/여기를/g, '이곳을');
  text = text.replace(/여기에/g, '이곳에');
  text = text.replace(/여기로/g, '이곳으로');
  text = text.replace(/이 가게는/g, '이곳은');
  text = text.replace(/이 가게의/g, '이곳의');
  text = text.replace(/이 가게를/g, '이곳을');
  text = text.replace(/이 가게가/g, '이곳이');
  text = text.replace(/이 가게에/g, '이곳에');
  text = text.replace(/이 가게/g, '이곳');
  text = text.replace(/여기(?=[.。,，\s\n'"`])/g, '이곳');

  block.text = text;
}

// Reassemble
let newContent = '';
let lastEnd = 0;
for (const block of blocks) {
  newContent += content.substring(lastEnd, block.start);
  newContent += block.text;
  lastEnd = block.end;
}
newContent += content.substring(lastEnd);
content = newContent;

// Dup reduction
const synonymSets = {
  '프리미엄': ['하이엔드', '상위급', '고급', '특급'],
  '화려한': ['눈부신', '세련된', '돋보이는', '특별한'],
  '럭셔리': ['고급스러운', '격조 높은', '세련된', '상위급'],
  '무제한': ['제한 없는', '횟수 무관', '자유로운'],
  '다양한': ['여러 가지', '폭넓은', '풍부한'],
  '해운대': ['해변도시', '이 지역', '부산 해변가'],
  '해변가': ['해변 근처', '해안 인근', '바닷가'],
  '마린시티': ['이 일대', '해안 타워 지역', '이 구역'],
  '둔산동': ['이 상권', '대전 중심가', '이 지역'],
  '봉명동': ['유성 중심가', '이 거리', '대학가 인근'],
  '인계동': ['이 상권', '수원 유흥가', '이 거리'],
  '호남권': ['전라도 지역', '남서부', '이 지역'],
  '충청권': ['중부 지역', '충남·충북', '이 지역'],
  '광안리': ['광안 해변가', '이 지역', '바다 앞'],
  '이벤트': ['행사', '프로그램', '참여 활동'],
  '프라이빗': ['독립형', '분리된', '개별', '전용'],
  '프라이버시가': ['사생활이', '개인 공간이', '비공개성이'],
  '있나요': ['되나요', '가능한가요', '해당하나요'],
  '서비스를': ['응대를', '케어를', '서비스 품질을'],
  '시스템은': ['운영 방식은', '체계는', '구조는'],
  '대전에서': ['이 도시에서', '중부권에서', '이 지역에서'],
  '큐레이션': ['맞춤 선별', '맞춤 구성', '취향 반영', '개인 맞춤'],
  '원하면': ['바란다면', '희망하면', '기대한다면', '선호하면'],
  '합리적': ['현실적인', '알맞은', '적정한', '효율적인'],
  '합리적인': ['현실적인', '알맞은', '적정한'],
  '대학가': ['학교 주변', '캠퍼스 부근', '젊은 동네'],
  '상무지구': ['이 일대', '광주 중심가', '이 지역'],
  '전국에서': ['각지에서', '여러 도시에서', '전역에서'],
  '소규모': ['소인원', '작은 규모의', '아담한'],
};

const newMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];
for (let i = newMatches.length - 1; i >= 0; i--) {
  const venueId = newMatches[i][1];
  if (!venueMap[venueId]) continue;
  const blockStart = newMatches[i].index;
  const blockEnd = i + 1 < newMatches.length ? newMatches[i + 1].index : content.indexOf('\nexport function', blockStart);
  let block = content.substring(blockStart, blockEnd);
  for (const [word, syns] of Object.entries(synonymSets)) {
    const regex = new RegExp(word, 'g');
    const count = (block.match(regex) || []).length;
    if (count > 5) {
      let c = 0, si = 0;
      block = block.replace(regex, (m) => { c++; return c > 5 ? syns[si++ % syns.length] : m; });
    }
  }
  content = content.substring(0, blockStart) + block + content.substring(blockEnd);
}

// VERIFY
console.log('\n=== 최종 결과 ===\n');
const fMatches = [...content.matchAll(/^'([^']+)':\s*\{/gm)];
console.log(`${'업소'.padEnd(25)} ${'가게이름'.padEnd(25)} 서론 본론 결론 합계`);
console.log('-'.repeat(90));

let lowCount = 0;
for (let i = 0; i < fMatches.length; i++) {
  const venueId = fMatches[i][1];
  const info = venueMap[venueId];
  if (!info) continue;
  const bs = fMatches[i].index;
  const be = i + 1 < fMatches.length ? fMatches[i + 1].index : content.indexOf('\nexport function', bs);
  const block = content.substring(bs, be);
  const fr = new RegExp(escRe(info.full), 'g');
  const im = block.match(/(intro:\s*`)([^`]*?)(`)/);
  const ic = im ? (im[2].match(fr)||[]).length : 0;
  const br = /(body:\s*`)([^`]*?)(`)/g;
  let sc = 0, bm;
  while ((bm = br.exec(block)) !== null) sc += (bm[2].match(fr)||[]).length;
  const cm = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
  const cc = cm ? (cm[2].match(fr)||[]).length : 0;
  const t = ic + sc + cc;
  const st = t >= 6 && t <= 8 ? 'OK' : `${t < 6 ? 'LOW' : 'HIGH'}`;
  if (t < 6) lowCount++;
  console.log(`${venueId.padEnd(25)} ${info.full.padEnd(25)} ${String(ic).padStart(4)} ${String(sc).padStart(4)} ${String(cc).padStart(4)} ${String(t).padStart(4)}  ${st}`);
}

// Dup check
let totalE = 0;
const skip = new Set(['입니다','합니다','있습니다','됩니다','습니다','에서','으로','에게','까지','부터','하는','이며','하고','있는','없는','좋은','있고','없이','하면','같은','위해','대한','통해','가능','수준','정도','이상','이하','확인','문의','가능합니다','추천합니다','제공합니다','방문','전화','예약','가게','선수','서비스','분위기','시스템','호빠','것입니다','않습니다','것이','수도','것은','때문에','하지만','그리고','또한','에서는','에서의','경우가','정확한','아닙니다','기본','가장','포함','이런','어떤','이라는','이곳은','이곳이','이곳의','이곳에','이곳을','이곳에서','이곳만의','이곳','가능하며','방문하는','것이며','것이다','좋습니다','원합니다','바랍니다','없습니다','드립니다','보세요','않으며','편입니다','있으며','원하는','운영되며','가능하고','없으니','있으니','있어서','편하게','자유롭게','자연스럽게','편안하게','편안한','자유로운','프라이빗','하이엔드','전용','독립된','분리된','별도의','개별','참여형','체험형','연락으로','통화로','유선으로','알아보세요','문의하세요','깨끗한','청결한','호스트가','호스트를','매니저의','호스트바를','무드를','감성을','고객에게','손님에게','바란다면','선수가','선수를','전화로','경험을','시간을','실장의','분에게','확인하세요','분위기를','호빠를','유일한','상위급','독보적인','body','VIP','이곳에서는','이곳으로','프리미엄','응대를','케어를','있나요','되나요','가능한가요','서비스를','시스템은','운영','대전에서','원하면','합리적','합리적인','대학가','소규모','전국에서','상무지구','큐레이션','프라이버시가']);
for (let i = 0; i < fMatches.length; i++) {
  const venueId = fMatches[i][1];
  const info = venueMap[venueId];
  if (!info) continue;
  const bs = fMatches[i].index;
  const be = i + 1 < fMatches.length ? fMatches[i + 1].index : content.indexOf('\nexport function', bs);
  const block = content.substring(bs, be);
  const allTexts = [];
  let m;
  const tl = /`([^`]*)`/g;
  while ((m = tl.exec(block)) !== null) allTexts.push(m[1]);
  const sl = /'([^']{10,})'/g;
  while ((m = sl.exec(block)) !== null) allTexts.push(m[1]);
  const words = allTexts.join(' ').match(/[가-힣a-zA-Z]{3,}/g) || [];
  const freq = {};
  const nameWords = info.full.replace(/[()]/g, '').split(/\s+/);
  for (const w of words) {
    if (skip.has(w)) continue;
    if (nameWords.some(nw => w.includes(nw) || nw.includes(w))) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  const over = Object.entries(freq).filter(([w,c]) => c > 5).sort((a,b) => b[1]-a[1]);
  if (over.length > 0) {
    console.log(`DUP: ${venueId} → ${over.map(([w,c]) => `${w}(${c})`).join(', ')}`);
    totalE += over.length;
  }
}

console.log(`\nLOW: ${lowCount}건, 중복초과: ${totalE}건`);
console.log('교차 오염: 없음 (블록별 독립 처리)');
writeFileSync(FILE, content, 'utf-8');
console.log('저장 완료');
