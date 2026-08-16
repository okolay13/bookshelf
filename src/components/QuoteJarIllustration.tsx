export default function QuoteJarIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="250" rx="80" ry="9" fill="#0c0603" opacity="0.4" />

      {/* outer carved wood frame */}
      <rect x="18" y="18" width="184" height="216" rx="10" fill="url(#frameWood)" />
      <rect x="18" y="18" width="184" height="216" rx="10" fill="url(#frameShade)" />
      {/* bevel/carve line */}
      <rect x="30" y="30" width="160" height="192" rx="6" fill="none" stroke="#3a2210" strokeWidth="3" opacity="0.55" />
      <rect x="34" y="34" width="152" height="184" rx="4" fill="none" stroke="#e6b870" strokeWidth="1" opacity="0.35" />
      {/* corner flourishes */}
      {[
        [26, 26],
        [194, 26],
        [26, 226],
        [194, 226],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="#e6b870" opacity="0.55" />
      ))}

      {/* inner recessed panel the quote marks sit on */}
      <rect x="36" y="36" width="148" height="188" rx="4" fill="#f3e6c8" />
      <rect x="36" y="36" width="148" height="188" rx="4" fill="url(#panelShade)" />

      {/* large decorative « » quote marks, no text */}
      <g fill="#8a4515">
        <path d="M64 108c-14 8-14 30 0 38l6-8c-8-6-8-16 0-22Zm22 0c-14 8-14 30 0 38l6-8c-8-6-8-16 0-22Z" />
        <path d="M134 108c-14 8-14 30 0 38l6-8c-8-6-8-16 0-22Zm22 0c-14 8-14 30 0 38l6-8c-8-6-8-16 0-22Z" />
      </g>
      <g fill="#c1440e" opacity="0.85">
        <path d="M64 104c-14 8-14 30 0 38l6-8c-8-6-8-16 0-22Zm22 0c-14 8-14 30 0 38l6-8c-8-6-8-16 0-22Z" />
        <path d="M134 104c-14 8-14 30 0 38l6-8c-8-6-8-16 0-22Zm22 0c-14 8-14 30 0 38l6-8c-8-6-8-16 0-22Z" />
      </g>

      <defs>
        <linearGradient id="frameWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a4a26" />
          <stop offset="1" stopColor="#4a2a14" />
        </linearGradient>
        <linearGradient id="frameShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="panelShade" cx="0.5" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fff8e6" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7a5334" stopOpacity="0.12" />
        </radialGradient>
      </defs>
    </svg>
  );
}
