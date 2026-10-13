create function public.orphan_media_candidates() returns table(path text)
language sql stable security invoker set search_path='' as $$
  select o.name from storage.objects o
  where o.bucket_id='object-images' and o.created_at < now()-interval '3 hours'
  and o.name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/(original[.](jpg|png|webp)|catalog[.]jpg)$'
  and not exists (select 1 from public.items i where i.original_path=o.name or i.image_path=o.name or o.name=i.user_id::text || '/' || i.id::text || '/catalog.jpg')
  order by o.created_at limit 100;
$$;
revoke all on function public.orphan_media_candidates() from public,anon,authenticated;
grant execute on function public.orphan_media_candidates() to service_role;
