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

// ===== 랜덤 배분 생성 (각 업소마다 다른 서론/본론/결론 비율) =====
// 합계 6~8, 각 섹션 최소 1개
const distributions = [
  // total 6
  [2, 2, 2], [3, 2, 1], [2, 3, 1], [1, 3, 2], [3, 1, 2], [1, 2, 3], [2, 1, 3],
  // total 7
  [3, 2, 2], [2, 3, 2], [2, 2, 3], [3, 3, 1], [1, 3, 3], [4, 2, 1], [1, 4, 2],
  [4, 1, 2], [2, 4, 1], [3, 1, 3], [1, 2, 4],
  // total 8
  [3, 3, 2], [3, 2, 3], [2, 3, 3], [4, 2, 2], [2, 4, 2], [2, 2, 4], [4, 3, 1],
  [3, 4, 1], [1, 4, 3], [1, 3, 4],
];

// Shuffle and assign unique distributions to each venue
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const venueIds = Object.keys(venueMap);
const shuffled = shuffle(distributions);
const venueDistributions = {};
for (let i = 0; i < venueIds.length; i++) {
  venueDistributions[venueIds[i]] = shuffled[i % shuffled.length];
}

let content = readFileSync(FILE, 'utf-8');

// ===== STEP 1: Extract blocks =====
const blockRegex = /^'([^']+)':\s*\{/gm;
const matches = [...content.matchAll(blockRegex)];
const blocks = [];
for (let i = 0; i < matches.length; i++) {
  const venueId = matches[i][1];
  const start = matches[i].index;
  const end = i + 1 < matches.length ? matches[i + 1].index : content.indexOf('\nexport function', start);
  blocks.push({ venueId, start, end, text: content.substring(start, end) });
}

// ===== STEP 2: Full name insertion with random quotas =====
const PH_FULL = '\x00FULL\x00';
const PH_ALT = '\x00ALT\x00';
const PH_PROTECT = '\x00PROT';
const PH_PROTECT_END = 'PROT\x00';

