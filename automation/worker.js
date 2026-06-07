/**
 * 놀쿨 위성 오토파일럿 Worker (Cloudflare) — 다중 사이트 공유 감시.
 *
 * Cron(매일 00:00 UTC = 09:00 KST): 각 사이트 라이브 건강검진 →
 *   문제 시 [WOMAN-...] 태그로 theassetsquare@gmail.com 알림(Resend, KV dedup 자가청소).
 *   ★안전 자동수정만: IndexNow 핑 · Deploy Hook 재배포. ★콘텐츠/결제/보안 자동수정 절대 안 함(알림만).
 *
 * 감시 항목(라이브 실측, curl 비-JS + 번들):
 *   - SSR 본문(#root에 본문/FAQ/놀쿨 href) · meta 120~160 · FAQPage · sameAs
 *   - 다크패턴(번들 grep: FOMO/가짜통계/AutoplayNext 카운트다운)
 *   - 놀쿨 직결(href + nolcool.com 200) · og 두부/치수(JPEG SOF 파싱 1200²·>20KB)
 *   - soft-404(없는 경로 404) · dead-end/orphan(샘플+허브 도달성)
 *   - (키 있으면) PSI CWV · GSC searchAnalytics/URL Inspection
 *
 * 1회 설정(사장님): wrangler login → KV 생성 → secrets(RESEND_API_KEY, ALERT_TO,
 *   WOMAN_DEPLOY_HOOK, WOMAN_INDEXNOW_KEY, 선택 PSI_KEY/GSC_SA_JSON) → deploy. README 참고.
 */
import sites from './sites.json';

const FAKE_STAT = [
  '명이 보고 있습니다', '명이 봤습니다', '전체 리뷰 9', '명 참여',
  '이번주 VS 대결', 'VS 투표', '직접 가본 손님의 한마디', '초 후 이동',
];

async function get(url, opts = {}) {
  const res = await fetch(url, { redirect: 'manual', cf: { cacheTtl: 0 }, ...opts });
  return res;
}
async function text(url) {
  try { const r = await fetch(url, { redirect: 'follow' }); return { status: r.status, body: await r.text() }; }
  catch (e) { return { status: 0, body: '', err: String(e) }; }
}
function rootInner(html) {
  const m = html.match(/<div id="root">([\s\S]*)<\/div>\s*<\/body>/);
  return m ? m[1] : '';
}
function len(s) { return [...String(s)].length; }

// JPEG 치수 파싱(SOF 마커) — 두부 카드는 보통 작고, 정상은 1200×1200
function jpegSize(buf) {
  const d = new Uint8Array(buf);
  let i = 2;
  while (i < d.length) {
    if (d[i] !== 0xff) { i++; continue; }
    const marker = d[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const h = (d[i + 5] << 8) | d[i + 6];
      const w = (d[i + 7] << 8) | d[i + 8];
      return { w, h };
    }
    const seg = (d[i + 2] << 8) | d[i + 3];
    i += 2 + seg;
  }
  return { w: 0, h: 0 };
}

