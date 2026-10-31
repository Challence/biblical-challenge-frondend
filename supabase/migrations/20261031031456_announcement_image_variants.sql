
alter table public.announcements
  add column if not exists image_desktop_path text,
  add column if not exists image_tablet_path text,
  add column if not exists image_mobile_path text;
