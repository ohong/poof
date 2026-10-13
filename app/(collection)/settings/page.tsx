import { createClient } from "@/lib/supabase/server";
import { Settings } from "@/components/settings";
export default async function Page() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  return <Settings email={user?.email ?? ""} />;
}
