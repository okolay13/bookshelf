"use client";

import { useState } from "react";

// Shown before deleting a book that has linked quotes — the user must choose
// whether the quotes go with it or survive as standalone entries.
export function QuoteOrphanModal({
  bookTitle,
  count,
  onChoice,
  onCancel,
}: {
  bookTitle: string;
  count: number;
  onChoice: (action: "delete" | "keep") => Promise<void>;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState<"delete" | "keep" | null>(null);

  async function choose(action: "delete" | "keep") {
    setBusy(action);
    try {
      await onChoice(action);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-espresso-dark/70 backdrop-blur-sm fade-in p-4" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in w-full sm:max-w-sm rounded-3xl bg-parchment shadow-2xl border border-copper/20 p-6 text-center"
      >
        <span className="text-3xl">💬</span>
        <h2 className="display text-xl text-espresso-dark mt-2">
          У книги «{bookTitle}» есть {count} {pluralQuotes(count)}
        </h2>
        <p className="text-sm text-cocoa/70 mt-1.5">
          Что сделать с любимыми цитатами из этой книги?
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => choose("keep")}
            disabled={busy !== null}
            className="rounded-full bg-sage text-cream px-4 py-2.5 text-sm font-bold shadow hover:brightness-105 disabled:opacity-60"
          >
            {busy === "keep" ? "Сохранение..." : "Сохранить их как отдельные записи"}
          </button>
          <button
            type="button"
            onClick={() => choose("delete")}
            disabled={busy !== null}
            className="rounded-full bg-terracotta-dark text-cream px-4 py-2.5 text-sm font-bold shadow hover:brightness-110 disabled:opacity-60"
          >
            {busy === "delete" ? "Удаление..." : "Удалить связанные цитаты"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy !== null}
            className="rounded-full bg-cream-dark px-4 py-2 text-sm font-semibold text-espresso hover:bg-cream-dark/80 disabled:opacity-60"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

function pluralQuotes(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "цитата";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "цитаты";
  return "цитат";
}
