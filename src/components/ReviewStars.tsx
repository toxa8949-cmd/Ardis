"use client";

import { Star } from "lucide-react";

// Зірочки. Режим read-only (показ середнього) або інтерактивний (вибір у формі).
export function ReviewStars({
  value,
  onChange,
  size = 16,
  interactive = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  interactive?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        if (interactive) {
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange?.(n)}
              aria-label={`${n} із 5`}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={size}
                className={n <= value ? "text-amber-400" : "text-gray-300"}
                fill={n <= value ? "currentColor" : "none"}
              />
            </button>
          );
        }
        return (
          <Star
            key={n}
            size={size}
            className={filled ? "text-amber-400" : "text-gray-200"}
            fill={filled ? "currentColor" : "none"}
          />
        );
      })}
    </span>
  );
}
