export interface ParsedLine {
  raw: string;
  author: string;
  title: string;
  valid: boolean;
}

const SEPARATOR = /\s+[—–-]\s+/;

export function parseBulkText(text: string): ParsedLine[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((raw) => {
      const parts = raw.split(SEPARATOR);
      if (parts.length >= 2) {
        const author = parts[0].trim();
        const title = parts.slice(1).join(" — ").trim();
        return { raw, author, title, valid: Boolean(author && title) };
      }
      return { raw, author: "", title: raw, valid: false };
    });
}
