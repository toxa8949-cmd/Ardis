import { Bike, Factory } from "lucide-react";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0c0f] py-10 text-white/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
            <Bike size={18} />
          </span>
          <span className="font-bold text-white">{SITE.name}</span>
        </div>
        <p>© {new Date().getFullYear()} {SITE.name}. Велосипеди українського виробництва.</p>
        <span className="flex items-center gap-1.5">
          <Factory size={14} /> Made in Ukraine 🇺🇦
        </span>
      </div>
    </footer>
  );
}
