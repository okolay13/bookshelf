"use client";

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "text-xl",
}: {
  value: number | null;
  onChange?: (v: number | null) => void;
  readOnly?: boolean;
  size?: string;
}) {
  const stars = [1, 2, 3, 4, 5];
  const v = value ?? 0;

  function pick(n: number) {
    if (readOnly || !onChange) return;
    // clicking the same value again clears the rating
    onChange(v === n ? null : n);
  }

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((n) => {
        const fillFraction = Math.max(0, Math.min(1, v - (n - 1)));
        return (
          <span key={n} className={`relative inline-block ${size} leading-none`} style={{ width: "1em" }}>
            <span aria-hidden="true" style={{ color: "#e0cfae" }}>★</span>
            <span
              aria-hidden="true"
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${fillFraction * 100}%`, color: "#d4924f" }}
            >
              ★
            </span>
            {!readOnly && (
              <>
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                  aria-label={`${n - 0.5} звёзд`}
                  onClick={() => onChange?.(v === n - 0.5 ? null : n - 0.5)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                  aria-label={`${n} звёзд`}
                  onClick={() => pick(n)}
                />
              </>
            )}
          </span>
        );
      })}
      {value != null && (
        <span className="ml-1.5 text-xs font-semibold text-cocoa/70">{value}</span>
      )}
    </div>
  );
}
