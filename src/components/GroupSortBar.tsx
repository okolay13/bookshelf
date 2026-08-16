"use client";

import { GROUP_LABEL, GroupMode, SORT_LABEL, SortMode } from "@/lib/types";

const controlClass =
  "h-10 w-full sm:w-56 rounded-xl border border-copper/25 bg-parchment/90 px-3.5 text-sm font-semibold text-espresso shadow-inner transition-shadow focus:outline-none focus:ring-2 focus:ring-terracotta/40 hover:border-copper/40";

export function GroupSortBar({
  groupMode,
  onGroupChange,
  sortMode,
  onSortChange,
}: {
  groupMode: GroupMode;
  onGroupChange: (g: GroupMode) => void;
  sortMode: SortMode;
  onSortChange: (s: SortMode) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <LabeledSelect label="Группировать">
        <select
          value={groupMode}
          onChange={(e) => onGroupChange(e.target.value as GroupMode)}
          className={controlClass}
        >
          {(Object.keys(GROUP_LABEL) as GroupMode[]).map((g) => (
            <option key={g} value={g}>
              {GROUP_LABEL[g]}
            </option>
          ))}
        </select>
      </LabeledSelect>

      <LabeledSelect label="Сортировать">
        <select
          value={sortMode}
          onChange={(e) => onSortChange(e.target.value as SortMode)}
          className={controlClass}
        >
          {(Object.keys(SORT_LABEL) as SortMode[]).map((s) => (
            <option key={s} value={s}>
              {SORT_LABEL[s]}
            </option>
          ))}
        </select>
      </LabeledSelect>
    </div>
  );
}

function LabeledSelect({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 w-full sm:w-56">
      <span className="text-[11px] font-bold uppercase tracking-wide text-cocoa/50">{label}</span>
      {children}
    </div>
  );
}
