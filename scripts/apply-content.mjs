// 집필한 고유 intro를 venueContent.ts의 해당 업소 블록에 안전하게 주입한다.
// 입력: authored-content.mjs (id → intro 문자열). 백틱/인터폴레이션 없는 순수 텍스트.
import fs from 'fs';
import { authored } from './authored-content.mjs';

const FILE = 'src/data/venueContent.ts';
let src = fs.readFileSync(FILE, 'utf-8');

// 업소 블록 경계 산출
const keyRe = /'([a-z0-9-]+)':\s*\{/g;
const blocks = [];
let m;
while ((m = keyRe.exec(src)) !== null) { if (m.index > 100) blocks.push({ id: m[1], start: m.index }); }

let applied = 0, missing = [];
// 뒤에서부터 교체(인덱스 안정)
for (let i = blocks.length - 1; i >= 0; i--) {
  const id = blocks[i].id;
  const intro = authored[id];
  if (!intro) continue;
  const start = blocks[i].start;
  const end = i < blocks.length - 1 ? blocks[i + 1].start : src.length;
  const block = src.slice(start, end);
  if (intro.includes('`')) { console.error(`백틱 포함 불가: ${id}`); continue; }
  const replaced = block.replace(/intro:\s*`[^`]*`/, 'intro: `' + intro.trim() + '`');
  if (replaced === block) { missing.push(id); continue; }
  src = src.slice(0, start) + replaced + src.slice(end);
  applied++;
}
fs.writeFileSync(FILE, src, 'utf-8');
console.log(`intro 주입: ${applied}곳 / 작성분 ${Object.keys(authored).length}곳`);
if (missing.length) console.log('intro 필드 못찾음:', missing.join(', '));
