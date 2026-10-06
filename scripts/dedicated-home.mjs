// 가게 전용 사이트(ff) — 빌드 맨 끝 단계. 대표님 지시 2026-09-27 「홈화면은 나이트 내용 0 · 건전한 정보」.
//   ① dedicated/home.html(건전 홈 · 정적) → dist/index.html  (prerender 가 만든 옛 홈을 덮는다)
//   ② public/ 의 가게 쪽·통로 쪽 주소를 dist/sitemap.xml 에 더한다(이미 있으면 건너뜀)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
const HOST = 'https://ff.nolcool.com';
const 쪽들 = readdirSync('public', { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^(suwon-chancedome-night(-\d+)?|gwonseon-walk-notes)$/.test(e.name) && existsSync(`public/${e.name}/index.html`))
  .map((e) => e.name).sort();
// 전용22-8(2026-10-07) — 앱 자료에서 빼고 정적 쪽으로 둔 가게 쪽. 두 겹 폴더라 위 한 겹 읽기(정규식)에 안 잡혀 경로로 더한다.
for (const d of ['seoul-etc/sinlim-grandprix-night']) if (existsSync(`public/${d}/index.html`)) 쪽들.push(d);
writeFileSync('dist/index.html', readFileSync('dedicated/home.html', 'utf8'));
let sm = readFileSync('dist/sitemap.xml', 'utf8');
const 오늘 = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
let 더함 = 0;
for (const d of 쪽들) {
  const loc = `${HOST}/${d}/`;
  if (sm.includes(`<loc>${loc}</loc>`)) continue;
  sm = sm.replace('</urlset>', `  <url><loc>${loc}</loc><lastmod>${오늘}</lastmod></url>\n</urlset>`); 더함++;
}
writeFileSync('dist/sitemap.xml', sm);
console.log(`[dedicated-home] 홈 교체 · 사이트맵 +${더함} (쪽 ${쪽들.length})`);
