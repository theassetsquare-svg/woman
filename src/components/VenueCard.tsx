import { Link } from 'react-router-dom';
import type { Venue } from '../data/venues';
import { getRegionName } from '../data/venues';

export default function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link
      to={`/venue/${venue.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="venue-card group"
    >
      {/* Thumbnail */}
      <div className="venue-card-thumb" aria-hidden="true">
        <span className="text-3xl">{getRegionEmoji(venue.region)}</span>
        <span className="text-[11px] font-bold text-white/80 mt-1">{venue.price}</span>
      </div>

      {/* Text content */}
      <div className="venue-card-body">
        {/* Row 1: Badge + Region */}
        <div className="flex items-center gap-2 mb-1">
          <span className="venue-badge-open">영업중</span>
          <span className="text-xs text-text-muted font-medium">
            {getRegionName(venue.region)} · {venue.area}
          </span>
        </div>

        {/* Row 2: Store name — 1 line, ellipsis */}
        <h3 className="venue-card-name group-hover:text-accent transition-colors">
          {venue.name}
        </h3>

        {/* Row 3: Hook — 2 line clamp */}
        <p className="venue-card-hook">
          {venue.card_hook}
        </p>

        {/* Row 4: Value — 1 line muted */}
        <p className="venue-card-value">
          {venue.card_value}
        </p>

        {/* Row 5: Tags — 1 line, no wrap */}
        <div className="venue-card-tags">
          {venue.card_tags}
        </div>
      </div>
    </Link>
  );
}

function getRegionEmoji(region: string): string {
  const map: Record<string, string> = {
    seoul: '🏙️', busan: '🌊', gyeonggi: '🏛️',
    daejeon: '🔬', gwangju: '🎨', changwon: '🏭',
  };
  return map[region] ?? '📍';
}
