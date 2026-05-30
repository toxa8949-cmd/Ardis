// SVG-обкладинка статті — генерується з відтінку, без зовнішніх зображень
export function PostCover({ hue = 24, className = "" }: { hue?: number; className?: string }) {
  return (
    <svg viewBox="0 0 400 220" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={`pc-${hue}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 70% 55%)`} />
          <stop offset="100%" stopColor={`hsl(${(hue + 40) % 360} 70% 45%)`} />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#pc-${hue})`} />
      <g opacity="0.25" stroke="#fff" strokeWidth="2" fill="none">
        <circle cx="120" cy="150" r="40" />
        <circle cx="280" cy="150" r="40" />
        <path d="M120 150 L180 150 L155 95 Z" />
        <path d="M180 150 L240 95 L155 95" />
        <line x1="240" y1="95" x2="280" y2="150" />
      </g>
    </svg>
  );
}
