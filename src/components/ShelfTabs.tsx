"use client";

import { useEffect, useRef, useState } from "react";
import { Shelf } from "@/lib/types";
import { CreateShelfForm } from "./CreateShelfForm";
import { BOOK_POINTER_END, BOOK_POINTER_MOVE, type BookPointerDetail } from "@/lib/bookDrag";

// How long a drag has to hover a shelf tab before it auto-activates that
// shelf, so the user can drop the book at a precise spot inside it instead of
// just appending it to the end.
const HOVER_ACTIVATE_MS = 600;

export function ShelfTabs({
  shelves,
  activeName,
  onSelect,
  onCreateManual,
  onUpdate,
  onDelete,
  onDropBook,
  editMode = false,
}: {
  shelves: Shelf[];
  activeName: string;
  onSelect: (name: string) => void;
  onCreateManual: (name: string, color: string) => Promise<void>;
  onUpdate: (shelf: Shelf, newName: string, newColor: string) => Promise<void>;
  onDelete: (shelf: Shelf) => Promise<void>;
  onDropBook: (bookId: string, shelfName: string) => void;
  // While true, hovering another shelf's tab mid-drag auto-activates it
  // (mouse dragover and touch long-press alike) so books can be dropped
  // straight into a different shelf's row.
  editMode?: boolean;
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [dragOverName, setDragOverName] = useState<string | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editShelf, setEditShelf] = useState<Shelf | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTarget = useRef<string | null>(null);
  const tabRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  function armHoverActivate(shelf: Shelf) {
    if (shelf.is_all || shelf.kind === "smart" || shelf.name === activeName) return;
    if (hoverTarget.current === shelf.name) return;
    clearHoverActivate();
    hoverTarget.current = shelf.name;
    hoverTimer.current = setTimeout(() => {
      onSelect(shelf.name);
    }, HOVER_ACTIVATE_MS);
  }

  function clearHoverActivate() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    hoverTarget.current = null;
  }

  useEffect(() => clearHoverActivate, []);

  function handleDrop(e: React.DragEvent, shelf: Shelf) {
    e.preventDefault();
    setDragOverName(null);
    clearHoverActivate();
    if (shelf.is_all || shelf.kind === "smart") return;
    const bookId = e.dataTransfer.getData("application/x-book-id");
    if (bookId) onDropBook(bookId, shelf.name);
  }

  // Touch long-press book drag doesn't fire native drag events, so hover the
  // same way the shelf rows do for decor/book pointer drags: hit-test tab
  // rects against the pointer position from the window-level event bus.
  useEffect(() => {
    if (!editMode) return;

    function shelfAt(clientX: number, clientY: number): Shelf | null {
      for (const shelf of shelves) {
        const el = tabRefs.current.get(shelf.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          return shelf;
        }
      }
      return null;
    }

    function onMove(e: Event) {
      const { clientX, clientY } = (e as CustomEvent<BookPointerDetail>).detail;
      const shelf = shelfAt(clientX, clientY);
      if (!shelf || shelf.is_all || shelf.kind === "smart") {
        setDragOverName(null);
        clearHoverActivate();
        return;
      }
      setDragOverName(shelf.name);
      armHoverActivate(shelf);
    }

    function onEnd(e: Event) {
      const { payload, clientX, clientY } = (e as CustomEvent<BookPointerDetail>).detail;
      setDragOverName(null);
      clearHoverActivate();
      const shelf = shelfAt(clientX, clientY);
      if (!shelf || shelf.is_all || shelf.kind === "smart") return;
      onDropBook(payload.bookId, shelf.name);
    }

    window.addEventListener(BOOK_POINTER_MOVE, onMove);
    window.addEventListener(BOOK_POINTER_END, onEnd);
    return () => {
      window.removeEventListener(BOOK_POINTER_MOVE, onMove);
      window.removeEventListener(BOOK_POINTER_END, onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, shelves, activeName, onDropBook]);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {shelves.map((shelf) => {
        const isActive = shelf.name === activeName;
        const isProtected = Boolean(shelf.is_default || shelf.is_all);
        const isDropTarget = !shelf.is_all && shelf.kind !== "smart";
        return (
          <div
            key={shelf.id}
            ref={(el) => {
              if (el) tabRefs.current.set(shelf.id, el);
              else tabRefs.current.delete(shelf.id);
            }}
            onDragOver={(e) => {
              if (!isDropTarget) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
              setDragOverName(shelf.name);
              armHoverActivate(shelf);
            }}
            onDragLeave={() => {
              setDragOverName((n) => (n === shelf.name ? null : n));
              if (hoverTarget.current === shelf.name) clearHoverActivate();
            }}
            onDrop={(e) => handleDrop(e, shelf)}
            style={shelf.color ? { background: isActive ? shelf.color : `${shelf.color}e6` } : undefined}
            className={`group relative flex items-center gap-1 rounded-full pl-3.5 pr-1.5 py-1.5 text-xs font-bold shadow transition-colors ${
              shelf.color
                ? "text-cream hover:brightness-105"
                : isActive
                  ? "bg-terracotta text-cream"
                  : "bg-sage/90 text-cream hover:brightness-105"
            } ${dragOverName === shelf.name ? "ring-2 ring-cream/80" : ""}`}
          >
            <button type="button" onClick={() => onSelect(shelf.name)} className="py-0.5">
              {shelf.name}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuId((id) => (id === shelf.id ? null : shelf.id))}
                className="opacity-60 hover:opacity-100 px-1"
                aria-label="Меню полки"
                title="Меню полки"
              >
                ⋮
              </button>
              {menuId === shelf.id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuId(null)} />
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[9rem] rounded-xl bg-parchment shadow-xl border border-copper/20 py-1 text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuId(null);
                        setEditShelf(shelf);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-espresso hover:bg-cream-dark/60"
                    >
                      Редактировать полку
                    </button>
                  </div>
                </>
              )}
            </div>

            {!isProtected &&
              (confirmDeleteId === shelf.id ? (
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDeleteId(null);
                      void onDelete(shelf);
                      if (isActive) onSelect(shelves.find((s) => s.is_all)?.name ?? shelf.name);
                    }}
                    className="rounded-full bg-terracotta-dark px-2 py-0.5 text-[10px]"
                  >
                    Удалить
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]"
                  >
                    Отмена
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(shelf.id)}
                  className="opacity-60 hover:opacity-100 px-1"
                  aria-label="Удалить полку"
                  title="Удалить"
                >
                  ✕
                </button>
              ))}
          </div>
        );
      })}

      <CreatePopover
        open={showPopover}
        onOpenChange={setShowPopover}
        onCreateManual={onCreateManual}
      />

      {editShelf && (
        <ShelfFormModal title="Редактировать полку" onClose={() => setEditShelf(null)}>
          <CreateShelfForm
            mode="edit"
            initialName={editShelf.name}
            initialColor={editShelf.color ?? undefined}
            onCancel={() => setEditShelf(null)}
            onCreate={async (name, color) => {
              await onUpdate(editShelf, name, color);
              setEditShelf(null);
            }}
          />
        </ShelfFormModal>
      )}
    </div>
  );
}

function ShelfFormModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso-dark/60 backdrop-blur-sm fade-in p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-parchment shadow-2xl border border-copper/20"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-copper/15">
          <span className="text-xs uppercase tracking-wide text-cocoa/60 font-bold">{title}</span>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full text-cocoa hover:bg-cream-dark transition-colors"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function CreatePopover({
  open,
  onOpenChange,
  onCreateManual,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreateManual: (name: string, color: string) => Promise<void>;
}) {
  function close() {
    onOpenChange(false);
  }

  async function handleCreate(name: string, color: string) {
    await onCreateManual(name, color);
    close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="h-8 w-8 flex items-center justify-center rounded-full bg-parchment/90 border border-copper/20 text-espresso text-base font-bold shadow hover:bg-cream-dark/60"
        aria-label="Добавить полку"
        title="Добавить полку"
      >
        +
      </button>

      {open && (
        <ShelfFormModal title="Новая полка" onClose={close}>
          <CreateShelfForm onCancel={close} onCreate={handleCreate} />
        </ShelfFormModal>
      )}
    </>
  );
}
