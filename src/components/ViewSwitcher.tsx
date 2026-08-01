"use client";

export type ViewMode = "shelf" | "status" | "list";

const OPTIONS: { key: ViewMode; label: string }[] = [
  { key: "shelf", label: "По полкам" },
  { key: "status", label: "По статусу" },
  { key: "list", label: "Список" },
];

export function ViewSwitcher({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-parchment/80 p-1 shadow-inner border border-copper/20">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            value === opt.key
              ? "bg-terracotta text-cream shadow"
              : "text-espresso/70 hover:bg-cream-dark/60"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
