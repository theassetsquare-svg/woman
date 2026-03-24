import { useState, useEffect } from 'react';
import { getMainLink } from '../data/venues';

const MAIN = getMainLink();

/**
 * [후킹6] 3분 체류 후 슬라이드업 CTA
 */
export function SlideUpCTA() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 180000); // 3분
    return () => clearTimeout(timer);
  }, []);

  if (!show || dismissed) return null;

  return (
    <div className="slide-up-cta px-4 pb-4">
      <div className="main-hook-banner relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-white/60 hover:text-white text-sm p-1"
          aria-label="닫기"
        >
          ✕
        </button>
        <a
          href={MAIN}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-white"
        >
          <p className="font-black text-base mb-1">
            더 많은 정보가 기다리고 있습니다
          </p>
          <p className="text-sm opacity-80">
            밤키 바로가기 →
          </p>
        </a>
      </div>
    </div>
  );
}

/**
 * [후킹7] 스크롤 80% 배너
 */
export function ScrollBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && scrolled / total >= 0.8) {
        setShow(true);
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!show || dismissed) return null;

  return (
    <div className="scroll-banner px-4">
      <div className="main-hook-banner relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-white/60 hover:text-white text-sm p-1"
          aria-label="닫기"
        >
          ✕
        </button>
        <a
          href={MAIN}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-white"
        >
          <p className="font-black text-base mb-1">
            여기서 끝이 아닙니다!
          </p>
          <p className="text-sm opacity-80">
            밤키에서 완벽한 밤 시작 →
          </p>
        </a>
      </div>
    </div>
  );
}

/**
 * [후킹2] 상세페이지 중간 끊기 — 메인 유입
 */
export function MidBreakHook() {
  return (
    <a
      href={MAIN}
      target="_blank"
      rel="noopener noreferrer"
      className="main-hook-banner block my-8"
    >
      <p className="font-black text-base mb-1">전체 리뷰 93개 + 실시간 순위</p>
      <p className="text-sm opacity-80">밤키에서 확인 →</p>
    </a>
  );
}

/**
 * [후킹3] 비슷한 업소 추천 → 메인 연결
 */
export function SimilarHook() {
  return (
    <a
      href={MAIN}
      target="_blank"
      rel="noopener noreferrer"
      className="main-hook-banner block my-6"
    >
      <p className="font-black text-base mb-1">이 업소와 비슷한 곳 5개 더 보기</p>
      <p className="text-sm opacity-80">밤키에서 전체 비교 →</p>
    </a>
  );
}

/**
 * [후킹4] AI 추천 티저
 */
export function AIRecommendHook() {
  return (
    <a
      href={MAIN}
      target="_blank"
      rel="noopener noreferrer"
      className="main-hook-banner block my-6"
    >
      <p className="font-black text-base mb-1">AI가 당신에게 맞는 업소를 추천합니다</p>
      <p className="text-sm opacity-80">밤키에서 무료 체험 →</p>
    </a>
  );
}

/**
 * [후킹5] 103개 전체 비교
 */
export function FullCompareHook() {
  return (
    <a
      href={MAIN}
      target="_blank"
      rel="noopener noreferrer"
      className="main-hook-banner block my-6"
    >
      <p className="font-black text-base mb-1">103개 전체 업소 비교+랭킹</p>
      <p className="text-sm opacity-80">밤키에서 한눈에 →</p>
    </a>
  );
}

/**
 * [후킹9] 블러 잠금 콘텐츠
 */
export function BlurLockSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="blur-lock my-6 rounded-2xl border-2 border-rosegold overflow-hidden">
      <div className="blur-lock-content p-6">
        {children}
      </div>
      <a
        href={MAIN}
        target="_blank"
        rel="noopener noreferrer"
        className="blur-lock-overlay"
      >
        <p className="text-lg font-black text-[#111111] mb-2">전체 리뷰+평점 보기</p>
        <span className="btn-main-hook text-sm px-4 py-2">
          밤키에서 무료 확인 →
        </span>
      </a>
    </div>
  );
}

