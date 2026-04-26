interface CategorySectionProps {
  categories: Array<{ id: string; label: string }>;
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export default function CategorySection({
  categories,
  selected,
  onSelect,
}: CategorySectionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3">Kategori</h3>
      <div className="space-y-2">
        <button
          onClick={() => onSelect(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            selected === null
              ? "border border-primary text-primary bg-transparent"
              : "hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Semua Kategori
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              selected === category.id
                ? "border border-primary text-primary bg-transparent"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