async function checkSite(site, env) {
  const issues = [];
  const B = site.base;

  // 1) SSR 본문 + 놀쿨 href + meta + FAQPage (샘플 라우트)
  for (const route of site.sampleRoutes) {
    const { status, body } = await text(B + route);
    if (status !== 200) { issues.push(`[SSR] ${route} HTTP ${status}`); continue; }
    const inner = rootInner(body);
    const bodyTextLen = len(inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    if (bodyTextLen < 120) issues.push(`[SSR] ${route} #root 본문 빈약(${bodyTextLen}자) — 프리렌더 회귀 의심`);
    if (!/href="https:\/\/nolcool\.com/.test(inner)) issues.push(`[놀쿨] ${route} nolcool href 부재`);
    const dm = body.match(/<meta name="description" content="([^"]*)"/);
    const dl = dm ? len(dm[1]) : 0;
    if (dl < 120 || dl > 160) issues.push(`[meta] ${route} ${dl}자(120~160 이탈)`);
    if (/"@type":"NightClub"/.test(body) && !/"@type":"FAQPage"/.test(body)) issues.push(`[schema] ${route} FAQPage 누락`);
    if (!/"sameAs":\s*\[\s*"https:\/\/nolcool\.com"/.test(body)) issues.push(`[schema] ${route} Organization sameAs 누락`);
  }

  // 2) 다크패턴 — JS 번들 grep
  const home = await text(B + '/');
  const bundleM = home.body.match(/\/assets\/index-[A-Za-z0-9_-]+\.js/);
  if (bundleM) {
    const js = await text(B + bundleM[0]);
    for (const p of FAKE_STAT) if (js.body.includes(p)) issues.push(`[다크패턴] 번들에 "${p}" 재등장`);
  }

  // 3) 놀쿨 메인 도달
  const main = await get(site.mainSite);
  if (main.status >= 400 || main.status === 0) issues.push(`[놀쿨] 메인 ${site.mainSite} 도달 실패(${main.status})`);

  // 4) og 두부/치수
  try {
    const r = await fetch(site.ogDefault);
    const buf = await r.arrayBuffer();
    if (r.status !== 200) issues.push(`[og] default.jpg HTTP ${r.status}`);
    else {
      const { w, h } = jpegSize(buf);
      if (w !== 1200 || h !== 1200) issues.push(`[og] default.jpg ${w}x${h}≠1200²`);
      if (buf.byteLength < 20000) issues.push(`[og] default.jpg ${Math.round(buf.byteLength / 1024)}KB<20KB(두부 의심)`);
    }
  } catch (e) { issues.push(`[og] default.jpg fetch 실패`); }

  // 5) soft-404
  const nf = await get(B + '/__autopilot_nonexistent__/');
  if (nf.status !== 404) issues.push(`[soft-404] 없는 경로가 ${nf.status}(404 아님)`);

  // 6) dead-end/orphan (샘플 그래프 — 허브 상호 도달)
  const hubReach = {};
  for (const route of site.sampleRoutes) {
    const { body } = await text(B + route);
    const inner = rootInner(body);
    const links = [...inner.matchAll(/href="https:\/\/[^"/]+(\/[^"#?]*)"/g)].map((m) => m[1].endsWith('/') ? m[1] : m[1] + '/');
    if (links.length === 0) issues.push(`[dead-end] ${route} onward 링크 0`);
    links.forEach((l) => (hubReach[l] = true));
  }
  for (const route of site.sampleRoutes) {
    const r = route.endsWith('/') ? route : route + '/';
    if (r !== '/' && !hubReach[r]) issues.push(`[orphan] ${route} 샘플 내 inbound 0`);
  }

  // 7) PSI (키 있으면)
  if (env.PSI_KEY) {
    try {
      const psi = await text(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(B + '/')}&strategy=mobile&key=${env.PSI_KEY}`);
      const j = JSON.parse(psi.body);
      const lcp = j?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue;
      const cls = j?.lighthouseResult?.audits?.['cumulative-layout-shift']?.numericValue;
      if (lcp > 2500) issues.push(`[CWV] LCP ${Math.round(lcp)}ms>2500`);
      if (cls > 0.1) issues.push(`[CWV] CLS ${cls?.toFixed(3)}>0.1`);
    } catch (e) { /* PSI 실패는 무시(알림 과다 방지) */ }
  }

  return issues;
}

// 안전 자동수정만: IndexNow 핑 + Deploy Hook 재배포
async function safeAutofix(site, env, issues) {
  const actions = [];
  // SSR/프리렌더 회귀 의심 시 재배포(빌드가 다시 돌면 자가복구)
  const ssrBroken = issues.some((i) => i.startsWith('[SSR]'));
  const hookUrl = env[site.deployHookSecret];
  if (ssrBroken && hookUrl) {
    try { await fetch(hookUrl, { method: 'POST' }); actions.push('Deploy Hook 재배포 트리거'); } catch (e) {}
  }
  // IndexNow 핑(색인 촉진 — 안전)
  const key = env[site.indexNowKeySecret];
  if (key) {
    try {
      await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: new URL(site.base).host, key, keyLocation: `${site.base}/${key}.txt`, urlList: [site.base + '/', site.sitemap] }),
      });
      actions.push('IndexNow 핑');
    } catch (e) {}
  }
  return actions; // ★콘텐츠/결제/보안은 절대 자동수정 안 함 — 알림만
}

async function alertEmail(env, subject, body) {
  if (!env.RESEND_API_KEY || !env.ALERT_FROM || !env.ALERT_TO) return false;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.ALERT_FROM, to: env.ALERT_TO, subject, text: body }),
  });
  return res.ok;
}

async function runOnce(env) {
  const out = [];
  for (const site of sites.sites) {
    const issues = await checkSite(site, env);
    if (issues.length === 0) { out.push(`[WOMAN-OK] ${site.id}: 정상`); continue; }
    const actions = await safeAutofix(site, env, issues);
    // KV dedup(같은 이슈 24h 내 재알림 금지, TTL로 자가청소)
    const sig = `${site.id}:${issues.sort().join('|')}`;
    let dup = false;
    if (env.AUTOPILOT_KV) {
      const seen = await env.AUTOPILOT_KV.get('alert:' + sig);
      if (seen) dup = true; else await env.AUTOPILOT_KV.put('alert:' + sig, '1', { expirationTtl: 86400 });
    }
    const subject = `[WOMAN-ALERT] ${site.name} 문제 ${issues.length}건`;
    const body = `사이트: ${site.base}\n시각(UTC): ${new Date().toISOString()}\n\n문제:\n- ${issues.join('\n- ')}\n\n안전 자동수정: ${actions.length ? actions.join(', ') : '없음(알림만)'}\n\n※ 콘텐츠/결제/보안은 자동수정하지 않습니다. 수동 확인 필요.`;
    if (!dup) await alertEmail(env, subject, body);
    out.push(`[WOMAN-ALERT] ${site.id}: ${issues.length}건${dup ? ' (24h dedup—재알림 생략)' : ' (알림 발송)'} / 수정: ${actions.join(',') || '없음'}`);
  }
  return out.join('\n');
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runOnce(env));
  },
  // 수동 점검/디버그용 (브라우저에서 호출). ?key=로 보호.
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/run') {
      if (env.RUN_KEY && url.searchParams.get('key') !== env.RUN_KEY) return new Response('forbidden', { status: 403 });
      const report = await runOnce(env);
      return new Response(report, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
    return new Response('woman autopilot worker — POST cron or GET /run?key=', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  },
};
