"use client";

import { BookStatus, STATUS_LABEL } from "@/lib/types";

export interface Filters {
  query: string;
  shelf: string;
  status: BookStatus | "all";
}

export function SearchFilterBar({
  filters,
  onChange,
  shelves,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  shelves: string[];
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
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
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Поиск по названию или автору..."
          className="w-full rounded-full border border-copper/25 bg-parchment/90 py-2 pl-9 pr-3 text-sm text-espresso placeholder:text-cocoa/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-terracotta/40"
        />
      </div>
      <select
        value={filters.shelf}
        onChange={(e) => onChange({ ...filters, shelf: e.target.value })}
        className="w-full sm:w-auto rounded-full border border-copper/25 bg-parchment/90 py-2 px-3 text-sm text-espresso shadow-inner focus:outline-none focus:ring-2 focus:ring-terracotta/40"
      >
        <option value="all">Все полки</option>
        {shelves.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as BookStatus | "all" })
        }
        className="w-full sm:w-auto rounded-full border border-copper/25 bg-parchment/90 py-2 px-3 text-sm text-espresso shadow-inner focus:outline-none focus:ring-2 focus:ring-terracotta/40"
      >
        <option value="all">Любой статус</option>
        {(Object.keys(STATUS_LABEL) as BookStatus[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
