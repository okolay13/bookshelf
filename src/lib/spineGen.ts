import { uploadBookImage } from "@/lib/api";

const SPINE_WIDTH = 120;
const SPINE_HEIGHT = 600;
export const SPINE_CROP_FRACTION = 0.16;
export const SPINE_CROP_HEIGHT_FRACTION = 0.8;
const CROP_FRACTION = SPINE_CROP_FRACTION;
const CROP_HEIGHT_FRACTION = SPINE_CROP_HEIGHT_FRACTION;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("не удалось загрузить обложку через прокси"));
    img.src = url;
  });
}

export type SpineResult =
  | { url: string; error?: undefined }
  | { url?: undefined; error: string };

export async function generateSpineBlob(
  coverUrl: string,
  cropX = 0.5,
  cropY = 0.5
): Promise<{ blob: Blob; error?: undefined } | { blob?: undefined; error: string }> {
  const proxiedUrl = `/api/cover-proxy?url=${encodeURIComponent(coverUrl)}`;
  let proxyDetail = "";
  try {
    const proxyRes = await fetch(proxiedUrl);
    if (!proxyRes.ok) {
      const body = await proxyRes.text().catch(() => "");
      proxyDetail = ` (${proxyRes.status}${body ? `: ${body}` : ""})`;
    }
  } catch {
    // ignore, the <img> load below will surface the real error
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(proxiedUrl);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `${msg}${proxyDetail}` };
  }

  const canvas = document.createElement("canvas");
  canvas.width = SPINE_WIDTH;
  canvas.height = SPINE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { error: "canvas 2d context недоступен" };

  const cropWidth = img.naturalWidth * CROP_FRACTION;
  const maxStartX = Math.max(0, img.naturalWidth - cropWidth);
  const startX = Math.min(1, Math.max(0, cropX)) * maxStartX;

  const cropHeight = img.naturalHeight * CROP_HEIGHT_FRACTION;
  const maxStartY = Math.max(0, img.naturalHeight - cropHeight);
  const startY = Math.min(1, Math.max(0, cropY)) * maxStartY;
  try {
    ctx.drawImage(img, startX, startY, cropWidth, cropHeight, 0, 0, SPINE_WIDTH, SPINE_HEIGHT);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `drawImage: ${msg}` };
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9);
    } catch {
      resolve(null);
    }
  });
  if (!blob) return { error: "canvas.toBlob вернул пусто (скорее всего canvas tainted, картинка не прошла через прокси)" };
  return { blob };
}

export async function generateAndUploadSpine(
  coverUrl: string,
  cropX = 0.5,
  cropY = 0.5
): Promise<SpineResult> {
  const result = await generateSpineBlob(coverUrl, cropX, cropY);
  if (!result.blob) {
    console.error("generateAndUploadSpine: blob generation failed:", result.error);
    return { error: result.error };
  }
  const file = new File([result.blob], "spine.jpg", { type: "image/jpeg" });
  const { data, error } = await uploadBookImage(file, "spine");
  if (error || !data) {
    console.error("generateAndUploadSpine: upload failed", error);
    return { error: `загрузка не удалась: ${error?.message ?? "нет данных"}` };
  }
  return { url: data.publicUrl };
}
