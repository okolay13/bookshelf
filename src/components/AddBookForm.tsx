"use client";

import { useMemo, useRef, useState } from "react";
import { Book, BookStatus, DEFAULT_NEW_BOOK_STATUS, NewBook, STATUS_LABEL } from "@/lib/types";
import { parseBulkText } from "@/lib/parseBulk";
import { TitleAutocomplete } from "./TitleAutocomplete";
import { coverUrl, TitleSuggestion } from "@/lib/openLibrary";
import { Genre } from "@/lib/genres";
import { ImagePicker } from "./ImagePicker";
import { generateAndUploadSpine } from "@/lib/spineGen";
import { EmojiFeedbackModal } from "./EmojiFeedbackModal";

type Mode = "single" | "bulk";

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

function emptyExtras() {
  return {
    format: "paper" as const,
    emoji_tag: null,
    mood_tags: null,
    progress_percent: null,
    spine_width: null,
    is_favorite: false,
    language: null,
    publication_year: null,
    user_id: null,
  };
}

export function AddBookForm({
  onClose,
  onAddOne,
  onAddMany,
  onUpdateBook,
  defaultShelf,
  defaultStatus,
  genres,
}: {
  onClose: () => void;
  onAddOne: (book: NewBook) => Promise<Book | null>;
  onAddMany: (books: NewBook[]) => Promise<void>;
  onUpdateBook: (book: Book) => Promise<void>;
  defaultShelf?: string;
  defaultStatus?: BookStatus;
  genres: string[];
}) {
  const [mode, setMode] = useState<Mode>("single");
  const [saving, setSaving] = useState(false);
  const [expectationsPromptBook, setExpectationsPromptBook] = useState<Book | null>(null);
  const submittingRef = useRef(false);

  // single
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrlState, setCoverUrlState] = useState<string | null>(null);
  const [spineUrlState, setSpineUrlState] = useState<string | null>(null);
  const [spineErrorState, setSpineErrorState] = useState<string | null>(null);
  const [genre, setGenre] = useState<Genre>(genres[genres.length - 1] ?? "Другое");
  const [shelf, setShelf] = useState(defaultShelf ?? "");
  const [status, setStatus] = useState<BookStatus>(defaultStatus ?? DEFAULT_NEW_BOOK_STATUS);
  const now = new Date();
  const [readYear, setReadYear] = useState(now.getFullYear());
  const [readMonth, setReadMonth] = useState(now.getMonth() + 1);

  // bulk
  const [bulkText, setBulkText] = useState("");
  const [bulkShelf, setBulkShelf] = useState(defaultShelf ?? "");
  const [bulkStatus, setBulkStatus] = useState<BookStatus>(defaultStatus ?? DEFAULT_NEW_BOOK_STATUS);
  const [bulkGenre, setBulkGenre] = useState<Genre>(genres[genres.length - 1] ?? "Другое");

  const parsed = useMemo(() => parseBulkText(bulkText), [bulkText]);
  const validCount = parsed.filter((p) => p.valid).length;

  function handlePickSuggestion(s: TitleSuggestion) {
    setTitle(s.title);
    if (s.author) setAuthor(s.author);
    if (s.genre) setGenre(s.genre);
    if (s.coverId) handleCoverChange(coverUrl(s.coverId, "M"));
  }

  function handleCoverChange(url: string | null) {
    setCoverUrlState(url);
    setSpineUrlState(null);
    setSpineErrorState(null);
    if (url) {
      void generateAndUploadSpine(url).then((result) => {
        if (result.url) setSpineUrlState(result.url);
        else setSpineErrorState(result.error ?? "неизвестная ошибка");
      });
    }
  }

  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || !title.trim() || !author.trim()) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      const saved = await onAddOne({
        title: title.trim(),
        author: author.trim(),
        shelf: shelf.trim() || null,
        status,
        rating: null,
        cover_url: coverUrlState,
        genre,
        spine_image_url: spineUrlState,
        notes: null,
        started_at: status === "reading" ? new Date().toISOString().slice(0, 10) : null,
        finished_at: status === "finished" ? `${readYear}-${String(readMonth).padStart(2, "0")}` : null,
        ...emptyExtras(),
      });
      if (saved && status === "to_read") {
        setExpectationsPromptBook(saved);
      } else {
        onClose();
      }
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  }

  async function handleBulkSubmit() {
    if (submittingRef.current) return;
    const valid = parsed.filter((p) => p.valid);
    if (valid.length === 0) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      await onAddMany(
        valid.map((p) => ({
          title: p.title,
          author: p.author,
          shelf: bulkShelf.trim() || null,
          status: bulkStatus,
          rating: null,
          cover_url: null,
          genre: bulkGenre,
          spine_image_url: null,
          notes: null,
          started_at: bulkStatus === "reading" ? new Date().toISOString().slice(0, 10) : null,
          finished_at: bulkStatus === "finished" ? new Date().toISOString().slice(0, 10) : null,
          ...emptyExtras(),
        }))
      );
      onClose();
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso-dark/60 backdrop-blur-sm fade-in p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-parchment shadow-2xl border border-copper/20"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-parchment/95 backdrop-blur px-5 py-3 border-b border-copper/15">
          <h2 className="display text-2xl text-espresso-dark">Добавить книгу</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full text-cocoa hover:bg-cream-dark transition-colors"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <div className="inline-flex items-center gap-1 rounded-full bg-cream-dark/50 p-1 mb-4">
            <button
              onClick={() => setMode("single")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                mode === "single" ? "bg-terracotta text-cream shadow" : "text-espresso/70"
              }`}
            >
              Одна книга
            </button>
            <button
              onClick={() => setMode("bulk")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                mode === "bulk" ? "bg-terracotta text-cream shadow" : "text-espresso/70"
              }`}
            >
              Список
            </button>
          </div>

          {mode === "single" ? (
            <form onSubmit={handleSingleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                  Название
                </label>
                <TitleAutocomplete
                  value={title}
                  onChange={(v) => {
                    setTitle(v);
                    setCoverUrlState(null);
                  }}
                  onPick={handlePickSuggestion}
                  placeholder="Мастер и Маргарита"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                  Автор
                </label>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  placeholder="Михаил Булгаков"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                  Обложка
                </label>
                <div className="w-24">
                  <ImagePicker
                    value={coverUrlState}
                    onChange={handleCoverChange}
                    kind="cover"
                    label="Обложка"
                  />
                </div>
                {coverUrlState && !spineErrorState && (
                  <p className="text-xs text-cocoa/60 mt-1">
                    {spineUrlState ? "Корешок для полки сгенерирован из обложки." : "Генерируем корешок из обложки..."}
                  </p>
                )}
                {spineErrorState && (
                  <p className="text-xs text-terracotta mt-1">
                    Не получилось сгенерировать корешок: {spineErrorState}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                  Жанр {genre && <span className="normal-case font-normal text-cocoa/50">(предложено, можно изменить)</span>}
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as Genre)}
                  required
                  className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                    Полка
                  </label>
                  <input
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                    placeholder="Классика"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                    Статус
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BookStatus)}
                    className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  >
                    {(Object.keys(STATUS_LABEL) as BookStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {status === "finished" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                      Год прочтения
                    </label>
                    <input
                      type="number"
                      value={readYear}
                      onChange={(e) => setReadYear(Number(e.target.value))}
                      className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                      Месяц прочтения
                    </label>
                    <select
                      value={readMonth}
                      onChange={(e) => setReadMonth(Number(e.target.value))}
                      className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                    >
                      {MONTH_NAMES.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={saving || !title.trim() || !author.trim()}
                className="w-full rounded-full bg-sage text-cream py-2.5 text-sm font-bold shadow hover:brightness-105 disabled:opacity-50"
              >
                {saving ? "Добавление..." : "Добавить книгу"}
              </button>
              <p className="text-xs text-cocoa/60 text-center">
                Остальные поля (формат, оценка, теги, заметки...) можно заполнить после
                добавления, открыв карточку книги.
              </p>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                  Список книг, по одной на строке
                </label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={7}
                  placeholder={"Михаил Булгаков — Мастер и Маргарита\nДжордж Оруэлл — 1984\nРэй Брэдбери — 451 градус по Фаренгейту"}
                  className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm font-mono text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
                />
                <p className="text-xs text-cocoa/60 mt-1">
                  Формат: «Автор — Название». {bulkText.trim() ? `${validCount} из ${parsed.length} строк распознано.` : ""}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                    Полка (для всех)
                  </label>
                  <input
                    value={bulkShelf}
                    onChange={(e) => setBulkShelf(e.target.value)}
                    className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                    placeholder="Классика"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                    Статус (для всех)
                  </label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as BookStatus)}
                    className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  >
                    {(Object.keys(STATUS_LABEL) as BookStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                    Жанр (для всех)
                  </label>
                  <select
                    value={bulkGenre}
                    onChange={(e) => setBulkGenre(e.target.value as Genre)}
                    className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {parsed.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-lg border border-copper/15 bg-cream/40 p-2 space-y-1">
                  {parsed.map((p, i) => (
                    <div
                      key={i}
                      className={`text-xs flex items-center gap-1.5 ${
                        p.valid ? "text-espresso/80" : "text-terracotta-dark"
                      }`}
                    >
                      <span>{p.valid ? "✓" : "⚠"}</span>
                      {p.valid ? (
                        <span>
                          <b>{p.title}</b> — {p.author}
                        </span>
                      ) : (
                        <span>Не удалось разобрать: «{p.raw}»</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleBulkSubmit}
                disabled={saving || validCount === 0}
                className="w-full rounded-full bg-sage text-cream py-2.5 text-sm font-bold shadow hover:brightness-105 disabled:opacity-50"
              >
                {saving ? "Добавление..." : `Добавить ${validCount || ""} книг`}
              </button>
            </div>
          )}
        </div>
      </div>

      {expectationsPromptBook && (
        <EmojiFeedbackModal
          title="Какие ощущения вы ожидаете от этой книги?"
          subtitle="Выберите до 5 эмодзи. Это поможет потом подобрать книгу под ваше настроение. Позже вы сможете изменить их в любой момент."
          initialTags={expectationsPromptBook.emoji_tag}
          confirmLabel="Выбрать"
          dismissLabel="Пропустить"
          onDismiss={onClose}
          onConfirm={async (next) => {
            await onUpdateBook({ ...expectationsPromptBook, emoji_tag: next });
            onClose();
          }}
        />
      )}
    </div>
  );
}
