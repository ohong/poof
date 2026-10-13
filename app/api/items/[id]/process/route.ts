import { NextResponse } from "next/server";
import { z } from "zod";
import { start } from "workflow/api";
import { processItem } from "@/workflows/process-item";
import { admin } from "@/lib/supabase/admin";
import { session, checkOrigin, failure, HttpError } from "@/lib/http";
import { BUCKET, limit } from "@/lib/config";
type Params = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: Params) {
  try {
    checkOrigin(request);
    const { user } = await session();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success)
      throw new HttpError(404, "Object not found.");
    const db = admin();
    const { data: item, error } = await db
      .from("items")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error || !item) throw new HttpError(404, "Object not found.");
    if (item.deleting)
      throw new HttpError(
        409,
        "This object is being removed. Retry removal from its details.",
      );
    if (item.processing_state === "processing")
      return NextResponse.json({ accepted: true });
    if (item.processing_state === "ready" && !item.warning)
      return NextResponse.json({ accepted: true });
    if (item.attempts >= 3)
      throw new HttpError(
        429,
        "This object has reached its retry limit. Your photo is safe; you can edit the details yourself.",
      );
    const { data: files, error: storageError } = await db.storage
      .from(BUCKET)
      .list(`${user.id}/${id}`, { limit: 10 });
    if (
      storageError ||
      !files?.some((file) => item.original_path.endsWith("/" + file.name))
    )
      throw new HttpError(
        400,
        "The photo has not finished uploading. Please try again.",
      );
    if (item.processing_state === "ready") {
      const result = await db
        .from("items")
        .update({ processing_state: "failed", provider_job: null })
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("processing_state", "ready");
      if (result.error) throw result.error;
    }
    const { data: claimed, error: claimError } = await db.rpc(
      "claim_processing",
      {
        item_id: id,
        owner_id: user.id,
        user_limit: limit("DAILY_USER_AI_LIMIT", 50),
        global_limit: limit("DAILY_GLOBAL_AI_LIMIT", 200),
      },
    );
    if (claimError) {
      if (claimError.message.includes("POOF_ACCOUNT_REMOVAL"))
        throw new HttpError(
          409,
          "Account removal is in progress. Open Account settings to retry.",
        );
      if (claimError.message.includes("POOF_DAILY_LIMIT"))
        throw new HttpError(
          429,
          "Today’s free processing limit has been reached. Your photo is saved. Try again tomorrow.",
        );
      throw claimError;
    }
    if (!claimed) return NextResponse.json({ accepted: true });
    try {
      const run = await start(processItem, [id, user.id]);
      const result = await db
        .from("items")
        .update({ workflow_run_id: run.runId })
        .eq("id", id)
        .eq("user_id", user.id);
      if (result.error) throw result.error;
      return NextResponse.json({ accepted: true }, { status: 202 });
    } catch (error) {
      await db
        .from("items")
        .update({
          processing_state: "failed",
          warning:
            "Processing could not start. Your photo is safe. Please retry.",
        })
        .eq("id", id)
        .eq("user_id", user.id);
      throw error;
    }
  } catch (error) {
    return failure(error);
  }
}
