"use client";

import { useEffect, useRef, useState } from "react";
import { Book, BookStatus, LANGUAGE_OPTIONS, Shelf, STATUS_LABEL, STATUS_ORDER } from "@/lib/types";
import { CreateShelfForm } from "./CreateShelfForm";
import { StarRating } from "./StarRating";
import { spineStyle } from "@/lib/bookVisuals";
import { FormatSwitcher } from "./FormatSwitcher";
import { EmojiPicker } from "./EmojiPicker";
import { EmojiFeedbackModal } from "./EmojiFeedbackModal";
import { MoodTagInput } from "./MoodTagInput";
import { CoverPicker } from "./CoverPicker";
import { ImagePicker } from "./ImagePicker";
import { SpineCropPicker } from "./SpineCropPicker";
import { MoodboardTab } from "./MoodboardTab";
import { NotesTab } from "./NotesTab";
import { QuotesTab } from "./QuotesTab";
import { suggestGenre } from "@/lib/openLibrary";
import { generateAndUploadSpine } from "@/lib/spineGen";
import { isMonthOnly } from "@/lib/flexibleDate";

type Tab = "data" | "moodboard" | "notes" | "quotes";

const SPINE_WIDTH_STEPS = [
  { value: 24, label: "XS" },
  { value: 32, label: "S" },
  { value: 40, label: "M" },
  { value: 56, label: "L" },
  { value: 72, label: "XL" },
];

