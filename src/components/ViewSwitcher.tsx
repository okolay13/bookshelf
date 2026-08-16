"use client";

import type { ReactNode } from "react";

export type ViewMode = "shelf" | "grid" | "list";

const OPTIONS: { key: ViewMode; label: string; icon: ReactNode }[] = [
  {
    key: "shelf",
    label: "Полка",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4v16M9 4v16M14 4v16M19 4v16" />
        <path d="M3 9h3M8 6h3M13 10h3M18 7h3" />
      </svg>
    ),
  },
  {
    key: "grid",
    label: "Сетка",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    key: "list",
    label: "Список",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13" />
        <circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function ViewSwitcher({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-parchment/80 p-1 shadow-inner border border-copper/20">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          title={opt.label}
          aria-label={opt.label}
          aria-pressed={value === opt.key}
          className={`rounded-full px-3 py-1.5 transition-colors ${
            value === opt.key
              ? "bg-terracotta text-cream shadow"
              : "text-espresso/70 hover:bg-cream-dark/60"
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
