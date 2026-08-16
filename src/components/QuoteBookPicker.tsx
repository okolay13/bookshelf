"use client";

import { useState } from "react";
import { Book } from "@/lib/types";

// Single-select autocomplete over the user's own library (not Open Library),
// used to link a quote to one of the books already on the shelf.
export function QuoteBookPicker({
  books,
  value,
  onChange,
}: {
  books: Book[];
  value: string;
  onChange: (bookId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = books.find((b) => b.id === value) ?? null;

  const q = query.trim().toLowerCase();
  const visible = q
    ? books.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    : books;

  if (selected && !open) {
    return (
      <button
        type="button"
        onClick={() => {
          setQuery("");
          setOpen(true);
        }}
        className="w-full flex items-center gap-2.5 rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-left hover:bg-cream-dark/40"
      >
        <span className="flex-shrink-0 w-7 h-10 rounded-sm overflow-hidden shadow-sm border border-copper/15 bg-cream-dark/40">
          {selected.cover_url ? (
            <img src={selected.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-cocoa/40 text-sm">📖</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-espresso truncate">{selected.title}</span>
          <span className="block text-xs text-cocoa/60 truncate">{selected.author}</span>
        </span>
        <span className="text-xs font-semibold text-terracotta-dark flex-shrink-0">Изменить</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Найдите книгу в своей библиотеке"
        className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
      />
      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-copper/25 bg-parchment shadow-xl">
          {visible.length === 0 && (
            <div className="px-3 py-3 text-sm text-cocoa/60 text-center">Ничего не найдено</div>
          )}
          {visible.slice(0, 30).map((b) => (
            <button
              key={b.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(b.id);
                setQuery("");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-cream-dark/50 border-b border-copper/10 last:border-b-0"
            >
              <span className="flex-shrink-0 w-7 h-10 rounded-sm overflow-hidden shadow-sm border border-copper/15 bg-cream-dark/40">
                {b.cover_url ? (
                  <img src={b.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-cocoa/40 text-sm">📖</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-espresso truncate">{b.title}</span>
                <span className="block text-xs text-cocoa/60 truncate">{b.author}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
