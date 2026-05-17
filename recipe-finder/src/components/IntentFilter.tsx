import './IntentFilter.css';

interface IntentFilterProps {
  onIntentSelect: (intent: string | null) => void;
  selectedIntent: string | null;
  isLoading: boolean;
}

const INTENTS = [
  'Semua',
  'Cepat & Simpel',
  'Anak Kos',
  'Hemat',
  'Pedas',
  'Sehat',
  'Lauk Harian',
  'Nasi & Mie',
  'Ayam',
  'Telur',
  'Sayur',
  'Camilan'
];

export function IntentFilter({ onIntentSelect, selectedIntent, isLoading }: IntentFilterProps) {
  return (
    <div className="intent-filter-container animate-fade-in">
      <h3 className="intent-heading">Mau diracikin yang kayak gimana?</h3>
      <div className="intent-list">
        {INTENTS.map((intent) => {
          const isSelected = selectedIntent === intent || (intent === 'Semua' && selectedIntent === null);
          return (
            <button
              key={intent}
              className={`intent-chip glass ${isSelected ? 'active' : ''}`}
              onClick={() => onIntentSelect(intent === 'Semua' ? null : intent)}
              disabled={isLoading}
            >
              {intent}
            </button>
          );
        })}
      </div>
    </div>
  );
}
