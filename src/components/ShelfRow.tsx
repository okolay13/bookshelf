"use client";

import { Book } from "@/lib/types";
import { BookSpine } from "./BookSpine";

export function ShelfRow({
  title,
  books,
  onSelect,
  accent,
}: {
  title: string;
  books: Book[];
  onSelect: (book: Book) => void;
  accent?: string;
}) {
  return (
    <div className="mb-8">
      <h3 className="display text-2xl text-espresso-dark mb-2 px-1 flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: accent ?? "#c96a45" }}
        />
        {title}
        <span className="text-sm font-sans font-normal text-cocoa/70">
          {books.length} {pluralBooks(books.length)}
        </span>
      </h3>
      <div className="relative">
        <div className="flex items-end gap-1.5 overflow-x-auto px-3 pt-4 pb-3 wood-shelf rounded-lg">
          {books.length === 0 ? (
            <div className="py-6 px-2 text-cream/70 text-sm italic">
              Пока пусто
            </div>
          ) : (
            books.map((b) => (
              <BookSpine key={b.id} book={b} onClick={() => onSelect(b)} />
            ))
          )}
        </div>
        <div className="absolute -bottom-2 left-1 right-1 h-2 rounded-full bg-black/20 blur-sm" />
      </div>
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
