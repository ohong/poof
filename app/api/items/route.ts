import { NextResponse } from "next/server";
import { z } from "zod";
import { session, checkOrigin, failure, HttpError, json } from "@/lib/http";
import { admin } from "@/lib/supabase/admin";
import { present } from "@/lib/items";
import { BUCKET, limit } from "@/lib/config";
import type { GridItem } from "@/types";
const upload = z.object({
  id: z.string().uuid(),
  type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z
    .number()
    .int()
    .min(1)
    .max(2 * 1024 * 1024),
  currency: z.enum(["USD", "CAD", "GBP", "EUR", "AUD"]).default("USD"),
});
export async function GET(request: Request) {
  try {
    const { supabase, user } = await session();
    const url = new URL(request.url);
    const archive = url.searchParams.get("archive") === "1";
    const offset = Math.floor(
      Math.max(0, Math.min(1000, Number(url.searchParams.get("offset")) || 0)),
    );
    let query = supabase
      .from("items")
      .select(
        "id,name,category,location,disposition,processing_state,warning,attempts,deleting,original_path,image_path,created_at,updated_at",
        { count: "exact" },
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    query = archive
      ? query.in("disposition", ["sell", "donate", "toss"])
      : query.in("disposition", ["active", "keep"]);
    const search = (url.searchParams.get("search") ?? "")
      .slice(0, 120)
      .replace(/[,_%()."\\]/g, " ")
      .trim();
    if (search)
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`,
      );
    const category = url.searchParams.get("category");
    if (
      category &&
      ["Home", "Clothing", "Electronics", "Books", "Kitchen", "Other"].includes(
        category,
      )
    )
      query = query.eq("category", category);
    const disposition = url.searchParams.get("disposition");
    if (
      disposition &&
      ["active", "keep", "sell", "donate", "toss"].includes(disposition)
    )
      query = query.eq("disposition", disposition);
    const { data, error, count } = await query.range(
      0,
      Math.min(offset + 99, 999),
    );
    if (error) throw error;
    const { data: summary, error: summaryError } = await supabase
      .from("items")
      .select("id,disposition,processing_state")
      .eq("user_id", user.id);
    if (summaryError) throw summaryError;
    const items = await present(supabase, data as GridItem[]);
    // Keep list payloads bounded even when individual notes and sale drafts are long.
    return NextResponse.json(
      { items, total: count ?? 0, summary },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { user } = await session();
    const parsed = upload.safeParse(await json(request));
    if (!parsed.success)
      throw new HttpError(
        400,
        "The prepared photo must be JPEG, PNG, or WebP under 2 MB. Try a smaller copy.",
      );
    const { id, type, currency } = parsed.data;
    const extension =
      type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    const path = `${user.id}/${id}/original.${extension}`;
    const db = admin();
    const { data: item, error } = await db.rpc("create_inventory_item", {
      item_id: id,
      owner_id: user.id,
      image_path: path,
      item_limit: limit("MAX_INVENTORY_ITEMS", 1000),
    });
    if (error) {
      if (error.message.includes("POOF_ACCOUNT_REMOVAL"))
        throw new HttpError(
          409,
          "Account removal is in progress. Open Account settings to retry.",
        );
      if (error.message.includes("POOF_UPLOAD_LIMIT"))
        throw new HttpError(
          429,
          "Today’s free upload limit has been reached. Please try again tomorrow.",
        );
      if (error.message.includes("POOF_CAPACITY_LIMIT"))
        throw new HttpError(
          429,
          "Poof is at capacity for new photos. Your collection is safe; please try again later.",
        );
      if (error.message.includes("POOF_INVENTORY_LIMIT"))
        throw new HttpError(
          429,
          "Your inventory is full. Export or remove an item before adding another.",
        );
      throw error;
    }
    if (item.processing_state !== "uploaded")
      return NextResponse.json({ id, alreadySaved: true });
    const updated = await db
      .from("items")
      .update({ currency })
      .eq("id", id)
      .eq("user_id", user.id);
    if (updated.error) throw updated.error;
    const { data, error: storageError } = await db.storage
      .from(BUCKET)
      .createSignedUploadUrl(item.original_path);
    if (storageError) throw storageError;
    return NextResponse.json(
      { id, path: item.original_path, token: data.token },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
