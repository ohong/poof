import { NextResponse } from "next/server";
import { z } from "zod";
import { session, checkOrigin, failure, HttpError, json } from "@/lib/http";
import { admin } from "@/lib/supabase/admin";
import { present } from "@/lib/items";
import { removeItem } from "@/lib/remove-item";
import type { InventoryItem } from "@/types";
type Params = { params: Promise<{ id: string }> };
const changes = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().max(1200).optional(),
    category: z
      .enum(["Home", "Clothing", "Electronics", "Books", "Kitchen", "Other"])
      .optional(),
    location: z.string().max(120).optional(),
    condition: z.string().max(600).optional(),
    notes: z.string().max(2000).optional(),
    disposition: z
      .enum(["active", "keep", "sell", "donate", "toss"])
      .optional(),
    listing_title: z.string().max(160).optional(),
    listing_body: z.string().max(4000).optional(),
    asking_price: z.number().min(0).max(1000000).nullable().optional(),
    currency: z.enum(["USD", "CAD", "GBP", "EUR", "AUD"]).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);
export async function PATCH(request: Request, { params }: Params) {
  try {
    checkOrigin(request);
    const { supabase, user } = await session();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success)
      throw new HttpError(404, "Object not found.");
    const parsed = changes.safeParse(await json(request));
    if (!parsed.success)
      throw new HttpError(400, "Check the details and try again.");
    const db = admin();
    const { data: existing, error: existingError } = await db
      .from("items")
      .select("id,currency,processing_state,deleting")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (existingError || !existing)
      throw new HttpError(404, "Object not found.");
    if (existing.deleting)
      throw new HttpError(
        409,
        "This object is being removed. Retry removal from its details.",
      );
    if (
      existing.processing_state === "processing" &&
      Object.keys(parsed.data).some((key) => key !== "disposition")
    )
      throw new HttpError(
        409,
        "Wait for processing to finish before editing details.",
      );
    const patch = {
      ...parsed.data,
      ...(Object.keys(parsed.data).some((key) => key !== "disposition")
        ? { details_edited: true }
        : {}),
      ...(parsed.data.currency && parsed.data.currency !== existing.currency
        ? {
            price_low: null,
            price_high: null,
            asking_price: parsed.data.asking_price ?? null,
            price_basis:
              "Currency changed. Enter an asking price in the selected currency.",
          }
        : {}),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await db
      .from("items")
      .update(patch)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) throw error;
    const [item] = await present(supabase, [data as InventoryItem]);
    const record = { ...item } as InventoryItem & { provider_job?: unknown };
    delete record.provider_job;
    return NextResponse.json(
      { item: record },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    checkOrigin(request);
    const { user } = await session();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success)
      throw new HttpError(404, "Object not found.");
    const body = await json(request);
    if (body?.confirmation !== id)
      throw new HttpError(400, "Confirm which object to remove.");
    await removeItem(id, user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return failure(error);
  }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { supabase, user } = await session();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success)
      throw new HttpError(404, "Object not found.");
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error || !data) throw new HttpError(404, "Object not found.");
    const [item] = await present(supabase, [data as InventoryItem]);
    const record = { ...item } as InventoryItem & { provider_job?: unknown };
    delete record.provider_job;
    return NextResponse.json(
      { item: record },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
