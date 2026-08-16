"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { parseEmojiTags } from "@/lib/emojiTags";
import {
  fetchBooks,
  fetchAllMoodboardImages,
  fetchAllBookNotes,
  insertBook,
  insertBooks,
  updateBook,
  deleteBook,
  getReadingGoal,
  fetchShelves,
  insertShelf,
  updateShelf,
  deleteShelf,
  convertShelfToSmart,
  fetchBookShelfLinks,
  addBookToShelfAtEnd,
  reorderBookInShelf,
  removeBookFromShelf,
  fetchGenres,
  insertGenre,
  deleteGenre,
  assignGenreToBooks,
  fetchShelfDecor,
  insertShelfDecor,
  moveShelfDecor,
  deleteShelfDecor,
  countBookQuotes,
  deleteBookQuotesForBook,
  detachBookQuotesForBook,
  mergeBookDuplicate,
  discardDuplicateBook,
} from "@/lib/api";
import { findDuplicateGroups } from "@/lib/duplicates";
import {
  Book,
  BookShelfLink,
  DecorType,
  DEFAULT_FILTERS,
  Filters,
  GenreEntity,
  GroupMode,
  NewBook,
  ReadingGoal,
  Shelf,
  ShelfDecor,
  SortMode,
  STATUS_ACCENT,
  STATUS_LABEL,
  STATUS_ORDER,
  thicknessBucket,
  UNGENRED,
  UNKNOWN_YEAR_READ,
  UNSHELVED,
} from "@/lib/types";
import { fetchBestCoverUrl } from "@/lib/openLibrary";
import { GENRES } from "@/lib/genres";
import { distinctAuthors, normalizeAuthorKey } from "@/lib/authors";
import { generateAndUploadSpine } from "@/lib/spineGen";
import { ViewMode } from "@/components/ViewSwitcher";
import { LibraryFilterBar } from "@/components/LibraryFilterBar";
import { GroupSortBar } from "@/components/GroupSortBar";
import { ResultsBar } from "@/components/ResultsBar";
import { BookLibraryGroups, LibraryGroup } from "@/components/BookLibraryGroups";
import { ShelfPager, ShelfGroup, ShelfFocusRequest } from "@/components/ShelfPager";
import { ShelfTabs } from "@/components/ShelfTabs";
import { ShelfAddPicker } from "@/components/ShelfAddPicker";
import { SearchBar } from "@/components/SearchBar";
import { BookModal } from "@/components/BookModal";
import { SettingsMenu } from "@/components/SettingsMenu";
import { AddBookForm } from "@/components/AddBookForm";
import { GenreManager } from "@/components/GenreManager";
import { DuplicateManager } from "@/components/DuplicateManager";
import { LampGlow, PottedPlant, StarSpark } from "@/components/Decor";
import { DecorPicker } from "@/components/DecorPicker";
import { DecorDragGhost } from "@/components/DecorDragGhost";
import { BookDragGhost } from "@/components/BookDragGhost";
import { BOOK_POINTER_END, BOOK_POINTER_MOVE, type BookPointerDetail } from "@/lib/bookDrag";
import LuggageIllustration from "@/components/LuggageIllustration";
import BookStackIllustration from "@/components/BookStackIllustration";
import QuoteJarIllustration from "@/components/QuoteJarIllustration";
import CompassIllustration from "@/components/CompassIllustration";
import { QuoteOrphanModal } from "@/components/QuoteOrphanModal";

