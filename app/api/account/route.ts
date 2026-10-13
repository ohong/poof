import { NextResponse } from "next/server";
import { stopProcessing } from "@/lib/stop-processing";
import { session, checkOrigin, failure, HttpError, json } from "@/lib/http";
import { admin } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/config";
export const maxDuration = 300;
export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    const { user } = await session(true);
    const body = await json(request);
    if (body?.confirmation !== "DELETE")
      throw new HttpError(400, "Type DELETE to confirm account removal.");
    const db = admin();
    const barrier = await db.rpc("begin_account_removal", {
      owner_id: user.id,
    });
    if (barrier.error) throw barrier.error;
    const locked = await db.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, poof_deleting: true },
    });
    if (locked.error) throw locked.error;
    const marked = await db
      .from("items")
      .update({ deleting: true })
      .eq("user_id", user.id);
    if (marked.error) throw marked.error;
    const { data: items, error } = await db
      .from("items")
      .select("id,original_path,image_path,workflow_run_id,processing_state")
      .eq("user_id", user.id);
    if (error) throw error;
    const active = items.filter(
      (item) => item.processing_state === "processing" && item.workflow_run_id,
    );
    for (let offset = 0; offset < active.length; offset += 5) {
      await Promise.all(
        active
          .slice(offset, offset + 5)
          .map((item) => stopProcessing(item.workflow_run_id)),
      );
    }
    // The account barrier prevents new allocations. Delete media in bounded batches,
    // then cascade records only after storage confirms removal.
    const paths = [
      ...new Set(
        items.flatMap((item) =>
          [
            item.original_path,
            item.image_path,
            `${user.id}/${item.id}/catalog.jpg`,
          ].filter((path): path is string => Boolean(path)),
        ),
      ),
    ];
    for (let offset = 0; offset < paths.length; offset += 100) {
      const removed = await db.storage
        .from(BUCKET)
        .remove(paths.slice(offset, offset + 100));
      if (removed.error) throw removed.error;
    }
    const counters = await db
      .from("ai_daily_usage")
      .delete()
      .in("scope", [user.id, `upload:${user.id}`]);
    if (counters.error) throw counters.error;
    const deleted = await db.auth.admin.deleteUser(user.id);
    if (deleted.error) throw deleted.error;
    return NextResponse.json(
      { deleted: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
