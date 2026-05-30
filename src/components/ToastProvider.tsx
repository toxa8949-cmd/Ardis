"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { Check, Info } from "lucide-react";

type ToastType = "ok" | "err";
interface ToastState { msg: string; type: ToastType }

const ToastContext = createContext<((msg: string, type?: ToastType) => void) | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string, type: ToastType = "ok") => {
    setToast({ msg, type });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 animate-toast-in">
          <div
            className={`flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-2xl ${
              toast.type === "ok" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {toast.type === "ok" ? <Check size={18} /> : <Info size={18} />}
            {toast.msg}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast має використовуватись усередині ToastProvider");
  return ctx;
}
