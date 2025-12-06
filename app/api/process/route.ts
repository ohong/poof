import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { transformImage } from "@/lib/flux";
import { generateDescription } from "@/lib/claude";
import { ObjectRow, UploadRecord } from "@/types";

interface ProcessRequest {
  uploads: UploadRecord[];
}

interface ProcessError {
  uploadId: string;
  reason: string;
}

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ProcessRequest = await request.json();
    const { uploads } = body;

    if (!uploads || !Array.isArray(uploads) || uploads.length === 0) {
      return NextResponse.json(
        { error: "No uploads provided", objects: [] },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const objects: ReturnType<typeof transformRow>[] = [];
    const errors: ProcessError[] = [];

    // Process each upload in parallel
    const results = await Promise.all(
      uploads.map(async (upload) => {
        const [transformedResult, descriptionResult] = await Promise.allSettled([
          transformImage(upload.originalUrl),
          generateDescription(upload.originalUrl),
        ]);

        return {
          uploadId: upload.id,
          originalUrl: upload.originalUrl,
          transformedUrl:
            transformedResult.status === "fulfilled"
              ? transformedResult.value
              : null,
          description:
            descriptionResult.status === "fulfilled"
              ? descriptionResult.value
              : "Untitled Object: An object awaiting description.",
        };
      })
    );

    // Insert each result into the database
    for (const result of results) {
      const { data, error: insertError } = await supabase
        .from("objects")
        .insert({
          user_id: userId,
          original_image_url: result.originalUrl,
          transformed_image_url: result.transformedUrl,
          description: result.description,
          status: "active",
        })
        .select()
        .single();

      if (insertError) {
        console.error("[API] /api/process insert error:", insertError);
        errors.push({
          uploadId: result.uploadId,
          reason: "Failed to save object to database",
        });
        continue;
      }

      objects.push(transformRow(data as ObjectRow));
    }

    return NextResponse.json({
      objects,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[API] /api/process error:", error);
    return NextResponse.json(
      { error: "Failed to process uploads" },
      { status: 500 }
    );
  }
}
