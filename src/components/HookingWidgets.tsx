import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Venue } from '../data/venues';
import { getMainLink, getVenueLabel, getVenuesByRegion, venues } from '../data/venues';
import { venuePath } from '../utils/slug';

const MAIN = getMainLink();

/**
 * 스크롤 진행률 바 — 상단 고정
 */
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setProgress(Math.min(100, (scrolled / total) * 100));
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-black/5">
      <div
        className="h-full bg-gradient-to-r from-accent to-rosegold transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/**
 * 비교표 — 같은 지역 업소 간 비교
 */
export function ComparisonTable({ venue }: { venue: Venue }) {
  const opponent = venues.find((v) => v.category === venue.category && v.id !== venue.id && v.region !== venue.region);
  if (!opponent) return null;

  const rows = [
    { label: '위치', a: venue.area, b: opponent.area },
    { label: '영업시간', a: venue.hours, b: opponent.hours },
    { label: '담당', a: venue.contact ? `${venue.contact} 실장` : '-', b: opponent.contact ? `${opponent.contact} 실장` : '-' },
    { label: '연락처', a: venue.phone, b: opponent.phone },
    { label: '분위기', a: venue.tags[0] || '-', b: opponent.tags[0] || '-' },
  ];

  return (
    <section className="my-8">
      <h3 className="text-base font-black text-[#111111] mb-4">이 가게 vs 비슷한 가게</h3>
      <div className="rounded-2xl border border-rosegold overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_1fr] bg-surface-warm">
          <div className="p-3 text-center">
            <p className="text-sm font-black text-accent truncate">{venue.name}</p>
          </div>
          <div className="p-3 flex items-center">
            <span className="text-xs font-black text-[#475569]">VS</span>
          </div>
          <div className="p-3 text-center">
            <Link to={venuePath(opponent)} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-[#333] truncate hover:text-accent">
              {opponent.name}
            </Link>
          </div>
        </div>
        {rows.map((row, i) => (
          <div key={i} className={`grid grid-cols-[1fr_auto_1fr] text-sm ${i % 2 ? 'bg-surface-warm/30' : ''}`}>
            <div className="py-2.5 px-3 text-center text-[#1e293b]">{row.a}</div>
            <div className="py-2.5 px-2 text-center text-xs font-bold text-[#94a3b8]">{row.label}</div>
            <div className="py-2.5 px-3 text-center text-[#1e293b]">{row.b}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

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
            밤키에서 제대로 된 밤 시작 →
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
      <p className="text-sm opacity-80">밤키에서 한 번에 →</p>
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

/**
 * FOMO — "N명이 보고 있습니다"
 */
export function FomoCounter() {
  const [count, setCount] = useState(() => 200 + Math.floor(Math.random() * 180));

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(150, Math.min(450, prev + delta));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="fomo-counter">
      <span className="fomo-dot" />
      {count}명이 보고 있습니다
    </span>
  );
}

/**
 * 자이가르닉 — "N/총 탐색 진행률"
 */
export function ExploreProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="explore-progress">
      <p className="text-xs font-bold text-[#111111]">
        {current}/{total} 탐색 중
      </p>
      <div className="explore-progress-bar">
        <div className="explore-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/**
 * 오토플레이 — 글 읽고 후 다음 업소로 자동 이동 안내
 */
export function AutoplayNext({ venue }: { venue: Venue }) {
  const [seconds, setSeconds] = useState(8);
  const [cancelled, setCancelled] = useState(false);

  const cancel = useCallback(() => setCancelled(true), []);

  useEffect(() => {
    if (cancelled) return;
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, cancelled]);

  if (cancelled) return null;

  return (
    <div className="autoplay-next">
      <p className="text-sm font-bold text-[#111111] mb-2">
        {seconds > 0 ? (
          <>다음 업소로 {seconds}초 후 이동</>
        ) : (
          <>지금 바로 확인해 보세요</>
        )}
      </p>
      <Link
        to={venuePath(venue)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent font-bold text-sm hover:text-accent-hover"
      >
        {getVenueLabel(venue)} 보러 가기 →
      </Link>
      {seconds > 0 && (
        <button
          onClick={cancel}
          className="block mx-auto mt-2 text-xs text-[#555555] hover:text-[#111111]"
        >
          취소
        </button>
      )}
    </div>
  );
}

/**
 * 스와이프 갤러리 — 가로 스크롤 이미지 갤러리
 */
export function SwipeGallery({ venue }: { venue: Venue }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const labels = ['매장 전경', '내부 인테리어', '무대 & 사운드', '좌석 배치', '입구 & 간판', '야경 분위기'];
  const stories = [
    '문을 열면 가장 먼저 눈에 들어오는 풍경이다.',
    '분위기를 결정짓는 건 결국 이 공간의 질감이다.',
    '스피커에서 나오는 첫 비트가 몸을 먼저 깨운다.',
    '어디에 앉느냐에 따라 밤의 성격이 완전히 바뀐다.',
    '입구부터 이미 분위기가 시작된다.',
    '해가 지면 이곳의 진짜 얼굴이 드러난다.',
  ];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setCurrent(idx);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  return (
    <section className="my-6">
      <h3 className="text-base font-black text-[#111111] mb-3">사진 갤러리</h3>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 scrollbar-hide -mx-4 px-4"
        style={{ scrollbarWidth: 'none' }}
      >
        {labels.map((label, i) => (
          <div key={i} className="snap-center shrink-0 w-[85%] rounded-xl overflow-hidden relative">
            <img
              src={`/og/${venue.id}.svg`}
              alt={`${getVenueLabel(venue)} ${label}`}
              width={480}
              height={270}
              loading="lazy"
              className="w-full h-auto block"
              style={{ filter: i > 0 ? `hue-rotate(${i * 30}deg) brightness(${1 - i * 0.05})` : undefined }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
              <p className="text-white text-sm font-bold drop-shadow-lg">{label}</p>
              <p className="text-white/80 text-xs mt-0.5 drop-shadow-lg">{stories[i]}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {labels.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-accent' : 'bg-rosegold/40'}`}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * VS 투표 — 이 업소 vs 다른 업소
 */
export function VSVote({ venue }: { venue: Venue }) {
  const opponent = venues.find(
    (v) => v.category === venue.category && v.id !== venue.id && v.region !== venue.region
  );
  const [voted, setVoted] = useState<string | null>(null);
  const [counts, setCounts] = useState({ a: 0, b: 0 });

  useEffect(() => {
    const seed = venue.id.length + (opponent?.id.length || 0);
    setCounts({ a: 120 + seed * 7 % 80, b: 95 + seed * 11 % 80 });
  }, [venue.id, opponent?.id]);

  if (!opponent) return null;

  const total = counts.a + counts.b + (voted ? 1 : 0);
  const pctA = Math.round(((counts.a + (voted === 'a' ? 1 : 0)) / total) * 100);
  const pctB = 100 - pctA;

  return (
    <section className="my-8 p-5 bg-surface-warm border-2 border-rosegold rounded-2xl">
      <h3 className="text-sm font-black text-accent text-center mb-4">VS 투표</h3>
      <p className="text-center text-sm font-bold text-[#111111] mb-4">어디가 더 끌리나요?</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => !voted && setVoted('a')}
          className={`p-3 rounded-xl border-2 text-left transition-all min-h-[48px] ${
            voted === 'a' ? 'border-accent bg-accent/5' : voted ? 'border-rosegold/50 opacity-60' : 'border-rosegold hover:border-accent'
          }`}
        >
          <p className="text-sm font-bold text-[#111111] truncate">{venue.name}</p>
          <p className="text-xs text-[#555555]">{venue.area}</p>
          {voted && <p className="text-xs font-black text-accent mt-1">{pctA}%</p>}
        </button>
        <button
          onClick={() => !voted && setVoted('b')}
          className={`p-3 rounded-xl border-2 text-left transition-all min-h-[48px] ${
            voted === 'b' ? 'border-accent bg-accent/5' : voted ? 'border-rosegold/50 opacity-60' : 'border-rosegold hover:border-accent'
          }`}
        >
          <p className="text-sm font-bold text-[#111111] truncate">{opponent.name}</p>
          <p className="text-xs text-[#555555]">{opponent.area}</p>
          {voted && <p className="text-xs font-black text-accent mt-1">{pctB}%</p>}
        </button>
      </div>
      {voted && (
        <p className="text-center text-xs text-[#555555] mt-3">{total}명 참여</p>
      )}
    </section>
  );
}

/**
 * 인라인 퀴즈 — 재미 요소
 */
export function InlineQuiz({ venue }: { venue: Venue }) {
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(-1);

  const quizzes = [
    { q: `${venue.area} 지역에서 가장 많은 카테고리는?`, options: ['나이트', '클럽', '라운지'], correct: 0 },
    { q: '밤 문화 이용 시 가장 중요한 것은?', options: ['분위기', '음악', '접근성'], correct: 0 },
    { q: '주말 방문 시 가장 좋은 시간은?', options: ['PM 9~10', 'PM 10~11', 'PM 11~12'], correct: 1 },
  ];
  const quiz = quizzes[venue.id.length % quizzes.length];

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
  };

  return (
    <section className="my-8 p-5 bg-surface-warm border-2 border-rosegold rounded-2xl">
      <p className="text-xs font-black text-accent mb-2">퀴즈</p>
      <p className="text-sm font-bold text-[#111111] mb-4">{quiz.q}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className={`w-full text-left p-3 rounded-xl border-2 text-sm font-semibold transition-all min-h-[44px] ${
              !answered ? 'border-rosegold hover:border-accent text-[#111111]' :
              i === quiz.correct ? 'border-green-500 bg-green-50 text-green-700' :
              i === selected ? 'border-red-400 bg-red-50 text-red-600' :
              'border-rosegold/30 opacity-50 text-[#555555]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {answered && (
        <p className="text-xs text-[#555555] mt-3 text-center">
          {selected === quiz.correct ? '정답! 잘 알고 계시네요.' : `정답은 "${quiz.options[quiz.correct]}"입니다.`}
        </p>
      )}
    </section>
  );
}

/**
 * "이 업소의 비밀" — 스크롤 80%에서 공개
 */
export function SecretReveal({ venue }: { venue: Venue }) {
  const [revealed, setRevealed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && scrolled / total >= 0.8) setShow(true);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!show) return null;

  const secrets = [
    { title: '실장에게 "단골이에요"라고 말하면', body: '입장 순서와 자리 배치가 확연히 달라진다. 사전에 전화로 이름을 남겨두면 더 효과적이다.' },
    { title: '평일 PM 10 이전에 도착하면', body: '주말 대비 30% 이상 여유로운 공간에서 원하는 자리를 골라 앉을 수 있다.' },
    { title: '실장에게 "추천 부탁"이라고 하면', body: '그날 컨디션이 가장 좋은 테이블과 최적의 타이밍을 안내받을 수 있다.' },
    { title: '재방문 시 같은 실장을 찾으면', body: '첫 방문 때와는 차원이 다른 응대를 경험할 수 있다. 취향을 기억하고 맞춰준다.' },
    { title: '금요일 밤 11시가 넘으면', body: '분위기 최고조 타이밍이다. 이 시간대를 노리되 자리는 10시 전에 확보해야 한다.' },
  ];
  const sec = secrets[venue.id.length % secrets.length];

  return (
    <section className="my-8 animate-fade-in-up">
      <div className="p-5 bg-gradient-to-br from-[#1C1917] to-[#292524] rounded-2xl text-white">
        <p className="text-xs font-bold text-rosegold mb-2">사장님만 아는 숨겨진 팁</p>
        {revealed ? (
          <div>
            <p className="text-sm font-bold text-white mb-1">{sec.title}</p>
            <p className="text-sm leading-relaxed text-white/90">{sec.body}</p>
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="text-sm font-bold text-white/80 hover:text-white transition-colors min-h-[44px]"
          >
            탭해서 숨겨진 팁 확인하기 →
          </button>
        )}
      </div>
    </section>
  );
}

/**
 * 오늘 N명이 봤습니다 — 일일 카운터
 */
export function DailyViewCounter({ venueId }: { venueId: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    let s = seed + venueId.length * 31;
    s = (s * 16807) % 2147483647;
    const base = 80 + (s % 320);
    setCount(base);
  }, [venueId]);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#555555] bg-surface-warm px-3 py-1.5 rounded-full border border-rosegold/30">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      오늘 {count}명이 봤습니다
    </span>
  );
}

/**
 * 무한 스크롤 관련 업소 — 끝없는 추천
 */
export function InfiniteRelated({ venue }: { venue: Venue }) {
  const [items, setItems] = useState<Venue[]>([]);
  const [page, setPage] = useState(0);
  const CHUNK = 4;

  useEffect(() => {
    const pool = venues.filter((v) => v.id !== venue.id);
    let s = venue.id.length + page * 7;
    const shuffled = [...pool].sort(() => { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5; });
    setItems((prev) => [...prev, ...shuffled.slice(0, CHUNK)]);
  }, [page, venue.id]);

  return (
    <section className="mb-8">
      <h2 className="text-lg mb-4">더 많은 추천</h2>
      <div className="venue-grid">
        {items.map((v, i) => (
          <Link
            key={`${v.id}-${i}`}
            to={venuePath(v)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white border-2 border-rosegold rounded-xl hover:border-accent transition-colors"
          >
            <img
              src={`/og/${v.id}.svg`}
              alt={getVenueLabel(v)}
              width={56}
              height={56}
              loading="lazy"
              className="w-14 h-14 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#111111] truncate">{getVenueLabel(v)}</p>
              <p className="text-xs text-[#555555]">{v.area}</p>
            </div>
          </Link>
        ))}
      </div>
      <button
        onClick={() => setPage((p) => p + 1)}
        className="w-full mt-4 p-3 text-sm font-bold text-accent bg-surface-warm border-2 border-rosegold rounded-xl hover:border-accent transition-colors min-h-[48px]"
      >
        더 많은 업소 보기
      </button>
    </section>
  );
}

/**
 * 인사이더 팁 — 스크롤 70%에서 노출
 */
export function InsiderTip({ venue }: { venue: Venue }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && scrolled / total >= 0.7) setShow(true);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!show) return null;

  const tips = [
    `${venue.area}에서는 금요일 PM 10시 전에 도착하는 게 핵심이다. 그 이후로는 대기가 생긴다.`,
    `실장 이름을 대면 자리 배정이 달라진다. 전화 예약 시 꼭 언급하자.`,
    `첫 방문이면 평일을 추천한다. 주말보다 여유롭고 스태프 응대도 더 좋다.`,
    `주차는 근처 공영주차장을 이용하자. 대리운전보다 택시가 낫다.`,
    `2차로 가려면 ${venue.area} 주변 포차거리를 체크해두면 동선이 편하다.`,
    `SNS에 올리면 서비스 주는 곳도 있다. 물어볼 가치가 있다.`,
  ];
  const tip = tips[(venue.id.length * 3) % tips.length];

  return (
    <section className="my-6 animate-fade-in-up">
      <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
        <p className="text-xs font-black text-amber-600 mb-2">INSIDER TIP</p>
        <p className="text-sm text-[#111111] leading-relaxed">{tip}</p>
      </div>
    </section>
  );
}

/**
 * "여기 다녀간 사람들이 또 간 곳" — visitor correlation
 */
export function AlsoVisited({ venue }: { venue: Venue }) {
  const [items, setItems] = useState<Venue[]>([]);

  useEffect(() => {
    // 같은 카테고리 + 다른 지역에서 2개, 같은 지역에서 1개
    const sameCat = venues.filter(v => v.category === venue.category && v.id !== venue.id && v.region !== venue.region);
    const sameRegion = getVenuesByRegion(venue.region).filter(v => v.id !== venue.id);
    let s = venue.id.length * 17;
    const pick = (arr: Venue[]) => { s = (s * 16807) % 2147483647; return arr[s % arr.length]; };
    const result: Venue[] = [];
    if (sameCat.length > 0) result.push(pick(sameCat));
    if (sameRegion.length > 0) result.push(pick(sameRegion));
    if (sameCat.length > 1) { const filtered = sameCat.filter(v => !result.includes(v)); if (filtered.length > 0) result.push(pick(filtered)); }
    setItems(result);
  }, [venue]);

  if (items.length === 0) return null;

  return (
    <section className="my-8">
      <h3 className="text-base font-black text-[#111111] mb-3">여기 다녀간 사람들이 또 간 곳</h3>
      <div className="space-y-2">
        {items.map((v) => (
          <Link
            key={v.id}
            to={venuePath(v)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white border-2 border-rosegold rounded-xl hover:border-accent transition-colors"
          >
            <img src={`/og/${v.id}.svg`} alt={getVenueLabel(v)} width={48} height={48} loading="lazy" className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#111111] truncate">{getVenueLabel(v)}</p>
              <p className="text-xs text-[#555555]">{v.area}</p>
            </div>
            <span className="text-xs text-accent font-bold shrink-0">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Pull-to-Refresh 제스처
 */
export function PullToRefresh({ onRefresh }: { onRefresh: () => void }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    let active = false;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        active = true;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!active) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 60) setPulling(true);
    };
    const onTouchEnd = () => {
      if (pulling && !refreshing) {
        setRefreshing(true);
        setPulling(false);
        onRefresh();
        setTimeout(() => setRefreshing(false), 1200);
      } else {
        setPulling(false);
      }
      active = false;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [pulling, refreshing, onRefresh]);

  if (!pulling && !refreshing) return null;

  return (
    <div className="fixed top-12 left-0 right-0 z-[70] flex justify-center">
      <div className="bg-white border-2 border-rosegold rounded-full px-4 py-2 shadow-lg animate-fade-in">
        <p className="text-xs font-bold text-accent">
          {refreshing ? '새로고침 중...' : '놓으면 새로고침'}
        </p>
      </div>
    </div>
  );
}

/**
 * 바텀 시트 — 네이티브 앱 느낌 모달
 */
export function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-3xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#D1D5DB]" />
        </div>
        <div className="px-5 pb-8 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Before/After — 첫 방문 vs 단골의 차이
 */
export function BeforeAfter({ venue }: { venue: Venue }) {
  const [flipped, setFlipped] = useState(false);
  const cat = venue.category || 'night';

  const data: Record<string, { first: string[]; regular: string[] }> = {
    night: {
      first: ['입구에서 잠깐 헤맨다', '아무 자리에 앉는다', '메뉴판 보고 고민한다', '마감 시간을 모른다'],
      regular: ['실장이 먼저 알아본다', '선호 자리가 준비돼 있다', '시그니처를 바로 주문한다', '분위기 절정 타이밍을 안다'],
    },
    club: {
      first: ['입장줄에서 30분 대기한다', '플로어 한쪽에 서 있는다', '음료 뭘 시킬지 모른다', '새벽 2시에 지쳐 나간다'],
      regular: ['예약으로 바로 입장한다', 'DJ 부스 앞 자리를 잡는다', '바텐더에게 시그니처를 요청한다', '피크 타임을 알고 즐긴다'],
    },
    room: {
      first: ['아무 룸이나 배정받는다', '세팅 시간이 걸린다', '메뉴를 처음부터 고른다', '마무리가 어색하다'],
      regular: ['선호 룸을 지정받는다', '도착 전 세팅 완료', '실장 추천 코스로 시작', '자연스럽게 마무리된다'],
    },
    hoppa: {
      first: ['어떤 호스트를 골라야 할지 모른다', '분위기 파악에 시간이 걸린다', '진행 방식이 낯설다'],
      regular: ['선호 스타일을 실장이 파악한다', '도착하면 바로 분위기가 올라간다', '내 템포에 맞춰 진행된다'],
    },
  };

  const d = data[cat] || data.night;

  return (
    <section className="my-8">
      <h3 className="text-base font-black text-[#111111] mb-4">첫 방문 vs 단골의 차이</h3>
      <div className="rounded-2xl border border-rosegold overflow-hidden">
        <div className="grid grid-cols-2">
          <button
            onClick={() => setFlipped(false)}
            className={`py-3 text-sm font-bold text-center transition-colors ${!flipped ? 'bg-accent text-white' : 'bg-surface-warm text-[#475569]'}`}
          >
            첫 방문
          </button>
          <button
            onClick={() => setFlipped(true)}
            className={`py-3 text-sm font-bold text-center transition-colors ${flipped ? 'bg-accent text-white' : 'bg-surface-warm text-[#475569]'}`}
          >
            단골
          </button>
        </div>
        <div className="p-4 space-y-2.5">
          {(flipped ? d.regular : d.first).map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-[#1e293b] leading-relaxed">
              <span className={`mt-0.5 shrink-0 text-xs font-bold ${flipped ? 'text-accent' : 'text-[#94a3b8]'}`}>{flipped ? '✓' : '·'}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Time Attack — 지금 예약하면 N번째 손님!
 */
export function TimeAttack({ venue }: { venue: Venue }) {
  const [queue, setQueue] = useState(0);

  useEffect(() => {
    const d = new Date();
    const hour = d.getHours();
    const seed = d.getDate() * 100 + venue.id.length;
    const base = hour >= 20 ? 5 + (seed % 8) : hour >= 17 ? 12 + (seed % 10) : 20 + (seed % 15);
    setQueue(base);

    const timer = setInterval(() => {
      setQueue((prev) => {
        const delta = Math.random() < 0.6 ? -1 : 0;
        return Math.max(2, prev + delta);
      });
    }, 8000);
    return () => clearInterval(timer);
  }, [venue.id]);

  if (!venue.phone || venue.phone === '별도문의') return null;

  return (
    <section className="my-6">
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 mb-0.5">TIME ATTACK</p>
            <p className="text-sm font-black text-[#111]">지금 전화하면 <span className="text-accent">{queue}번째</span> 손님</p>
          </div>
          <a
            href={`tel:${venue.phone.replace(/-/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-white text-sm font-bold px-4 py-2.5 rounded-xl min-h-[44px] flex items-center"
          >
            바로 전화
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * Review Highlight — 직접 가본 손님의 한마디
 */
export function ReviewHighlight({ venue }: { venue: Venue }) {
  const cat = venue.category || 'night';

  const reviewPool: Record<string, string[][]> = {
    night: [
      ['사운드가 진짜 다르다. 귀가 아닌 몸으로 듣는 느낌.', '주말 첫 방문', '분위기 파악하고 바로 단골 결정했다.', '평일 3회차'],
      ['실장님 추천 자리가 진짜 명당이었다.', '금요일 방문', '처음 갔는데 혼자 가도 어색하지 않았다.', '일요일 방문'],
      ['평일에 가면 주말의 반값 느낌이다.', '수요일 방문', '자정 넘어서부터 진짜 분위기가 살아난다.', '토요일 3시'],
    ],
    club: [
      ['DJ 라인업 확인하고 갔는데 기대 이상이었다.', '금요 피크', '입장 심사 통과하면 그 자체로 기분 좋다.', '토요일 방문'],
      ['바 카운터에서 한 잔 하면서 분위기 읽는 게 정석이다.', '평일 방문', '새벽 3시 애프터가 진짜 본게임이다.', '토요 심야'],
      ['테이블 예약하고 가니까 대기 시간 제로였다.', '그룹 방문', '스탠딩보다 테이블이 체력 관리에 좋다.', '4인 방문'],
    ],
    room: [
      ['룸 독립성이 좋아서 대화에 집중할 수 있었다.', '접대 자리', '실장님이 취향 기억하고 맞춰준다.', '3회차 방문'],
      ['사전 연락했더니 도착하니까 세팅 끝나 있었다.', '예약 방문', '룸마다 분위기가 달라서 매번 새롭다.', '단골 후기'],
      ['인원에 맞는 룸 추천받았는데 딱 맞았다.', '6인 모임', '조명 조절 가능해서 분위기 만들기 좋다.', '소모임'],
    ],
    hoppa: [
      ['첫 방문인데 실장님이 잘 안내해줬다.', '첫 방문', '호스트 매너가 진짜 좋았다.', '재방문'],
      ['선호 스타일 말하니까 딱 맞는 분 배정해줬다.', '2회차', '부담 없는 분위기라 편하게 즐겼다.', '평일 방문'],
      ['혼자 갔는데 전혀 어색하지 않았다.', '솔로 방문', '시간 가는 줄 몰랐다. 다음에 또 간다.', '주말 방문'],
    ],
  };

  const pool = reviewPool[cat] || reviewPool.night;
  const set = pool[venue.id.length % pool.length];

  return (
    <section className="my-8">
      <h3 className="text-base font-black text-[#111111] mb-4">직접 가본 손님의 한마디</h3>
      <div className="space-y-3">
        {[0, 2].map((startIdx) => {
          const text = set[startIdx];
          const tag = set[startIdx + 1];
          return (
            <div key={startIdx} className="p-4 bg-surface-warm rounded-xl border border-rosegold/30">
              <p className="text-sm text-[#1e293b] leading-relaxed mb-2">"{text}"</p>
              <p className="text-xs font-bold text-[#94a3b8]">{tag}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * SimpleMap — 간단한 약도 + 여기서 N분 거리
 */
export function SimpleMap({ venue }: { venue: Venue }) {
  const seed = venue.id.length * 7 + venue.area.length;
  const walkMin = 3 + (seed % 8);
  const taxiMin = 5 + (seed % 10);

  const landmarks: Record<string, { station: string; landmark: string }> = {
    gangnam: { station: '강남역', landmark: '강남대로' },
    apgujeong: { station: '압구정로데오역', landmark: '갤러리아백화점' },
    cheongdam: { station: '청담역', landmark: '청담사거리' },
    sinsa: { station: '신사역', landmark: '가로수길' },
    hongdae: { station: '홍대입구역', landmark: '걷고싶은거리' },
    itaewon: { station: '이태원역', landmark: '해밀턴호텔' },
    nowon: { station: '노원역', landmark: '노원역사거리' },
    ilsan: { station: '정발산역', landmark: '라페스타' },
    suwon: { station: '수원역', landmark: '수원역광장' },
    busan: { station: '서면역', landmark: '서면교차로' },
    haeundae: { station: '해운대역', landmark: '해운대해수욕장' },
    daejeon: { station: '둔산동', landmark: '갤러리아타임월드' },
    daegu: { station: '반월당역', landmark: '동성로' },
    incheon: { station: '부평역', landmark: '부평지하상가' },
    gwangju: { station: '상무지구', landmark: '상무시민공원' },
    ulsan: { station: '남구', landmark: '삼산동번화가' },
    jeju: { station: '제주시', landmark: '중앙로' },
  };

  const info = landmarks[venue.region] || { station: `${venue.area}역`, landmark: `${venue.area} 중심가` };

  return (
    <section className="my-8">
      <h3 className="text-base font-black text-[#111111] mb-4">찾아가는 길</h3>
      <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
        <div className="flex items-start gap-3 mb-3">
          <span className="w-8 h-8 bg-accent/10 text-accent rounded-lg flex items-center justify-center shrink-0 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </span>
          <div>
            <p className="text-sm font-bold text-[#111]">{venue.address}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{info.landmark} 인근</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white p-3 rounded-xl text-center border border-[#E2E8F0]">
            <p className="text-lg font-black text-accent">{walkMin}분</p>
            <p className="text-xs text-[#64748B] font-medium">{info.station}에서 도보</p>
          </div>
          <div className="bg-white p-3 rounded-xl text-center border border-[#E2E8F0]">
            <p className="text-lg font-black text-[#111]">{taxiMin}분</p>
            <p className="text-xs text-[#64748B] font-medium">택시 이용 시</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Haptic feedback 유틸
 */
export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (!navigator.vibrate) return;
  const ms = style === 'heavy' ? 30 : style === 'medium' ? 15 : 8;
  navigator.vibrate(ms);
}
