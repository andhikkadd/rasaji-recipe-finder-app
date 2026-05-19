interface IngredientCtaCardProps {
  onClick: () => void;
}

export function IngredientCtaCard({ onClick }: IngredientCtaCardProps) {
  return (
    <div className="ingredient-cta-card animate-fade-in" style={{
      background: 'var(--surface-hover)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      border: '1px solid var(--border-color)',
      alignItems: 'flex-start'
    }}>
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✨ Punya bahan di rumah?
        </h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Masukkan bahan yang kamu punya, nanti Rasaji bantu carikan ide masak.
        </p>
      </div>
      <button 
        onClick={onClick}
        style={{
          background: 'var(--accent-color)',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Masak dari Bahan
      </button>
    </div>
  );
}
