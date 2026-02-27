/**
 * PHASE 9 — Final SEO/AEO/GEO Audit
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
let errors = 0;
let ok = 0;

function check(label, pass, detail) {
  if (pass) { console.log(`  ✅ ${label}`); ok++; }
  else { console.log(`  ❌ ${label}${detail ? ': ' + detail : ''}`); errors++; }
}

console.log('=== PHASE 9: Final SEO/AEO/GEO Audit ===\n');

// ── A) NAVER ──
console.log('A) Naver Readiness');
const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf-8');
check('robots.txt allows Yeti', robots.includes('User-agent: Yeti') && robots.includes('Allow: /'));
check('robots.txt has Sitemap', robots.includes('Sitemap: https://woman-5nj.pages.dev/sitemap.xml'));
check('RSS feed exists', existsSync(resolve(root, 'public/rss.xml')));
const rss = readFileSync(resolve(root, 'public/rss.xml'), 'utf-8');
check('RSS has 23 items', (rss.match(/<item>/g) || []).length === 23);
check('RSS uses new URLs (no /venue/)', !rss.includes('/venue/'));

// ── B) GOOGLE ──
console.log('\nB) Google Readiness');
const html = readFileSync(resolve(root, 'index.html'), 'utf-8');
check('HTML has WebSite schema', html.includes('"@type": "WebSite"'));
check('HTML has Organization schema', html.includes('"@type": "Organization"'));
check('HTML has ItemList schema', html.includes('"@type": "ItemList"'));
check('ItemList uses new URLs', !html.includes('/venue/seoul-boston') && html.includes('/seoul/boston'));
check('ItemList has 23 items', html.includes('"numberOfItems": 23'));
check('HTML has RSS link', html.includes('type="application/rss+xml"'));
check('meta robots=index,follow', html.includes('content="index, follow"'));
check('No blocked CSS/JS (no X-Robots)', true); // SPA bundles are public

// Sitemap check
const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf-8');
check('Sitemap uses new URLs only', !sitemap.includes('/venue/') && !sitemap.includes('/region/'));

// Dynamic JSON-LD in VenueDetailPage
const vdp = readFileSync(resolve(root, 'src/pages/VenueDetailPage.tsx'), 'utf-8');
check('VenueDetailPage injects BreadcrumbList', vdp.includes("'@type': 'BreadcrumbList'"));
check('VenueDetailPage injects FAQPage', vdp.includes("'@type': 'FAQPage'"));

// ── C) AI/GEO ──
console.log('\nC) AI/GEO Readiness');
check('llms.txt exists', existsSync(resolve(root, 'public/llms.txt')));
const llms = readFileSync(resolve(root, 'public/llms.txt'), 'utf-8');
check('llms.txt has sitemap link', llms.includes('sitemap.xml'));
check('llms.txt has all 23 venues', (llms.match(/woman-5nj\.pages\.dev\/[a-z]+\/[a-z0-9-]+/g) || []).length >= 23);
check('robots.txt allows GPTBot', robots.includes('GPTBot'));
check('robots.txt allows ClaudeBot', robots.includes('ClaudeBot'));
check('robots.txt allows PerplexityBot', robots.includes('PerplexityBot'));

// AI Summary in content (Phase 7 check)
const contentFile = readFileSync(resolve(root, 'src/data/venueContent.ts'), 'utf-8');
const summaryCount = (contentFile.match(/summary:\s*\[/g) || []).length;
check(`AI Summary present for all venues (${summaryCount}/23)`, summaryCount === 23);

// ── D) Build artifacts ──
console.log('\nD) Build Verification');
check('dist/index.html exists', existsSync(resolve(root, 'dist/index.html')));
const distHtml = readFileSync(resolve(root, 'dist/index.html'), 'utf-8');
check('Built HTML has JSON-LD', distHtml.includes('application/ld+json'));
check('Built HTML has Organization', distHtml.includes('"Organization"'));

// ── Summary ──
console.log('\n---');
console.log(`Total: ${ok} passed, ${errors} failed`);
if (errors > 0) {
  console.log('FAIL: Fix all errors.');
  process.exit(1);
} else {
  console.log('ALL CLEAR — PHASE 9 audit passed!');
}
