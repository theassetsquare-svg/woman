// authored-content.mjs의 반복 위치 문장을 업소별 고유 문장으로 교체(교차중복 제거)
import fs from 'fs';
const FILE = 'scripts/authored-content.mjs';
let s = fs.readFileSync(FILE, 'utf8');

const A = '강남권이라는 입지도 강점이다.';
const B = '클럽 문화의 중심에 자리해 접근이 어렵지 않고, 주변에서 자리를 옮기기에도 좋다.';
const AB = A + ' ' + B;

// id -> { find, to }
const map = {
  'gangnam-club-jack': { find: AB, to: '강남 클럽가의 핵심 동선 위에 자리해, 다른 곳에서 넘어오기에도 편하다.' },
  'gangnam-club-peak': { find: AB, to: '번화가 한가운데 위치해 길을 헤맬 일이 없고, 2차로 이어 가기에도 좋다.' },
  'gangnam-club-miro': { find: AB, to: '강남 중심가에 자리해 처음 찾는 손님도 위치를 어렵지 않게 찾는다.' },
  'gangnam-club-utopia': { find: AB, to: '유동 인구가 많은 강남 한복판이라, 늦은 시간에도 오가기 부담이 없다.' },
  'gangnam-club-laputa': { find: AB, to: '조용히 즐기기 좋으면서도 강남 중심과 가까워 접근성이 뛰어나다.' },
  'gangnam-club-face': { find: AB, to: '강남 핵심 상권에 자리해 찾아오기 쉽고, 격을 갖춘 동네 분위기와도 잘 맞는다.' },
  'gangnam-club-arte': { find: AB, to: '강남 문화 중심지에 위치해, 예술적 감각을 즐기려는 손님이 닿기 편하다.' },
  'gangnam-club-bamnbam': { find: A, to: '자리한 위치도 강점으로 꼽힌다. 강남 번화가 가까이 있어 새벽까지 즐기고 이동하기에도 무리가 없다.' },
  'gangnam-club-race': { find: B, to: '역삼 일대 유흥의 한복판에 자리해, 어느 방향에서든 찾아오기 쉽다.' },
  'apgujeong-club-hype': { find: B, to: '신사동 클럽 거리 한복판에 있어, 트렌드에 민감한 손님들이 모이기 좋다.' },
  'apgujeong-club-intro': { find: B, to: '압구정 유흥가 중심에 자리해 접근이 쉽고, 새로운 경험을 찾는 발길이 이어진다.' },
  'apgujeong-club-color': { find: B, to: '압구정동 번화가에 위치해 오가기 편하고, 감각적인 손님들의 동선과 맞닿아 있다.' },
  'apgujeong-club-debridge': { find: B, to: '신사동 핵심 상권에 자리해, 다양한 무대를 찾는 손님들이 닿기 좋다.' },
  'apgujeong-club-candyman': { find: B, to: '신사동 중심에 있어 가볍게 들르기 좋고, 첫 클럽으로 찾기에도 부담이 없다.' },
  'apgujeong-club-muin': { find: B, to: '압구정동 한복판에 자리해, 편리함을 중시하는 손님들이 찾아오기 쉽다.' },
};

let fixed = 0;
s = s.replace(/'([a-z0-9-]+)':\s*`([^`]*)`/g, (full, id, body) => {
  const r = map[id];
  if (!r) return full;
  if (!body.includes(r.find)) { console.warn('못찾음:', id); return full; }
  fixed++;
  return `'${id}': \`${body.replace(r.find, r.to)}\``;
});
fs.writeFileSync(FILE, s, 'utf8');
console.log('교체 완료:', fixed, '곳');
