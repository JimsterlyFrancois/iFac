const categories = [
  { label: 'Tous', value: '', color: 'bg-slate-200 text-slate-700' },
  { label: 'Cours', value: 'Cours', color: 'bg-ifac-primary text-white' },
  { label: 'TD', value: 'TD', color: 'bg-ifac-secondary text-white' },
  { label: 'Examen', value: 'Examen', color: 'bg-ifac-accent text-ifac-ink' },
];

export default function SortBar({ category, level, onCategoryChange, onLevelChange }) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-ifac-border bg-ifac-mist p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2" aria-label="Filtrer par catégorie">
        {categories.map((item) => (
          <button key={item.value || 'all'} type="button" onClick={() => onCategoryChange(item.value)} className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${item.color} ${category === item.value ? 'ring-2 ring-ifac-ink ring-offset-1' : 'opacity-75 hover:opacity-100'}`}>
            {item.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-ifac-ink">
        Niveau
        <select value={level} onChange={(event) => onLevelChange(event.target.value)} className="rounded-lg border border-ifac-border bg-white px-3 py-2">
          <option value="">Tous</option>
          <option value="L1">L1</option>
          <option value="L2">L2</option>
          <option value="L3">L3</option>
          <option value="L4">L4</option>
        </select>
      </label>
    </div>
  );
}