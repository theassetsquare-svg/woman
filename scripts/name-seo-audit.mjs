// 전 업소 "가게이름 상위노출" 전수 점검.
// 각 업소 상세페이지가 자기 상호명으로 1위를 노릴 수 있는 상태인지 검사한다.
//   node scripts/name-seo-audit.mjs
import fs from 'node:fs';

const venuesSrc = fs.readFileSync('src/data/venues.ts', 'utf8');
const contentSrc = fs.readFileSync('src/data/venueContent.ts', 'utf8');

// ── 업소 파싱 ──
const venues = [];
const re =
  /id:\s*'([^']+)',\s*name:\s*'([^']*)',\s*region:\s*'([^']+)',\s*area:\s*'([^']*)',\s*seoArea:\s*'([^']*)'/g;
let m;
while ((m = re.exec(venuesSrc)) !== null) {
  const [, id, name, region, area, seoArea] = m;
  const chunk = venuesSrc.slice(venuesSrc.indexOf(`id: '${id}'`), venuesSrc.indexOf(`id: '${id}'`) + 1000);
  const keyword = (chunk.match(/keyword:\s*'([^']*)'/) || [])[1] || '';
  const category = (chunk.match(/category:\s*'([^']*)'/) || [])[1] || 'night';
  const label = keyword || `${seoArea}${{ room: '룸', yojeong: '요정', hoppa: '호빠', club: '클럽', lounge: '라운지' }[category] || '나이트'} ${name}`;
  const slug = id.startsWith(region + '-') ? id.slice(region.length + 1) : id;
  // 상호 핵심 토큰: 이름에서 지역/카테고리 접미사 제거
  let core = name.replace(new RegExp('^' + seoArea), '');
  core = core.replace(/(나이트|클럽|라운지|호스트바|호빠|요정|룸)$/,'').trim();
  venues.push({ id, name, region, seoArea, keyword, category, label, core, path: `/${region}/${slug}` });
}

// ── 업소별 본문 텍스트 추출 ──
function contentText(id) {
  const i = contentSrc.indexOf(`'${id}':`);
  if (i < 0) return '';
  // 다음 최상위 키까지
  const after = contentSrc.slice(i + id.length + 3);
  const next = after.search(/\n'[a-z0-9-]+':\s*\{/);
  return after.slice(0, next > 0 ? next : 6000);
}

const distHas = (p) => fs.existsSync(`dist${p}/index.html`);
const distHtml = (p) => (distHas(p) ? fs.readFileSync(`dist${p}/index.html`, 'utf8') : '');

const issues = { title: [], density: [], cross: [], schema: [], missing: [] };

// 모든 코어 토큰(2자 이상, 고유) — 교차오염 검사용
const coreByVenue = new Map(venues.map((v) => [v.id, v.core]));

for (const v of venues) {
  const text = contentText(v.id);
  const html = distHtml(v.path);

  if (!html) { issues.missing.push(`${v.label} (${v.path}) — 프리렌더 HTML 없음`); continue; }

  // 1) title이 가게이름으로 시작?
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (!title.startsWith(v.label)) issues.title.push(`${v.path}: title='${title}' (라벨 '${v.label}'로 시작 안 함)`);

  // 2) schema NightClub name = 라벨?
  if (!html.includes(`"name":"${v.label}"`)) issues.schema.push(`${v.path}: 스키마 name에 '${v.label}' 없음`);

  // 3) 자기 이름 밀도 (본문에서 라벨 또는 name 등장 횟수)
  const own = (text.match(new RegExp(v.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
    + (v.keyword && v.keyword !== v.name ? (text.match(new RegExp(v.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0);
  if (own < 4) issues.density.push(`${v.path}: 자기이름 '${v.name}' 본문 ${own}회 (4회 미만)`);

  // 4) 교차오염: 같은 지역의 다른 업소 상호 핵심이 본문에 등장?
  // 일반어 오탐 화이트리스트 ('코드'=드레스코드, '스타'=포차 스타일 등 — 타 업소 지칭 아님)
  const FALSE_POSITIVE = new Set(['코드', '스타']);
  for (const o of venues) {
    if (o.id === v.id || o.region !== v.region) continue;
    if (FALSE_POSITIVE.has(o.core)) continue;
    if (o.core && o.core.length >= 2 && text.includes(o.core)) {
      const cnt = (text.match(new RegExp(o.core.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      issues.cross.push(`${v.path}: 같은지역 다른업소 '${o.label}'의 상호 '${o.core}' ${cnt}회 언급 (카니발 위험)`);
    }
  }
}

const fmt = (arr) => (arr.length ? arr.map((x) => '  - ' + x).join('\n') : '  ✓ 없음');
console.log(`전 업소 가게이름 상위노출 점검 — 총 ${venues.length}곳\n`);
console.log(`[1] title이 가게이름으로 시작 안 함 (${issues.title.length})\n${fmt(issues.title)}\n`);
console.log(`[2] 자기이름 본문 밀도 부족 <4회 (${issues.density.length})\n${fmt(issues.density)}\n`);
console.log(`[3] 같은 지역 타업소 상호 교차오염 (${issues.cross.length})\n${fmt(issues.cross)}\n`);
console.log(`[4] 스키마 name 불일치 (${issues.schema.length})\n${fmt(issues.schema)}\n`);
console.log(`[5] 프리렌더 누락 (${issues.missing.length})\n${fmt(issues.missing)}\n`);

const total = Object.values(issues).reduce((a, b) => a + b.length, 0);
console.log(total === 0 ? '=== 전 업소 가게이름 SEO: PASS ✅ ===' : `=== 총 ${total}건 발견 — 수정 필요 ===`);
process.exit(total ? 1 : 0);
