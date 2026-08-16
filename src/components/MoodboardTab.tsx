"use client";

import { useEffect, useRef, useState } from "react";
import {
  addMoodboardImage,
  bringMoodboardImageToFront,
  deleteMoodboardImage,
  listMoodboardImages,
  updateMoodboardImageCoords,
  uploadMoodboardFile,
} from "@/lib/api";
import { MoodboardImage } from "@/lib/types";

const CARD_SIZE = 34; // approx width of a card, in % of a ~320px-wide canvas, used only for clamping math
const MAX_IMAGES = 9;

function tiltFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
  return ((Math.abs(hash) % 9) - 4) * 1.4; // roughly -5.6..5.6 degrees
}

function fallbackSpot(index: number) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return { x: 18 + col * 30, y: 18 + row * 28 };
}

export function MoodboardTab({ bookId }: { bookId: string }) {
  const [images, setImages] = useState<MoodboardImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const atLimit = images.length >= MAX_IMAGES;

  async function load() {
    setLoading(true);
    const { data, error } = await listMoodboardImages(bookId);
    if (error) setError(error.message);
    else setImages((data as MoodboardImage[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch when book changes
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  function nextPosition() {
    return images.length ? Math.max(...images.map((i) => i.position ?? 0)) + 1 : 0;
  }

  async function placeNewImage(url: string) {
    if (images.length >= MAX_IMAGES) {
      setError(`Можно добавить не более ${MAX_IMAGES} фото в мудборд.`);
      return;
    }
    const spot = fallbackSpot(images.length);
    const { data, error } = await addMoodboardImage(bookId, url, {
      position: nextPosition(),
      posX: spot.x,
      posY: spot.y,
    });
    if (error) {
      setError(error.message);
      return;
    }
    if (data) setImages((prev) => [...prev, data as MoodboardImage]);
  }

  async function handleAddLink() {
    const url = linkInput.trim();
    if (!url) return;
    setError(null);
    await placeNewImage(url);
    setLinkInput("");
    setShowLinkInput(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= MAX_IMAGES) {
      setError(`Можно добавить не более ${MAX_IMAGES} фото в мудборд.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const { data, error } = await uploadMoodboardFile(bookId, file);
      if (error) {
        setError(
          `Не удалось загрузить: ${error.message}. Проверьте, что в Supabase создан bucket "moodboard".`
        );
        return;
      }
      if (data) await placeNewImage(data.publicUrl);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    setImages((prev) => prev.filter((i) => i.id !== id));
    const { error } = await deleteMoodboardImage(id);
    if (error) setError(error.message);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, img: MoodboardImage) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    const currentX = img.pos_x ?? 20;
    const currentY = img.pos_y ?? 20;
    const pointerXPct = ((e.clientX - rect.left) / rect.width) * 100;
    const pointerYPct = ((e.clientY - rect.top) / rect.height) * 100;
    dragOffset.current = { dx: pointerXPct - currentX, dy: pointerYPct - currentY };
    setDraggingId(img.id);
    // bring to front visually + persist z-order
    const maxPos = nextPosition();
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, position: maxPos } : i)));
    void bringMoodboardImageToFront(img.id, maxPos);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pointerXPct = ((e.clientX - rect.left) / rect.width) * 100;
    const pointerYPct = ((e.clientY - rect.top) / rect.height) * 100;
    const half = CARD_SIZE / 2;
    const x = Math.min(100 - half, Math.max(half, pointerXPct - dragOffset.current.dx));
    const y = Math.min(100 - half, Math.max(half, pointerYPct - dragOffset.current.dy));
    setImages((prev) => prev.map((i) => (i.id === draggingId ? { ...i, pos_x: x, pos_y: y } : i)));
  }

  function handlePointerUp() {
    if (!draggingId) return;
    const img = images.find((i) => i.id === draggingId);
    setDraggingId(null);
    if (img && img.pos_x != null && img.pos_y != null) {
      void updateMoodboardImageCoords(img.id, img.pos_x, img.pos_y);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-terracotta-dark/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta-dark">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center sm:justify-between">
        <div className="relative">
          <button
            type="button"
            onClick={() => setAddMenuOpen((v) => !v)}
            disabled={atLimit || uploading}
            className="rounded-full bg-terracotta text-cream px-4 py-2 text-sm font-bold shadow hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Загрузка..." : "+ Добавить изображение"}
          </button>

          {addMenuOpen && !atLimit && (
            <>
              <button
                type="button"
                aria-label="Закрыть меню"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setAddMenuOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 z-20 w-56 rounded-xl border border-copper/25 bg-parchment shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setAddMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-sm text-espresso hover:bg-terracotta/10 transition-colors"
                >
                  📷 Загрузить с устройства
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddMenuOpen(false);
                    setShowLinkInput(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-sm text-espresso hover:bg-terracotta/10 transition-colors border-t border-copper/15"
                >
                  🔗 Добавить по ссылке
                </button>
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <span className="text-xs text-cocoa/60 whitespace-nowrap">
          {atLimit
            ? `Можно добавить не более ${MAX_IMAGES} фото`
            : `Добавлено ${images.length} из ${MAX_IMAGES}`}
        </span>
      </div>

      {showLinkInput && (
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center rounded-xl border border-copper/25 bg-cream/60 p-2.5">
          <input
            autoFocus
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleAddLink();
              if (e.key === "Escape") {
                setShowLinkInput(false);
                setLinkInput("");
              }
            }}
            placeholder="Вставить ссылку на картинку..."
            className="flex-1 w-full rounded-lg border border-copper/25 bg-cream px-2.5 py-1.5 text-sm text-espresso placeholder:text-cocoa/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
          <div className="flex gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleAddLink}
              disabled={!linkInput.trim()}
              className="rounded-full bg-sage text-cream px-3.5 py-1.5 text-xs font-bold shadow hover:brightness-105 disabled:opacity-50"
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(false);
                setLinkInput("");
              }}
              className="rounded-full bg-cocoa/10 text-cocoa px-3.5 py-1.5 text-xs font-bold hover:bg-cocoa/20"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-cocoa/60 py-6 text-center">Загрузка мудборда...</p>
      ) : (
        <div
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative w-full min-h-[420px] rounded-2xl border-2 border-dashed border-copper/25 bg-cream/40 paper-texture overflow-hidden touch-none select-none"
        >
          {images.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-6 text-center">
              <p className="text-sm text-cocoa/60">
                Добавьте изображения и расположите их на полотне
              </p>
              <p className="text-xs text-cocoa/40">
                Перетаскивайте изображения, меняйте их размер и создавайте композицию
              </p>
            </div>
          )}
          {images.map((img) => (
            <div
              key={img.id}
              onPointerDown={(e) => handlePointerDown(e, img)}
              style={{
                left: `${img.pos_x ?? 20}%`,
                top: `${img.pos_y ?? 20}%`,
                transform: `translate(-50%, -50%) rotate(${tiltFor(img.id)}deg)`,
                zIndex: img.position ?? 0,
              }}
              className={`group absolute w-28 sm:w-32 aspect-square rounded-lg overflow-hidden border-4 border-parchment shadow-[0_6px_14px_rgba(20,11,6,0.35)] cursor-grab active:cursor-grabbing ${
                draggingId === img.id ? "scale-105 shadow-2xl" : ""
              } transition-transform`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url}
                alt=""
                draggable={false}
                className="w-full h-full object-cover pointer-events-none"
              />
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => handleDelete(img.id)}
                className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full bg-espresso-dark/70 text-cream text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Удалить картинку"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
