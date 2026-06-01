/**
 * Auto-fix script for full audit issues:
 * 1. Remove phone numbers from venueContent.ts
 * 2. Reduce "하지만" overuse
 * 3. Fix per-paragraph store name density
 * 4. Fix cross-venue duplicated sentences
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const filePath = resolve(root, 'src/data/venueContent.ts');
let src = readFileSync(filePath, 'utf-8');
let changeCount = 0;

function replace(old, nw) {
  if (src.includes(old)) {
    src = src.replace(old, nw);
    changeCount++;
  } else {
    console.log(`⚠ NOT FOUND: ${old.slice(0, 60)}...`);
  }
}

// ══════════════════════════════════════════
// 1) PHONE NUMBERS
// ══════════════════════════════════════════
console.log('1) Removing phone numbers...');

// busan-menz (010-5557-8179)
replace(
  `'전화번호 010-5557-8179로 예약 가능합니다.',`,
  `'전화로 예약 가능합니다.',`
);
replace(
  `맨즈를 방문할 때는 010-5557-8179로 전화하면 예약과 안내를 받을 수 있으며`,
  `맨즈를 방문할 때는 전화하면 예약과 안내를 받을 수 있으며`
);
replace(
  `전화 예약(010-5557-8179), 대리운전`,
  `전화 예약, 대리운전`
);
replace(
  `정확한 비용은 맨즈(010-5557-8179)에 직접 확인하세요.`,
  `정확한 비용은 맨즈에 직접 전화로 확인하세요.`
);
replace(
  `'네, 010-5557-8179로 예약과 문의가 가능합니다.'`,
  `'네, 전화로 예약과 문의가 가능합니다.'`
);
replace(
  `010-5557-8179로 전화 한 통이면 여기의 밤이 시작됩니다.`,
  `전화 한 통이면 여기의 밤이 시작됩니다.`
);

// suwon-beast (010-8289-9196)
replace(
  `'전화번호 010-8289-9196으로 예약 가능합니다.',`,
  `'전화로 예약 가능합니다.',`
);
replace(
  `010-8289-9196으로 전화하면 예약과 안내가 가능합니다.`,
  `전화하면 예약과 안내가 가능합니다.`
);
replace(
  `비스트(010-8289-9196)에 직접 확인하세요.`,
  `비스트에 직접 전화로 확인하세요.`
);
replace(
  `010-8289-9196으로 연락하세요.`,
  `전화로 연락하세요.`
);
replace(
  `010-8289-9196으로 전화해 여기의 밤을 시작하세요.`,
  `전화 한 통으로 여기의 밤을 시작하세요.`
);

// daejeon-tombar (010-2390-0472)
replace(
  `'가격은 별도 문의이며, 전화번호 010-2390-0472로 예약 가능합니다.',`,
  `'가격은 별도 문의이며, 전화로 예약 가능합니다.',`
);
replace(
  `톰바를 방문하기 전 010-2390-0472로 전화하면`,
  `톰바를 방문하기 전 전화하면`
);
replace(
  `010-2390-0472로 전화하면 그날의 가격과`,
  `전화하면 그날의 가격과`
);
replace(
  `010-2390-0472로 연락하세요.`,
  `전화로 연락하세요.`
);
replace(
  `010-2390-0472로 반드시 확인하세요.`,
  `전화로 반드시 확인하세요.`
);
replace(
  `전화(010-2390-0472)로 문의하면`,
  `전화로 문의하면`
);
replace(
  `010-2390-0472로 전화해서 여기의 밤을 시작하세요.`,
  `전화 한 통으로 여기의 밤을 시작하세요.`
);

// ══════════════════════════════════════════
// 2) "하지만" OVERUSE (replace 8 instances with alternatives)
// ══════════════════════════════════════════
console.log('2) Reducing "하지만" overuse...');

// Find all occurrences and replace every other one
const hajiman = '하지만';
let count = 0;
const alternatives = ['다만', '그런데', '반면', '한편', '그렇지만', '다른 한편으로', '그래도', '그런데도'];
let altIdx = 0;

// Strategic replacements — pick specific instances
const hajimanReplacements = [
  // Replace specific contextual instances
  { old: '하지만, 기본 에티켓은 지켜야', new: '다만, 기본 에티켓은 지켜야' },
  { old: '하지만 워크인도 가능합니다', new: '다만 워크인도 가능합니다' },
  { old: '하지만 여기서는 교체가 자연스러운 시스템', new: '다만 여기서는 교체가 자연스러운 시스템' },
  { old: '하지만 사전 협의가', new: '다만 사전 협의가' },
  { old: '하지만, 주말은', new: '다만, 주말은' },
  { old: '하지만 주말은', new: '다만 주말은' },
  { old: '하지만 오래된 가게 특유의', new: '그런데 오래된 가게 특유의' },
  { old: '하지만 여기는 테이블차지만', new: '반면 여기는 테이블차지만' },
];

for (const r of hajimanReplacements) {
  if (src.includes(r.old)) {
    src = src.replace(r.old, r.new);
    changeCount++;
  }
}

// ══════════════════════════════════════════
// 3) CROSS-VENUE DUPLICATED SENTENCES
// ══════════════════════════════════════════
console.log('3) Fixing cross-venue duplicated sentences...');

// "기본 음료와 안주가 포함되며, 선수 교체는 자유롭게 가능합니다"
// appears in seoul-wclub and busan-w — change one
replace(
  // in busan-w context: change to different wording
  `기본 음료와 안주가 포함되며, 선수 교체는 자유롭게 가능합니다. 여기의 진짜`,
  `음료·안주가 기본으로 들어가고, 선수 교체는 눈치 없이 요청하면 됩니다. 여기의 진짜`
);

// "추가 비용은 양주 업그레이드 외에는 거의 없습니다"
// appears in busan-david and busan-aura — change one
replace(
  // in busan-aura context
  `추가 비용은 양주 업그레이드 외에는 거의 없습니다. 여기는 "싼`,
  `양주를 별도로 올리지 않는 한 추가 지출이 거의 없습니다. 여기는 "싼`
);

// ══════════════════════════════════════════
// 4) PER-PARAGRAPH NAME DENSITY (max 2)
// ══════════════════════════════════════════
console.log('4) Fixing per-paragraph name density...');

// Parse venues from venues.ts
const venuesSource = readFileSync(resolve(root, 'src/data/venues.ts'), 'utf-8');
const venues = [];
const vRe = /id:\s*'([^']+)',\s*\n\s*name:\s*'([^']+)'/g;
let vm;
while ((vm = vRe.exec(venuesSource)) !== null) venues.push({ id: vm[1], name: vm[2] });

// For each venue block, find paragraphs with >2 name mentions
const blockRe = /'([a-z]+-[a-z0-9-]+)':\s*\{/g;
const ids = [];
let bm;
while ((bm = blockRe.exec(src)) !== null) ids.push({ id: bm[1], start: bm.index });

let paraFixes = 0;
for (let i = 0; i < ids.length; i++) {
  const start = ids[i].start;
  const end = i + 1 < ids.length ? ids[i + 1].start : src.length;
  const block = src.slice(start, end);
  const name = venues.find(v => v.id === ids[i].id)?.name;
  if (!name) continue;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Find intro and body texts
  const textRe = /(?:intro|body):\s*`([^`]+)`/gs;
  let tm;
  while ((tm = textRe.exec(block)) !== null) {
    const fullText = tm[1];
    const paras = fullText.split(/\n\n+/);
    for (const para of paras) {
      const matches = para.match(new RegExp(escaped, 'g'));
      if (matches && matches.length > 2) {
        // Need to reduce: replace 3rd+ occurrence in this paragraph with "여기" or "이 가게"
        let newPara = para;
        let replaceCount = 0;
        const replacements = ['여기', '이 가게', '이곳의'];
        // Actually "이곳" is banned! Use "여기" and "이 가게"
        const safeReplacements = ['여기', '이 가게'];

        // Replace from last occurrence backward (keep first 2)
        let idx = -1;
        let occurrence = 0;
        const positions = [];
        while ((idx = newPara.indexOf(name, idx + 1)) !== -1) {
          positions.push(idx);
        }

        if (positions.length > 2) {
          // Replace from the end to preserve positions
          for (let p = positions.length - 1; p >= 2; p--) {
            const pos = positions[p];
            const replacement = safeReplacements[(p - 2) % safeReplacements.length];
            // Check context: if it's at sentence start (after . or newline) or after comma/space
            const before = pos > 0 ? newPara[pos - 1] : '';
            const after = newPara[pos + name.length] || '';

            // Simple replacement
            newPara = newPara.slice(0, pos) + replacement + newPara.slice(pos + name.length);
            paraFixes++;
          }

          // Apply to src
          if (newPara !== para) {
            const srcIdx = src.indexOf(para, start);
            if (srcIdx >= start && srcIdx < (i + 1 < ids.length ? ids[i + 1].start : src.length)) {
              src = src.slice(0, srcIdx) + newPara + src.slice(srcIdx + para.length);
              changeCount++;
            }
          }
        }
      }
    }
  }
}

console.log(`  Fixed ${paraFixes} paragraph density issues`);

// ══════════════════════════════════════════
// Write result
// ══════════════════════════════════════════
writeFileSync(filePath, src, 'utf-8');
console.log(`\nDone. ${changeCount} changes applied.`);
