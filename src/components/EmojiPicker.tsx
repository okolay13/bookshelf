"use client";

import { useState } from "react";
import {
  EMOJI_CATEGORIES,
  EMOJI_TAG_CATALOG,
  MAX_EMOJI_TAGS,
  parseEmojiTags,
  serializeEmojiTags,
} from "@/lib/emojiTags";

function EmojiGrid({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (emoji: string) => void;
}) {
  return (
    <div className="space-y-3">
      {EMOJI_CATEGORIES.map((cat) => {
        const options = EMOJI_TAG_CATALOG.filter((t) => t.category === cat.id);
        if (options.length === 0) return null;
        return (
          <div key={cat.id}>
            <div className="mb-1 px-0.5 text-[11px] font-bold uppercase tracking-wide text-cocoa/60">
              {cat.label}
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {options.map(({ emoji, label }) => {
                const isSelected = selected.includes(emoji);
                const disabled = !isSelected && selected.length >= MAX_EMOJI_TAGS;
                return (
                  <button
                    key={emoji}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={isSelected}
                    disabled={disabled}
                    onClick={() => onToggle(emoji)}
                    className={`flex aspect-square items-center justify-center rounded-full p-1.5 text-lg transition-all duration-150 ease-out ${
                      isSelected
                        ? "scale-110 bg-terracotta text-cream shadow-md"
                        : disabled
                        ? "cursor-not-allowed opacity-30"
                        : "bg-cream-dark/50 hover:scale-105 hover:bg-cream-dark hover:shadow-sm"
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EmojiPicker({
  value,
  onChange,
  mode = "popover",
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  mode?: "popover" | "inline";
}) {
  const [open, setOpen] = useState(false);
  const selected = parseEmojiTags(value);

  function toggle(emoji: string) {
    const isSelected = selected.includes(emoji);
    if (!isSelected && selected.length >= MAX_EMOJI_TAGS) return;
    const next = isSelected
      ? selected.filter((e) => e !== emoji)
      : [...selected, emoji];
    onChange(serializeEmojiTags(next));
  }

  if (mode === "inline") {
    return (
      <div>
        <div className="mb-2 px-0.5 text-xs font-bold uppercase tracking-wide text-cocoa/70">
          Выбрано: {selected.length} / {MAX_EMOJI_TAGS}
        </div>
        <div className="max-h-80 overflow-y-auto pr-1">
          <EmojiGrid selected={selected} onToggle={toggle} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block w-full">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-wrap items-center gap-1 rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 min-h-[2.5rem]">
          {selected.length === 0 ? (
            <span className="text-sm text-cocoa/40">Не выбрано</span>
          ) : (
            selected.map((e) => (
              <span key={e} className="text-lg leading-none">
                {e}
              </span>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 rounded-full bg-cream-dark/70 px-2.5 py-1.5 text-xs font-semibold text-espresso transition-colors hover:bg-cream-dark"
        >
          Выбрать
        </button>
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-[22rem] max-w-[90vw] rounded-2xl border border-copper/25 bg-parchment p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between px-0.5">
            <span className="text-xs font-bold uppercase tracking-wide text-cocoa/70">
              Выбрано: {selected.length} / {MAX_EMOJI_TAGS}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-terracotta hover:text-terracotta-dark"
            >
              Готово
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto pr-1">
            <EmojiGrid selected={selected} onToggle={toggle} />
          </div>
        </div>
      )}
    </div>
  );
}