export function BookModal({
  book,
  onClose,
  onSave,
  onDelete,
  moodSuggestions,
  userShelves,
  wantToReadShelf,
  bookShelves,
  onAddShelf,
  onRemoveShelf,
  onCreateShelfForBook,
  genres,
}: {
  book: Book;
  onClose: () => void;
  onSave: (updated: Book) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  moodSuggestions: string[];
  userShelves: Shelf[];
  wantToReadShelf?: Shelf;
  bookShelves: string[];
  onAddShelf: (bookId: string, shelfName: string) => Promise<void>;
  onRemoveShelf: (bookId: string, shelfName: string) => Promise<void>;
  onCreateShelfForBook: (bookId: string, name: string, color: string) => Promise<void>;
  genres: string[];
}) {
  const [draft, setDraft] = useState<Book>(book);
  const [tab, setTab] = useState<Tab>("data");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [suggestingGenre, setSuggestingGenre] = useState(false);
  const [generatingSpine, setGeneratingSpine] = useState(false);
  const [spineError, setSpineError] = useState<string | null>(null);
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [finishedPromptBook, setFinishedPromptBook] = useState<Book | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (book.cover_url && !book.spine_image_url) {
      void generateSpineFromCover(book.cover_url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount for the initially loaded book
  }, []);

  const s = spineStyle(book.id || book.title + book.author, { width: draft.spine_width });

  async function persist(next: Book) {
    setSaving(true);
    try {
      await onSave(next);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status: BookStatus) {
    const updated: Book = {
      ...draft,
      status,
      started_at:
        status === "reading" && !draft.started_at
          ? new Date().toISOString().slice(0, 10)
          : draft.started_at,
      finished_at:
        status === "finished"
          ? draft.finished_at ?? new Date().toISOString().slice(0, 10)
          : draft.finished_at,
    };
    const enteringFinished = status === "finished" && draft.status !== "finished";
    setDraft(updated);
    await persist(updated);
    if (enteringFinished) setFinishedPromptBook(updated);
  }

  // Remembers the status to fall back to when the "Хочу прочитать" checkbox
  // in the shelves list is unticked, since status is single-select.
  const previousStatusRef = useRef<BookStatus>(book.status === "to_read" ? "reading" : book.status);

  async function handleToggleWantToRead(checked: boolean) {
    if (checked) {
      if (draft.status !== "to_read") previousStatusRef.current = draft.status;
      await handleStatusChange("to_read");
    } else {
      await handleStatusChange(previousStatusRef.current);
    }
  }

  function field<K extends keyof Book>(key: K, value: Book[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSuggestGenre() {
    setSuggestingGenre(true);
    try {
      const genre = await suggestGenre(draft.title, draft.author);
      if (genre) field("genre", genre);
    } finally {
      setSuggestingGenre(false);
    }
  }

  async function generateSpineFromCover(coverUrl: string, cropX = 0.5, cropY = 0.5) {
    setGeneratingSpine(true);
    setSpineError(null);
    try {
      const result = await generateAndUploadSpine(coverUrl, cropX, cropY);
      if (result.url) {
        const next = { ...draft, cover_url: coverUrl, spine_image_url: result.url };
        setDraft(next);
        await persist(next);
        setShowCropPicker(false);
      } else {
        setSpineError(result.error ?? "неизвестная ошибка");
      }
    } finally {
      setGeneratingSpine(false);
    }
  }

  function handleGenerateSpine() {
    if (!draft.cover_url) return;
    void generateSpineFromCover(draft.cover_url);
  }

  function handleCoverChange(url: string | null) {
    field("cover_url", url);
    field("spine_image_url", null);
    if (url) void generateSpineFromCover(url);
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
        <div className="sticky top-0 z-10 bg-parchment/95 backdrop-blur border-b border-copper/15">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-xs uppercase tracking-wide text-cocoa/60 font-bold">
              Книга {saving && "· сохранение..."}
            </span>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full text-cocoa hover:bg-cream-dark transition-colors"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
          <div className="flex px-5 gap-1 pb-2">
            <button
              onClick={() => setTab("data")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                tab === "data" ? "bg-terracotta text-cream shadow" : "text-espresso/70"
              }`}
            >
              Данные
            </button>
            <button
              onClick={() => setTab("moodboard")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                tab === "moodboard" ? "bg-terracotta text-cream shadow" : "text-espresso/70"
              }`}
            >
              Мудборд
            </button>
            <button
              onClick={() => setTab("notes")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                tab === "notes" ? "bg-terracotta text-cream shadow" : "text-espresso/70"
              }`}
            >
              Заметки
            </button>
            <button
              onClick={() => setTab("quotes")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                tab === "quotes" ? "bg-terracotta text-cream shadow" : "text-espresso/70"
              }`}
            >
              💬 Цитаты
            </button>
          </div>
        </div>

        {tab === "moodboard" ? (
          <div className="p-5">
            <MoodboardTab bookId={book.id} />
          </div>
        ) : tab === "notes" ? (
          <div className="p-5">
            <NotesTab bookId={book.id} />
          </div>
        ) : tab === "quotes" ? (
          <div className="p-5">
            <QuotesTab bookId={book.id} />
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-20">
                <ImagePicker
                  value={draft.cover_url}
                  onChange={handleCoverChange}
                  kind="cover"
                  label="Обложка"
                />
                <button
                  type="button"
                  onClick={() => setShowCoverPicker(true)}
                  className="mt-1 text-[11px] font-semibold text-terracotta-dark hover:underline"
                >
                  Варианты обложек
                </button>
                {generatingSpine && (
                  <p className="text-[11px] text-cocoa/60 mt-1">Генерируем корешок...</p>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start gap-1.5">
                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      value={draft.title}
                      onChange={(e) => field("title", e.target.value)}
                      placeholder="Название"
                      className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm font-bold text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                    />
                    <input
                      value={draft.author}
                      onChange={(e) => field("author", e.target.value)}
                      placeholder="Автор"
                      className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft((prev) => ({ ...prev, title: prev.author, author: prev.title }));
                    }}
                    title="Поменять местами название и автора"
                    className="mt-1 h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full border border-copper/25 bg-cream/60 text-cocoa/70 hover:bg-cream-dark/60"
                  >
                    ⇅
                  </button>
                  <button
                    type="button"
                    onClick={() => field("is_favorite", !draft.is_favorite)}
                    title={draft.is_favorite ? "Убрать из избранного" : "Добавить в избранное"}
                    aria-pressed={draft.is_favorite}
                    className={`mt-1 h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full border transition-colors ${
                      draft.is_favorite
                        ? "border-copper-light bg-copper-light/25 text-copper-light"
                        : "border-copper/25 bg-cream/60 text-cocoa/50 hover:bg-cream-dark/60"
                    }`}
                  >
                    {draft.is_favorite ? "★" : "☆"}
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={draft.genre ?? "Другое"}
                    onChange={(e) => field("genre", e.target.value)}
                    required
                    className="flex-1 min-w-0 rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleSuggestGenre}
                    disabled={suggestingGenre || !draft.title.trim()}
                    title="Предложить жанр с Open Library"
                    className="flex-shrink-0 rounded-full border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-xs font-semibold text-cocoa/70 hover:bg-cream-dark/60 disabled:opacity-50"
                  >
                    {suggestingGenre ? "..." : "Предложить"}
                  </button>
                </div>
                <StarRating value={draft.rating} onChange={(v) => field("rating", v)} />
              </div>
            </div>

            {/* Quick status switch */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
                Статус
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_ORDER.map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    disabled={saving}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border ${
                      draft.status === st
                        ? "bg-sage text-cream border-sage-dark"
                        : "bg-cream/70 text-espresso/70 border-copper/20 hover:bg-cream-dark/60"
                    }`}
                  >
                    {STATUS_LABEL[st]}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
                Формат чтения
              </div>
              <FormatSwitcher value={draft.format} onChange={(v) => field("format", v)} />
            </div>

            {/* Language + publication year */}
            <div className="grid grid-cols-2 gap-3">
              <LanguageField value={draft.language} onChange={(v) => field("language", v)} />
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
                  Год издания
                </div>
                <input
                  type="number"
                  value={draft.publication_year ?? ""}
                  onChange={(e) => field("publication_year", e.target.value ? Number(e.target.value) : null)}
                  placeholder="2024"
                  className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </div>
            </div>

            {/* Progress, only while reading */}
            {draft.status === "reading" && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
                  Прогресс чтения: {draft.progress_percent ?? 0}%
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={draft.progress_percent ?? 0}
                  onChange={(e) => field("progress_percent", Number(e.target.value))}
                  className="w-full accent-terracotta"
                />
              </div>
            )}

            {/* Emoji + mood tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
                  Смайлик-тег
                </div>
                <EmojiPicker value={draft.emoji_tag} onChange={(v) => field("emoji_tag", v)} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
                  Настроение / темп
                </div>
                <MoodTagInput
                  value={draft.mood_tags ?? []}
                  onChange={(v) => field("mood_tags", v)}
                  suggestions={moodSuggestions}
                />
              </div>
            </div>

            {/* Shelves */}
            <ShelfMembership
              bookId={book.id}
              userShelves={userShelves}
              wantToReadShelf={wantToReadShelf}
              wantToReadChecked={draft.status === "to_read"}
              onToggleWantToRead={handleToggleWantToRead}
              bookShelves={bookShelves}
              onAddShelf={onAddShelf}
              onRemoveShelf={onRemoveShelf}
              onCreateShelfForBook={onCreateShelfForBook}
            />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <FlexibleDateField
                label="Начато"
                value={draft.started_at}
                onChange={(v) => field("started_at", v)}
              />
              <FlexibleDateField
                label="Закончено"
                value={draft.finished_at}
                onChange={(v) => field("finished_at", v)}
              />
            </div>

            {/* Spine customization */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
                Корешок на полке
              </div>
              <div className="flex gap-3">
                <div className="w-14 shrink-0">
                  <ImagePicker
                    value={draft.spine_image_url}
                    onChange={(url) => field("spine_image_url", url)}
                    kind="spine"
                    label="Корешок"
                    aspectClassName="aspect-[1/3]"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <label className="text-xs text-cocoa/70 mb-1 block">Толщина</label>
                    <div className="flex gap-1">
                      {SPINE_WIDTH_STEPS.map((step) => (
                        <button
                          key={step.value}
                          type="button"
                          onClick={() => field("spine_width", step.value)}
                          title={step.label}
                          className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors ${
                            (draft.spine_width ?? 32) === step.value
                              ? "border-terracotta bg-terracotta text-cream"
                              : "border-copper/25 bg-cream/60 text-cocoa/70 hover:bg-cream-dark/60"
                          }`}
                        >
                          {step.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateSpine}
                      disabled={generatingSpine || !draft.cover_url}
                      title="Сгенерировать корешок из обложки"
                      className="flex-1 rounded-full border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-xs font-semibold text-cocoa/70 hover:bg-cream-dark/60 disabled:opacity-50"
                    >
                      {generatingSpine ? "Генерация..." : "Из обложки"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCropPicker(true)}
                      disabled={generatingSpine || !draft.cover_url}
                      title="Выбрать участок обложки для корешка"
                      className="flex-1 rounded-full border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-xs font-semibold text-cocoa/70 hover:bg-cream-dark/60 disabled:opacity-50"
                    >
                      Выбрать участок
                    </button>
                  </div>
                  {spineError && (
                    <p className="text-xs text-terracotta">
                      Не получилось сгенерировать корешок: {spineError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-copper/15">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-terracotta-dark font-semibold">Удалить книгу?</span>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      await onDelete(book.id);
                    }}
                    disabled={saving}
                    className="rounded-full bg-terracotta-dark text-cream px-3 py-1.5 text-xs font-bold hover:brightness-110"
                  >
                    Да, удалить
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full bg-cream-dark px-3 py-1.5 text-xs font-semibold text-espresso"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm font-semibold text-terracotta-dark/80 hover:text-terracotta-dark"
                >
                  Удалить
                </button>
              )}

              <button
                onClick={() => persist(draft)}
                disabled={saving}
                className="rounded-full bg-sage text-cream px-4 py-1.5 text-sm font-bold shadow hover:brightness-105 disabled:opacity-60"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        )}
      </div>

      {showCoverPicker && (
        <CoverPicker
          title={draft.title}
          author={draft.author}
          onPick={handleCoverChange}
          onClose={() => setShowCoverPicker(false)}
        />
      )}

      {showCropPicker && draft.cover_url && (
        <SpineCropPicker
          coverUrl={draft.cover_url}
          generating={generatingSpine}
          onPick={(cropX, cropY) => void generateSpineFromCover(draft.cover_url as string, cropX, cropY)}
          onClose={() => setShowCropPicker(false)}
        />
      )}

      {finishedPromptBook && (
        <EmojiFeedbackModal
          title="Совпали ли ваши ожидания?"
          initialTags={finishedPromptBook.emoji_tag}
          confirmLabel="Сохранить"
          dismissLabel="Оставить как есть"
          onDismiss={() => setFinishedPromptBook(null)}
          onConfirm={async (next) => {
            const updated = { ...finishedPromptBook, emoji_tag: next };
            setDraft(updated);
            await persist(updated);
            setFinishedPromptBook(null);
          }}
        />
      )}
    </div>
  );
}

