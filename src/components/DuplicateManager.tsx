"use client";

import { useState } from "react";
import { Book, STATUS_LABEL } from "@/lib/types";
import { duplicateGroupKey, findDuplicateGroups } from "@/lib/duplicates";

export function DuplicateManager({
  books,
  onClose,
  onMerge,
  onDiscard,
}: {
  books: Book[];
  onClose: () => void;
  onMerge: (keepId: string, duplicateIds: string[]) => Promise<void>;
  onDiscard: (duplicateIds: string[]) => Promise<void>;
}) {
  const groups = findDuplicateGroups(books);
  const [keepByGroup, setKeepByGroup] = useState<Record<string, string>>({});
  const [busyGroup, setBusyGroup] = useState<string | null>(null);

  function keepIdFor(key: string, group: Book[]) {
    return keepByGroup[key] ?? group[group.length - 1].id;
  }

  async function handleMerge(key: string, group: Book[]) {
    const keepId = keepIdFor(key, group);
    const duplicateIds = group.map((b) => b.id).filter((id) => id !== keepId);
    setBusyGroup(key);
    try {
      await onMerge(keepId, duplicateIds);
    } finally {
      setBusyGroup(null);
    }
  }

  async function handleKeepOnly(key: string, group: Book[]) {
    const keepId = keepIdFor(key, group);
    const duplicateIds = group.map((b) => b.id).filter((id) => id !== keepId);
    setBusyGroup(key);
    try {
      await onDiscard(duplicateIds);
    } finally {
      setBusyGroup(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso-dark/60 backdrop-blur-sm fade-in p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in relative w-full sm:max-w-lg max-h-[85dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-parchment shadow-2xl border border-copper/20"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-parchment/95 backdrop-blur px-5 py-3 border-b border-copper/15">
          <h2 className="display text-xl text-espresso-dark">Дубликаты</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full text-cocoa hover:bg-cream-dark transition-colors"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {groups.length === 0 && (
            <p className="text-sm text-cocoa/60 text-center py-6">
              Дубликатов не найдено — все книги уникальны по названию и автору.
            </p>
          )}

          {groups.map((group) => {
            const key = duplicateGroupKey(group[0].title, group[0].author);
            const keepId = keepIdFor(key, group);
            const busy = busyGroup === key;
            return (
              <div key={key} className="rounded-xl border border-copper/15 bg-cream/40 p-3 space-y-2">
                <div className="text-sm font-semibold text-espresso truncate">
                  {group[0].title} <span className="text-cocoa/60 font-normal">— {group[0].author}</span>
                </div>

                <div className="space-y-1.5">
                  {group.map((b) => (
                    <label
                      key={b.id}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors ${
                        keepId === b.id ? "bg-terracotta/15" : "hover:bg-cream-dark/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`keep-${key}`}
                        checked={keepId === b.id}
                        onChange={() => setKeepByGroup((prev) => ({ ...prev, [key]: b.id }))}
                        className="accent-terracotta"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs text-cocoa/70">
                          {STATUS_LABEL[b.status]}
                          {b.finished_at ? ` · закончена ${b.finished_at}` : ""}
                        </span>
                        <span className="block text-[11px] text-cocoa/50">
                          добавлена {b.created_at ? new Date(b.created_at).toLocaleDateString("ru-RU") : "—"}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                <p className="text-[11px] text-cocoa/50">
                  Отмеченная запись останется. «Объединить» перенесёт на неё полки, заметки, цитаты и
                  мудборд остальных перед удалением. «Оставить только эту» удалит остальные записи со всеми
                  их данными.
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleKeepOnly(key, group)}
                    disabled={busy}
                    className="flex-1 rounded-full bg-cream-dark px-3 py-1.5 text-xs font-semibold text-espresso disabled:opacity-50"
                  >
                    Оставить только эту
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMerge(key, group)}
                    disabled={busy}
                    className="flex-1 rounded-full bg-sage text-cream px-3 py-1.5 text-xs font-bold shadow hover:brightness-105 disabled:opacity-50"
                  >
                    {busy ? "..." : "Объединить"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
