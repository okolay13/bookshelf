import { supabase } from "@/lib/supabaseClient";
import { Book, BookNote, BookQuote, BookShelfLink, DecorType, GenreEntity, MoodboardImage, NewBook, ReadingGoal, Shelf, ShelfDecor, ShelfFilterType } from "@/lib/types";

export const MOODBOARD_BUCKET = "moodboard";
export const BOOK_IMAGES_BUCKET = "book-images";

export async function fetchBooks() {
  return supabase.from("books").select("*").order("created_at", { ascending: false });
}

export async function insertBook(book: NewBook) {
  const result = await supabase.from("books").insert(book).select().single();
  if (result.data && book.shelf?.trim()) {
    await addBookToShelf((result.data as Book).id, book.shelf.trim());
  }
  return result;
}

export async function insertBooks(books: NewBook[]) {
  const result = await supabase.from("books").insert(books).select();
  if (result.data) {
    const links = (result.data as Book[])
      .filter((b) => b.shelf?.trim())
      .map((b) => ({ book_id: b.id, shelf_name: b.shelf!.trim() }));
    if (links.length) await supabase.from("book_shelves").insert(links);
  }
  return result;
}

export async function updateBook(id: string, fields: Partial<Book>) {
  return supabase.from("books").update(fields).eq("id", id).select().single();
}

export async function deleteBook(id: string) {
  return supabase.from("books").delete().eq("id", id);
}

// Folds a duplicate book's notes/quotes/moodboard images/shelf links onto
// `keepId`, then removes the duplicate row. Shelf links use the same
// ignore-duplicates upsert as addBookToShelf so a shelf shared by both
// duplicates doesn't hit the (book_id, shelf_name) unique constraint.
export async function mergeBookDuplicate(keepId: string, duplicateId: string) {
  await supabase.from("book_notes").update({ book_id: keepId }).eq("book_id", duplicateId);
  await supabase.from("book_quotes").update({ book_id: keepId }).eq("book_id", duplicateId);
  await supabase.from("book_moodboard_images").update({ book_id: keepId }).eq("book_id", duplicateId);

  const { data: links } = await supabase
    .from("book_shelves")
    .select("shelf_name")
    .eq("book_id", duplicateId);
  if (links?.length) {
    await supabase
      .from("book_shelves")
      .upsert(
        links.map((l) => ({ book_id: keepId, shelf_name: l.shelf_name as string })),
        { onConflict: "book_id,shelf_name", ignoreDuplicates: true }
      );
  }

  return supabase.from("books").delete().eq("id", duplicateId);
}

// Removes a duplicate book entirely, along with its own notes/shelf links
// (cascade) and quotes (which would otherwise survive as orphaned
// "book_id: null" entries, since book_quotes uses ON DELETE SET NULL).
export async function discardDuplicateBook(duplicateId: string) {
  await supabase.from("book_quotes").delete().eq("book_id", duplicateId);
  return supabase.from("books").delete().eq("id", duplicateId);
}

export async function listMoodboardImages(bookId: string) {
  return supabase
    .from("book_moodboard_images")
    .select("*")
    .eq("book_id", bookId)
    .order("position", { ascending: true });
}

export async function addMoodboardImage(
  bookId: string,
  imageUrl: string,
  opts: { position: number; posX: number; posY: number }
) {
  return supabase
    .from("book_moodboard_images")
    .insert({
      book_id: bookId,
      image_url: imageUrl,
      position: opts.position,
      pos_x: opts.posX,
      pos_y: opts.posY,
    })
    .select()
    .single();
}

export async function deleteMoodboardImage(id: string) {
  return supabase.from("book_moodboard_images").delete().eq("id", id);
}

export async function updateMoodboardImageCoords(id: string, posX: number, posY: number) {
  return supabase.from("book_moodboard_images").update({ pos_x: posX, pos_y: posY }).eq("id", id);
}

export async function bringMoodboardImageToFront(id: string, position: number) {
  return supabase.from("book_moodboard_images").update({ position }).eq("id", id);
}

export async function fetchAllMoodboardImages() {
  return supabase.from("book_moodboard_images").select("*");
}

