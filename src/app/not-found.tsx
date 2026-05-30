import Link from "next/link";
import { Bike } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent to-amber-500 text-white">
          <Bike size={32} />
        </span>
        <h1 className="mt-6 text-5xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-gray-500">Сторінку не знайдено або товару більше немає.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-2xl bg-ink px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent"
        >
          На головну
        </Link>
      </div>
    </main>
  );
}
