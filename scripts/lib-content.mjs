/**
 * venueContent.ts 파서 (순수 Node, 브라우저/TS런타임 불필요 → CF 빌드 호환)
 * 백틱 필드는 [^`]* 로 안전 추출, 배열/객체는 필드명 앵커 + 비탐욕.
 * 창작 없음 — 소스의 실제 콘텐츠만 추출.
 */
import { readFileSync } from 'fs';

function singleQuoted(arrBody) {
  const out = [];
  const re = /'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(arrBody)) !== null) out.push(m[1].replace(/\\'/g, "'"));
  return out;
}

export function parseVenueContent(path = 'src/data/venueContent.ts') {
  const src = readFileSync(path, 'utf8');
  // content 객체 시작 이후만
  const start = src.indexOf('const content');
  const body = src.slice(start);

  // 각 venue 블록 경계: 줄 시작의 'id': {
  const markers = [...body.matchAll(/\n'([a-z0-9-]+)':\s*\{/g)];
  const result = {};
  for (let i = 0; i < markers.length; i++) {
    const id = markers[i][1];
    const from = markers[i].index;
    const to = i + 1 < markers.length ? markers[i + 1].index : body.length;
    const block = body.slice(from, to);

    // intro / conclusion (백틱)
    const intro = (block.match(/intro:\s*`([^`]*)`/) || [])[1] || '';
    const conclusion = (block.match(/conclusion:\s*`([^`]*)`/) || [])[1] || '';

    // summary [ '...', ... ]
    const sumM = block.match(/summary:\s*\[([\s\S]*?)\]/);
    const summary = sumM ? singleQuoted(sumM[1]) : [];

    // sections: [ { title: '..'|`..`, body: `..` }, ... ]
    const sections = [];
    const secM = block.match(/sections:\s*\[([\s\S]*?)\]\s*,\s*quickPlan/);
    const secBody = secM ? secM[1] : '';
    const secRe = /title:\s*(?:'((?:[^'\\]|\\.)*)'|`([^`]*)`)\s*,\s*body:\s*`([^`]*)`/g;
    let sm;
    while ((sm = secRe.exec(secBody)) !== null) {
      sections.push({ title: (sm[1] || sm[2] || '').replace(/\\'/g, "'"), body: sm[3] });
    }

    // quickPlan
    const qpDecision = (block.match(/decision:\s*(?:'((?:[^'\\]|\\.)*)'|`([^`]*)`)/) || []);
    const decision = (qpDecision[1] || qpDecision[2] || '').replace(/\\'/g, "'");
    const scenM = block.match(/scenarios:\s*\[([\s\S]*?)\]/);
    const scenarios = scenM ? singleQuoted(scenM[1]) : [];
    const costM = block.match(/costNote:\s*(?:'((?:[^'\\]|\\.)*)'|`([^`]*)`)/) || [];
    const costNote = (costM[1] || costM[2] || '').replace(/\\'/g, "'");

    // faq: [ { q:'..', a:'..' }, ... ]
    const faq = [];
    const faqM = block.match(/faq:\s*\[([\s\S]*?)\]\s*,\s*conclusion/);
    const faqBody = faqM ? faqM[1] : '';
    const faqRe = /\{\s*q:\s*'((?:[^'\\]|\\.)*)'\s*,\s*a:\s*'((?:[^'\\]|\\.)*)'\s*\}/g;
    let fm;
    while ((fm = faqRe.exec(faqBody)) !== null) {
      faq.push({ q: fm[1].replace(/\\'/g, "'"), a: fm[2].replace(/\\'/g, "'") });
    }

    result[id] = { summary, intro, sections, quickPlan: { decision, scenarios, costNote }, faq, conclusion };
  }
  return result;
}