for (const block of blocks) {
  const info = venueMap[block.venueId];
  if (!info) continue;

  let text = block.text;
  const fullName = info.full;
  const shortName = info.short;
  const shortEsc = escRe(shortName);
  const dist = venueDistributions[block.venueId];
  const [introQuota, bodyQuota, concQuota] = dist;

  function processSection(txt, quota) {
    let used = 0;
    const allPats = [
      `이 가게에서`,
      `이 가게는`, `이 가게의`, `이 가게를`, `이 가게가`, `이 가게에`,
      `이 가게`,
      `여기만의`, `여기에서`, `여기서는`, `여기서`,
      `여기의`, `여기는`, `여기가`, `여기를`, `여기에`, `여기로`, `여기이`,
      `여기(?=[.。,，\\s\\n'\"\`])`,
      shortEsc,
    ];
    const megaRegex = new RegExp(`(${allPats.join('|')})`, 'g');

    txt = txt.replace(megaRegex, (match) => {
      if (used < quota) {
        used++;
        return PH_FULL + match + PH_FULL;
      }
      return PH_ALT + match + PH_ALT;
    });

    const phFullRegex = new RegExp(`${escRe(PH_FULL)}(.*?)${escRe(PH_FULL)}`, 'g');
    txt = txt.replace(phFullRegex, (_, original) => convertToTarget(original, fullName, shortName));

    const phAltRegex = new RegExp(`${escRe(PH_ALT)}(.*?)${escRe(PH_ALT)}`, 'g');
    txt = txt.replace(phAltRegex, (_, original) => convertToTarget(original, '이곳', shortName));

    return { txt, used };
  }

  function convertToTarget(original, target, shortName) {
    if (original === shortName) return target;
    if (original === '이 가게') return target;
    if (original.startsWith(shortName)) {
      const suffix = original.substring(shortName.length);
      return suffix === '' ? target : target + suffix;
    }
    if (original.startsWith('여기')) {
      const suffix = original.substring(2);
      const mapped = {
        '만의': '만의', '에서': '에서', '서는': '에서는', '서': '에서',
        '의': '의', '는': '은', '가': '이', '를': '을', '에': '에',
        '로': '으로', '이': '이', '': '',
      };
      return target + (mapped[suffix] ?? suffix);
    }
    if (original.startsWith('이 가게')) {
      const suffix = original.substring(4);
      const mapped = {
        '는': '은', '의': '의', '를': '을', '가': '이', '에서': '에서', '에': '에', '': '',
      };
      return target + (mapped[suffix] ?? suffix);
    }
    return target;
  }

  // --- Process intro ---
  const introRe = /(intro:\s*`)([^`]*?)(`)/;
  const introM = text.match(introRe);
  let introUsed = 0;
  if (introM) {
    const r = processSection(introM[2], introQuota);
    introUsed = r.used;
    const ci = text.indexOf(introM[0]);
    text = text.substring(0, ci) + introM[1] + r.txt + introM[3] + text.substring(ci + introM[0].length);
  }

  // --- Process body sections (distribute bodyQuota across sections) ---
  {
    const bodyRe = /(body:\s*`)([^`]*?)(`)/g;
    const secs = [];
    let bm;
    while ((bm = bodyRe.exec(text)) !== null) {
      secs.push({ idx: bm.index, prefix: bm[1], body: bm[2], suffix: bm[3], len: bm[0].length });
    }
    // Distribute bodyQuota randomly across sections
    let quotaLeft = bodyQuota;
    // Shuffle section order for assigning quotas (randomness)
    const secOrder = shuffle(secs.map((_, i) => i));
    const secQuotas = new Array(secs.length).fill(0);
    for (let q = 0; q < quotaLeft; q++) {
      secQuotas[secOrder[q % secOrder.length]]++;
    }

    for (let s = 0; s < secs.length; s++) {
      const r = processSection(secs[s].body, secQuotas[s]);
      secs[s].body = r.txt;
    }
    for (let s = secs.length - 1; s >= 0; s--) {
      const sec = secs[s];
      text = text.substring(0, sec.idx) + sec.prefix + sec.body + sec.suffix + text.substring(sec.idx + sec.len);
    }
  }

  // --- Process conclusion ---
  const concRe = /(conclusion:\s*`)([^`]*?)(`)/;
  const concM = text.match(concRe);
  if (concM) {
    const r = processSection(concM[2], concQuota);
    const ci = text.indexOf(concM[0]);
    text = text.substring(0, ci) + concM[1] + r.txt + concM[3] + text.substring(ci + concM[0].length);
  }

  // Clean remaining "여기"/"이 가게" → "이곳"
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

  // Protect full names from synonym replacement
  const fullEsc = escRe(fullName);
  text = text.replace(new RegExp(fullEsc, 'g'), (m) => PH_PROTECT + m + PH_PROTECT_END);

  block.text = text;
}

// ===== STEP 3: Reassemble =====
let newContent = '';
let lastEnd = 0;
for (const block of blocks) {
  newContent += content.substring(lastEnd, block.start);
  newContent += block.text;
  lastEnd = block.end;
}
newContent += content.substring(lastEnd);
content = newContent;

// ===== STEP 4: Synonym-based dup reduction =====
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
    const allM = [...block.matchAll(regex)];
    const unprotected = allM.filter(m => {
      const before = block.substring(Math.max(0, m.index - 20), m.index);
      return !before.includes(PH_PROTECT);
    });
    if (unprotected.length > 5) {
      let c = 0, si = 0;
      block = block.replace(regex, (m, offset) => {
        const before = block.substring(Math.max(0, offset - 20), offset);
        if (before.includes(PH_PROTECT)) return m;
        c++;
        return c > 5 ? syns[si++ % syns.length] : m;
      });
    }
  }
  content = content.substring(0, blockStart) + block + content.substring(blockEnd);
}

// ===== STEP 5: Remove protection markers =====
content = content.replace(new RegExp(escRe(PH_PROTECT), 'g'), '');
content = content.replace(new RegExp(escRe(PH_PROTECT_END), 'g'), '');

// ===== STEP 6: Count and boost LOW venues =====
function getBlocks2() { return [...content.matchAll(/^'([^']+)':\s*\{/gm)]; }

function countFull(venueId) {
  const info = venueMap[venueId];
  if (!info) return null;
  const fm = getBlocks2();
  const idx = fm.findIndex(m => m[1] === venueId);
  if (idx === -1) return null;
  const bs = fm[idx].index;
  const be = idx + 1 < fm.length ? fm[idx + 1].index : content.indexOf('\nexport function', bs);
  const block = content.substring(bs, be);
  const fr = new RegExp(escRe(info.full), 'g');
  const im = block.match(/(intro:\s*`)([^`]*?)(`)/);
  const ic = im ? (im[2].match(fr)||[]).length : 0;
  const br = /(body:\s*`)([^`]*?)(`)/g;
  let sc = 0, bm;
  while ((bm = br.exec(block)) !== null) sc += (bm[2].match(fr)||[]).length;
  const cm = block.match(/(conclusion:\s*`)([^`]*?)(`)/);
  const cc = cm ? (cm[2].match(fr)||[]).length : 0;
  return { ic, sc, cc, total: ic + sc + cc };
}

