export default function Logo({ size = 40, variant = 'default' }: { size?: number; variant?: 'default' | 'white' }) {
  const c = variant === 'white'
    ? { p: '#ffffff', s: '#e0e7ff', t: '#2563eb', bg: '#ffffff' }
    : { p: '#2563eb', s: '#7c3aed', t: '#ffffff', bg: 'url(#lg)' };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.p} />
          <stop offset="100%" stopColor={c.s} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={c.bg} />
      <text x="50" y="45" textAnchor="middle" fill={c.t} fontSize="28" fontWeight="bold" fontFamily="Arial">AGS</text>
      <text x="50" y="65" textAnchor="middle" fill={c.t} fontSize="10" fontWeight="600" fontFamily="Arial" letterSpacing="1">WEBWORKS</text>
      <path d="M 20 50 L 15 55 L 20 60" stroke={c.t} strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M 80 50 L 85 55 L 80 60" stroke={c.t} strokeWidth="2" fill="none" opacity="0.6" />
    </svg>
  );
}
