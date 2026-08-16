import type { DecorType } from "@/lib/types";

export function PottedPlant({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={`roughen ${className}`} fill="none">
      <ellipse cx="40" cy="94" rx="20" ry="5" fill="#0c0603" opacity="0.45" />
      <path
        d="M22 66h36l-4 26a4 4 0 0 1-4 3.5H30a4 4 0 0 1-4-3.5L22 66Z"
        fill="url(#potBody)"
      />
      <path d="M22 66h36l-1.4 8H23.4L22 66Z" fill="#5c2a08" opacity="0.7" />
      <path d="M23.5 62h33l1 4h-35Z" fill="#e2a15a" opacity="0.55" />
      <path d="M25 70l2 18" stroke="#7a3d12" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
      <path d="M40 70l1 20" stroke="#7a3d12" strokeWidth="1" opacity="0.35" strokeLinecap="round" />
      <path d="M55 70l-2 18" stroke="#7a3d12" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
      <ellipse cx="30" cy="70" rx="3" ry="6" fill="#e2a15a" opacity="0.35" />
      {/* extra back leaves for fullness */}
      <path d="M40 70C44 52 58 48 62 34c-10-1-22 7-25 22Z" fill="url(#leafDark)" opacity="0.85" />
      <path d="M40 70C36 50 22 44 18 30c10-1 22 8 25 24Z" fill="url(#leafMid)" opacity="0.85" />
      <path
        d="M40 70C34 55 16 54 12 40c10 -2 24 4 28 20Z"
        fill="url(#leafDark)"
      />
      <path
        d="M40 70c4-17 22-19 26-32-11-2-24 5-27 21Z"
        fill="url(#leafMid)"
      />
      <path
        d="M40 70C38 50 44 38 40 24c-8 6-11 22-4 34 2 4 3 8 4 12Z"
        fill="url(#leafLight)"
      />
      <path d="M40 70C38 55 40 46 40 30" stroke="#1e3018" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      <path d="M12 40c4 3 8 5 12 8M62 34c-4 3-9 6-13 9" stroke="#1e3018" strokeWidth="0.8" opacity="0.35" strokeLinecap="round" />
      <defs>
        <linearGradient id="potBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c97a34" />
          <stop offset="1" stopColor="#8a4515" />
        </linearGradient>
        <linearGradient id="leafDark" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#1c2e17" />
          <stop offset="1" stopColor="#2e4a26" />
        </linearGradient>
        <linearGradient id="leafMid" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#294020" />
          <stop offset="1" stopColor="#4c7038" />
        </linearGradient>
        <linearGradient id="leafLight" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#33502a" />
          <stop offset="1" stopColor="#6a8f4a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SmallPot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 46 56" className={`roughen ${className}`} fill="none">
      <ellipse cx="23" cy="52" rx="12" ry="3" fill="#0c0603" opacity="0.4" />
      <path d="M12 36h22l-2.4 15a3 3 0 0 1-3 2.6H17.4a3 3 0 0 1-3-2.6L12 36Z" fill="url(#smallPotBody)" />
      <path d="M12 36h22l-0.9 5H12.9L12 36Z" fill="#5c2a08" opacity="0.7" />
      <path d="M23 38C19 27 8 27 5 18c7-1 15 4 18 14Z" fill="#243c1c" />
      <path d="M23 38c2-11 13-13 15-21-7-1-14 4-16 15Z" fill="#3d5e2e" />
      <path d="M23 38c-1-9 2-15 0-22-5 4-6 13-2 20Z" fill="#597e40" />
      <defs>
        <linearGradient id="smallPotBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b56a2b" />
          <stop offset="1" stopColor="#7a3c10" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HangingVine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 120" className={`roughen ${className}`} fill="none">
      <path
        d="M30 0c-4 20 10 26 6 46s-14 22-8 44"
        stroke="#3d5e2e"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      {[
        { cx: 24, cy: 14, r: 6 },
        { cx: 36, cy: 30, r: 5.5 },
        { cx: 22, cy: 48, r: 6.5 },
        { cx: 32, cy: 66, r: 5 },
        { cx: 20, cy: 84, r: 6 },
        { cx: 30, cy: 100, r: 5 },
      ].map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.cx}
          cy={leaf.cy}
          rx={leaf.r}
          ry={leaf.r * 0.6}
          fill={i % 2 === 0 ? "#4c7038" : "#345226"}
          opacity="0.9"
          transform={`rotate(${(i % 2 === 0 ? 1 : -1) * 25} ${leaf.cx} ${leaf.cy})`}
        />
      ))}
    </svg>
  );
}