function boostVenue(venueId, targetTotal) {
  const info = venueMap[venueId];
  const counts = countFull(venueId);
  if (!counts) return;
  let needed = targetTotal - counts.total;
  if (needed <= 0) return;

  const fm = getBlocks2();
  const idx = fm.findIndex(m => m[1] === venueId);
  const bs = fm[idx].index;
  const be = idx + 1 < fm.length ? fm[idx + 1].index : content.indexOf('\nexport function', bs);
  let block = content.substring(bs, be);

  const iReplacements = [
    [/이곳은/, info.full + '은'],
    [/이곳의/, info.full + '의'],
    [/이곳을/, info.full + '을'],
    [/이곳에서/, info.full + '에서'],
    [/이곳만의/, info.full + '만의'],
    [/이곳이/, info.full + '이'],
    [/이곳/, info.full],
  ];

  // Boost body first
  if (counts.sc < 2) {
    const bodyNeeded = Math.min(needed, 2 - counts.sc);
    const bodyRe = /(body:\s*`)([^`]*?)(`)/g;
    let replaced = 0;
    block = block.replace(bodyRe, (match, p1, bodyText, p3) => {
      if (replaced >= bodyNeeded) return match;
      for (const [regex, replacement] of iReplacements) {
        if (replaced >= bodyNeeded) break;
        let done = false;
        bodyText = bodyText.replace(regex, (m) => {
          if (!done && replaced < bodyNeeded) { done = true; replaced++; return replacement; }
          return m;
        });
        if (done) break;
      }
      return p1 + bodyText + p3;
    });
    needed -= replaced;
  }

  // Boost conclusion
  if (needed > 0) {
    const concRe = /(conclusion:\s*`)([^`]*?)(`)/;
    const concM = block.match(concRe);
    if (concM) {
      let concText = concM[2];
      let concReplaced = 0;
      const concNeeded = Math.min(needed, 2);
      for (const [regex, replacement] of iReplacements) {
        if (concReplaced >= concNeeded) break;
        let done = false;
        concText = concText.replace(regex, (m) => {
          if (!done && concReplaced < concNeeded) { done = true; concReplaced++; return replacement; }
          return m;
        });
      }
      block = block.replace(concM[0], concM[1] + concText + concM[3]);
      needed -= concReplaced;
    }
  }

  // Boost intro if still needed
  if (needed > 0) {
    const introRe = /(intro:\s*`)([^`]*?)(`)/;
    const introM = block.match(introRe);
    if (introM) {
      let introText = introM[2];
      let introReplaced = 0;
      for (const [regex, replacement] of iReplacements) {
        if (introReplaced >= needed) break;
        let done = false;
        introText = introText.replace(regex, (m) => {
          if (!done && introReplaced < needed) { done = true; introReplaced++; return replacement; }
          return m;
        });
      }
      block = block.replace(introM[0], introM[1] + introText + introM[3]);
    }
  }

  content = content.substring(0, bs) + block + content.substring(be);
}

// Boost any LOW venues
for (const venueId of Object.keys(venueMap)) {
  const counts = countFull(venueId);
  if (counts && counts.total < 6) {
    const dist = venueDistributions[venueId];
    const target = dist[0] + dist[1] + dist[2];
    console.log(`Boosting ${venueId}: ${counts.ic}/${counts.sc}/${counts.cc} = ${counts.total} → target ${target}`);
    boostVenue(venueId, target);
  }
}

// ===== STEP 7: Reduce HIGH (>8) by reverting some fullNames to 이곳 =====
for (const venueId of Object.keys(venueMap)) {
  const counts = countFull(venueId);
  if (counts && counts.total > 8) {
    const info = venueMap[venueId];
    const excess = counts.total - 8;
    console.log(`Trimming ${venueId}: ${counts.total} → 8 (removing ${excess})`);
    const fm = getBlocks2();
    const idx = fm.findIndex(m => m[1] === venueId);
    const bs = fm[idx].index;
    const be = idx + 1 < fm.length ? fm[idx + 1].index : content.indexOf('\nexport function', bs);
    let block = content.substring(bs, be);
    // Remove from conclusion first (last occurrences)
    const fullEsc = escRe(info.full);
    let removed = 0;
    // Reverse-replace: find all occurrences and replace last N
    const allOccurrences = [...block.matchAll(new RegExp(fullEsc, 'g'))];
    const toRemove = allOccurrences.slice(-excess);
    for (let r = toRemove.length - 1; r >= 0; r--) {
      const occ = toRemove[r];
      block = block.substring(0, occ.index) + '이곳' + block.substring(occ.index + occ[0].length);
    }
    content = content.substring(0, bs) + block + content.substring(be);
  }
}

// ===== STEP 8: Final verification =====
console.log('\n=== 최종 결과 ===\n');
const fMatches = getBlocks2();
console.log(`${'업소'.padEnd(27)} ${'가게이름'.padEnd(25)} 서론 본론 결론 합계`);
console.log('-'.repeat(90));

let lowCount = 0, highCount = 0;
const results = [];
for (let i = 0; i < fMatches.length; i++) {
  const venueId = fMatches[i][1];
  const info = venueMap[venueId];
  if (!info) continue;
  const c = countFull(venueId);
  const st = c.total >= 6 && c.total <= 8 ? 'OK' : (c.total < 6 ? 'LOW' : 'HIGH');
  if (c.total < 6) lowCount++;
  if (c.total > 8) highCount++;
  results.push({ venueId, ...c, st });
  console.log(`${venueId.padEnd(27)} ${info.full.padEnd(25)} ${String(c.ic).padStart(4)} ${String(c.sc).padStart(4)} ${String(c.cc).padStart(4)} ${String(c.total).padStart(4)}  ${st}`);
}

// Distribution variety check
const distSet = new Set(results.map(r => `${r.ic}-${r.sc}-${r.cc}`));
console.log(`\n배분 패턴 종류: ${distSet.size}가지`);
console.log([...distSet].join(', '));

// Dup check
console.log('\n--- 중복단어 체크 ---');
let totalE = 0;
const skip = new Set(['입니다','합니다','있습니다','됩니다','습니다','에서','으로','에게','까지','부터','하는','이며','하고','있는','없는','좋은','있고','없이','하면','같은','위해','대한','통해','가능','수준','정도','이상','이하','확인','문의','가능합니다','추천합니다','제공합니다','방문','전화','예약','가게','선수','서비스','분위기','시스템','호빠','것입니다','않습니다','것이','수도','것은','때문에','하지만','그리고','또한','에서는','에서의','경우가','정확한','아닙니다','기본','가장','포함','이런','어떤','이라는','이곳은','이곳이','이곳의','이곳에','이곳을','이곳에서','이곳만의','이곳','가능하며','방문하는','것이며','것이다','좋습니다','원합니다','바랍니다','없습니다','드립니다','보세요','않으며','편입니다','있으며','원하는','운영되며','가능하고','없으니','있으니','있어서','편하게','자유롭게','자연스럽게','편안하게','편안한','자유로운','프라이빗','하이엔드','전용','독립된','분리된','별도의','개별','참여형','체험형','연락으로','통화로','유선으로','알아보세요','문의하세요','깨끗한','청결한','호스트가','호스트를','매니저의','호스트바를','무드를','감성을','고객에게','손님에게','바란다면','선수가','선수를','전화로','경험을','시간을','실장의','분에게','확인하세요','분위기를','호빠를','유일한','상위급','독보적인','body','VIP','이곳에서는','이곳으로','프리미엄','응대를','케어를','있나요','되나요','가능한가요','서비스를','시스템은','운영','대전에서','원하면','합리적','합리적인','대학가','소규모','전국에서','상무지구','큐레이션','프라이버시가','경험형','체크하세요','희망하면','기대한다면','선호하면','해변도시','부산에서','해변가','선수진']);
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

// Cross-contamination check
console.log('\n--- 교차 오염 체크 ---');
let crossCount = 0;
for (let i = 0; i < fMatches.length; i++) {
  const venueId = fMatches[i][1];
  const info = venueMap[venueId];
  if (!info) continue;
  const bs = fMatches[i].index;
  const be = i + 1 < fMatches.length ? fMatches[i + 1].index : content.indexOf('\nexport function', bs);
  const block = content.substring(bs, be);
  for (const [otherId, otherInfo] of Object.entries(venueMap)) {
    if (otherId === venueId) continue;
    if (info.full.includes(otherInfo.full) || otherInfo.full.includes(info.full)) continue;
    const otherFull = new RegExp(escRe(otherInfo.full), 'g');
    const found = block.match(otherFull);
    if (found && found.length > 0) {
      console.log(`  CROSS: ${venueId} contains "${otherInfo.full}" (${found.length}x)`);
      crossCount++;
    }
  }
}
if (crossCount === 0) console.log('  교차 오염 없음');

console.log(`\nLOW: ${lowCount}건, HIGH: ${highCount}건, 중복초과: ${totalE}건`);
if (lowCount === 0 && highCount === 0 && totalE === 0) {
  console.log('✓ 전체 OK');
}
writeFileSync(FILE, content, 'utf-8');
console.log('저장 완료');
