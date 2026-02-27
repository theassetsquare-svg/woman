import { useParams, Link } from 'react-router-dom';
import { getVenueById, getRegionName, getVenuesByRegion } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import VenueCard from '../components/VenueCard';

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const venue = id ? getVenueById(id) : undefined;

  // OG meta (must be called unconditionally)
  useOgMeta(
    venue
      ? {
          title: `${venue.name} — ${getRegionName(venue.region)} ${venue.area}`,
          description: venue.description,
          image: `/og/${venue.id}.svg`,
          url: `/venue/${venue.id}`,
        }
      : { title: '업소를 찾을 수 없습니다', description: '', image: '', url: '' }
  );

  if (!venue) {
    return (
      <div className="max-w-[760px] mx-auto px-5 md:px-8 py-24 text-center">
        <p className="text-5xl mb-5" aria-hidden="true">😢</p>
        <h1 className="text-2xl mb-3">업소를 찾을 수 없습니다</h1>
        <Link to="/venues" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover font-semibold text-base">
          전체 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const related = getVenuesByRegion(venue.region).filter((v) => v.id !== venue.id).slice(0, 3);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ' ' + getRegionName(venue.region))}`;

  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-8 py-12 md:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[15px] text-text-muted mb-8" aria-label="경로">
        <Link to="/" target="_blank" rel="noopener noreferrer" className="hover:text-navy transition-colors">홈</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/region/${venue.region}`} target="_blank" rel="noopener noreferrer" className="hover:text-navy transition-colors">{getRegionName(venue.region)}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-navy font-medium">{venue.name}</span>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="mb-10">
        {/* 1) Thumbnail image */}
        <div className="rounded-2xl overflow-hidden mb-8 border border-border shadow-sm">
          <img
            src={`/og/${venue.id}.svg`}
            alt={`${venue.name} 썸네일`}
            width={1200}
            height={630}
            className="w-full h-auto block"
          />
        </div>

        {/* 2) H1 = Store name */}
        <h1 className="text-3xl md:text-[2.5rem] leading-tight mb-3">{venue.name}</h1>

        {/* 3) Quick meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="bg-emerald-50 text-emerald-700 px-3.5 py-1 rounded-full text-sm font-bold border border-emerald-200">
            영업중
          </span>
          <span className="text-text-muted text-[15px] font-medium">
            {getRegionName(venue.region)} · {venue.area}
          </span>
          <span className="text-text-light text-sm">
            2026년 확인 완료
          </span>
        </div>

        {/* 4) CTA row */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-colors text-[15px] shadow-lg shadow-accent/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            지도에서 보기
          </a>
          <Link
            to="/venues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-navy font-bold rounded-xl transition-colors text-[15px]"
          >
            다른 장소 둘러보기
          </Link>
        </div>

        {/* 5) Intro value hook */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <p className="text-base text-navy leading-relaxed font-medium whitespace-pre-line">
            {venue.card_hook}
          </p>
        </div>
      </section>

      {/* ===== DETAIL INFO ===== */}
      <section className="mb-10">
        <h2 className="text-xl md:text-2xl mb-5">상세 정보</h2>

        <p className="text-text text-base leading-relaxed mb-6">{venue.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <InfoRow icon="📍" label="주소" value={venue.address} />
          <InfoRow icon="💰" label="가격대" value={venue.price} highlight />
          <InfoRow icon="🕐" label="영업시간" value={venue.hours} />
          <InfoRow icon="📞" label="연락처" value={venue.phone} />
        </div>

        <div className="flex flex-wrap gap-2">
          {venue.tags.map((tag) => (
            <span key={tag} className="text-sm bg-purple-50 text-accent px-3.5 py-1.5 rounded-full font-semibold border border-purple-200">
              #{tag}
            </span>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section className="bg-navy rounded-2xl p-8 md:p-10 text-center mb-10">
        <h3 className="text-xl font-extrabold text-white mb-3">방문 전 확인하세요</h3>
        <p className="text-slate-400 text-[15px] mb-6 leading-relaxed">
          가격 및 영업시간은 변동될 수 있습니다. 방문 전 전화로 확인하시기 바랍니다.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-colors text-[15px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            지도에서 보기
          </a>
          {venue.phone !== '별도문의' && (
            <a
              href={`tel:${venue.phone.replace(/-/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors text-[15px] border border-white/20"
            >
              📞 전화하기
            </a>
          )}
        </div>
      </section>

      {/* ===== RELATED ===== */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl md:text-2xl mb-6">같은 지역 다른 호빠</h2>
          <div className="venue-grid">
            {related.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-border">
      <span className="text-lg" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <span className="text-sm text-text-muted font-medium block mb-0.5">{label}</span>
        <span className={`text-base font-semibold block truncate ${highlight ? 'text-accent' : 'text-navy'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
