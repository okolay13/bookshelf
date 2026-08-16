export default function LuggageIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 260"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* soft ground shadow */}
      <ellipse cx="110" cy="248" rx="80" ry="9" fill="#0c0603" opacity="0.4" />

      {/* trunk body */}
      <g>
        <rect x="30" y="130" width="160" height="86" rx="10" fill="#2e4a34" />
        <rect x="30" y="130" width="160" height="86" rx="10" fill="url(#trunkShade)" />
        {/* brass corner guards */}
        {[
          [30, 130],
          [174, 130],
          [30, 196],
          [174, 196],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="16" height="20" rx="3" fill="url(#brass)" />
        ))}
        {/* leather straps */}
        <rect x="72" y="130" width="12" height="86" fill="#6b3a1e" opacity="0.9" />
        <rect x="136" y="130" width="12" height="86" fill="#6b3a1e" opacity="0.9" />
        <rect x="66" y="160" width="24" height="9" rx="3" fill="url(#brass)" />
        <rect x="130" y="160" width="24" height="9" rx="3" fill="url(#brass)" />
        {/* rivets */}
        {[46, 88, 132, 174].map((x, i) => (
          <circle key={i} cx={x} cy="140" r="2" fill="#e6b870" opacity="0.8" />
        ))}
        {/* front latch */}
        <rect x="98" y="176" width="24" height="16" rx="3" fill="url(#brass)" />
        <circle cx="110" cy="184" r="3" fill="#4a2a14" />
      </g>

      {/* stack of books the open book rests on */}
      <g>
        <rect x="58" y="112" width="104" height="18" rx="4" fill="#a8714a" transform="rotate(-1 110 121)" />
        <rect x="66" y="96" width="90" height="18" rx="4" fill="#5c7452" transform="rotate(1.5 110 105)" />
      </g>

      {/* open book on top */}
      <g>
        <path d="M64 92c16-12 34-12 46-2l0 22c-12-10-30-10-46 2Z" fill="#f6ecd8" />
        <path d="M110 90c12-10 30-10 46 0l0 22c-16-10-34-10-46 0Z" fill="#eee0c2" />
        <path d="M110 90v22" stroke="#c9a35f" strokeWidth="1.5" opacity="0.6" />
        <path d="M72 92c10-6 22-6 32 0" stroke="#c9a35f" strokeWidth="1.2" opacity="0.5" />
        <path d="M72 100c10-6 22-6 32 0" stroke="#c9a35f" strokeWidth="1.2" opacity="0.5" />
        <path d="M116 92c10-6 22-6 32 2" stroke="#c9a35f" strokeWidth="1.2" opacity="0.5" />
        <path d="M116 100c10-6 22-6 32 2" stroke="#c9a35f" strokeWidth="1.2" opacity="0.5" />
      </g>

      <defs>
        <linearGradient id="trunkShade" x1="0" y1="130" x2="0" y2="216" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d38c" />
          <stop offset="1" stopColor="#a8712f" />
        </linearGradient>
      </defs>
    </svg>
  );
}
