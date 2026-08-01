"use client";

export function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number | null;
  onChange?: (v: number | null) => void;
  readOnly?: boolean;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => {
        const filled = (value ?? 0) >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(value === n ? null : n)}
            className={`text-xl leading-none transition-transform ${
              readOnly ? "cursor-default" : "hover:scale-110 cursor-pointer"
            }`}
            aria-label={`${n} звёзд`}
          >
            <span style={{ color: filled ? "#d4924f" : "#e0cfae" }}>★</span>
          </button>
        );
      })}
    </div>
  );
}
