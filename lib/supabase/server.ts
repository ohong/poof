import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server client using service role key (bypasses RLS)
// Use this in API routes where we verify user identity via Clerk
export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to construct storage URLs
export function getStorageUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/object-images/${path}`;
}
