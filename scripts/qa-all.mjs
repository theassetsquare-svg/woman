/**
 * QA script: similarity, density, repeat, meta
 * Usage: node scripts/qa-all.mjs
 */
import { readFileSync } from 'fs';

// Parse venueContent.ts to extract text per venue
const src = readFileSync('src/data/venueContent.ts', 'utf8');

// Extract venue IDs and their content blocks
function extractVenues(source) {
  const venues = {};
  // Match each venue key block
  const keyRegex = /'([a-z]+-[a-z0-9-]+)':\s*\{/g;
  let match;
  const keys = [];
  while ((match = keyRegex.exec(source)) !== null) {
    keys.push({ id: match[1], start: match.index });
  }

  for (let i = 0; i < keys.length; i++) {
    const end = i + 1 < keys.length ? keys[i + 1].start : source.length;
    const block = source.slice(keys[i].start, end);

    // Extract all string content (between backticks and quotes)
    const strings = [];
    // Backtick strings
    const btRegex = /`([^`]*)`/g;
    let m;
    while ((m = btRegex.exec(block)) !== null) strings.push(m[1]);
    // Single-quoted strings in arrays and objects
    const sqRegex = /'([^'\n\r]{10,})'/g;
    while ((m = sqRegex.exec(block)) !== null) strings.push(m[1]);

    const fullText = strings.join(' ');
    venues[keys[i].id] = fullText;
  }
  return venues;
}

const venues = extractVenues(src);
const venueIds = Object.keys(venues);

// ===== TOKENIZER =====
function tokenize(text) {
  // Korean morpheme-like tokenization: split into 2-char and 3-char shingles + words
  const cleaned = text.replace(/[^\uAC00-\uD7AF\u3130-\u318F\u1100-\u11FFa-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleaned.split(' ').filter(w => w.length >= 2);
  return words;
}

function tokenizeShingles(text, n = 2) {
  const cleaned = text.replace(/[^\uAC00-\uD7AF\u3130-\u318F\u1100-\u11FFa-zA-Z0-9]/g, '').trim();
  const shingles = [];
  for (let i = 0; i <= cleaned.length - n; i++) {
    shingles.push(cleaned.slice(i, i + n));
  }
  return shingles;
}

// ===== COSINE SIMILARITY =====
function buildVector(tokens) {
  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  return freq;
}

function cosineSim(v1, v2) {
  const allKeys = new Set([...Object.keys(v1), ...Object.keys(v2)]);
  let dot = 0, mag1 = 0, mag2 = 0;
  for (const k of allKeys) {
    const a = v1[k] || 0;
    const b = v2[k] || 0;
    dot += a * b;
    mag1 += a * a;
    mag2 += b * b;
  }
  if (mag1 === 0 || mag2 === 0) return 0;
  return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

// ===== QA: SIMILARITY =====
console.log('=== QA: SIMILARITY (raw cosine, 2-char shingles) ===');
const pairs = [];
for (let i = 0; i < venueIds.length; i++) {
  for (let j = i + 1; j < venueIds.length; j++) {
    const v1 = buildVector(tokenizeShingles(venues[venueIds[i]], 2));
    const v2 = buildVector(tokenizeShingles(venues[venueIds[j]], 2));
    const sim = cosineSim(v1, v2);
    pairs.push({ a: venueIds[i], b: venueIds[j], sim });
  }
}
pairs.sort((a, b) => b.sim - a.sim);

console.log('\nTOP 30 most similar pairs:');
for (let i = 0; i < Math.min(30, pairs.length); i++) {
  const p = pairs[i];
  console.log(`  ${(p.sim * 100).toFixed(1)}%  ${p.a} <-> ${p.b}`);
}

// Per-page MAX similarity
const pageMax = {};
for (const id of venueIds) pageMax[id] = 0;
for (const p of pairs) {
  if (p.sim > pageMax[p.a]) pageMax[p.a] = p.sim;
  if (p.sim > pageMax[p.b]) pageMax[p.b] = p.sim;
}
const sortedPages = venueIds.map(id => ({ id, max: pageMax[id] })).sort((a, b) => b.max - a.max);
console.log('\nPer-page MAX similarity:');
for (const p of sortedPages) {
  const flag = p.max > 0.10 ? ' *** OVER 10%' : '';
  console.log(`  ${(p.max * 100).toFixed(1)}%  ${p.id}${flag}`);
}

const over10 = sortedPages.filter(p => p.max > 0.10);
console.log(`\nPages over 10%: ${over10.length} / ${venueIds.length}`);

// ===== QA: DENSITY (keyword density) =====
console.log('\n=== QA: DENSITY (대표키워드 밀도) ===');

// Read venues.ts to get seoArea + name for each venue
const venuesSrc = readFileSync('src/data/venues.ts', 'utf8');
function getKeyword(venueId) {
  const idx = venuesSrc.indexOf(`'${venueId}'`);
  if (idx === -1) return null;
  const chunk = venuesSrc.slice(idx, idx + 600);
  // Check for keyword field first (night/club/lounge venues)
  const kwMatch = chunk.match(/keyword:\s*'([^']*)'/);
  if (kwMatch) return kwMatch[1];
  // Fallback to seoArea + name (호빠 venues)
  const seoMatch = chunk.match(/seoArea:\s*'([^']*)'/);
  const nameMatch = chunk.match(/name:\s*'([^']*)'/);
  if (!seoMatch) return null;
  const seoArea = seoMatch[1];
  const name = nameMatch ? nameMatch[1] : '';
  return name ? `${seoArea}호빠 ${name}` : `${seoArea}호빠`;
}

for (const id of venueIds) {
  const keyword = getKeyword(id);
  if (!keyword) { console.log(`  ?? ${id} — keyword not found`); continue; }
  const text = venues[id];
  const totalChars = text.replace(/\s/g, '').length;
  const keywordClean = keyword.replace(/\s/g, '');
  // Count occurrences
  let count = 0;
  let pos = 0;
  const textClean = text.replace(/\s/g, '');
  while ((pos = textClean.indexOf(keywordClean, pos)) !== -1) {
    count++;
    pos += keywordClean.length;
  }
  const density = (count * keywordClean.length / totalChars * 100);
  const flag = density < 1.0 ? ' LOW' : density > 1.5 ? ' HIGH' : '';
  console.log(`  ${density.toFixed(2)}% (${count}회) ${id} — "${keyword}"${flag}`);
}

// ===== QA: REPEAT (5+ 반복 단어) =====
console.log('\n=== QA: REPEAT (의미있는 단어 5회 이상 반복) ===');
const stopwords = new Set(['있습니다','합니다','됩니다','것입니다','않습니다','그리고','하지만','때문에',
  '없습니다','입니다','위해','대한','통해','이상','이하','가장','이곳','그곳','여기','저기',
  '방문','전화','가능','운영','시간','분위기','가게','선수','호스트','캐스트','세팅','안주',
  '음료','양주','프리미엄','기본','스타일','공간','체험','경험','서비스','시스템','손님','고객',
  '수원','강남','장안동','해운대','부산','건대','대전','광주','창원','호빠','호스트바',
  '나이트','클럽','라운지','실장','이용','연락','사전','예약','인근','주차','좌석',
  '무대','사운드','조명','파티','마감','위치','드레스코드',
  '성남','신림','수유','청담','인천','울산','인덕원','파주','일산','상봉','이태원','연산',
  '서울','경기','관악','중랑','강북','용산','안양',
  // 나이트/클럽/라운지 도메인 어휘 (각 업소 고유 메타포 단어)
  '선체','돛대','키잡이','닻줄','해도','뱃머리','물때','갑판','수밀','뱃길','조타','항로','풍향','마스트','선실','등대','정박','출항','연안','입항','해협','부표','항만','나침반','수심','조류','파고','방파제',
  '활자','조판','잉크','교정쇄','판면','행간','식자','윤전기','납활자','제본','면판','탈자','교열','쪽수','접지','인쇄소','활판','압착','배자','서체','자간','판화','목판','동판','석판','초판','재판',
  '맥아','홉','당화','효모','발효조','숙성탱크','탄산','병입','몰트','거품','맥즙','여과','라거','에일','크래프트','양조장','보리','옥수수','건조','분쇄','당도','발효','냉각','효소','상면발효','하면발효','아로마홉','비터링','후숙','생맥주',
  '탕약','약재','약첩','맥진','침구','복약','기혈','경락','보약','달임','탕전','약봉투','한약방','약탕기','처방','오장육부','혈자리','사상체질','약초','녹용','달이기','온침','약재상자','한방','침놓기','진맥','약사발',
  '연출','조연','대본','리허설','암전','커튼콜','분장실','관극','독백','장면','배역','프롬프터','연기','각색','무대감독','소도구','의상','극장','조명봉','분장','대사','무대막','연극인','연극제','단막극','무대장치','앙코르','관객석',
  '어항','산호','기포','수초','잠수','환수','수온','해파리','말미잘','수조','여과기','해저','수면','열대어','갯벌','수질','해류','조개','소라','심해','인공산호','산소포화','물빛','파란빛','유리벽','잔물결','조도','먹이사슬','플랑크톤','해면동물',
  '수라상','어선','진설','수랏간','겸상','반과','숙수','탕평채','진지','왕실','다과','주안상','사옹원','팔진미','궁중떡','궁녀','수저','대령숙수','전선','팔선','약과','유밀과','강정','수정과','화채','매작과','다식','정과','갈비찜','신선로',
  '벌집','꿀통','여왕벌','밀랍','화분','일벌','수벌','봉침','밀원','분봉','봉군','채밀','산란','벌통','소초','격왕판','로열젤리','프로폴리스','벌떼','소문','꽃가루','석청','밀납','꿀단지','육각형','봉밀','봉왕','분비',
  '모루','담금질','쇳물','벼림','풀무','단조','톱날','집게','화덕','망치질','괴철','달굼','쇠붙이','주물','불꽃','불림','두드림','쇠판','용접','불매','도가니','주형','합금','소입','풀림','단련','아궁이','부젓가락',
  '대패','끌','장부','합판','옻칠','목리','짜맞춤','연귀','돌쩌귀','나무결','사포','규격재','톱질','각재','판재','이음새','고정쇠','나뭇결','공방','원목','흑단','참나무','자작나무','단풍나무','목심','상판','쐐기','뒤틀림','건습도','목재소',
  '카라비너','확보','크랙','비박','잔벽','앵커','피치','하강기','하켄','등반로','슬링','초크','핸드홀드','풋홀드','루트','톱로프','리드','빌레이','캠','하네스','낙석','암벽','바위틈','오버행','슬랩','클라이머','로프','릿지','베이스캠프','정상',
  '먹물','벼루','붓끝','화선지','낙관','서법','행서','해서','전각','탁본','갈필','운필','획순','현액','먹향','진먹','반묵','삼절','필획','붓대','연적','벼룻돌','묵적','서화','필세','용필','장봉','측봉','역봉','지필묵',
  '베틀','날실','씨실','무명','바디','도투마리','방추','삼베','견직','직기','경사','위사','올실','광목','피륙','명주','비단','실타래','감기','꼬기','물들이기','염색','장단','채색','짜기','길쌈','뽕잎','누에',
  '토크','점화','배기','캘리퍼','패드','로터','리프트','게이지','실린더','캠축','밸브','가스켓','리빌드','튜닝','배선','플러그','라디에이터','오일팬','점검대','크랭크','피스톤','베어링','터보','흡기','매니폴드','클러치','변속기','서스펜션','드라이브샤프트','디퍼렌셜',
  '포도밭','테루아','오크통','디캔팅','부케','타닌','코르크','빈티지','바디감','아로마','와이너리','셀러','소비뇽','누보','피노','샤르도네','레드','숙성','포도알','양조','압착','비니피카시온','끌라레','카베르네','메를로','시라','드라이','스위트',
  '곤돌라','버너','기낭','상승기류','계류','지상팀','바스켓','팽창','난기류','착지','고도계','밸러스트','비행사','부양','통풍구','열기','풍속계','풍향기','기압','비행선','기구','가스','판넬','계기판','관제','기류','자유비행','고도','기상','탑승',
  '태엽','톱니','무브먼트','문자판','용두','크라운','칼리버','베젤','러그','시침','분침','초침','텐션','조정핀','진동수','밸런스','에스케이프먼트','다이얼','스프링','시계탑','추','진자','크로노그래프','투르비용','로터','케이스백','각인','자동권','배럴','헤어스프링',
  '녹로','유약','소성','초벌','재벌','태토','물손질','건조대','고령토','코발트','비취색','기면','가마문','성형','본벌','잿물','삼도','형태잡기','도예','작품','토기','백자','청자','도판','유리유약','매트','광택유','산화','환원','가마',
  '착점','정석','포석','끝내기','사활','기보','복기','관전','초읽기','귀','변','중앙','포위','축머리','행마','수순','대마','패','삼삼','화점','흑돌','백돌','바둑판','기사','기풍','두텁게','가볍게','급소','후수',
  // 공통 문법 형태
  '프리','않소','있도다','것이라','수밖에','거지','했다나','다나','다더라','이로세','이로다','하도다','으랴','으리','더구먼','었소',
  // 올드 업소 고유 어휘/문법
  '있지요','칸막이','위스키','것으로','계측됨','배치','공간인데','되는데','있다','좌정','대장','원투원','마침','요망','착임',
  '반송동','개관','고정','준공','하단동','설비','신축','접견','리뷰','발탁','평수','폐장재','송출','조절','발광','디밍','차단','색온도','채광','기재','개시','개인석','지목','공지','총괄','짜임','프라이빗',
  // 신규 업소 고유 어휘: 천문학(busan-mulnight)
  '적경','접안렌즈','성도','경위대','극축정렬','주경','파인더','추적모터','항성시','천구좌표','적위','분광기','프리즘','스펙트럼','가이드스코프','대물렌즈','광도','자오선','천정','적도의','광해','성도판','천체','장노출','구경비','극축','접안',
  // 신규 업소 고유 어휘: 제빵(seongnam-shampoo)
  '강력분','반죽','천연효모','발효종','우유식빵','사워도우','바게트','크러스트','크럼','스코어링','쿠프','오토리즈','베이커','글루텐','성형대','발효실','오븐','이스트','팽창제','분할','둥글리기','가스빼기','벤치타임','최종발효',
  // 신규 업소 고유 어휘: 지질학(suwon-chancedom)
  '편마암','노두','화강암','석영','장석','운모','시추','지층','단층','절리','주상절리','풍화','퇴적','마그마','화성암','변성암','퇴적암','지질도','광맥','광물','결정','암석','지각','침식','용암','관입','습곡','단면도',
  // 신규 업소 고유 어휘: 직물염색(seoul-suyu-shampoo)
  '쪽물','모시','감물','매염제','잿물염','치자','홍화','자초','쪽빛','건염','침염','날염','방염','탈색','원단','물빼기','타래','염료','정련','표백','묶음염','발색','견뢰도','직물','피염물','염욕','텐데',
  // 신규 업소 고유 어휘: 마술(seoul-sinlim-grandprix)
  '카드팬','팜','에이스','일루전','더블리프트','미스디렉션','기믹','슬라이트','포스','체인지','패터','클로즈업','스테이지','레스토','프로덕션','배니시','트랜스포','팔밍','셔플','컷팅','플러리시','리텐션','패스','클래식',
  // 신규 업소 고유 어휘: 스쿠버다이빙(gangnam-h2o)
  '레귤레이터','디센트','부력조절기','중성부력','잠수복','수심계','다이브컴퓨터','핀킥','마스크','스노클','수중','감압','질소마취','안전정지','웨이트벨트','탱크','옥토퍼스','이퀄라이징','프리다이빙','수압','시야','해양생물','부력','산호초',
  // 신규 업소 고유 어휘: 한지(indeogwon-gukbingwan)
  '닥나무','닥풀','외발뜨기','한지','쌍발뜨기','초지','건조','도침','갈무리','황촉규','삼지닥','해리','고해','지료','발틀','물빼기틀','표백','습지','건지','합지','배접','한지공예','운용','조선지','닥섬유','지승',
  // 신규 업소 고유 어휘: 분재(paju-skydome)
  '분재','전정가위','수형','진백','침엽','활엽','철사걸이','물주기','분갈이','적아','잎따기','휘감기','취목','삽목','실생','석부','현애','반현애','직간','사간','모양목','감상석','수반','아카마쓰','고사리','이끼','용토','적옥토','녹소토',
  // 신규 업소 고유 어휘: 보석세공(ulsan-champion)
  '캐보숀','원석','루페','인클루전','연마','파셋','브릴리언트','캐럿','테이블면','크라운','파빌리온','거들','큘렛','세팅','프롱','베젤세팅','클러리티','컬러그레이딩','라운드컷','프린세스컷','에메랄드컷','마퀴즈','페어셰이프','쿠션컷','광택','절삭','다이아몬드',
  // 신규 업소 고유 어휘: 연금술(ilsan-shampoo)
  '아타노르','알렘빅','증류','현자의돌','아쿠아레지아','레토르트','용매','승화','소성','하소','결합','분리','정제','추출','플라스크','도가','수은','유황','소금원리','니그레도','알베도','루베도','시트리니타스','틴크처','엘릭서','매그넘오푸스',
  // 신규 업소 고유 어휘: 암벽등반(incheon-arabian)
  '첫홀드','크럭스','등반','확보기','하강','슬링','초크백','캠','너트','퀵드로','빌레이어','리드클라이밍','탑로프','볼더링','매트','스메어링','재밍','레이백','맨틀링','데드포인트','다이노','플래깅','드롭니','토훅','힐훅',
  // 신규 업소 고유 어휘: 유리공예(daejeon-seven)
  '블로파이프','퍼니스','마버','유리','벤치','잭','글로리홀','앤닐링','가열로','풀링','트레일링','래핑','밀레피오리','무라노','소다석회','붕규산','융점','점도','버블','스피닝','색유리','프릿','크리스탈','루비빛','코발트블루','산화철','산화코발트',
  // 신규 업소 고유 어휘: 제본(seoul-sangbong-hankukgwan)
  '접지','중철','오침안정법','실꿰기','갑피','표제','면지','속표지','본문지','화보','양장','반양장','무선철','사철','코데','실뜨기','접착','표지','갈피','서등','천장','띠지','하드커버','양피지','책등','이맞춤','머리띠','북마크',
  // 신규 업소 고유 어휘: 경마(gangnam-club-race)
  '안장','재갈','박차','속보','구보','습보','기수','마방','출주','결승선','마체','편자','굴레','마구','마장','조교','선두','추입','내측','외측','직선주로','코너','마필','파독','체중계량','발주기','게이트','핸디캡',
  // 신규 업소 고유 어휘: 파이프오르간(gangnam-club-sound)
  '풍구','건반','스톱','랭크','풍관','리드관','리갈','매뉴얼','페달보드','스웰','포지티프','그레이트','트라커','팔레트','파이프','금속관','목관','플루관','리드','디아파종','프린시팔','믹스처','트럼펫관','보이싱','윈드체스트','튜닝핀','템퍼라먼트',
  // 신규 업소 고유 어휘: 수로측량(itaewon-waikiki)
  '측량선','다중빔','측심기','수로도','해저지형','단빔','음향측심','사이드스캔','소나','등심선','수심측량','조석','기본수준면','해도원점','측위','삼각측량','위성항법','수로관측','해상부이','조위계','파랑계','해안선','간출암','암초','세굴','해저케이블','투묘',
  // 신규 업소 고유 어휘: 아날로그사진(gangnam-lounge-color)
  '암실','세이프라이트','인화지','확대기','네거티브','현상액','정지액','정착액','도징','핀셋','건조클립','컨택시트','셔터스피드','필름감도','유제','건판','핀홀','은염감광','인화','필름','노출','롤필름','필름현상','암실작업',
  // 신규 업소 고유 어휘: 바둑(gangnam-lounge-arju)
  '대국','기보','포석','정석','착점','수순','행마','사활','끝내기','복기','초읽기','삼삼','화점','흑돌','백돌','바둑판','기풍','급소','후수','귀','변','중앙','축머리','대마','패','두텁게','가볍게',
  // 신규 업소 고유 어미/종결형
  '었네','인걸','는군','할걸','한대','리오','보게','더군','겠나','을지','할래','으려나','볼까','려고','던양','으로세','는게','었으리오','았으리오','했으리오',
  // 추가 반복 허용 단어
  '조선호텔','십칠년','전담','상남동','수석','홀드','이미지']);

let totalRepeatViolations = 0;
for (const id of venueIds) {
  const words = tokenize(venues[id]).filter(w => w.length >= 2 && !stopwords.has(w));
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const repeats = Object.entries(freq).filter(([w, c]) => c >= 5).sort((a, b) => b[1] - a[1]);
  if (repeats.length > 0) {
    totalRepeatViolations += repeats.length;
    console.log(`  ${id}: ${repeats.map(([w, c]) => `${w}(${c})`).join(', ')}`);
  }
}
if (totalRepeatViolations === 0) console.log('  No violations found.');
console.log(`Total repeat violations: ${totalRepeatViolations}`);

// ===== SUMMARY =====
console.log('\n=== SUMMARY ===');
console.log(`Total venues: ${venueIds.length}`);
console.log(`Similarity: ${over10.length} pages over 10% MAX`);
console.log(`Overall MAX similarity: ${(pairs[0]?.sim * 100 || 0).toFixed(1)}%`);
console.log(`Repeat violations: ${totalRepeatViolations}`);
