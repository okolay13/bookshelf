"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookFormat,
  BookStatus,
  DEFAULT_FILTERS,
  FORMAT_LABEL,
  FORMAT_ORDER,
  Filters,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/lib/types";
import { EmojiPicker } from "./EmojiPicker";
import { parseEmojiTags, serializeEmojiTags } from "@/lib/emojiTags";

const controlClass =
  "h-10 w-full rounded-xl border border-copper/25 bg-parchment/90 px-3.5 text-sm text-espresso shadow-inner transition-shadow focus:outline-none focus:ring-2 focus:ring-terracotta/40 hover:border-copper/40";

export function LibraryFilterBar({
  filters,
  onChange,
  genres,
  authors,
  shelves,
  languages,
  years,
  moodTags,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  genres: string[];
  authors: string[];
  shelves: string[];
  languages: string[];
  years: number[];
  moodTags: string[];
}) {
  const [morePanelOpen, setMorePanelOpen] = useState(false);

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const moreFilterCount =
    (filters.author !== "all" ? 1 : 0) +
    (filters.shelf !== "all" ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    (filters.year !== "all" ? 1 : 0) +
    (filters.language !== "all" ? 1 : 0) +
    (filters.format !== "all" ? 1 : 0) +
    (filters.moodTag !== "all" ? 1 : 0) +
    (filters.emojiTags.length > 0 ? 1 : 0) +
    (filters.favoritesOnly ? 1 : 0) +
    (filters.notesOnly ? 1 : 0) +
    (filters.readFrom || filters.readTo ? 1 : 0);

  const moreButtonLabel = moreButtonText(filters, moreFilterCount);

  const chips = buildChips(filters, set);
  const hasActiveFilters = chips.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
        <select
          value={filters.status}
          onChange={(e) => set("status", e.target.value as BookStatus | "all")}
          className={`${controlClass} sm:w-44`}
        >
          <option value="all">Все книги</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <select
          value={filters.genre}
          onChange={(e) => set("genre", e.target.value)}
          className={`${controlClass} sm:w-40`}
        >
          <option value="all">Любой жанр</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <MoreFiltersButton
          open={morePanelOpen}
          onOpenChange={setMorePanelOpen}
          label={moreButtonLabel}
          active={moreFilterCount > 0}
          filters={filters}
          set={set}
          authors={authors}
          shelves={shelves}
          languages={languages}
          years={years}
          moodTags={moodTags}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 fade-in">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onClear}
              className="group inline-flex items-center gap-1.5 rounded-full bg-copper-light/20 border border-copper-light/40 px-3 py-1 text-xs font-semibold text-espresso-dark hover:bg-copper-light/30 transition-colors"
            >
              {chip.label}
              <span className="text-cocoa/60 group-hover:text-terracotta-dark">×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_FILTERS, query: filters.query })}
            className="ml-auto text-xs font-bold text-terracotta-dark/80 hover:text-terracotta-dark hover:underline"
          >
            Сбросить всё
          </button>
        </div>
      )}
    </div>
  );
}

function moreButtonText(filters: Filters, count: number): string {
  if (count === 0) return "Ещё фильтры";
  if (count > 1) return `Ещё фильтры (${count})`;
  if (filters.author !== "all") return `Автор: ${filters.author}`;
  if (filters.shelf !== "all") return `Полка: ${filters.shelf}`;
  if (filters.rating > 0) return `От ${filters.rating} ★`;
  if (filters.year !== "all") return `Год: ${filters.year}`;
  if (filters.language !== "all") return `Язык: ${filters.language}`;
  if (filters.format !== "all") return `Формат: ${FORMAT_LABEL[filters.format as BookFormat]}`;
  if (filters.moodTag !== "all") return `Тег: ${filters.moodTag}`;
  if (filters.emojiTags.length > 0) return `Эмодзи: ${filters.emojiTags.join(" ")}`;
  if (filters.favoritesOnly) return "Избранные";
  if (filters.notesOnly) return "Есть заметки";
  if (filters.readFrom || filters.readTo) return "Дата прочтения";
  return "Ещё фильтры";
}

