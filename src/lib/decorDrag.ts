import type { DecorType } from "@/lib/types";

// Touch/pen devices don't fire native HTML5 drag events, so dragging decor on
// mobile is driven by pointer events instead. This tiny window-level event bus
// lets the picker/placed-decor items (drag source) and shelf rows (drop
// target) coordinate without threading drag state through ShelfPager props.
export type DecorDragPayload =
  | { kind: "new"; decorType: DecorType }
  | { kind: "existing"; id: string; decorType: DecorType };

export const DECOR_POINTER_START = "decor-pointer-start";
export const DECOR_POINTER_MOVE = "decor-pointer-move";
export const DECOR_POINTER_END = "decor-pointer-end";

export interface DecorPointerDetail {
  payload: DecorDragPayload;
  clientX: number;
  clientY: number;
}

function dispatch(name: string, detail: DecorPointerDetail) {
  window.dispatchEvent(new CustomEvent<DecorPointerDetail>(name, { detail }));
}

export function startDecorPointerDrag(
  payload: DecorDragPayload,
  pointerId: number,
  initial: { clientX: number; clientY: number }
) {
  dispatch(DECOR_POINTER_START, { payload, ...initial });

  function onMove(e: PointerEvent) {
    if (e.pointerId !== pointerId) return;
    dispatch(DECOR_POINTER_MOVE, { payload, clientX: e.clientX, clientY: e.clientY });
  }
  function onUp(e: PointerEvent) {
    if (e.pointerId !== pointerId) return;
    dispatch(DECOR_POINTER_END, { payload, clientX: e.clientX, clientY: e.clientY });
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
  }
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
}
