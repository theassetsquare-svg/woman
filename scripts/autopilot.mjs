// 통합 자동 점검 (오늘 한 모든 점검을 한 번에).
//   node scripts/autopilot.mjs
// 순서: 빌드 → 콘텐츠 감사 → 가게이름 SEO 전수점검 → 라이브 건강검진(전 페이지)
// 결과를 reports/gsc/autopilot-report.md 에 통합 기록. 문제 있으면 exit 1.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const DIR = 'reports/gsc';
fs.mkdirSync(DIR, { recursive: true });

const steps = [
  { name: '빌드(프리렌더+sitemap)', cmd: 'npm run build', failOnError: true },
  { name: '콘텐츠 감사(중복/스터핑)', cmd: 'node scripts/audit.mjs', passToken: 'PASS' },
  { name: '가게이름 SEO 전수점검', cmd: 'node scripts/name-seo-audit.mjs', passToken: 'PASS' },
  { name: '라이브 건강검진(전 페이지)', cmd: 'node scripts/gsc-monitor.mjs', passToken: '[OK]' },
];

const results = [];
let failed = 0;

for (const s of steps) {
  let out = '', ok = true;
  try {
    out = execSync(s.cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
    ok = false;
  }
  // passToken 기반 판정(스크립트가 exit code를 안 줘도 PASS/OK 텍스트로 확인)
  if (s.passToken) ok = out.includes(s.passToken);
  if (s.failOnError && /error|Error|ERR_/.test(out) && !out.includes('built in')) ok = false;
  if (!ok) failed++;
  results.push({ name: s.name, ok, out });
  console.log(`${ok ? '✅' : '🔴'} ${s.name}`);
}

const stamp = new Date().toISOString();
const md = [
  `# 자동 점검 리포트 (autopilot)`,
  `- 시각: ${stamp}`,
  `- 결과: ${failed === 0 ? '문제 없음 ✅' : `🔴 문제 ${failed}건`}`,
  '',
  ...results.map((r) => {
    const tail = r.out.trim().split('\n').slice(-12).join('\n');
    return `## ${r.ok ? '✅' : '🔴'} ${r.name}\n\n\`\`\`\n${tail}\n\`\`\`\n`;
  }),
].join('\n');
fs.writeFileSync(`${DIR}/autopilot-report.md`, md);

console.log(`\n=== autopilot: ${failed === 0 ? 'ALL PASS ✅' : `${failed}건 문제 발견 🔴`} ===`);
console.log(`리포트: ${DIR}/autopilot-report.md`);
process.exit(failed ? 1 : 0);
