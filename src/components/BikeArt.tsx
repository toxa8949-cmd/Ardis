import type { ProductType } from "@/types";

// Кастомна SVG-ілюстрація. Колір керується через hue (відтінок),
// тож одна картинка дає будь-який колір без зовнішніх зображень.
export function BikeArt({
  hue = 24,
  type = "bike",
  className = "",
}: {
  hue?: number;
  type?: ProductType;
  className?: string;
}) {
  const main = hue === 0 ? "#1f2937" : `hsl(${hue} 88% 52%)`;
  const dark = "#0f1115";

  if (type === "part") {
    return (
      <svg viewBox="0 0 240 150" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="240" height="150" rx="16" fill="#f1f1f2" />
        <circle cx="120" cy="75" r="34" fill="none" stroke={main} strokeWidth="9" strokeDasharray="14 6" />
        <circle cx="120" cy="75" r="14" fill={dark} />
        <path d="M92 75 H148 M120 47 V103" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 240 150" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id={`bg-${hue}`} cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ececee" />
        </radialGradient>
      </defs>
      <rect width="240" height="150" rx="16" fill={`url(#bg-${hue})`} />
      {/* Колеса */}
      <g stroke={dark} strokeWidth="4.5" fill="none">
        <circle cx="62" cy="104" r="28" />
        <circle cx="178" cy="104" r="28" />
      </g>
      <g stroke="#c4c4c8" strokeWidth="1">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <g key={i}>
              <line x1="62" y1="104" x2={62 + Math.cos(a) * 26} y2={104 + Math.sin(a) * 26} />
              <line x1="178" y1="104" x2={178 + Math.cos(a) * 26} y2={104 + Math.sin(a) * 26} />
            </g>
          );
        })}
      </g>
      {/* Рама — акцентний колір */}
      <g stroke={main} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M62 104 L105 104 L90 58 Z" />
        <path d="M105 104 L148 58 L90 58" />
        <line x1="148" y1="58" x2="178" y2="104" />
        <line x1="148" y1="58" x2="150" y2="42" />
      </g>
      {/* Сидіння + кермо */}
      <path d="M82 54 h15" stroke={dark} strokeWidth="5" strokeLinecap="round" />
      <path d="M142 42 q12 -4 18 2" stroke={dark} strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Каретка + педаль */}
      <circle cx="105" cy="104" r="7" fill={dark} />
      <line x1="105" y1="104" x2="116" y2="118" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />
      <rect x="111" y="116" width="11" height="4" rx="1" fill={dark} />
    </svg>
  );
}
