-- Poof! Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- =============================================================================
-- OBJECTS TABLE
-- =============================================================================

create table if not exists objects (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  original_image_url text not null,
  transformed_image_url text,
  description text,
  status text default 'active' check (status in ('active', 'sold', 'donated', 'tossed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_objects_user_id on objects(user_id);
create index if not exists idx_objects_status on objects(status);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Note: Since we use Clerk for auth (not Supabase Auth), RLS policies
-- won't work with auth.uid(). The API routes validate user ownership
-- using Clerk's userId. If you want RLS, you'd need to pass the Clerk
-- userId as a custom claim or use service role key (which bypasses RLS).

-- For reference, here's what RLS would look like with Supabase Auth:
-- alter table objects enable row level security;
--
-- create policy "Users can view own objects"
--   on objects for select
--   using (auth.uid()::text = user_id);
--
-- create policy "Users can insert own objects"
--   on objects for insert
--   with check (auth.uid()::text = user_id);
--
-- create policy "Users can update own objects"
--   on objects for update
--   using (auth.uid()::text = user_id);

-- =============================================================================
-- STORAGE BUCKET
-- =============================================================================
-- Create via Supabase Dashboard > Storage:
-- 1. Create bucket named: object-images
-- 2. Set to Public (for read access to images)
-- 3. Structure:
--    - originals/{user_id}/{uuid}.{ext}  (uploaded photos)
--    - transformed/{uuid}.jpg            (FLUX-processed images)

-- =============================================================================
-- TRIGGER: Auto-update updated_at
-- =============================================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger objects_updated_at
  before update on objects
  for each row
  execute function update_updated_at_column();
