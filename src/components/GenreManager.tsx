"use client";

import { useState } from "react";
import { Book, GenreEntity, UNGENRED } from "@/lib/types";
import { GenreBookPicker } from "./GenreBookPicker";

export function GenreManager({
  genres,
  books,
  onClose,
  onCreateGenre,
  onDeleteGenre,
  onAssignBooks,
}: {
  genres: GenreEntity[];
  books: Book[];
  onClose: () => void;
  onCreateGenre: (name: string) => Promise<GenreEntity | null>;
  onDeleteGenre: (genre: GenreEntity, reassignTo: string | null) => Promise<void>;
  onAssignBooks: (bookIds: string[], genreName: string) => Promise<void>;
}) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [pickerFor, setPickerFor] = useState<GenreEntity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GenreEntity | null>(null);
  const [reassignTo, setReassignTo] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  const bookCount = (name: string) => books.filter((b) => b.genre === name).length;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const created = await onCreateGenre(name);
      setNewName("");
      if (created) setPickerFor(created);
    } finally {
      setCreating(false);
    }
  }

  function startDelete(genre: GenreEntity) {
    setDeleteTarget(genre);
    setReassignTo("");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDeleteGenre(deleteTarget, reassignTo || null);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso-dark/60 backdrop-blur-sm fade-in p-0 sm:p-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="pop-in relative w-full sm:max-w-sm max-h-[85dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-parchment shadow-2xl border border-copper/20"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between bg-parchment/95 backdrop-blur px-5 py-3 border-b border-copper/15">
            <h2 className="display text-xl text-espresso-dark">Жанры</h2>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full text-cocoa hover:bg-cream-dark transition-colors"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-2">
            {genres.map((g) => (
              <div key={g.id} className="rounded-lg border border-copper/15 bg-cream/40">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-espresso truncate">{g.name}</div>
                    <div className="text-xs text-cocoa/50">{bookCount(g.name)} книг</div>
                  </div>
                  {deleteTarget?.id !== g.id && (
                    <button
                      type="button"
                      onClick={() => startDelete(g)}
                      className="flex-shrink-0 opacity-60 hover:opacity-100 px-1.5 text-cocoa"
                      aria-label={`Удалить жанр ${g.name}`}
                      title="Удалить"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {deleteTarget?.id === g.id && (
                  <div className="px-3 pb-3 space-y-2 border-t border-copper/10 pt-2">
                    <p className="text-xs text-cocoa/70">
                      Куда перенести книги жанра «{g.name}»?
                    </p>
                    <select
                      value={reassignTo}
                      onChange={(e) => setReassignTo(e.target.value)}
                      className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                    >
                      <option value="">{UNGENRED} (без жанра)</option>
                      {genres
                        .filter((other) => other.id !== g.id)
                        .map((other) => (
                          <option key={other.id} value={other.name}>
                            {other.name}
                          </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(null)}
                        className="rounded-full bg-cream-dark px-3.5 py-1.5 text-xs font-semibold text-espresso"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={confirmDelete}
                        disabled={deleting}
                        className="flex-1 rounded-full bg-terracotta-dark text-cream py-1.5 text-xs font-bold shadow hover:brightness-105 disabled:opacity-50"
                      >
                        {deleting ? "Удаление..." : "Удалить жанр"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <form onSubmit={handleCreate} className="flex gap-2 pt-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Новый жанр"
                className="flex-1 min-w-0 rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="rounded-full bg-sage text-cream px-4 py-2 text-sm font-bold shadow hover:brightness-105 disabled:opacity-50"
              >
                {creating ? "..." : "+ Добавить"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {pickerFor && (
        <GenreBookPicker
          genreName={pickerFor.name}
          books={books}
          onClose={() => setPickerFor(null)}
          onConfirm={(bookIds) => onAssignBooks(bookIds, pickerFor.name)}
        />
      )}
    </>
  );
}
