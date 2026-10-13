import { admin } from "@/lib/supabase/admin";
import { BUCKET, MAX_FILE_BYTES } from "@/lib/config";
import { describe } from "@/lib/ai/describe";
import { submit, poll, type ImageJob } from "@/lib/ai/transform";
import sharp from "sharp";
async function owned(id: string, userId: string) {
  const db = admin();
  const { data, error } = await db
    .from("items")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .eq("deleting", false)
    .single();
  if (error || !data) throw new Error("Item unavailable");
  return { db, item: data };
}
async function original(id: string, userId: string) {
  const { db, item } = await owned(id, userId);
  const { data, error } = await db.storage
    .from(BUCKET)
    .download(item.original_path);
  if (error || !data || data.size > MAX_FILE_BYTES)
    throw new Error("Original image unavailable");
  const buffer = Buffer.from(await data.arrayBuffer());
  const metadata = await sharp(buffer, {
    limitInputPixels: 20000000,
  }).metadata();
  if (!["jpeg", "png", "webp"].includes(metadata.format ?? ""))
    throw new Error("Unsupported image");
  return {
    db,
    item,
    buffer: await sharp(buffer, { limitInputPixels: 20000000 })
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toBuffer(),
  };
}
export async function loadOriginal(id: string, userId: string) {
  "use step";
  console.log("poof.original.validate", id);
  await original(id, userId);
}
export async function analyze(id: string, userId: string) {
  "use step";
  console.log("poof.description.start", id);
  const { db, item, buffer } = await original(id, userId);
  if (item.details_edited) return null;
  try {
    const details = await describe(buffer, "image/jpeg", item.currency);
    const { error } = await db
      .from("items")
      .update({ ...details, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    return null;
  } catch (error) {
    console.warn(
      "poof.description.unavailable",
      id,
      error instanceof Error ? error.message : "Unknown error",
    );
    return "The description and sale estimate are unavailable. You can enter details yourself or retry.";
  }
}
// A paid submission must not be repeated automatically after an uncertain response.
analyze.maxRetries = 0;
export async function beginImage(id: string, userId: string) {
  "use step";
  console.log("poof.image.submit", id);
  const { db, item, buffer } = await original(id, userId);
  if (item.provider_job)
    return { job: item.provider_job as ImageJob, warning: null };
  try {
    const job = await submit(buffer);
    const { error } = await db
      .from("items")
      .update({ provider_job: job })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    return { job, warning: null };
  } catch (error) {
    console.warn(
      "poof.image.unavailable",
      id,
      error instanceof Error ? error.message : "Unknown error",
    );
    return {
      job: null,
      warning:
        "The clean image is unavailable. Your original is safe; you can retry.",
    };
  }
}
beginImage.maxRetries = 0;
export async function checkImage(job: ImageJob) {
  "use step";
  console.log("poof.image.poll", job.id);
  return poll(job);
}
export async function saveImage(id: string, userId: string, url: string) {
  "use step";
  console.log("poof.image.save", id);
  const { db } = await owned(id, userId);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    redirect: "error",
  });
  if (
    !response.ok ||
    Number(response.headers.get("content-length") ?? 0) > MAX_FILE_BYTES
  )
    throw new Error("Generated image download failed");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_FILE_BYTES)
    throw new Error("Generated image too large");
  const image = await sharp(bytes, { limitInputPixels: 20000000 })
    .jpeg({ quality: 92 })
    .toBuffer();
  await owned(id, userId);
  const path = `${userId}/${id}/catalog.jpg`;
  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, image, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  const result = await db
    .from("items")
    .update({ image_path: path, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .eq("deleting", false)
    .select("id")
    .maybeSingle();
  // Cancellation cannot abort an already running HTTP request. Remove a late
  // upload when removal wins the record update, so it cannot outlive its item.
  if (result.error || !result.data) {
    const cleanup = await db.storage.from(BUCKET).remove([path]);
    if (cleanup.error) throw cleanup.error;
    throw result.error || new Error("Item removed during image save");
  }
}
export async function finish(
  id: string,
  userId: string,
  warning: string | null,
) {
  "use step";
  console.log("poof.processing.complete", id);
  const { db } = await owned(id, userId);
  const { error } = await db
    .from("items")
    .update({
      processing_state: "ready",
      warning,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}
export async function fail(id: string, userId: string) {
  "use step";
  console.log("poof.processing.failed", id);
  const { db } = await owned(id, userId);
  const { error } = await db
    .from("items")
    .update({
      processing_state: "failed",
      warning: "Processing stopped. Your photo is safe. Please retry.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}