export async function uploadMoodboardFile(bookId: string, file: File) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${bookId}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(MOODBOARD_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (uploadError) return { data: null, error: uploadError };
  const { data } = supabase.storage.from(MOODBOARD_BUCKET).getPublicUrl(path);
  return { data: { publicUrl: data.publicUrl }, error: null };
}

export async function uploadBookImage(file: File, kind: "cover" | "spine") {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${kind}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BOOK_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (uploadError) return { data: null, error: uploadError };
  const { data } = supabase.storage.from(BOOK_IMAGES_BUCKET).getPublicUrl(path);
  return { data: { publicUrl: data.publicUrl }, error: null };
}

export async function getReadingGoal(year: number) {
  return supabase.from("reading_goals").select("*").eq("year", year).maybeSingle();
}

export async function upsertReadingGoal(year: number, targetBooks: number) {
  const { data: existing } = await getReadingGoal(year);
  if (existing) {
    return supabase
      .from("reading_goals")
      .update({ target_books: targetBooks })
      .eq("id", (existing as ReadingGoal).id)
      .select()
      .single();
  }
  return supabase
    .from("reading_goals")
    .insert({ year, target_books: targetBooks })
    .select()
    .single();
}

export async function fetchShelves() {
  return supabase.from("shelves").select("*").order("position", { ascending: true });
}

export async function insertShelf(
  name: string,
  position: number,
  opts?: Partial<Pick<Shelf, "kind" | "filter_type" | "filter_value" | "is_default" | "is_all" | "color">>
) {
  return supabase
    .from("shelves")
    .insert({ name, position, ...opts })
    .select()
    .single();
}

export async function updateShelf(id: string, oldName: string, newName: string, color: string) {
  const { error: shelfError } = await supabase
    .from("shelves")
    .update({ name: newName, color })
    .eq("id", id);
  if (shelfError) return { error: shelfError };
  if (newName === oldName) return { error: null };
  const { error: booksError } = await supabase
    .from("books")
    .update({ shelf: newName })
    .eq("shelf", oldName);
  if (booksError) return { error: booksError };
  const { error: linksError } = await supabase
    .from("book_shelves")
    .update({ shelf_name: newName })
    .eq("shelf_name", oldName);
  return { error: linksError };
}

export async function convertShelfToSmart(id: string, filterType: ShelfFilterType, filterValue: string) {
  return supabase
    .from("shelves")
    .update({ kind: "smart", filter_type: filterType, filter_value: filterValue })
    .eq("id", id)
    .select()
    .single();
}

export async function reorderShelves(items: { id: string; position: number }[]) {
  return Promise.all(
    items.map(({ id, position }) => supabase.from("shelves").update({ position }).eq("id", id))
  );
}

export async function deleteShelf(id: string, name: string) {
  const { error: booksError } = await supabase.from("books").update({ shelf: null }).eq("shelf", name);
  if (booksError) return { error: booksError };
  await supabase.from("book_shelves").delete().eq("shelf_name", name);
  return supabase.from("shelves").delete().eq("id", id);
}

export async function fetchBookShelfLinks() {
  return supabase.from("book_shelves").select("*");
}

export async function addBookToShelf(bookId: string, shelfName: string) {
  return supabase
    .from("book_shelves")
    .upsert(
      { book_id: bookId, shelf_name: shelfName },
      { onConflict: "book_id,shelf_name", ignoreDuplicates: true }
    )
    .select()
    .maybeSingle();
}

export async function removeBookFromShelf(bookId: string, shelfName: string) {
  return supabase
    .from("book_shelves")
    .delete()
    .eq("book_id", bookId)
    .eq("shelf_name", shelfName);
}

// Adds a book to a manual shelf at the end of its current manual order (used
// by the shelf checkbox picker, the "add books" panel, and drag-in-from-
// outside), instead of the position-less upsert above.
export async function addBookToShelfAtEnd(bookId: string, shelfName: string) {
  const { data: last } = await supabase
    .from("book_shelves")
    .select("position")
    .eq("shelf_name", shelfName)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? 0) + 1;
  return supabase
    .from("book_shelves")
    .upsert(
      { book_id: bookId, shelf_name: shelfName, position },
      { onConflict: "book_id,shelf_name", ignoreDuplicates: true }
    )
    .select()
    .maybeSingle();
}

