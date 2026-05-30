import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Вхід в адмінку",
  robots: { index: false, follow: false }, // адмінку не індексуємо
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