export function Candle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 90" className={`roughen overflow-visible ${className}`} fill="none">
      <ellipse cx="20" cy="16" rx="34" ry="28" fill="url(#candleGlowOuter)" className="glow-flicker" />
      <ellipse cx="20" cy="16" rx="9" ry="6.5" fill="url(#candleGlowCore)" className="glow-flicker" />
      <path d="M20 6c3 4 4 7 1.5 9.5S17 16 20 6Z" fill="#ff9d4d" className="glow-flicker" />
      <path d="M19 15v6" stroke="#2e1d13" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="9" y="21" width="22" height="52" rx="4" fill="url(#candleWax)" />
      <rect x="9" y="21" width="22" height="52" rx="4" fill="url(#candleShade)" />
      <path d="M9 33c4 2 18 2 22 0v6c-4 2-18 2-22 0Z" fill="#8a4310" opacity="0.55" />
      <path d="M13 25c-1 6-1 12 0 18" stroke="#fff2d9" strokeWidth="1" opacity="0.35" strokeLinecap="round" />
      <defs>
        <linearGradient id="candleWax" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d8bd8e" />
          <stop offset="0.5" stopColor="#f6ead4" />
          <stop offset="1" stopColor="#c9a97a" />
        </linearGradient>
        <linearGradient id="candleShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#5c2a08" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id="candleGlowOuter" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ffcf7a" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="candleGlowCore" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe4ad" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffe4ad" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function LampGlow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 260" className={`overflow-visible ${className}`} fill="none">
      <ellipse cx="80" cy="128" rx="100" ry="90" fill="url(#lampGlowOuter)" className="glow-flicker glow-soft-blur" />
      <ellipse cx="80" cy="130" rx="76" ry="66" fill="url(#lampGlow)" className="glow-flicker" />
      <ellipse cx="80" cy="90" rx="32" ry="24" fill="url(#lampGlowCore)" className="glow-flicker" />

      <g className="roughen">
        {/* pleated fabric shade */}
        <path d="M46 62 L114 62 L130 108 L30 108 Z" fill="url(#lampShade)" />
        <g stroke="#a8712f" strokeWidth="1" opacity="0.35">
          <path d="M54 63 L42 107" />
          <path d="M64 61 L56 108" />
          <path d="M74 60 L70 108" />
          <path d="M86 60 L90 108" />
          <path d="M96 61 L104 108" />
          <path d="M106 63 L118 107" />
        </g>
        {/* brass trim rings */}
        <rect x="44" y="59" width="72" height="5" rx="2.5" fill="url(#lampBrass)" />
        <rect x="28" y="105" width="104" height="5" rx="2.5" fill="url(#lampBrass)" />
        {/* beaded fringe */}
        <g fill="#c9975a" opacity="0.85">
          {[34, 44, 54, 64, 74, 86, 96, 106, 116, 126].map((x, i) => (
            <circle key={x} cx={x} cy={114 + (i % 2 === 0 ? 0 : 1)} r="2" />
          ))}
        </g>
        {/* finial */}
        <circle cx="80" cy="52" r="4" fill="url(#lampBrass)" />
        <rect x="78" y="46" width="4" height="8" fill="url(#lampBrass)" />

        {/* turned brass stem */}
        <path
          d="M74 108 h12 v14 c8 4 8 12 0 18 c6 4 6 14 -2 20 h-8 c-8-6-8-16-2-20 c-8-6-8-14 0-18Z"
          fill="url(#lampBrass)"
        />
        <rect x="76" y="160" width="8" height="26" fill="url(#lampBrass)" />

        {/* tiered round base */}
        <ellipse cx="80" cy="196" rx="30" ry="8" fill="url(#lampBrass)" />
        <ellipse cx="80" cy="204" rx="22" ry="6" fill="url(#lampBrassDark)" />
        <ellipse cx="80" cy="209" rx="15" ry="4" fill="url(#lampBrass)" />
      </g>

      <defs>
        <linearGradient id="lampShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6ecd4" />
          <stop offset="1" stopColor="#e0c98a" />
        </linearGradient>
        <linearGradient id="lampBrass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d38c" />
          <stop offset="1" stopColor="#a8712f" />
        </linearGradient>
        <linearGradient id="lampBrassDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9975a" />
          <stop offset="1" stopColor="#6b4020" />
        </linearGradient>
        <radialGradient id="lampGlowCore" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6df" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#ffe4ad" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffe4ad" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lampGlow" cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stopColor="#ffe4ad" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#ffcf7a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lampGlowOuter" cx="0.5" cy="0.4" r="0.72">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#ff9d4d" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ff9d4d" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`roughen ${className}`} fill="none">
      <path
        d="M6 34C4 20 14 6 34 6c1 18-12 30-28 28Z"
        fill="#4f7a45"
      />
      <path d="M8 32c8-10 16-16 24-24" stroke="#35532d" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function StarSpark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path
        d="M10 0c0 5.5 1 8.5 6 10-5 1.5-6 4.5-6 10 0-5.5-1-8.5-6-10 5-1.5 6-4.5 6-10Z"
        fill="#ffcf7a"
      />
    </svg>
  );
}

