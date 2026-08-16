"use client";

import { useState } from "react";
import { Book, STATUS_ACCENT, STATUS_LABEL } from "@/lib/types";

export interface LibraryGroup {
  key: string;
  title: string;
  books: Book[];
  accent?: string;
}

export function BookLibraryGroups({
  groups,
  mode,
  onSelect,
  shelvesByBook,
}: {
  groups: LibraryGroup[];
  mode: "grid" | "list";
  onSelect: (b: Book) => void;
  shelvesByBook: Map<string, string[]>;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const grouped = groups.length > 1 || groups[0]?.key !== "__all__";

  function toggle(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.key);
        return (
          <div key={group.key}>
            {grouped && (
              <button
                type="button"
                onClick={() => toggle(group.key)}
                className="w-full flex items-center gap-3 mb-3 group/header"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ background: group.accent ?? "#c1440e" }}
                />
                <h3 className="display text-lg text-cream group-hover/header:text-cream/90 transition-colors">
                  {group.title} <span className="text-cream/50 text-sm font-sans">({group.books.length})</span>
                </h3>
                <span className="flex-1 h-px bg-cream/15" />
                <span
                  className={`text-cream/60 text-sm transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
            )}

            {!isCollapsed &&
              (mode === "grid" ? (
                <BookGrid books={group.books} onSelect={onSelect} />
              ) : (
                <BookList books={group.books} onSelect={onSelect} shelvesByBook={shelvesByBook} />
              ))}
          </div>
        );
      })}
    </div>
  );
}

function BookGrid({ books, onSelect }: { books: Book[]; onSelect: (b: Book) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map((b, i) => (
        <button
          key={b.id}
          onClick={() => onSelect(b)}
          className="group text-left rounded-2xl bg-parchment/80 border border-copper/15 p-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all pop-in"
          style={{ animationDelay: `${Math.min(i, 12) * 20}ms` }}
        >
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-cream-dark/40 border border-copper/10 mb-2.5">
            {b.cover_url ? (
              <img
                src={b.cover_url}
                alt={`${b.title} — ${b.author}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-cocoa/40 text-3xl">📖</span>
            )}
            {b.is_favorite && (
              <span className="absolute top-1.5 right-1.5 text-sm drop-shadow" title="Избранное">
                ⭐
              </span>
            )}
            <span
              className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-[10px] font-bold text-cream truncate"
              style={{ background: `linear-gradient(0deg, ${STATUS_ACCENT[b.status]}e6, transparent)` }}
            >
              {STATUS_LABEL[b.status]}
            </span>
          </div>
          <div className="text-sm font-bold text-espresso-dark truncate">{b.title}</div>
          <div className="text-xs text-cocoa/70 truncate">{b.author}</div>
        </button>
      ))}
    </div>
  );
}

function BookList({
  books,
  onSelect,
  shelvesByBook,
}: {
  books: Book[];
  onSelect: (b: Book) => void;
  shelvesByBook: Map<string, string[]>;
}) {
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
          <span className="flex-shrink-0 w-11 h-16 rounded-md overflow-hidden shadow-sm border border-copper/15 bg-cream-dark/40">
            {b.cover_url ? (
              <img src={b.cover_url} alt={`${b.title} — ${b.author}`} className="w-full h-full object-cover" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-cocoa/40 text-lg">📖</span>
            )}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-espresso-dark truncate flex items-center gap-1.5">
              {b.is_favorite && <span title="Избранное">⭐</span>}
              {b.title}
            </div>
            <div className="text-sm text-cocoa/70 truncate">{b.author}</div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: STATUS_ACCENT[b.status] + "33", color: "#4a3123" }}
            >
              {STATUS_LABEL[b.status]}
            </span>
            <span className="text-xs text-cocoa/60">{(shelvesByBook.get(b.id) ?? []).join(", ") || "Все книги"}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
