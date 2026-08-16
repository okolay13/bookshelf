// Emoji mood/theme tags for a book. Stored in the existing `emoji_tag` text column
// as a single string, so no schema change is needed. Multiple tags are joined with
// EMOJI_TAG_DELIMITER, which never appears inside the emoji themselves.
//
// This catalog is the single source of truth for tagging across the app: the book
// card, library filtering, and the "Что читать дальше?" recommender all read from
// the same list and the same parse/serialize helpers.

export type EmojiCategoryId =
  | "genre"
  | "atmosphere"
  | "emotion"
  | "theme"
  | "setting"
  | "creatures";

export interface EmojiCategory {
  id: EmojiCategoryId;
  label: string;
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  { id: "genre", label: "📚 Жанры" },
  { id: "atmosphere", label: "🌙 Атмосфера" },
  { id: "emotion", label: "🧠 Эмоции" },
  { id: "theme", label: "⚔️ Темы" },
  { id: "setting", label: "🗺️ Место и время" },
  { id: "creatures", label: "🐉 Существа и тропы" },
];

export interface EmojiTagOption {
  emoji: string;
  label: string;
  category: EmojiCategoryId;
}

export const MAX_EMOJI_TAGS = 5;

const EMOJI_TAG_DELIMITER = ",";

export const EMOJI_TAG_CATALOG: EmojiTagOption[] = [
  // Жанры
  { emoji: "❤️", label: "Романтика", category: "genre" },
  { emoji: "🌹", label: "Dark Romance", category: "genre" },
  { emoji: "🏰", label: "Фэнтези", category: "genre" },
  { emoji: "🔎", label: "Детектив", category: "genre" },
  { emoji: "🕰️", label: "История", category: "genre" },
  { emoji: "🚀", label: "Научная фантастика", category: "genre" },
  { emoji: "🤖", label: "Технологии / ИИ", category: "genre" },

  // Атмосфера
  { emoji: "🍂", label: "Осень", category: "atmosphere" },
  { emoji: "❄️", label: "Зима", category: "atmosphere" },
  { emoji: "🌸", label: "Весна", category: "atmosphere" },
  { emoji: "☀️", label: "Лето", category: "atmosphere" },
  { emoji: "🌧️", label: "Дождь", category: "atmosphere" },
  { emoji: "🌙", label: "Ночь", category: "atmosphere" },
  { emoji: "☕", label: "Уют", category: "atmosphere" },
  { emoji: "🕯️", label: "Медленный темп", category: "atmosphere" },
  { emoji: "🔥", label: "Напряжение", category: "atmosphere" },

  // Эмоции
  { emoji: "✨", label: "Feel Good", category: "emotion" },
  { emoji: "🥀", label: "Меланхолия", category: "emotion" },
  { emoji: "🧠", label: "Заставляет задуматься", category: "emotion" },
  { emoji: "💔", label: "Разбитое сердце", category: "emotion" },
  { emoji: "🎭", label: "Психология", category: "emotion" },
  { emoji: "⚰️", label: "Смерть", category: "emotion" },
  { emoji: "😂", label: "Юмор", category: "emotion" },
  { emoji: "😭", label: "Грусть", category: "emotion" },
  { emoji: "😱", label: "Шок", category: "emotion" },
  { emoji: "🥹", label: "Трогательно", category: "emotion" },
  { emoji: "🤍", label: "Спокойствие", category: "emotion" },

  // Темы
  { emoji: "🏡", label: "Семья", category: "theme" },
  { emoji: "🤝", label: "Дружба", category: "theme" },
  { emoji: "🗡️", label: "Приключение", category: "theme" },
  { emoji: "👑", label: "Королевский двор", category: "theme" },
  { emoji: "🧩", label: "Загадка", category: "theme" },
  { emoji: "🏛️", label: "Академия", category: "theme" },
  { emoji: "🏕️", label: "Выживание", category: "theme" },
  { emoji: "🧪", label: "Яд", category: "theme" },
  { emoji: "💌", label: "Письма", category: "theme" },
  { emoji: "🎻", label: "Музыка", category: "theme" },
  { emoji: "⛪", label: "Религия", category: "theme" },
  { emoji: "🎨", label: "Искусство", category: "theme" },
  { emoji: "🔒", label: "Плен", category: "theme" },
  { emoji: "⚖️", label: "Политика", category: "theme" },
  { emoji: "🏹", label: "Охота", category: "theme" },
  { emoji: "⚔️", label: "Война", category: "theme" },
  { emoji: "🔬", label: "Наука", category: "theme" },

  // Место и время
  { emoji: "🌲", label: "Лес", category: "setting" },
  { emoji: "🏔️", label: "Горы", category: "setting" },
  { emoji: "🌊", label: "Море", category: "setting" },
  { emoji: "🏜️", label: "Пустыня", category: "setting" },
  { emoji: "🌌", label: "Космос", category: "setting" },
  { emoji: "📜", label: "Древний мир", category: "setting" },
  { emoji: "🎪", label: "Цирк", category: "setting" },
  { emoji: "⏳", label: "Путешествия во времени", category: "setting" },
  { emoji: "🌍", label: "Путешествие", category: "setting" },

  // Существа и тропы
  { emoji: "🪄", label: "Магия", category: "creatures" },
  { emoji: "🧙", label: "Волшебство", category: "creatures" },
  { emoji: "🐉", label: "Драконы", category: "creatures" },
  { emoji: "🧹", label: "Ведьмы", category: "creatures" },
  { emoji: "🧛", label: "Вампиры", category: "creatures" },
  { emoji: "👻", label: "Призраки", category: "creatures" },
  { emoji: "🐺", label: "Оборотни", category: "creatures" },
  { emoji: "🧜‍♀️", label: "Русалки", category: "creatures" },
];

export function parseEmojiTags(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(EMOJI_TAG_DELIMITER)
    .map((e) => e.trim())
    .filter(Boolean);
}

export function serializeEmojiTags(tags: string[]): string | null {
  return tags.length > 0 ? tags.join(EMOJI_TAG_DELIMITER) : null;
}

export function emojiTagLabel(emoji: string): string | undefined {
  return EMOJI_TAG_CATALOG.find((t) => t.emoji === emoji)?.label;
}
