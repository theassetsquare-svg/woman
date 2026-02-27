import { Link } from 'react-router-dom';
import type { Venue } from '../data/venues';
import { getRegionName } from '../data/venues';

export default function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link
      to={`/venue/${venue.id}`}
      className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-purple-700/50 hover:bg-gray-900/80 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-100 group-hover:text-purple-400 transition-colors">
            {venue.name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {getRegionName(venue.region)} · {venue.area}
          </p>
        </div>
        <span className="text-xs bg-purple-900/40 text-purple-300 px-2.5 py-1 rounded-full whitespace-nowrap">
          영업중
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{venue.description}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {venue.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-purple-400 font-semibold">{venue.price}</span>
        <span className="text-gray-600 text-xs">{venue.hours}</span>
      </div>
    </Link>
  );
}
