// Cloth-bound spine textures: photographed book-cloth swatches, each paired
// with the foil tone (gold or silver) and title-text tone that read
// correctly against that cloth's colour.
const SPINE_PALETTE = [
  { image: "texture-01.webp", text: "#f3e7dd", foil: "gold" }, // бордовый
  { image: "texture-02.webp", text: "#fbf1de", foil: "gold" }, // карамельный
  { image: "texture-03.webp", text: "#f0e2cc", foil: "gold" }, // шоколадный
  { image: "texture-04.webp", text: "#3c2c18", foil: "gold" }, // горчичный
  { image: "texture-05.webp", text: "#f7ece7", foil: "gold" }, // пыльно-розовый
  { image: "texture-06.webp", text: "#eceade", foil: "silver" }, // темно-бирюзовый
  { image: "texture-07.webp", text: "#e8e6df", foil: "silver" }, // графитовый
  { image: "texture-08.webp", text: "#fbf3e2", foil: "gold" }, // терракотовый
  { image: "texture-09.webp", text: "#eceade", foil: "silver" }, // темно-синий
  { image: "texture-10.webp", text: "#f2ecd8", foil: "gold" }, // лесной зеленый
];

const TITLE_FONTS = ["sans", "display"] as const;
export type SpineTitleFont = (typeof TITLE_FONTS)[number];

// Small foil-stamped ornaments, applied sparingly (see DECOR_CHANCE below) so
// only a minority of spines carry one — enough to read as "some editions
// have decorative embossing" rather than a repeating stamp on every book.
const DECOR_TYPES = [
  "frame",
  "divider",
  "star",
  "laurel",
  "doubleFrame",
  "emblem",
  "circle",
  "diamond",
] as const;
export type SpineDecor = (typeof DECOR_TYPES)[number];
const DECOR_CHANCE = 0.28;

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic pseudo-random float in [0, 1), derived from the same seed
// hash but decorrelated per-`salt` so e.g. width and height don't jump in
// lockstep for neighbouring hash values.
function rand01(h: number, salt: number): number {
  const x = Math.sin(h * (salt + 1) * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function spineStyle(
  seed: string,
  overrides?: { width?: number | null }
) {
  const h = hashString(seed || "book");
  const palette = SPINE_PALETTE[h % SPINE_PALETTE.length];

  // Spine thickness: a handful of discrete "real book" widths rather than a
  // continuous range, so neighbouring spines visibly step rather than blend.
  const widthVariants = [38, 42, 46, 50, 54, 58];
  const autoWidth = widthVariants[Math.floor(h / 7) % widthVariants.length];
  const width = overrides?.width && overrides.width > 0 ? overrides.width : autoWidth;

  // Height: a base plus a per-book ±10% jitter, so the shelf silhouette
  // reads as naturally uneven instead of snapping to fixed tiers.
  const baseHeight = [188, 204, 220, 236][h % 4];
  const heightJitter = 0.9 + rand01(h, 2) * 0.2; // 0.90 - 1.10
  const height = Math.round(baseHeight * heightJitter);

  const tilt = (h % 5) - 2; // -2..2 degrees
  const titleFont = TITLE_FONTS[Math.floor(h / 13) % TITLE_FONTS.length];

  // Worn intensity instead of a boolean: every spine gets a little age, a
  // subset gets noticeably more, so books never read as clones of a mold.
  const wornAmount = 0.15 + rand01(h, 3) * 0.55; // 0.15 - 0.70
  const worn = h % 3 !== 1; // most spines show some wear; a minority stay crisp

  // Tiny per-book brightness variance so neighbouring spines never read as
  // identical flat cutouts of the same material, even when base colours are close.
  const depthShade = 0.8 + ((h % 17) / 16) * 0.16;
  // Subtle per-book hue drift (in degrees) layered on top, standing in for
  // dye-lot/fading variance between copies of "the same" cloth colour.
  const hueDrift = Math.round((rand01(h, 4) - 0.5) * 10); // -5..5deg

  const decor: SpineDecor | null =
    rand01(h, 5) < DECOR_CHANCE ? DECOR_TYPES[Math.floor(h / 17) % DECOR_TYPES.length] : null;

  return {
    ...palette,
    height,
    width,
    tilt,
    titleFont,
    worn,
    wornAmount,
    depthShade,
    hueDrift,
    decor,
  };
}

// Vertical spine text never truncates: the font shrinks to fit the available
// run length (spine height minus the foil margins) instead. Clamped to a
// floor that stays legible; beyond that the browser's ellipsis is the last
// resort, not the default.
export function spineTitleFontSize(title: string, height: number, width: number): number {
  const available = height - 28;
  const perChar = available / Math.max(title.length, 1);
  const widthCap = Math.max(9, Math.min(15, width / 3.4));
  return Math.max(7.5, Math.min(widthCap, perChar * 0.72));
}
