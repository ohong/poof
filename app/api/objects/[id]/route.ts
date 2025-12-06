import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { ObjectRow, ObjectStatus } from "@/types";

const VALID_STATUSES: ObjectStatus[] = ["sold", "donated", "tossed"];

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // First, check if object exists and belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from("objects")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }

    if (existing.user_id !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Update the object
    const { data, error: updateError } = await supabase
      .from("objects")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[API] /api/objects/[id] update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update object" },
        { status: 500 }
      );
    }

    return NextResponse.json({ object: transformRow(data as ObjectRow) });
  } catch (error) {
    console.error("[API] /api/objects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update object" },
      { status: 500 }
    );
  }
}