interface Chip {
  key: string;
  label: string;
  onClear: () => void;
}

function buildChips(filters: Filters, set: <K extends keyof Filters>(key: K, value: Filters[K]) => void): Chip[] {
  const chips: Chip[] = [];
  if (filters.status !== "all") {
    chips.push({ key: "status", label: STATUS_LABEL[filters.status], onClear: () => set("status", "all") });
  }
  if (filters.genre !== "all") {
    chips.push({ key: "genre", label: filters.genre, onClear: () => set("genre", "all") });
  }
  if (filters.author !== "all") {
    chips.push({ key: "author", label: filters.author, onClear: () => set("author", "all") });
  }
  if (filters.shelf !== "all") {
    chips.push({ key: "shelf", label: filters.shelf, onClear: () => set("shelf", "all") });
  }
  if (filters.rating > 0) {
    chips.push({ key: "rating", label: `От ${filters.rating} ★`, onClear: () => set("rating", 0) });
  }
  if (filters.year !== "all") {
    chips.push({ key: "year", label: filters.year, onClear: () => set("year", "all") });
  }
  if (filters.language !== "all") {
    chips.push({ key: "language", label: filters.language, onClear: () => set("language", "all") });
  }
  if (filters.format !== "all") {
    chips.push({
      key: "format",
      label: FORMAT_LABEL[filters.format as BookFormat],
      onClear: () => set("format", "all"),
    });
  }
  if (filters.moodTag !== "all") {
    chips.push({ key: "moodTag", label: filters.moodTag, onClear: () => set("moodTag", "all") });
  }
  if (filters.emojiTags.length > 0) {
    chips.push({
      key: "emojiTags",
      label: `Эмодзи: ${filters.emojiTags.join(" ")}`,
      onClear: () => set("emojiTags", []),
    });
  }
  if (filters.favoritesOnly) {
    chips.push({ key: "favoritesOnly", label: "★ Избранные", onClear: () => set("favoritesOnly", false) });
  }
  if (filters.notesOnly) {
    chips.push({ key: "notesOnly", label: "Есть заметки", onClear: () => set("notesOnly", false) });
  }
  if (filters.readFrom || filters.readTo) {
    chips.push({
      key: "readRange",
      label: `Прочитано: ${filters.readFrom || "…"} – ${filters.readTo || "…"}`,
      onClear: () => {
        set("readFrom", "");
        set("readTo", "");
      },
    });
  }
  return chips;
}

