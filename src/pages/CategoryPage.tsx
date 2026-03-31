import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { venues, regions, getVenueLabel, getMainLink } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import VenueCard from '../components/VenueCard';

const MAIN = getMainLink();

type CatKey = 'club' | 'night' | 'lounge' | 'room' | 'yojeong' | 'hoppa';

const catConfig: Record<CatKey, { label: string; plural: string; title: string; desc: string; intro: string }> = {
  club: {
    label: '클럽',
    plural: 'clubs',
    title: '전국 클럽 — DJ 사운드가 몸을 움직이는 곳',
    desc: '강남부터 홍대, 이태원, 부산까지. 현장 검증된 클럽만 모았습니다. 분위기·DJ·입장 정보 한눈에.',
    intro: `클럽은 단순히 춤추는 곳이 아닙니다. 조명이 바뀌는 순간, 베이스가 가슴을 두드리는 순간, 모르는 사람과 눈이 마주치는 순간 — 그건 다른 어디에서도 느낄 수 없는 경험입니다.\n\n강남 역삼동 골목에서 이태원 메인 스트리트까지, 홍대 서교동 뒷골목에서 압구정 가로수길까지. EDM부터 힙합, 테크노까지 장르도 공간도 전부 다릅니다.\n\n어디가 줄이 긴지, 어디가 사운드 좋은지, 드레스코드는 뭔지. 직접 발로 뛰어서 정리했습니다. 가기 전에 여기서 확인하세요.`,
  },
  night: {
    label: '나이트',
    plural: 'nights',
    title: '전국 나이트 — 세대를 넘어 사람들이 모이는 현장',
    desc: '서울부터 부산, 대구, 광주까지. 전국 나이트 현장 정보를 한눈에 비교하세요.',
    intro: `세대를 넘어 사람들이 모이는 무대입니다. 20대부터 60대까지, 라이브 밴드 앞에서 춤추는 그 순간만큼은 나이가 의미 없습니다.\n\n전국 부킹 명소를 하나하나 직접 확인했습니다. 분위기는 어떤지, 어떤 음악이 나오는지, 주차는 되는지, 언제 가야 좋은지.\n\n실장이 직접 관리하는 곳, 단골이 많은 곳, 주말이면 줄 서는 곳. 가기 전에 여기서 확인하세요. 전화 한 통이면 현장에서 당황할 일이 없습니다.`,
  },
  lounge: {
    label: '라운지',
    plural: 'lounges',
    title: '압구정 라운지 — 대화가 가능한 밤의 공간',
    desc: '시끄러운 곳이 싫다면 라운지. 편안한 소파, 좋은 술, 조용한 음악. 압구정 라운지 정보.',
    intro: `시끄러운 곳이 싫은 사람들을 위한 여유로운 공간입니다. 조용한 음악, 편안한 소파, 좋은 술 한 잔. 대화가 가능한 밤을 원한다면 이곳이 정답입니다.\n\n소파석에 앉아 DJ 셋을 감상하거나, 바 카운터에서 칵테일을 즐기거나. 에너지 넘치는 파티보다 여유로운 분위기를 선호하는 분께 추천합니다.\n\n압구정 신사동 일대 분위기 좋은 곳만 골라 정리했습니다. 예약이 필수인 곳이 많으니 사전 문의를 추천합니다.`,
  },
  room: {
    label: '룸',
    plural: 'rooms',
    title: '프라이빗 룸 — 우리끼리 즐기는 남다른 공간',
    desc: '회식, 모임, 기억할 밤. 프라이빗 룸 정보를 비교하세요.',
    intro: `프라이빗한 공간이 필요한 사람들의 선택입니다. 회식이든, 친구 모임이든, 기억할 밤이든. 다른 사람 신경 쓰지 않고 우리끼리 즐기고 싶을 때 가는 곳입니다.\n\n넓은 공간에 편한 소파, 전용 음향 시스템. 인원에 맞는 개인 공간을 고르면 분위기가 확 달라집니다.\n\n어디가 넓은지, 어디가 서비스 좋은지, 예약은 어떻게 하는지. 방문 전 전화 한 통이면 완벽한 밤이 됩니다.`,
  },
  yojeong: {
    label: '요정',
    plural: 'yojeong',
    title: '한국 전통 요정 — 한정식과 국악이 어우러지는 공간',
    desc: '접대, 비즈니스, 격 있는 모임. 전통 요정의 격조 있는 경험.',
    intro: `한국 전통 문화를 경험하는 남다른 공간입니다. 15가지 이상의 한정식에 국악 라이브, 단아한 한복 서비스. 격조 있는 분위기에서 접대하거나 비즈니스 모임을 진행하기에 이만한 곳이 없습니다.\n\n수십 개의 프라이빗 개인실이 있어 인원과 목적에 맞게 선택할 수 있습니다. 정찰제로 운영되어 추가 비용 걱정이 없다는 것도 장점입니다.\n\n기억할 밤, 격이 다른 자리가 필요할 때. 여기서 미리 확인하세요.`,
  },
  hoppa: {
    label: '호빠',
    plural: 'hoppa',
    title: '호빠 — 여성이 편하게 즐기는 고급 공간',
    desc: '친절한 호스트와 함께하는 편안한 시간. 처음이라도 걱정 마세요.',
    intro: `호빠는 여성들이 편하게 즐기는 공간입니다. 친절한 호스트가 대화 상대가 되어주고, 분위기를 맞춰줍니다. 혼자 가도, 친구와 가도, 어색할 틈이 없습니다.\n\n강남부터 부산까지, 분위기 좋은 곳만 모았습니다. 처음이라 걱정되시나요? 실장에게 미리 전화하면 첫 방문도 편안하게 즐길 수 있습니다.\n\n어떤 분위기인지, 어떤 시스템인지, 혼자 가도 괜찮은지. 여기서 미리 확인하고 가세요. 아는 만큼 편해집니다.`,
  },
};

