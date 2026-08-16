"use client";

import { useState } from "react";
import { Book, BookQuote } from "@/lib/types";

export function RandomQuoteModal({
  quotes,
  booksById,
  onClose,
}: {
  quotes: BookQuote[];
  booksById: Map<string, Book>;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const [spin, setSpin] = useState(false);

  const quote = quotes[index];
  const book = quote.book_id ? booksById.get(quote.book_id) ?? null : null;
  const title = book?.title ?? quote.fallback_title ?? "Без книги";
  const author = book?.author ?? quote.fallback_author ?? "";
  const cover = book?.cover_url ?? quote.fallback_cover_url ?? null;

  function reroll() {
    setSpin(true);
    setTimeout(() => {
      setIndex((prev) => {
        if (quotes.length <= 1) return prev;
        let next = Math.floor(Math.random() * quotes.length);
        while (next === prev) next = Math.floor(Math.random() * quotes.length);
        return next;
      });
      setSpin(false);
    }, 180);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-espresso-dark/70 backdrop-blur-sm fade-in p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full sm:max-w-md rounded-3xl bg-[#f8efdd] shadow-2xl border border-copper/20 p-7 text-center transition-all duration-200 ${
          spin ? "opacity-0 scale-95" : "opacity-100 scale-100 pop-in"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full text-cocoa hover:bg-cream-dark transition-colors"
          aria-label="Закрыть"
        >
          ✕
        </button>

        <span className="text-3xl">🎲</span>
        <p className="display text-2xl leading-snug text-espresso-dark mt-3">
          <span className="text-copper/60">“</span>
          {quote.quote_text}
          <span className="text-copper/60">”</span>
        </p>

        {quote.emoji && <div className="mt-2 text-xl">{quote.emoji}</div>}

        <div className="mt-5 flex items-center justify-center gap-2.5">
          <span className="flex-shrink-0 w-8 h-11 rounded-sm overflow-hidden shadow-sm border border-copper/15 bg-cream-dark/40">
            {cover ? (
              <img src={cover} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-cocoa/40 text-sm">📖</span>
            )}
          </span>
          <div className="text-left">
            <div className="text-sm font-bold text-espresso">{title}</div>
            <div className="text-xs text-cocoa/70">{author}</div>
          </div>
        </div>

        {quote.personal_note && (
          <p className="mt-4 text-sm text-cocoa/80 italic">{quote.personal_note}</p>
        )}

        <button
          type="button"
          onClick={reroll}
          disabled={quotes.length <= 1}
          className="mt-6 rounded-full bg-terracotta text-cream px-5 py-2.5 text-sm font-bold shadow-lg hover:brightness-105 disabled:opacity-60"
        >
          🎲 Ещё вдохновение
        </button>
      </div>
    </div>
  );
}
