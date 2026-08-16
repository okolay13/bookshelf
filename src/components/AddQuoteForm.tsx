"use client";

import { useState } from "react";
import { Book, BookQuote } from "@/lib/types";
import { QuoteBookPicker } from "./QuoteBookPicker";
import { SingleEmojiPicker } from "./SingleEmojiPicker";

export interface QuoteDraft {
  book_id: string;
  quote_text: string;
  page: string | null;
  personal_note: string | null;
  emoji: string | null;
}

export function AddQuoteForm({
  books,
  quote,
  lockedBookId,
  onSave,
  onClose,
}: {
  books: Book[];
  quote?: BookQuote | null;
  // When set, the book field is fixed and hidden — used for the one-click
  // "➕ Цитата" add from inside a specific book's card.
  lockedBookId?: string;
  onSave: (draft: QuoteDraft) => Promise<void>;
  onClose: () => void;
}) {
  const [bookId, setBookId] = useState(quote?.book_id ?? lockedBookId ?? "");
  const [quoteText, setQuoteText] = useState(quote?.quote_text ?? "");
  const [page, setPage] = useState(quote?.page ?? "");
  const [note, setNote] = useState(quote?.personal_note ?? "");
  const [emoji, setEmoji] = useState<string | null>(quote?.emoji ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lockedBook = lockedBookId ? books.find((b) => b.id === lockedBookId) : null;
  const canSave = bookId && quoteText.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        book_id: bookId,
        quote_text: quoteText.trim(),
        page: page.trim() || null,
        personal_note: note.trim() || null,
        emoji,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить цитату");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-espresso-dark/60 backdrop-blur-sm fade-in p-0 sm:p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="pop-in relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-parchment shadow-2xl border border-copper/20"
      >
        <div className="sticky top-0 z-10 bg-parchment/95 backdrop-blur border-b border-copper/15 px-5 py-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-cocoa/60 font-bold">
            {quote ? "Редактировать цитату" : "Новая цитата"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full text-cocoa hover:bg-cream-dark transition-colors"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-terracotta-dark/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta-dark">
              {error}
            </div>
          )}

          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">📖 Книга</div>
            {lockedBook ? (
              <div className="w-full flex items-center gap-2.5 rounded-lg border border-copper/25 bg-cream/40 px-2.5 py-1.5">
                <span className="flex-shrink-0 w-7 h-10 rounded-sm overflow-hidden shadow-sm border border-copper/15 bg-cream-dark/40">
                  {lockedBook.cover_url ? (
                    <img src={lockedBook.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-cocoa/40 text-sm">📖</span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-espresso truncate">{lockedBook.title}</span>
                  <span className="block text-xs text-cocoa/60 truncate">{lockedBook.author}</span>
                </span>
              </div>
            ) : (
              <QuoteBookPicker books={books} value={bookId} onChange={setBookId} />
            )}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">✍️ Текст цитаты</div>
            <textarea
              autoFocus={!lockedBook}
              required
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              placeholder="Строки, к которым хочется возвращаться..."
              rows={5}
              className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
            />
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">📄 Страница (необязательно)</div>
            <input
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder="128"
              className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            />
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">📝 Личная заметка (необязательно)</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Почему эти строки важны..."
              rows={3}
              className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
            />
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">😊 Эмодзи (необязательно)</div>
            <SingleEmojiPicker value={emoji} onChange={setEmoji} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-parchment/95 backdrop-blur border-t border-copper/15 px-5 py-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cream-dark px-4 py-2 text-sm font-semibold text-espresso hover:bg-cream-dark/80"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={saving || !canSave}
            className="rounded-full bg-sage text-cream px-5 py-2 text-sm font-bold shadow hover:brightness-105 disabled:opacity-60"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
}
