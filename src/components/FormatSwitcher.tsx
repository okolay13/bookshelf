"use client";

import { BookFormat, FORMAT_LABEL, FORMAT_ORDER } from "@/lib/types";

export function FormatSwitcher({
  value,
  onChange,
}: {
  value: BookFormat | null;
  onChange: (v: BookFormat) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {FORMAT_ORDER.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border ${
            value === f
              ? "bg-copper text-cream border-copper"
              : "bg-cream/70 text-espresso/70 border-copper/20 hover:bg-cream-dark/60"
          }`}
        >
          {FORMAT_LABEL[f]}
        </button>
      ))}
    </div>
  );
}
