import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InventoryItem } from "@/types";
import { BUCKET } from "@/lib/config";
export async function present<
  T extends Pick<InventoryItem, "original_path" | "image_path">,
>(supabase: SupabaseClient, rows: T[]) {
  const paths = [
    ...new Set(
      rows.flatMap((row) =>
        [row.original_path, row.image_path].filter((path): path is string =>
          Boolean(path),
        ),
      ),
    ),
  ];
  if (!paths.length) return [];
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, 3600);
  if (error) throw error;
  const urls = new Map(data.map((value) => [value.path, value.signedUrl]));
  return rows.map((row) => ({
    ...row,
    original_url: urls.get(row.original_path) ?? "",
    image_url: urls.get(row.image_path ?? row.original_path) ?? "",
  }));
}