const firstVisitGuide: Record<CatKey, { q: string; a: string }[]> = {
  club: [
    { q: '드레스코드 있나요?', a: '대부분의 강남·압구정 클럽은 드레스코드가 있습니다. 깔끔한 캐주얼이면 대부분 입장 가능합니다. 슬리퍼·반바지·운동복은 피하세요.' },
    { q: '혼자 가도 되나요?', a: '1인 방문 비율이 생각보다 높습니다. 바 근처에 서 있으면 자연스럽게 어울릴 수 있습니다.' },
    { q: '예약이 필요한가요?', a: '금·토요일은 예약 없이 가면 대기가 길 수 있습니다. 사전 연락을 추천합니다.' },
    { q: '언제 가는 게 좋아요?', a: 'PM 10~11시 도착이 좋습니다. 너무 일찍 가면 한산하고, 자정 이후는 대기가 깁니다.' },
  ],
  night: [
    { q: '나이트 처음인데 어떻게 하나요?', a: '입구에서 실장이 안내해줍니다. 테이블 배정 받고 앉으면 됩니다. 모르는 건 실장에게 물어보세요.' },
    { q: '부킹은 어떻게 되나요?', a: '웨이터가 다른 테이블과 연결해줍니다. 원하지 않으면 거절해도 됩니다. 강요는 없습니다.' },
    { q: '주차 가능한가요?', a: '대부분 주변 공영주차장이나 인근 유료주차장을 이용합니다. 대리운전도 많이 이용합니다.' },
    { q: '연령 제한이 있나요?', a: '만 19세 이상 입장 가능합니다. 신분증을 반드시 지참하세요.' },
  ],
  lounge: [
    { q: '라운지는 클럽이랑 뭐가 다른가요?', a: '라운지는 대화가 가능할 정도로 조용합니다. 소파석에서 편하게 술을 즐기는 곳입니다. 춤추는 공간이 아닙니다.' },
    { q: '예약 필수인가요?', a: '주말은 예약을 추천합니다. 소파석은 특히 빨리 차므로 미리 연락하세요.' },
    { q: '어떤 옷을 입고 가야 하나요?', a: '깔끔한 세미 캐주얼이면 충분합니다. 너무 편한 복장은 피하세요.' },
  ],
  room: [
    { q: '몇 명까지 가능한가요?', a: '룸 크기에 따라 4명부터 20명 이상까지 가능합니다. 인원에 맞는 룸을 사전에 예약하세요.' },
    { q: '예약은 어떻게 하나요?', a: '전화 예약이 가장 확실합니다. 주말은 빨리 차므로 미리 연락하세요.' },
    { q: '취소 수수료가 있나요?', a: '업소마다 다릅니다. 예약 시 취소 정책을 반드시 확인하세요.' },
  ],
  yojeong: [
    { q: '요정은 어떤 곳인가요?', a: '한정식 코스와 함께 국악 공연을 즐기는 전통 접대 공간입니다. 비즈니스 모임이나 격 있는 자리에 적합합니다.' },
    { q: '정찰제가 뭔가요?', a: '처음 안내받은 금액이 나갈 때도 동일합니다. 추가 요금이 없어 안심하고 이용할 수 있습니다.' },
    { q: '예약은 필수인가요?', a: '반드시 사전 예약이 필요합니다. 당일 방문은 어렵습니다.' },
  ],
  hoppa: [
    { q: '호빠가 뭔가요?', a: '여성 고객을 위한 공간입니다. 남성 호스트가 대화 상대가 되어주고 분위기를 맞춰줍니다.' },
    { q: '혼자 가도 괜찮아요?', a: '1인 방문도 많습니다. 실장에게 미리 말하면 더 신경 써줍니다. 어색할 틈이 없어요.' },
    { q: '안전한가요?', a: '합법적으로 운영되는 곳만 수록했습니다. 불편한 상황이 생기면 실장에게 바로 말씀하세요.' },
    { q: '어떤 옷을 입고 가나요?', a: '편하게 입고 가시면 됩니다. 별도 드레스코드는 없습니다.' },
  ],
};

