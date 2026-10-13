import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getRun } from "workflow/api";
import { admin } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/config";
import { failure } from "@/lib/http";
export const maxDuration = 300;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Maintenance is not configured." },
      { status: 503 },
    );
  const authorization = request.headers.get("authorization") || "";
  const actual = Buffer.from(authorization);
  const expected = Buffer.from(`Bearer ${secret}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = admin();
    let removed = 0;
    // Remove expired, unreferenced upload paths through the Storage API, never SQL.
    for (let batch = 0; batch < 10; batch++) {
      const { data, error } = await db.rpc("orphan_media_candidates");
      if (error) throw error;
      if (!data.length) break;
      const result = await db.storage
        .from(BUCKET)
        .remove(data.map((item: { path: string }) => item.path));
      if (result.error) throw result.error;
      removed += data.length;
    }
    const { data: stale, error } = await db
      .from("items")
      .select("id,workflow_run_id")
      .eq("processing_state", "processing")
      .eq("deleting", false)
      .lt("updated_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .limit(50);
    if (error) throw error;
    let recovered = 0;
    for (const item of stale) {
      // A crash between claiming and recording the run leaves no run ID. Wait
      // well beyond the bounded photo job before exposing a manual retry.
      const status = item.workflow_run_id
        ? await getRun(item.workflow_run_id).status
        : "failed";
      if (["failed", "cancelled", "completed"].includes(status)) {
        const result = await db
          .from("items")
          .update({
            processing_state: "failed",
            warning: "Processing stopped. Your photo is safe; you can retry.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id)
          .eq("processing_state", "processing");
        if (result.error) throw result.error;
        recovered++;
      }
    }
    console.log("poof.maintenance.complete", { removed, recovered });
    return NextResponse.json(
      { removed, recovered },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
