"use client";

import { useMemo, useState } from "react";
import { Book } from "@/lib/types";

export function ShelfAddPicker({
  shelfName,
  books,
  bookShelves,
  onClose,
  onAddExisting,
  onCreateNew,
}: {
  shelfName: string;
  books: Book[];
  bookShelves: Map<string, string[]>;
  onClose: () => void;
  onAddExisting: (bookId: string) => Promise<void>;
  onCreateNew: () => void;
}) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books
      .filter((b) => !(bookShelves.get(b.id) ?? []).includes(shelfName))
      .filter((b) => !q || `${b.title} ${b.author}`.toLowerCase().includes(q))
      .slice(0, 60);
  }, [books, query, bookShelves, shelfName]);

  async function handlePick(id: string) {
    setAdding(id);
    try {
      await onAddExisting(id);
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Transparent click-outside area — the shelf behind stays visible and
          droppable while this panel is open, unlike a centered modal. */}
      <div className="absolute inset-0 pointer-events-auto" onClick={onClose} />
      <div
        onClick={(e) => e.stopPropagation()}
        className="slide-in-right pointer-events-auto absolute inset-y-0 right-0 w-full sm:w-96 max-w-full overflow-y-auto bg-parchment shadow-2xl border-l border-copper/20"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-parchment/95 backdrop-blur px-5 py-3 border-b border-copper/15">
          <h2 className="display text-xl text-espresso-dark truncate pr-2">
            Добавить на «{shelfName}»
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full text-cocoa hover:bg-cream-dark transition-colors"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <button
            onClick={onCreateNew}
            className="w-full rounded-full bg-terracotta text-cream py-2.5 text-sm font-bold shadow hover:brightness-105"
          >
            + Новая книга на эту полку
          </button>

          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
              Или добавьте уже существующую книгу
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию или автору..."
              className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            {results.length === 0 ? (
              <p className="text-sm text-cocoa/60 italic py-2">
                {books.length === 0
                  ? "Книг пока нет."
                  : "Все подходящие книги уже на этой полке."}
              </p>
            ) : (
              <>
                <p className="text-xs text-cocoa/50 italic px-1">
                  Нажмите, чтобы добавить, или перетащите книгу на полку.
                </p>
                {results.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/x-book-id", b.id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => handlePick(b.id)}
                    disabled={adding !== null}
                    className="w-full flex items-center gap-2.5 px-2 py-2 text-left rounded-lg hover:bg-cream-dark/50 disabled:opacity-50 transition-colors cursor-grab active:cursor-grabbing"
                  >
                    <div className="w-7 h-10 flex-shrink-0 rounded bg-cream-dark/60 overflow-hidden flex items-center justify-center">
                      {b.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs">📖</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-espresso truncate">{b.title}</div>
                      <div className="text-xs text-cocoa/60 truncate">{b.author}</div>
                    </div>
                    {adding === b.id && (
                      <span className="text-xs text-cocoa/60 flex-shrink-0">Добавляю…</span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
