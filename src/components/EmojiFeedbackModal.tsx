"use client";

import { useState } from "react";
import { EmojiPicker } from "./EmojiPicker";

export function EmojiFeedbackModal({
  title,
  subtitle,
  initialTags,
  confirmLabel,
  dismissLabel,
  onConfirm,
  onDismiss,
}: {
  title: string;
  subtitle?: string;
  initialTags: string | null;
  confirmLabel: string;
  dismissLabel: string;
  onConfirm: (next: string | null) => void | Promise<void>;
  onDismiss: () => void;
}) {
  const [tags, setTags] = useState<string | null>(initialTags);
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    setSaving(true);
    try {
      await onConfirm(tags);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-espresso-dark/60 backdrop-blur-sm fade-in p-0 sm:p-4"
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pop-in relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-parchment shadow-2xl border border-copper/20 p-5 space-y-4"
      >
        <div>
          <h2 className="display text-xl text-espresso-dark">{title}</h2>
          {subtitle && <p className="text-sm text-cocoa/70 mt-1">{subtitle}</p>}
        </div>

        <EmojiPicker value={tags} onChange={setTags} mode="inline" />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-copper/15">
          <button
            type="button"
            onClick={onDismiss}
            disabled={saving}
            className="rounded-full bg-cream-dark/70 px-4 py-1.5 text-sm font-semibold text-espresso hover:bg-cream-dark disabled:opacity-60"
          >
            {dismissLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="rounded-full bg-sage text-cream px-4 py-1.5 text-sm font-bold shadow hover:brightness-105 disabled:opacity-60"
          >
            {saving ? "Сохранение..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
