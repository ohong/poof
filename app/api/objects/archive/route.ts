import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { ObjectRow } from "@/types";

function transformRow(row: ObjectRow) {
  return {
    id: row.id,
    originalImageUrl: row.original_image_url,
    transformedImageUrl: row.transformed_image_url,
    description: row.description || "Untitled Object",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("objects")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "active")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[API] /api/objects/archive error:", error);
      return NextResponse.json(
        { error: "Failed to fetch archived objects" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      objects: (data as ObjectRow[]).map(transformRow),
    });
  } catch (error) {
    console.error("[API] /api/objects/archive error:", error);
    return NextResponse.json(
      { error: "Failed to fetch archived objects" },
      { status: 500 }
    );
  }
}
