"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Book, ReadingGoal } from "@/lib/types";
import { MonthlyBarChart } from "@/components/MonthlyBarChart";
import { StarRating } from "@/components/StarRating";
import { BookSpine } from "@/components/BookSpine";
import { BookModal } from "@/components/BookModal";
import { ViewSwitcher, ViewMode } from "@/components/ViewSwitcher";
import {
  updateBook,
  deleteBook,
  getReadingGoal,
  upsertReadingGoal,
  countBookQuotes,
  deleteBookQuotesForBook,
  detachBookQuotesForBook,
} from "@/lib/api";
import { GENRES } from "@/lib/genres";
import { formatFlexibleDate } from "@/lib/flexibleDate";
import { QuoteOrphanModal } from "@/components/QuoteOrphanModal";

const currentYear = new Date().getFullYear();

export default function GoalPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Book | null>(null);
  const [goal, setGoal] = useState<ReadingGoal | null>(null);
  const [goalInput, setGoalInput] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [pendingQuoteDelete, setPendingQuoteDelete] = useState<{
    bookId: string;
    book: Book | null;
    count: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: booksData }, { data: goalData }] = await Promise.all([
        supabase.from("books").select("*"),
        getReadingGoal(currentYear),
      ]);
      setBooks((booksData as Book[]) ?? []);
      if (goalData) {
        setGoal(goalData as ReadingGoal);
        setGoalInput(String((goalData as ReadingGoal).target_books));
      }
      setLoading(false);
    }
    void load();
  }, []);

  const finishedThisYear = useMemo(
    () =>
      books
        .filter((b) => b.status === "finished" && b.finished_at?.startsWith(String(currentYear)))
        .sort((a, b) => (b.finished_at ?? "").localeCompare(a.finished_at ?? "")),
    [books]
  );

  const monthlyCounts = useMemo(() => {
    const counts = new Array(12).fill(0);
    finishedThisYear.forEach((b) => {
      const month = Number(b.finished_at!.slice(5, 7)) - 1;
      if (month >= 0 && month < 12) counts[month] += 1;
    });
    return counts;
  }, [finishedThisYear]);

  const goalProgress = goal ? Math.min(100, (finishedThisYear.length / goal.target_books) * 100) : 0;
  const remaining = goal ? Math.max(0, goal.target_books - finishedThisYear.length) : null;

  async function handleSaveGoal(e: React.FormEvent) {
    e.preventDefault();
    const target = Number(goalInput);
    if (!Number.isFinite(target) || target <= 0) return;
    setSavingGoal(true);
    try {
      const { data } = await upsertReadingGoal(currentYear, target);
      if (data) setGoal(data as ReadingGoal);
    } finally {
      setSavingGoal(false);
    }
  }

  async function handleSave(updated: Book) {
    const { id, ...fields } = updated;
    const { data } = await updateBook(id, fields);
    const saved = (data as Book) ?? updated;
    setBooks((prev) => prev.map((b) => (b.id === id ? saved : b)));
    setSelected(saved);
  }

  async function handleDelete(id: string) {
    const { count } = await countBookQuotes(id);
    if (count > 0) {
      const book = books.find((b) => b.id === id) ?? null;
      setPendingQuoteDelete({ bookId: id, book, count });
      return;
    }
    await performDelete(id);
  }

  async function performDelete(id: string) {
    await deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setSelected(null);
  }

  async function handleQuoteOrphanChoice(action: "delete" | "keep") {
    if (!pendingQuoteDelete) return;
    const { bookId, book } = pendingQuoteDelete;
    if (action === "delete") {
      await deleteBookQuotesForBook(bookId);
    } else if (book) {
      await detachBookQuotesForBook(bookId, {
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
      });
    }
    setPendingQuoteDelete(null);
    await performDelete(bookId);
  }

  return (
    <div className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8">
      <div className="rounded-2xl bg-parchment/80 px-4 py-3 mb-6 shadow-sm">
        <Link href="/" className="text-sm font-semibold text-terracotta-dark hover:underline">
          ← На полку
        </Link>
        <h1 className="mt-2 display text-4xl text-espresso-dark">Годовая цель {currentYear}</h1>
        <p className="text-sm text-cocoa/70">Сколько книг прочитано и сколько ещё осталось.</p>
      </div>

      {loading ? (
        <p className="text-cocoa/70">Загрузка...</p>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-copper/20 bg-parchment/80 p-5 shadow-sm">
            {goal ? (
              <div>
                <div className="flex items-center justify-between text-sm font-semibold text-espresso mb-1.5">
                  <span>
                    Прочитано {finishedThisYear.length} из {goal.target_books}
                  </span>
                  <span>{Math.round(goalProgress)}%</span>
                </div>
                <div className="h-3 rounded-full bg-cream-dark/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-terracotta to-copper-light transition-all"
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-cream-dark/40 px-3 py-2 text-center">
                    <div className="text-xl font-bold text-espresso-dark">{finishedThisYear.length}</div>
                    <div className="text-xs text-cocoa/70">уже прочитано</div>
                  </div>
                  <div className="rounded-xl bg-cream-dark/40 px-3 py-2 text-center">
                    <div className="text-xl font-bold text-espresso-dark">{remaining}</div>
                    <div className="text-xs text-cocoa/70">осталось прочитать</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-cocoa/70">Цель на {currentYear} год ещё не задана.</p>
            )}

            <form onSubmit={handleSaveGoal} className="mt-4 flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Сколько книг прочитать?"
                className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
              <button
                type="submit"
                disabled={savingGoal}
                className="flex-shrink-0 rounded-full bg-sage text-cream px-4 py-2 text-sm font-bold shadow hover:brightness-105 disabled:opacity-60"
              >
                {savingGoal ? "Сохранение..." : goal ? "Обновить" : "Задать"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-copper/20 bg-parchment/80 p-5 shadow-sm">
            <h2 className="display text-2xl text-espresso-dark mb-1">По месяцам</h2>
            <MonthlyBarChart counts={monthlyCounts} />
          </section>

          <section className="rounded-2xl border border-copper/20 bg-parchment/80 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="display text-2xl text-espresso-dark">
                Прочитано в {currentYear} году
                <span className="text-base text-cocoa/60 font-normal"> — {finishedThisYear.length}</span>
              </h2>
              {finishedThisYear.length > 0 && <ViewSwitcher value={view} onChange={setView} />}
            </div>
            {finishedThisYear.length === 0 ? (
              <p className="text-sm text-cocoa/70">В этом году ещё нет прочитанных книг.</p>
            ) : view === "shelf" ? (
              <div className="divide-y divide-copper/10">
                {finishedThisYear.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className="w-full flex items-center gap-3 py-3 text-left hover:bg-cream-dark/40 transition-colors rounded-lg px-1 -mx-1"
                  >
                    <BookSpine book={b} onClick={() => setSelected(b)} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-espresso-dark truncate">{b.title}</div>
                      <div className="text-sm text-cocoa/70 truncate">{b.author}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <StarRating value={b.rating} readOnly size="text-sm" />
                      {b.finished_at && (
                        <span className="text-xs text-cocoa/60">{formatFlexibleDate(b.finished_at)}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {finishedThisYear.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className="group text-left rounded-xl bg-cream-dark/30 border border-copper/15 p-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-cream-dark/40 border border-copper/10 mb-1.5">
                      {b.cover_url ? (
                        <img
                          src={b.cover_url}
                          alt={`${b.title} — ${b.author}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-cocoa/40 text-2xl">📖</span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-espresso-dark truncate">{b.title}</div>
                    <div className="text-[11px] text-cocoa/70 truncate">{b.author}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-copper/10">
                {finishedThisYear.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className="w-full flex items-center gap-2.5 py-1.5 text-left hover:bg-cream-dark/40 transition-colors rounded-lg px-1 -mx-1"
                  >
                    <span className="flex-shrink-0 w-7 h-10 rounded-sm overflow-hidden shadow-sm border border-copper/15 bg-cream-dark/40">
                      {b.cover_url ? (
                        <img src={b.cover_url} alt={`${b.title} — ${b.author}`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-cocoa/40 text-sm">📖</span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-espresso-dark truncate">{b.title}</div>
                      <div className="text-xs text-cocoa/70 truncate">{b.author}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {b.finished_at && (
                        <span className="text-[11px] text-cocoa/60">{formatFlexibleDate(b.finished_at)}</span>
                      )}
                      <StarRating value={b.rating} readOnly size="text-xs" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {selected && (
        <BookModal
          key={selected.id}
          book={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
          moodSuggestions={[]}
          userShelves={[]}
          bookShelves={[]}
          onAddShelf={async () => {}}
          onRemoveShelf={async () => {}}
          onCreateShelfForBook={async () => {}}
          genres={[...GENRES]}
        />
      )}

      {pendingQuoteDelete && (
        <QuoteOrphanModal
          bookTitle={pendingQuoteDelete.book?.title ?? "книга"}
          count={pendingQuoteDelete.count}
          onChoice={handleQuoteOrphanChoice}
          onCancel={() => setPendingQuoteDelete(null)}
        />
      )}
    </div>
  );
}
