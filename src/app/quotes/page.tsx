"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Book, BookQuote } from "@/lib/types";
import {
  fetchAllBookQuotes,
  insertBookQuote,
  updateBookQuote,
  deleteBookQuote,
} from "@/lib/api";
import { AddQuoteForm, QuoteDraft } from "@/components/AddQuoteForm";
import { QuoteCard } from "@/components/QuoteCard";
import { QuoteFilterBar, QuoteBookOption } from "@/components/QuoteFilterBar";
import { RandomQuoteModal } from "@/components/RandomQuoteModal";
import { SearchBar } from "@/components/SearchBar";
import QuoteJarIllustration from "@/components/QuoteJarIllustration";
import { QuoteSortMode } from "@/lib/types";

export default function QuotesPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [quotes, setQuotes] = useState<BookQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [bookFilter, setBookFilter] = useState("all");
  const [emojiFilter, setEmojiFilter] = useState("all");
  const [sort, setSort] = useState<QuoteSortMode>("newest");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<BookQuote | null>(null);
  const [showRandom, setShowRandom] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: booksData }, { data: quotesData }] = await Promise.all([
        supabase.from("books").select("*"),
        fetchAllBookQuotes(),
      ]);
      setBooks((booksData as Book[]) ?? []);
      setQuotes((quotesData as BookQuote[]) ?? []);
      setLoading(false);
    }
    void load();
  }, []);

  const booksById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);

  const bookOptions: QuoteBookOption[] = useMemo(() => {
    const ids = new Set(quotes.map((q) => q.book_id).filter((id): id is string => Boolean(id)));
    return Array.from(ids)
      .map((id) => booksById.get(id))
      .filter((b): b is Book => Boolean(b))
      .sort((a, b) => a.title.localeCompare(b.title, "ru"))
      .map((b) => ({ id: b.id, label: b.title }));
  }, [quotes, booksById]);

  const emojiOptions = useMemo(
    () => Array.from(new Set(quotes.map((q) => q.emoji).filter((e): e is string => Boolean(e)))),
    [quotes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes.filter((quote) => {
      const book = quote.book_id ? booksById.get(quote.book_id) : null;
      const title = book?.title ?? quote.fallback_title ?? "";
      const author = book?.author ?? quote.fallback_author ?? "";
      if (q) {
        const haystack = `${quote.quote_text} ${title} ${author} ${quote.personal_note ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (bookFilter !== "all" && quote.book_id !== bookFilter) return false;
      if (emojiFilter !== "all" && quote.emoji !== emojiFilter) return false;
      return true;
    });
  }, [quotes, query, bookFilter, emojiFilter, booksById]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) =>
      sort === "newest" ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at)
    );
    return copy;
  }, [filtered, sort]);

  async function handleSave(draft: QuoteDraft) {
    if (editing) {
      const { data } = await updateBookQuote(editing.id, draft);
      if (data) setQuotes((prev) => prev.map((q) => (q.id === editing.id ? (data as BookQuote) : q)));
      setEditing(null);
    } else {
      const { data } = await insertBookQuote(draft);
      if (data) setQuotes((prev) => [data as BookQuote, ...prev]);
    }
  }

  async function handleDelete(id: string) {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    await deleteBookQuote(id);
  }

  return (
    <div className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-8">
      <div className="rounded-2xl bg-parchment/80 px-4 py-3 mb-6 shadow-sm">
        <Link href="/" className="text-sm font-semibold text-terracotta-dark hover:underline">
          ← На полку
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="display text-4xl text-espresso-dark">💬 Любимые цитаты</h1>
            <p className="text-sm text-cocoa/70">Уголок для строк, к которым хочется возвращаться.</p>
          </div>
          {quotes.length > 0 && (
            <button
              type="button"
              onClick={() => setShowRandom(true)}
              className="rounded-full bg-copper/20 text-espresso-dark px-4 py-2 text-sm font-bold hover:bg-copper/30 transition-colors"
            >
              🎲 Вдохновиться
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="w-full sm:w-auto rounded-full bg-terracotta text-cream px-6 py-3 text-sm font-bold shadow-lg hover:brightness-105 transition-all mb-6"
      >
        ➕ Добавить цитату
      </button>

      {loading ? (
        <p className="text-cocoa/70">Загрузка...</p>
      ) : quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-copper/15 bg-parchment/60">
          <QuoteJarIllustration className="w-40 h-auto mb-4" />
          <h2 className="display text-2xl text-espresso-dark mb-1.5 max-w-sm">
            Здесь будут храниться строки, к которым хочется возвращаться снова и снова.
          </h2>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="mt-3 rounded-full bg-terracotta text-cream px-5 py-2.5 text-sm font-bold shadow-lg hover:brightness-105"
          >
            Добавить первую цитату
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-copper/15 bg-parchment/70 p-4 space-y-3">
            <SearchBar value={query} onChange={setQuery} className="w-full" />
            <QuoteFilterBar
              bookId={bookFilter}
              onBookChange={setBookFilter}
              bookOptions={bookOptions}
              emoji={emojiFilter}
              onEmojiChange={setEmojiFilter}
              emojiOptions={emojiOptions}
              sort={sort}
              onSortChange={setSort}
            />
          </div>

          {sorted.length === 0 ? (
            <p className="text-cocoa/70 text-center py-10">Ничего не найдено — попробуйте изменить поиск или фильтры.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  book={quote.book_id ? booksById.get(quote.book_id) ?? null : null}
                  onEdit={() => setEditing(quote)}
                  onDelete={() => handleDelete(quote.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {(showAdd || editing) && (
        <AddQuoteForm
          books={books}
          quote={editing}
          onSave={handleSave}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
          }}
        />
      )}

      {showRandom && sorted.length > 0 && (
        <RandomQuoteModal quotes={sorted} booksById={booksById} onClose={() => setShowRandom(false)} />
      )}
    </div>
  );
}
