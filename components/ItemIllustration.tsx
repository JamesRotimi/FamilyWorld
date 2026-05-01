/**
 * Hand-drawn-feeling SVG illustrations for the four FamilyWorld items.
 * Charcoal linework ties them into the rest of the illustrated scene.
 */

const STROKE = "#3a342c";
const STROKE_W = 1.1;

type IconProps = { size?: number; className?: string };

export function BikeIcon({ size = 56, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="13" cy="32" r="8" fill="#fff" stroke={STROKE} strokeWidth={STROKE_W} />
      <circle cx="13" cy="32" r="2" fill={STROKE} />
      <circle cx="35" cy="32" r="8" fill="#fff" stroke={STROKE} strokeWidth={STROKE_W} />
      <circle cx="35" cy="32" r="2" fill={STROKE} />
      <path
        d="M13 32 L24 32 L18 18 L30 18 L35 32 M24 32 L30 18"
        stroke="#3a6f8a"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M28 14 L33 14" stroke="#3a6f8a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 16 L26 16" stroke="#3a6f8a" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function HouseIcon({ size = 56, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        d="M8 24 L24 10 L40 24 Z"
        fill="#c87a52"
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      <rect x="12" y="22" width="24" height="18" fill="#f1e6cc" stroke={STROKE} strokeWidth={STROKE_W} />
      <rect x="20" y="28" width="8" height="12" fill="#8a4f30" stroke={STROKE} strokeWidth="0.9" />
      <circle cx="26" cy="34" r="0.8" fill="#f1e6cc" />
      <rect x="14" y="26" width="4" height="4" fill="#9bbcc7" stroke={STROKE} strokeWidth="0.8" />
      <rect x="30" y="26" width="4" height="4" fill="#9bbcc7" stroke={STROKE} strokeWidth="0.8" />
      <line x1="16" y1="26" x2="16" y2="30" stroke={STROKE} strokeWidth="0.5" />
      <line x1="14" y1="28" x2="18" y2="28" stroke={STROKE} strokeWidth="0.5" />
    </svg>
  );
}

export function CarIcon({ size = 56, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        d="M6 30 Q6 22 14 22 L18 16 Q20 14 24 14 L30 14 Q34 14 36 16 L40 22 Q42 22 42 25 L42 30 Z"
        fill="#c66247"
        stroke={STROKE}
        strokeWidth={STROKE_W}
        strokeLinejoin="round"
      />
      <path
        d="M19 17 Q21 15 24 15 L29 15 Q32 15 33 17 L35 21 L17 21 Z"
        fill="#cfe0e6"
        stroke={STROKE}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="32" r="4.5" fill="#3a3128" stroke={STROKE} strokeWidth="0.9" />
      <circle cx="14" cy="32" r="1.6" fill="#cfc6b5" />
      <circle cx="34" cy="32" r="4.5" fill="#3a3128" stroke={STROKE} strokeWidth="0.9" />
      <circle cx="34" cy="32" r="1.6" fill="#cfc6b5" />
      <circle cx="40" cy="26" r="1.4" fill="#f6e3a4" stroke={STROKE} strokeWidth="0.5" />
    </svg>
  );
}

export function CabinetIcon({ size = 56, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="11" y="8" width="26" height="34" rx="2" fill="#bfb7a3" stroke={STROKE} strokeWidth={STROKE_W} />
      <rect x="13" y="10" width="22" height="8" rx="1" fill="#cfc8b5" stroke={STROKE} strokeWidth="0.7" />
      <rect x="13" y="20" width="22" height="8" rx="1" fill="#cfc8b5" stroke={STROKE} strokeWidth="0.7" />
      <rect x="13" y="30" width="22" height="10" rx="1" fill="#cfc8b5" stroke={STROKE} strokeWidth="0.7" />
      <rect x="22" y="13" width="4" height="1.5" rx="0.6" fill={STROKE} />
      <rect x="22" y="23" width="4" height="1.5" rx="0.6" fill={STROKE} />
      <rect x="22" y="34" width="4" height="1.5" rx="0.6" fill={STROKE} />
    </svg>
  );
}

export function ItemIllustration({
  itemId,
  glyph,
  size = 56,
}: {
  itemId: string;
  glyph: string;
  size?: number;
}) {
  switch (itemId) {
    case "bike-1": return <BikeIcon size={size} />;
    case "house-1": return <HouseIcon size={size} />;
    case "car-1": return <CarIcon size={size} />;
    case "vault-1": return <CabinetIcon size={size} />;
    default:
      return <span style={{ fontSize: size * 0.7, lineHeight: 1 }}>{glyph}</span>;
  }
}
