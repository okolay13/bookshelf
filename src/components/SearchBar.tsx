"use client";

export function SearchBar({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cocoa/60"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Поиск по названию или автору..."
        className="w-full rounded-full border border-copper/25 bg-parchment/90 py-2 pl-9 pr-3 text-sm text-espresso placeholder:text-cocoa/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-terracotta/40"
      />
    </div>
  );
}
