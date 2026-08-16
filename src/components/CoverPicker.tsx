"use client";

import { useEffect, useState } from "react";
import { coverUrl, searchCoverOptions } from "@/lib/openLibrary";

export function CoverPicker({
  title,
  author,
  onPick,
  onClose,
}: {
  title: string;
  author: string;
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  const [covers, setCovers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset loading state when title/author changes
    setLoading(true);
    searchCoverOptions(title, author)
      .then((ids) => {
        if (!cancelled) setCovers(ids);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [title, author]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-espresso-dark/60 backdrop-blur-sm fade-in p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in w-full max-w-md rounded-2xl bg-parchment shadow-2xl border border-copper/20 p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="display text-xl text-espresso-dark">Варианты обложек</h3>
          <button onClick={onClose} className="text-cocoa hover:text-espresso" aria-label="Закрыть">
            ✕
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-cocoa/60 py-6 text-center">Ищем обложки...</p>
        ) : covers.length === 0 ? (
          <p className="text-sm text-cocoa/60 py-6 text-center">Ничего не нашлось на Open Library.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
            {covers.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onPick(coverUrl(id, "M"));
                  onClose();
                }}
                className="rounded-lg overflow-hidden border border-copper/20 hover:ring-2 hover:ring-terracotta/50 aspect-[2/3]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl(id, "M")} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
