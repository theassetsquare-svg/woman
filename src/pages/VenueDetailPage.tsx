import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { venues, getVenueByRegionSlug, getRegionName, getVenuesByRegion, getVenueLabel, getVenueHook, getVenueSeoDescription, getSubKeywords, getMainLink } from '../data/venues';
import { getVenueContent } from '../data/venueContent';
import { useOgMeta } from '../hooks/useOgMeta';
import { venuePath } from '../utils/slug';
import VenueCard from '../components/VenueCard';
import { MidBreakHook, SimilarHook, AIRecommendHook, BlurLockSection, CompareHook, ShareButton, WriteReviewHook, CouponHook, SlideUpCTA, ScrollBanner, FomoCounter, ExploreProgress, AutoplayNext, ScrollProgressBar, ComparisonTable, SwipeGallery, VSVote, InlineQuiz, SecretReveal, DailyViewCounter, InfiniteRelated, InsiderTip, AlsoVisited, haptic } from '../components/HookingWidgets';
import { useTrackVisit } from '../components/EngagementEngine';

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

  // 방문 트래킹 (포인트 +5, 탐험 진행률 업데이트)
  useTrackVisit(venue.id);

  const related = getVenuesByRegion(venue.region).filter((v) => v.id !== venue.id).slice(0, 3);
  const sameCat = venues.filter((v) => v.category === venue.category && v.id !== venue.id && v.region !== venue.region).slice(0, 3);
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
      {/* 스크롤 진행률 바 */}
      <ScrollProgressBar />

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

        {/* FOMO + 오늘 N명 + 자이가르닉 */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <FomoCounter />
          <DailyViewCounter venueId={venue.id} />
        </div>
        <div className="mt-2">
          <ExploreProgress current={venues.indexOf(venue) + 1} total={venues.length} />
        </div>
      </section>

      {/* Detail Info */}
      <section className="content-section">
        <h2 className="text-lg">상세 정보</h2>
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

      {/* 스와이프 갤러리 */}
      <SwipeGallery venue={venue} />

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
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
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

          {/* 본문 이미지 1 — intro 아래 */}
          <div className="my-4">
            <img
              src={`/og/${venue.id}.svg`}
              alt="현장 분위기"
              width={480}
              height={270}
              loading="lazy"
              className="content-img"
            />
            <p className="content-img-caption">현장 분위기</p>
          </div>

          {/* Sections (show first 3, then hooking, then rest) */}
          {venueContent.sections.slice(0, 3).map((sec, i) => (
            <section key={i} className="content-section">
              <h3 className="text-base font-bold text-[#111111]">{sec.title}</h3>
              <p className="text-[#1e293b] text-sm leading-[1.85] whitespace-pre-line">{sec.body}</p>
              {/* 2번째 섹션 뒤 이미지 삽입 */}
              {i === 1 && (
                <div className="my-4">
                  <img
                    src={`/og/${venue.id}.svg`}
                    alt="내부 공간"
                    width={480}
                    height={270}
                    loading="lazy"
                    className="content-img"
                  />
                  <p className="content-img-caption">내부 공간</p>
                </div>
              )}
            </section>
          ))}

          {/* [후킹9] 블러 잠금 — 전체 리뷰 확인은 메인에서 */}
          <BlurLockSection>
            <div className="space-y-2">
              <p className="text-sm font-bold text-[#111111]">방문자 리뷰 모아보기</p>
              <p className="text-base font-bold text-[#111111]">실제 방문 후기와 평점을 한눈에</p>
              <p className="text-sm text-[#333333]">분위기 · 사운드 · 서비스 · 접근성 항목별 리뷰</p>
            </div>
          </BlurLockSection>

          {/* VS 투표 */}
          <VSVote venue={venue} />

          {/* [후킹3] 비슷한 업소 추천 → 메인 */}
          <SimilarHook />

          {/* Remaining sections */}
          {venueContent.sections.slice(3).map((sec, i) => (
            <section key={i + 3} className="content-section">
              <h3 className="text-base font-bold text-[#111111]">{sec.title}</h3>
              <p className="text-[#1e293b] text-sm leading-[1.85] whitespace-pre-line">{sec.body}</p>
            </section>
          ))}

          {/* 인사이더 팁 — 스크롤 70% */}
          <InsiderTip venue={venue} />

          {/* 본문 이미지 3 — 나머지 섹션 후 */}
          <div className="my-4">
            <img
              src={`/og/${venue.id}.svg`}
              alt="위치 및 접근성"
              width={480}
              height={270}
              loading="lazy"
              className="content-img"
            />
            <p className="content-img-caption">위치 및 접근성 안내</p>
          </div>

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

          {/* 비교표 */}
          <ComparisonTable venue={venue} />

          {/* [후킹11] 비교 기능 */}
          <CompareHook />

          {/* 인라인 퀴즈 */}
          <InlineQuiz venue={venue} />

          {/* FAQ */}
          <section className="content-section">
            <h2 className="text-lg">자주 묻는 질문</h2>
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

          {/* "이 업소의 비밀" — 스크롤 80% */}
          <SecretReveal venue={venue} />

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

      {/* [오토플레이] 5초 후 다음 글 자동 이동 */}
      {related.length > 0 && (
        <AutoplayNext venue={related[0]} />
      )}

      {/* 여기 다녀간 사람들이 또 간 곳 */}
      <AlsoVisited venue={venue} />

      {/* Related — 같은 지역 */}
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

      {/* Related — 같은 카테고리 */}
      {sameCat.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg mb-4">
            다른 지역 {catLabel} 추천
          </h2>
          <div className="venue-grid">
            {sameCat.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        </section>
      )}

      {/* 무한 스크롤 추천 */}
      <InfiniteRelated venue={venue} />

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

      {/* Fixed phone bar — 초록 + 가운데 400px */}
      {venue.phone && venue.phone !== '별도문의' && (
        <div className="fixed bottom-20 left-0 right-0 z-50 px-4 phone-bar-fixed">
          <a
            href={`tel:${venue.phone.replace(/-/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => haptic('medium')}
            className="block max-w-[400px] mx-auto bg-[#22C55E] hover:bg-[#16A34A] text-white text-center py-3.5 rounded-xl shadow-2xl transition-colors font-bold text-base"
          >
            {venue.contact ? `${venue.contact}에게 전화 ${venue.phone}` : `전화하기 ${venue.phone}`}
          </a>
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
        <span className="text-xs text-[#475569] font-semibold uppercase tracking-wider block mb-0.5">{label}</span>
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
