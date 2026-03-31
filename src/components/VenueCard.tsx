import { Link } from 'react-router-dom';
import type { Venue } from '../data/venues';
import { getVenueLabel } from '../data/venues';
import { venuePath } from '../utils/slug';

const catLabel = (c?: string) => c === 'club' ? '클럽' : c === 'lounge' ? '라운지' : '나이트';

export default function VenueCard({ venue }: { venue: Venue }) {
  const label = getVenueLabel(venue);
  // 가게이름에 이미 지역이 포함되어 있으면 중복 표시 안 함
  const areaInName = label.includes(venue.area);

  return (
    <Link
      to={venuePath(venue)}
      target="_blank"
      rel="noopener noreferrer"
      className="venue-card group"
    >
      {/* Thumbnail */}
      <div className="venue-card-thumb">
        <img
          src={`/og/${venue.id}.svg`}
          alt={label}
          width={480}
          height={270}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <span className="venue-card-thumb-badge" data-cat={venue.category}>
          {catLabel(venue.category)}
        </span>
      </div>

      <div className="venue-card-body">
        {/* Row 1: Contact (지역은 이름에 이미 포함 시 생략) */}
        <div className="flex items-center gap-2 mb-1">
          {!areaInName && (
            <span className="text-[13px] text-[#333333] font-semibold">
              {venue.area}
            </span>
          )}
          {venue.contact && (
            <span className="text-xs text-accent font-bold bg-surface-warm px-2 py-0.5 rounded-full">
              {venue.contact} 실장
            </span>
          )}
        </div>

        {/* Row 2: Keyword name */}
        <h3 className="venue-card-name group-hover:text-accent transition-colors">
          {label}
        </h3>

        {/* Row 3: Hook */}
        <p className="venue-card-hook">
          {venue.card_hook}
        </p>

        {/* Row 4: Value */}
        <p className="venue-card-value">
          {venue.card_value}
        </p>

        {/* Row 5: Tags */}
        <div className="venue-card-tags">
          {venue.card_tags}
        </div>
      </div>
    </Link>
  );
}
