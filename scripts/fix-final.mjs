// 마지막 배치 마무리: 신사동 위치문장 중복 6곳 고유화 + 근소 미달 4곳 보강
import fs from 'fs';
const FILE = 'scripts/authored-content.mjs';
let s = fs.readFileSync(FILE, 'utf8');

const SINSA = '신사동이라는 입지도 강점이다.';
const replace = {
  'apgujeong-club-hype': '신사동 트렌드의 중심에 자리한 위치도 빼놓을 수 없다.',
  'apgujeong-club-intro': '자리 잡은 신사동이라는 위치도 강점으로 작용한다.',
  'apgujeong-club-debridge': '신사동 한복판이라는 위치도 큰 몫을 한다.',
  'apgujeong-club-candyman': '찾아오기 좋은 신사동이라는 위치도 한몫한다.',
  'apgujeong-code-lounge': '신사동에 자리한 입지의 이점도 분명하다.',
  'apgujeong-lounge-dm': '신사동이라는 위치가 주는 이점도 작지 않다.',
};
const append = {
  'bucheon-club-paragon': '부천에서 수준 높은 밤을 원할 때 우선 떠올릴 만한 무대다.',
  'daejeon-seoltang-club': '유성구에서 젊고 강렬한 밤을 원한다면 망설일 이유가 없다.',
  'apgujeong-idiot-lounge': '압구정에서 반전 있는 라운지를 찾는다면 후보 1순위로 둘 만하다.',
  'busan-hoppa-star': '서면에서 화려한 밤을 원한다면 가장 먼저 떠올릴 곳이다.',
};

let n = 0;
s = s.replace(/'([a-z0-9-]+)':\s*`([^`]*)`/g, (full, id, body) => {
  let b = body;
  if (replace[id] && b.includes(SINSA)) { b = b.replace(SINSA, replace[id]); n++; }
  if (append[id]) { b = b.replace(/\s*$/, '') + ' ' + append[id]; n++; }
  return b === body ? full : `'${id}': \`${b}\``;
});
fs.writeFileSync(FILE, s, 'utf8');
console.log('수정:', n, '건');
