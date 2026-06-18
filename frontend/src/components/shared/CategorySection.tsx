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
    <div className="pb-2">
      <h3 className="font-semibold text-sm tracking-tight mb-4 text-slate-900 dark:text-slate-100">Kategori</h3>
      <div className="space-y-1">
        <button
          onClick={() => onSelect(null)}
          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            selected === null
              ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Semua Kategori
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selected === category.id
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
