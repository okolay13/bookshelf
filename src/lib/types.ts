export type BookStatus = "to_read" | "reading" | "finished" | "dnf" | "want_to_buy";

export type BookFormat = "paper" | "ebook" | "audio" | "mixed";

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  rating: number | null;
  cover_url: string | null;
  shelf: string | null;
  notes: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at?: string;
  genre: string | null;
  format: BookFormat | null;
  emoji_tag: string | null;
  mood_tags: string[] | null;
  progress_percent: number | null;
  spine_width: number | null;
  spine_image_url: string | null;
  is_favorite: boolean;
  language: string | null;
  publication_year: number | null;
  user_id?: string | null;
}

export type NewBook = Omit<Book, "id" | "created_at">;

// Extensible on purpose: future fields (tags, is_pinned, note_type "quote",
// page_number, etc.) can be added as nullable columns without touching the
// storage model, since each note is its own row keyed by book_id.
export interface BookNote {
  id: string;
  book_id: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

// book_id is nullable (see supabase_book_quotes.sql): when the linked book is
// deleted, the user chooses to either delete the quote too, or detach it —
// which nulls book_id and snapshots title/author/cover into the fallback_*
// fields so the quote keeps displaying sensibly as a standalone entry.
export interface BookQuote {
  id: string;
  book_id: string | null;
  quote_text: string;
  page: string | null;
  personal_note: string | null;
  emoji: string | null;
  created_at: string;
  fallback_title: string | null;
  fallback_author: string | null;
  fallback_cover_url: string | null;
  user_id?: string | null;
}

export type QuoteSortMode = "newest" | "oldest";

export const QUOTE_SORT_LABEL: Record<QuoteSortMode, string> = {
  newest: "Сначала новые",
  oldest: "Сначала старые",
};

export interface MoodboardImage {
  id: string;
  book_id: string;
  image_url: string;
  position: number | null;
  pos_x: number | null;
  pos_y: number | null;
  created_at?: string;
}

export interface ReadingGoal {
  id: string;
  year: number;
  target_books: number;
  user_id?: string | null;
  created_at?: string;
}

export type ShelfKind = "manual" | "smart";
export type ShelfFilterType = "genre" | "thickness" | "status";
export type ThicknessBucket = "thin" | "medium" | "thick";

export interface Shelf {
  id: string;
  name: string;
  position: number;
  kind?: ShelfKind;
  filter_type?: ShelfFilterType | null;
  filter_value?: string | null;
  is_default?: boolean;
  is_all?: boolean;
  color?: string | null;
  user_id?: string | null;
  created_at?: string;
}

export interface BookShelfLink {
  id: string;
  book_id: string;
  shelf_name: string;
  position?: number | null;
  created_at?: string;
}

// Preset swatches offered when creating a manual shelf. Plain hex, applied via
// inline style — same convention as STATUS_ACCENT in app/page.tsx.
export const SHELF_COLOR_PRESETS: string[] = [
  "#c1440e", // terracotta
  "#4f7a45", // sage
  "#b5651d", // copper
  "#3f5d3a", // forest
  "#3d5a80", // denim
  "#8a4b6b", // plum
  "#c9962c", // mustard
];

export interface GenreEntity {
  id: string;
  name: string;
  position: number;
  created_at?: string;
}

export const THICKNESS_LABEL: Record<ThicknessBucket, string> = {
  thin: "Тонкие",
  medium: "Средние",
  thick: "Толстые",
};

export const THICKNESS_ORDER: ThicknessBucket[] = ["thin", "medium", "thick"];

// spine_width is in the same px scale BookSpine renders with (see lib/bookVisuals.ts,
// where auto-generated widths range 40-52px when no explicit width is set).
export function thicknessBucket(spineWidth: number | null): ThicknessBucket {
  const w = spineWidth ?? 44;
  if (w <= 42) return "thin";
  if (w >= 49) return "thick";
  return "medium";
}

export const STATUS_LABEL: Record<BookStatus, string> = {
  to_read: "🔖 Хочу прочитать",
  reading: "📖 Читаю сейчас",
  finished: "✅ Прочитано",
  dnf: "✋ Брошено",
  want_to_buy: "🛒 Хочу купить",
};

export const STATUS_ORDER: BookStatus[] = [
  "reading",
  "to_read",
  "want_to_buy",
  "finished",
  "dnf",
];

export const STATUS_ACCENT: Record<BookStatus, string> = {
  reading: "#d68a3f",
  to_read: "#4f7a45",
  want_to_buy: "#3d5a80",
  finished: "#c1440e",
  dnf: "#8a4b6b",
};

export const LANGUAGE_OPTIONS = [
  "Русский",
  "Английский",
  "Украинский",
  "Немецкий",
  "Французский",
  "Испанский",
  "Итальянский",
  "Польский",
  "Китайский",
  "Японский",
  "Корейский",
];

export const FORMAT_LABEL: Record<BookFormat, string> = {
  paper: "📕 Бумага",
  ebook: "📱 Электронная",
  audio: "🎧 Аудио",
  mixed: "🔀 Микс",
};

export const FORMAT_ORDER: BookFormat[] = ["paper", "ebook", "audio", "mixed"];

export type GroupMode = "none" | "status" | "genre" | "author" | "shelf" | "year_read" | "rating";

export const GROUP_LABEL: Record<GroupMode, string> = {
  none: "Без группировки",
  status: "По статусу",
  genre: "По жанру",
  author: "По автору",
  shelf: "По пользовательским полкам",
  year_read: "По году прочтения",
  rating: "По рейтингу",
};

export type SortMode =
  | "created_at"
  | "created_at_asc"
  | "title"
  | "title_desc"
  | "author"
  | "rating"
  | "finished_at";

export const SORT_LABEL: Record<SortMode, string> = {
  created_at: "Недавно добавленные",
  created_at_asc: "Сначала старые",
  title: "По названию (А–Я)",
  title_desc: "По названию (Я–А)",
  author: "По автору",
  rating: "По рейтингу",
  finished_at: "По дате прочтения",
};

export const UNKNOWN_YEAR_READ = "Без даты";

export interface Filters {
  query: string;
  status: BookStatus | "all";
  genre: string;
  author: string;
  shelf: string;
  rating: number; // 0 = any, otherwise minimum rating
  year: string; // publication year as string, or "all"
  language: string;
  format: BookFormat | "all";
  moodTag: string;
  emojiTags: string[];
  favoritesOnly: boolean;
  notesOnly: boolean;
  readFrom: string;
  readTo: string;
}

export const DEFAULT_FILTERS: Filters = {
  query: "",
  status: "all",
  genre: "all",
  author: "all",
  shelf: "all",
  rating: 0,
  year: "all",
  language: "all",
  format: "all",
  moodTag: "all",
  emojiTags: [],
  favoritesOnly: false,
  notesOnly: false,
  readFrom: "",
  readTo: "",
};

export type DecorType =
  | "plant"
  | "candle"
  | "tea"
  | "books"
  | "branch"
  | "cat"
  | "lamp"
  | "crystal";

export interface ShelfDecor {
  id: string;
  shelf_name: string;
  decor_type: DecorType;
  slot: number;
  created_at?: string;
  // Unused for now (app has no auth yet) — kept nullable for forward
  // compatibility, same convention as Book/Shelf/ReadingGoal.user_id.
  user_id?: string | null;
}

export const UNSHELVED = "Все книги";
export const UNGENRED = "Без жанра";

export const DEFAULT_NEW_BOOK_STATUS: BookStatus = "to_read";
