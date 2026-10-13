import { NextResponse } from "next/server";
import { session, failure } from "@/lib/http";
export async function GET() {
  try {
    const { supabase, user } = await session();
    const { data, error } = await supabase
      .from("items")
      .select(
        "id,name,description,category,location,condition,notes,disposition,listing_title,listing_body,price_low,price_high,asking_price,price_basis,currency,created_at,updated_at",
      )
      .eq("user_id", user.id)
      .order("created_at");
    if (error) throw error;
    return new NextResponse(
      JSON.stringify(
        {
          format: "poof-inventory-v1",
          exported_at: new Date().toISOString(),
          items: data,
        },
        null,
        2,
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="poof-inventory.json"',
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    return failure(error);
  }
}
