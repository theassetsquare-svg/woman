import { regions } from '../data/venues';

interface RegionFilterProps {
  selected: string;
  onChange: (regionId: string) => void;
}

export default function RegionFilter({ selected, onChange }: RegionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2.5" role="group" aria-label="지역 필터">
      <FilterButton active={selected === 'all'} onClick={() => onChange('all')}>
        전체
      </FilterButton>
      {regions.map((r) => (
        <FilterButton key={r.id} active={selected === r.id} onClick={() => onChange(r.id)}>
          {r.name}
        </FilterButton>
      ))}
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`region-pill ${
        active ? 'region-pill--active' : 'region-pill--inactive'
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