export function BookStack({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 40" className={`roughen ${className}`} fill="none">
      <ellipse cx="40" cy="37" rx="34" ry="3" fill="#0c0603" opacity="0.4" />
      <rect x="8" y="24" width="64" height="10" rx="2" fill="#7a2606" />
      <rect x="8" y="24" width="64" height="3" rx="1.5" fill="#a5401a" opacity="0.6" />
      <rect x="12" y="15" width="52" height="10" rx="2" fill="#8a4515" transform="rotate(-2 38 20)" />
      <rect x="16" y="6" width="44" height="10" rx="2" fill="#3d5e2e" transform="rotate(2 38 11)" />
    </svg>
  );
}

export function AutumnBranch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 90" className={`roughen ${className}`} fill="none">
      <ellipse cx="35" cy="86" rx="16" ry="3.5" fill="#0c0603" opacity="0.4" />
      <path
        d="M35 84C33 60 40 50 30 30 24 18 30 6 38 2"
        stroke="#6b4326"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M32 46c-8-2-14-10-13-18" stroke="#6b4326" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M31 62c8-1 15-8 15-16" stroke="#6b4326" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {[
        { cx: 20, cy: 26, r: 6, fill: "#c1440e" },
        { cx: 46, cy: 46, r: 6.5, fill: "#e08a2b" },
        { cx: 18, cy: 56, r: 5.5, fill: "#a5401a" },
        { cx: 36, cy: 10, r: 5, fill: "#d4972f" },
      ].map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.cx}
          cy={leaf.cy}
          rx={leaf.r}
          ry={leaf.r * 0.62}
          fill={leaf.fill}
          opacity="0.92"
          transform={`rotate(${(i % 2 === 0 ? 1 : -1) * 30} ${leaf.cx} ${leaf.cy})`}
        />
      ))}
    </svg>
  );
}

