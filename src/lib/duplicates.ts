import { Book } from "@/lib/types";

function normalizeForDup(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function duplicateGroupKey(title: string, author: string) {
  return `${normalizeForDup(title)}::${normalizeForDup(author)}`;
}

// Groups books that share the same normalized title + author. Used by the
// duplicate-cleanup tool to surface likely-duplicate entries (e.g. a book
// added twice under "to read" and "finished").
export function findDuplicateGroups(books: Book[]): Book[][] {
  const map = new Map<string, Book[]>();
  for (const book of books) {
    const key = duplicateGroupKey(book.title, book.author);
    if (key === "::") continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(book);
  }
  return [...map.values()].filter((group) => group.length > 1);
}
