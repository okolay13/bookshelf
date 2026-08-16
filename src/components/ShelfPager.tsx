"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Book, DecorType, ShelfDecor } from "@/lib/types";
import { ShelfRow } from "./ShelfRow";

export interface ShelfGroup {
  key: string;
  title: string;
  books: Book[];
  accent?: string;
  addable?: boolean;
  // True only for the active view of a manual, non-default user shelf —
  // enables drag-to-reorder and the per-book "remove from shelf" control.
  reorderable?: boolean;
}

const SWIPE_THRESHOLD = 50;

export interface ShelfFocusRequest {
  key: string;
  token: number;
}

export function ShelfPager({
  groups,
  onSelect,
  focusRequest,
  onAddToShelf,
  headerRight,
  decorByShelf,
  onPlaceDecor,
  onMoveDecor,
  onDeleteDecor,
  onDropOutside,
  onReorderBook,
  onRemoveBook,
  editMode = false,
}: {
  groups: ShelfGroup[];
  onSelect: (book: Book) => void;
  focusRequest?: ShelfFocusRequest | null;
  onAddToShelf?: (shelfKey: string) => void;
  headerRight?: ReactNode;
  decorByShelf?: Map<string, ShelfDecor[]>;
  onPlaceDecor?: (shelfKey: string, decorType: DecorType, slot: number) => void;
  onMoveDecor?: (id: string, slot: number) => void;
  onDeleteDecor?: (id: string) => void;
  onDropOutside?: () => void;
  onReorderBook?: (shelfKey: string, bookId: string, slot: number) => void;
  onRemoveBook?: (shelfKey: string, bookId: string) => void;
  editMode?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (focusRequest) {
      const idx = groups.findIndex((g) => g.key === focusRequest.key);
      if (idx >= 0) {
        setActiveIndex(idx);
        return;
      }
    }
    setActiveIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups.map((g) => g.key).join("|"), focusRequest]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, groups.length]);

  if (groups.length === 0) return null;

  const safeIndex = Math.min(activeIndex, groups.length - 1);
  const current = groups[safeIndex];

  function goPrev() {
    setActiveIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setActiveIndex((i) => Math.min(groups.length - 1, i + 1));
  }

  return (
    <div>
      {groups.length > 1 && (
        <PagerControls
          safeIndex={safeIndex}
          total={groups.length}
          title={current.title}
          onPrev={goPrev}
          onNext={goNext}
          className="mb-3"
        />
      )}

      <div
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX == null) return;
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          if (deltaX > SWIPE_THRESHOLD) goPrev();
          else if (deltaX < -SWIPE_THRESHOLD) goNext();
          setTouchStartX(null);
        }}
      >
        <ShelfRow
          title={current.title}
          books={current.books}
          onSelect={onSelect}
          accent={current.accent}
          index={safeIndex}
          onAddClick={
            onAddToShelf && current.addable !== false ? () => onAddToShelf(current.key) : undefined
          }
          headerRight={headerRight}
          decor={decorByShelf?.get(current.key)}
          onPlaceDecor={
            onPlaceDecor ? (decorType, slot) => onPlaceDecor(current.key, decorType, slot) : undefined
          }
          onMoveDecor={onMoveDecor}
          onDeleteDecor={onDeleteDecor}
          onDropOutside={onDropOutside}
          onReorderBook={
            current.reorderable && onReorderBook
              ? (bookId, slot) => onReorderBook(current.key, bookId, slot)
              : undefined
          }
          onRemoveBook={
            current.reorderable && onRemoveBook
              ? (bookId) => onRemoveBook(current.key, bookId)
              : undefined
          }
          editMode={editMode}
        />
      </div>

      {groups.length > 1 && (
        <PagerControls
          safeIndex={safeIndex}
          total={groups.length}
          title={current.title}
          onPrev={goPrev}
          onNext={goNext}
          className="-mt-2 mb-4"
        />
      )}
    </div>
  );
}

function PagerControls({
  safeIndex,
  total,
  title,
  onPrev,
  onNext,
  className = "",
}: {
  safeIndex: number;
  total: number;
  title: string;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <button
        onClick={onPrev}
        disabled={safeIndex === 0}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-parchment/80 border border-copper/20 text-espresso disabled:opacity-30 hover:bg-cream-dark/60"
        aria-label="Предыдущая полка"
      >
        ‹
      </button>
      <span className="text-xs font-semibold text-cream/70">
        {safeIndex + 1} из {total} · {title}
      </span>
      <button
        onClick={onNext}
        disabled={safeIndex === total - 1}
        className="h-9 w-9 flex items-center justify-center rounded-full bg-parchment/80 border border-copper/20 text-espresso disabled:opacity-30 hover:bg-cream-dark/60"
        aria-label="Следующая полка"
      >
        ›
      </button>
    </div>
  );
}
