import { Link } from 'react-router-dom';
import type { Venue } from '../data/venues';
import { getRegionName } from '../data/venues';

export default function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link
      to={`/venue/${venue.id}`}
      className="block bg-white border border-border rounded-2xl p-6 hover:shadow-lg hover:border-accent/30 transition-all group"
    >
      {/* Header: Name + Badge */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-navy group-hover:text-accent transition-colors">
            {venue.name}
          </h3>
          <p className="text-[15px] text-text-muted mt-1">
            {getRegionName(venue.region)} · {venue.area}
          </p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap border border-emerald-200">
          영업중
        </span>
      </div>

      {/* Hook: emotional 2-line max */}
      <p className="text-[15px] text-text leading-relaxed mb-3 line-clamp-2 whitespace-pre-line font-medium">
        {venue.card_hook}
      </p>

      {/* Value: practical 1-line */}
      <p className="text-sm text-text-muted mb-4 truncate">
        {venue.card_value}
      </p>

      {/* Tags: compact 1-line */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm text-text-light truncate">{venue.card_tags}</span>
        <span className="text-accent font-bold text-base whitespace-nowrap ml-3">{venue.price}</span>
      </div>
    </Link>
  );
}
