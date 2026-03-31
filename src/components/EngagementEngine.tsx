import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { venues, getVenueLabel } from '../data/venues';
import { venuePath } from '../utils/slug';

// ========== 로컬스토리지 유틸 ==========
function getLS(key: string, fallback: unknown = null) {
  try { const v = localStorage.getItem(`bamkey_${key}`); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function setLS(key: string, value: unknown) {
  try { localStorage.setItem(`bamkey_${key}`, JSON.stringify(value)); } catch { /* quota */ }
}

// ========== 날짜 시드 (매일 다른 콘텐츠) ==========
function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

// ========== [1] 가변보상 — 매일 다른 추천 ==========
export function DailyReward() {
  const rng = seededRandom(daySeed());
  const idx = Math.floor(rng() * venues.length);
  const venue = venues[idx];
  const fortunes = [
    '오늘 밤은 운명적인 만남이 기다립니다',
    '에너지 넘치는 밤이 될 거예요',
    '조용하지만 깊은 대화의 밤',
    '예상 못한 곳에서 손꼽히는 시간을',
    '오늘은 새로운 곳을 탐험할 때',
    '단골이 될 곳을 발견할 거예요',
    '분위기 끝내주는 밤이 올 예정',
  ];
  const fortune = fortunes[Math.floor(rng() * fortunes.length)];

  return (
    <div className="engagement-card">
      <p className="text-xs text-accent font-bold mb-1">오늘의 운세</p>
      <p className="text-sm text-[#333333] mb-3 leading-relaxed">{fortune}</p>
      <Link
        to={venuePath(venue)}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-3 bg-surface-warm rounded-xl border border-rosegold hover:border-accent transition-colors"
      >
        <p className="text-xs text-accent font-bold mb-0.5">운명의 장소</p>
        <p className="text-sm font-black text-[#111111]">{getVenueLabel(venue)}</p>
        <p className="text-xs text-[#555555] mt-0.5">{venue.area}</p>
      </Link>
    </div>
  );
}

// ========== [2] 스트릭 — 연속 방문 보상 ==========
export function StreakTracker() {
  const [streak, setStreak] = useState(0);
  const [todayVisited, setTodayVisited] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = getLS('lastVisit', '') as string;
    const currentStreak = getLS('streak', 0) as number;

    if (lastVisit === today) {
      setStreak(currentStreak);
      setTodayVisited(true);
    } else {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastVisit === yesterday ? currentStreak + 1 : 1;
      setStreak(newStreak);
      setLS('streak', newStreak);
      setLS('lastVisit', today);
      setTodayVisited(false);
    }
  }, []);

  const level = streak >= 30 ? '레전드 👑' : streak >= 14 ? 'VIP 💎' : streak >= 7 ? '파티피플 🎉' : streak >= 3 ? '클러버 🌙' : '뉴비 🌱';

  return (
    <div className="engagement-card">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-accent font-bold">출석 스트릭</p>
        <span className="text-xs font-bold text-[#111111]">{level}</span>
      </div>
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              i < streak % 7
                ? 'bg-accent text-white'
                : i === streak % 7 && todayVisited
                ? 'bg-accent text-white'
                : 'bg-surface-warm text-[#555555] border border-rosegold'
            }`}
          >
            {i < streak % 7 || (i === streak % 7 && todayVisited) ? '✓' : i + 1}
          </div>
        ))}
      </div>
      <p className="text-xs text-[#555555]">
        {streak}일 연속 방문 중 {streak >= 7 ? '— 대단해요!' : streak >= 3 ? '— 좋은 습관!' : '— 매일 와보세요!'}
      </p>
    </div>
  );
}

// ========== [3] 탐험 진행률 (자이가르닉) ==========
export function ExplorationProgress() {
  const [visited, setVisited] = useState<string[]>([]);

  useEffect(() => {
    const v = getLS('visitedVenues', []) as string[];
    setVisited(v);
  }, []);

  const pct = Math.round((visited.length / venues.length) * 100);
  const nextMilestone = [10, 25, 50, 75, 100].find(m => pct < m) || 100;

  return (
    <div className="engagement-card">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-accent font-bold">탐험 진행률</p>
        <span className="text-xs font-black text-[#111111]">{visited.length}/{venues.length}</span>
      </div>
      <div className="h-2 bg-rosegold/30 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-gradient-to-r from-accent to-pink rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-[#555555]">
        {pct < 10 ? '아직 시작 단계! 더 많은 곳을 탐험해보세요.' :
         pct < 25 ? `다음 목표: ${nextMilestone}% — ${nextMilestone - pct}% 남았어요!` :
         pct < 50 ? '절반 가까이 왔어요! 계속 탐험하세요.' :
         pct < 75 ? '이미 절반 이상! 마스터가 되어가고 있어요.' :
         '거의 다 탐험했어요! 전설의 탐험가!'}
      </p>
    </div>
  );
}

// ========== [4] 탐험 기록 트래커 (상세 방문 시 호출) ==========
export function useTrackVisit(venueId: string) {
  useEffect(() => {
    if (!venueId) return;
    const visited = getLS('visitedVenues', []) as string[];
    if (!visited.includes(venueId)) {
      const updated = [...visited, venueId];
      setLS('visitedVenues', updated);
    }
    // 포인트 적립
    const points = (getLS('points', 0) as number) + 5;
    setLS('points', points);
  }, [venueId]);
}

// ========== [5] 포인트 + 레벨 시스템 (도파민) ==========
export function PointsBadge() {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    setPoints(getLS('points', 0) as number);
    // 방문할 때마다 업데이트
    const interval = setInterval(() => {
      setPoints(getLS('points', 0) as number);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const level = points >= 1000 ? '레전드' : points >= 500 ? 'VIP' : points >= 200 ? '파티피플' : points >= 50 ? '클러버' : '뉴비';
  const emoji = points >= 1000 ? '👑' : points >= 500 ? '💎' : points >= 200 ? '🎉' : points >= 50 ? '🌙' : '🌱';

  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-accent bg-surface-warm px-2 py-0.5 rounded-full">
      {emoji} {level} · {points}P
    </span>
  );
}

// ========== [6] 일일 미션 ==========
export function DailyMission() {
  const [missions, setMissions] = useState<{ text: string; done: boolean }[]>([]);

  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = getLS('missionDate', '') as string;
    const visited = getLS('visitedVenues', []) as string[];

    if (savedDate !== today) {
      const rng = seededRandom(daySeed());
      const regionIdx = Math.floor(rng() * 10);
      const regionNames = ['강남', '부산', '홍대', '이태원', '압구정', '수원', '대전', '대구', '광주', '인천'];
      const region = regionNames[regionIdx % regionNames.length];

      setMissions([
        { text: `${region} 지역 업소 3곳 둘러보기`, done: false },
        { text: '퀴즈 한 번 도전하기', done: false },
        { text: '오늘의 운세 확인하기', done: true },
      ]);
      setLS('missionDate', today);
    } else {
      setMissions([
        { text: '업소 3곳 둘러보기', done: visited.length >= 3 },
        { text: '퀴즈 도전하기', done: (getLS('quizDone', false) as boolean) },
        { text: '오늘의 운세 확인하기', done: true },
      ]);
    }
  }, []);

  const completed = missions.filter(m => m.done).length;

  return (
    <div className="engagement-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-accent font-bold">오늘의 미션</p>
        <span className="text-xs font-bold text-[#111111]">{completed}/{missions.length}</span>
      </div>
      <div className="space-y-2">
        {missions.map((m, i) => (
          <div key={i} className={`flex items-center gap-2.5 text-sm ${m.done ? 'text-[#555555] line-through' : 'text-[#111111] font-semibold'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
              m.done ? 'bg-accent text-white' : 'bg-surface-warm border border-rosegold text-[#555555]'
            }`}>
              {m.done ? '✓' : i + 1}
            </span>
            <span>{m.text}</span>
          </div>
        ))}
      </div>
      {completed === missions.length && (
        <p className="text-xs text-accent font-bold mt-2">미션 완료! +30P 획득</p>
      )}
    </div>
  );
}

// ========== [7] 끝없는 추천 피드 (틱톡식 무한 스크롤) ==========
export function EndlessFeed() {
  const [items, setItems] = useState<typeof venues>([]);
  const [page, setPage] = useState(0);
  const CHUNK = 5;

  useEffect(() => {
    const rng = seededRandom(daySeed() + page);
    const shuffled = [...venues].sort(() => rng() - 0.5);
    setItems(prev => [...prev, ...shuffled.slice(0, CHUNK)]);
  }, [page]);

  const loadMore = useCallback(() => setPage(p => p + 1), []);

  return (
    <div>
      <h3 className="text-base font-extrabold text-[#111111] mb-3">끝없는 탐험</h3>
      <div className="space-y-3">
        {items.map((v, i) => (
          <Link
            key={`${v.id}-${i}`}
            to={venuePath(v)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white border-2 border-rosegold rounded-xl hover:border-accent transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-surface-warm flex items-center justify-center text-lg shrink-0">
              {v.category === 'club' ? '🎵' : v.category === 'night' ? '🌙' : v.category === 'lounge' ? '🍷' : v.category === 'room' ? '🚪' : v.category === 'yojeong' ? '🏮' : '💜'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#111111] truncate">{getVenueLabel(v)}</p>
              <p className="text-xs text-[#555555]">{v.area}</p>
            </div>
            <span className="text-accent text-xs font-bold shrink-0">→</span>
          </Link>
        ))}
      </div>
      <button
        onClick={loadMore}
        className="w-full mt-4 p-3 text-sm font-bold text-accent bg-surface-warm border-2 border-rosegold rounded-xl hover:border-accent transition-colors min-h-[48px]"
      >
        더 보기 (+{CHUNK}곳)
      </button>
    </div>
  );
}

// ========== [8] 스크롤 깊이 보상 ==========
export function ScrollReward() {
  const [depth, setDepth] = useState(0);
  const [rewarded, setRewarded] = useState<number[]>([]);

  useEffect(() => {
    const handler = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setDepth(Math.round((scrolled / total) * 100));
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    milestones.forEach(m => {
      if (depth >= m && !rewarded.includes(m)) {
        setRewarded(prev => [...prev, m]);
        const points = (getLS('points', 0) as number) + 2;
        setLS('points', points);
      }
    });
  }, [depth, rewarded]);

  if (depth < 20) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-40 max-w-[480px] mx-auto px-4">
      <div className="h-1 bg-rosegold/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-pink rounded-full transition-all duration-300"
          style={{ width: `${depth}%` }}
        />
      </div>
    </div>
  );
}

// ========== [9] 체류 시간 마일스톤 ==========
export function DwellMilestone() {
  const [showMilestone, setShowMilestone] = useState(false);
  const [lastMilestone, setLastMilestone] = useState(0);
  const lastMilestoneRef = useRef(0);

  useEffect(() => {
    const start = Date.now();
    let hideTimer: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 60000);
      const milestones = [3, 5, 10, 15, 30, 60, 90];
      const current = milestones.filter(m => elapsed >= m).pop() || 0;
      if (current > lastMilestoneRef.current) {
        lastMilestoneRef.current = current;
        setLastMilestone(current);
        setShowMilestone(true);
        const points = (getLS('points', 0) as number) + current;
        setLS('points', points);
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => setShowMilestone(false), 4000);
      }
    }, 30000);
    return () => { clearInterval(timer); clearTimeout(hideTimer); };
  }, []);

  if (!showMilestone) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-50 max-w-[480px] mx-auto px-4 animate-fade-in-up">
      <div className="bg-gradient-to-r from-accent to-pink text-white text-center py-2.5 px-4 rounded-xl shadow-lg">
        <p className="text-sm font-bold">{lastMilestone}분 달성! +{lastMilestone}P 🎉</p>
      </div>
    </div>
  );
}

// ========== [10] 오토넥스트 — 페이지 하단 도달 시 다음 추천 ==========
export function AutoNext() {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [nextVenue, setNextVenue] = useState<typeof venues[0] | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    setShow(false);
    setCancelled(false);
    setCountdown(5);

    const handler = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 200 && scrolled / total >= 0.9) {
        const rng = seededRandom(Date.now());
        const v = venues[Math.floor(rng() * venues.length)];
        setNextVenue(v);
        setShow(true);
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [location.pathname]);

  useEffect(() => {
    if (!show || cancelled || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [show, cancelled, countdown]);

  if (!show || cancelled || !nextVenue) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 max-w-[480px] mx-auto px-4 animate-slide-up">
      <div className="bg-white border-2 border-accent rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-accent font-bold">다음 추천</p>
          <button onClick={() => setCancelled(true)} className="text-xs text-[#555555] hover:text-[#111111]">✕</button>
        </div>
        <Link
          to={venuePath(nextVenue)}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <p className="text-sm font-black text-[#111111] hover:text-accent transition-colors">{getVenueLabel(nextVenue)}</p>
          <p className="text-xs text-[#555555] mt-0.5">{nextVenue.area}</p>
        </Link>
        {countdown > 0 && (
          <div className="mt-2 h-1 bg-rosegold/30 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(countdown / 5) * 100}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ========== 메인 사이드바 위젯 (홈페이지 전용) ==========
export function EngagementSidebar() {
  return (
    <div className="space-y-4">
      <StreakTracker />
      <DailyMission />
      <DailyReward />
      <ExplorationProgress />
    </div>
  );
}

// ========== 글로벌 오버레이 (Layout에 포함) ==========
export function EngagementOverlay() {
  return (
    <>
      <ScrollReward />
      <DwellMilestone />
      <AutoNext />
    </>
  );
}
