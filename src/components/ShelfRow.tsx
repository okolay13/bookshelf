"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Book, DecorType, ShelfDecor } from "@/lib/types";
import { BookSpine } from "./BookSpine";
import { DECOR_CATALOG, HangingVine } from "./Decor";
import { FairyLights } from "./FairyLights";
import { spineStyle } from "@/lib/bookVisuals";
import {
  DECOR_POINTER_END,
  DECOR_POINTER_MOVE,
  startDecorPointerDrag,
  type DecorPointerDetail,
} from "@/lib/decorDrag";
import { BOOK_POINTER_END, BOOK_POINTER_MOVE, type BookPointerDetail } from "@/lib/bookDrag";

// Must match the row's CSS: gap-2 (8px) and px-3 (12px) on both sides.
const ROW_GAP = 8;
const ROW_PADDING_X = 24;
// Reserved so the trailing add-button always has room on whichever row ends up last.
const ADD_BTN_RESERVE = 48;

type RowItem =
  | { kind: "book"; itemKey: string; slot: number; width: number; book: Book }
  | { kind: "decor"; itemKey: string; slot: number; width: number; decor: ShelfDecor };

function chunkByWidth(widths: number[], usableWidth: number): number[][] {
  const rows: number[][] = [];
  let row: number[] = [];
  let rowWidth = 0;
  widths.forEach((w, i) => {
    const added = row.length ? w + ROW_GAP : w;
    if (row.length && rowWidth + added > usableWidth) {
      rows.push(row);
      row = [i];
      rowWidth = w;
    } else {
      row.push(i);
      rowWidth += added;
    }
  });
  if (row.length) rows.push(row);
  return rows;
}

