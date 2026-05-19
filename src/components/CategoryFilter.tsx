import './CategoryFilter.css';

interface CategoryFilterProps {
  onCategorySelect: (category: string | null) => void;
  selectedCategory: string | null;
}

const CATEGORIES = [
  'Semua',
  'Ayam',
  'Telur',
  'Ikan',
  'Daging',
  'Tahu & Tempe',
  'Sayur',
  'Nasi',
  'Mie',
  'Sambal',
  'Camilan',
  'Minuman'
];

export function CategoryFilter({ onCategorySelect, selectedCategory }: CategoryFilterProps) {
  return (
    <div className="category-filter-container animate-fade-in">
      <div className="category-list">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category || (category === 'Semua' && selectedCategory === null);
          return (
            <button
              key={category}
              className={`category-chip glass ${isSelected ? 'active' : ''}`}
              onClick={() => onCategorySelect(category === 'Semua' ? null : category)}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