const currentYear = new Date().getFullYear();
const WANT_TO_READ_SHELF = "Хочу прочитать";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("shelf");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [bookNotes, setBookNotes] = useState<{ book_id: string; title: string | null; content: string }[]>([]);
  const [groupMode, setGroupMode] = useState<GroupMode>("none");
  const [sortMode, setSortMode] = useState<SortMode>("created_at");
  const [selected, setSelected] = useState<Book | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [goal, setGoal] = useState<ReadingGoal | null>(null);
  const [shelfEntities, setShelfEntities] = useState<Shelf[]>([]);
  const [shelvesLoaded, setShelvesLoaded] = useState(false);
  const [shelfLinks, setShelfLinks] = useState<BookShelfLink[]>([]);
  const [shelfFocus, setShelfFocus] = useState<ShelfFocusRequest | null>(null);
  const [activeShelfName, setActiveShelfName] = useState<string>(UNSHELVED);
  const [refreshingCovers, setRefreshingCovers] = useState(false);
  const [addPickerShelf, setAddPickerShelf] = useState<string | null>(null);
  const [addDefaultShelf, setAddDefaultShelf] = useState<string | null>(null);
  const [genreEntities, setGenreEntities] = useState<GenreEntity[]>([]);
  const [showGenreManager, setShowGenreManager] = useState(false);
  const [showDuplicateManager, setShowDuplicateManager] = useState(false);
  const [shelfDecor, setShelfDecor] = useState<ShelfDecor[]>([]);
  const [decorLoading, setDecorLoading] = useState(true);
  const [showDecorPicker, setShowDecorPicker] = useState(false);
  const [decorNotice, setDecorNotice] = useState<string | null>(null);
  const decorNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editHint, setEditHint] = useState<string | null>(null);
  const [pendingQuoteDelete, setPendingQuoteDelete] = useState<{
    bookId: string;
    book: Book | null;
    count: number;
  } | null>(null);
  const editHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flashDecorNotice(message: string) {
    setDecorNotice(message);
    if (decorNoticeTimer.current) clearTimeout(decorNoticeTimer.current);
    decorNoticeTimer.current = setTimeout(() => setDecorNotice(null), 3500);
  }

  const EDIT_HINT_SEEN_KEY = "book-shelf-edit-hint-seen";

  function toggleEditMode() {
    setEditMode((prev) => {
      const next = !prev;
      if (next) {
        setView("shelf");
        if (typeof window !== "undefined" && !window.localStorage.getItem(EDIT_HINT_SEEN_KEY)) {
          window.localStorage.setItem(EDIT_HINT_SEEN_KEY, "1");
          setEditHint("Перетащите книги, чтобы изменить порядок или перенести их в другую полку.");
          if (editHintTimer.current) clearTimeout(editHintTimer.current);
          editHintTimer.current = setTimeout(() => setEditHint(null), 5000);
        }
      } else {
        setEditHint(null);
        if (editHintTimer.current) clearTimeout(editHintTimer.current);
      }
      return next;
    });
  }
  const autoBackfillRan = useRef(false);
  const defaultsEnsured = useRef(false);

  async function loadBooks() {
    setLoading(true);
    setError(null);
    const { data, error } = await fetchBooks();
    if (error) {
      setError(error.message);
    } else {
      setBooks((data as Book[]) ?? []);
    }
    setLoading(false);
  }

  async function loadShelves() {
    const { data } = await fetchShelves();
    setShelfEntities((data as Shelf[]) ?? []);
    setShelvesLoaded(true);
  }

  async function loadShelfLinks() {
    const { data } = await fetchBookShelfLinks();
    if (data) setShelfLinks(data as BookShelfLink[]);
  }

  async function loadGenres() {
    const { data } = await fetchGenres();
    setGenreEntities((data as GenreEntity[]) ?? []);
  }

  async function loadShelfDecor() {
    setDecorLoading(true);
    const { data, error } = await fetchShelfDecor();
    if (error) {
      console.error("Supabase shelf_decor fetch failed:", error.message);
      flashDecorNotice("Не удалось загрузить украшения полок");
    } else if (data) {
      setShelfDecor(data as ShelfDecor[]);
    }
    setDecorLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    void loadBooks();
    void loadShelves();
    void loadShelfLinks();
    void loadGenres();
    void loadShelfDecor();
    getReadingGoal(currentYear).then(({ data }) => {
      if (data) setGoal(data as ReadingGoal);
    });
    // Powers the "only books with notes" filter and note-text search without
    // opening each card individually.
    fetchAllBookNotes().then(({ data }) => {
      if (data) setBookNotes(data as { book_id: string; title: string | null; content: string }[]);
    });
  }, []);

  useEffect(() => {
    if (loading || autoBackfillRan.current || !books.length) return;
    autoBackfillRan.current = true;
    void handleRefreshCovers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once after the first successful load, not on every books/handler change
  }, [loading, books.length]);

  // "Все книги" and "Хочу прочитать" always exist as protected shelves.
  // "Хочу прочитать" is a smart shelf: it auto-collects every book whose
  // status is still the default "to_read", with no manual assignment.
  // Create them once, the first time we discover they're missing.
  useEffect(() => {
    if (!shelvesLoaded || defaultsEnsured.current) return;
    defaultsEnsured.current = true;
    (async () => {
      const hasAll = shelfEntities.some((s) => s.is_all);
      const existingDefault = shelfEntities.find((s) => s.is_default && !s.is_all);
      if (!hasAll) {
        const { data } = await insertShelf(UNSHELVED, -2, { is_default: true, is_all: true });
        if (data) setShelfEntities((prev) => [data as Shelf, ...prev]);
      }
      if (!existingDefault) {
        const { data } = await insertShelf(WANT_TO_READ_SHELF, -1, {
          is_default: true,
          kind: "smart",
          filter_type: "status",
          filter_value: "to_read",
        });
        if (data) setShelfEntities((prev) => [...prev, data as Shelf]);
      } else if (existingDefault.kind !== "smart") {
        // Migrate shelves created before this shelf became status-driven.
        const { data } = await convertShelfToSmart(existingDefault.id, "status", "to_read");
        if (data) {
          setShelfEntities((prev) => prev.map((s) => (s.id === existingDefault.id ? (data as Shelf) : s)));
        }
      }
    })();
  }, [shelvesLoaded, shelfEntities]);

  const shelvesByBook = useMemo(() => {
    const map = new Map<string, string[]>();
    shelfLinks.forEach((link) => {
      const arr = map.get(link.book_id) ?? [];
      arr.push(link.shelf_name);
      map.set(link.book_id, arr);
    });
    return map;
  }, [shelfLinks]);

  // Tabs shown at the top: "Все книги" first, then "Хочу прочитать", then
  // custom shelves in creation order.
  const orderedShelves = useMemo(() => {
    return [...shelfEntities].sort((a, b) => {
      if (a.is_all !== b.is_all) return a.is_all ? -1 : 1;
      if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
      return a.position - b.position;
    });
  }, [shelfEntities]);

  const activeShelf = useMemo(
    () => shelfEntities.find((s) => s.name === activeShelfName),
    [shelfEntities, activeShelfName]
  );

  // Manual drag order per shelf, keyed by shelf name then book id. Only used
  // for manual, non-default shelves — system shelves keep their sort mode.
  const bookPositionByShelf = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    shelfLinks.forEach((link) => {
      if (link.position == null) return;
      let inner = map.get(link.shelf_name);
      if (!inner) {
        inner = new Map();
        map.set(link.shelf_name, inner);
      }
      inner.set(link.book_id, link.position);
    });
    return map;
  }, [shelfLinks]);

  const isManualUserShelf = Boolean(activeShelf && !activeShelf.is_all && activeShelf.kind !== "smart");

  const activeShelfBookCount = useMemo(() => {
    if (!activeShelf || !isManualUserShelf) return null;
    return books.filter((b) => (shelvesByBook.get(b.id) ?? []).includes(activeShelf.name)).length;
  }, [books, shelvesByBook, activeShelf, isManualUserShelf]);

  async function handleAddBookToShelf(bookId: string, shelfName: string) {
    const trimmed = shelfName.trim();
    if (!trimmed) return;
    if (!shelfEntities.some((s) => s.name === trimmed)) {
      await handleCreateShelf(trimmed);
    }
    const nextPosition =
      Math.max(0, ...shelfLinks.filter((l) => l.shelf_name === trimmed).map((l) => l.position ?? 0)) + 1;
    setShelfLinks((prev) =>
      prev.some((l) => l.book_id === bookId && l.shelf_name === trimmed)
        ? prev
        : [...prev, { id: `${bookId}:${trimmed}`, book_id: bookId, shelf_name: trimmed, position: nextPosition }]
    );
    const { error } = await addBookToShelfAtEnd(bookId, trimmed);
    if (error) setError(error.message);
  }

  async function handleRemoveBookFromShelf(bookId: string, shelfName: string) {
    setShelfLinks((prev) =>
      prev.filter((l) => !(l.book_id === bookId && l.shelf_name === shelfName))
    );
    const { error } = await removeBookFromShelf(bookId, shelfName);
    if (error) setError(error.message);
  }

  // Drag-drop reorder within a manual shelf. If the book isn't linked to the
  // shelf yet (dropped in from elsewhere), links it first, then places it at
  // the exact dropped slot — same fractional-slot trick shelf decor uses.
  async function handleReorderBook(shelfName: string, bookId: string, slot: number) {
    const alreadyLinked = shelfLinks.some((l) => l.book_id === bookId && l.shelf_name === shelfName);
    setShelfLinks((prev) =>
      alreadyLinked
        ? prev.map((l) => (l.book_id === bookId && l.shelf_name === shelfName ? { ...l, position: slot } : l))
        : [...prev, { id: `${bookId}:${shelfName}`, book_id: bookId, shelf_name: shelfName, position: slot }]
    );
    if (!alreadyLinked) {
      const { error } = await addBookToShelfAtEnd(bookId, shelfName);
      if (error) {
        setError(error.message);
        return;
      }
    }
    const { error } = await reorderBookInShelf(bookId, shelfName, slot);
    if (error) setError(error.message);
  }

  async function handleCreateShelf(
    name: string,
    opts?: Partial<Pick<Shelf, "kind" | "filter_type" | "filter_value" | "is_default" | "is_all" | "color">>
  ) {
    const position = shelfEntities.length
      ? Math.max(...shelfEntities.map((s) => s.position)) + 1
      : 0;
    const { data, error } = await insertShelf(name, position, opts);
    if (error) {
      setError(error.message);
      return;
    }
    if (data) setShelfEntities((prev) => [...prev, data as Shelf]);
  }

  async function handleCreateManualShelf(name: string, color: string) {
    await handleCreateShelf(name, { color });
    selectShelf(name);
  }

  // Used by the "Мои полки" checklist in the book card: create a shelf and
  // immediately put the book being edited on it, without navigating away.
  async function handleCreateShelfForBook(bookId: string, name: string, color: string) {
    await handleCreateShelf(name, { color });
    await handleAddBookToShelf(bookId, name);
  }

  async function handleUpdateShelf(shelf: Shelf, newName: string, newColor: string) {
    const { error } = await updateShelf(shelf.id, shelf.name, newName, newColor);
    if (error) {
      setError(error.message);
      return;
    }
    setShelfEntities((prev) =>
      prev.map((s) => (s.id === shelf.id ? { ...s, name: newName, color: newColor } : s))
    );
    if (newName !== shelf.name) {
      setBooks((prev) => prev.map((b) => (b.shelf === shelf.name ? { ...b, shelf: newName } : b)));
      setShelfLinks((prev) =>
        prev.map((l) => (l.shelf_name === shelf.name ? { ...l, shelf_name: newName } : l))
      );
      if (activeShelfName === shelf.name) setActiveShelfName(newName);
    }
  }

  async function handleDeleteShelf(shelf: Shelf) {
    if (shelf.is_default || shelf.is_all) return;
    const { error } = await deleteShelf(shelf.id, shelf.name);
    if (error) {
      setError(error.message);
      return;
    }
    setShelfEntities((prev) => prev.filter((s) => s.id !== shelf.id));
    setBooks((prev) => prev.map((b) => (b.shelf === shelf.name ? { ...b, shelf: null } : b)));
    setShelfLinks((prev) => prev.filter((l) => l.shelf_name !== shelf.name));
    if (activeShelfName === shelf.name) setActiveShelfName(UNSHELVED);
  }

  function selectShelf(name: string) {
    setView("shelf");
    setActiveShelfName(name);
    setShelfFocus({ key: name, token: Date.now() });
  }

  // Falls back to the default seed list until supabase_genres.sql has been
  // run and the "genres" table has rows (or if that table isn't reachable).
  const genres: string[] = genreEntities.length
    ? genreEntities.map((g) => g.name)
    : [...GENRES];

  async function handleCreateGenre(name: string): Promise<GenreEntity | null> {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const position = genreEntities.length
      ? Math.max(...genreEntities.map((g) => g.position)) + 1
      : 0;
    const { data, error } = await insertGenre(trimmed, position);
    if (error) {
      setError(error.message);
      return null;
    }
    const created = data as GenreEntity;
    setGenreEntities((prev) => [...prev, created]);
    return created;
  }

  async function handleDeleteGenre(genre: GenreEntity, reassignTo: string | null) {
    const { error } = await deleteGenre(genre.id, genre.name, reassignTo);
    if (error) {
      setError(error.message);
      return;
    }
    setGenreEntities((prev) => prev.filter((g) => g.id !== genre.id));
    setBooks((prev) =>
      prev.map((b) => (b.genre === genre.name ? { ...b, genre: reassignTo } : b))
    );
    setFilters((prev) => (prev.genre === genre.name ? { ...prev, genre: "all" } : prev));
  }

  async function handleAssignGenreToBooks(bookIds: string[], genreName: string) {
    if (!bookIds.length) return;
    const { error } = await assignGenreToBooks(bookIds, genreName);
    if (error) {
      setError(error.message);
      return;
    }
    const idSet = new Set(bookIds);
    setBooks((prev) => prev.map((b) => (idSet.has(b.id) ? { ...b, genre: genreName } : b)));
  }

  const duplicateGroups = useMemo(() => findDuplicateGroups(books), [books]);

  async function handleMergeDuplicates(keepId: string, duplicateIds: string[]) {
    for (const dupId of duplicateIds) {
      const { error } = await mergeBookDuplicate(keepId, dupId);
      if (error) {
        setError(error.message);
        return;
      }
    }
    const dupSet = new Set(duplicateIds);
    setBooks((prev) => prev.filter((b) => !dupSet.has(b.id)));
    if (selected && dupSet.has(selected.id)) setSelected(null);
    await loadShelfLinks();
  }

  async function handleDiscardDuplicates(duplicateIds: string[]) {
    for (const dupId of duplicateIds) {
      const { error } = await discardDuplicateBook(dupId);
      if (error) {
        setError(error.message);
        return;
      }
    }
    const dupSet = new Set(duplicateIds);
    setBooks((prev) => prev.filter((b) => !dupSet.has(b.id)));
    if (selected && dupSet.has(selected.id)) setSelected(null);
    await loadShelfLinks();
  }

  const decorByShelf = useMemo(() => {
    const map = new Map<string, ShelfDecor[]>();
    shelfDecor.forEach((d) => {
      const arr = map.get(d.shelf_name) ?? [];
      arr.push(d);
      map.set(d.shelf_name, arr);
    });
    return map;
  }, [shelfDecor]);

  async function handlePlaceDecor(shelfKey: string, decorType: DecorType, slot: number) {
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: ShelfDecor = { id: tempId, shelf_name: shelfKey, decor_type: decorType, slot };
    setShelfDecor((prev) => [...prev, optimistic]);
    const { data, error } = await insertShelfDecor(shelfKey, decorType, slot);
    if (error) {
      console.error("Supabase shelf_decor insert failed:", error.message);
      setShelfDecor((prev) => prev.filter((d) => d.id !== tempId));
      flashDecorNotice("Не удалось сохранить украшение");
      return;
    }
    if (data) {
      setShelfDecor((prev) => prev.map((d) => (d.id === tempId ? (data as ShelfDecor) : d)));
    }
  }

  async function handleMoveDecor(id: string, slot: number) {
    const previous = shelfDecor;
    setShelfDecor((prev) => prev.map((d) => (d.id === id ? { ...d, slot } : d)));
    const { error } = await moveShelfDecor(id, slot);
    if (error) {
      console.error("Supabase shelf_decor move failed:", error.message);
      setShelfDecor(previous);
      flashDecorNotice("Не удалось переместить украшение");
    }
  }

  async function handleDeleteDecor(id: string) {
    const previous = shelfDecor;
    setShelfDecor((prev) => prev.filter((d) => d.id !== id));
    const { error } = await deleteShelfDecor(id);
    if (error) {
      console.error("Supabase shelf_decor delete failed:", error.message);
      setShelfDecor(previous);
      flashDecorNotice("Не удалось удалить украшение");
    }
  }

  const authors = useMemo(() => distinctAuthors(books.map((b) => b.author)), [books]);

  const moodSuggestions = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => b.mood_tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [books]);

  const customShelfNames = useMemo(
    () =>
      shelfEntities
        .filter((s) => !s.is_all && s.kind !== "smart")
        .map((s) => s.name)
        .sort((a, b) => a.localeCompare(b, "ru")),
    [shelfEntities]
  );

  const languageOptions = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.language?.trim()) set.add(b.language.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
  }, [books]);

  const publicationYearOptions = useMemo(() => {
    const set = new Set<number>();
    books.forEach((b) => {
      if (b.publication_year) set.add(b.publication_year);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [books]);

  const notesByBook = useMemo(() => {
    const map = new Map<string, string>();
    bookNotes.forEach((n) => {
      const prev = map.get(n.book_id) ?? "";
      map.set(n.book_id, `${prev} ${n.title ?? ""} ${n.content}`.toLowerCase());
    });
    return map;
  }, [bookNotes]);

  const finishedThisYear = useMemo(
    () => books.filter((b) => b.status === "finished" && b.finished_at?.startsWith(String(currentYear))),
    [books]
  );

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return books.filter((b) => {
      if (q) {
        const haystack = [
          b.title,
          b.author,
          b.emoji_tag ?? "",
          ...(b.mood_tags ?? []),
          notesByBook.get(b.id) ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (activeShelf && !activeShelf.is_all) {
        if (activeShelf.kind === "smart") {
          if (activeShelf.filter_type === "genre") {
            if ((b.genre?.trim() || UNGENRED) !== activeShelf.filter_value) return false;
          } else if (activeShelf.filter_type === "thickness") {
            if (thicknessBucket(b.spine_width) !== activeShelf.filter_value) return false;
          } else if (activeShelf.filter_type === "status") {
            if (b.status !== activeShelf.filter_value) return false;
          }
        } else {
          const memberships = shelvesByBook.get(b.id) ?? [];
          const effective = memberships.length ? memberships : [UNSHELVED];
          if (!effective.includes(activeShelf.name)) return false;
        }
      }
      if (filters.status !== "all" && b.status !== filters.status) return false;
      if (filters.genre !== "all" && (b.genre?.trim() || UNGENRED) !== filters.genre) return false;
      if (filters.author !== "all" && normalizeAuthorKey(b.author ?? "") !== normalizeAuthorKey(filters.author)) return false;
      if (filters.shelf !== "all" && !(shelvesByBook.get(b.id) ?? []).includes(filters.shelf)) return false;
      if (filters.rating > 0 && (b.rating ?? 0) < filters.rating) return false;
      if (filters.year !== "all" && String(b.publication_year ?? "") !== filters.year) return false;
      if (filters.language !== "all" && (b.language?.trim() ?? "") !== filters.language) return false;
      if (filters.format !== "all" && b.format !== filters.format) return false;
      if (filters.moodTag !== "all" && !(b.mood_tags ?? []).includes(filters.moodTag)) return false;
      if (
        filters.emojiTags.length > 0 &&
        !parseEmojiTags(b.emoji_tag).some((e) => filters.emojiTags.includes(e))
      )
        return false;
      if (filters.favoritesOnly && !b.is_favorite) return false;
      if (filters.notesOnly && !notesByBook.has(b.id)) return false;
      if (filters.readFrom && (!b.finished_at || b.finished_at < filters.readFrom)) return false;
      if (filters.readTo && (!b.finished_at || b.finished_at > filters.readTo)) return false;
      return true;
    });
  }, [books, filters, shelvesByBook, activeShelf, notesByBook]);

  const sorted = useMemo(() => sortBooks(filtered, sortMode), [filtered, sortMode]);

  async function handleAddOne(newBook: NewBook): Promise<Book | null> {
    const { data, error } = await insertBook(newBook);
    if (error) {
      setError(error.message);
      return null;
    }
    if (data) {
      const saved = data as Book;
      setBooks((prev) => [saved, ...prev]);
      if (saved.shelf?.trim()) {
        const name = saved.shelf.trim();
        setShelfLinks((prev) => [...prev, { id: `${saved.id}:${name}`, book_id: saved.id, shelf_name: name }]);
        if (!shelfEntities.some((s) => s.name === name)) await handleCreateShelf(name);
      }
      return saved;
    }
    return null;
  }

  async function handleAddMany(newBooks: NewBook[]) {
    const { data, error } = await insertBooks(newBooks);
    if (error) {
      setError(error.message);
      return;
    }
    if (data) {
      const saved = data as Book[];
      setBooks((prev) => [...saved, ...prev]);
      const newLinks = saved
        .filter((b) => b.shelf?.trim())
        .map((b) => ({ id: `${b.id}:${b.shelf!.trim()}`, book_id: b.id, shelf_name: b.shelf!.trim() }));
      if (newLinks.length) setShelfLinks((prev) => [...prev, ...newLinks]);
      for (const name of new Set(newLinks.map((l) => l.shelf_name))) {
        if (!shelfEntities.some((s) => s.name === name)) await handleCreateShelf(name);
      }
    }
  }

  async function handleSave(updated: Book) {
    const { id, ...fields } = updated;
    const { data, error } = await updateBook(id, fields);
    if (error) {
      setError(error.message);
      return;
    }
    const saved = (data as Book) ?? updated;
    setBooks((prev) => prev.map((b) => (b.id === id ? saved : b)));
    setSelected(saved);
  }

  async function handleDelete(id: string) {
    const { count } = await countBookQuotes(id);
    if (count > 0) {
      const book = books.find((b) => b.id === id) ?? null;
      setPendingQuoteDelete({ bookId: id, book, count });
      return;
    }
    await performDelete(id);
  }

  async function performDelete(id: string) {
    const { error } = await deleteBook(id);
    if (error) {
      setError(error.message);
      return;
    }
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setSelected(null);
  }

  async function handleQuoteOrphanChoice(action: "delete" | "keep") {
    if (!pendingQuoteDelete) return;
    const { bookId, book } = pendingQuoteDelete;
    if (action === "delete") {
      await deleteBookQuotesForBook(bookId);
    } else if (book) {
      await detachBookQuotesForBook(bookId, {
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
      });
    }
    setPendingQuoteDelete(null);
    await performDelete(bookId);
  }

  async function handleExport() {
    const { data: moodboard } = await fetchAllMoodboardImages();
    const payload = {
      exported_at: new Date().toISOString(),
      books,
      moodboard_images: moodboard ?? [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `book-shelf-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRefreshCovers(silent = false) {
    const missingCover = books.filter((b) => !b.cover_url);
    const missingSpineOnly = books.filter((b) => b.cover_url && !b.spine_image_url);
    const total = missingCover.length + missingSpineOnly.length;
    if (!total) {
      if (!silent) {
        setError(null);
        window.alert("У всех книг уже есть обложки и корешки.");
      }
      return;
    }
    setRefreshingCovers(true);
    let updated = 0;
    for (const book of missingCover) {
      try {
        const url = await fetchBestCoverUrl(book.title, book.author);
        if (url) {
          const spineResult = await generateAndUploadSpine(url);
          const { data, error } = await updateBook(book.id, {
            cover_url: url,
            ...(spineResult.url ? { spine_image_url: spineResult.url } : {}),
          });
          if (!error && data) {
            const saved = data as Book;
            setBooks((prev) => prev.map((b) => (b.id === saved.id ? saved : b)));
            updated += 1;
          }
        }
      } catch {
        // skip books that fail to fetch a cover and continue with the rest
      }
    }
    for (const book of missingSpineOnly) {
      try {
        const spineResult = await generateAndUploadSpine(book.cover_url as string);
        if (spineResult.url) {
          const { data, error } = await updateBook(book.id, { spine_image_url: spineResult.url });
          if (!error && data) {
            const saved = data as Book;
            setBooks((prev) => prev.map((b) => (b.id === saved.id ? saved : b)));
            updated += 1;
          }
        }
      } catch {
        // skip books that fail to generate a spine and continue with the rest
      }
    }
    setRefreshingCovers(false);
    if (!silent) window.alert(`Обновлено: ${updated} из ${total}.`);
  }

  const goalProgress = goal ? Math.min(100, (finishedThisYear.length / goal.target_books) * 100) : null;

  return (
    <div className="flex-1 flex flex-col">
      <header className="relative overflow-visible border-b border-black/40 header-glass room-scene">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute left-1/3 top-6 w-5 opacity-70">
            <StarSpark />
          </div>
          <div className="absolute right-10 top-14 w-4 opacity-45 hidden sm:block">
            <StarSpark />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center justify-end gap-3">
            <SettingsMenu
              onRefreshCovers={() => handleRefreshCovers()}
              refreshingCovers={refreshingCovers}
              onExport={handleExport}
              onManageGenres={() => setShowGenreManager(true)}
              onManageDuplicates={() => setShowDuplicateManager(true)}
              duplicateCount={duplicateGroups.reduce((sum, g) => sum + g.length, 0)}
            />
          </div>
          <h1 className="display text-5xl sm:text-6xl text-cream drop-shadow-md">
            Книжная полка
          </h1>
          <p className="text-cream/70 mt-1 text-sm sm:text-base max-w-md">
            {books.length
              ? `На полке ${books.length} ${pluralBooks(books.length)}. Заваривайте чай и выбирайте следующую книгу.`
              : "Добавьте свою первую книгу — и полка оживёт."}
          </p>

          <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-full bg-terracotta text-cream px-5 py-2.5 text-sm font-bold shadow-lg hover:brightness-105 transition-all"
            >
              + Добавить книгу
            </button>
          </div>

          <ShelfTabs
            shelves={orderedShelves}
            activeName={activeShelfName}
            onSelect={selectShelf}
            onCreateManual={handleCreateManualShelf}
            onUpdate={handleUpdateShelf}
            onDelete={handleDeleteShelf}
            onDropBook={handleAddBookToShelf}
            editMode={editMode}
          />
        </div>

        {/* Ledge at the base of the header: a row of decorative objects, all sharing one
            baseline and identical footprint so the composition reads as one balanced
            display rather than a scatter of differently-sized icons. */}
        <div className="relative h-24 sm:h-28 wood-shelf mt-4">
          <div className="shelf-glow-pool" />
          <div className="absolute inset-0 flex items-end justify-center sm:justify-evenly gap-4 sm:gap-8 px-6 sm:px-12 pb-0 overflow-x-auto sm:overflow-visible">
            <Link
              href="/read"
              title="Мой книжный багаж"
              className="ledge-item shrink-0 h-16 sm:h-20 w-16 sm:w-20 hover:-translate-y-0.5 transition-transform"
            >
              <LuggageIllustration className="h-full w-full" />
            </Link>
            {goalProgress != null && (
              <Link
                href="/goal"
                title={`Цель ${currentYear}: прочитано ${finishedThisYear.length} из ${goal!.target_books}`}
                className="ledge-item shrink-0 h-16 sm:h-20 w-16 sm:w-20 hover:-translate-y-0.5 transition-transform"
              >
                <BookStackIllustration progress={goalProgress} className="h-full w-full" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setShowDecorPicker(true)}
              title={decorLoading ? "Загрузка украшений…" : "Уголок уюта: растения и свечи для полок"}
              disabled={decorLoading}
              className="ledge-item shrink-0 h-16 sm:h-20 w-16 sm:w-20 hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <PottedPlant className="h-full w-full" />
            </button>
            <Link
              href="/quotes"
              title="Любимые цитаты"
              className="ledge-item shrink-0 h-16 sm:h-20 w-16 sm:w-20 hover:-translate-y-0.5 transition-transform"
            >
              <QuoteJarIllustration className="h-full w-full" />
            </Link>
            <Link
              href="/recommend"
              title="Что читать дальше?"
              className="ledge-item shrink-0 h-16 sm:h-20 w-16 sm:w-20 hover:-translate-y-0.5 transition-transform"
            >
              <CompassIllustration className="h-full w-full" />
            </Link>
            <div className="ledge-item shrink-0 h-16 sm:h-20 w-16 sm:w-20 pointer-events-none">
              <LampGlow className="h-full w-full" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full px-4 sm:px-8 py-6">
        <div className="mb-6 rounded-2xl border border-copper/15 bg-[rgba(245,230,211,0.92)] p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4">
          <SearchBar
            value={filters.query}
            onChange={(query) => setFilters((prev) => ({ ...prev, query }))}
            className="w-full"
          />

          <div className="h-px bg-copper/15" />

          <div className="flex flex-col xl:flex-row xl:items-start gap-4 xl:gap-6">
            <div className="flex-1 min-w-0">
              <LibraryFilterBar
                filters={filters}
                onChange={setFilters}
                genres={genres}
                authors={authors}
                shelves={customShelfNames}
                languages={languageOptions}
                years={publicationYearOptions}
                moodTags={moodSuggestions}
              />
            </div>
            <div className="hidden xl:block w-px self-stretch bg-copper/15" />
            <GroupSortBar
              groupMode={groupMode}
              onGroupChange={setGroupMode}
              sortMode={sortMode}
              onSortChange={setSortMode}
            />
          </div>
        </div>

        <div className="min-w-0">
          {error && (
            <div className="mb-4 rounded-xl border border-terracotta-dark/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta-dark">
              Ошибка Supabase: {error}
            </div>
          )}

          {!loading && !(activeShelfBookCount === 0 && activeShelf) && (
            <ResultsBar
              count={sorted.length}
              view={view}
              onViewChange={setView}
              editMode={editMode}
              onToggleEditMode={toggleEditMode}
            />
          )}

          <div className="mt-4">
            {loading ? (
              <LoadingShelf />
            ) : activeShelfBookCount === 0 && activeShelf ? (
              <EmptyUserShelf
                shelfName={activeShelf.name}
                onAddClick={() => setAddPickerShelf(activeShelf.name)}
                onDropBook={(bookId) => handleReorderBook(activeShelf.name, bookId, 1)}
              />
            ) : sorted.length === 0 ? (
              <EmptyState hasBooks={books.length > 0} onAdd={() => setShowAdd(true)} />
            ) : view === "shelf" ? (
              <ShelfPager
                groups={buildShelfGroups({ books: sorted, groupMode, activeShelf, bookPositionByShelf, shelvesByBook })}
                onSelect={setSelected}
                focusRequest={shelfFocus}
                onAddToShelf={setAddPickerShelf}
                decorByShelf={decorByShelf}
                onPlaceDecor={handlePlaceDecor}
                onMoveDecor={handleMoveDecor}
                onDeleteDecor={handleDeleteDecor}
                onDropOutside={() => flashDecorNotice("Здесь недостаточно места для украшения")}
                onReorderBook={handleReorderBook}
                onRemoveBook={(shelfKey, bookId) => handleRemoveBookFromShelf(bookId, shelfKey)}
                editMode={editMode}
              />
            ) : (
              <BookLibraryGroups
                groups={groupBooks(sorted, groupMode, shelvesByBook)}
                mode={view}
                onSelect={setSelected}
                shelvesByBook={shelvesByBook}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl w-full px-4 sm:px-6 pb-8 pt-2 text-center text-xs text-cream/60">
        сделано с теплом для тех, кто любит книги
      </footer>

      {selected && (
        <BookModal
          key={selected.id}
          book={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
          moodSuggestions={moodSuggestions}
          userShelves={shelfEntities.filter((s) => !s.is_all && s.kind !== "smart")}
          wantToReadShelf={shelfEntities.find((s) => s.kind === "smart" && s.filter_type === "status")}
          bookShelves={shelvesByBook.get(selected.id) ?? []}
          onAddShelf={handleAddBookToShelf}
          onRemoveShelf={handleRemoveBookFromShelf}
          onCreateShelfForBook={handleCreateShelfForBook}
          genres={genres}
        />
      )}

      {showAdd && (
        <AddBookForm
          onClose={() => {
            setShowAdd(false);
            setAddDefaultShelf(null);
          }}
          onAddOne={handleAddOne}
          onAddMany={handleAddMany}
          onUpdateBook={handleSave}
          defaultShelf={addDefaultShelf ?? undefined}
          genres={genres}
        />
      )}

      {addPickerShelf && (
        <ShelfAddPicker
          shelfName={addPickerShelf}
          books={books}
          bookShelves={shelvesByBook}
          onClose={() => setAddPickerShelf(null)}
          onAddExisting={(bookId) => handleAddBookToShelf(bookId, addPickerShelf)}
          onCreateNew={() => {
            setAddDefaultShelf(addPickerShelf);
            setAddPickerShelf(null);
            setShowAdd(true);
          }}
        />
      )}

      {showDecorPicker && <DecorPicker onClose={() => setShowDecorPicker(false)} />}
      <DecorDragGhost />
      <BookDragGhost books={books} />
      {decorNotice && (
        <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-espresso-dark/95 border border-cream/15 text-cream text-sm px-4 py-2 shadow-lg pop-in">
          {decorNotice}
        </div>
      )}
      {editHint && (
        <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 max-w-[90vw] rounded-full bg-espresso-dark/95 border border-cream/15 text-cream text-sm px-4 py-2 shadow-lg pop-in text-center">
          {editHint}
        </div>
      )}

      {pendingQuoteDelete && (
        <QuoteOrphanModal
          bookTitle={pendingQuoteDelete.book?.title ?? "книга"}
          count={pendingQuoteDelete.count}
          onChoice={handleQuoteOrphanChoice}
          onCancel={() => setPendingQuoteDelete(null)}
        />
      )}

      {showGenreManager && (
        <GenreManager
          genres={genreEntities}
          books={books}
          onClose={() => setShowGenreManager(false)}
          onCreateGenre={handleCreateGenre}
          onDeleteGenre={handleDeleteGenre}
          onAssignBooks={handleAssignGenreToBooks}
        />
      )}

      {showDuplicateManager && (
        <DuplicateManager
          books={books}
          onClose={() => setShowDuplicateManager(false)}
          onMerge={handleMergeDuplicates}
          onDiscard={handleDiscardDuplicates}
        />
      )}

    </div>
  );
}

function sortBooks(books: Book[], mode: SortMode): Book[] {
  const copy = [...books];
  switch (mode) {
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title, "ru"));
    case "title_desc":
      return copy.sort((a, b) => b.title.localeCompare(a.title, "ru"));
    case "author":
      return copy.sort((a, b) => a.author.localeCompare(b.author, "ru"));
    case "rating":
      return copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    case "finished_at":
      return copy.sort((a, b) => (b.finished_at ?? "").localeCompare(a.finished_at ?? ""));
    case "created_at_asc":
      return copy.sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
    case "created_at":
    default:
      return copy.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  }
}

// Shared grouping logic for both the flat grid/list views and the shelf
// pager. year_read/rating/author/shelf modes only apply to the flat views —
// the pager keeps its original status/genre/none support plus these.
function groupBooks(books: Book[], groupMode: GroupMode, shelvesByBook: Map<string, string[]>): LibraryGroup[] {
  switch (groupMode) {
    case "status":
      return STATUS_ORDER.map((status) => ({
        key: status,
        title: STATUS_LABEL[status],
        books: books.filter((b) => b.status === status),
        accent: STATUS_ACCENT[status],
      })).filter((g) => g.books.length > 0);
    case "genre": {
      const key = (b: Book) => b.genre?.trim() || UNGENRED;
      const names = Array.from(new Set(books.map(key))).sort((a, b) => a.localeCompare(b, "ru"));
      return names
        .map((name) => ({ key: name, title: name, books: books.filter((b) => key(b) === name), accent: "#c1440e" }))
        .filter((g) => g.books.length > 0);
    }
    case "author": {
      const key = (b: Book) => b.author?.trim() || "Без автора";
      const names = Array.from(new Set(books.map(key))).sort((a, b) => a.localeCompare(b, "ru"));
      return names.map((name) => ({
        key: name,
        title: name,
        books: books.filter((b) => key(b) === name),
        accent: "#8a4b6b",
      }));
    }
    case "shelf": {
      const keys = (b: Book) => {
        const memberships = shelvesByBook.get(b.id) ?? [];
        return memberships.length ? memberships : [UNSHELVED];
      };
      const names = Array.from(new Set(books.flatMap(keys))).sort((a, b) => a.localeCompare(b, "ru"));
      return names.map((name) => ({
        key: name,
        title: name,
        books: books.filter((b) => keys(b).includes(name)),
        accent: "#3d5a80",
      }));
    }
    case "year_read": {
      const key = (b: Book) => (b.finished_at ? b.finished_at.slice(0, 4) : UNKNOWN_YEAR_READ);
      const names = Array.from(new Set(books.map(key))).sort((a, b) => b.localeCompare(a));
      return names.map((name) => ({
        key: name,
        title: name,
        books: books.filter((b) => key(b) === name),
        accent: "#4f7a45",
      }));
    }
    case "rating": {
      const key = (b: Book) => (b.rating ? String(b.rating) : "Без оценки");
      const names = Array.from(new Set(books.map(key))).sort((a, b) =>
        a === "Без оценки" ? 1 : b === "Без оценки" ? -1 : Number(b) - Number(a)
      );
      return names.map((name) => ({
        key: name,
        title: name === "Без оценки" ? name : `${name} ★`,
        books: books.filter((b) => key(b) === name),
        accent: "#c9962c",
      }));
    }
    case "none":
    default:
      return [{ key: "__all__", title: "Все книги", books }];
  }
}

function buildShelfGroups({
  books,
  groupMode,
  activeShelf,
  bookPositionByShelf,
  shelvesByBook,
}: {
  books: Book[];
  groupMode: GroupMode;
  activeShelf?: Shelf;
  bookPositionByShelf: Map<string, Map<string, number>>;
  shelvesByBook: Map<string, string[]>;
}): ShelfGroup[] {
  if (groupMode !== "none") {
    return groupBooks(books, groupMode, shelvesByBook).map((g) => ({ ...g, addable: false }));
  }

  // "none": books are already filtered to the active shelf tab, so show a single row.
  const addable = Boolean(activeShelf) && !activeShelf!.is_all && activeShelf!.kind !== "smart";
  // Manual user shelves are never auto-sorted — always show the user's own
  // drag order, ignoring the sort-mode the "Все книги"/smart shelves use.
  let rowBooks = books;
  if (addable && activeShelf) {
    const posMap = bookPositionByShelf.get(activeShelf.name);
    rowBooks = [...books].sort((a, b) => {
      const pa = posMap?.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const pb = posMap?.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return pa - pb;
    });
  }
  return [
    {
      key: activeShelf?.name ?? UNSHELVED,
      title: activeShelf?.name ?? UNSHELVED,
      books: rowBooks,
      accent: activeShelf?.color ?? "#c1440e",
      addable,
      reorderable: addable,
    },
  ];
}


function LoadingShelf() {
  return (
    <div className="wood-shelf rounded-lg p-6 flex items-end gap-1.5 overflow-x-auto animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="rounded-t-md bg-cream/20"
          style={{ height: 140 + (i % 3) * 30, width: 40 }}
        />
      ))}
    </div>
  );
}

function EmptyState({ hasBooks, onAdd }: { hasBooks: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <PottedPlant className="w-16 h-auto mb-4 opacity-90" />
      <h2 className="display text-2xl text-cream mb-1">
        {hasBooks ? "Ничего не найдено" : "Полка пока пустая"}
      </h2>
      <p className="text-cream/60 text-sm max-w-xs mb-4">
        {hasBooks
          ? "Попробуйте изменить поиск или фильтры."
          : "Добавьте книгу вручную или вставьте список — и уютная полка начнёт заполняться."}
      </p>
      {!hasBooks && (
        <button
          onClick={onAdd}
          className="rounded-full bg-terracotta text-cream px-5 py-2.5 text-sm font-bold shadow-lg hover:brightness-105"
        >
          + Добавить книгу
        </button>
      )}
    </div>
  );
}

function EmptyUserShelf({
  shelfName,
  onAddClick,
  onDropBook,
}: {
  shelfName: string;
  onAddClick: () => void;
  onDropBook: (bookId: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);

  // Touch long-press drop: mirrors the native onDragOver/onDrop below but via
  // the pointer event bus, since HTML5 drag events don't fire on touch.
  useEffect(() => {
    function inZone(clientX: number, clientY: number) {
      const rect = zoneRef.current?.getBoundingClientRect();
      if (!rect) return false;
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    }
    function onMove(e: Event) {
      const { clientX, clientY } = (e as CustomEvent<BookPointerDetail>).detail;
      setDragOver(inZone(clientX, clientY));
    }
    function onEnd(e: Event) {
      const { payload, clientX, clientY } = (e as CustomEvent<BookPointerDetail>).detail;
      setDragOver(false);
      if (inZone(clientX, clientY)) onDropBook(payload.bookId);
    }
    window.addEventListener(BOOK_POINTER_MOVE, onMove);
    window.addEventListener(BOOK_POINTER_END, onEnd);
    return () => {
      window.removeEventListener(BOOK_POINTER_MOVE, onMove);
      window.removeEventListener(BOOK_POINTER_END, onEnd);
    };
  }, [onDropBook]);

  return (
    <div
      ref={zoneRef}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const bookId = e.dataTransfer.getData("application/x-book-id");
        if (bookId) onDropBook(bookId);
      }}
      className={`wood-shelf rounded-2xl flex flex-col items-center justify-center text-center py-16 px-4 transition-shadow ${
        dragOver ? "ring-2 ring-glow/70" : ""
      }`}
    >
      <PottedPlant className="w-14 h-auto mb-4 opacity-90" />
      <h2 className="display text-2xl text-cream mb-1">На этой полке пока нет книг</h2>
      <p className="text-cream/60 text-sm max-w-xs mb-4">
        Перетащите сюда книги из библиотеки или нажмите «Добавить книги»
      </p>
      <button
        onClick={onAddClick}
        className="rounded-full bg-terracotta text-cream px-5 py-2.5 text-sm font-bold shadow-lg hover:brightness-105"
      >
        + Добавить книги
      </button>
      <p className="text-cream/40 text-xs mt-2">«{shelfName}»</p>
    </div>
  );
}

function pluralBooks(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "книга";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "книги";
  return "книг";
}
