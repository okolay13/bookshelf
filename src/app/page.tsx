"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Book, NewBook, STATUS_LABEL, STATUS_ORDER, UNSHELVED } from "@/lib/types";
import { ViewSwitcher, ViewMode } from "@/components/ViewSwitcher";
import { SearchFilterBar, Filters } from "@/components/SearchFilterBar";
import { ShelfRow } from "@/components/ShelfRow";
import { BookSpine } from "@/components/BookSpine";
import { BookModal } from "@/components/BookModal";
import { AddBookForm } from "@/components/AddBookForm";
import { PottedPlant, Candle, LampGlow, Leaf, StarSpark } from "@/components/Decor";

const STATUS_ACCENT: Record<string, string> = {
  reading: "#ffcf7a",
  to_read: "#6f8f5b",
  finished: "#c96a45",
};

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("shelf");
  const [filters, setFilters] = useState<Filters>({ query: "", shelf: "all", status: "all" });
  const [selected, setSelected] = useState<Book | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  async function loadBooks() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setBooks((data as Book[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    void loadBooks();
  }, []);

  const shelves = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => set.add(b.shelf?.trim() || UNSHELVED));
    return Array.from(set).sort();
  }, [books]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return books.filter((b) => {
      if (q && !`${b.title} ${b.author}`.toLowerCase().includes(q)) return false;
      if (filters.shelf !== "all" && (b.shelf?.trim() || UNSHELVED) !== filters.shelf) return false;
      if (filters.status !== "all" && b.status !== filters.status) return false;
      return true;
    });
  }, [books, filters]);

  async function handleAddOne(newBook: NewBook) {
    const { data, error } = await supabase.from("books").insert(newBook).select().single();
    if (error) {
      setError(error.message);
      return;
    }
    if (data) setBooks((prev) => [data as Book, ...prev]);
  }

  async function handleAddMany(newBooks: NewBook[]) {
    const { data, error } = await supabase.from("books").insert(newBooks).select();
    if (error) {
      setError(error.message);
      return;
    }
    if (data) setBooks((prev) => [...(data as Book[]), ...prev]);
  }

  async function handleSave(updated: Book) {
    const { id, ...fields } = updated;
    const { data, error } = await supabase
      .from("books")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    const saved = (data as Book) ?? updated;
    setBooks((prev) => prev.map((b) => (b.id === id ? saved : b)));
    setSelected(saved);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setSelected(null);
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="relative overflow-hidden border-b border-copper/15">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-6 right-4 sm:right-16 w-40 h-36 sm:w-56 sm:h-48 opacity-90">
            <LampGlow className="w-full h-full" />
          </div>
          <div className="absolute -left-3 bottom-0 w-20 sm:w-28 float-slow">
            <PottedPlant className="w-full h-auto" />
          </div>
          <div className="absolute right-2 sm:right-10 bottom-0 w-10 sm:w-14">
            <Candle className="w-full h-auto" />
          </div>
          <div className="absolute left-1/3 top-4 w-6 opacity-60">
            <StarSpark />
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center gap-2 text-sage-dark mb-1">
            <Leaf className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Уютный уголок</span>
          </div>
          <h1 className="display text-5xl sm:text-6xl text-espresso-dark drop-shadow-sm">
            Книжная полка
          </h1>
          <p className="text-cocoa/80 mt-1 text-sm sm:text-base max-w-md">
            {books.length
              ? `На полке ${books.length} ${pluralBooks(books.length)}. Заваривайте чай и выбирайте следующую книгу.`
              : "Добавьте свою первую книгу — и полка оживёт."}
          </p>

          <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-full bg-terracotta text-cream px-5 py-2.5 text-sm font-bold shadow-lg hover:brightness-105 transition-all"
            >
              + Добавить книгу
            </button>
            <ViewSwitcher value={view} onChange={setView} />
          </div>

          <div className="mt-4">
            <SearchFilterBar filters={filters} onChange={setFilters} shelves={shelves} />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-terracotta-dark/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta-dark">
            Ошибка Supabase: {error}
          </div>
        )}

        {loading ? (
          <LoadingShelf />
        ) : filtered.length === 0 ? (
          <EmptyState hasBooks={books.length > 0} onAdd={() => setShowAdd(true)} />
        ) : view === "shelf" ? (
          <ShelfGrouped books={filtered} shelves={shelves} onSelect={setSelected} />
        ) : view === "status" ? (
          <StatusGrouped books={filtered} onSelect={setSelected} />
        ) : (
          <ListView books={filtered} onSelect={setSelected} />
        )}
      </main>

      <footer className="mx-auto max-w-5xl w-full px-4 sm:px-6 pb-8 pt-2 text-center text-xs text-cocoa/50">
        сделано с теплом для тех, кто любит книги
      </footer>

      {selected && (
        <BookModal
          key={selected.id}
          book={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {showAdd && (
        <AddBookForm
          onClose={() => setShowAdd(false)}
          onAddOne={handleAddOne}
          onAddMany={handleAddMany}
        />
      )}
    </div>
  );
}

function ShelfGrouped({
  books,
  shelves,
  onSelect,
}: {
  books: Book[];
  shelves: string[];
  onSelect: (b: Book) => void;
}) {
  return (
    <div>
      {shelves.map((shelf) => {
        const shelfBooks = books.filter((b) => (b.shelf?.trim() || UNSHELVED) === shelf);
        if (shelfBooks.length === 0) return null;
        return (
          <ShelfRow
            key={shelf}
            title={shelf}
            books={shelfBooks}
            onSelect={onSelect}
            accent="#c96a45"
          />
        );
      })}
    </div>
  );
}

function StatusGrouped({ books, onSelect }: { books: Book[]; onSelect: (b: Book) => void }) {
  return (
    <div>
      {STATUS_ORDER.map((status) => {
        const statusBooks = books.filter((b) => b.status === status);
        if (statusBooks.length === 0) return null;
        return (
          <ShelfRow
            key={status}
            title={STATUS_LABEL[status]}
            books={statusBooks}
            onSelect={onSelect}
            accent={STATUS_ACCENT[status]}
          />
        );
      })}
    </div>
  );
}

function ListView({ books, onSelect }: { books: Book[]; onSelect: (b: Book) => void }) {
  return (
    <div className="rounded-2xl border border-copper/15 bg-parchment/70 overflow-hidden shadow-sm">
      {books.map((b, i) => (
        <button
          key={b.id}
          onClick={() => onSelect(b)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cream-dark/40 transition-colors ${
            i !== 0 ? "border-t border-copper/10" : ""
          }`}
        >
          <BookSpine book={b} onClick={() => onSelect(b)} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-espresso-dark truncate">{b.title}</div>
            <div className="text-sm text-cocoa/70 truncate">{b.author}</div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: STATUS_ACCENT[b.status] + "33",
                color: "#4a3123",
              }}
            >
              {STATUS_LABEL[b.status]}
            </span>
            <span className="text-xs text-cocoa/60">{b.shelf || UNSHELVED}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function LoadingShelf() {
  return (
    <div className="wood-shelf rounded-lg p-6 flex items-end gap-1.5 overflow-x-auto animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="rounded-t-md bg-cream/20"
          style={{ height: 140 + (i % 3) * 30, width: 40 }}
        />
      ))}
    </div>
  );
}

function EmptyState({ hasBooks, onAdd }: { hasBooks: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <PottedPlant className="w-16 h-auto mb-4 opacity-80" />
      <h2 className="display text-2xl text-espresso-dark mb-1">
        {hasBooks ? "Ничего не найдено" : "Полка пока пустая"}
      </h2>
      <p className="text-cocoa/70 text-sm max-w-xs mb-4">
        {hasBooks
          ? "Попробуйте изменить поиск или фильтры."
          : "Добавьте книгу вручную или вставьте список — и уютная полка начнёт заполняться."}
      </p>
      {!hasBooks && (
        <button
          onClick={onAdd}
          className="rounded-full bg-terracotta text-cream px-5 py-2.5 text-sm font-bold shadow-lg hover:brightness-105"
        >
          + Добавить книгу
        </button>
      )}
    </div>
  );
}

function pluralBooks(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "книга";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "книги";
  return "книг";
}
