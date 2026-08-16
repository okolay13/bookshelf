"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Book } from "@/lib/types";
import { BookModal } from "@/components/BookModal";
import { EmojiPicker } from "@/components/EmojiPicker";
import { MAX_EMOJI_TAGS, parseEmojiTags, serializeEmojiTags } from "@/lib/emojiTags";
import { updateBook, deleteBook } from "@/lib/api";
import { GENRES } from "@/lib/genres";

interface Match {
  book: Book;
  matchedEmoji: string[];
}

export default function RecommendPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Book | null>(null);
  const [mood, setMood] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from("books").select("*");
      setBooks((data as Book[]) ?? []);
      setLoading(false);
    }
    void load();
  }, []);

  const toRead = useMemo(() => books.filter((b) => b.status === "to_read"), [books]);

  const matches = useMemo<Match[]>(() => {
    if (mood.length === 0) return [];
    return toRead
      .map((book) => ({
        book,
        matchedEmoji: parseEmojiTags(book.emoji_tag).filter((e) => mood.includes(e)),
      }))
      .filter((m) => m.matchedEmoji.length > 0)
      .sort((a, b) => b.matchedEmoji.length - a.matchedEmoji.length);
  }, [toRead, mood]);

  async function handleSave(updated: Book) {
    const { id, ...fields } = updated;
    const { data } = await updateBook(id, fields);
    const saved = (data as Book) ?? updated;
    setBooks((prev) => prev.map((b) => (b.id === id ? saved : b)));
    setSelected(saved);
  }

  async function handleDelete(id: string) {
    await deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setSelected(null);
  }

  return (
    <div className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
      <Link href="/" className="text-sm font-semibold text-terracotta-dark hover:underline">
        ← На полку
      </Link>
      <h1 className="display text-4xl text-cream mt-2 mb-1">Что читать дальше?</h1>
      <p className="text-sm text-cream/70 mb-6">
        Выберите до {MAX_EMOJI_TAGS} эмодзи, которые описывают ваше текущее настроение — подберём
        книги с полки «Хочу прочитать» с наибольшим совпадением тегов.
      </p>

      <div className="rounded-2xl border border-copper/15 bg-[rgba(245,230,211,0.92)] p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <EmojiPicker
          mode="inline"
          value={serializeEmojiTags(mood)}
          onChange={(v) => {
            setMood(parseEmojiTags(v));
            setSearched(false);
          }}
        />
        <button
          type="button"
          onClick={() => setSearched(true)}
          disabled={mood.length === 0}
          className="mt-4 w-full rounded-full bg-sage text-cream py-2.5 text-sm font-bold shadow hover:brightness-105 disabled:opacity-50"
        >
          Подобрать книгу
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-cream/70">Загрузка...</p>
        ) : !searched ? null : mood.length === 0 ? (
          <p className="text-cream/70">Выберите хотя бы один эмодзи-тег настроения.</p>
        ) : matches.length === 0 ? (
          <p className="text-cream/70">
            Пока нет совпадений. Добавьте эмодзи-теги книгам на полке «Хочу прочитать», чтобы
            подбор заработал.
          </p>
        ) : (
          matches.map(({ book, matchedEmoji }) => (
            <button
              key={book.id}
              onClick={() => setSelected(book)}
              className="w-full flex items-center gap-3 rounded-2xl border border-copper/20 bg-parchment/95 p-3 text-left shadow hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden bg-cream-dark/60 flex items-center justify-center">
                {book.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">📖</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-espresso-dark truncate">{book.title}</p>
                <p className="text-sm text-cocoa/70 truncate">{book.author}</p>
                <p className="text-xs text-sage-dark font-semibold mt-1">
                  Совпало {matchedEmoji.length} из {mood.length} выбранных эмодзи:{" "}
                  {matchedEmoji.join(" ")}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

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
    </div>
  );
}
