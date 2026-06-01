// GSC + live-site health monitor — the autonomous engine.
// Runs deterministically (no AI). Detects problems and writes a report.
// Exit code 0 = healthy, 1 = problems found (CI fails → GitHub emails owner).
//
//   node scripts/gsc-monitor.mjs
//
// Checks:
//   1. GSC API auth + property access
//   2. Every sitemap URL returns 200 (following the canonical 308)
//   3. Each page's <link canonical> matches its own final URL (no homepage bleed)
//   4. Known legacy/dead URLs now 301/404 (no soft-404 regression)
//   5. GSC cannibalization: a query ranking with >1 page
//   6. GSC opportunities: high-impression, low-position queries
import fs from 'node:fs';
import { gscClient } from './gsc-lib.mjs';

const SITE = process.env.GSC_SITE || 'https://woman-5nj.pages.dev/';
const ORIGIN = SITE.replace(/\/$/, '');
const OUT_DIR = 'reports/gsc';
const problems = [];
const warnings = [];
const info = [];

function dateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const f = (d) => d.toISOString().slice(0, 10);
  return { startDate: f(start), endDate: f(end) };
}

async function head(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const body = await res.text();
    const canon = (body.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
    const robots = (body.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
    const title = (body.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    return { status: res.status, finalUrl: res.url, canon, robots, title };
  } catch (e) {
    return { status: 0, error: e.message };
  }
}

async function mapPool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return out;
}

// Legacy URLs that MUST not soft-404 to the homepage anymore.
const LEGACY = [
  '/gangnam/boston',
  '/jangan/cube',
  '/busan/david',
  '/gangnam/blackhole',
  '/busan/mulnight',
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1) GSC auth
  let gsc;
  try {
    gsc = await gscClient();
    const sites = await gsc.listSites();
    const me = (sites.siteEntry || []).find((s) => s.siteUrl === SITE);
    if (!me) problems.push(`GSC: 서비스계정이 ${SITE} 속성에 접근 불가 (소유자 추가 필요)`);
    else info.push(`GSC 접근 OK (${me.permissionLevel})`);
  } catch (e) {
    problems.push(`GSC 인증 실패: ${e.message}`);
  }

  // 2+3) Live sitemap URL health + canonical match
  let sitemapUrls = [];
  try {
    const sm = fs.readFileSync('public/sitemap.xml', 'utf8');
    sitemapUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  } catch {
    warnings.push('sitemap.xml 읽기 실패 — 로컬 체크 건너뜀');
  }

  if (sitemapUrls.length) {
    const results = await mapPool(sitemapUrls, 12, async (u) => ({ u, ...(await head(u)) }));
    let ok = 0;
    for (const r of results) {
      if (r.status !== 200) {
        problems.push(`다운/오류 페이지: ${r.u} → status ${r.status}${r.error ? ' (' + r.error + ')' : ''}`);
        continue;
      }
      ok++;
      // canonical은 자기 자신(트레일링 슬래시)을 가리켜야 함
      const expected = r.u;
      if (r.canon && r.canon.replace(/\/$/, '') !== expected.replace(/\/$/, '')) {
        problems.push(`canonical 불일치: ${r.u} → canonical=${r.canon}`);
      }
      if (/noindex/.test(r.robots)) {
        problems.push(`sitemap URL이 noindex: ${r.u}`);
      }
    }
    info.push(`라이브 URL 점검: ${ok}/${sitemapUrls.length} OK (200)`);
  }

  // 4) Legacy/dead URLs must NOT return 200-with-homepage
  for (const path of LEGACY) {
    const r = await head(ORIGIN + path);
    // 301→region(200) is fine; what's bad is a 200 whose canonical is the homepage
    const isSoft404 = r.status === 200 && r.canon && /pages\.dev\/?$/.test(r.canon.replace(/\/$/, '') + '/');
    const servesHome = r.title && /TOP 103|전국 나이트·클럽/.test(r.title) && r.finalUrl.replace(/\/$/, '').endsWith(path);
    if (isSoft404 || servesHome) {
      problems.push(`레거시 soft-404 재발: ${path} → ${r.finalUrl} (홈 콘텐츠 200)`);
    }
  }

  // 5+6) GSC analytics — cannibalization & opportunities
  if (gsc) {
    try {
      const qp = await gsc.query(SITE, { ...dateRange(90), dimensions: ['query', 'page'], rowLimit: 2000 });
      const byQ = {};
      for (const row of qp.rows || []) {
        const [q, p] = row.keys;
        (byQ[q] = byQ[q] || new Set()).add(p);
      }
      const cannibal = Object.entries(byQ).filter(([, ps]) => ps.size > 1);
      if (cannibal.length) {
        warnings.push(`카니발리제이션 ${cannibal.length}건 (한 키워드에 2+ 페이지 경쟁)`);
        for (const [q, ps] of cannibal.slice(0, 15)) {
          info.push(`  · "${q}" → ${[...ps].map((p) => p.replace(ORIGIN, '')).join(' , ')}`);
        }
      }

      const q = await gsc.query(SITE, { ...dateRange(28), dimensions: ['query'], rowLimit: 500 });
      const opp = (q.rows || [])
        .filter((r) => r.impressions >= 5 && r.position > 8 && r.position <= 30)
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 15);
      if (opp.length) {
        info.push(`상위노출 기회 키워드 (노출多·순위 9~30위) ${opp.length}건:`);
        for (const r of opp) info.push(`  ↑ "${r.keys[0]}" pos=${r.position.toFixed(1)} imp=${r.impressions} clk=${r.clicks}`);
      }
    } catch (e) {
      warnings.push(`GSC 분석 조회 실패: ${e.message}`);
    }
  }

  // Report
  const stamp = new Date().toISOString();
  const report = { stamp, site: SITE, problems, warnings, info };
  fs.writeFileSync(`${OUT_DIR}/monitor-report.json`, JSON.stringify(report, null, 2));

  const md = [
    `# GSC/사이트 모니터 리포트`,
    `- 시각: ${stamp}`,
    `- 사이트: ${SITE}`,
    ``,
    `## 🔴 문제 (${problems.length})`,
    ...(problems.length ? problems.map((p) => `- ${p}`) : ['- 없음 ✅']),
    ``,
    `## 🟡 경고 (${warnings.length})`,
    ...(warnings.length ? warnings.map((w) => `- ${w}`) : ['- 없음']),
    ``,
    `## ℹ️ 정보`,
    ...info.map((i) => `- ${i}`),
    ``,
  ].join('\n');
  fs.writeFileSync(`${OUT_DIR}/monitor-report.md`, md);
  console.log(md);

  if (problems.length) {
    console.error(`\n[FAIL] 문제 ${problems.length}건 발견`);
    process.exit(1);
  }
  console.log(`\n[OK] 문제 없음`);
}

main().catch((e) => {
  console.error('MONITOR ERROR:', e.message);
  process.exit(1);
});