/**
 * [후킹11] 비교 기능은 메인에서만
 */
export function CompareHook() {
  return (
    <a
      href={MAIN}
      target="_blank"
      rel="noopener noreferrer"
      className="block my-6 p-4 bg-surface-warm border-2 border-rosegold rounded-2xl text-center hover:border-accent transition-colors"
    >
      <p className="text-base font-bold text-[#111111] mb-1">이 업소 vs 다른 업소 비교하기</p>
      <p className="text-sm text-accent font-semibold">밤키에서만 가능 →</p>
    </a>
  );
}

/**
 * [후킹12] 공유 → 메인 링크
 */
export function ShareButton({ venueName }: { venueName: string }) {
  const handleShare = async () => {
    const shareUrl = `${MAIN}?ref=share`;
    const shareText = `${venueName} 정보를 확인해 보세요`;

    if (navigator.share) {
      try {
        await navigator.share({ title: venueName, text: shareText, url: shareUrl });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('링크가 복사되었습니다!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="btn-outline text-sm px-4 py-2"
    >
      친구에게 공유
    </button>
  );
}

/**
 * [후킹13] 오늘의 추천 — 메인에만
 */
export function TodayRecommendHook() {
  return (
    <a
      href={MAIN}
      target="_blank"
      rel="noopener noreferrer"
      className="main-hook-banner block my-6"
    >
      <p className="font-black text-base mb-1">오늘 당신에게 맞는 곳은?</p>
      <p className="text-sm opacity-80">밤키에서 AI 추천 받기 →</p>
    </a>
  );
}

/**
 * [후킹14] 리뷰 작성은 메인에서만
 */
export function WriteReviewHook() {
  return (
    <a
      href={MAIN}
      target="_blank"
      rel="noopener noreferrer"
      className="block my-4 p-4 bg-surface-warm border-2 border-rosegold rounded-2xl text-center hover:border-accent transition-colors"
    >
      <p className="text-base font-bold text-[#111111] mb-1">나도 리뷰 쓰기</p>
      <p className="text-sm text-accent font-semibold">밤키에서 작성 →</p>
    </a>
  );
}

/**
 * [후킹15] 쿠폰/이벤트는 메인에서만
 */
export function CouponHook() {
  return (
    <a
      href={MAIN}
      target="_blank"
      rel="noopener noreferrer"
      className="block my-4 p-4 bg-gradient-to-r from-surface-warm to-[#FCE7F3] border-2 border-rosegold rounded-2xl text-center hover:border-accent transition-colors"
    >
      <p className="text-base font-bold text-[#111111] mb-1">이 업소 할인 쿠폰 받기</p>
      <p className="text-sm text-accent font-semibold">밤키 회원 전용 →</p>
    </a>
  );
}

/**
 * [후킹10] TOP 10 랭킹 — 3위까지만 표시
 */
export function Top10Hook({ items }: { items: { rank: number; name: string }[] }) {
  return (
    <div className="my-8">
      <h3 className="text-lg font-black text-[#111111] mb-4">이번주 인기 업소 TOP 10</h3>
      <div className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <div key={item.rank} className="flex items-center gap-3 p-3 bg-surface-warm rounded-xl border border-rosegold">
            <span className="w-8 h-8 rounded-full bg-accent text-white text-sm font-black flex items-center justify-center">
              {item.rank}
            </span>
            <span className="text-base font-bold text-[#111111]">{item.name}</span>
          </div>
        ))}
      </div>
      <a
        href={MAIN}
        target="_blank"
        rel="noopener noreferrer"
        className="main-hook-banner block mt-4"
      >
        <p className="font-bold text-sm">4위~10위 전체 보기 → 밤키</p>
      </a>
    </div>
  );
}
