export type BookStatus = "to_read" | "reading" | "finished";

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
}

export type NewBook = Omit<Book, "id" | "created_at">;

export const STATUS_LABEL: Record<BookStatus, string> = {
  to_read: "Хочу прочитать",
  reading: "Читаю сейчас",
  finished: "Прочитано",
};

export const STATUS_ORDER: BookStatus[] = ["reading", "to_read", "finished"];

export const UNSHELVED = "Без полки";
