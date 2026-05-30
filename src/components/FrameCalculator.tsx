"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { frameSizeForHeight } from "@/lib/site";

// Калькулятор ростовки. Виправлений баг попередньої версії:
// тепер зріст у стані (useState), тож повзунок реально оновлює рекомендацію.
export function FrameCalculator() {
  const [height, setHeight] = useState(175);

  return (
    <section id="calculator" className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-xl sm:p-10">
        <div className="mx-auto mb-8 max-w-md text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent-600">
            <Ruler size={14} /> Підбір розміру
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Калькулятор ростовки</h2>
          <p className="mt-1 text-sm text-gray-500">
            Вкажи свій зріст — покажемо рекомендований розмір рами
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-gray-50 p-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                Рекомендована рама
              </span>
              <div className="text-lg font-bold text-accent sm:text-xl">
                {frameSizeForHeight(height)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                Твій зріст
              </span>
              <div className="text-2xl font-bold text-ink sm:text-3xl">{height} см</div>
            </div>
          </div>

          <input
            type="range"
            min={110}
            max={210}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-accent"
            aria-label="Зріст у сантиметрах"
          />
          <div className="flex justify-between px-1 text-xs font-bold text-gray-400">
            <span>110 см</span>
            <span>160 см</span>
            <span>210 см</span>
          </div>
        </div>
      </div>
    </section>
  );
}
