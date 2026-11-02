alter table public.monthly_resources
  add column title text not null default '',
  add column description text not null default '';

alter table public.monthly_resources
  alter column title drop default;

update public.monthly_resources
set title = 'Recurso'
where length(trim(title)) = 0;

alter table public.monthly_resources
  add constraint monthly_resources_title_not_empty
  check (length(trim(title)) > 0);
