// 가게 전용 사이트(ff) — 빌드 맨 끝 단계. 대표님 지시 2026-09-27 「홈화면은 나이트 내용 0 · 건전한 정보」.
//   ① dedicated/home.html(건전 홈 · 정적) → dist/index.html  (prerender 가 만든 옛 홈을 덮는다)
//   ② public/ 의 가게 쪽·통로 쪽 주소를 dist/sitemap.xml 에 더한다(이미 있으면 건너뜀)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
const HOST = 'https://ff.nolcool.com';
const 쪽들 = readdirSync('public', { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^(suwon-chancedome-night(-\d+)?|gwonseon-walk-notes)$/.test(e.name) && existsSync(`public/${e.name}/index.html`))
  .map((e) => e.name).sort();
// 전용22-8(2026-10-07) — 앱 자료에서 빼고 정적 쪽으로 둔 가게 쪽. 두 겹 폴더라 위 한 겹 읽기(정규식)에 안 잡혀 경로로 더한다.
// 일산31-3(2026-10-12) — 일산명월관요정(ilsan/myeongwolgwan)도 같은 꼴(앱 자료에서 빼고 정적 쪽).
// 전체57-1(2026-10-25) — 성남샴푸나이트(seongnam/shampoo-night)도 같은 꼴.
for (const d of ['seoul-etc/sinlim-grandprix-night', 'ilsan/myeongwolgwan', 'seongnam/shampoo-night']) if (existsSync(`public/${d}/index.html`)) 쪽들.push(d);
writeFileSync('dist/index.html', readFileSync('dedicated/home.html', 'utf8'));
let sm = readFileSync('dist/sitemap.xml', 'utf8');
const 오늘 = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
let 더함 = 0;
// 일산83-1(2026-11-15) — 광고주 세트의 「사이트맵 그림 줄」: 이 목록의 쪽만 그 쪽 og:image(1:1 광고주 카드)를 그림 줄로 단다 · 다른 쪽 줄은 그대로
const 그림줄쪽 = new Set(['ilsan/myeongwolgwan']);
const 쪽그림 = (d) => {
  const m = readFileSync(`public/${d}/index.html`, 'utf8').match(/<meta property="og:image" content="([^"]+)"/);
  if (!m || !m[1].startsWith(`${HOST}/${d}/`)) throw new Error(`[dedicated-home] ${d}: og:image 가 그 쪽 폴더의 카드가 아님 — ${m ? m[1] : '없음'}`);
  return m[1];
};
for (const d of 쪽들) {
  const loc = `${HOST}/${d}/`;
  if (sm.includes(`<loc>${loc}</loc>`)) continue;
  const 그림 = 그림줄쪽.has(d) ? `<image:image><image:loc>${쪽그림(d)}</image:loc></image:image>` : '';
  sm = sm.replace('</urlset>', `  <url><loc>${loc}</loc><lastmod>${오늘}</lastmod>${그림}</url>\n</urlset>`); 더함++;
}
if (sm.includes('<image:image>') && !sm.includes('xmlns:image=')) {
  const 앞 = sm;
  sm = sm.replace(/<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/, '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');
  if (sm === 앞) throw new Error('[dedicated-home] 사이트맵 머리(urlset)를 못 찾아 그림 이름공간을 못 넣음');
}
writeFileSync('dist/sitemap.xml', sm);
console.log(`[dedicated-home] 홈 교체 · 사이트맵 +${더함} (쪽 ${쪽들.length})`);
