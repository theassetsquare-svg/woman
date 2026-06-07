/**
 * Build gate — 다크패턴/가독성/SSR/엔티티 회귀 차단
 * (출력 검사: JS 번들 + 프리렌더 HTML + 실제 JS 렌더)
 *
 * [2단계] 가짜 통계/후기 위젯 재등장 · 금지어 · 본문16px · 터치44 · 놀쿨 직결
 * [3단계] SSR 갭(프리렌더 #root에 본문/FAQ/놀쿨 href 부재) · 짧은 meta(120~160)
 *         · FAQPage schema 누락 · Organization sameAs(nolcool) 누락
 *
 * ※ 다크패턴은 클라이언트 렌더 → HTML grep만으론 못 잡음(번들/렌더로 검사).
 * ※ SSR 본문은 반대로 비-JS HTML(#root)에 실재해야 함(렌더로 보면 거짓PASS).
 *
 * 사용:
 *   node scripts/gate-darkpatterns.mjs                # 번들+HTML 정적
 *   BASE=http://localhost:PORT node scripts/gate-darkpatterns.mjs   # + 실 렌더
 */
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const FAKE_STAT = [
  /명이 보고 있습니다/, /오늘 \d+명이 봤습니다/, /전체 리뷰 \d+개/,
  /리뷰 \d+개 \+ 실시간/, /\d+명 참여/, /이번주 VS 대결/, /VS 투표/,
  /직접 가본 손님의 한마디/, /지금 전화하면.{0,12}번째.{0,4}손님/,
  /\d+초 후 이동/, // AutoplayNext 가짜 카운트다운
];
const BANNED = [/2차/, /초이스/, /노래방/, /성매매/, /미성년/]; // 한글은 \b 미작동 → 평문
const len = (s) => [...String(s)].length;
const fails = [];
const note = (m) => fails.push(m);

// ── 1) JS 번들: 가짜통계 재등장 차단 ──
const assetsDir = 'dist/assets';
if (!existsSync(assetsDir)) note('dist/assets 없음 — npm run build 먼저');
else {
  const blob = readdirSync(assetsDir).filter((f) => f.endsWith('.js'))
    .map((f) => readFileSync(join(assetsDir, f), 'utf8')).join('\n');
  for (const re of FAKE_STAT) if (re.test(blob)) note(`[번들] 가짜통계 재등장: ${re.source}`);
}