export async function reorderBookInShelf(bookId: string, shelfName: string, position: number) {
  return supabase
    .from("book_shelves")
    .update({ position })
    .eq("book_id", bookId)
    .eq("shelf_name", shelfName)
    .select()
    .maybeSingle();
}

export async function fetchGenres() {
  return supabase.from("genres").select("*").order("position", { ascending: true });
}

export async function insertGenre(name: string, position: number) {
  return supabase.from("genres").insert({ name, position }).select().single();
}

export async function deleteGenre(id: string, name: string, reassignTo: string | null) {
  const { error: booksError } = await supabase
    .from("books")
    .update({ genre: reassignTo })
    .eq("genre", name);
  if (booksError) return { error: booksError };
  return supabase.from("genres").delete().eq("id", id);
}

export async function assignGenreToBooks(bookIds: string[], genreName: string) {
  return supabase.from("books").update({ genre: genreName }).in("id", bookIds);
}

export async function fetchShelfDecor() {
  return supabase.from("shelf_decor").select("*");
}

export async function insertShelfDecor(shelfName: string, decorType: DecorType, slot: number) {
  return supabase
    .from("shelf_decor")
    .insert({ shelf_name: shelfName, decor_type: decorType, slot })
    .select()
    .single();
}

export async function moveShelfDecor(id: string, slot: number) {
  return supabase.from("shelf_decor").update({ slot }).eq("id", id).select().single();
}

export async function deleteShelfDecor(id: string) {
  return supabase.from("shelf_decor").delete().eq("id", id);
}

export async function listBookNotes(bookId: string) {
  return supabase
    .from("book_notes")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
}

export async function insertBookNote(bookId: string, title: string | null, content: string) {
  return supabase
    .from("book_notes")
    .insert({ book_id: bookId, title, content })
    .select()
    .single();
}

export async function updateBookNote(id: string, title: string | null, content: string) {
  return supabase
    .from("book_notes")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
}

export async function deleteBookNote(id: string) {
  return supabase.from("book_notes").delete().eq("id", id);
}

// Bulk fetch of every note's book_id + content, used by the library filter bar
// to power "only books with notes" and note-text search without opening each card.
export async function fetchAllBookNotes() {
  return supabase.from("book_notes").select("book_id, content, title");
}

export async function fetchAllBookQuotes() {
  return supabase.from("book_quotes").select("*").order("created_at", { ascending: false });
}

export async function listBookQuotes(bookId: string) {
  return supabase
    .from("book_quotes")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });
}

export async function insertBookQuote(quote: {
  book_id: string;
  quote_text: string;
  page: string | null;
  personal_note: string | null;
  emoji: string | null;
}) {
  return supabase.from("book_quotes").insert(quote).select().single();
}

export async function updateBookQuote(
  id: string,
  fields: Partial<Pick<BookQuote, "book_id" | "quote_text" | "page" | "personal_note" | "emoji">>
) {
  return supabase.from("book_quotes").update(fields).eq("id", id).select().single();
}

export async function deleteBookQuote(id: string) {
  return supabase.from("book_quotes").delete().eq("id", id);
}

// Used before deleting a book, to decide whether the user needs to be asked
// what to do with quotes that reference it.
export async function countBookQuotes(bookId: string) {
  const { count, error } = await supabase
    .from("book_quotes")
    .select("id", { count: "exact", head: true })
    .eq("book_id", bookId);
  return { count: count ?? 0, error };
}

export async function deleteBookQuotesForBook(bookId: string) {
  return supabase.from("book_quotes").delete().eq("book_id", bookId);
}

// Detaches quotes from a book about to be deleted, snapshotting its
// title/author/cover so they keep displaying as standalone entries.
export async function detachBookQuotesForBook(
  bookId: string,
  snapshot: { title: string; author: string; cover_url: string | null }
) {
  return supabase
    .from("book_quotes")
    .update({
      book_id: null,
      fallback_title: snapshot.title,
      fallback_author: snapshot.author,
      fallback_cover_url: snapshot.cover_url,
    })
    .eq("book_id", bookId);
}

export type { BookNote, BookQuote, BookShelfLink, GenreEntity, MoodboardImage, Shelf, ShelfDecor };
