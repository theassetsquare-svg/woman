// 라이브 6뷰포트 QA — 실제 헤드리스 크롬으로 라이브 사이트 실측.
// A1 콘솔 에러 0 · A2 하이드레이션 경고 0 · A3 잘림/오버플로 0(+스크린샷) · A4 터치≥44/겹침 · A5 다크패턴 0
//   node scripts/live-qa-6vp.mjs            # 대표 페이지 × 6뷰포트
//   node scripts/live-qa-6vp.mjs --venues   # 전체 venue 무결성 스윕(1뷰포트)
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME =
  process.env.CHROME_PATH ||
  '/nix/store/lpdrfl6n16q5zdf8acp4bni7yczzcx3h-idx-builtins/bin/chromium';
const ORIGIN = (process.env.GSC_SITE || 'https://woman-5nj.pages.dev').replace(/\/$/, '');

const VIEWPORTS = [
  { name: '360', width: 360, height: 800, isMobile: true },
  { name: '390', width: 390, height: 844, isMobile: true },
  { name: '768', width: 768, height: 1024, isMobile: true },
  { name: '1024', width: 1024, height: 768, isMobile: false },
  { name: '1280', width: 1280, height: 800, isMobile: false },
  { name: '1920', width: 1920, height: 1080, isMobile: false },
];

const PAGES = [
  '/', '/venues/', '/clubs/', '/gangnam/', '/busan/', '/ilsan/',
  '/jangan/hoppa-bbangbbang/', '/busan/mul-night/', '/gangnam/club-race/',
  '/quiz/', '/safety/', '/community/guidelines/', '/magazine/', '/ranking/', '/map/',
];

// gate-darkpatterns.mjs의 FAKE_STAT과 정렬 — "실시간 예약"(놀쿨 CTA 정상 문구)은 다크패턴 아님
const DARK = [
  '명이 보고 있습니다', '명이 보는 중', '남은 자리', '마감 임박', '곧 마감',
  '명 참여', 'VS 투표', '이번주 VS 대결', '직접 가본 손님의 한마디', '초 후 이동',
];

function sitemapVenuePaths() {
  const sm = fs.readFileSync('public/sitemap.xml', 'utf8');
  return [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname || '/')
    .filter((p) => /^\/[a-z-]+\/[a-z0-9-]+\/$/.test(p) &&
      !/^\/(venues|clubs|nights|lounges|rooms|yojeong|hoppa|quiz|safety|magazine|ranking|events|map|community)\//.test(p));
}

const problems = [];
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--lang=ko-KR'],
});