function LanguageField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const isKnown = !value || LANGUAGE_OPTIONS.includes(value);
  const [custom, setCustom] = useState(!isKnown);

  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
        Язык
      </div>
      {custom ? (
        <div className="flex items-center gap-1.5">
          <input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value.trim() ? e.target.value : null)}
            placeholder="Свой вариант"
            autoFocus
            className="w-full min-w-0 rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
          <button
            type="button"
            onClick={() => {
              setCustom(false);
              onChange(null);
            }}
            title="Выбрать из списка"
            className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full border border-copper/25 bg-cream/60 text-cocoa/70 hover:bg-cream-dark/60"
          >
            ✕
          </button>
        </div>
      ) : (
        <select
          value={value ?? ""}
          onChange={(e) => {
            if (e.target.value === "__custom") {
              setCustom(true);
              onChange(null);
            } else {
              onChange(e.target.value || null);
            }
          }}
          className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
        >
          <option value="">Не указан</option>
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
          <option value="__custom">Другой...</option>
        </select>
      )}
    </div>
  );
}

function FlexibleDateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [monthPreferred, setMonthPreferred] = useState(false);
  const monthOnly = value ? isMonthOnly(value) : monthPreferred;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60">{label}</div>
        <label className="flex items-center gap-1 text-[11px] text-cocoa/60 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={monthOnly}
            onChange={(e) => {
              if (value) {
                onChange(e.target.checked ? value.slice(0, 7) : `${value}-01`);
              }
              setMonthPreferred(e.target.checked);
            }}
            className="accent-terracotta"
          />
          только месяц
        </label>
      </div>
      <input
        type={monthOnly ? "month" : "date"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
      />
    </div>
  );
}

