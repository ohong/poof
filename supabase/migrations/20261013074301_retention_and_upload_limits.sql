update storage.buckets set file_size_limit=2097152 where id='object-images';
create or replace function public.create_inventory_item(item_id uuid, owner_id uuid, image_path text, item_limit integer)
returns public.items language plpgsql security invoker set search_path = '' as $$
declare result public.items; user_used integer; global_used integer;
begin
  perform pg_advisory_xact_lock(hashtext('poof-account:' || owner_id::text));
  if exists(select 1 from public.account_removals where user_id=owner_id) then raise exception 'POOF_ACCOUNT_REMOVAL'; end if;
  perform pg_advisory_xact_lock(hashtext('poof_inventory_uploads'));
  select * into result from public.items where id=item_id and user_id=owner_id;
  if found then return result; end if;
  if (select count(*) from public.items where user_id=owner_id) >= least(item_limit,1000) then raise exception 'POOF_INVENTORY_LIMIT'; end if;
  if (select count(*) from public.items) >= 10000 then raise exception 'POOF_CAPACITY_LIMIT'; end if;
  insert into public.ai_daily_usage(day,scope) values(current_date,'upload:' || owner_id::text),(current_date,'upload:global') on conflict do nothing;
  select used into user_used from public.ai_daily_usage where day=current_date and scope='upload:' || owner_id::text;
  select used into global_used from public.ai_daily_usage where day=current_date and scope='upload:global';
  if user_used>=50 or global_used>=200 then raise exception 'POOF_UPLOAD_LIMIT'; end if;
  update public.ai_daily_usage set used=used+1 where day=current_date and scope in('upload:' || owner_id::text,'upload:global');
  insert into public.items(id,user_id,original_path) values(item_id,owner_id,image_path) returning * into result;
  return result;
end $$;

create function public.begin_account_removal(owner_id uuid) returns void
language plpgsql security invoker set search_path='' as $$
begin
  perform pg_advisory_xact_lock(hashtext('poof-account:' || owner_id::text));
  insert into public.account_removals(user_id) values(owner_id) on conflict do nothing;
end $$;
revoke all on function public.begin_account_removal(uuid) from public,anon,authenticated;
grant execute on function public.begin_account_removal(uuid) to service_role;
