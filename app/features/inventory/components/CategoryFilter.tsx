// Filtro de categorías para el Inventario

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onChange: (cat: string) => void;
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg focus:ring-2 focus:ring-pickled-bluewood-600 outline-none text-sm transition-colors"
      style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-main)", color: "var(--text-primary)" }}
    >
      <option value="all">Todas las categorías</option>
      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}
