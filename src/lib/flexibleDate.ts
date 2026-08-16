// Reading start/finish dates can be stored either as a full "YYYY-MM-DD" date
// or, when the exact day isn't known, as a month-only "YYYY-MM" value.
export function isMonthOnly(value: string | null | undefined): boolean {
  return !!value && /^\d{4}-\d{2}$/.test(value);
}

export function formatFlexibleDate(value: string | null | undefined): string {
  if (!value) return "";
  if (isMonthOnly(value)) {
    const d = new Date(`${value}-01`);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}
