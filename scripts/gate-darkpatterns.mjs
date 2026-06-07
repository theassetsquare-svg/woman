/**
 * Build gate — 다크패턴/가독성 회귀 차단 (출력 검사: JS 번들 + 실제 JS 렌더)
 *
 * 검사 항목:
 *   1) 가짜 통계/후기 문구가 빌드 산출 JS 번들에 재등장 → 차단
 *      (FomoCounter "N명이 보고 있습니다" / 가짜 리뷰수 / "오늘 N명이 봤습니다"
 *       / 가짜 투표 "N명 참여"·"VS 대결" / 가짜 후기 "직접 가본 손님의 한마디"
 *       / 가짜 대기열 "지금 전화하면 N번째 손님")
 *   2) 금지어(2차·초이스·노래방·성매매·미성년) 렌더 HTML 재등장 → 차단
 *   3) (선택) BASE 환경변수가 있으면 실제 JS 렌더로:
 *      - 위 가짜 문구가 화면에 0
 *      - 본문 reading 텍스트 ≥16px
 *      - 실제 버튼/CTA/칩 터치타깃 ≥44px (인라인 텍스트 링크 제외)
 *      - 놀쿨 직결 링크 보존(회귀 방지)
 *
 * 사용:
 *   node scripts/gate-darkpatterns.mjs                 # 번들+HTML 정적 검사
 *   BASE=http://localhost:4321 node scripts/gate-darkpatterns.mjs   # + 실 렌더 검사
 *
 * ※ HTML grep만으로는 못 잡는다(다크패턴은 클라이언트 렌더). 반드시 번들/렌더로 검사.
 */
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const FAKE_STAT = [
  /명이 보고 있습니다/,
  /오늘 \d+명이 봤습니다/,
  /전체 리뷰 \d+개/,
  /리뷰 \d+개 \+ 실시간/,
  /\d+명 참여/,
  /이번주 VS 대결/,
  /VS 투표/,
  /직접 가본 손님의 한마디/,
  /지금 전화하면.{0,12}번째.{0,4}손님/,
];
const BANNED = [/\b2차\b/, /초이스/, /노래방/, /성매매/, /미성년/];

const fails = [];
const note = (m) => fails.push(m);

// ── 1) JS 번들 정적 검사 ──────────────────────────────────────────
const assetsDir = 'dist/assets';
if (!existsSync(assetsDir)) {
  note(`dist/assets 없음 — 먼저 빌드하세요 (npm run build)`);
} else {
  const js = readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
  const blob = js.map((f) => readFileSync(join(assetsDir, f), 'utf8')).join('\n');
  for (const re of FAKE_STAT) {
    if (re.test(blob)) note(`[번들] 가짜통계 문구 재등장: ${re.source}`);
  }
}

// ── 2) 렌더 HTML 금지어 검사 ──────────────────────────────────────
function walk(d) {
  let r = [];
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) r = r.concat(walk(p));
    else if (e.name.endsWith('.html')) r.push(p);
  }
  return r;
}
if (existsSync('dist')) {
  const html = walk('dist').map((f) => readFileSync(f, 'utf8')).join('\n');
  for (const re of BANNED) {
    if (re.test(html)) note(`[HTML] 금지어 재등장: ${re.source}`);
  }
}

// ── 3) 실제 JS 렌더 검사 (BASE 제공 시) ───────────────────────────
const BASE = process.env.BASE;
if (BASE) {
  const CHROME = process.env.CHROME_PATH ||
    '/nix/store/lpdrfl6n16q5zdf8acp4bni7yczzcx3h-idx-builtins/bin/chromium';
  const { default: puppeteer } = await import(
    join(process.cwd(), 'node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')
  );
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const PAGES = ['/', '/busan/mul-night/', '/jangan/hoppa-bbangbbang/'];
  for (const path of PAGES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)); });
    await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1800));
    const d = await page.evaluate(() => {
      const txt = document.body.innerText;
      const prose = [...document.querySelectorAll('.content-section p, .info-box p, .conclusion-box p, .quickplan-box p')]
        .filter((p) => p.textContent.trim().length > 30);
      const sizes = prose.map((p) => parseFloat(getComputedStyle(p).fontSize));
      const tap = [...document.querySelectorAll('button, a.btn-primary, a.footer-mega-cta, a.main-hook-banner, a[class*="rounded"]')];
      const small = tap.map((e) => { const r = e.getBoundingClientRect(); return { t: (e.innerText || '').slice(0, 16), h: Math.round(r.height), w: Math.round(r.width) }; })
        .filter((x) => x.w > 0 && x.h > 0 && x.h < 44);
      const nolcool = [...document.querySelectorAll('a')].filter((a) => /nolcool\.com/.test(a.href)).length;
      return { txt, minProse: sizes.length ? Math.min(...sizes) : null, small, nolcool };
    });
    const FAKE = [...FAKE_STAT, /명이 보고 있습니다/];
    for (const re of FAKE) if (re.test(d.txt)) note(`[렌더 ${path}] 가짜문구 노출: ${re.source}`);
    if (d.minProse !== null && d.minProse < 16) note(`[렌더 ${path}] 본문폰트 ${d.minProse}px < 16`);
    if (d.small.length) note(`[렌더 ${path}] 터치<44 ${d.small.length}개: ${JSON.stringify(d.small.slice(0, 5))}`);
    if (d.nolcool < 1) note(`[렌더 ${path}] 놀쿨 직결 링크 소실(회귀)`);
    if (errs.length) note(`[렌더 ${path}] 콘솔에러 ${errs.length}: ${errs[0]}`);
    await page.close();
  }
  await browser.close();
} else {
  console.log('ℹ️  BASE 미설정 — 실 렌더 검사 생략(번들/HTML 정적 검사만). 전체검사: BASE=http://localhost:PORT 로 실행');
}

if (fails.length) {
  console.error('\n❌ GATE FAIL:\n' + fails.map((f) => '  - ' + f).join('\n'));
  process.exit(1);
}
console.log('\n✅ GATE PASS — 다크패턴 0 · 본문 16px · 터치≥44 · 금지어 0 · 놀쿨 직결 보존');
