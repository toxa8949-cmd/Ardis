// Глобальна конфігурація сайту. Один з джерел правди для SEO та контактів.

export const SITE = {
  name: "Ardis",
  legalName: "Ardis — велосипеди українського виробництва",
  // ЗМІНИ на реальний домен перед деплоєм:
  url: "https://ardis.example",
  description:
    "Офіційний магазин велосипедів Ardis. Гірські, міські та гравійні моделі українського виробництва. Заводська гарантія, доставка Новою Поштою, шоуруми в Києві.",
  locale: "uk_UA",
  themeColor: "#0f1115",
  showrooms: [
    {
      title: "Шоурум на Лівому березі",
      address: "вул. Гната Хоткевича, 12, Київ",
      hours: "Пн–Нд: 09:00 – 20:00",
      phone: "+380 44 200 10 20",
    },
    {
      title: "Шоурум на Правому березі",
      address: "Коломийський пров., 5, Київ",
      hours: "Пн–Нд: 10:00 – 19:00",
      phone: "+380 44 200 10 30",
    },
  ],
} as const;

// Форматування ціни у гривнях
export function uah(n: number): string {
  return `${n.toLocaleString("uk-UA")} ₴`;
}

// Рекомендація розміру рами за зростом (см)
export function frameSizeForHeight(height: number): string {
  if (height < 135) return 'Колеса 16"–20" (дитячий)';
  if (height < 155) return '13"–15" (XS / S)';
  if (height < 170) return '16"–17" (S / M)';
  if (height < 182) return '18"–19" (M / L)';
  return '20"–22" (L / XL)';
}
