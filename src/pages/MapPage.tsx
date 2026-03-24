import { useState } from 'react';
import { Link } from 'react-router-dom';
import { venues, regions, getVenueLabel, getMainLink } from '../data/venues';
import { useOgMeta } from '../hooks/useOgMeta';
import { venuePath } from '../utils/slug';

const MAIN = getMainLink();

const categoryLabels: Record<string, string> = {
  night: '나이트',
  club: '클럽',
  lounge: '라운지',
  room: '룸',
  yojeong: '요정',
  hoppa: '호빠',
};

/** Regions that actually have venues */
const activeRegions = regions.filter((r) =>
  venues.some((v) => v.region === r.id),
);

export default function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useOgMeta({
    title: '지역별 업소 찾기 — 전국 나이트·클럽·라운지',
    description:
      '지역을 선택하면 해당 지역의 나이트, 클럽, 라운지, 룸, 요정 업소를 한눈에 확인할 수 있습니다.',
    image: '/og/default.svg',
    url: '/map',
  });

  const regionVenues = selectedRegion
    ? venues.filter((v) => v.region === selectedRegion)
    : [];

  const selectedRegionName = selectedRegion
    ? regions.find((r) => r.id === selectedRegion)?.name || selectedRegion
    : '';

  return (
    <div className="px-4 py-8" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <nav className="text-xs text-[#555555] mb-4">
        <Link to="/" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
          홈
        </Link>
        <span className="mx-1">/</span>
        <span className="text-[#111111] font-semibold">지역별 업소 찾기</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-[#111111] mb-2">지역별 업소 찾기</h1>
      <p className="text-base text-[#333333] leading-relaxed mb-6">
        지역을 선택하면 해당 지역의 업소를 확인할 수 있습니다.
      </p>

      {/* Region grid */}
      <section className="mb-8">
        <h2 className="text-xl font-extrabold text-[#111111] mb-4">지역 선택</h2>
        <div className="grid grid-cols-4 gap-2">
          {activeRegions.map((r) => {
            const count = venues.filter((v) => v.region === r.id).length;
            const isSelected = selectedRegion === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(isSelected ? null : r.id)}
                className={`p-2.5 text-center rounded-xl border-2 transition-colors ${
                  isSelected
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-[#333333] border-rosegold hover:border-accent'
                }`}
              >
                <span className="block text-sm font-bold">{r.name}</span>
                <span
                  className="block text-[10px] mt-0.5"
                  style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : '#555555' }}
                >
                  {count}곳
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Venue list for selected region */}
      {selectedRegion && (
        <section className="mb-8">
          <h2 className="text-xl font-extrabold text-[#111111] mb-4">
            {selectedRegionName} 업소 ({regionVenues.length}곳)
          </h2>
          <div className="space-y-3">
            {regionVenues.map((venue) => (
              <div
                key={venue.id}
                className="p-4 bg-white border-2 border-rosegold rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to={venuePath(venue)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-extrabold text-[#111111] hover:text-accent transition-colors"
                  >
                    {getVenueLabel(venue)}
                  </Link>
                  <span className="text-[11px] font-bold text-accent bg-surface-warm px-2 py-0.5 rounded-full">
                    {categoryLabels[venue.category || 'night'] || '나이트'}
                  </span>
                </div>
                <p className="text-xs text-[#555555] mb-2">{venue.area}</p>
                {venue.address && (
                  <a
                    href={`https://map.kakao.com/?q=${encodeURIComponent(venue.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-accent hover:text-accent-hover font-semibold"
                  >
                    카카오맵에서 정확한 위치 확인 →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!selectedRegion && (
        <p className="text-center text-sm text-[#555555] py-8 mb-8">
          위 지역 버튼을 선택하면 해당 지역 업소 목록이 표시됩니다.
        </p>
      )}

      {/* CTA */}
      <div className="text-center mb-6">
        <a
          href={MAIN}
          target="_blank"
          rel="noopener noreferrer"
          className="main-hook-banner inline-block text-center px-6 py-3"
        >
          <p className="font-black text-base mb-1">밤키에서 더 보기</p>
          <p className="text-sm opacity-80">전국 업소 정보 한눈에 →</p>
        </a>
      </div>
    </div>
  );
}
