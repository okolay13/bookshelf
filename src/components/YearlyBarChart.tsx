"use client";

import { useState } from "react";

export function YearlyBarChart({ data }: { data: { label: string; count: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 560;
  const height = 200;
  const padding = { top: 16, bottom: 28, left: 8, right: 8 };
  const plotHeight = height - padding.top - padding.bottom;
  const barGap = 8;
  const barWidth = (width - padding.left - padding.right - barGap * (data.length - 1)) / Math.max(1, data.length);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Книг прочитано по годам">
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="var(--color-copper)"
          strokeOpacity={0.3}
        />
        {data.map((d, i) => {
          const barHeight = (d.count / max) * (plotHeight - 6);
          const x = padding.left + i * (barWidth + barGap);
          const y = height - padding.bottom - barHeight;
          const isHovered = hovered === i;
          return (
            <g
              key={d.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-default"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, d.count > 0 ? 3 : 0)}
                rx={4}
                fill={isHovered ? "var(--color-terracotta-dark)" : "var(--color-terracotta)"}
              />
              <rect
                x={x}
                y={padding.top}
                width={barWidth}
                height={height - padding.top - padding.bottom}
                fill="transparent"
              />
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 16}
                textAnchor="middle"
                fontSize="10"
                fill="var(--color-cocoa)"
              >
                {d.label}
              </text>
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="var(--color-espresso-dark)"
                >
                  {d.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
