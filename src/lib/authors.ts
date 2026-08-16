// Groups author name variants that differ only in case, spacing, or punctuation
// (e.g. "Лев Толстой" vs "лев  толстой" vs "Лев Толстой.") so they collapse to
// one filter entry instead of appearing as separate "authors".
export function normalizeAuthorKey(author: string): string {
  return author
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ");
}

// Given raw author strings from books, returns one display label per distinct
// author (case/whitespace/punctuation-insensitive), sorted alphabetically.
// The most frequently used spelling wins as the display label.
export function distinctAuthors(rawAuthors: (string | null | undefined)[]): string[] {
  const counts = new Map<string, Map<string, number>>();
  for (const raw of rawAuthors) {
    const author = raw?.trim();
    if (!author) continue;
    const key = normalizeAuthorKey(author);
    const variants = counts.get(key) ?? new Map<string, number>();
    variants.set(author, (variants.get(author) ?? 0) + 1);
    counts.set(key, variants);
  }
  const labels = Array.from(counts.values()).map((variants) => {
    return Array.from(variants.entries()).sort((a, b) => b[1] - a[1])[0][0];
  });
  return labels.sort((a, b) => a.localeCompare(b, "ru"));
}
