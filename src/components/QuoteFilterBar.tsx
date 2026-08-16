"use client";

import { QUOTE_SORT_LABEL, QuoteSortMode } from "@/lib/types";

export interface QuoteBookOption {
  id: string;
  label: string;
}

export function QuoteFilterBar({
  bookId,
  onBookChange,
  bookOptions,
  emoji,
  onEmojiChange,
  emojiOptions,
  sort,
  onSortChange,
}: {
  bookId: string;
  onBookChange: (v: string) => void;
  bookOptions: QuoteBookOption[];
  emoji: string;
  onEmojiChange: (v: string) => void;
  emojiOptions: string[];
  sort: QuoteSortMode;
  onSortChange: (v: QuoteSortMode) => void;
}) {
  const selectClass =
    "rounded-full border border-copper/25 bg-cream/60 px-3 py-1.5 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={bookId} onChange={(e) => onBookChange(e.target.value)} className={selectClass}>
        <option value="all">📚 Все книги</option>
        {bookOptions.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label}
          </option>
        ))}
      </select>

      <select value={emoji} onChange={(e) => onEmojiChange(e.target.value)} className={selectClass}>
        <option value="all">😊 Все эмодзи</option>
        {emojiOptions.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>

      <select value={sort} onChange={(e) => onSortChange(e.target.value as QuoteSortMode)} className={selectClass}>
        {(Object.keys(QUOTE_SORT_LABEL) as QuoteSortMode[]).map((mode) => (
          <option key={mode} value={mode}>
            📅 {QUOTE_SORT_LABEL[mode]}
          </option>
        ))}
      </select>
    </div>
  );
}
