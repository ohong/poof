import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { configured } from "@/lib/config";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function session(allowDeleting = false) {
  if (!configured())
    throw new HttpError(
      503,
      "Poof is not configured yet. Please try again later.",
    );
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new HttpError(401, "Please sign in to continue.");
  if (!allowDeleting && user.app_metadata.poof_deleting)
    throw new HttpError(
      409,
      "Account removal is in progress. Open Account settings to retry.",
    );
  return { supabase, user };
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    throw new HttpError(403, "This request is not allowed.");
}
export function failure(error: unknown) {
  if (error instanceof HttpError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  const detail =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "Unknown error";
  console.error("poof.request.failed", detail);
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
export async function json(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 32768)
    throw new HttpError(413, "Request too large.");
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Invalid request.");
  }
}
