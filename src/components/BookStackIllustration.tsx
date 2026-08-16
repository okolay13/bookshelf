const READ_COLORS = ["#8a4a30", "#4f6b42", "#a8714a", "#6f8a5c", "#c99a72", "#5c7452"];
const BOOK_COUNT = READ_COLORS.length;
const BOOK_H = 26;
const STACK_BOTTOM = 214;
const ROTATIONS = [1, -1.3, 0.8, -1, 1.3, -0.8];
const WIDTHS = [128, 134, 124, 132, 126, 130];

export default function BookStackIllustration({
  progress,
  className = "",
}: {
  /** 0–100 */
  progress: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, progress));
  const readCount = Math.round((clamped / 100) * BOOK_COUNT);

  return (
    <svg
      viewBox="0 0 180 260"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* soft ground shadow */}
      <ellipse cx="90" cy="248" rx="60" ry="9" fill="#0c0603" opacity="0.4" />

      {Array.from({ length: BOOK_COUNT }).map((_, i) => {
        const y = STACK_BOTTOM - (i + 1) * BOOK_H;
        const width = WIDTHS[i];
        const x = 90 - width / 2;
        const isRead = i < readCount;
        return (
          <g key={i} transform={`rotate(${ROTATIONS[i]} 90 ${y + BOOK_H / 2})`}>
            <rect
              x={x}
              y={y}
              width={width}
              height={BOOK_H - 5}
              rx="3"
              fill={isRead ? READ_COLORS[i] : "#cfc6b4"}
              opacity={isRead ? 1 : 0.5}
            />
            <rect x={x} y={y} width="9" height={BOOK_H - 5} rx="3" fill="#000000" opacity={isRead ? 0.2 : 0.08} />
            <rect
              x={x + 14}
              y={y + 5}
              width={width - 28}
              height="2.4"
              rx="1.2"
              fill="#f6ecd8"
              opacity={isRead ? 0.55 : 0.3}
            />
          </g>
        );
      })}

      {/* golden ribbon tied around the whole stack */}
      <g opacity="0.92">
        <rect x="72" y={STACK_BOTTOM - BOOK_COUNT * BOOK_H - 4} width="8" height={BOOK_COUNT * BOOK_H + 6} rx="3" fill="url(#ribbon)" />
        <path
          d={`M76 ${STACK_BOTTOM - BOOK_COUNT * BOOK_H - 6}c-10 6-10 16 0 20s10 14 0 20`}
          stroke="url(#ribbon)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M76 ${STACK_BOTTOM - BOOK_COUNT * BOOK_H - 2}l-9 12 9 4 9-4Z`}
          fill="url(#ribbon)"
        />
      </g>

      <defs>
        <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d38c" />
          <stop offset="1" stopColor="#a8712f" />
        </linearGradient>
      </defs>
    </svg>
  );
}
