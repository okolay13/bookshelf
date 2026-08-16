"use client";

import { useEffect, useState } from "react";
import { deleteBookQuote, insertBookQuote, listBookQuotes, updateBookQuote } from "@/lib/api";
import { BookQuote } from "@/lib/types";
import { SingleEmojiPicker } from "./SingleEmojiPicker";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function QuotesTab({ bookId }: { bookId: string }) {
  const [quotes, setQuotes] = useState<BookQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<BookQuote | "new" | null>(null);
  const [quoteText, setQuoteText] = useState("");
  const [page, setPage] = useState("");
  const [note, setNote] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await listBookQuotes(bookId);
    if (error) setError(error.message);
    else setQuotes((data as BookQuote[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch when book changes
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  function openNew() {
    setQuoteText("");
    setPage("");
    setNote("");
    setEmoji(null);
    setEditing("new");
  }

  function openEdit(quote: BookQuote) {
    setQuoteText(quote.quote_text);
    setPage(quote.page ?? "");
    setNote(quote.personal_note ?? "");
    setEmoji(quote.emoji);
    setEditing(quote);
  }

  function closeEditor() {
    setEditing(null);
  }

  async function handleSave() {
    if (!quoteText.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const fields = {
        quote_text: quoteText.trim(),
        page: page.trim() || null,
        personal_note: note.trim() || null,
        emoji,
      };
      if (editing === "new") {
        const { data, error } = await insertBookQuote({ book_id: bookId, ...fields });
        if (error) {
          setError(error.message);
          return;
        }
        if (data) setQuotes((prev) => [data as BookQuote, ...prev]);
      } else if (editing) {
        const { data, error } = await updateBookQuote(editing.id, fields);
        if (error) {
          setError(error.message);
          return;
        }
        if (data) setQuotes((prev) => prev.map((q) => (q.id === editing.id ? (data as BookQuote) : q)));
      }
      closeEditor();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    const { error } = await deleteBookQuote(id);
    if (error) setError(error.message);
    if (editing !== "new" && editing?.id === id) closeEditor();
  }

  if (editing) {
    return (
      <div className="space-y-3">
        {error && (
          <div className="rounded-xl border border-terracotta-dark/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta-dark">
            {error}
          </div>
        )}
        <textarea
          autoFocus
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
          placeholder="Текст цитаты"
          rows={5}
          className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
        />
        <input
          value={page}
          onChange={(e) => setPage(e.target.value)}
          placeholder="Страница (необязательно)"
          className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Личная заметка (необязательно)"
          rows={2}
          className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
        />
        <SingleEmojiPicker value={emoji} onChange={setEmoji} />
        <div className="flex items-center justify-between pt-1">
          {editing !== "new" ? (
            <button
              type="button"
              onClick={() => handleDelete(editing.id)}
              className="text-sm font-semibold text-terracotta-dark/80 hover:text-terracotta-dark"
            >
              Удалить
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeEditor}
              className="rounded-full bg-cream-dark px-3.5 py-1.5 text-xs font-semibold text-espresso hover:bg-cream-dark/80"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !quoteText.trim()}
              className="rounded-full bg-sage text-cream px-4 py-1.5 text-sm font-bold shadow hover:brightness-105 disabled:opacity-60"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-terracotta-dark/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta-dark">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={openNew}
        className="w-full rounded-full bg-terracotta text-cream px-3.5 py-2 text-sm font-bold shadow hover:brightness-105"
      >
        ➕ Добавить цитату
      </button>

      {loading ? (
        <p className="text-sm text-cocoa/60 py-6 text-center">Загрузка цитат...</p>
      ) : quotes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-copper/25 bg-cream/40 py-8 px-6 text-center space-y-3">
          <p className="text-sm text-cocoa/60 italic">Цитат из этой книги пока нет</p>
          <button
            type="button"
            onClick={openNew}
            className="rounded-full bg-sage text-cream px-4 py-1.5 text-sm font-bold shadow hover:brightness-105"
          >
            Добавить первую цитату
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              onClick={() => openEdit(quote)}
              className="rounded-lg border border-copper/20 bg-cream/50 p-3 cursor-pointer hover:bg-cream-dark/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-espresso/90 italic line-clamp-3 whitespace-pre-wrap">
                    “{quote.quote_text}”
                  </p>
                  <div className="text-[11px] text-cocoa/50 mt-1">
                    {quote.page && <span>стр. {quote.page} · </span>}
                    {formatDate(quote.created_at)}
                    {quote.emoji && <span className="ml-1">{quote.emoji}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(quote);
                    }}
                    title="Редактировать"
                    className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-cream-dark/60 text-cocoa/70"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(quote.id);
                    }}
                    title="Удалить"
                    className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-terracotta/20 text-terracotta-dark/80"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