function ShelfMembership({
  bookId,
  userShelves,
  wantToReadShelf,
  wantToReadChecked,
  onToggleWantToRead,
  bookShelves,
  onAddShelf,
  onRemoveShelf,
  onCreateShelfForBook,
}: {
  bookId: string;
  userShelves: Shelf[];
  wantToReadShelf?: Shelf;
  wantToReadChecked: boolean;
  onToggleWantToRead: (checked: boolean) => Promise<void>;
  bookShelves: string[];
  onAddShelf: (bookId: string, shelfName: string) => Promise<void>;
  onRemoveShelf: (bookId: string, shelfName: string) => Promise<void>;
  onCreateShelfForBook: (bookId: string, name: string, color: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [wantToReadBusy, setWantToReadBusy] = useState(false);
  const [creating, setCreating] = useState(false);

  async function handleToggle(name: string, checked: boolean) {
    setBusy(name);
    try {
      await (checked ? onAddShelf(bookId, name) : onRemoveShelf(bookId, name));
    } finally {
      setBusy(null);
    }
  }

  async function handleToggleWantToRead(checked: boolean) {
    setWantToReadBusy(true);
    try {
      await onToggleWantToRead(checked);
    } finally {
      setWantToReadBusy(false);
    }
  }

  async function handleCreate(name: string, color: string) {
    await onCreateShelfForBook(bookId, name, color);
    setCreating(false);
  }

  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
        Мои полки
      </div>

      {userShelves.length === 0 && !wantToReadShelf && !creating && (
        <p className="text-sm text-cocoa/60 italic mb-1.5">
          Пока нет ни одной своей полки.
        </p>
      )}

      <div className="space-y-1">
        {wantToReadShelf && (
          <label className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm text-espresso hover:bg-cream-dark/40 cursor-pointer">
            <input
              type="checkbox"
              checked={wantToReadChecked}
              disabled={wantToReadBusy}
              onChange={(e) => handleToggleWantToRead(e.target.checked)}
              className="h-4 w-4 accent-terracotta"
            />
            <span
              className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ background: wantToReadShelf.color ?? "#4f7a45" }}
            />
            <span className="truncate">{wantToReadShelf.name}</span>
          </label>
        )}
        {userShelves.map((shelf) => {
          const checked = bookShelves.includes(shelf.name);
          return (
            <label
              key={shelf.id}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm text-espresso hover:bg-cream-dark/40 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={busy === shelf.name}
                onChange={(e) => handleToggle(shelf.name, e.target.checked)}
                className="h-4 w-4 accent-terracotta"
              />
              <span
                className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ background: shelf.color ?? "#4f7a45" }}
              />
              <span className="truncate">{shelf.name}</span>
            </label>
          );
        })}
      </div>

      {creating ? (
        <div className="mt-2 rounded-xl border border-copper/20 bg-cream/40 p-3">
          <CreateShelfForm onCancel={() => setCreating(false)} onCreate={handleCreate} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="mt-1.5 text-xs font-semibold text-cocoa/70 hover:text-espresso px-1.5"
        >
          + Создать новую полку
        </button>
      )}
    </div>
  );
}
