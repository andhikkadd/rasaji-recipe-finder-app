
interface RasajiLogoProps {
  showWordmark?: boolean;
  size?: number;
  className?: string;
  wordmarkClassName?: string;
}

export function RasajiLogo({
  showWordmark = true,
  size = 38,
  className = '',
  wordmarkClassName = '',
}: RasajiLogoProps) {
  return (
    <div 
      className={`logo-container-wrapper ${className}`}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '12px',
        userSelect: 'none'
      }}
    >
      {/* ─── Highly-Polished Culinary Logo Icon (Using logo.ico) ─── */}
      <img
        className="brand-logo-mark"
        src="/logo.ico"
        alt="Rasaji Logo"
        width={size}
        height={size}
        style={{ 
          display: 'block',
          flexShrink: 0,
          borderRadius: '8px',
          objectFit: 'contain',
          transform: 'translateY(-2.5px)'
        }}
      />

      {/* ─── Premium, Distinctive Wordmark ─── */}
      {showWordmark && (
        <span
          className={`logo-text ${wordmarkClassName}`}
          style={{
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontWeight: 800,
            fontSize: '1.45rem',
            letterSpacing: '-0.035em',
            color: '#0F172A',
            lineHeight: 1,
          }}
        >
          Rasaji
        </span>
      )}
    </div>
  );
}