async function checkPage(page, path, vp, { screenshot = false, integrity = false } = {}) {
  const consoleErrs = [];
  const hydration = [];
  const onConsole = (msg) => {
    if (msg.type() !== 'error' && msg.type() !== 'warning') return;
    const t = msg.text();
    if (/hydrat|Minified React error #(418|423|425)|did not match|Text content does not match/i.test(t)) hydration.push(t);
    else if (msg.type() === 'error' && !/favicon/.test(t)) consoleErrs.push(t);
  };
  const onError = (e) => consoleErrs.push('pageerror: ' + e.message);
  const onResp = (r) => {
    if (r.status() >= 400 && !r.url().includes('__nonexistent')) consoleErrs.push(`HTTP ${r.status()} ${r.url()}`);
  };
  page.on('console', onConsole); page.on('pageerror', onError); page.on('response', onResp);

  const resp = await page.goto(ORIGIN + path, { waitUntil: 'networkidle2', timeout: 45000 });
  if (!resp || resp.status() !== 200) problems.push(`[${vp.name}] ${path} HTTP ${resp?.status()}`);
  await new Promise((r) => setTimeout(r, 700)); // 하이드레이션·지연 렌더 대기

  const audit = await page.evaluate((darkWords, mobile, doIntegrity) => {
    const out = { overflow: 0, clipped: [], smallTouch: [], dark: [], integrity: null };
    // 가로 오버플로(잘림의 1차 신호)
    const docW = document.documentElement.scrollWidth;
    if (docW > window.innerWidth + 1) out.overflow = docW - window.innerWidth;
    // 요소 단위 잘림: 뷰포트 우측 밖으로 삐져나간 가시 요소
    for (const el of document.querySelectorAll('a,button,h1,h2,h3,p,li,div[class]')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (r.right > window.innerWidth + 2 && cs.overflowX !== 'hidden' &&
          !el.closest('[class*="scroll"],[class*="carousel"],[style*="overflow"]')) {
        const horizParent = el.closest('div,section,nav,ul');
        const pcs = horizParent ? getComputedStyle(horizParent) : null;
        if (!pcs || (pcs.overflowX !== 'auto' && pcs.overflowX !== 'scroll' && pcs.overflowX !== 'hidden'))
          out.clipped.push(`${el.tagName}.${(el.className || '').toString().slice(0, 30)} right=${Math.round(r.right)}`);
      }
      if (out.clipped.length > 5) break;
    }
    // 터치 타깃(모바일만): 가시 인터랙티브 ≥44px
    if (mobile) {
      for (const el of document.querySelectorAll('a,button')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.top > window.innerHeight * 3) continue; // 상위 3화면만 샘플
        if (r.height < 43.5 && r.width < 43.5) {
          out.smallTouch.push(`${el.tagName} ${Math.round(r.width)}x${Math.round(r.height)} "${(el.textContent || '').trim().slice(0, 15)}"`);
          if (out.smallTouch.length > 4) break;
        }
      }
    }
    // 다크패턴 텍스트(JS 렌더 후)
    const body = document.body.innerText;
    for (const w of darkWords) if (body.includes(w)) out.dark.push(w);
    // 무결성(venue 상세)
    if (doIntegrity) {
      out.integrity = {
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        bodyLen: body.replace(/\s+/g, '').length,
        faq: /자주 묻는|FAQ/i.test(body),
        related: document.querySelectorAll('a[href*="/"][class*="card"], a[href^="/"][href$="/"]').length,
        nolcool: !!document.querySelector('a[href*="nolcool.com"]'),
      };
    }
    return out;
  }, DARK, vp.isMobile, integrity);

  if (consoleErrs.length) problems.push(`[${vp.name}] ${path} 콘솔: ${consoleErrs.slice(0, 2).join(' | ').slice(0, 200)}`);
  if (hydration.length) problems.push(`[${vp.name}] ${path} 하이드레이션: ${hydration[0].slice(0, 150)}`);
  if (audit.overflow > 1) problems.push(`[${vp.name}] ${path} 가로 오버플로 +${audit.overflow}px`);
  if (audit.clipped.length) problems.push(`[${vp.name}] ${path} 잘림: ${audit.clipped.slice(0, 2).join(' / ')}`);
  if (audit.smallTouch.length) problems.push(`[${vp.name}] ${path} 터치<44: ${audit.smallTouch.slice(0, 2).join(' / ')}`);
  if (audit.dark.length) problems.push(`[${vp.name}] ${path} 다크패턴: ${audit.dark.join(',')}`);

  if (screenshot) {
    fs.mkdirSync('/tmp/qa-shots', { recursive: true });
    await page.screenshot({ path: `/tmp/qa-shots/${vp.name}-${path.replace(/\//g, '_') || 'home'}.png`, fullPage: false });
  }

  page.off('console', onConsole); page.off('pageerror', onError); page.off('response', onResp);
  return audit;
}

if (process.argv.includes('--venues')) {
  // 전체 venue 무결성 스윕(390 모바일 1뷰포트)
  const vp = VIEWPORTS[1];
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
  const venuePaths = sitemapVenuePaths();
  console.log(`venue 스윕: ${venuePaths.length}개`);
  let ok = 0;
  for (const p of venuePaths) {
    try {
      const a = await checkPage(page, p, vp, { integrity: true });
      const i = a.integrity;
      if (!i.h1 || i.bodyLen < 800 || !i.faq || !i.nolcool)
        problems.push(`[무결성] ${p} h1="${i.h1.slice(0, 20)}" body=${i.bodyLen} faq=${i.faq} nolcool=${i.nolcool}`);
      else ok++;
    } catch (e) { problems.push(`[무결성] ${p} 로드 실패: ${e.message.slice(0, 80)}`); }
  }
  console.log(`무결 venue: ${ok}/${venuePaths.length}`);
} else {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.isMobile, deviceScaleFactor: 1 });
    for (const p of PAGES) {
      try { await checkPage(page, p, vp, { screenshot: p === '/' || p.includes('bbangbbang') }); }
      catch (e) { problems.push(`[${vp.name}] ${p} 로드 실패: ${e.message.slice(0, 80)}`); }
    }
    await page.close();
    console.log(`뷰포트 ${vp.name} 완료 (누적 문제 ${problems.length})`);
  }
}

await browser.close();
console.log('\n========== 결과 ==========');
if (problems.length === 0) console.log('✅ PASS — 문제 0');
else { console.log(`❌ ${problems.length}건:`); problems.forEach((p) => console.log('  ' + p)); process.exitCode = 1; }
