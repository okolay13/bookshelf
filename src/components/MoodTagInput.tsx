"use client";

import { useState } from "react";

export function MoodTagInput({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
}) {
  const [draft, setDraft] = useState("");

  function addTag(tag: string) {
    const t = tag.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  const remainingSuggestions = suggestions.filter((s) => !value.includes(s));

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-sage/20 text-sage-dark px-2.5 py-1 text-xs font-semibold"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-terracotta-dark"
              aria-label={`Убрать тег ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(draft);
          }
        }}
        placeholder="лёгкая, мрачная, динамичная..."
        className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-1.5 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
      />
      {remainingSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {remainingSuggestions.slice(0, 10).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="rounded-full border border-copper/20 bg-cream/40 px-2.5 py-1 text-xs text-cocoa/70 hover:bg-cream-dark/50"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
