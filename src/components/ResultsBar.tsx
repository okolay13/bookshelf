"use client";

import { ViewMode, ViewSwitcher } from "./ViewSwitcher";

function pluralBooks(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "книга";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "книги";
  return "книг";
}

export function ResultsBar({
  count,
  view,
  onViewChange,
  editMode = false,
  onToggleEditMode,
}: {
  count: number;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  editMode?: boolean;
  // Omitted entirely (e.g. on shelves that can't be reordered) hides the button.
  onToggleEditMode?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-0.5">
      <span className="text-sm font-semibold text-cream/70">
        {count} {pluralBooks(count)} найдено
      </span>
      <div className="flex items-center gap-2">
        {onToggleEditMode && (
          <button
            type="button"
            onClick={onToggleEditMode}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold shadow transition-colors ${
              editMode
                ? "bg-sage text-cream hover:brightness-105"
                : "bg-parchment/80 border border-copper/20 text-espresso/80 hover:bg-cream-dark/60"
            }`}
          >
            {editMode ? "Готово" : "Редактировать"}
          </button>
        )}
        <ViewSwitcher value={view} onChange={onViewChange} />
      </div>
    </div>
  );
}
