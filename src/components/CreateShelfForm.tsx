"use client";

import { useState } from "react";
import { SHELF_COLOR_PRESETS } from "@/lib/types";

export function CreateShelfForm({
  mode = "create",
  initialName = "",
  initialColor,
  onCancel,
  onCreate,
}: {
  mode?: "create" | "edit";
  initialName?: string;
  initialColor?: string;
  onCancel: () => void;
  onCreate: (name: string, color: string) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor ?? SHELF_COLOR_PRESETS[0]);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await onCreate(trimmed, color);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 px-1 mb-1.5">
          Название полки
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Домашняя библиотека"
          className="w-full rounded-lg border border-copper/25 bg-cream/60 px-3 py-2.5 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
        />
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-cocoa/60 px-1 mb-1.5">
          Цвет полки
        </div>
        <div className="flex flex-wrap gap-2 px-1">
          {SHELF_COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              title={c}
              aria-label={`Выбрать цвет ${c}`}
              aria-pressed={color === c}
              className={`h-7 w-7 rounded-full border-2 transition-transform ${
                color === c ? "border-espresso scale-110" : "border-transparent hover:scale-105"
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full bg-cream-dark px-3.5 py-2 text-xs font-semibold text-espresso"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="flex-1 rounded-full bg-sage text-cream py-2 text-xs font-bold shadow hover:brightness-105 disabled:opacity-50"
        >
          {mode === "edit" ? "Сохранить" : "Создать полку"}
        </button>
      </div>
    </form>
  );
}
