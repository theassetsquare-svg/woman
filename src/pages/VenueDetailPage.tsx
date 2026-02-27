import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getVenueByRegionSlug, getRegionName, getVenuesByRegion, getVenueLabel, getVenueHook } from '../data/venues';
import { getVenueContent } from '../data/venueContent';
import { useOgMeta } from '../hooks/useOgMeta';
import { venuePath } from '../utils/slug';
import VenueCard from '../components/VenueCard';

export default function VenueDetailPage() {
  const { region, slug } = useParams<{ region: string; slug: string }>();
  const venue = region && slug ? getVenueByRegionSlug(region, slug) : undefined;

  // OG meta (must be called unconditionally)
  const venueLabel = venue ? getVenueLabel(venue) : '';
  const hook = venue ? getVenueHook(venue.id) : '';
  useOgMeta(
    venue
      ? {
          title: `${venueLabel} — ${hook}`,
          description: venue.description,
          image: `/og/${venue.id}.svg`,
          url: venuePath(venue),
        }
      : { title: '업소를 찾을 수 없습니다', description: '', image: '', url: '' }
  );

  if (!venue) {
    return (
      <div className="max-w-[760px] mx-auto px-5 md:px-8 py-24 text-center">
        <h1 className="text-2xl mb-3">업소를 찾을 수 없습니다</h1>
        <Link to="/venues" className="text-accent hover:text-accent-hover font-semibold text-base">
          전체 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const related = getVenuesByRegion(venue.region).filter((v) => v.id !== venue.id).slice(0, 3);
  const venueContent = getVenueContent(venue.id);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ' ' + getRegionName(venue.region))}`;
  const BASE = 'https://woman-5nj.pages.dev';

  // Inject BreadcrumbList + FAQPage JSON-LD
  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];

    // BreadcrumbList
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: BASE },
        { '@type': 'ListItem', position: 2, name: getRegionName(venue.region), item: `${BASE}/${venue.region}` },
        { '@type': 'ListItem', position: 3, name: venue.name, item: `${BASE}${venuePath(venue)}` },
      ],
    };
    const s1 = document.createElement('script');
    s1.type = 'application/ld+json';
    s1.dataset.dynamic = 'true';
    s1.textContent = JSON.stringify(breadcrumb);
    document.head.appendChild(s1);
    scripts.push(s1);

    // FAQPage (if content has FAQ)
    if (venueContent && venueContent.faq.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: venueContent.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      };
      const s2 = document.createElement('script');
      s2.type = 'application/ld+json';
      s2.dataset.dynamic = 'true';
      s2.textContent = JSON.stringify(faqSchema);
      document.head.appendChild(s2);
      scripts.push(s2);
    }

    return () => {
      scripts.forEach((s) => s.remove());
    };
  }, [venue, venueContent]);

  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-8 py-12 md:py-16">
      {/* Breadcrumb */}
      <nav className="breadcrumb mb-8" aria-label="경로">
        <Link to="/">홈</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/${venue.region}`}>{getRegionName(venue.region)}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-navy font-medium">{venue.name}</span>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="mb-10 animate-fade-in-up">
        {/* 1) Thumbnail image */}
        <div className="detail-hero-img mb-8">
          <img
            src={`/og/${venue.id}.svg`}
            alt={`${venue.name} 썸네일`}
            width={1200}
            height={630}
            className="w-full h-auto block"
          />
        </div>

        {/* 2) H1 = Store name */}
        <h1 className="text-3xl md:text-[2.5rem] leading-tight mb-4">{venueLabel}</h1>

        {/* 3) Quick meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="venue-badge-open text-sm px-4 py-1">
            영업중
          </span>
          <span className="text-text-muted text-[15px] font-medium">
            {getRegionName(venue.region)} · {venue.area}
          </span>
        </div>

        {/* 4) CTA row */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            지도에서 보기
          </a>
          <Link
            to="/venues"
            className="btn-outline"
          >
            다른 장소 둘러보기
          </Link>
        </div>

        {/* 5) Intro value hook */}
        <div className="info-box">
          <p className="text-base text-navy leading-relaxed font-medium whitespace-pre-line">
            {venue.card_hook}
          </p>
        </div>
      </section>

      {/* ===== DETAIL INFO ===== */}
      <section className="content-section">
        <h2 className="text-xl md:text-2xl">상세 정보</h2>

        <p className="text-text text-base leading-relaxed mb-6">{venue.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <InfoRow label="주소" value={venue.address} />
          <InfoRow label="영업시간" value={venue.hours} />
          <InfoRow label="연락처" value={venue.phone} />
        </div>

        <div className="flex flex-wrap gap-2">
          {venue.tags.map((tag) => (
            <span key={tag} className="detail-tag">
              #{tag}
            </span>
          ))}
        </div>
      </section>

      {/* ===== CONTENT ENGINE ===== */}
      {venueContent && (
        <>
          {/* AI Summary */}
          <section className="content-section">
            <h2 className="text-xl md:text-2xl">한눈에 보기</h2>
            <div className="summary-box">
              <ul className="space-y-3">
                {venueContent.summary.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-base text-text leading-relaxed">
                    <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 2-Minute Intro */}
          <section className="content-section">
            <h2 className="text-xl md:text-2xl">2분 소개</h2>
            <p className="text-text text-base leading-[1.85] whitespace-pre-line">{venueContent.intro}</p>
          </section>

          {/* Story Body Sections */}
          {venueContent.sections.map((sec, i) => (
            <section key={i} className="content-section">
              <h3 className="text-lg md:text-xl font-bold text-navy">{sec.title}</h3>
              <p className="text-text text-base leading-[1.85] whitespace-pre-line">{sec.body}</p>
            </section>
          ))}

          {/* Quick Plan */}
          <section className="content-section">
            <h2 className="text-xl md:text-2xl">30초 플랜</h2>
            <div className="quickplan-box">
              <p className="text-navy font-bold text-base mb-4">{venueContent.quickPlan.decision}</p>
              <div className="space-y-2 mb-4">
                {venueContent.quickPlan.scenarios.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-base text-text leading-relaxed">
                    <span className="text-accent font-bold mt-0.5 shrink-0">▸</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-text-muted font-medium border-t border-accent/15 pt-3">{venueContent.quickPlan.costNote}</p>
            </div>
          </section>

          {/* FAQ */}
          <section className="content-section">
            <h2 className="text-xl md:text-2xl">자주 묻는 질문</h2>
            <div className="space-y-3">
              {venueContent.faq.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </section>

          {/* Conclusion */}
          <section className="content-section">
            <div className="conclusion-box">
              <p className="text-white text-base leading-[1.85] whitespace-pre-line relative">{venueContent.conclusion}</p>
            </div>
          </section>
        </>
      )}

      {/* ===== BOTTOM CTA ===== */}
      <section className="bottom-cta p-8 md:p-10 text-center mb-10">
        <h3 className="text-xl font-extrabold text-white mb-3">방문 전 확인하세요</h3>
        <p className="text-slate-400 text-[15px] mb-6 leading-relaxed">
          영업시간 및 운영 조건은 변동될 수 있습니다. 방문 전 전화로 확인하시기 바랍니다.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
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
              className="btn-secondary"
            >
              전화하기
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-info-card flex items-start gap-3">
      <div className="min-w-0">
        <span className="text-xs text-text-muted font-semibold uppercase tracking-wider block mb-1">{label}</span>
        <span className="text-[15px] font-semibold text-navy block truncate">
          {value}
        </span>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button onClick={() => setOpen(!open)}>
        <span className="text-base font-semibold text-navy">{q}</span>
        <svg
          className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="faq-answer">
          <p className="text-text text-[15px] leading-relaxed whitespace-pre-line">{a}</p>
        </div>
      )}
    </div>
  );
}
