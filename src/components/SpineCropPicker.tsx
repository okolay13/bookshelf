"use client";

import { useRef, useState } from "react";
import { SPINE_CROP_FRACTION, SPINE_CROP_HEIGHT_FRACTION } from "@/lib/spineGen";

export function SpineCropPicker({
  coverUrl,
  generating,
  onPick,
  onClose,
}: {
  coverUrl: string;
  generating: boolean;
  onPick: (cropX: number, cropY: number) => void;
  onClose: () => void;
}) {
  const [cropX, setCropX] = useState(0.5);
  const [cropY, setCropY] = useState(0.5);
  const imgRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function updateFromClientPoint(clientX: number, clientY: number) {
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const bandWidth = rect.width * SPINE_CROP_FRACTION;
    const maxLeft = rect.width - bandWidth;
    const left = Math.min(maxLeft, Math.max(0, clientX - rect.left - bandWidth / 2));
    setCropX(maxLeft > 0 ? left / maxLeft : 0);

    const bandHeight = rect.height * SPINE_CROP_HEIGHT_FRACTION;
    const maxTop = rect.height - bandHeight;
    const top = Math.min(maxTop, Math.max(0, clientY - rect.top - bandHeight / 2));
    setCropY(maxTop > 0 ? top / maxTop : 0);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-espresso-dark/60 backdrop-blur-sm fade-in p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in w-full max-w-xs rounded-2xl bg-parchment shadow-2xl border border-copper/20 p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="display text-xl text-espresso-dark">Участок для корешка</h3>
          <button onClick={onClose} className="text-cocoa hover:text-espresso" aria-label="Закрыть">
            ✕
          </button>
        </div>
        <p className="text-xs text-cocoa/60 mb-2">
          Перетащите рамку по обложке (можно и по горизонтали, и по вертикали) — из неё будет сделан корешок.
        </p>
        <div
          ref={imgRef}
          className="relative select-none rounded-lg overflow-hidden border border-copper/20 aspect-[2/3] cursor-move touch-none"
          onMouseDown={(e) => {
            dragging.current = true;
            updateFromClientPoint(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => {
            if (dragging.current) updateFromClientPoint(e.clientX, e.clientY);
          }}
          onMouseUp={() => {
            dragging.current = false;
          }}
          onMouseLeave={() => {
            dragging.current = false;
          }}
          onTouchStart={(e) => updateFromClientPoint(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => updateFromClientPoint(e.touches[0].clientX, e.touches[0].clientY)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
          <div
            className="absolute border-2 border-terracotta bg-terracotta/25"
            style={{
              width: `${SPINE_CROP_FRACTION * 100}%`,
              left: `${cropX * (100 - SPINE_CROP_FRACTION * 100)}%`,
              height: `${SPINE_CROP_HEIGHT_FRACTION * 100}%`,
              top: `${cropY * (100 - SPINE_CROP_HEIGHT_FRACTION * 100)}%`,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => onPick(cropX, cropY)}
          disabled={generating}
          className="mt-3 w-full rounded-full bg-sage text-cream py-2 text-sm font-bold shadow hover:brightness-105 disabled:opacity-50"
        >
          {generating ? "Генерация..." : "Сделать корешок из этого участка"}
        </button>
      </div>
    </div>
  );
}
