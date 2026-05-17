import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('search') as HTMLInputElement;
    if (input.value.trim()) {
      onSearch(input.value.trim());
    }
  };

  return (
    <div className="search-container animate-fade-in">
      <form className="search-form glass" onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="search"
          placeholder="Cari resep, misal: ayam geprek, nasi goreng, sop, mie..." 
          className="search-input"
          autoComplete="off"
        />
        <button type="submit" className="search-btn" disabled={isLoading}>
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
