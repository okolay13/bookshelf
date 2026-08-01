"use client";

import { Book, STATUS_LABEL } from "@/lib/types";
import { spineStyle } from "@/lib/bookVisuals";

export function BookSpine({
  book,
  onClick,
}: {
  book: Book;
  onClick: () => void;
}) {
  const s = spineStyle(book.id || book.title + book.author);

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${book.title} — ${book.author}`}
      style={{
        background: `linear-gradient(90deg, ${s.edge} 0%, ${s.bg} 12%, ${s.bg} 88%, ${s.edge} 100%)`,
        height: `${s.height}px`,
        width: `${s.width}px`,
        color: s.text,
        transform: `rotate(${s.tilt}deg)`,
      }}
      className="group relative flex-shrink-0 rounded-t-md rounded-b-sm shadow-[0_4px_8px_rgba(58,33,22,0.35)] border-t border-white/20 transition-transform duration-150 hover:-translate-y-2 hover:rotate-0 hover:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-glow cursor-pointer"
    >
      <span className="absolute inset-x-1 top-1.5 h-px bg-white/25" />
      <span className="absolute inset-x-1 bottom-1.5 h-px bg-white/15" />
      {book.status === "reading" && (
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-glow shadow-[0_0_8px_2px_rgba(255,207,122,0.8)]" />
      )}
      <span
        className="absolute inset-0 flex items-center justify-center px-1"
        style={{ writingMode: "vertical-rl" }}
      >
        <span className="text-[11px] font-bold leading-tight line-clamp-1 max-h-full overflow-hidden">
          {book.title}
        </span>
      </span>
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-7 whitespace-nowrap rounded-md bg-espresso px-2 py-1 text-[11px] text-cream opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 z-20">
        {book.title}
        <span className="block text-[10px] text-cream/70">{book.author}</span>
      </span>
      <span className="sr-only">{STATUS_LABEL[book.status]}</span>
    </button>
  );
}
