import Link from "next/link";
import { Bike, Factory, Phone } from "lucide-react";
import { SITE } from "@/lib/site";

export function Footer() {
  const c = SITE.contacts;
  return (
    <footer className="border-t border-white/5 bg-[#0a0c0f] text-white/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
              <Bike size={18} />
            </span>
            <span className="font-bold text-white">{SITE.name}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            Велосипеди українського виробництва. Гірські, міські, дитячі та електровелосипеди.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Магазин</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/catalog" className="hover:text-white">Каталог</Link></li>
            <li><Link href="/blog" className="hover:text-white">Блог</Link></li>
            <li><Link href="/#showrooms" className="hover:text-white">Шоуруми</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Покупцям</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/delivery" className="hover:text-white">Оплата та доставка</Link></li>
            <li><Link href="/warranty" className="hover:text-white">Гарантія</Link></li>
            <li><Link href="/about" className="hover:text-white">Про нас</Link></li>
            <li><Link href="/contacts" className="hover:text-white">Контакти</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Контакти</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>{c.address}</li>
            <li className="flex items-center gap-1.5">
              <Phone size={13} />
              <a href={`tel:${c.phoneShopRaw}`} className="hover:text-white">{c.phoneShop}</a>
            </li>
            <li>{c.hoursWeekday}</li>
            <li>{c.hoursWeekend}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. Велосипеди українського виробництва.</p>
          <span className="flex items-center gap-1.5">
            <Factory size={14} /> Made in Ukraine 🇺🇦
          </span>
        </div>
      </div>
    </footer>
  );
}
