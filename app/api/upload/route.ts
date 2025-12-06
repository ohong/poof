import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getStorageUrl } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];
const HEIC_EXTENSIONS = [".heic", ".heif"];
const MAX_FILES = 10;

interface UploadResult {
  id: string;
  originalUrl: string;
}

// POST /api/upload - Upload images to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const uploads: UploadResult[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Validate file type - also check extension for HEIC (browsers often misreport MIME type)
      const isHeicByExtension = HEIC_EXTENSIONS.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
      const isValidType = ALLOWED_TYPES.includes(file.type) || isHeicByExtension;

      if (!isValidType) {
        errors.push(
          `${file.name}: Invalid file type. Only JPEG, PNG, and HEIC allowed.`
        );
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large. Maximum size is 15MB.`);
        continue;
      }

      try {
        // Generate unique file path
        const fileId = crypto.randomUUID();
        // Determine extension from MIME type or filename
        let ext = "jpg";
        if (file.type === "image/png") {
          ext = "png";
        } else if (
          file.type === "image/heic" ||
          file.type === "image/heif" ||
          file.name.toLowerCase().endsWith(".heic")
        ) {
          ext = "heic";
        } else if (file.name.toLowerCase().endsWith(".heif")) {
          ext = "heif";
        }
        const filePath = `originals/${userId}/${fileId}.${ext}`;

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer();

        // Determine content type (browsers may misreport HEIC)
        let contentType = file.type;
        if (!contentType || contentType === "application/octet-stream") {
          if (ext === "heic") contentType = "image/heic";
          else if (ext === "heif") contentType = "image/heif";
          else if (ext === "png") contentType = "image/png";
          else contentType = "image/jpeg";
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("object-images")
          .upload(filePath, arrayBuffer, {
            contentType,
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          errors.push(`${file.name}: Upload failed`);
          continue;
        }

        uploads.push({
          id: fileId,
          originalUrl: getStorageUrl(filePath),
        });
      } catch (error) {
        console.error("File processing error:", error);
        errors.push(`${file.name}: Processing failed`);
      }
    }

    if (uploads.length === 0) {
      return NextResponse.json(
        { error: "All uploads failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      uploads,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
