"use client";

import { useEffect, useState } from "react";
import { deleteBookNote, insertBookNote, listBookNotes, updateBookNote } from "@/lib/api";
import { BookNote } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function NotesTab({ bookId }: { bookId: string }) {
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<BookNote | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await listBookNotes(bookId);
    if (error) setError(error.message);
    else setNotes((data as BookNote[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch when book changes
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  function openNew() {
    setTitle("");
    setContent("");
    setEditing("new");
  }

  function openEdit(note: BookNote) {
    setTitle(note.title ?? "");
    setContent(note.content);
    setEditing(note);
  }

  function closeEditor() {
    setEditing(null);
    setTitle("");
    setContent("");
  }

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editing === "new") {
        const { data, error } = await insertBookNote(bookId, title.trim() || null, content.trim());
        if (error) {
          setError(error.message);
          return;
        }
        if (data) setNotes((prev) => [data as BookNote, ...prev]);
      } else if (editing) {
        const { data, error } = await updateBookNote(editing.id, title.trim() || null, content.trim());
        if (error) {
          setError(error.message);
          return;
        }
        if (data) setNotes((prev) => prev.map((n) => (n.id === editing.id ? (data as BookNote) : n)));
      }
      closeEditor();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    const { error } = await deleteBookNote(id);
    if (error) setError(error.message);
    if (editing !== "new" && editing?.id === id) closeEditor();
  }

  if (editing) {
    return (
      <div className="space-y-3">
        {error && (
          <div className="rounded-xl border border-terracotta-dark/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta-dark">
            {error}
          </div>
        )}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок (необязательно)"
          className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm font-bold text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
        />
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Впечатление, цитата, мысль..."
          rows={10}
          className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
        />
        {editing !== "new" && (
          <div className="text-[11px] text-cocoa/50">
            Создано {formatDate(editing.created_at)}
            {editing.updated_at !== editing.created_at && ` · изменено ${formatDate(editing.updated_at)}`}
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          {editing !== "new" ? (
            <button
              type="button"
              onClick={() => handleDelete(editing.id)}
              className="text-sm font-semibold text-terracotta-dark/80 hover:text-terracotta-dark"
            >
              Удалить
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeEditor}
              className="rounded-full bg-cream-dark px-3.5 py-1.5 text-xs font-semibold text-espresso hover:bg-cream-dark/80"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="rounded-full bg-sage text-cream px-4 py-1.5 text-sm font-bold shadow hover:brightness-105 disabled:opacity-60"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-terracotta-dark/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta-dark">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={openNew}
        className="w-full rounded-full bg-terracotta text-cream px-3.5 py-2 text-sm font-bold shadow hover:brightness-105"
      >
        + Добавить заметку
      </button>

      {loading ? (
        <p className="text-sm text-cocoa/60 py-6 text-center">Загрузка заметок...</p>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-copper/25 bg-cream/40 py-8 px-6 text-center space-y-3">
          <p className="text-sm text-cocoa/60 italic">Заметок по этой книге пока нет</p>
          <button
            type="button"
            onClick={openNew}
            className="rounded-full bg-sage text-cream px-4 py-1.5 text-sm font-bold shadow hover:brightness-105"
          >
            Добавить первую заметку
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => openEdit(note)}
              className="rounded-lg border border-copper/20 bg-cream/50 p-3 cursor-pointer hover:bg-cream-dark/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {note.title && (
                    <div className="text-sm font-bold text-espresso truncate">{note.title}</div>
                  )}
                  <p className="text-sm text-espresso/80 line-clamp-3 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="text-[11px] text-cocoa/50 mt-1">
                    {formatDate(note.updated_at ?? note.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(note);
                    }}
                    title="Редактировать"
                    className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-cream-dark/60 text-cocoa/70"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                    title="Удалить"
                    className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-terracotta/20 text-terracotta-dark/80"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
