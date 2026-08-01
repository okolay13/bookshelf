const SPINE_PALETTE = [
  { bg: "#a84f31", edge: "#c96a45", text: "#fbf3e2" },
  { bg: "#6b4530", edge: "#8a5f45", text: "#f6ead4" },
  { bg: "#4f6b41", edge: "#6f8f5b", text: "#fbf3e2" },
  { bg: "#b9793f", edge: "#d4924f", text: "#3a2116" },
  { bg: "#7a3b2e", edge: "#9a5140", text: "#f6ead4" },
  { bg: "#3d5a80", edge: "#5b7ba0", text: "#f6ead4" },
  { bg: "#8a4b6b", edge: "#a6698a", text: "#fbf3e2" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function spineStyle(seed: string) {
  const h = hashString(seed || "book");
  const palette = SPINE_PALETTE[h % SPINE_PALETTE.length];
  const heightVariants = [180, 196, 212, 226, 240];
  const height = heightVariants[h % heightVariants.length];
  const widthVariants = [40, 44, 48, 52];
  const width = widthVariants[Math.floor(h / 7) % widthVariants.length];
  const tilt = (h % 5) - 2; // -2..2 degrees
  return { ...palette, height, width, tilt };
}
