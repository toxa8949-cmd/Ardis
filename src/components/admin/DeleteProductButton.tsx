"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/lib/admin-actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <button
          onClick={() => startTransition(() => deleteProduct(id))}
          disabled={pending}
          className="rounded-lg bg-rose-500 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-rose-600 disabled:opacity-60"
        >
          {pending ? "…" : "Видалити"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
        >
          Ні
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Видалити «${name}»`}
      className="grid h-9 w-9 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
    >
      <Trash2 size={16} />
    </button>
  );
}