// ── 2) 프리렌더 HTML: 금지어 · SSR본문 · meta120~160 · FAQPage · sameAs ──
function walk(d) {
  let r = [];
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) r = r.concat(walk(p));
    else if (e.name === 'index.html') r.push(p);
  }
  return r;
}
function rootInner(html) {
  // 빌드 HTML은 #root 닫힘 뒤 </body> (스크립트는 head). 마지막 </div>까지 그리디 캡처.
  const m = html.match(/<div id="root">([\s\S]*)<\/div>\s*<\/body>/);
  return m ? m[1] : '';
}
function textLen(htmlFrag) {
  return len(htmlFrag.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
}
let sameAsOK = false;
const graph = {}; // route -> Set(target routes)  (내부 링크 그래프)
const ROUTE_RE = /href="https:\/\/woman-5nj\.pages\.dev(\/[^"#?]*)"/g;
function normRoute(p) { return p.endsWith('/') ? p : p + '/'; }
if (existsSync('dist')) {
  const files = walk('dist');
  for (const f of files) {
    const html = readFileSync(f, 'utf8');
    const route = normRoute(f.replace(/^dist/, '').replace(/index\.html$/, '') || '/');
    const is404 = /<title>페이지를 찾을 수 없습니다/.test(html);
    // 금지어
    for (const re of BANNED) if (re.test(html)) note(`[금지어] ${re.source} @ ${route}`);
    if (/"sameAs":\s*\[\s*"https:\/\/nolcool\.com"/.test(html)) sameAsOK = true;
    // og 치수 meta
    if (!is404 && !/<meta property="og:image:height" content="1200"/.test(html)) note(`[og] og:image:height≠1200 @ ${route}`);

    const inner = rootInner(html);
    if (is404) continue; // 404는 색인/그래프 제외
    // SSR: #root 본문 실재
    if (textLen(inner) < 120) note(`[SSR] #root 본문 빈약(${textLen(inner)}자) @ ${route}`);
    if (!/href="https:\/\/nolcool\.com/.test(inner)) note(`[SSR] 놀쿨 href 부재 @ ${route}`);
    // meta 120~160
    const dm = html.match(/<meta name="description" content="([^"]*)"/);
    const dl = dm ? len(dm[1]) : 0;
    if (dl < 120 || dl > 160) note(`[meta] ${dl}자(120~160 이탈) @ ${route}`);
    // venue(NightClub) → FAQPage
    if (/"@type":"NightClub"/.test(html)) {
      if (!/"@type":"FAQPage"/.test(html)) note(`[schema] FAQPage 누락 @ ${route}`);
      if (!/자주 묻는 질문/.test(inner)) note(`[SSR] FAQ 본문 부재 @ ${route}`);
    }
    // 내부 링크 그래프 (#root 기준)
    graph[route] = graph[route] || new Set();
    let mm; ROUTE_RE.lastIndex = 0;
    while ((mm = ROUTE_RE.exec(inner)) !== null) {
      const t = normRoute(mm[1]);
      if (t !== route) graph[route].add(t);
    }
  }
  if (!sameAsOK) note('[schema] Organization sameAs(nolcool) 누락');

  // dead-end(onward 0) · orphan(inbound 0) 교차검증
  const routes = Object.keys(graph);
  const inbound = {};
  routes.forEach((r) => (inbound[r] = 0));
  for (const r of routes) for (const t of graph[r]) if (t in inbound) inbound[t]++;
  for (const r of routes) {
    if (graph[r].size === 0) note(`[dead-end] onward 링크 0 @ ${r}`);
    if (r !== '/' && inbound[r] === 0) note(`[orphan] inbound 0 @ ${r}`);
  }
}

// og 이미지 파일: 1200×1200 + 텍스트 실재(두부/빈카드 아님, 크기>20KB)
if (existsSync('public/og')) {
  const sharp = (await import('sharp')).default;
  const ogs = readdirSync('public/og').filter((f) => f.endsWith('.jpg'));
  for (const f of ogs) {
    const p = join('public/og', f);
    const sz = readFileSync(p).length;
    const meta = await sharp(p).metadata();
    if (meta.width !== 1200 || meta.height !== 1200) note(`[og] 치수 ${meta.width}x${meta.height}≠1200² @ ${f}`);
    if (sz < 20000) note(`[og] ${Math.round(sz / 1024)}KB<20KB(두부/빈카드 의심) @ ${f}`);
  }
}

// ── 3) 실 JS 렌더 (BASE 제공 시): 다크패턴0·본문16px·터치44·놀쿨 ──
const BASE = process.env.BASE;
if (BASE) {
  const CHROME = process.env.CHROME_PATH || '/nix/store/lpdrfl6n16q5zdf8acp4bni7yczzcx3h-idx-builtins/bin/chromium';
  const { default: puppeteer } = await import(join(process.cwd(), 'node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js'));
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  for (const path of ['/', '/busan/mul-night/', '/jangan/hoppa-bbangbbang/']) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)); });
    await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1800));
    const d = await page.evaluate(() => {
      const txt = document.body.innerText;
      const prose = [...document.querySelectorAll('.content-section p, .info-box p, .conclusion-box p, .quickplan-box p')].filter((p) => p.textContent.trim().length > 30);
      const sizes = prose.map((p) => parseFloat(getComputedStyle(p).fontSize));
      const tap = [...document.querySelectorAll('button, a.btn-primary, a.footer-mega-cta, a.main-hook-banner, a[class*="rounded"]')];
      const small = tap.map((e) => { const r = e.getBoundingClientRect(); return { t: (e.innerText || '').slice(0, 14), h: Math.round(r.height), w: Math.round(r.width) }; }).filter((x) => x.w > 0 && x.h > 0 && x.h < 44);
      const nolcool = [...document.querySelectorAll('a')].filter((a) => /nolcool\.com/.test(a.href)).length;
      return { txt, minProse: sizes.length ? Math.min(...sizes) : null, small, nolcool };
    });
    for (const re of FAKE_STAT) if (re.test(d.txt)) note(`[렌더 ${path}] 가짜문구: ${re.source}`);
    if (d.minProse !== null && d.minProse < 16) note(`[렌더 ${path}] 본문 ${d.minProse}px<16`);
    if (d.small.length) note(`[렌더 ${path}] 터치<44 ${d.small.length}: ${JSON.stringify(d.small.slice(0, 4))}`);
    if (d.nolcool < 1) note(`[렌더 ${path}] 놀쿨 링크 소실`);
    if (errs.length) note(`[렌더 ${path}] 콘솔에러 ${errs.length}: ${errs[0]}`);
    await page.close();
  }
  await browser.close();
} else {
  console.log('ℹ️  BASE 미설정 — 실 렌더 생략(정적만). 전체: BASE=http://localhost:PORT');
}

if (fails.length) {
  // 너무 많으면 상위 25개만
  const show = fails.slice(0, 25);
  console.error(`\n❌ GATE FAIL (${fails.length}건):\n` + show.map((f) => '  - ' + f).join('\n') + (fails.length > 25 ? `\n  ... 외 ${fails.length - 25}건` : ''));
  process.exit(1);
}
console.log('\n✅ GATE PASS — 다크패턴0·금지어0·SSR본문/FAQ/놀쿨href 실재·meta120~160·FAQPage·sameAs·본문16px·터치44');
