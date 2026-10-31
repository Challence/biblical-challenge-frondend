alter table public.announcements
  drop column if exists title,
  drop column if exists description;

drop index if exists public.announcements_title_search_idx;
