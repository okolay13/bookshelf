"use client";

import { useEffect, useState } from "react";
import { Book } from "@/lib/types";
import { spineStyle } from "@/lib/bookVisuals";
import {
  BOOK_POINTER_END,
  BOOK_POINTER_MOVE,
  BOOK_POINTER_START,
  type BookPointerDetail,
} from "@/lib/bookDrag";

// Floating spine preview that follows the finger while long-press-dragging a
// book on touch/pen devices (native HTML5 drag images don't work there) —
// same role as DecorDragGhost, sized to match the real spine.
export function BookDragGhost({ books }: { books: Book[] }) {
  const [pos, setPos] = useState<{ x: number; y: number; bookId: string } | null>(null);

  useEffect(() => {
    function onStart(e: Event) {
      const { payload, clientX, clientY } = (e as CustomEvent<BookPointerDetail>).detail;
      setPos({ x: clientX, y: clientY, bookId: payload.bookId });
    }
    function onMove(e: Event) {
      const { clientX, clientY } = (e as CustomEvent<BookPointerDetail>).detail;
      setPos((prev) => (prev ? { ...prev, x: clientX, y: clientY } : prev));
    }
    function onEnd() {
      setPos(null);
    }
    window.addEventListener(BOOK_POINTER_START, onStart);
    window.addEventListener(BOOK_POINTER_MOVE, onMove);
    window.addEventListener(BOOK_POINTER_END, onEnd);
    return () => {
      window.removeEventListener(BOOK_POINTER_START, onStart);
      window.removeEventListener(BOOK_POINTER_MOVE, onMove);
      window.removeEventListener(BOOK_POINTER_END, onEnd);
    };
  }, []);

  if (!pos) return null;
  const book = books.find((b) => b.id === pos.bookId);
  if (!book) return null;
  const s = spineStyle(book.id || book.title + book.author, { width: book.spine_width });

  return (
    <div
      className="fixed z-50 pointer-events-none opacity-90 drop-shadow-[0_10px_16px_rgba(12,6,3,0.5)] rounded-t-md rounded-b-sm"
      style={{
        left: pos.x - s.width / 2,
        top: pos.y - s.height / 2,
        width: s.width,
        height: s.height,
        background: book.spine_image_url
          ? `url(${book.spine_image_url}) center/cover`
          : `url(/images/spine-textures/${s.image}) center/64px repeat`,
        transform: "scale(1.06) rotate(0deg)",
      }}
    >
      <span
        className="absolute inset-0 flex items-center justify-center px-1"
        style={{ writingMode: "vertical-rl", color: s.text }}
      >
        <span className="text-[11px] font-bold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
          {book.title}
        </span>
      </span>
    </div>
  );
}
