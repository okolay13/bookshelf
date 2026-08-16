// Default seed list, used to populate the "genres" table on first setup
// (see supabase_genres.sql) and as a fallback before that table loads.
// The list users actually see/edit lives in the database — see lib/api.ts
// fetchGenres/insertGenre/deleteGenre — since genres can now be added and
// removed at runtime.
export const GENRES = [
  "Фантастика",
  "Фэнтези",
  "Детектив",
  "Триллер",
  "Роман",
  "Классика",
  "Нон-фикшн",
  "Биография",
  "История",
  "Поэзия",
  "Детская",
  "Другое",
] as const;

export type Genre = string;

const KEYWORD_MAP: [RegExp, Genre][] = [
  [/science fiction|sci-fi|dystopia|space|alien/i, "Фантастика"],
  [/fantasy|magic|dragon|wizard/i, "Фэнтези"],
  [/detective|mystery|crime/i, "Детектив"],
  [/thriller|suspense|horror/i, "Триллер"],
  [/classic/i, "Классика"],
  [/biograph|memoir|autobiograph/i, "Биография"],
  [/history|historical/i, "История"],
  [/poetry|poem/i, "Поэзия"],
  [/child|juvenile|picture book|fairy tale/i, "Детская"],
  [/nonfiction|non-fiction|essay|philosophy|psycholog|self-help|business|science$/i, "Нон-фикшн"],
  [/fiction|novel|romance|drama/i, "Роман"],
];

// Best-effort mapping from a raw Open Library subject to one of GENRES.
// Returns null when nothing matches, so callers can fall back to no suggestion
// rather than polluting the fixed list with junk like "Accessible book".
export function normalizeGenre(rawSubject: string | null | undefined): Genre | null {
  if (!rawSubject) return null;
  for (const [pattern, genre] of KEYWORD_MAP) {
    if (pattern.test(rawSubject)) return genre;
  }
  return null;
}

// Tries each subject in order and returns the first one that maps to a known genre.
export function normalizeGenreFromSubjects(subjects: string[] | null | undefined): Genre | null {
  if (!subjects) return null;
  for (const s of subjects) {
    const g = normalizeGenre(s);
    if (g) return g;
  }
  return null;
}
