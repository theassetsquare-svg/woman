import { Link } from 'react-router-dom';
import type { Venue } from '../data/venues';
import { getRegionName } from '../data/venues';

export default function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link
      to={`/venue/${venue.id}`}
      className="block bg-white border border-border rounded-2xl p-6 hover:shadow-lg hover:border-accent/30 transition-all group"
    >
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

      <p className="text-[15px] text-text-muted leading-relaxed mb-4 line-clamp-2">{venue.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {venue.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs bg-slate-100 text-text-muted px-2.5 py-1 rounded-md font-medium">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-accent font-bold text-base">{venue.price}</span>
        <span className="text-text-light text-sm">{venue.hours}</span>
      </div>
    </Link>
  );
}
