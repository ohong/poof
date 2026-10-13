import { NextResponse } from "next/server";
import { configured } from "@/lib/config";
export function GET() {
  const ready =
    configured() &&
    Boolean(
      process.env.SUPABASE_SECRET_KEY &&
      process.env.BFL_API_KEY &&
      process.env.ANTHROPIC_API_KEY,
    );
  return NextResponse.json(
    { status: ready ? "configured" : "setup_required" },
    { status: ready ? 200 : 503 },
  );
}
