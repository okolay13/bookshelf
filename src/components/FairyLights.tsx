"use client";

import { useMemo } from "react";

// Deterministic per-shelf seed so bulb placement stays stable across renders
// instead of reshuffling on every re-render.
function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) || 1;
}

function mulberry32(seed: number) {
  let t = seed;
  return function rand() {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Percentage-space coordinates (0-100 on both axes). Bulbs are placed as real
// HTML elements positioned by percentage rather than scaled SVG shapes, so
// they stay perfectly round and a fixed pixel size no matter how wide the
// shelf is — an SVG circle stretched non-uniformly across a wide, short
// viewBox turns into a flat smear instead of a bulb.
const SEGMENTS = 5;

// A real string of lights: a sagging wire strung between a few points, with
// warm bulbs scattered unevenly along it rather than a repeating pattern.
export function FairyLights({ seed, className = "" }: { seed: string; className?: string }) {
  const { wirePath, bulbs } = useMemo(() => {
    const rand = mulberry32(hashSeed(seed));
    const segW = 100 / SEGMENTS;
    const anchors: { x: number; y: number }[] = [{ x: 0, y: 12 + rand() * 8 }];
    let path = `M 0 ${anchors[0].y.toFixed(1)}`;
    for (let i = 1; i <= SEGMENTS; i++) {
      const x = i * segW;
      const y = 20 + rand() * 28;
      const cx = x - segW / 2;
      const cy = Math.max(anchors[i - 1].y, y) + 24 + rand() * 14;
      path += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
      anchors.push({ x, y });
    }

    const bulbCount = 9 + Math.floor(rand() * 4);
    const bulbs = Array.from({ length: bulbCount }, (_, i) => {
      const t = Math.min(0.98, Math.max(0.02, (i + 0.5 + (rand() - 0.5) * 0.7) / bulbCount));
      const segIdx = Math.min(SEGMENTS - 1, Math.floor(t * SEGMENTS));
      const a = anchors[segIdx];
      const b = anchors[segIdx + 1];
      const localT = t * SEGMENTS - segIdx;
      const x = a.x + (b.x - a.x) * localT;
      const y = a.y + (b.y - a.y) * localT + 8 + rand() * 8;
      const size = 6 + rand() * 3.5; // px, fixed regardless of shelf width
      const delay = rand() * 4.5;
      return { x, y, size, delay, key: i };
    });

    return { wirePath: path, bulbs };
  }, [seed]);

  return (
    <div className={`relative pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
        <path
          d={wirePath}
          fill="none"
          stroke="#241811"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.85"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {bulbs.map((b) => (
        <span
          key={b.key}
          className="absolute rounded-full glow-flicker"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            marginLeft: -b.size / 2,
            marginTop: -b.size / 2,
            background: "#fff8e6",
            boxShadow: `0 0 ${b.size * 1.4}px ${b.size * 0.6}px var(--fairy-light-color), 0 0 ${b.size * 4.5}px ${b.size * 2}px rgba(255, 207, 122, 0.4)`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
