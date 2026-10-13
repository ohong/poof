import { session, failure, HttpError } from "@/lib/http";
import { BUCKET } from "@/lib/config";
import { z } from "zod";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase, user } = await session();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success)
      throw new HttpError(404, "Photo not found.");
    const { data: item, error } = await supabase
      .from("items")
      .select("original_path,image_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (error || !item) throw new HttpError(404, "Photo not found.");
    const path =
      new URL(request.url).searchParams.get("original") === "1"
        ? item.original_path
        : item.image_path || item.original_path;
    const { data, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(path);
    if (downloadError || !data)
      throw new HttpError(404, "Photo unavailable. Please try again.");
    const extension = path.split(".").at(-1);
    return new Response(data, {
      headers: {
        "Content-Type": data.type,
        "Content-Disposition": `attachment; filename="poof-${id}.${extension}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return failure(error);
  }
}