const pathToCat: Record<string, CatKey> = {
  '/clubs': 'club',
  '/nights': 'night',
  '/lounges': 'lounge',
  '/rooms': 'room',
  '/yojeong': 'yojeong',
  '/hoppa': 'hoppa',
};

export default function CategoryPage() {
  const location = useLocation();
  const catKey = pathToCat[location.pathname] as CatKey;
  const cat = catKey ? catConfig[catKey] : undefined;

  const filteredVenues = useMemo(() => {
    if (!catKey) return [];
    return venues.filter((v) => v.category === catKey);
  }, [catKey]);

  const [selectedRegion, setSelectedRegion] = useState('all');

  const displayVenues = useMemo(() => {
    if (selectedRegion === 'all') return filteredVenues;
    return filteredVenues.filter((v) => v.region === selectedRegion);
  }, [filteredVenues, selectedRegion]);

  const activeRegions = useMemo(() => {
    const regionIds = new Set(filteredVenues.map((v) => v.region));
    return regions.filter((r) => regionIds.has(r.id));
  }, [filteredVenues]);

  useOgMeta(
    cat
      ? { title: cat.title, description: cat.desc, image: `/og/category-${catKey}.svg`, url: `/${cat.plural}` }
      : { title: '카테고리를 찾을 수 없습니다', description: '', image: '', url: '' }
  );

  if (!cat) {
    return (
      <div className="px-4 py-24 text-center">
        <h1 className="text-xl mb-3">카테고리를 찾을 수 없습니다</h1>
        <Link to="/venues" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover font-semibold text-sm">
          전체 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const guide = firstVisitGuide[catKey] || [];
  const isHoppa = catKey === 'hoppa';

  // VS 대결 — 같은 카테고리 내
  const vsA = filteredVenues[0];
  const vsB = filteredVenues.length > 1 ? filteredVenues[1] : undefined;

  return (
    <div className={isHoppa ? 'hoppa-theme' : ''}>
      {/* Breadcrumb */}
      <nav className="breadcrumb px-4 pt-6 mb-4" aria-label="경로">
        <Link to="/" target="_blank" rel="noopener noreferrer">홈</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#111111] font-medium">{cat.label}</span>
      </nav>

      {/* Header */}
      <section className="px-4 mb-6">
        <h1 className="text-2xl font-extrabold text-[#111111] mb-2">{cat.label} <span className="text-accent">{filteredVenues.length}곳</span></h1>
        <p className="text-sm text-[#333333] leading-[1.85] whitespace-pre-line">{cat.intro}</p>
      </section>

      {/* [D] 첫 방문 가이드 */}
      {guide.length > 0 && (
        <section className="px-4 mb-6">
          <h2 className="text-lg font-extrabold text-[#111111] mb-3">{cat.label} 처음이세요?</h2>
          <div className="space-y-2">
            {guide.map((item, i) => (
              <details key={i} className="faq-item">
                <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer text-sm font-semibold text-[#111111] hover:bg-surface-warm transition-colors">
                  {item.q}
                </summary>
                <div className="px-4 pb-3">
                  <p className="text-sm text-[#333333] leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Region Filter */}
      <div className="flex flex-wrap gap-2 px-4 mb-6">
        <button
          onClick={() => setSelectedRegion('all')}
          className={`region-pill text-sm ${selectedRegion === 'all' ? 'region-pill--active' : 'region-pill--inactive'}`}
        >
          전체
        </button>
        {activeRegions.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRegion(r.id)}
            className={`region-pill text-sm ${selectedRegion === r.id ? 'region-pill--active' : 'region-pill--inactive'}`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Venue List */}
      <section className="px-4 mb-8">
        <p className="text-sm text-[#475569] font-medium mb-4">{displayVenues.length}개 업소</p>
        {displayVenues.length === 0 ? (
          <p className="text-center py-16 text-[#475569]">이 지역에 {cat.label} 업소가 없습니다.</p>
        ) : (
          <div className="venue-grid">
            {displayVenues.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        )}
      </section>

      {/* [E] 인기 시간대 */}
      <section className="px-4 mb-6">
        <div className="info-box">
          <h3 className="text-base font-extrabold text-[#111111] mb-2">{cat.label} 인기 시간대</h3>
          <PopularTime catKey={catKey} />
        </div>
      </section>

      {/* [B] VS 대결 */}
      {vsA && vsB && (
        <section className="px-4 mb-6">
          <VSMini a={vsA} b={vsB} />
        </section>
      )}

      {/* 밤키 CTA */}
      <section className="px-4 mb-8">
        <a
          href={MAIN}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-mega-cta block"
        >
          <p className="text-lg font-black mb-1">103개 전체 업소 비교+랭킹</p>
          <p className="text-sm opacity-80">밤키에서 확인 →</p>
        </a>
      </section>
    </div>
  );
}

function PopularTime({ catKey }: { catKey: CatKey }) {
  const data: Record<CatKey, { peak: string; tip: string }> = {
    club: { peak: '금·토 PM 11:00 ~ AM 2:00', tip: 'PM 10시 전 도착하면 대기 없이 입장 가능. 일요일은 한산합니다.' },
    night: { peak: '금·토 PM 10:00 ~ AM 1:00', tip: 'PM 9시~9시 30분 도착 추천. 좋은 자리 선점이 핵심.' },
    lounge: { peak: '금·토 PM 9:00 ~ PM 11:00', tip: '소파석은 예약 필수. 늦게 가면 바 좌석만 남습니다.' },
    room: { peak: '금·토 PM 8:00 ~ PM 11:00', tip: '주말은 반드시 사전 예약. 평일은 당일 워크인 가능.' },
    yojeong: { peak: '평일·주말 PM 6:00 ~ PM 9:00', tip: '반드시 사전 예약 필수. 당일 방문 불가.' },
    hoppa: { peak: '금·토 PM 9:00 ~ AM 1:00', tip: '첫 방문은 PM 9시 추천. 실장에게 미리 연락하면 편합니다.' },
  };
  const d = data[catKey];
  return (
    <div>
      <p className="text-sm text-[#111111] font-bold mb-1">피크 시간: {d.peak}</p>
      <p className="text-sm text-[#475569] leading-relaxed">{d.tip}</p>
    </div>
  );
}

function VSMini({ a, b }: { a: typeof venues[0]; b: typeof venues[0] }) {
  const [voted, setVoted] = useState<string | null>(null);

  return (
    <div className="cta-section p-4">
      <h3 className="text-sm font-extrabold text-[#111111] mb-3 text-center">어디가 더 끌리세요?</h3>
      <div className="grid grid-cols-2 gap-2">
        {[a, b].map((v) => (
          <button
            key={v.id}
            onClick={() => !voted && setVoted(v.id)}
            className={`p-3 rounded-xl border-2 text-center text-sm font-bold transition-all ${
              voted === v.id ? 'border-accent bg-surface-warm text-accent' : voted ? 'border-rosegold opacity-50' : 'border-rosegold hover:border-accent text-[#111111]'
            }`}
          >
            {getVenueLabel(v)}
          </button>
        ))}
      </div>
    </div>
  );
}