function MoreFiltersButton({
  open,
  onOpenChange,
  label,
  active,
  filters,
  set,
  authors,
  shelves,
  languages,
  years,
  moodTags,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  label: string;
  active: boolean;
  filters: Filters;
  set: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  authors: string[];
  shelves: string[];
  languages: string[];
  years: number[];
  moodTags: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative sm:w-52">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`${controlClass} flex items-center justify-between gap-2 font-semibold ${
          active ? "border-copper-light/60 bg-copper-light/15 text-espresso-dark" : ""
        }`}
      >
        <span className="truncate">{label}</span>
        <span className={`text-cocoa/60 text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/30 sm:hidden"
            onClick={() => onOpenChange(false)}
          />
          <div className="pop-in fixed left-1/2 top-1/2 z-30 max-h-[85vh] w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-copper/20 bg-parchment shadow-2xl p-4 space-y-3.5 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:max-h-none sm:w-[min(90vw,22rem)] sm:translate-x-0 sm:translate-y-0 sm:overflow-visible">
          {authors.length > 0 && (
            <div>
              <FieldLabel>Автор</FieldLabel>
              <AuthorPicker
                authors={authors}
                value={filters.author}
                onChange={(v) => set("author", v)}
              />
            </div>
          )}

          <div>
            <FieldLabel>Полка</FieldLabel>
            <select
              value={filters.shelf}
              onChange={(e) => set("shelf", e.target.value)}
              className={controlClass}
            >
              <option value="all">Любая полка</option>
              {shelves.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>Рейтинг</FieldLabel>
            <select
              value={filters.rating}
              onChange={(e) => set("rating", Number(e.target.value))}
              className={controlClass}
            >
              <option value={0}>Любой рейтинг</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  От {n} ★ и выше
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <FieldLabel>Год издания</FieldLabel>
              <select value={filters.year} onChange={(e) => set("year", e.target.value)} className={controlClass}>
                <option value="all">Любой</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Язык</FieldLabel>
              <select
                value={filters.language}
                onChange={(e) => set("language", e.target.value)}
                className={controlClass}
              >
                <option value="all">Любой</option>
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <FieldLabel>Формат</FieldLabel>
            <select
              value={filters.format}
              onChange={(e) => set("format", e.target.value as BookFormat | "all")}
              className={controlClass}
            >
              <option value="all">Любой формат</option>
              {FORMAT_ORDER.map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABEL[f]}
                </option>
              ))}
            </select>
          </div>

          {moodTags.length > 0 && (
            <div>
              <FieldLabel>Тег настроения</FieldLabel>
              <select
                value={filters.moodTag}
                onChange={(e) => set("moodTag", e.target.value)}
                className={controlClass}
              >
                <option value="all">Любой тег</option>
                {moodTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <FieldLabel>Эмодзи-теги книги</FieldLabel>
            <EmojiPicker
              mode="inline"
              value={serializeEmojiTags(filters.emojiTags)}
              onChange={(v) => set("emojiTags", parseEmojiTags(v))}
            />
          </div>

          <div>
            <FieldLabel>Дата прочтения</FieldLabel>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="date"
                value={filters.readFrom}
                onChange={(e) => set("readFrom", e.target.value)}
                className={controlClass}
              />
              <input
                type="date"
                value={filters.readTo}
                onChange={(e) => set("readTo", e.target.value)}
                className={controlClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 border-t border-copper/15">
            <ToggleRow
              label="Только избранные"
              checked={filters.favoritesOnly}
              onChange={(v) => set("favoritesOnly", v)}
            />
            <ToggleRow
              label="Только книги с заметками"
              checked={filters.notesOnly}
              onChange={(v) => set("notesOnly", v)}
            />
          </div>
          </div>
        </>
      )}
    </div>
  );
}

function AuthorPicker({
  authors,
  value,
  onChange,
}: {
  authors: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  const groups = new Map<string, string[]>();
  for (const author of authors) {
    const letter = author.trim().charAt(0).toUpperCase() || "#";
    const bucket = groups.get(letter) ?? [];
    bucket.push(author);
    groups.set(letter, bucket);
  }
  const availableLetters = new Set(groups.keys());

  function jumpTo(letter: string) {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-letter="${letter}"]`);
    el?.scrollIntoView({ block: "start" });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-0.5">
        {ALPHABET.map((letter) => {
          const has = availableLetters.has(letter);
          return (
            <button
              key={letter}
              type="button"
              disabled={!has}
              onClick={() => jumpTo(letter)}
              className={`h-6 w-6 rounded text-[11px] font-bold transition-colors ${
                has
                  ? "text-espresso-dark hover:bg-copper-light/25 cursor-pointer"
                  : "text-cocoa/25 cursor-default"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div ref={listRef} className="max-h-56 overflow-y-auto rounded-xl border border-copper/20 bg-parchment/60">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-copper-light/15 ${
            value === "all" ? "bg-copper-light/25 font-semibold text-espresso-dark" : "text-espresso"
          }`}
        >
          Любой автор
        </button>
        {Array.from(groups.entries()).map(([letter, names]) => (
          <div key={letter} data-letter={letter}>
            <div className="sticky top-0 bg-parchment px-3 py-0.5 text-[11px] font-bold text-cocoa/60 border-y border-copper/10">
              {letter}
            </div>
            {names.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onChange(name)}
                className={`block w-full truncate px-3 py-1.5 text-left text-sm hover:bg-copper-light/15 ${
                  value === name ? "bg-copper-light/25 font-semibold text-espresso-dark" : "text-espresso"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const ALPHABET = [
  "А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П",
  "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Э", "Ю", "Я",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P",
  "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "#",
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-wide text-cocoa/60 mb-1">{children}</div>;
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-espresso cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-terracotta"
      />
      {label}
    </label>
  );
}
