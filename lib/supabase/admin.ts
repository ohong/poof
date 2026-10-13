import "server-only";
import { createClient } from "@supabase/supabase-js";
import { required } from "@/lib/config";
export function admin() {
  return createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SECRET_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
