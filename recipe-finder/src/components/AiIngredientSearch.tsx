import { useState } from 'react';
import './AiIngredientSearch.css';

interface AiIngredientSearchProps {
  onSearch: (ingredients: string[]) => void;
  isLoading: boolean;
}

export function AiIngredientSearch({ onSearch, isLoading }: AiIngredientSearchProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Split by commas and clean up
    const ingredients = inputValue
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (ingredients.length > 0) {
      onSearch(ingredients);
    }
  };

  return (
    <div className="ai-search-container animate-fade-in">
      <h3 className="ai-search-heading">Masak dari bahan yang ada</h3>
      <form onSubmit={handleSubmit} className="ai-search-form">
        <input
          type="text"
          className="ai-search-input"
          placeholder="Masukkan bahan yang kamu punya, misal: telur, nasi, ayam..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="ai-search-btn" disabled={isLoading || !inputValue.trim()}>
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            'Cari Ide Masak'
          )}
        </button>
      </form>
    </div>
  );
}
