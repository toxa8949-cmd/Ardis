import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Placeholder() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold tracking-tight">Розділ у розробці</h1>
      <p className="mt-1 text-sm text-gray-500">Цей розділ з'явиться в наступному оновленні адмінки.</p>
    </div>
  );
}
