"use client";

import { useEffect, useState } from "react";
import { DECOR_CATALOG } from "./Decor";
import {
  DECOR_POINTER_END,
  DECOR_POINTER_MOVE,
  DECOR_POINTER_START,
  type DecorPointerDetail,
} from "@/lib/decorDrag";

// Floating preview that follows the finger while dragging a decor item on
// touch/pen devices (native HTML5 drag images don't work there).
export function DecorDragGhost() {
  const [pos, setPos] = useState<{ x: number; y: number; type: string } | null>(null);

  useEffect(() => {
    function onStart(e: Event) {
      const { payload, clientX, clientY } = (e as CustomEvent<DecorPointerDetail>).detail;
      setPos({ x: clientX, y: clientY, type: payload.decorType });
    }
    function onMove(e: Event) {
      const { clientX, clientY } = (e as CustomEvent<DecorPointerDetail>).detail;
      setPos((prev) => (prev ? { ...prev, x: clientX, y: clientY } : prev));
    }
    function onEnd() {
      setPos(null);
    }
    window.addEventListener(DECOR_POINTER_START, onStart);
    window.addEventListener(DECOR_POINTER_MOVE, onMove);
    window.addEventListener(DECOR_POINTER_END, onEnd);
    return () => {
      window.removeEventListener(DECOR_POINTER_START, onStart);
      window.removeEventListener(DECOR_POINTER_MOVE, onMove);
      window.removeEventListener(DECOR_POINTER_END, onEnd);
    };
  }, []);

  if (!pos) return null;
  const entry = DECOR_CATALOG.find((c) => c.type === pos.type);
  if (!entry) return null;
  const { Component } = entry;

  return (
    <div
      className="fixed z-50 pointer-events-none opacity-80 drop-shadow-lg"
      style={{ left: pos.x - 24, top: pos.y - 24, width: 48, height: 48 }}
    >
      <Component className="w-full h-full" />
    </div>
  );
}
