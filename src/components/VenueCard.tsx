import { Link } from 'react-router-dom';
import type { Venue } from '../data/venues';
import { venuePath } from '../utils/slug';

export default function VenueCard({ venue }: { venue: Venue }) {
  // Remove area name from card_tags to avoid duplication
  const cleanTags = venue.card_tags
    .split(' · ')
    .filter((t) => t !== venue.area && t !== venue.seoArea)
    .join(' · ');

  // Remove venue name prefix from card_value (name is already shown as h3)
  const cleanValue = venue.card_value.includes(' — ')
    ? venue.card_value.split(' — ')[1]
    : venue.card_value;

  return (
    <Link
      to={venuePath(venue)}
      target="_blank"
      rel="noopener noreferrer"
      className="venue-card group"
    >
      <div className="venue-card-body">
        {/* Row 1: Badge + Area */}
        <div className="flex items-center gap-2.5 mb-1">
          <span className="venue-badge-open">영업중</span>
          <span className="text-[13px] text-[#475569] font-semibold">
            {venue.area}
          </span>
        </div>

        {/* Row 2: Store name */}
        <h3 className="venue-card-name group-hover:text-accent transition-colors">
          {venue.name}
        </h3>

        {/* Row 3: Hook — 2 line clamp */}
        <p className="venue-card-hook">
          {venue.card_hook}
        </p>

        {/* Row 4: Value — 1 line muted */}
        <p className="venue-card-value">
          {cleanValue}
        </p>

        {/* Row 5: Tags */}
        <div className="venue-card-tags">
          {cleanTags}
        </div>
      </div>
    </Link>
  );
}
