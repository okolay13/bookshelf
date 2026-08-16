"use client";

import { useState } from "react";
import { Book, BookQuote } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function QuoteCard({
  quote,
  book,
  onEdit,
  onDelete,
}: {
  quote: BookQuote;
  book: Book | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const title = book?.title ?? quote.fallback_title ?? "Без книги";
  const author = book?.author ?? quote.fallback_author ?? "";
  const cover = book?.cover_url ?? quote.fallback_cover_url ?? null;
  const shareText = `«${quote.quote_text}»${quote.page ? ` (стр. ${quote.page})` : ""} — ${title}${author ? `, ${author}` : ""}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard access denied — silently ignore, the button just won't confirm
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // user cancelled the native share sheet — nothing to do
      }
    } else {
      void handleCopy();
    }
  }

  return (
    <div className="group relative rounded-2xl border border-copper/15 bg-[#f8efdd] p-5 shadow-[0_6px_20px_rgba(61,40,23,0.12)] hover:shadow-[0_10px_28px_rgba(61,40,23,0.18)] hover:-translate-y-0.5 transition-all duration-200">
      {quote.emoji && (
        <span className="absolute -top-2.5 -right-2.5 text-2xl drop-shadow-sm" aria-hidden>
          {quote.emoji}
        </span>
      )}

      <p className="display text-xl leading-snug text-espresso-dark">
        <span className="text-copper/60">“</span>
        {quote.quote_text}
        <span className="text-copper/60">”</span>
      </p>

      <div className="mt-4 flex items-center gap-2.5">
        <span className="flex-shrink-0 w-8 h-11 rounded-sm overflow-hidden shadow-sm border border-copper/15 bg-cream-dark/40">
          {cover ? (
            <img src={cover} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-cocoa/40 text-sm">📖</span>
          )}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-bold text-espresso truncate">{title}</div>
          <div className="text-xs text-cocoa/70 truncate">
            {author}
            {quote.page && <span className="text-cocoa/50"> · стр. {quote.page}</span>}
          </div>
        </div>
      </div>

      {quote.personal_note && (
        <p className="mt-3 text-sm text-cocoa/80 italic border-l-2 border-copper/25 pl-2.5">
          {quote.personal_note}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-cocoa/45">{formatDate(quote.created_at)}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="Скопировать"
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-cream-dark/60 text-cocoa/70 text-sm"
          >
            {copied ? "✓" : "⧉"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            title="Поделиться"
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-cream-dark/60 text-cocoa/70 text-sm"
          >
            ↗
          </button>
          <button
            type="button"
            onClick={onEdit}
            title="Редактировать"
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-cream-dark/60 text-cocoa/70"
          >
            ✎
          </button>
          {confirmDelete ? (
            <>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-full bg-terracotta-dark text-cream px-2.5 py-1 text-[11px] font-bold hover:brightness-110"
              >
                Да
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full bg-cream-dark px-2.5 py-1 text-[11px] font-semibold text-espresso"
              >
                Нет
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title="Удалить"
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-terracotta/20 text-terracotta-dark/80"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
