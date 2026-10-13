alter table public.items drop constraint items_condition_check;
alter table public.items add constraint items_condition_check check (length(condition) <= 600);
alter table public.items add column details_edited boolean not null default false;
