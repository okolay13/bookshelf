"use client";

import { useEffect, useRef, useState } from "react";

export function SettingsMenu({
  onRefreshCovers,
  refreshingCovers,
  onExport,
  onManageGenres,
  onManageDuplicates,
  duplicateCount,
}: {
  onRefreshCovers: () => void;
  refreshingCovers: boolean;
  onExport: () => void;
  onManageGenres: () => void;
  onManageDuplicates: () => void;
  duplicateCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Настройки"
        aria-label="Настройки"
        aria-expanded={open}
        className="flex items-center justify-center rounded-full bg-parchment/80 border border-copper/20 w-9 h-9 text-espresso hover:bg-cream-dark/60"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-copper/20 bg-parchment shadow-xl p-3 z-30">
          <div className="text-xs font-bold text-espresso-dark/70 uppercase tracking-wide mb-2">
            Настройки
          </div>

          <button
            onClick={() => {
              onRefreshCovers();
            }}
            disabled={refreshingCovers}
            className="w-full text-left rounded-lg px-2.5 py-2 text-sm font-semibold text-espresso hover:bg-cream-dark/60 disabled:opacity-50"
          >
            {refreshingCovers ? "🔄 Обновляю…" : "🔄 Обновить обложки и корешки"}
          </button>

          <button
            onClick={() => {
              onExport();
              setOpen(false);
            }}
            className="w-full text-left rounded-lg px-2.5 py-2 text-sm font-semibold text-espresso hover:bg-cream-dark/60"
          >
            ⬇ Скачать данные
          </button>

          <button
            onClick={() => {
              onManageGenres();
              setOpen(false);
            }}
            className="w-full text-left rounded-lg px-2.5 py-2 text-sm font-semibold text-espresso hover:bg-cream-dark/60"
          >
            🏷 Управление жанрами
          </button>

          <button
            onClick={() => {
              onManageDuplicates();
              setOpen(false);
            }}
            className="w-full text-left rounded-lg px-2.5 py-2 text-sm font-semibold text-espresso hover:bg-cream-dark/60"
          >
            🧬 Дубликаты{duplicateCount > 0 ? ` (${duplicateCount})` : ""}
          </button>
        </div>
      )}
    </div>
  );
}
