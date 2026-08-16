"use client";

import { useEffect, useState } from "react";
import { DECOR_CATALOG } from "./Decor";
import { DecorType } from "@/lib/types";
import { startDecorPointerDrag, DECOR_POINTER_START, DECOR_POINTER_END } from "@/lib/decorDrag";

// Deliberately not a full-screen modal: it floats over one corner so the
// shelves stay visible and interactive underneath, letting the user drag a
// decor item straight out of this window and drop it between books.
export function DecorPicker({ onClose }: { onClose: () => void }) {
  // On small screens the window otherwise covers most of the shelf, so the
  // user can't see where they're dropping. While a touch drag is in
  // progress, collapse it down to just its header so the shelf underneath
  // stays visible — the dragged item is already shown by DecorDragGhost.
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    function onStart() {
      setDragging(true);
    }
    function onEnd() {
      setDragging(false);
    }
    window.addEventListener(DECOR_POINTER_START, onStart);
    window.addEventListener(DECOR_POINTER_END, onEnd);
    return () => {
      window.removeEventListener(DECOR_POINTER_START, onStart);
      window.removeEventListener(DECOR_POINTER_END, onEnd);
    };
  }, []);

  return (
    <div
      className={`fixed z-40 bottom-2 inset-x-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-80 rounded-2xl overflow-hidden shadow-2xl border-4 sm:border-8 border-[#140c07] decor-window pop-in flex flex-col transition-[max-height] duration-200 ${
        dragging ? "max-h-16 sm:max-h-16" : "max-h-[45vh] sm:max-h-[70vh]"
      }`}
      role="dialog"
      aria-label="Уголок уюта"
    >
      <div className="decor-window-muntins" aria-hidden="true" />
      <div className="relative z-10 overflow-y-auto px-5 py-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="display text-2xl text-cream drop-shadow-md">Уголок уюта</h3>
          <button
            onClick={onClose}
            className="flex-shrink-0 h-8 w-8 rounded-full bg-cream/10 hover:bg-cream/20 text-cream flex items-center justify-center text-lg"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        {!dragging && (
          <>
            <p className="text-cream/70 text-sm mb-5 max-w-sm">
              Перетащите предмет прямо на полку — между книгами. Каждый элемент можно расставлять
              сколько угодно раз.
            </p>

            <div className="grid grid-cols-4 gap-3">
              {DECOR_CATALOG.map(({ type, label, Component }) => (
                <DecorCard key={type} type={type} label={label} Component={Component} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DecorCard({
  type,
  label,
  Component,
}: {
  type: DecorType;
  label: string;
  Component: (props: { className?: string }) => React.JSX.Element;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-decor-type", type);
        e.dataTransfer.effectAllowed = "copy";
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        e.preventDefault();
        startDecorPointerDrag({ kind: "new", decorType: type }, e.pointerId, {
          clientX: e.clientX,
          clientY: e.clientY,
        });
      }}
      title={label}
      style={{ touchAction: "none" }}
      className="group flex flex-col items-center gap-1.5 rounded-xl border border-cream/15 bg-cream/5 hover:bg-cream/10 px-2 py-3 cursor-grab active:cursor-grabbing transition-colors"
    >
      <Component className="h-12 w-auto drop-shadow-md transition-transform duration-150 group-hover:scale-110" />
      <span className="text-[10px] text-cream/70 text-center leading-tight">{label}</span>
    </div>
  );
}
