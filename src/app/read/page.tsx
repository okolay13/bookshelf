"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Book, NewBook } from "@/lib/types";
import { BookModal } from "@/components/BookModal";
import { AddBookForm } from "@/components/AddBookForm";
import { ReadingHistoryTree } from "@/components/ReadingHistoryTree";
import {
  updateBook,
  deleteBook,
  insertBook,
  insertBooks,
  countBookQuotes,
  deleteBookQuotesForBook,
  detachBookQuotesForBook,
} from "@/lib/api";
import { GENRES } from "@/lib/genres";
import { QuoteOrphanModal } from "@/components/QuoteOrphanModal";

export default function ReadBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Book | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pendingQuoteDelete, setPendingQuoteDelete] = useState<{
    bookId: string;
    book: Book | null;
    count: number;
  } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: booksData } = await supabase.from("books").select("*");
      setBooks((booksData as Book[]) ?? []);
      setLoading(false);
    }
    void load();
  }, []);

  const finished = useMemo(() => books.filter((b) => b.status === "finished"), [books]);

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

  async function handleAddOne(newBook: NewBook): Promise<Book | null> {
    const { data } = await insertBook(newBook);
    if (data) {
      setBooks((prev) => [data as Book, ...prev]);
      return data as Book;
    }
    return null;
  }

  async function handleAddMany(newBooks: NewBook[]) {
    const { data } = await insertBooks(newBooks);
    if (data) setBooks((prev) => [...(data as Book[]), ...prev]);
  }

  async function handleMove(id: string, finishedAt: string) {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, finished_at: finishedAt } : b)));
    const { data } = await updateBook(id, { finished_at: finishedAt });
    if (data) setBooks((prev) => prev.map((b) => (b.id === id ? (data as Book) : b)));
  }

  return (
    <div className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8">
      <Link href="/" className="text-sm font-semibold text-terracotta-dark hover:underline">
        ← На полку
      </Link>
      <div className="mt-2 mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-4xl text-cream">Все прочитанные мной книги</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-full bg-terracotta text-cream px-5 py-2.5 text-sm font-bold shadow-lg hover:brightness-105 transition-all"
          >
            + Добавить книгу
          </button>
        </div>
      </div>
      <p className="text-sm text-cream/70 mb-6">Всего прочитано: {finished.length}</p>

      {loading ? (
        <p className="text-cocoa/70">Загрузка...</p>
      ) : finished.length === 0 ? (
        <p className="text-cocoa/70">Пока нет ни одной книги со статусом «Прочитано».</p>
      ) : (
        <ReadingHistoryTree books={finished} onSelect={setSelected} onMove={handleMove} />
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

      {showAdd && (
        <AddBookForm
          onClose={() => setShowAdd(false)}
          onAddOne={handleAddOne}
          onAddMany={handleAddMany}
          onUpdateBook={handleSave}
          defaultStatus="finished"
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
