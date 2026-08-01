"use client";

import { useEffect, useState } from "react";
import { Book, BookStatus, STATUS_LABEL, STATUS_ORDER } from "@/lib/types";
import { StarRating } from "./StarRating";
import { spineStyle } from "@/lib/bookVisuals";

export function BookModal({
  book,
  onClose,
  onSave,
  onDelete,
}: {
  book: Book;
  onClose: () => void;
  onSave: (updated: Book) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Book>(book);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const s = spineStyle(book.id || book.title + book.author);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
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
    setDraft(updated);
    setSaving(true);
    try {
      await onSave(updated);
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
          <span className="text-xs uppercase tracking-wide text-cocoa/60 font-bold">
            {editing ? "Редактирование" : "Книга"}
          </span>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full text-cocoa hover:bg-cream-dark transition-colors"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex gap-4">
            <div
              className="flex-shrink-0 w-20 h-28 rounded-md shadow-md flex items-center justify-center overflow-hidden"
              style={{ background: `linear-gradient(160deg, ${s.edge}, ${s.bg})` }}
            >
              {draft.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.cover_url}
                  alt={draft.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl" style={{ color: s.text }}>
                  📖
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="Название"
                    className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  />
                  <input
                    value={draft.author}
                    onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                    placeholder="Автор"
                    className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  />
                </div>
              ) : (
                <>
                  <h2 className="display text-3xl leading-tight text-espresso-dark">
                    {draft.title}
                  </h2>
                  <p className="text-cocoa/80 text-sm mt-0.5">{draft.author}</p>
                </>
              )}
              <div className="mt-2">
                <StarRating
                  value={draft.rating}
                  onChange={(v) => {
                    const updated = { ...draft, rating: v };
                    setDraft(updated);
                    if (!editing) onSave(updated);
                  }}
                />
              </div>
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

          {/* Shelf */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
              Полка
            </div>
            {editing ? (
              <input
                value={draft.shelf ?? ""}
                onChange={(e) => setDraft({ ...draft, shelf: e.target.value })}
                placeholder="Например: Фантастика"
                className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            ) : (
              <span className="inline-block rounded-full bg-cream-dark/70 px-3 py-1 text-xs text-cocoa">
                {draft.shelf || "Без полки"}
              </span>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
                Начато
              </div>
              {editing ? (
                <input
                  type="date"
                  value={draft.started_at ?? ""}
                  onChange={(e) => setDraft({ ...draft, started_at: e.target.value || null })}
                  className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              ) : (
                <span className="text-sm text-espresso/80">
                  {draft.started_at || "—"}
                </span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
                Закончено
              </div>
              {editing ? (
                <input
                  type="date"
                  value={draft.finished_at ?? ""}
                  onChange={(e) => setDraft({ ...draft, finished_at: e.target.value || null })}
                  className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              ) : (
                <span className="text-sm text-espresso/80">
                  {draft.finished_at || "—"}
                </span>
              )}
            </div>
          </div>

          {/* Cover url (edit only) */}
          {editing && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
                Ссылка на обложку
              </div>
              <input
                value={draft.cover_url ?? ""}
                onChange={(e) => setDraft({ ...draft, cover_url: e.target.value || null })}
                placeholder="https://..."
                className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 mb-1.5">
              Заметки
            </div>
            {editing ? (
              <textarea
                value={draft.notes ?? ""}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value || null })}
                rows={4}
                placeholder="Впечатления, цитаты, мысли..."
                className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
              />
            ) : (
              <p className="text-sm text-espresso/80 whitespace-pre-wrap">
                {draft.notes || "Заметок пока нет."}
              </p>
            )}
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

            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      setDraft(book);
                      setEditing(false);
                    }}
                    className="rounded-full px-4 py-1.5 text-sm font-semibold text-espresso/70 hover:bg-cream-dark/60"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full bg-sage text-cream px-4 py-1.5 text-sm font-bold shadow hover:brightness-105 disabled:opacity-60"
                  >
                    {saving ? "Сохранение..." : "Сохранить"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-full bg-terracotta text-cream px-4 py-1.5 text-sm font-bold shadow hover:brightness-105"
                >
                  Редактировать
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
