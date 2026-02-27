import { regions } from '../data/venues';

interface RegionFilterProps {
  selected: string;
  onChange: (regionId: string) => void;
}

export default function RegionFilter({ selected, onChange }: RegionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="지역 필터">
      <FilterButton active={selected === 'all'} onClick={() => onChange('all')}>
        전체
      </FilterButton>
      {regions.map((r) => (
        <FilterButton key={r.id} active={selected === r.id} onClick={() => onChange(r.id)}>
          {r.emoji} {r.name}
        </FilterButton>
      ))}
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-[15px] font-semibold transition-all ${
        active
          ? 'bg-accent text-white shadow-md shadow-accent/25'
          : 'bg-slate-100 text-text-muted hover:bg-slate-200 hover:text-navy'
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
