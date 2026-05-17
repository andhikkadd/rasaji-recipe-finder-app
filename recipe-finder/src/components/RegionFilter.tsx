import { useEffect, useState } from 'react';
import './RegionFilter.css';

interface RegionFilterProps {
  onRegionSelect: (region: string) => void;
  selectedRegion: string | null;
  isLoading: boolean;
}

export function RegionFilter({ onRegionSelect, selectedRegion, isLoading }: RegionFilterProps) {
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
        const data = await response.json();
        if (data.meals) {
          setRegions(data.meals.map((item: any) => item.strArea));
        }
      } catch (error) {
        console.error('Failed to fetch regions', error);
      }
    };
    fetchRegions();
  }, []);

  if (regions.length === 0) return null;

  return (
    <div className="region-filter-container animate-fade-in">
      <div className="region-list">
        {regions.map((region) => (
          <button
            key={region}
            className={`region-chip glass ${selectedRegion === region ? 'active' : ''}`}
            onClick={() => onRegionSelect(region)}
            disabled={isLoading}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
  );
}
