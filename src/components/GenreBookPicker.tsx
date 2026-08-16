"use client";

import { useState } from "react";
import { Book } from "@/lib/types";

export function GenreBookPicker({
  genreName,
  books,
  onConfirm,
  onClose,
}: {
  genreName: string;
  books: Book[];
  onConfirm: (bookIds: string[]) => Promise<void>;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = q
    ? books.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      )
    : books;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function confirm() {
    setSaving(true);
    try {
      await onConfirm(Array.from(selected));
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex bg-espresso-dark/60 backdrop-blur-sm fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in relative h-full w-full sm:w-96 max-w-full bg-parchment shadow-2xl border-r border-copper/20 flex flex-col"
      >
        <div className="sticky top-0 bg-parchment/95 backdrop-blur border-b border-copper/15 px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-cocoa/60 font-bold">
              Жанр «{genreName}»
            </span>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full text-cocoa hover:bg-cream-dark transition-colors"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-cocoa/60 mt-1">
            Выберите книги с полки, которые относятся к этому жанру.
          </p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или автору"
            className="mt-2 w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {visible.length === 0 && (
            <p className="text-sm text-cocoa/60 text-center py-6">Ничего не найдено.</p>
          )}
          {visible.map((b) => {
            const isSelected = selected.has(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggle(b.id)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  isSelected ? "bg-terracotta/15" : "hover:bg-cream-dark/50"
                }`}
              >
                <span
                  className={`flex-shrink-0 h-5 w-5 rounded-md border flex items-center justify-center text-xs ${
                    isSelected
                      ? "bg-terracotta border-terracotta text-cream"
                      : "border-copper/40 bg-cream/60"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-espresso truncate">{b.title}</span>
                  <span className="block text-xs text-cocoa/60 truncate">{b.author}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-parchment/95 backdrop-blur border-t border-copper/15 px-5 py-3">
          <button
            onClick={confirm}
            disabled={saving || selected.size === 0}
            className="w-full rounded-full bg-sage text-cream py-2.5 text-sm font-bold shadow hover:brightness-105 disabled:opacity-50"
          >
            {saving
              ? "Сохранение..."
              : selected.size
                ? `Добавить в жанр (${selected.size})`
                : "Выберите книги"}
          </button>
        </div>
      </div>
    </div>
  );
}
