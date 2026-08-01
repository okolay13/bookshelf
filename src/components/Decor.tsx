export function PottedPlant({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} fill="none">
      <ellipse cx="40" cy="94" rx="18" ry="4" fill="#3a2116" opacity="0.25" />
      <path
        d="M22 66h36l-4 26a4 4 0 0 1-4 3.5H30a4 4 0 0 1-4-3.5L22 66Z"
        fill="#b9793f"
      />
      <path d="M22 66h36l-1.4 8H23.4L22 66Z" fill="#a4632f" />
      <path
        d="M40 70C34 55 16 54 12 40c10 -2 24 4 28 20Z"
        fill="#4f6b41"
      />
      <path
        d="M40 70c4-17 22-19 26-32-11-2-24 5-27 21Z"
        fill="#6f8f5b"
      />
      <path
        d="M40 70C38 50 44 38 40 24c-8 6-11 22-4 34 2 4 3 8 4 12Z"
        fill="#5c7a4b"
      />
    </svg>
  );
}

export function Candle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 90" className={className} fill="none">
      <ellipse cx="20" cy="16" rx="10" ry="7" fill="#ffcf7a" className="glow-flicker" opacity="0.55" />
      <path d="M20 6c3 4 4 7 1.5 9.5S17 16 20 6Z" fill="#ff9d4d" className="glow-flicker" />
      <path d="M19 15v6" stroke="#4a3123" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="9" y="21" width="22" height="52" rx="4" fill="#f6ead4" />
      <rect x="9" y="21" width="22" height="52" rx="4" fill="url(#candleShade)" />
      <path d="M9 33c4 2 18 2 22 0v6c-4 2-18 2-22 0Z" fill="#e6c98f" opacity="0.6" />
      <defs>
        <linearGradient id="candleShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#c96a45" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LampGlow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} fill="none">
      <ellipse cx="80" cy="70" rx="75" ry="65" fill="url(#lampGlow)" className="glow-flicker" />
      <path d="M60 10 L100 10 L118 55 L42 55 Z" fill="#c96a45" />
      <path d="M60 10 L100 10 L112 40 L48 40 Z" fill="#e08659" opacity="0.7" />
      <rect x="76" y="55" width="8" height="30" fill="#4a3123" />
      <ellipse cx="80" cy="87" rx="22" ry="5" fill="#4a3123" />
      <defs>
        <radialGradient id="lampGlow" cx="0.5" cy="0.35" r="0.65">
          <stop offset="0" stopColor="#ffe4ad" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#ffcf7a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none">
      <path
        d="M6 34C4 20 14 6 34 6c1 18-12 30-28 28Z"
        fill="#6f8f5b"
      />
      <path d="M8 32c8-10 16-16 24-24" stroke="#4f6b41" strokeWidth="1.5" strokeLinecap="round" />
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
