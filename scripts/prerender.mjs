/**
 * Post-build prerender (순수 Node, CF 빌드 호환 — 브라우저 불필요).
 *
 * 핵심: #root 안에 ★완전 렌더된 본문 HTML★(제목·요약·본문·섹션·FAQ·결론·NAP·
 * 놀쿨 링크)을 데이터(venues.ts + venueContent.ts)에서 생성해 주입한다.
 * 클라이언트는 createRoot(=하이드레이트 아님)로 새로 렌더하므로 미스매치 0.
 * → JS 미실행 크롤러(GPTBot·ClaudeBot·Perplexity·구글 첫 크롤·소셜)가
 *   본문/FAQ/놀쿨 링크를 curl(비-JS)로 그대로 본다.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { parseVenueContent } from './lib-content.mjs';

const BASE = 'https://woman-5nj.pages.dev';
const SITE_NAME = '여성이 편안한 밤문화';
const MAIN = 'https://nolcool.com';
const template = readFileSync('dist/index.html', 'utf8');
const venuesSrc = readFileSync('src/data/venues.ts', 'utf8');
const CONTENT = parseVenueContent('src/data/venueContent.ts');

const CAT = { night: '나이트', club: '클럽', lounge: '라운지', room: '룸', yojeong: '요정', hoppa: '호빠' };

// ====== Parse venue data (full fields) ======
function field(chunk, name) {
  const m = chunk.match(new RegExp(`${name}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  return m ? m[1].replace(/\\n/g, '\n').replace(/\\'/g, "'") : '';
}
function parseVenues() {
  const results = [];
  const re = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']*)',\s*region:\s*'([^']+)',\s*area:\s*'([^']*)',\s*seoArea:\s*'([^']*)'/g;
  let m;
  while ((m = re.exec(venuesSrc)) !== null) {
    const id = m[1], name = m[2], region = m[3], area = m[4], seoArea = m[5];
    const idx = venuesSrc.indexOf(`id: '${id}'`);
    const chunk = venuesSrc.slice(idx, idx + 1000);
    const catMatch = chunk.match(/category:\s*'([^']*)'/);
    const keyword = field(chunk, 'keyword') || (seoArea + '나이트 ' + name);
    const category = catMatch ? catMatch[1] : 'night';
    const phone = field(chunk, 'phone');
    const address = field(chunk, 'address');
    const hours = field(chunk, 'hours');
    const description = field(chunk, 'description');
    const contact = field(chunk, 'contact');
    const cardHook = field(chunk, 'card_hook');
    const tagsM = chunk.match(/tags:\s*\[([^\]]*)\]/);
    const tags = tagsM ? [...tagsM[1].matchAll(/'([^']*)'/g)].map((x) => x[1]) : [];

    const prefix = region + '-';
    const slug = id.startsWith(prefix) ? id.slice(prefix.length) : id;
    const path = `/${region}/${slug}`;
    results.push({ id, name, region, area, seoArea, keyword, category, phone, address, hours, description, contact, cardHook, tags, path });
  }
  return results;
}

function getHook(venueId) {
  const hookStart = venuesSrc.indexOf('const seoHooks');
  const hookEnd = venuesSrc.indexOf('const seoDescriptions');
  const hookSection = venuesSrc.slice(hookStart, hookEnd);
  const hm = hookSection.match(new RegExp(`'${venueId}':\\s*'([^']*)'`));
  return hm ? hm[1] : '';
}
function getDesc(venueId) {
  const descStart = venuesSrc.indexOf('const seoDescriptions');
  const descSection = venuesSrc.slice(descStart);
  const dm = descSection.match(new RegExp(`'${venueId}':\\s*'([^']*)'`));
  return dm ? dm[1] : '';
}
function getRegionName(regionId) {
  const rm = venuesSrc.match(new RegExp(`id:\\s*'${regionId}',\\s*name:\\s*'([^']*)'`));
  return rm ? rm[1] : regionId;
}

function S(u) { return u.endsWith('/') ? u : u + '/'; }
function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
const len = (s) => [...String(s)].length;

// 본문 텍스트 → 단락 <p> (빈 줄 = 단락 구분)
function para(text) {
  return String(text).split(/\n{2,}/)
    .map((p) => p.trim().replace(/\n+/g, ' '))
    .filter(Boolean)
    .map((p) => `<p>${escHtml(p)}</p>`)
    .join('');
}

// meta 120~160자 보장 (실 토큰만 사용, 창작 0). 헤드가 페이지마다 달라 중복 없음.
const META_PAD = [
  '분위기와 위치, 영업시간, 실장 연결 방법을 현장 기준으로 정리했습니다.',
  '방문 전 미리 비교해 오늘 갈 곳을 실패 없이 정하세요.',
  '광고가 아닌 현장 확인 정보로 한곳에서 빠르게 살펴볼 수 있습니다.',
];
function finalizeMeta(base, extras = []) {
  let s = String(base).trim().replace(/\s+/g, ' ');
  const pool = [...extras, ...META_PAD];
  let i = 0;
  while (len(s) < 120 && i < pool.length) { s = (s + ' ' + pool[i].trim()).replace(/\s+/g, ' '); i++; }
  if (len(s) > 160) {
    s = [...s].slice(0, 159).join('').replace(/[\s,·—\-]+$/, '') + '…';
  }
  return s;
}

const napLink = (label) =>
  `<p><a href="${MAIN}" target="_blank" rel="noopener noreferrer">놀쿨에서 ${escHtml(label)} 실시간 순위·더 많은 정보 보기 →</a></p>`;

function parseHours(h) {
  if (!h || h === '별도문의') return null;
  const m = h.match(/(AM|PM)\s*(\d{1,2}):(\d{2})\s*[~\-]\s*(AM|PM)\s*(\d{1,2}):(\d{2})/i);
  if (!m) return null;
  const to24 = (ap, hh) => { hh = +hh; ap = ap.toUpperCase(); if (ap === 'PM' && hh !== 12) hh += 12; if (ap === 'AM' && hh === 12) hh = 0; return hh; };
  const o = String(to24(m[1], m[2])).padStart(2, '0') + ':' + m[3];
  const c = String(to24(m[4], m[5])).padStart(2, '0') + ':' + m[6];
  return `Mo-Su ${o}-${c}`;
}

// ====== Body builders (SSR content into #root) ======
function venueBody(v) {
  const c = CONTENT[v.id] || {};
  const region = getRegionName(v.region);
  const summary = c.summary?.length
    ? `<h2>${escHtml(v.keyword)} 핵심 요약</h2><ul>${c.summary.map((s) => `<li>${escHtml(s)}</li>`).join('')}</ul>` : '';
  const intro = c.intro ? `<h2>${escHtml(v.keyword)} 이용 가이드</h2>${para(c.intro)}` : '';
  const secs = (c.sections || []).map((s) => `<h3>${escHtml(s.title)}</h3>${para(s.body)}`).join('');
  const qp = c.quickPlan?.decision
    ? `<h2>${escHtml(v.keyword)} 30초 플랜</h2><p>${escHtml(c.quickPlan.decision)}</p>` +
      (c.quickPlan.scenarios?.length ? `<ul>${c.quickPlan.scenarios.map((s) => `<li>${escHtml(s)}</li>`).join('')}</ul>` : '') +
      (c.quickPlan.costNote ? `<p>${escHtml(c.quickPlan.costNote)}</p>` : '') : '';
  const faq = c.faq?.length
    ? `<h2>${escHtml(v.keyword)} 자주 묻는 질문</h2><dl>${c.faq.map((f) => `<dt>${escHtml(f.q)}</dt><dd>${escHtml(f.a)}</dd>`).join('')}</dl>` : '';
  const concl = c.conclusion ? `<h2>${escHtml(v.keyword)} 마무리</h2>${para(c.conclusion)}` : '';
  const nap = [];
  if (v.address) nap.push(`<li><strong>주소</strong> ${escHtml(v.address)}</li>`);
  if (v.hours && v.hours !== '별도문의') nap.push(`<li><strong>영업시간</strong> ${escHtml(v.hours)}</li>`);
  if (v.phone && v.phone !== '별도문의') nap.push(`<li><strong>연락처</strong> ${escHtml(v.phone)}${v.contact ? ' (' + escHtml(v.contact) + ')' : ''}</li>`);
  const napBlock = nap.length ? `<h2>${escHtml(v.keyword)} 위치·이용 안내</h2><ul>${nap.join('')}</ul>` : '';
  // 관련 업소(실연관: 같은 지역 + 같은 유형) — dead-end 방지·페이지간 이동
  const sameRegion = venues.filter((x) => x.region === v.region && x.id !== v.id).slice(0, 4);
  const sameCat = venues.filter((x) => x.category === v.category && x.region !== v.region && x.id !== v.id).slice(0, 4);
  const relRegion = sameRegion.length ? `<h2>${escHtml(region)} 다른 업소</h2>${listLinks(sameRegion)}` : '';
  const relCat = sameCat.length ? `<h2>다른 지역 ${escHtml(CAT[v.category] || '')} 추천</h2>${listLinks(sameCat)}` : '';
  return `<nav aria-label="breadcrumb"><a href="${S(BASE)}" target="_blank" rel="noopener noreferrer">홈</a> / <a href="${S(BASE + '/' + v.region)}" target="_blank" rel="noopener noreferrer">${escHtml(region)}</a> / <span>${escHtml(v.keyword)}</span></nav>
<h1>${escHtml(v.keyword)}</h1>
<p>${escHtml(v.description)}</p>${v.cardHook ? para(v.cardHook) : ''}
${summary}${intro}${secs}${qp}${faq}${concl}${napBlock}${relRegion}${relCat}
${napLink(v.keyword)}`;
}

function listLinks(items) {
  return `<ul>${items.map((v) => `<li><a href="${S(BASE + v.path)}" target="_blank" rel="noopener noreferrer">${escHtml(v.keyword)}</a> — ${escHtml(v.area)} ${escHtml(CAT[v.category] || '')}</li>`).join('')}</ul>`;
}
function regionBody(regionId, desc, list) {
  const name = getRegionName(regionId);
  return `<h1>${escHtml(name)} 나이트·클럽</h1>${para(desc)}
<h2>${escHtml(name)} 업소 목록 (${list.length}곳)</h2>${listLinks(list)}
${napLink(name + ' 밤문화')}`;
}
function categoryBody(label, key, desc, list) {
  return `<h1>전국 ${escHtml(label)} 전체보기</h1>${para(desc)}
<h2>${escHtml(label)} 업소 (${list.length}곳)</h2>${listLinks(list)}
${napLink('전국 ' + label)}`;
}
function guideBody(h1, intro) {
  return `<h1>${escHtml(h1)}</h1>${para(intro)}
${napLink(h1)}`;
}
function homeBody(allVenues, regionsList) {
  const top = allVenues.slice(0, 12);
  return `<h1>놀쿨 — 전국 나이트·클럽·라운지·룸·요정·호빠 TOP ${allVenues.length}</h1>
<p>강남부터 부산·울산까지 전국 ${allVenues.length}곳을 현장 검증해 분위기·실장 연락처·위치·이용 안내를 한곳에 정리했습니다. 오늘 갈 곳을 지역과 카테고리로 빠르게 비교하세요.</p>
<h2>카테고리</h2><ul>${categoryPages.map((c) => `<li><a href="${S(BASE + c.path)}" target="_blank" rel="noopener noreferrer">전국 ${escHtml(c.label)}</a></li>`).join('')}</ul>
<h2>지역별 바로가기</h2><ul>${regionsList.map((r) => `<li><a href="${S(BASE + '/' + r)}" target="_blank" rel="noopener noreferrer">${escHtml(getRegionName(r))}</a></li>`).join('')}</ul>
<h2>추천 업소</h2>${listLinks(top)}
${napLink('전국 업소')}`;
}

// 모든 페이지 공통 내부 내비 (dead-end/orphan 0 보장 — 홈·카테고리·허브 상호링크)
function siteNav() {
  const cats = categoryPages.map((c) => `<a href="${S(BASE + c.path)}" target="_blank" rel="noopener noreferrer">전국 ${escHtml(c.label)}</a>`).join(' · ');
  const hubs = [['/venues', '전체 업소'], ['/ranking', '인기 랭킹'], ['/map', '지역별 찾기'], ['/magazine', '매거진'], ['/events', '이벤트'], ['/quiz', '밤문화 MBTI'], ['/safety', '안전 가이드'], ['/community', '커뮤니티'], ['/community/guidelines', '가이드라인']]
    .map(([p, l]) => `<a href="${S(BASE + p)}" target="_blank" rel="noopener noreferrer">${escHtml(l)}</a>`).join(' · ');
  return `<nav aria-label="사이트 메뉴"><a href="${S(BASE)}" target="_blank" rel="noopener noreferrer">놀쿨 홈</a> · ${cats} · ${hubs}</nav>`;
}

// ====== generateHTML ======
function generateHTML(opts) {
  const { title, description, ogImage, jsonLd, bodyHtml } = opts;
  const canonical = S(opts.canonical);
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escAttr(description)}"`);
  html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${escAttr(canonical)}"`);
  html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escAttr(title)}"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escAttr(description)}"`);
  html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${escAttr(canonical)}"`);
  if (ogImage) html = html.replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${escAttr(ogImage)}"`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escAttr(title)}"`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${escAttr(description)}"`);
  if (ogImage) html = html.replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${escAttr(ogImage)}"`);
  if (jsonLd) {
    const ldScripts = jsonLd.map((ld) => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`).join('\n    ');
    html = html.replace('</head>', `    ${ldScripts}\n  </head>`);
  }
  const inner = (bodyHtml || '') + siteNav();
  html = html.replace('<div id="root"></div>', `<div id="root">${inner}</div>`);
  return html;
}

function writePage(path, html) {
  const dir = `dist${path}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, html);
}

// ====== Generate ======
const venues = parseVenues();
const regions = [...new Set(venues.map((v) => v.region))];
let count = 0;

const categoryPages = [
  { path: '/clubs', label: '클럽', key: 'club' },
  { path: '/nights', label: '나이트', key: 'night' },
  { path: '/lounges', label: '라운지', key: 'lounge' },
  { path: '/rooms', label: '룸', key: 'room' },
  { path: '/yojeong', label: '요정', key: 'yojeong' },
  { path: '/hoppa', label: '호빠', key: 'hoppa' },
];

// Home
{
  const desc = finalizeMeta(
    '놀쿨 — 전국 나이트·클럽·라운지·룸·요정·호빠 ' + venues.length + '곳 현장 검증 완료.',
    ['실장 연락처·분위기·위치·영업시간까지 지역별로 한눈에 비교하고 오늘 갈 곳을 실패 없이 고르세요.']
  );
  let html = template;
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escAttr(desc)}"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escAttr(desc)}"`);
  html = html.replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${BASE}/og/default.jpg"`);
  html = html.replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${BASE}/og/default.jpg"`);
  html = html.replace('<div id="root"></div>', `<div id="root">${homeBody(venues, regions)}${siteNav()}</div>`);
  writeFileSync('dist/index.html', html);
  count++;
}

// /venues
{
  const desc = finalizeMeta(
    '강남부터 울산까지 현장 검증한 업소만 모았습니다.',
    ['지역·분위기·실장·카테고리로 걸러 오늘 내게 딱 맞는 한 곳을 빠르게 고르세요. 전국 ' + venues.length + '곳을 비교할 수 있습니다.']
  );
  writePage('/venues', generateHTML({
    title: `전국 나이트·클럽·라운지 ${venues.length}곳 — 지역별 필터 검색 | ${SITE_NAME}`,
    description: desc, canonical: `${BASE}/venues`,
    bodyHtml: guideBody('전체 업소 목록', '강남부터 울산까지 현장 검증한 전국 ' + venues.length + '곳을 지역·분위기·실장·카테고리로 비교하세요.') + listLinks(venues),
  }));
  count++;
}

// Region pages
const regionSeoSrc = readFileSync('src/data/regionSeo.ts', 'utf8');
const regionMeta = {};
for (const m of regionSeoSrc.matchAll(/'([a-z0-9-]+)':\s*\{\s*title:\s*"([^"]*)",\s*desc:\s*"([^"]*)"/g)) {
  regionMeta[m[1]] = { title: m[2], desc: m[3] };
}
for (const regionId of regions) {
  const name = getRegionName(regionId);
  const meta = regionMeta[regionId] || { title: `${name} 밤문화 가이드`, desc: `${name} 지역 밤문화 정보를 정리했습니다.` };
  const list = venues.filter((v) => v.region === regionId);
  const desc = finalizeMeta(meta.desc, [`${name} 지역 업소를 분위기·실장 연결·위치 기준으로 비교해 오늘 갈 곳을 정하세요.`]);
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: S(BASE) },
      { '@type': 'ListItem', position: 2, name: name, item: S(`${BASE}/${regionId}`) },
    ],
  };
  writePage(`/${regionId}`, generateHTML({
    title: meta.title, description: desc, canonical: `${BASE}/${regionId}`,
    jsonLd: [breadcrumb], bodyHtml: regionBody(regionId, meta.desc, list),
  }));
  count++;
}

// Category pages
const catSrc = readFileSync('src/pages/CategoryPage.tsx', 'utf8');
const catMeta = {};
for (const m of catSrc.matchAll(/(\w+):\s*\{\s*label:\s*'[^']*',\s*plural:\s*'[^']*',\s*title:\s*'([^']*)',\s*desc:\s*'([^']*)'/g)) {
  catMeta[m[1]] = { title: m[2], desc: m[3] };
}
for (const cp of categoryPages) {
  const list = venues.filter((v) => v.category === cp.key);
  const meta = catMeta[cp.key] || { title: `전국 ${cp.label}`, desc: `전국 ${cp.label} ${list.length}곳 현장 검증.` };
  const desc = finalizeMeta(meta.desc, [`전국 ${cp.label} ${list.length}곳을 현장 검증 정보로 비교하고 실패 없는 한 곳을 고르세요.`]);
  writePage(cp.path, generateHTML({
    title: meta.title, description: desc, canonical: `${BASE}${cp.path}`,
    ogImage: `${BASE}/og/category-${cp.key}.jpg`,
    bodyHtml: categoryBody(cp.label, cp.key, meta.desc, list),
  }));
  count++;
}

// Static guide pages
const guides = [
  { path: '/quiz', title: `밤문화 MBTI — 나에게 맞는 곳은 어디? | ${SITE_NAME}`, h1: '밤문화 MBTI',
    base: '클럽? 라운지? 룸? 10개 질문이면 내 밤문화 유형이 나옵니다.',
    extra: ['결과에 딱 맞는 업소 추천까지 — 1분이면 오늘 어디서 놀지가 정해집니다. 지금 바로 시작하세요.'],
    intro: '10개 질문으로 알아보는 나의 밤문화 유형. 클럽이 맞는지 라운지가 맞는지, 룸이 편한지 답만 고르면 성향이 나옵니다. 결과에 맞는 전국 업소까지 바로 추천해 드리니 오늘 어디서 놀지 1분이면 정해집니다.' },
  { path: '/safety', title: `안전 가이드 — 음주 계산기·긴급 연락처 | ${SITE_NAME}`, h1: '안전 가이드',
    base: '즐거운 밤은 안전이 먼저. 혈중 알코올 음주 계산기, 24시 긴급 연락처, 대리운전·콜택시 번호까지 한 화면에.',
    extra: ['집에 무사히 돌아가는 방법을 미리 챙겨 두세요.'],
    intro: '즐거운 밤도 안전이 먼저입니다. 혈중 알코올 음주 계산기로 상태를 점검하고, 24시간 긴급 연락처와 대리운전·콜택시 번호를 한 화면에 모았습니다. 무리하지 않고 집까지 무사히 돌아가는 방법을 미리 챙겨 두세요.' },
  { path: '/magazine', title: `매거진 — 밤문화 가이드 & 비교 분석 | ${SITE_NAME}`, h1: '매거진',
    base: '강남 vs 홍대 어디부터 갈까? 나이트 초보 가이드, 룸과 요정의 차이까지.',
    extra: ['현장에서 직접 겪은 사람이 정리한 밤문화 비교 매거진으로 감을 잡아 보세요.'],
    intro: '현장 경험을 바탕으로 정리한 밤문화 가이드입니다. 강남과 홍대 중 어디부터 갈지, 나이트 초보가 알아둘 점, 룸과 요정의 차이까지 직접 다녀본 시선으로 비교하고 분석했습니다. 처음이라도 감을 잡고 움직일 수 있습니다.' },
  { path: '/ranking', title: `인기 랭킹 TOP 20 — 전국 나이트·클럽·라운지 | ${SITE_NAME}`, h1: '인기 랭킹 TOP 20',
    base: '전국 나이트·클럽·라운지·룸·요정 인기 랭킹 TOP 20.',
    extra: ['실장 연결이 되는 업소를 우선으로, 지금 가장 많이 찾는 곳을 순위로 확인하세요.'],
    intro: '실장 연결이 가능한 업소를 우선으로, 전국 나이트·클럽·라운지·룸·요정 인기 업소를 순위로 정리했습니다. 지금 가장 많이 찾는 곳이 어디인지 한눈에 비교하고, 마음에 드는 업소의 상세 정보와 연락 방법까지 바로 확인하세요.' },
  { path: '/events', title: `이벤트 캘린더 — 전국 밤문화 일정 | ${SITE_NAME}`, h1: '이벤트 캘린더',
    base: '금요 나이트 피크타임, 토요 클럽 DJ 파티, 평일 이벤트까지.',
    extra: ['전국 밤문화 일정을 한눈에 모아 오늘 어디서 놀지 바로 정하세요.'],
    intro: '금요 나이트 피크타임, 토요 클럽 DJ 파티, 평일 이벤트까지 전국 밤문화 주요 일정을 한눈에 모았습니다. 요일과 시간대별로 분위기가 어떻게 달라지는지 미리 확인하고, 오늘 어디서 놀지 동선을 짜는 데 활용하세요.' },
  { path: '/map', title: `지역별 업소 찾기 — 전국 나이트·클럽·라운지 | ${SITE_NAME}`, h1: '지역별 업소 찾기',
    base: '지역만 고르면 끝. 전국 나이트·클럽·라운지·룸·요정을 지도에서 한눈에.',
    extra: ['내 근처 오늘 갈 곳을 바로 찾아 확인하세요.'],
    intro: '지역만 고르면 끝입니다. 전국 나이트·클럽·라운지·룸·요정을 지역별로 모아 두어, 내 주변이나 가려는 동네의 업소를 빠르게 찾을 수 있습니다. 각 업소의 분위기와 실장 연결 방법, 위치까지 한 번에 확인하고 오늘 갈 곳을 정하세요.' },
  { path: '/community', title: `커뮤니티 — 밤문화 후기·팁·파티모집 | ${SITE_NAME}`, h1: '커뮤니티',
    base: '전국 밤문화 솔직 후기와 꿀팁, 파티 모집까지.',
    extra: ['광고가 아니라 진짜 다녀온 사람들의 생생한 이야기를 여기서 먼저 확인하세요.'],
    intro: '전국 밤문화 솔직 후기와 꿀팁, 파티 모집까지 진짜 경험한 사람들의 이야기를 나누는 공간입니다. 광고가 아니라 실제로 다녀온 사람들의 생생한 코멘트를 먼저 확인하고, 궁금한 점이 있으면 편하게 물어보세요.' },
  { path: '/community/guidelines', title: `커뮤니티 가이드라인 — 건강한 밤문화 이야기 | ${SITE_NAME}`, h1: '커뮤니티 가이드라인',
    base: '서로 존중하는 커뮤니티를 위한 가이드라인입니다.',
    extra: ['욕설·허위정보·불법광고는 삭제되며, 건강한 밤문화 이야기만 남깁니다. 함께 지켜 주세요.'],
    intro: '서로 존중하는 커뮤니티를 위한 가이드라인입니다. 욕설과 허위정보, 불법광고는 삭제되며 건강한 밤문화 이야기만 남깁니다. 모두가 편하게 정보를 나눌 수 있는 공간이 되도록 함께 지켜 주세요. 신고는 운영진이 빠르게 확인합니다.' },
];
for (const g of guides) {
  writePage(g.path, generateHTML({
    title: g.title, description: finalizeMeta(g.base, g.extra),
    canonical: `${BASE}${g.path}`, bodyHtml: guideBody(g.h1, g.intro),
  }));
  count++;
}

// Venue detail pages
for (const v of venues) {
  const hook = getHook(v.id);
  const desc0 = getDesc(v.id);
  const title = `${v.keyword}${hook ? ' — ' + hook : ''}`;
  const c = CONTENT[v.id] || {};
  const description = finalizeMeta(desc0, [
    `${v.keyword} 분위기와 위치, 영업시간, 실장 연결 방법을 현장 검증 정보로 정리했습니다.`,
    `방문 전 ${v.keyword} 정보를 확인하고 ${v.seoArea} ${CAT[v.category] || ''} 중에서 비교해 보세요.`,
  ]);

  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: S(BASE) },
      { '@type': 'ListItem', position: 2, name: getRegionName(v.region), item: S(`${BASE}/${v.region}`) },
      { '@type': 'ListItem', position: 3, name: v.keyword, item: S(`${BASE}${v.path}`) },
    ],
  };
  const localBusiness = {
    '@context': 'https://schema.org', '@type': 'NightClub',
    name: v.keyword, url: S(`${BASE}${v.path}`), image: `${BASE}/og/${v.id}.jpg`,
  };
  if (v.description) localBusiness.description = v.description;
  if (v.phone && v.phone !== '별도문의') localBusiness.telephone = v.phone;
  if (v.address) localBusiness.address = { '@type': 'PostalAddress', streetAddress: v.address, addressLocality: v.area, addressCountry: 'KR' };
  const oh = parseHours(v.hours);
  if (oh) localBusiness.openingHours = oh;

  const jsonLd = [breadcrumb, localBusiness];
  if (c.faq?.length) {
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: c.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }

  writePage(v.path, generateHTML({
    title, description, canonical: `${BASE}${v.path}`,
    ogImage: `${BASE}/og/${v.id}.jpg`, jsonLd, bodyHtml: venueBody(v),
  }));
  count++;
}

// 404 (noindex)
{
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>페이지를 찾을 수 없습니다 | ${SITE_NAME}</title>`);
  html = html.replace(/<meta name="robots" content="[^"]*"/, '<meta name="robots" content="noindex, follow"');
  html = html.replace(/\s*<link rel="canonical" href="[^"]*"\s*\/>/, '');
  html = html.replace('<div id="root"></div>', `<div id="root"><h1>페이지를 찾을 수 없습니다</h1><p>요청하신 페이지가 없거나 이동되었습니다. <a href="${S(BASE)}" target="_blank" rel="noopener noreferrer">놀쿨 홈</a>에서 다시 찾아 주세요.</p></div>`);
  writeFileSync('dist/404.html', html);
  count++;
}

// sitemap.xml
{
  const staticPaths = ['/', '/venues', ...categoryPages.map((c) => c.path), '/quiz', '/safety', '/magazine', '/ranking', '/events', '/map', '/community', '/community/guidelines'];
  const all = [...staticPaths, ...regions.map((r) => `/${r}`), ...venues.map((v) => v.path)];
  const today = new Date().toISOString().slice(0, 10);
  const NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
  const urls = all.map((p) => {
    const loc = p === '/' ? `${BASE}/` : `${BASE}${p}/`;
    const priority = p === '/' ? '1.0' : venues.some((v) => v.path === p) ? '0.8' : '0.6';
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${NS}">\n${urls}\n</urlset>\n`;
  writeFileSync('dist/sitemap.xml', xml);
  writeFileSync('public/sitemap.xml', xml);
  count++;
  console.log(`Sitemap: ${all.length} URLs (trailing-slash).`);
}

console.log(`Prerender complete: ${count} pages generated.`);
