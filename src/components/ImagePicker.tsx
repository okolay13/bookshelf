"use client";

import { useRef, useState } from "react";
import { uploadBookImage } from "@/lib/api";

export function ImagePicker({
  value,
  onChange,
  kind,
  label,
  aspectClassName = "aspect-[2/3]",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  kind: "cover" | "spine";
  label: string;
  aspectClassName?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { data, error } = await uploadBookImage(file, kind);
      if (error) {
        setError(
          `Не удалось загрузить: ${error.message}. Проверьте, что в Supabase создан bucket "book-images".`
        );
        return;
      }
      if (data) onChange(data.publicUrl);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`relative flex items-center justify-center overflow-hidden rounded-lg border-2 border-dashed cursor-pointer transition-colors ${aspectClassName} ${
          dragOver
            ? "border-terracotta bg-terracotta/10"
            : "border-copper/30 bg-cream/40 hover:bg-cream/60"
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-cocoa/60 text-center px-2">
            Перетащите картинку сюда или нажмите, чтобы выбрать из галереи
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-espresso-dark/40 text-cream text-xs">
            Загрузка...
          </span>
        )}
        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full bg-espresso-dark/70 text-cream text-xs"
            aria-label="Удалить картинку"
          >
            ✕
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-xs text-terracotta-dark mt-1">{error}</p>}
    </div>
  );
}
