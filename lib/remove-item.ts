import "server-only";
import { stopProcessing } from "@/lib/stop-processing";
import { admin } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/config";
import { HttpError } from "@/lib/http";
export async function removeItem(id: string, userId: string) {
  const db = admin();
  const { data: item, error } = await db
    .from("items")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error || !item) throw new HttpError(404, "Object not found.");
  const marked = await db
    .from("items")
    .update({
      deleting: true,
      warning: "Removal is in progress. Retry removal if it does not complete.",
    })
    .eq("id", id)
    .eq("user_id", userId);
  if (marked.error) throw marked.error;
  if (item.workflow_run_id && item.processing_state === "processing") {
    await stopProcessing(item.workflow_run_id);
  }
  const paths = [
    ...new Set(
      [
        item.original_path,
        item.image_path,
        `${userId}/${id}/catalog.jpg`,
      ].filter(Boolean),
    ),
  ] as string[];
  const removed = await db.storage.from(BUCKET).remove(paths);
  if (removed.error) throw removed.error;
  const result = await db
    .from("items")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (result.error) throw result.error;
}
