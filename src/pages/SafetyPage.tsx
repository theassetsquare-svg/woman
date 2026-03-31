import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOgMeta } from '../hooks/useOgMeta';

export default function SafetyPage() {
  useOgMeta({
    title: '안전 가이드 — 음주 계산기·긴급 연락처·막차 정보',
    description: '즐거운 밤을 위한 안전 가이드. 음주 계산기, 긴급 연락처, 대리운전 번호까지.',
    image: '/og/default.svg',
    url: '/safety',
  });

  return (
    <div className="px-4 py-8">
      <nav className="breadcrumb mb-6" aria-label="경로">
        <Link to="/" target="_blank" rel="noopener noreferrer">홈</Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#111111] font-medium">안전 가이드</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-[#111111] mb-2">안전 가이드</h1>
      <p className="text-sm text-[#333333] leading-relaxed mb-8">
        즐거운 밤도 안전이 먼저. 알아두면 도움 되는 정보.
      </p>

      {/* 음주 계산기 */}
      <section className="mb-8">
        <AlcoholCalculator />
      </section>

      {/* SOS 긴급 연락처 */}
      <section className="mb-8">
        <h2 className="text-lg font-extrabold text-[#111111] mb-4">긴급 연락처</h2>
        <div className="space-y-2">
          {[
            { label: '경찰 (112)', number: '112', color: '#3B82F6' },
            { label: '소방/구급 (119)', number: '119', color: '#EF4444' },
            { label: '여성긴급전화 (1366)', number: '1366', color: '#EC4899' },
            { label: '범죄피해 상담 (1301)', number: '1301', color: '#8B5CF6' },
          ].map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white border-2 border-rosegold rounded-xl hover:border-accent transition-colors min-h-[48px]"
            >
              <span className="text-sm font-bold text-[#111111]">{item.label}</span>
              <span className="text-sm font-bold" style={{ color: item.color }}>{item.number}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 대리운전 */}
      <section className="mb-8">
        <h2 className="text-lg font-extrabold text-[#111111] mb-4">대리운전</h2>
        <div className="space-y-2">
          {[
            { label: '카카오 대리', number: '1599-4082' },
            { label: '로지 대리', number: '1588-5765' },
          ].map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white border-2 border-rosegold rounded-xl hover:border-accent transition-colors min-h-[48px]"
            >
              <span className="text-sm font-bold text-[#111111]">{item.label}</span>
              <span className="text-sm font-bold text-accent">{item.number}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 귀가 팁 */}
      <section className="mb-8">
        <h2 className="text-lg font-extrabold text-[#111111] mb-4">안전 귀가 팁</h2>
        <div className="space-y-3">
          {[
            '출발 전 친구에게 위치 공유해 두세요.',
            '택시는 공식 앱(카카오T, 타다)으로 호출하세요.',
            '과음 시 무리하지 말고 대리운전을 이용하세요.',
            '모르는 사람의 차량 동승은 피하세요.',
            '귀가 후 "잘 도착했다" 연락을 보내세요.',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-[#333333] leading-relaxed">
              <span className="text-accent font-bold shrink-0 mt-0.5">{i + 1}</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 드레스코드 체커 */}
      <section className="mb-8">
        <DressCodeChecker />
      </section>
    </div>
  );
}

function AlcoholCalculator() {
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [drinks, setDrinks] = useState('');
  const [drinkType, setDrinkType] = useState('soju');

  const drinkTypes: Record<string, { label: string; ml: number; pct: number }> = {
    soju: { label: '소주 (잔)', ml: 50, pct: 16.5 },
    beer: { label: '맥주 (잔)', ml: 355, pct: 4.5 },
    whisky: { label: '양주 (잔)', ml: 45, pct: 40 },
    wine: { label: '와인 (잔)', ml: 150, pct: 13 },
  };

  const calcBAC = () => {
    const w = Number(weight);
    const d = Number(drinks);
    if (!w || !d) return null;
    const dt = drinkTypes[drinkType];
    const alcohol = d * dt.ml * (dt.pct / 100) * 0.789;
    const r = gender === 'male' ? 0.68 : 0.55;
    const bac = (alcohol / (w * 1000 * r)) * 100;
    return Math.max(0, bac - 0.015);
  };

  const bac = calcBAC();

  return (
    <div className="cta-section p-5">
      <h2 className="text-lg font-extrabold text-[#111111] mb-4">음주 계산기</h2>

      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[48px] ${
                gender === g ? 'bg-accent text-white' : 'bg-surface-warm text-[#333333] border border-rosegold'
              }`}
            >
              {g === 'male' ? '남성' : '여성'}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="weight" className="text-xs text-[#555555] font-medium block mb-1">체중 (kg)</label>
          <input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" className="search-input text-sm" />
        </div>

        <div>
          <label htmlFor="drink-type" className="text-xs text-[#555555] font-medium block mb-1">주종</label>
          <select id="drink-type" value={drinkType} onChange={(e) => setDrinkType(e.target.value)} className="search-input text-sm">
            {Object.entries(drinkTypes).map(([key, dt]) => (
              <option key={key} value={key}>{dt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="drinks" className="text-xs text-[#555555] font-medium block mb-1">잔 수</label>
          <input id="drinks" type="number" value={drinks} onChange={(e) => setDrinks(e.target.value)} placeholder="5" className="search-input text-sm" />
        </div>
      </div>

      {bac !== null && (
        <div className={`text-center p-4 rounded-xl ${bac >= 0.08 ? 'bg-red-50 border-2 border-red-300' : bac >= 0.03 ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-green-50 border-2 border-green-300'}`}>
          <p className="text-xs text-[#555555] mb-1">예상 혈중알코올농도</p>
          <p className="text-2xl font-black" style={{ color: bac >= 0.08 ? '#DC2626' : bac >= 0.03 ? '#D97706' : '#16A34A' }}>
            {bac.toFixed(3)}%
          </p>
          <p className="text-sm font-bold mt-1" style={{ color: bac >= 0.08 ? '#DC2626' : bac >= 0.03 ? '#D97706' : '#16A34A' }}>
            {bac >= 0.08 ? '면허취소 수준 — 절대 운전 금지!' : bac >= 0.03 ? '면허정지 수준 — 대리운전 이용하세요' : '비교적 안전 — 하지만 무리하지 마세요'}
          </p>
        </div>
      )}
    </div>
  );
}

function DressCodeChecker() {
  const [category, setCategory] = useState('');

  const codes: Record<string, { ok: string[]; no: string[] }> = {
    club: {
      ok: ['깔끔한 셔츠+슬랙스', '원피스+힐', '깨끗한 스니커즈', '자켓+청바지'],
      no: ['슬리퍼/쪼리', '반바지/운동복', '후드티/맨투맨', '찢어진 청바지'],
    },
    night: {
      ok: ['자유로운 캐주얼', '편한 운동화 OK', '깔끔하면 대부분 OK'],
      no: ['너무 과한 노출', '슬리퍼'],
    },
    lounge: {
      ok: ['세미 정장', '깔끔한 캐주얼', '원피스+블레이저'],
      no: ['운동복', '슬리퍼'],
    },
    hoppa: {
      ok: ['편하게 입으세요', '별도 드레스코드 없음', '자유로운 복장'],
      no: [],
    },
  };

  return (
    <div className="cta-section p-5">
      <h2 className="text-lg font-extrabold text-[#111111] mb-4">드레스코드 체커</h2>
      <p className="text-sm text-[#475569] mb-4">어떤 카테고리를 가시나요?</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { id: 'club', label: '클럽' },
          { id: 'night', label: '나이트' },
          { id: 'lounge', label: '라운지' },
          { id: 'hoppa', label: '호빠' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[48px] ${
              category === c.id ? 'bg-accent text-white' : 'bg-surface-warm text-[#333333] border border-rosegold'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {category && codes[category] && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <p className="text-sm font-bold text-[#16A34A] mb-2">OK</p>
            <ul className="space-y-1.5">
              {codes[category].ok.map((item, i) => (
                <li key={i} className="text-sm text-[#333333] flex items-center gap-2">
                  <span className="text-[#16A34A]">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          {codes[category].no.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[#DC2626] mb-2">NG</p>
              <ul className="space-y-1.5">
                {codes[category].no.map((item, i) => (
                  <li key={i} className="text-sm text-[#333333] flex items-center gap-2">
                    <span className="text-[#DC2626]">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
