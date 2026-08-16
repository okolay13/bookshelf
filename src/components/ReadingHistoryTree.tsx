"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Book } from "@/lib/types";
import { spineStyle } from "@/lib/bookVisuals";
import { StarRating } from "@/components/StarRating";
import { formatFlexibleDate } from "@/lib/flexibleDate";

const NO_DATE = "Без даты";
const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

function pluralBooks(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "книга";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "книги";
  return "книг";
}

interface YearGroup {
  year: string;
  months: { month: number; books: Book[] }[];
  noMonth: Book[];
  total: number;
}

export function ReadingHistoryTree({
  books,
  onSelect,
  onMove,
}: {
  books: Book[];
  onSelect: (b: Book) => void;
  onMove: (id: string, finishedAt: string) => void;
}) {
  const years = useMemo<YearGroup[]>(() => {
    const byYear = new Map<string, Book[]>();
    books.forEach((b) => {
      const year = b.finished_at ? b.finished_at.slice(0, 4) : NO_DATE;
      const arr = byYear.get(year) ?? [];
      arr.push(b);
      byYear.set(year, arr);
    });

    const keys = Array.from(byYear.keys())
      .filter((y) => y !== NO_DATE)
      .sort((a, b) => Number(b) - Number(a));
    if (byYear.has(NO_DATE)) keys.push(NO_DATE);

    return keys.map((year) => {
      const yearBooks = byYear.get(year)!;
      const byMonth = new Map<number, Book[]>();
      const noMonth: Book[] = [];
      yearBooks.forEach((b) => {
        if (year === NO_DATE || !b.finished_at || b.finished_at.length < 7) {
          noMonth.push(b);
          return;
        }
        const month = Number(b.finished_at.slice(5, 7));
        if (month < 1 || month > 12) {
          noMonth.push(b);
          return;
        }
        const arr = byMonth.get(month) ?? [];
        arr.push(b);
        byMonth.set(month, arr);
      });
      for (const arr of byMonth.values()) {
        arr.sort((a, b) => (b.finished_at ?? "").localeCompare(a.finished_at ?? ""));
      }
      noMonth.sort((a, b) => (b.finished_at ?? "").localeCompare(a.finished_at ?? ""));

      const months =
        year === NO_DATE
          ? []
          : Array.from({ length: 12 }, (_, i) => ({ month: i + 1, books: byMonth.get(i + 1) ?? [] }));

      return { year, months, noMonth, total: yearBooks.length };
    });
  }, [books]);

  const [expandedYears, setExpandedYears] = useState<Set<string>>(() => new Set(years[0] ? [years[0].year] : []));
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  function toggleYear(year: string) {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }

  function toggleMonth(key: string) {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (years.length === 0) return null;

  const maxYearTotal = Math.max(...years.map((y) => y.total), 1);

  return (
    <div className="space-y-3">
      {years.map((y) => {
        const isOpen = expandedYears.has(y.year);
        const maxMonthCount = Math.max(...y.months.map((m) => m.books.length), 1);
        return (
          <section
            key={y.year}
            className="rounded-2xl border border-copper/20 bg-parchment/80 shadow-sm overflow-hidden backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={() => toggleYear(y.year)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-cream-dark/30 transition-colors"
            >
              <span
                className="text-cocoa/60 text-sm transition-transform duration-200 flex-shrink-0"
                style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                aria-hidden="true"
              >
                ▾
              </span>
              <span className="text-xl flex-shrink-0" aria-hidden="true">
                📚
              </span>
              <h2 className="display text-xl text-espresso-dark flex-shrink-0">
                {y.year === NO_DATE ? NO_DATE : y.year}
              </h2>
              <span className="text-sm text-cocoa/60 font-semibold flex-shrink-0">
                {y.total} {pluralBooks(y.total)}
              </span>
              <span className="flex-1 h-1.5 rounded-full bg-cream-dark/50 overflow-hidden hidden sm:block">
                <span
                  className="block h-full bg-terracotta rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((y.total / maxYearTotal) * 100)}%` }}
                />
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="px-3 sm:px-5 pb-4 space-y-1">
                  {y.year === NO_DATE
                    ? y.noMonth.map((b) => (
                        <BookRow key={b.id} book={b} onSelect={onSelect} onMove={onMove} />
                      ))
                    : y.months.map((m) => {
                        const key = `${y.year}-${m.month}`;
                        const monthOpen = expandedMonths.has(key);
                        return (
                          <div key={key} className="rounded-xl">
                            <button
                              type="button"
                              onClick={() => toggleMonth(key)}
                              disabled={m.books.length === 0}
                              className="w-full flex items-center gap-3 py-2 px-2 rounded-xl text-left hover:bg-cream-dark/40 transition-colors disabled:hover:bg-transparent disabled:cursor-default"
                            >
                              <span
                                className={`text-cocoa/40 text-[10px] w-3 flex-shrink-0 transition-transform duration-200 ${
                                  m.books.length === 0 ? "opacity-0" : ""
                                }`}
                                style={{ transform: monthOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                                aria-hidden="true"
                              >
                                ▾
                              </span>
                              <MonthBookStack count={m.books.length} seed={key} maxCount={maxMonthCount} />
                              <span
                                className={`flex-1 font-semibold ${
                                  m.books.length === 0 ? "text-cocoa/40" : "text-espresso-dark"
                                }`}
                              >
                                {MONTH_NAMES[m.month - 1]}
                              </span>
                              <span className="text-xs text-cocoa/60 font-bold flex-shrink-0">
                                {m.books.length}
                              </span>
                            </button>

                            {m.books.length > 0 && (
                              <div
                                className="grid transition-[grid-template-rows] duration-[250ms] ease-out"
                                style={{ gridTemplateRows: monthOpen ? "1fr" : "0fr" }}
                              >
                                <div className="overflow-hidden">
                                  <div className="pl-8 pr-1 pt-1 pb-2 space-y-1">
                                    {m.books.map((b) => (
                                      <BookRow key={b.id} book={b} onSelect={onSelect} onMove={onMove} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  {y.year !== NO_DATE &&
                    y.noMonth.length > 0 &&
                    y.noMonth.map((b) => <BookRow key={b.id} book={b} onSelect={onSelect} onMove={onMove} />)}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MonthBookStack({ count, seed, maxCount }: { count: number; seed: string; maxCount: number }) {
  const bars = Math.min(count, 8);
  const extra = count - bars;
  return (
    <span className="flex items-end gap-1.5 flex-shrink-0" aria-hidden="true">
      <span className="flex flex-col-reverse gap-[2px] w-9">
        {count === 0 ? (
          <span className="block h-[6px] rounded-sm border border-dashed border-copper/30" />
        ) : (
          Array.from({ length: bars }).map((_, i) => {
            const s = spineStyle(`${seed}-${i}`);
            const scale = 0.55 + 0.45 * (Math.min(count, maxCount) / maxCount);
            return (
              <span
                key={i}
                className="block rounded-sm shadow-sm border-t border-white/20 transition-all duration-300"
                style={{
                  height: `${Math.max(4, Math.round(6 * scale))}px`,
                  background: `url(/images/spine-textures/${s.image}) center/16px repeat`,
                }}
              />
            );
          })
        )}
      </span>
      {extra > 0 && <span className="text-[10px] text-cocoa/60 font-bold pb-0.5">+{extra}</span>}
    </span>
  );
}

function MiniCover({ book }: { book: Book }) {
  const s = spineStyle(book.id || book.title + book.author);
  const hasImage = Boolean(book.spine_image_url);
  return (
    <span
      className="flex-shrink-0 rounded-sm shadow-sm border-t border-white/20"
      style={{
        width: "28px",
        height: "38px",
        background: hasImage
          ? `url(${book.spine_image_url}) center/cover`
          : `url(/images/spine-textures/${s.image}) center/32px repeat`,
      }}
      aria-hidden="true"
    />
  );
}

function BookRow({
  book,
  onSelect,
  onMove,
}: {
  book: Book;
  onSelect: (b: Book) => void;
  onMove: (id: string, finishedAt: string) => void;
}) {
  return (
    <div className="group/row w-full flex items-center gap-2.5 py-1.5 rounded-lg hover:bg-cream-dark/40 transition-colors pr-1">
      <button
        onClick={() => onSelect(book)}
        className="flex-1 flex items-center gap-2.5 min-w-0 text-left"
      >
        <MiniCover book={book} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-espresso-dark truncate">{book.title}</div>
          <div className="text-xs text-cocoa/70 truncate">{book.author}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {book.finished_at && (
            <span className="text-[11px] text-cocoa/60 hidden sm:inline">
              {formatFlexibleDate(book.finished_at)}
            </span>
          )}
          <StarRating value={book.rating} readOnly size="text-xs" />
        </div>
      </button>
      <MoveControl book={book} onMove={onMove} />
    </div>
  );
}

function MoveControl({
  book,
  onMove,
}: {
  book: Book;
  onMove: (id: string, finishedAt: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const now = new Date();
  const initYear = book.finished_at ? Number(book.finished_at.slice(0, 4)) : now.getFullYear();
  const initMonth =
    book.finished_at && book.finished_at.length >= 7 ? Number(book.finished_at.slice(5, 7)) : now.getMonth() + 1;
  const [year, setYear] = useState(initYear);
  const [month, setMonth] = useState(initMonth);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  function apply(y: number, m: number) {
    setYear(y);
    setMonth(m);
    if (!Number.isFinite(y) || y < 1000) return;
    onMove(book.id, `${y}-${String(m).padStart(2, "0")}`);
  }

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="h-7 w-7 flex items-center justify-center rounded-full text-cocoa/50 opacity-0 group-hover/row:opacity-100 focus:opacity-100 hover:bg-cream-dark/70 hover:text-espresso transition-all"
        title="Перенести в другой месяц или год"
        aria-label="Перенести книгу"
      >
        📅
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pop-in absolute right-0 top-full mt-1.5 z-20 flex items-center gap-1.5 rounded-xl border border-copper/25 bg-parchment shadow-lg p-2"
        >
          <input
            type="number"
            value={year}
            onChange={(e) => apply(Number(e.target.value), month)}
            className="w-16 rounded-lg border border-copper/25 bg-cream/60 px-1.5 py-1 text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
          <select
            value={month}
            onChange={(e) => apply(year, Number(e.target.value))}
            className="rounded-lg border border-copper/25 bg-cream/60 px-1.5 py-1 text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
