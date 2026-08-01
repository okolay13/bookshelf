# Книжная полка

Уютное веб-приложение для отслеживания книг: полки, статусы чтения, оценки и заметки. Next.js (App Router) + Supabase + Tailwind CSS.

## Настройка Supabase

1. В файле `.env.local` (создан из `.env.local.example`) укажите свои данные проекта Supabase:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   Их можно найти в Supabase Dashboard → Project Settings → API.

2. Таблица `books` уже должна существовать со столбцами: `id` (uuid, primary key, по умолчанию `gen_random_uuid()`), `title`, `author`, `status` (`to_read` / `reading` / `finished`), `rating`, `cover_url`, `shelf`, `notes`, `started_at`, `finished_at`, `created_at`.

3. Приложение обращается к Supabase напрямую из браузера через анонимный (`anon`) ключ — включите Row Level Security и добавьте политики, разрешающие нужные операции. Для личного использования без авторизации подойдёт, например:

   ```sql
   alter table books enable row level security;

   create policy "Allow anon read" on books
     for select using (true);

   create policy "Allow anon insert" on books
     for insert with check (true);

   create policy "Allow anon update" on books
     for update using (true);

   create policy "Allow anon delete" on books
     for delete using (true);
   ```

   Если планируете открывать приложение публично, добавьте авторизацию — текущая настройка предполагает, что доступ к самому сайту доверенный (личное использование или защита паролем на уровне Vercel/хостинга).

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Деплой на Vercel

1. Запушьте проект в свой Git-репозиторий (GitHub/GitLab/Bitbucket).
2. На [vercel.com/new](https://vercel.com/new) импортируйте репозиторий — Next.js определится автоматически.
3. В настройках проекта (Environment Variables) добавьте:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Нажмите Deploy.

`.env.local` в git не попадает (см. `.gitignore`) — переменные окружения на Vercel нужно задать отдельно.

## Возможности

- Главная страница с тремя видами: по полкам, по статусу, списком. Книги отображаются как корешки на деревянной полке.
- Клик по корешку открывает модалку с просмотром и редактированием всех полей, быстрой сменой статуса и удалением.
- Добавление книги вручную или списком (формат `Автор — Название`, по одной книге на строке).
- Поиск и фильтрация по названию/автору, полке и статусу.
