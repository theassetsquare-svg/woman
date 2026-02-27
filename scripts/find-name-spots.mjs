import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const src = readFileSync(resolve(root, 'src/data/venueContent.ts'), 'utf-8');

const targets = ['seoul-flirting','busan-david','busan-w','suwon-beast','gwangju-w'];
const names = {'seoul-flirting':'플러팅진혁','busan-david':'다비드바','busan-w':'더블유(W)','suwon-beast':'비스트','gwangju-w':'W'};

const blockRe = /'([a-z]+-[a-z0-9-]+)':\s*\{/g;
const ids = [];
let bm;
while ((bm = blockRe.exec(src)) !== null) ids.push({ id: bm[1], start: bm.index });

for (const tid of targets) {
  const idx = ids.findIndex(i => i.id === tid);
  if (idx < 0) continue;
  const start = ids[idx].start;
  const end = idx + 1 < ids.length ? ids[idx + 1].start : src.length;
  const block = src.slice(start, end);
  const name = names[tid];

  // Find conclusion
  const cRe = /conclusion:\s*`([^`]+)`/s;
  const cm = cRe.exec(block);
  if (cm) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cnt = (cm[1].match(new RegExp(escaped, 'g')) || []).length;
    console.log(`${tid} conclusion has ${cnt} mentions of "${name}"`);
    console.log(`  Text: ${cm[1].slice(0, 120)}`);
  }

  // Find quickPlan.decision
  const dRe = /decision:\s*'([^']+)'/;
  const dm = dRe.exec(block);
  if (dm) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cnt = (dm[1].match(new RegExp(escaped, 'g')) || []).length;
    console.log(`${tid} decision has ${cnt} mentions of "${name}"`);
  }
  console.log('---');
}
