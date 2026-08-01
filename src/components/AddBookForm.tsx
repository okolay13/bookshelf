"use client";

import { useMemo, useState } from "react";
import { BookStatus, NewBook, STATUS_LABEL } from "@/lib/types";
import { parseBulkText } from "@/lib/parseBulk";

type Mode = "single" | "bulk";

export function AddBookForm({
  onClose,
  onAddOne,
  onAddMany,
  defaultShelf,
}: {
  onClose: () => void;
  onAddOne: (book: NewBook) => Promise<void>;
  onAddMany: (books: NewBook[]) => Promise<void>;
  defaultShelf?: string;
}) {
  const [mode, setMode] = useState<Mode>("single");
  const [saving, setSaving] = useState(false);

  // single
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [shelf, setShelf] = useState(defaultShelf ?? "");
  const [status, setStatus] = useState<BookStatus>("to_read");

  // bulk
  const [bulkText, setBulkText] = useState("");
  const [bulkShelf, setBulkShelf] = useState(defaultShelf ?? "");
  const [bulkStatus, setBulkStatus] = useState<BookStatus>("to_read");

  const parsed = useMemo(() => parseBulkText(bulkText), [bulkText]);
  const validCount = parsed.filter((p) => p.valid).length;

  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    setSaving(true);
    try {
      await onAddOne({
        title: title.trim(),
        author: author.trim(),
        shelf: shelf.trim() || null,
        status,
        rating: null,
        cover_url: null,
        notes: null,
        started_at: status === "reading" ? new Date().toISOString().slice(0, 10) : null,
        finished_at: null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkSubmit() {
    const valid = parsed.filter((p) => p.valid);
    if (valid.length === 0) return;
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
          notes: null,
          started_at: bulkStatus === "reading" ? new Date().toISOString().slice(0, 10) : null,
          finished_at: null,
        }))
      );
      onClose();
    } finally {
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
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  placeholder="Мастер и Маргарита"
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
                  className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  placeholder="Михаил Булгаков"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1 block">
                    Полка
                  </label>
                  <input
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
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
                    className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  >
                    {(Object.keys(STATUS_LABEL) as BookStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={saving || !title.trim() || !author.trim()}
                className="w-full rounded-full bg-sage text-cream py-2.5 text-sm font-bold shadow hover:brightness-105 disabled:opacity-50"
              >
                {saving ? "Добавление..." : "Добавить книгу"}
              </button>
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
                  className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
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
                    className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
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
                    className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  >
                    {(Object.keys(STATUS_LABEL) as BookStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
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
    </div>
  );
}
