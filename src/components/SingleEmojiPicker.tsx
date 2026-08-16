"use client";

import { useState } from "react";
import { EMOJI_TAG_CATALOG } from "@/lib/emojiTags";

// Single-select variant of EmojiPicker, used where a quote/entry can carry
// at most one emoji tag rather than a multi-tag set.
export function SingleEmojiPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  function pick(emoji: string) {
    onChange(value === emoji ? null : emoji);
    setOpen(false);
  }

  return (
    <div className="relative inline-block w-full">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1 rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 min-h-[2.5rem]">
          {value ? <span className="text-lg leading-none">{value}</span> : <span className="text-sm text-cocoa/40">Не выбрано</span>}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 rounded-full bg-cream-dark/70 px-2.5 py-1.5 text-xs font-semibold text-espresso transition-colors hover:bg-cream-dark"
        >
          Выбрать
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            title="Убрать эмодзи"
            className="shrink-0 rounded-full bg-cream-dark/50 px-2 py-1.5 text-xs font-semibold text-cocoa/70 hover:bg-cream-dark"
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-[22rem] max-w-[90vw] rounded-2xl border border-copper/25 bg-parchment p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between px-0.5">
            <span className="text-xs font-bold uppercase tracking-wide text-cocoa/70">Один эмодзи</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-terracotta hover:text-terracotta-dark"
            >
              Готово
            </button>
          </div>
          <div className="grid max-h-72 grid-cols-6 gap-1.5 overflow-y-auto pr-1">
            {EMOJI_TAG_CATALOG.map(({ emoji, label }) => {
              const isSelected = value === emoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  title={label}
                  aria-label={label}
                  aria-pressed={isSelected}
                  onClick={() => pick(emoji)}
                  className={`flex aspect-square items-center justify-center rounded-full p-1.5 text-lg transition-all duration-150 ease-out ${
                    isSelected
                      ? "scale-110 bg-terracotta text-cream shadow-md"
                      : "bg-cream-dark/50 hover:scale-105 hover:bg-cream-dark hover:shadow-sm"
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
