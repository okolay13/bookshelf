"use client";

import { useEffect, useRef, useState } from "react";
import { coverUrl, searchTitles, TitleSuggestion } from "@/lib/openLibrary";

export function TitleAutocomplete({
  value,
  onChange,
  onPick,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (s: TitleSuggestion) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim() || value.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale suggestions when input is too short
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchTitles(value);
        setSuggestions(results);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  return (
    <div className="relative">
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        required
        className="w-full rounded-lg border border-copper/25 bg-cream/60 px-2.5 py-2 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
        placeholder={placeholder}
      />
      {open && (loading || suggestions.length > 0) && (
        <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-copper/25 bg-parchment shadow-xl">
          {loading && (
            <div className="px-3 py-2 text-xs text-cocoa/60">Поиск...</div>
          )}
          {suggestions.map((s) => (
            <button
              key={s.key}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(s);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-cream-dark/50 border-b border-copper/10 last:border-b-0"
            >
              <div className="w-7 h-10 flex-shrink-0 rounded bg-cream-dark/60 overflow-hidden flex items-center justify-center">
                {s.coverId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl(s.coverId, "S")} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs">📖</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-espresso truncate">{s.title}</div>
                <div className="text-xs text-cocoa/60 truncate">
                  {s.author}
                  {s.year ? ` · ${s.year}` : ""}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
