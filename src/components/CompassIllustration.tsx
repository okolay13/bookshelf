export default function CompassIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* soft ground shadow */}
      <ellipse cx="100" cy="248" rx="62" ry="9" fill="#0c0603" opacity="0.4" />

      {/* warm ambient bloom around the whole orb */}
      <ellipse cx="100" cy="132" rx="96" ry="96" fill="url(#orbBloom)" className="glow-flicker" />

      {/* two-tier bronze pedestal */}
      <ellipse cx="100" cy="228" rx="58" ry="14" fill="url(#baseWide)" />
      <path d="M56 210c0-10 20-16 44-16s44 6 44 16-8 20-44 20-44-10-44-20Z" fill="url(#baseNarrow)" />
      <ellipse cx="100" cy="210" rx="44" ry="11" fill="url(#baseTop)" />
      <path d="M62 202c8-5 22-8 38-8s30 3 38 8" stroke="#e6b870" strokeWidth="1.5" opacity="0.5" fill="none" />

      {/* amber glass sphere */}
      <circle cx="100" cy="140" r="66" fill="url(#glassBody)" />
      <circle cx="100" cy="140" r="66" fill="url(#glassShade)" />
      <circle cx="100" cy="140" r="66" stroke="#3a2210" strokeWidth="2" opacity="0.35" />

      {/* golden glow core inside the glass */}
      <ellipse cx="100" cy="150" rx="38" ry="26" fill="url(#innerGlow)" className="glow-flicker" />

      {/* tiny open book floating inside */}
      <g transform="translate(100 152)">
        <path d="M-18 -4 C-9 -9 -2 -9 0 -5 C2 -9 9 -9 18 -4 L18 4 C9 -1 2 -1 0 3 C-2 -1 -9 -1 -18 4 Z" fill="#f6d98c" />
        <path d="M0 -5 L0 3" stroke="#8a5a1e" strokeWidth="1" opacity="0.6" />
      </g>

      {/* golden sparkles scattered across the whole sphere */}
      <g fill="#ffe4ad">
        <circle cx="70" cy="98" r="1.8" opacity="0.9" />
        <circle cx="132" cy="90" r="1.5" opacity="0.8" />
        <circle cx="118" cy="112" r="1.3" opacity="0.85" />
        <circle cx="84" cy="108" r="1.2" opacity="0.7" />
        <circle cx="60" cy="130" r="1.6" opacity="0.8" />
        <circle cx="140" cy="128" r="1.4" opacity="0.75" />
        <circle cx="76" cy="150" r="1.3" opacity="0.7" />
        <circle cx="128" cy="160" r="1.5" opacity="0.8" />
        <circle cx="100" cy="176" r="1.3" opacity="0.7" />
        <circle cx="62" cy="168" r="1.2" opacity="0.65" />
        <circle cx="112" cy="182" r="1.1" opacity="0.6" />
        <circle cx="90" cy="120" r="1" opacity="0.6" />
      </g>

      {/* big soft highlight, upper right */}
      <ellipse cx="128" cy="94" rx="16" ry="10" fill="#fff6df" opacity="0.55" transform="rotate(-20 128 94)" />
      <path
        d="M56 108c-4 20-2 40 10 56"
        stroke="#fff6df"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.25"
        fill="none"
      />

      <defs>
        <radialGradient id="orbBloom" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.3" />
          <stop offset="0.6" stopColor="#ff9d4d" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ff9d4d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glassBody" cx="0.4" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#f6d99a" stopOpacity="0.6" />
          <stop offset="0.5" stopColor="#c9975a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#5c3a1e" stopOpacity="0.4" />
        </radialGradient>
        <linearGradient id="glassShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#2a1608" stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id="innerGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6df" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#ffcf7a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="baseNarrow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5a2e" />
          <stop offset="1" stopColor="#3a2410" />
        </linearGradient>
        <linearGradient id="baseWide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b4020" />
          <stop offset="1" stopColor="#2a180c" />
        </linearGradient>
        <radialGradient id="baseTop" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#c99a5a" />
          <stop offset="1" stopColor="#6b4020" />
        </radialGradient>
      </defs>
    </svg>
  );
}
