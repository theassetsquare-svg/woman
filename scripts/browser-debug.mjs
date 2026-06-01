// 헤드리스 브라우저 디버그 — 모바일/PC 양쪽에서 실제 로드해 런타임 버그를 잡는다.
// 콘솔 에러·미처리 예외·실패 응답(4xx/5xx 에셋)·렌더 무결성(title/h1/#root) 점검.
//   node scripts/browser-debug.mjs           # 대표 페이지 세트
//   node scripts/browser-debug.mjs --all      # sitemap 전 페이지
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME =
  process.env.CHROME_PATH ||
  '/nix/store/lpdrfl6n16q5zdf8acp4bni7yczzcx3h-idx-builtins/bin/chromium';
const ORIGIN = (process.env.GSC_SITE || 'https://woman-5nj.pages.dev').replace(/\/$/, '');

function sitemapPaths() {
  const sm = fs.readFileSync('public/sitemap.xml', 'utf8');
  return [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, '') || '/');
}

const all = process.argv.includes('--all');
const paths = all
  ? sitemapPaths()
  : [
      '/', '/venues/', '/clubs/', '/nights/', '/lounges/', '/rooms/', '/yojeong/', '/hoppa/',
      '/quiz/', '/safety/', '/magazine/', '/ranking/', '/events/', '/map/', '/community/', '/community/guidelines/',
      '/gangnam/', '/busan/', '/jangan/', '/daegu/',
      '/gangnam/club-race/', '/daejeon/seven-night/', '/daejeon/won-night/', '/daegu/hobak-night/',
      '/ulsan/champion-night/', '/bucheon/gorae-night/', '/jangan/hoppa-bbangbbang/', '/cheonan/korea-night/',
      '/__nonexistent_test__/', // 404 동작 확인
    ];

const viewports = [
  { name: 'mobile', width: 390, height: 844, isMobile: true, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  { name: 'desktop', width: 1366, height: 768, isMobile: false, ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0 Safari/537.36' },
];

const problems = [];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

for (const path of paths) {
  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setUserAgent(vp.ua);
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.isMobile });
    const consoleErrors = [], pageErrors = [], badResponses = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
    page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 160)));
    page.on('response', (r) => { const s = r.status(); if (s >= 400 && new URL(r.url()).origin === ORIGIN) badResponses.push(`${s} ${r.url().replace(ORIGIN, '')}`); });

    const url = ORIGIN + path;
    let status = 0;
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      status = resp ? resp.status() : 0;
      await new Promise((r) => setTimeout(r, 600)); // 하이드레이션 여유
    } catch (e) {
      problems.push(`${path} [${vp.name}] 로드 실패: ${e.message.slice(0, 100)}`);
      await page.close();
      continue;
    }

    const is404 = path.includes('nonexistent');
    // 렌더 무결성
    const info = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      rootKids: document.getElementById('root')?.childElementCount || 0,
      robots: document.querySelector('meta[name=robots]')?.content || '',
    }));

    if (!is404) {
      if (status !== 200) problems.push(`${path} [${vp.name}] status ${status}`);
      if (!info.title) problems.push(`${path} [${vp.name}] title 비어있음`);
      if (info.rootKids === 0) problems.push(`${path} [${vp.name}] #root 렌더 안됨(빈 화면)`);
      if (!info.h1) problems.push(`${path} [${vp.name}] h1 없음`);
    } else {
      // 404 테스트 경로: 404 응답·그로 인한 콘솔에러는 정상(기대 동작)이므로 noindex만 확인
      if (!/noindex/.test(info.robots)) problems.push(`${path} [${vp.name}] 404인데 noindex 아님`);
      await page.close();
      continue;
    }
    if (pageErrors.length) problems.push(`${path} [${vp.name}] JS 예외: ${pageErrors.join(' | ')}`);
    if (consoleErrors.length) problems.push(`${path} [${vp.name}] 콘솔에러: ${consoleErrors.slice(0, 3).join(' | ')}`);
    if (badResponses.length) problems.push(`${path} [${vp.name}] 에셋 실패: ${[...new Set(badResponses)].slice(0, 5).join(' , ')}`);

    await page.close();
  }
}
await browser.close();

console.log(`\n=== 브라우저 디버그: ${paths.length}경로 × 모바일/PC ===`);
if (problems.length === 0) console.log('문제 없음 ✅ (콘솔에러·예외·에셋404·렌더 모두 정상)');
else { console.log(`🔴 문제 ${problems.length}건:`); problems.forEach((p) => console.log('  -', p)); }
process.exit(problems.length ? 1 : 0);
