import { Genre, normalizeGenreFromSubjects } from "./genres";

export interface TitleSuggestion {
  key: string;
  title: string;
  author: string;
  year: number | null;
  coverId: number | null;
  genre: Genre | null;
}

export function coverUrl(coverId: number, size: "S" | "M" | "L" = "M") {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export async function searchTitles(query: string): Promise<TitleSuggestion[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
    q
  )}&limit=8&fields=key,title,author_name,cover_i,first_publish_year,subject`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const docs: unknown[] = Array.isArray(data?.docs) ? data.docs : [];
  return docs.map((d) => {
    const doc = d as {
      key: string;
      title?: string;
      author_name?: string[];
      cover_i?: number;
      first_publish_year?: number;
      subject?: string[];
    };
    return {
      key: doc.key,
      title: doc.title ?? "",
      author: doc.author_name?.[0] ?? "",
      year: doc.first_publish_year ?? null,
      coverId: doc.cover_i ?? null,
      genre: normalizeGenreFromSubjects(doc.subject),
    };
  });
}

export async function suggestGenre(title: string, author: string): Promise<Genre | null> {
  const results = await searchTitles(`${title} ${author}`.trim());
  return results.find((r) => r.genre)?.genre ?? null;
}

export async function fetchBestCoverUrl(title: string, author: string): Promise<string | null> {
  const ids = await searchCoverOptions(title, author);
  return ids.length ? coverUrl(ids[0], "L") : null;
}

export async function searchCoverOptions(title: string, author: string): Promise<number[]> {
  const q = [title, author].filter(Boolean).join(" ").trim();
  if (!q) return [];
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
    q
  )}&limit=12&fields=cover_i`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const docs: unknown[] = Array.isArray(data?.docs) ? data.docs : [];
  const ids = docs
    .map((d) => (d as { cover_i?: number }).cover_i)
    .filter((id): id is number => typeof id === "number");
  return Array.from(new Set(ids)).slice(0, 8);
}
