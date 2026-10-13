create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'New object' check (length(name) between 1 and 120),
  description text not null default '' check (length(description) <= 1200),
  category text not null default 'Other' check (category in ('Home','Clothing','Electronics','Books','Kitchen','Other')),
  location text not null default '' check (length(location) <= 120),
  condition text not null default '' check (length(condition) <= 120),
  notes text not null default '' check (length(notes) <= 2000),
  disposition text not null default 'active' check (disposition in ('active','keep','sell','donate','toss')),
  processing_state text not null default 'uploaded' check (processing_state in ('uploaded','processing','ready','failed')),
  original_path text not null unique,
  image_path text,
  warning text,
  deleting boolean not null default false,
  attempts integer not null default 0 check (attempts between 0 and 3),
  workflow_run_id text,
  provider_job jsonb,
  listing_title text not null default '' check (length(listing_title) <= 160),
  listing_body text not null default '' check (length(listing_body) <= 4000),
  price_low numeric(10,2) check (price_low >= 0),
  price_high numeric(10,2) check (price_high >= price_low),
  asking_price numeric(10,2) check (asking_price >= 0),
  price_basis text not null default '' check (length(price_basis) <= 1000),
  currency text not null default 'USD' check (currency in ('USD','CAD','GBP','EUR','AUD')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (original_path like user_id::text || '/%'),
  check (image_path is null or image_path like user_id::text || '/%')
);
create index items_user_created on public.items(user_id,created_at desc);
alter table public.items enable row level security;
create policy items_read_own on public.items for select to authenticated using ((select auth.uid())=user_id);
-- Mutations go through authenticated app endpoints. Browsers cannot alter ownership,
-- processing state, quotas, or generated paths through the Data API.
revoke all on public.items from anon,authenticated;
grant select on public.items to authenticated;
grant all on public.items to service_role;

create table public.ai_daily_usage (
  day date not null default current_date,
  scope text not null,
  used integer not null default 0 check (used >= 0),
  primary key (day,scope)
);
alter table public.ai_daily_usage enable row level security;
revoke all on public.ai_daily_usage from anon,authenticated;
grant all on public.ai_daily_usage to service_role;

create table public.account_removals (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.account_removals enable row level security;
revoke all on public.account_removals from anon,authenticated;
grant all on public.account_removals to service_role;

create function public.claim_processing(item_id uuid, owner_id uuid, user_limit integer, global_limit integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare item public.items; user_used integer; global_used integer;
begin
  perform pg_advisory_xact_lock(hashtext('poof-account:' || owner_id::text));
  if exists(select 1 from public.account_removals where user_id=owner_id) then raise exception 'POOF_ACCOUNT_REMOVAL'; end if;
  -- The shared lock makes quota reservation and item claiming one transaction.
  perform pg_advisory_xact_lock(hashtext('poof_ai_budget'));
  select * into item from public.items where id=item_id and user_id=owner_id for update;
  if not found or item.deleting or item.processing_state not in ('uploaded','failed') or item.attempts >= 3 then return false; end if;
  insert into public.ai_daily_usage(day,scope) values(current_date,owner_id::text),(current_date,'global') on conflict do nothing;
  select used into user_used from public.ai_daily_usage where day=current_date and scope=owner_id::text;
  select used into global_used from public.ai_daily_usage where day=current_date and scope='global';
  if user_used >= user_limit or global_used >= global_limit then raise exception 'POOF_DAILY_LIMIT'; end if;
  update public.ai_daily_usage set used=used+1 where day=current_date and scope in(owner_id::text,'global');
  update public.items set processing_state='processing', attempts=attempts+1, warning=null, updated_at=now() where id=item_id;
  return true;
end $$;
revoke all on function public.claim_processing(uuid,uuid,integer,integer) from public,anon,authenticated;
grant execute on function public.claim_processing(uuid,uuid,integer,integer) to service_role;

create function public.create_inventory_item(item_id uuid, owner_id uuid, image_path text, item_limit integer)
returns public.items language plpgsql security invoker set search_path = '' as $$
declare result public.items;
begin
  perform pg_advisory_xact_lock(hashtext(owner_id::text));
  select * into result from public.items where id=item_id and user_id=owner_id;
  if found then return result; end if;
  if (select count(*) from public.items where user_id=owner_id) >= item_limit then raise exception 'POOF_INVENTORY_LIMIT'; end if;
  insert into public.items(id,user_id,original_path) values(item_id,owner_id,image_path) returning * into result;
  return result;
end $$;
revoke all on function public.create_inventory_item(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.create_inventory_item(uuid,uuid,text,integer) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('object-images','object-images',false,10485760,array['image/jpeg','image/png','image/webp']);
create policy images_read_own on storage.objects for select to authenticated
using (bucket_id='object-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
-- Upload URLs are issued by the server for one previously allocated item path.