export function CatFigurine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={`roughen ${className}`} fill="none">
      <ellipse cx="30" cy="56" rx="18" ry="3.5" fill="#0c0603" opacity="0.4" />
      <path
        d="M16 54c-2-16 0-26 14-26s16 10 14 26Z"
        fill="url(#catBody)"
      />
      <path d="M16 30c-1-8 2-14 6-16 1 5 1 9 0 14Z" fill="url(#catBody)" />
      <path d="M38 30c1-8-2-14-6-16-1 5-1 9 0 14Z" fill="url(#catBody)" />
      <path d="M19 15l3 8M41 15l-3 8" stroke="#3a2410" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <ellipse cx="24" cy="26" rx="2" ry="2.6" fill="#2a1a0d" />
      <ellipse cx="36" cy="26" rx="2" ry="2.6" fill="#2a1a0d" />
      <path d="M28 30h4l-2 2z" fill="#a5401a" />
      <path d="M22 52c2-10 14-10 16 0" stroke="#7a4a1e" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
      <defs>
        <linearGradient id="catBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0a45c" />
          <stop offset="1" stopColor="#a5622a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MiniLamp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 64" className={`overflow-visible ${className}`} fill="none">
      <ellipse cx="28" cy="30" rx="34" ry="28" fill="url(#miniLampGlow)" className="glow-flicker" />
      <g className="roughen">
        <path d="M16 20 L40 20 L48 42 L8 42 Z" fill="url(#miniLampShade)" />
        <rect x="24" y="42" width="8" height="14" fill="#1c100a" />
        <ellipse cx="28" cy="58" rx="14" ry="3.5" fill="#1c100a" />
      </g>
      <defs>
        <linearGradient id="miniLampShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6a955" />
          <stop offset="1" stopColor="#8a4515" />
        </linearGradient>
        <radialGradient id="miniLampGlow" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#ffe4ad" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="#ffcf7a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Crystal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 60" className={`roughen ${className}`} fill="none">
      <ellipse cx="25" cy="56" rx="14" ry="3" fill="#0c0603" opacity="0.4" />
      <path d="M25 4 L40 22 L32 54 H18 L10 22 Z" fill="url(#crystalBody)" />
      <path d="M25 4 L40 22 L25 22 Z" fill="#f0c9e8" opacity="0.65" />
      <path d="M25 4 L10 22 L25 22 Z" fill="#c78bd6" opacity="0.55" />
      <path d="M18 54 L25 22 L32 54 Z" fill="#9a5fb0" opacity="0.5" />
      <path d="M25 22v32" stroke="#fff" strokeWidth="0.8" opacity="0.3" />
      <defs>
        <linearGradient id="crystalBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8b8ea" />
          <stop offset="1" stopColor="#8a4fae" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// The catalog offered in the "add decor" picker: freely placeable items a
// user can drop between books on any shelf, in unlimited quantity.
// Width reserved per item for row-packing / collision math (see ShelfRow's
// chunkByWidth). Kept in step with each item's rendered width at its largest
// (desktop) breakpoint — see DECOR_HEIGHT_CLASS in ShelfRow.tsx — so packed
// rows never let two items visually overlap even though only height is set
// on the actual <svg>.
export const DECOR_CATALOG: { type: DecorType; label: string; Component: typeof PottedPlant; width: number }[] = [
  { type: "plant", label: "Растение", Component: PottedPlant, width: 142 },
  { type: "candle", label: "Свеча", Component: Candle, width: 58 },
  { type: "tea", label: "Чашка", Component: Teacup, width: 170 },
  { type: "books", label: "Стопка книг", Component: BookStack, width: 196 },
  { type: "branch", label: "Осенняя веточка", Component: AutumnBranch, width: 119 },
  { type: "cat", label: "Фигурка котика", Component: CatFigurine, width: 154 },
  { type: "lamp", label: "Мини-лампа", Component: MiniLamp, width: 158 },
  { type: "crystal", label: "Кристалл", Component: Crystal, width: 117 },
];

export function Teacup({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 50" className={`roughen ${className}`} fill="none">
      <path d="M25 6c-2 4-1 8 3 8s5-4 3-8" stroke="#b5651d" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M10 18h32l-3 20a6 6 0 0 1-6 5H19a6 6 0 0 1-6-5L10 18Z" fill="#faf1dd" />
      <path d="M42 22c8-2 12 3 10 9s-9 7-13 4" stroke="#b5651d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="26" cy="18" rx="16" ry="3" fill="#e5cf9e" />
    </svg>
  );
}
