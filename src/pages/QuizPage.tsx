import { useState } from 'react';
import { Link } from 'react-router-dom';
import { venues, getVenueLabel, getMainLink } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import { venuePath } from '../utils/slug';

const MAIN = getMainLink();

const questions = [
  { q: '금요일 밤, 뭐 하고 싶어?', a: ['몸 흔들기', '편하게 대화', '새로운 만남', '고급스러운 시간'] },
  { q: '음악 취향은?', a: ['EDM/일렉', '힙합/R&B', '라이브밴드', '재즈/어쿠스틱'] },
  { q: '이상적인 공간은?', a: ['넓고 시끄러운', '아늑하고 조용한', '프라이빗한', '전통적인'] },
  { q: '누구랑 가?', a: ['친구들 떼거지', '소수 친한 친구', '혼자', '비즈니스 모임'] },
  { q: '옷차림은?', a: ['드레스업 풀장착', '캐주얼 편하게', '한복도 좋아', '깔끔 세미정장'] },
  { q: '술은?', a: ['양주 위스키', '와인 칵테일', '맥주 소주', '한정식에 전통주'] },
  { q: '시작 시간은?', a: ['밤 10시 이후', '저녁 7시부터', '밤 9시쯤', '오후 6시 일찍'] },
  { q: '가장 중요한 건?', a: ['사운드 시스템', '분위기 인테리어', '서비스 퀄리티', '음식 퀄리티'] },
  { q: '예산은?', a: ['아끼지 않는다', '적당히', '가성비 최고', '투자라고 생각'] },
  { q: '다음 날 출근?', a: ['출근 없음 올나잇', '새벽 2시엔 귀가', '자정 전 마무리', '상관없음'] },
];

type MBTIType = { name: string; emoji: string; desc: string; category: string };

const types: MBTIType[] = [
  { name: '파티 폭격기', emoji: '🎉', desc: '에너지 넘치는 밤을 원하는 당신. EDM 터지는 플로어가 무대.', category: 'club' },
  { name: '감성 힐러', emoji: '🍷', desc: '조용한 음악과 좋은 술. 대화가 있는 밤을 원하는 타입.', category: 'lounge' },
  { name: '소셜 나비', emoji: '🦋', desc: '새로운 사람 만나는 걸 좋아하는 사교형. 부킹 문화가 맞아.', category: 'night' },
  { name: '프라이빗 킹', emoji: '👑', desc: '우리끼리만의 공간. 룸이나 요정이 딱이야.', category: 'room' },
  { name: 'VIP 마스터', emoji: '💎', desc: '최고급 경험만. 예산은 의미 없고, 퀄리티가 전부.', category: 'club' },
  { name: '비즈니스 프로', emoji: '🤝', desc: '접대와 격조. 전통 요정에서 품격 있는 자리.', category: 'yojeong' },
  { name: '여유로운 밤', emoji: '🌙', desc: '시끄러운 건 싫고, 편안하게 즐기고 싶은 타입.', category: 'lounge' },
  { name: '올나잇 전사', emoji: '🔥', desc: '새벽까지 멈추지 않는 체력파. 에너지가 곧 나의 무기.', category: 'club' },
];

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  useOgMeta({
    title: '밤문화 MBTI — 나에게 맞는 곳은 어디?',
    description: '10개 질문으로 알아보는 나의 밤문화 유형. 결과에 맞는 업소 추천까지.',
    image: '/og/default.svg',
    url: '/quiz',
  });

  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const getResult = (): MBTIType => {
    const sum = answers.reduce((a, b) => a + b, 0);
    return types[sum % types.length];
  };

  const isComplete = answers.length >= questions.length;
  const result = isComplete ? getResult() : null;

  const recommendedVenues = result
    ? venues.filter(v => v.category === result.category).slice(0, 3)
    : [];

  const restart = () => { setStep(0); setAnswers([]); };

  return (
    <div className="px-4 py-8">
      <nav className="breadcrumb mb-6" aria-label="경로">
        <Link to="/" target="_blank" rel="noopener noreferrer">홈</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#111111] font-medium">밤문화 MBTI</span>
      </nav>

      {!isComplete ? (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <p className="text-xs text-accent font-bold mb-1">{step + 1} / {questions.length}</p>
            <div className="h-1.5 bg-rosegold rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          <h1 className="text-xl font-extrabold text-[#111111] mb-6">{questions[step].q}</h1>

          <div className="space-y-3">
            {questions[step].a.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-full p-4 text-left bg-white border-2 border-rosegold rounded-xl text-sm font-semibold text-[#111111] hover:border-accent hover:bg-surface-warm transition-all min-h-[48px]"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : result && (
        <div className="animate-fade-in-up text-center">
          <p className="text-6xl mb-4">{result.emoji}</p>
          <h1 className="text-2xl font-extrabold text-[#111111] mb-2">당신은 "{result.name}" 타입!</h1>
          <p className="text-sm text-[#333333] leading-relaxed mb-8">{result.desc}</p>

          {recommendedVenues.length > 0 && (
            <div className="text-left mb-8">
              <h2 className="text-lg font-extrabold text-[#111111] mb-4">추천 업소</h2>
              <div className="space-y-3">
                {recommendedVenues.map((v) => (
                  <Link
                    key={v.id}
                    to={venuePath(v)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-white border-2 border-rosegold rounded-xl hover:border-accent transition-colors"
                  >
                    <p className="text-sm font-bold text-[#111111]">{getVenueLabel(v)}</p>
                    <p className="text-xs text-[#555555] mt-1">{v.area}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={restart} className="btn-secondary text-sm">다시 하기</button>
            <a href={MAIN} target="_blank" rel="noopener noreferrer" className="main-hook-banner block">
              <p className="font-black text-base mb-1">AI가 더 정확하게 추천</p>
              <p className="text-sm opacity-80">밤키에서 확인 →</p>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
