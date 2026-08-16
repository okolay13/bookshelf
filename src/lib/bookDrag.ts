// Touch/pen equivalent of native HTML5 book drag (see BookSpine's onDragStart),
// modeled on lib/decorDrag.ts's window-level event bus. Unlike decor, a book
// spine is also a tap target (opens the book), so dragging is gated behind a
// short long-press: hold still for LONG_PRESS_MS before a drag starts, and any
// early movement past MOVE_CANCEL_PX cancels it (treated as a scroll/tap).
export interface BookDragPayload {
  bookId: string;
  fromShelf: string | null;
}

export const BOOK_POINTER_START = "book-pointer-start";
export const BOOK_POINTER_MOVE = "book-pointer-move";
export const BOOK_POINTER_END = "book-pointer-end";

export interface BookPointerDetail {
  payload: BookDragPayload;
  clientX: number;
  clientY: number;
}

const LONG_PRESS_MS = 300;
const MOVE_CANCEL_PX = 10;

function dispatch(name: string, detail: BookPointerDetail) {
  window.dispatchEvent(new CustomEvent<BookPointerDetail>(name, { detail }));
}

export function startBookLongPress(
  payload: BookDragPayload,
  pointerId: number,
  initial: { clientX: number; clientY: number }
) {
  let started = false;
  let cancelled = false;

  const timer = window.setTimeout(() => {
    if (cancelled) return;
    started = true;
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
    dispatch(BOOK_POINTER_START, { payload, ...initial });
  }, LONG_PRESS_MS);

  function cleanup() {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
  }

  function onMove(e: PointerEvent) {
    if (e.pointerId !== pointerId) return;
    if (!started) {
      const dx = e.clientX - initial.clientX;
      const dy = e.clientY - initial.clientY;
      if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
        cancelled = true;
        window.clearTimeout(timer);
        cleanup();
      }
      return;
    }
    e.preventDefault();
    dispatch(BOOK_POINTER_MOVE, { payload, clientX: e.clientX, clientY: e.clientY });
  }

  function onUp(e: PointerEvent) {
    if (e.pointerId !== pointerId) return;
    window.clearTimeout(timer);
    if (started) dispatch(BOOK_POINTER_END, { payload, clientX: e.clientX, clientY: e.clientY });
    cleanup();
  }

  function onCancel(e: PointerEvent) {
    if (e.pointerId !== pointerId) return;
    window.clearTimeout(timer);
    cleanup();
  }

  window.addEventListener("pointermove", onMove, { passive: false });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
}
