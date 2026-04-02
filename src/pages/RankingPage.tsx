import { useState } from 'react';
import { Link } from 'react-router-dom';
import { venues, getVenueLabel, getMainLink } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import { venuePath } from '../utils/slug';

const MAIN = getMainLink();

type CategoryFilter = 'all' | 'night' | 'club' | 'lounge' | 'room' | 'yojeong' | 'hoppa';

const filterButtons: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'night', label: '나이트' },
  { key: 'club', label: '클럽' },
  { key: 'lounge', label: '라운지' },
  { key: 'room', label: '룸' },
  { key: 'yojeong', label: '요정' },
  { key: 'hoppa', label: '호빠' },
];

const categoryLabels: Record<string, string> = {
  night: '나이트',
  club: '클럽',
  lounge: '라운지',
  room: '룸',
  yojeong: '요정',
  hoppa: '호빠',
};

/** Contact venues first (array order preserved), then non-contact venues. */
function getRankedVenues() {
  const contactVenues = venues.filter(
    (v) => !!v.contact && v.phone !== '별도문의',
  );
  const nonContactVenues = venues.filter(
    (v) => !v.contact || v.phone === '별도문의',
  );
  return [...contactVenues, ...nonContactVenues];
}

const rankedVenues = getRankedVenues().slice(0, 20);

export default function RankingPage() {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  useOgMeta({
    title: '인기 랭킹 TOP 20 — 전국 나이트·클럽·라운지',
    description:
      '전국 나이트, 클럽, 라운지, 룸, 요정 인기 랭킹 TOP 20. 실장 연결 가능 업소 우선 표시.',
    image: '/og/default.jpg',
    url: '/ranking',
  });

  const filtered =
    filter === 'all'
      ? rankedVenues
      : rankedVenues.filter((v) => v.category === filter);

  return (
    <div className="px-4 py-8" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <nav className="text-xs text-[#555555] mb-4">
        <Link to="/" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
          홈
        </Link>
        <span className="mx-1">/</span>
        <span className="text-[#111111] font-semibold">랭킹</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-[#111111] mb-2">인기 랭킹 TOP 20</h1>
      <p className="text-base text-[#333333] leading-relaxed mb-6">
        실장 연결 가능 업소를 우선으로, 전국 인기 업소를 한 번에.
      </p>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterButtons.map((fb) => (
          <button
            key={fb.key}
            onClick={() => setFilter(fb.key)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-full border transition-colors ${
              filter === fb.key
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-[#333333] border-rosegold hover:border-accent'
            }`}
          >
            {fb.label}
          </button>
        ))}
      </div>

      {/* Ranking list */}
      <div className="space-y-3 mb-8">
        {filtered.map((venue, idx) => {
          const rank = idx + 1;
          const isContact = !!venue.contact && venue.phone !== '별도문의';
          return (
            <Link
              key={venue.id}
              to={venuePath(venue)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white border-2 border-rosegold rounded-xl hover:border-accent transition-colors"
            >
              {/* Rank badge */}
              <div
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full font-black text-sm"
                style={{
                  backgroundColor: rank <= 3 ? '#D4A574' : '#F5EDE4',
                  color: rank <= 3 ? '#fff' : '#333',
                }}
              >
                {rank}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-base font-extrabold text-[#111111] truncate">
                    {getVenueLabel(venue)}
                  </span>
                  {isContact && (
                    <span className="flex-shrink-0 text-xs font-bold text-white bg-accent px-1.5 py-0.5 rounded-full">
                      실장연결
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#555555]">
                  {venue.area} · {categoryLabels[venue.category || 'night'] || '나이트'}
                </p>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-sm text-[#555555] py-8">
            해당 카테고리에 랭킹 업소가 없습니다.
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="text-center mb-6">
        <a
          href={MAIN}
          target="_blank"
          rel="noopener noreferrer"
          className="main-hook-banner inline-block text-center px-6 py-3"
        >
          <p className="font-black text-base mb-1">실제 리뷰 데이터 기반 랭킹</p>
          <p className="text-sm opacity-80">밤키에서 확인 →</p>
        </a>
      </div>
    </div>
  );
}
