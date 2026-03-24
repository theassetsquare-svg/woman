import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getVenueByRegionSlug, getRegionName, getVenuesByRegion, getVenueLabel, getVenueHook, getVenueSeoDescription, getSubKeywords, getMainLink } from '../data/venues';
import { getVenueContent } from '../data/venueContent';
import { useOgMeta } from '../hooks/useOgMeta';
import { venuePath } from '../utils/slug';
import VenueCard from '../components/VenueCard';
import { MidBreakHook, SimilarHook, AIRecommendHook, BlurLockSection, CompareHook, ShareButton, WriteReviewHook, CouponHook, SlideUpCTA, ScrollBanner } from '../components/HookingWidgets';

const MAIN = getMainLink();
const BASE = 'https://woman-5nj.pages.dev';

export default function VenueDetailPage() {
  const { region, slug } = useParams<{ region: string; slug: string }>();
  const venue = region && slug ? getVenueByRegionSlug(region, slug) : undefined;

  const venueLabel = venue ? getVenueLabel(venue) : '';
  const hook = venue ? getVenueHook(venue.id) : '';
  const seoDesc = venue ? getVenueSeoDescription(venue.id) : '';
  useOgMeta(
    venue
      ? {
          title: `${venueLabel} — ${hook}`,
          description: seoDesc || venue.description,
          image: `/og/${venue.id}.svg`,
          url: venuePath(venue),
        }
      : { title: '업소를 찾을 수 없습니다', description: '', image: '', url: '' }
  );

  if (!venue) {
    return (
      <div className="px-4 py-24 text-center">
        <h1 className="text-xl mb-3">업소를 찾을 수 없습니다</h1>
        <Link to="/venues" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover font-semibold text-base">
          전체 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const related = getVenuesByRegion(venue.region).filter((v) => v.id !== venue.id).slice(0, 3);
  const venueContent = getVenueContent(venue.id);
  const subKeywords = getSubKeywords(venue);

  // JSON-LD
  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: BASE },
        { '@type': 'ListItem', position: 2, name: getRegionName(venue.region), item: `${BASE}/${venue.region}` },
        { '@type': 'ListItem', position: 3, name: venueLabel, item: `${BASE}${venuePath(venue)}` },
      ],
    };
    const s1 = document.createElement('script');
    s1.type = 'application/ld+json';
    s1.dataset.dynamic = 'true';
    s1.textContent = JSON.stringify(breadcrumb);
    document.head.appendChild(s1);
    scripts.push(s1);

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

    const localBusiness: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'NightClub',
      name: venueLabel,
      url: `${BASE}${venuePath(venue)}`,
      image: `${BASE}/og/${venue.id}.svg`,
      address: venue.address,
    };
    if (venue.phone && venue.phone !== '별도문의') localBusiness.telephone = venue.phone;
    const s3 = document.createElement('script');
    s3.type = 'application/ld+json';
    s3.dataset.dynamic = 'true';
    s3.textContent = JSON.stringify(localBusiness);
    document.head.appendChild(s3);
    scripts.push(s3);

    return () => { scripts.forEach((s) => s.remove()); };
  }, [venue, venueContent]);

  const catLabel = venue.category === 'club' ? '클럽' : venue.category === 'lounge' ? '라운지' : '나이트';

  return (
    <div className="px-4 py-8">
      {/* Breadcrumb */}
      <nav className="breadcrumb mb-6" aria-label="경로">
        <Link to="/" target="_blank" rel="noopener noreferrer">홈</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/${venue.region}`} target="_blank" rel="noopener noreferrer">{getRegionName(venue.region)}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#111111] font-medium">{venue.name}</span>
      </nav>

      {/* Hero */}
      <section className="mb-8 animate-fade-in-up">
        <div className="detail-hero-img mb-6">
          <img
            src={`/og/${venue.id}.svg`}
            alt={venueLabel}
            width={1200}
            height={630}
            className="w-full h-auto block"
            loading="lazy"
          />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="venue-badge-night" data-cat={venue.category}>{catLabel}</span>
          <span className="venue-badge-open text-sm px-3 py-0.5">영업중</span>
        </div>

        <h1 className="text-2xl leading-tight mb-3">{venueLabel}</h1>

        <p className="text-sm text-[#475569] mb-4">
          {getRegionName(venue.region)} · {venue.area}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {venue.contact && (
            <span className="text-sm font-bold text-accent bg-surface-warm px-3 py-1.5 rounded-xl border border-rosegold">
              {venue.contact} 실장
            </span>
          )}
          <ShareButton venueName={venueLabel} />
        </div>

        <div className="info-box">
          <p className="text-sm text-[#111111] leading-relaxed font-medium whitespace-pre-line">
            {venue.card_hook}
          </p>
        </div>
      </section>

      {/* Detail Info */}
      <section className="content-section">
        <h2 className="text-lg">{venueLabel} 상세 정보</h2>
        <p className="text-[#1e293b] text-sm leading-relaxed mb-4">{venue.description}</p>

        <div className="space-y-2 mb-4">
          <InfoRow label="주소" value={venue.address} />
          <InfoRow label="영업시간" value={venue.hours} />
          <InfoRow label="연락처" value={venue.phone} />
        </div>

        <div className="flex flex-wrap gap-2">
          {venue.tags.map((tag) => (
            <span key={tag} className="detail-tag text-xs">
              #{tag}
            </span>
          ))}
        </div>
      </section>

      {/* [후킹2] 중간 끊기 */}
      <MidBreakHook />

      {/* Content Engine */}
      {venueContent && (
        <>
          {/* Summary */}
          <section className="content-section">
            <h2 className="text-lg">한눈에 보기</h2>
            <div className="summary-box">
              <ul className="space-y-2.5">
                {venueContent.summary.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#1e293b] leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Intro */}
          <section className="content-section">
            <h2 className="text-lg">{subKeywords[0]} 이용 가이드</h2>
            <p className="text-[#1e293b] text-sm leading-[1.85] whitespace-pre-line">{venueContent.intro}</p>
          </section>

          {/* Sections (show first 3, then hooking, then rest) */}
          {venueContent.sections.slice(0, 3).map((sec, i) => (
            <section key={i} className="content-section">
              <h3 className="text-base font-bold text-[#111111]">{sec.title}</h3>
              <p className="text-[#1e293b] text-sm leading-[1.85] whitespace-pre-line">{sec.body}</p>
            </section>
          ))}

          {/* [후킹9] 블러 잠금 — 리뷰 평점 */}
          <BlurLockSection>
            <div className="space-y-2">
              <p className="text-sm font-bold">방문자 리뷰 평점</p>
              <p className="text-2xl font-black">★★★★☆ 4.2점</p>
              <p className="text-sm text-[#475569]">"분위기가 좋고 사운드가 압도적" — 최근 리뷰 중</p>
              <p className="text-sm text-[#475569]">"실장이 친절해서 다시 방문" — 단골 리뷰</p>
            </div>
          </BlurLockSection>

          {/* [후킹3] 비슷한 업소 추천 → 메인 */}
          <SimilarHook />

          {/* Remaining sections */}
          {venueContent.sections.slice(3).map((sec, i) => (
            <section key={i + 3} className="content-section">
              <h3 className="text-base font-bold text-[#111111]">{sec.title}</h3>
              <p className="text-[#1e293b] text-sm leading-[1.85] whitespace-pre-line">{sec.body}</p>
            </section>
          ))}

          {/* Quick Plan */}
          <section className="content-section">
            <h2 className="text-lg">30초 플랜</h2>
            <div className="quickplan-box">
              <p className="text-[#111111] font-bold text-sm mb-3">{venueContent.quickPlan.decision}</p>
              <div className="space-y-2 mb-3">
                {venueContent.quickPlan.scenarios.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-[#1e293b] leading-relaxed">
                    <span className="text-accent font-bold mt-0.5 shrink-0">▸</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#475569] font-medium border-t border-rosegold pt-3">{venueContent.quickPlan.costNote}</p>
            </div>
          </section>

          {/* [후킹4] AI 추천 */}
          <AIRecommendHook />

          {/* [후킹11] 비교 기능 */}
          <CompareHook />

          {/* FAQ */}
          <section className="content-section">
            <h2 className="text-lg">{venueLabel} 자주 묻는 질문</h2>
            <div className="space-y-2.5">
              {venueContent.faq.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </section>

          {/* [후킹14] 리뷰 작성 */}
          <WriteReviewHook />

          {/* [후킹15] 쿠폰 */}
          <CouponHook />

          {/* Conclusion */}
          <section className="content-section">
            <div className="conclusion-box">
              <p className="text-[#111111] text-sm leading-[1.85] whitespace-pre-line relative">{venueContent.conclusion}</p>
            </div>
          </section>
        </>
      )}

      {/* Bottom CTA */}
      <section className="bottom-cta p-6 text-center mb-8">
        <h3 className="text-base font-extrabold text-[#111111] mb-2">{subKeywords[0]} 방문 전 확인</h3>
        <p className="text-[#475569] text-xs mb-4 leading-relaxed">
          영업시간 및 운영 조건은 변동될 수 있습니다. 방문 전 전화로 확인하세요.
        </p>
        {venue.phone && venue.phone !== '별도문의' && (
          <a
            href={`tel:${venue.phone.replace(/-/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            {venue.contact ? `${venue.contact} 실장에게 전화` : '전화하기'} — {venue.phone}
          </a>
        )}
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg mb-4">
            {getRegionName(venue.region)} 다른 업소
          </h2>
          <div className="venue-grid">
            {related.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        </section>
      )}

      {/* [후킹5] 전체 비교 → 메인 */}
      <a
        href={MAIN}
        target="_blank"
        rel="noopener noreferrer"
        className="footer-mega-cta block mb-8"
      >
        <p className="text-lg font-black mb-1">103개 전체 업소 실시간 순위</p>
        <p className="text-sm opacity-80">AI추천+리뷰 → 밤키 바로가기</p>
      </a>

      {/* Fixed phone bar */}
      {venue.phone && venue.phone !== '별도문의' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto">
          <div className="bg-gradient-to-r from-accent to-accent-hover shadow-2xl">
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{venueLabel}</p>
                {venue.contact && (
                  <p className="text-rosegold text-xs font-semibold">{venue.contact} 실장</p>
                )}
              </div>
              <a
                href={`tel:${venue.phone.replace(/-/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-white text-accent font-bold text-sm px-4 py-2.5 rounded-xl shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                전화
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating widgets */}
      <SlideUpCTA />
      <ScrollBanner />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-info-card flex items-start gap-3">
      <div className="min-w-0">
        <span className="text-[10px] text-[#475569] font-semibold uppercase tracking-wider block mb-0.5">{label}</span>
        <span className="text-sm font-semibold text-[#111111] block truncate">{value}</span>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button onClick={() => setOpen(!open)}>
        <span className="text-sm font-semibold text-[#111111]">{q}</span>
        <svg
          className={`w-4 h-4 text-[#475569] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`faq-answer ${open ? '' : 'hidden'}`}>
        <p className="text-[#1e293b] text-sm leading-relaxed whitespace-pre-line">{a}</p>
      </div>
    </div>
  );
}