export function ShelfRow({
  title,
  books,
  onSelect,
  accent,
  index = 0,
  onAddClick,
  headerRight,
  decor,
  onPlaceDecor,
  onMoveDecor,
  onDeleteDecor,
  onDropOutside,
  onReorderBook,
  onRemoveBook,
  editMode = false,
}: {
  title: string;
  books: Book[];
  onSelect: (book: Book) => void;
  accent?: string;
  index?: number;
  onAddClick?: () => void;
  headerRight?: ReactNode;
  decor?: ShelfDecor[];
  onPlaceDecor?: (decorType: DecorType, slot: number) => void;
  onMoveDecor?: (id: string, slot: number) => void;
  onDeleteDecor?: (id: string) => void;
  onDropOutside?: () => void;
  // Only passed for manual, non-default user shelves — lets books be
  // dragged into a precise position and removed from just this shelf.
  onReorderBook?: (bookId: string, slot: number) => void;
  onRemoveBook?: (bookId: string) => void;
  // "Edit shelf" mode toggle from the page header — gates whether books are
  // draggable/jiggling at all, on top of onReorderBook being passed.
  editMode?: boolean;
}) {
  const showVine = index % 2 === 1;
  const canDrop = Boolean(onPlaceDecor || onMoveDecor || (editMode && onReorderBook));

  const measureRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [dragHint, setDragHint] = useState<{ rowIndex: number; gapKey: string; slot: number } | null>(null);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const items: RowItem[] = useMemo(() => {
    const bookItems: RowItem[] = books.map((b, i) => ({
      kind: "book",
      itemKey: `book:${b.id}`,
      slot: i,
      width: spineStyle(b.id || b.title + b.author, { width: b.spine_width }).width,
      book: b,
    }));
    const decorItems: RowItem[] = (decor ?? []).map((d) => ({
      kind: "decor",
      itemKey: `decor:${d.id}`,
      slot: d.slot,
      width: DECOR_CATALOG.find((c) => c.type === d.decor_type)?.width ?? 32,
      decor: d,
    }));
    return [...bookItems, ...decorItems].sort((a, b) => a.slot - b.slot);
  }, [books, decor]);

  // Pack items (books + placed decor) into justified rows so each wrapped line can be
  // its own physical shelf board — on every screen size, so small screens stack shelves
  // vertically (page scroll) instead of scrolling a single row sideways.
  const rows = useMemo(() => {
    if (items.length === 0) return [[] as number[]];
    if (!containerWidth) return [items.map((_, i) => i)];
    const usable = containerWidth - ROW_PADDING_X - (onAddClick ? ADD_BTN_RESERVE : 0);
    const chunked = chunkByWidth(
      items.map((it) => it.width),
      Math.max(usable, 60)
    );
    return chunked.length ? chunked : [items.map((_, i) => i)];
  }, [items, containerWidth, onAddClick]);

  function slotForGap(rowItems: RowItem[], gapIndex: number): number {
    if (rowItems.length === 0) return 0;
    if (gapIndex <= 0) return rowItems[0].slot - 1;
    if (gapIndex >= rowItems.length) return rowItems[rowItems.length - 1].slot + 1;
    return (rowItems[gapIndex - 1].slot + rowItems[gapIndex].slot) / 2;
  }

  function gapIndexForX(els: HTMLElement[], x: number): number {
    let gapIndex = els.length;
    for (let i = 0; i < els.length; i++) {
      const rect = els[i].getBoundingClientRect();
      if (x < rect.left + rect.width / 2) {
        gapIndex = i;
        break;
      }
    }
    return gapIndex;
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>, rowIndex: number, rowItems: RowItem[]) {
    if (!canDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect =
      e.dataTransfer.types.includes("application/x-decor-id") ||
      (editMode && onReorderBook && e.dataTransfer.types.includes("application/x-book-id"))
        ? "move"
        : "copy";
    const els = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-item-slot]"));
    if (!els.length) {
      setDragHint({ rowIndex, gapKey: "0", slot: 0 });
      return;
    }
    const gapIndex = gapIndexForX(els, e.clientX);
    setDragHint({ rowIndex, gapKey: String(gapIndex), slot: slotForGap(rowItems, gapIndex) });
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    if (!canDrop || !dragHint) return;
    e.preventDefault();
    const bookId = e.dataTransfer.getData("application/x-book-id");
    const decorId = e.dataTransfer.getData("application/x-decor-id");
    const decorType = e.dataTransfer.getData("application/x-decor-type");
    if (bookId && onReorderBook && editMode) {
      onReorderBook(bookId, dragHint.slot);
    } else if (decorId && onMoveDecor) {
      onMoveDecor(decorId, dragHint.slot);
    } else if (decorType && onPlaceDecor) {
      onPlaceDecor(decorType as DecorType, dragHint.slot);
    }
    setDragHint(null);
  }

  // Touch/pen drag: native HTML5 drag events don't fire there, so pointer
  // moves/ends are relayed through a window-level event bus (see lib/decorDrag)
  // and matched against each row's DOM rect ourselves.
  function findRowForPoint(clientX: number, clientY: number): { rowIndex: number; rowItems: RowItem[] } | null {
    for (let ri = 0; ri < rows.length; ri++) {
      const el = rowRefs.current[ri];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        return { rowIndex: ri, rowItems: rows[ri].map((i) => items[i]) };
      }
    }
    return null;
  }

  useEffect(() => {
    if (!canDrop) return;

    function onMove(e: Event) {
      const { clientX, clientY } = (e as CustomEvent<DecorPointerDetail>).detail;
      const hit = findRowForPoint(clientX, clientY);
      if (!hit) {
        setDragHint(null);
        return;
      }
      const el = rowRefs.current[hit.rowIndex];
      const els = el ? Array.from(el.querySelectorAll<HTMLElement>("[data-item-slot]")) : [];
      if (!els.length) {
        setDragHint({ rowIndex: hit.rowIndex, gapKey: "0", slot: 0 });
        return;
      }
      const gapIndex = gapIndexForX(els, clientX);
      setDragHint({
        rowIndex: hit.rowIndex,
        gapKey: String(gapIndex),
        slot: slotForGap(hit.rowItems, gapIndex),
      });
    }

    function onEnd(e: Event) {
      const { payload, clientX, clientY } = (e as CustomEvent<DecorPointerDetail>).detail;
      const hit = findRowForPoint(clientX, clientY);
      setDragHint(null);
      if (!hit) {
        onDropOutside?.();
        return;
      }
      const el = rowRefs.current[hit.rowIndex];
      const els = el ? Array.from(el.querySelectorAll<HTMLElement>("[data-item-slot]")) : [];
      const gapIndex = els.length ? gapIndexForX(els, clientX) : 0;
      const slot = slotForGap(hit.rowItems, gapIndex);
      if (payload.kind === "existing" && onMoveDecor) {
        onMoveDecor(payload.id, slot);
      } else if (payload.kind === "new" && onPlaceDecor) {
        onPlaceDecor(payload.decorType, slot);
      }
    }

    window.addEventListener(DECOR_POINTER_MOVE, onMove);
    window.addEventListener(DECOR_POINTER_END, onEnd);
    return () => {
      window.removeEventListener(DECOR_POINTER_MOVE, onMove);
      window.removeEventListener(DECOR_POINTER_END, onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canDrop, rows, items, onPlaceDecor, onMoveDecor, onDropOutside]);

  // Touch/pen book reorder: mirrors the decor pointer-bus handling above, but
  // only listens while edit mode is actually on (long-press can't even start
  // otherwise, since BookSpine doesn't attach the pointerdown handler then).
  useEffect(() => {
    if (!editMode || !onReorderBook) return;

    function onMove(e: Event) {
      const { clientX, clientY } = (e as CustomEvent<BookPointerDetail>).detail;
      const hit = findRowForPoint(clientX, clientY);
      if (!hit) {
        setDragHint(null);
        return;
      }
      const el = rowRefs.current[hit.rowIndex];
      const els = el ? Array.from(el.querySelectorAll<HTMLElement>("[data-item-slot]")) : [];
      if (!els.length) {
        setDragHint({ rowIndex: hit.rowIndex, gapKey: "0", slot: 0 });
        return;
      }
      const gapIndex = gapIndexForX(els, clientX);
      setDragHint({
        rowIndex: hit.rowIndex,
        gapKey: String(gapIndex),
        slot: slotForGap(hit.rowItems, gapIndex),
      });
    }

    function onEnd(e: Event) {
      const { payload, clientX, clientY } = (e as CustomEvent<BookPointerDetail>).detail;
      const hit = findRowForPoint(clientX, clientY);
      setDragHint(null);
      if (!hit) return;
      const el = rowRefs.current[hit.rowIndex];
      const els = el ? Array.from(el.querySelectorAll<HTMLElement>("[data-item-slot]")) : [];
      const gapIndex = els.length ? gapIndexForX(els, clientX) : 0;
      const slot = slotForGap(hit.rowItems, gapIndex);
      onReorderBook!(payload.bookId, slot);
    }

    window.addEventListener(BOOK_POINTER_MOVE, onMove);
    window.addEventListener(BOOK_POINTER_END, onEnd);
    return () => {
      window.removeEventListener(BOOK_POINTER_MOVE, onMove);
      window.removeEventListener(BOOK_POINTER_END, onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, rows, items, onReorderBook]);

  return (
    <div className="mb-10">
      <div className="mb-2 px-1 flex flex-wrap items-center justify-between gap-2">
        <h3 className="display text-2xl text-cream flex items-center gap-2 drop-shadow-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: accent ?? "#c1440e" }}
          />
          {title}
          <span className="text-sm font-sans font-normal text-cream/50">
            {books.length} {pluralBooks(books.length)}
          </span>
        </h3>
        {headerRight}
      </div>
      <div className="relative pt-4 bookcase-frame" ref={measureRef}>
        <div className="bookcase-side-wall left hidden sm:block" aria-hidden="true" />
        <div className="bookcase-side-wall right hidden sm:block" aria-hidden="true" />
        {showVine && (
          <div className="absolute -top-2 left-6 w-10 h-16 -z-10 opacity-90 sway-slow hidden sm:block">
            <HangingVine className="w-full h-full" />
          </div>
        )}

        {rows.map((rowIndices, ri) => {
          const isLastRow = ri === rows.length - 1;
          const isBackRow = ri > 0 && ri < rows.length - 1;
          const rowItems = rowIndices.map((i) => items[i]);
          return (
            <div
              key={ri}
              ref={(el) => {
                rowRefs.current[ri] = el;
              }}
              className={`relative flex items-end gap-2 overflow-visible px-3 pt-5 pb-1 wood-shelf ${
                ri > 0 ? "mt-9" : ""
              } ${isBackRow ? "shelf-recede" : ""}`}
              onDragOver={canDrop ? (e) => handleDragOver(e, ri, rowItems) : undefined}
              onDragLeave={canDrop ? () => setDragHint((h) => (h?.rowIndex === ri ? null : h)) : undefined}
              onDrop={canDrop ? handleDrop : undefined}
            >
              {ri === 0 && (
                <div className="shelf-garland-wrap hidden sm:block">
                  <FairyLights seed={`${title}:${ri}`} className="w-full h-full" />
                </div>
              )}
              <div className={ri === 0 ? "shelf-glow-pool" : "shelf-glow-pool-faint"} />
              {rowIndices.length === 0 && !onAddClick && (
                <div className="py-6 px-2 text-cream/70 text-sm italic">Пока пусто</div>
              )}
              {rowItems.map((item, gapIndex) => (
                <RowItemView
                  key={item.itemKey}
                  item={item}
                  slotAttr={item.slot}
                  onSelect={onSelect}
                  onDeleteDecor={onDeleteDecor}
                  onRemoveBook={onRemoveBook}
                  editable={editMode}
                  shelfName={title}
                  showGapHint={
                    canDrop && dragHint?.rowIndex === ri && dragHint.gapKey === String(gapIndex)
                  }
                />
              ))}
              {canDrop && dragHint?.rowIndex === ri && dragHint.gapKey === String(rowItems.length) && (
                <span className="w-[3px] self-stretch rounded-full bg-glow/70 shadow-[0_0_10px_rgba(255,207,122,0.7)] flex-shrink-0" />
              )}
              {isLastRow && onAddClick && (
                <button
                  type="button"
                  onClick={onAddClick}
                  title="Добавить книгу на эту полку"
                  className="flex-shrink-0 flex items-center justify-center rounded-t-md rounded-b-sm border-2 border-dashed border-cream/40 text-cream/70 text-2xl font-bold hover:border-cream/70 hover:text-cream hover:bg-white/5 transition-colors"
                  style={{ width: "40px", height: "150px" }}
                >
                  +
                </button>
              )}
            </div>
          );
        })}
        <div className="absolute -bottom-[26px] left-1 right-1 h-3 rounded-full bg-black/50 blur-md" />
      </div>
    </div>
  );
}

function RowItemView({
  item,
  slotAttr,
  onSelect,
  onDeleteDecor,
  onRemoveBook,
  editable,
  shelfName,
  showGapHint,
}: {
  item: RowItem;
  slotAttr: number;
  onSelect: (book: Book) => void;
  onDeleteDecor?: (id: string) => void;
  onRemoveBook?: (bookId: string) => void;
  editable: boolean;
  shelfName: string;
  showGapHint: boolean;
}) {
  return (
    <>
      {showGapHint && (
        <span className="w-[3px] self-stretch rounded-full bg-glow/70 shadow-[0_0_10px_rgba(255,207,122,0.7)] flex-shrink-0" />
      )}
      {item.kind === "book" ? (
        <div data-item-slot={slotAttr} className="relative group flex-shrink-0 self-end">
          <BookSpine
            book={item.book}
            onClick={() => onSelect(item.book)}
            editable={editable}
            shelfName={shelfName}
          />
          {onRemoveBook && editable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveBook(item.book.id);
              }}
              title="Убрать с этой полки"
              className="absolute -top-2 -right-2 flex h-5 w-5 rounded-full bg-espresso-dark/90 text-cream text-xs items-center justify-center hover:bg-terracotta transition-colors z-10"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <PlacedDecor decor={item.decor} onDelete={onDeleteDecor} slotAttr={slotAttr} />
      )}
    </>
  );
}

// Sized relative to a "typical" book spine (~200px tall, see bookVisuals'
// heightVariants) so items read clearly against the books instead of
// disappearing next to them: mug/vase-scale items land around 60-90% of a
// book's height, smaller accents (candle, crystal) a bit lower. Base = small
// screens (slightly reduced), sm: = tablet/desktop (slightly enlarged) — this
// mirrors the shelf's own responsive scaling instead of a separate mechanism.
const DECOR_HEIGHT_CLASS: Record<DecorType, string> = {
  plant: "h-[150px] sm:h-[172px]",
  candle: "h-[108px] sm:h-[122px]",
  tea: "h-[122px] sm:h-[138px]",
  books: "h-[84px] sm:h-[96px]",
  branch: "h-[130px] sm:h-[148px]",
  cat: "h-[132px] sm:h-[150px]",
  lamp: "h-[160px] sm:h-[176px]",
  crystal: "h-[120px] sm:h-[136px]",
};

function PlacedDecor({
  decor,
  onDelete,
  slotAttr,
}: {
  decor: ShelfDecor;
  onDelete?: (id: string) => void;
  slotAttr: number;
}) {
  const entry = DECOR_CATALOG.find((c) => c.type === decor.decor_type);
  if (!entry) return null;
  const { Component } = entry;
  return (
    <div
      data-item-slot={slotAttr}
      className="relative group flex-shrink-0 self-end cursor-grab active:cursor-grabbing"
      style={{ touchAction: "none" }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-decor-id", decor.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        e.preventDefault();
        startDecorPointerDrag(
          { kind: "existing", id: decor.id, decorType: decor.decor_type },
          e.pointerId,
          { clientX: e.clientX, clientY: e.clientY }
        );
      }}
      title={entry.label}
    >
      <Component
        className={`w-auto opacity-95 drop-shadow-[0_10px_10px_rgba(12,6,3,0.4)] ${DECOR_HEIGHT_CLASS[decor.decor_type]}`}
      />
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(decor.id);
          }}
          title="Убрать"
          className="absolute -top-2 -right-2 hidden group-hover:flex h-5 w-5 rounded-full bg-espresso-dark/90 text-cream text-xs items-center justify-center hover:bg-terracotta transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}

function pluralBooks(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "книга";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "книги";
  return "книг";
}
