import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = resolve(__dirname, '..', 'src/data/venueContent.ts');
let content = readFileSync(filePath, 'utf-8');

function replaceInVenue(venueId, oldText, newText, max = 1) {
  const startPattern = `'${venueId}': {`;
  const startIdx = content.indexOf(startPattern);
  if (startIdx === -1) return 0;
  let endIdx = content.length;
  const r = /\n'[a-z]+-[a-z]/g;
  r.lastIndex = startIdx + startPattern.length;
  const m = r.exec(content);
  if (m) endIdx = m.index;
  let section = content.substring(startIdx, endIdx);
  let count = 0, lastIdx = section.length;
  while (count < max) {
    const idx = section.lastIndexOf(oldText, lastIdx - 1);
    if (idx === -1) break;
    section = section.substring(0, idx) + newText + section.substring(idx + oldText.length);
    lastIdx = idx;
    count++;
  }
  content = content.substring(0, startIdx) + section + content.substring(endIdx);
  return count;
}

// gangnam-flirting: "호스트" 6→4 (I added 2 by converting 캐스트→호스트, but there were already 4)
// Need to replace 2 "호스트" with "선수" or "파트너"
let r;
r = replaceInVenue('gangnam-flirting', '호스트', '선수', 2);
console.log(`gangnam-flirting: "호스트" → "선수" x${r}`);

// jangan-bbangbbang: "에너지" 5→4 (I converted 텐션→에너지, but there were already 4)
// Replace 1 "에너지" with "바이브"
r = replaceInVenue('jangan-bbangbbang', '에너지', '바이브', 1);
console.log(`jangan-bbangbbang: "에너지" → "바이브" x${r}`);

// busan-q: "일정" 5→4, "해안" 5→4
// Need 1 more each
r = replaceInVenue('busan-q', '일정', '스케줄', 1);
console.log(`busan-q: "일정" → "스케줄" x${r}`);
r = replaceInVenue('busan-q', '해안', '물가', 1);
console.log(`busan-q: "해안" → "물가" x${r}`);

// busan-menz: "호스트" 5→4
r = replaceInVenue('busan-menz', '호스트', '파트너', 1);
console.log(`busan-menz: "호스트" → "파트너" x${r}`);

writeFileSync(filePath, content, 'utf-8');
console.log('\n✅ Remaining fixes applied');
