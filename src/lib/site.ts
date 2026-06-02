// Глобальна конфігурація сайту. Один з джерел правди для SEO та контактів.

export const SITE = {
  name: "Ardis",
  legalName: "Ardis — велосипеди українського виробництва",
  // ЗМІНИ на реальний домен перед деплоєм:
  url: "https://ardis.kyiv.ua",
  description:
    "Офіційний магазин велосипедів Ardis. Гірські, міські та гравійні моделі українського виробництва. Заводська гарантія, доставка Новою Поштою, шоуруми в Києві.",
  locale: "uk_UA",
  themeColor: "#0f1115",
  contacts: {
    address: "м. Київ, вул. Ревуцького, 40В",
    hoursWeekday: "Пн–Пт: 09:00 – 16:30",
    hoursWeekend: "Сб–Нд: 09:00 – 18:00",
    phoneShop: "068-738-78-22",
    phoneShopRaw: "0687387822",
    phoneService: "099-021-22-64",
    phoneServiceRaw: "0990212264",
    pickup: 'Самовивіз з магазину партнера "Велокрай": м. Київ, вул. Ревуцького, 40В',
    delivery: "Доставка Новою Поштою по всій Україні за тарифами перевізника",
  },
  showrooms: [
    {
      title: 'Магазин партнера "Велокрай"',
      address: "м. Київ, вул. Ревуцького, 40В",
      hours: "Пн–Пт: 09:00–16:30 · Сб–Нд: 09:00–18:00",
      phone: "068-738-78-22",
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

// Одне значення розміру рами для фільтра каталогу (відповідає значенням frame_size).
// Для дітей рама не застосовується — повертаємо null (фільтруємо за діаметром коліс).
export function frameSizeValueForHeight(height: number): string | null {
  if (height < 135) return null;
  if (height < 155) return "15";
  if (height < 170) return "17";
  if (height < 182) return "19";
  return "21";
}

// Для дитячих зростів орієнтуємось на діаметр коліс
export function wheelSizeForHeight(height: number): string | null {
  if (height < 120) return "16";
  if (height < 135) return "20";
  return null;
}

// Орієнтовний розмір рами за діаметром коліс товару.
// Діаметр коліс прямо корелює з геометрією рами, тому це коректний орієнтир
// на відміну від «розміру рами з назви» (там зазвичай саме діаметр коліс).
// Приймає рядок типу '26"', '27.5', '29" дюймів' тощо. Повертає null, якщо не розпізнали.
export function frameSizeHintForWheel(wheel: string | null | undefined): string | null {
  if (!wheel) return null;
  const d = parseFloat(String(wheel).replace(",", ".").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(d) || d <= 0) return null;
  if (d <= 12) return '8" (дитяча)';
  if (d <= 14) return '9" (дитяча)';
  if (d <= 16) return '10"–11" (дитяча)';
  if (d <= 18) return '11"–12" (дитяча)';
  if (d <= 20) return '12"–13" (підліткова)';
  if (d <= 24) return '13"–14" (підліткова)';
  if (d <= 26) return '15"–17" (S / M)';
  if (d <= 27.5) return '16"–19" (S / L)';
  return '17"–21" (M / XL)'; // 28"–29"
}
