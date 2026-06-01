// 주간 순위 비교 리포트.
// 오늘 GSC 데이터를 baseline과 비교해 순위 상승/하락·신규/이탈 키워드,
// 가게이름 순위, 상위노출 기회 키워드를 정리한다.
//   GOOGLE_APPLICATION_CREDENTIALS=/path/key.json node scripts/gsc-rank-report.mjs
// baseline 갱신:  node scripts/gsc-rank-report.mjs --save-baseline
import fs from 'node:fs';
import { gscClient } from './gsc-lib.mjs';

const SITE = process.env.GSC_SITE || 'https://woman-5nj.pages.dev/';
const ORIGIN = SITE.replace(/\/$/, '');
const DIR = 'reports/gsc';
const BASE_Q = `${DIR}/baseline-queries.json`;
const saveBaseline = process.argv.includes('--save-baseline');

function range(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const f = (d) => d.toISOString().slice(0, 10);
  return { startDate: f(start), endDate: f(end) };
}

const main = async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const gsc = await gscClient();
  const cur = (await gsc.query(SITE, { ...range(28), dimensions: ['query'], rowLimit: 1000 })).rows || [];
  const curMap = new Map(cur.map((r) => [r.keys[0], r]));

  if (saveBaseline) {
    fs.writeFileSync(BASE_Q, JSON.stringify({ stamp: new Date().toISOString().slice(0, 10), rows: cur }, null, 2));
    console.log(`baseline 저장: ${cur.length} 쿼리 (${BASE_Q})`);
    return;
  }

  const base = fs.existsSync(BASE_Q) ? JSON.parse(fs.readFileSync(BASE_Q, 'utf8')) : { rows: [] };
  const baseMap = new Map((base.rows || []).map((r) => [r.keys[0], r]));

  const movedUp = [], movedDown = [], fresh = [], lost = [];
  for (const [q, r] of curMap) {
    const b = baseMap.get(q);
    if (!b) { if (r.impressions >= 2) fresh.push(r); continue; }
    const delta = b.position - r.position; // 양수 = 순위 상승(숫자 작아짐)
    if (delta >= 1.5) movedUp.push({ q, from: b.position, to: r.position, imp: r.impressions });
    else if (delta <= -1.5) movedDown.push({ q, from: b.position, to: r.position, imp: r.impressions });
  }
  for (const [q, b] of baseMap) if (!curMap.has(q) && b.impressions >= 2) lost.push(b);

  const opp = cur
    .filter((r) => r.impressions >= 3 && r.position > 4.5 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions).slice(0, 20);

  const fmtRow = (x) => `"${x.q}" ${x.from.toFixed(1)}→${x.to.toFixed(1)}위 (imp ${x.imp})`;
  const stamp = new Date().toISOString().slice(0, 10);
  const md = [
    `# 주간 GSC 순위 분석 — ${stamp}`,
    `기준선: ${base.stamp || '없음'} / 현재 28일 쿼리 ${cur.length}개`,
    ``,
    `## ⬆️ 순위 상승 (${movedUp.length})`,
    ...(movedUp.sort((a, b) => (b.from - b.to) - (a.from - a.to)).slice(0, 20).map((x) => `- ${fmtRow(x)}`) || []),
    ``,
    `## ⬇️ 순위 하락 (${movedDown.length})`,
    ...(movedDown.sort((a, b) => (a.from - a.to) - (b.from - b.to)).slice(0, 15).map((x) => `- ${fmtRow(x)}`) || []),
    ``,
    `## 🆕 신규 노출 키워드 (${fresh.length})`,
    ...fresh.sort((a, b) => b.impressions - a.impressions).slice(0, 15).map((r) => `- "${r.keys[0]}" ${r.position.toFixed(1)}위 (imp ${r.impressions})`),
    ``,
    `## 🎯 상위노출 기회 (노출多·5~20위 — 다음 작업 우선순위)`,
    ...opp.map((r) => `- "${r.keys[0]}" ${r.position.toFixed(1)}위 imp=${r.impressions} clk=${r.clicks} ctr=${(r.ctr * 100).toFixed(0)}%`),
    ``,
    `## ⚠️ 이탈(노출 사라짐) (${lost.length})`,
    ...lost.sort((a, b) => b.impressions - a.impressions).slice(0, 10).map((r) => `- "${r.keys[0]}" (기준 imp ${r.impressions})`),
    ``,
  ].join('\n');

  fs.writeFileSync(`${DIR}/weekly-${stamp}.md`, md);
  console.log(md);
};

main().catch((e) => { console.error('RANK REPORT ERROR:', e.message); process.exit(1); });
