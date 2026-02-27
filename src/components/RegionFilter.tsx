import { regions } from '../data/venues';

interface RegionFilterProps {
  selected: string;
  onChange: (regionId: string) => void;
}

export default function RegionFilter({ selected, onChange }: RegionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selected === 'all'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
        }`}
      >
        전체
      </button>
      {regions.map((r) => (
        <button
          key={r.id}
          onClick={() => onChange(r.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selected === r.id
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
          }`}
        >
          {r.emoji} {r.name}
        </button>
      ))}
    </div>
  );
}
