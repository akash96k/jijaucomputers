import { NextResponse } from "next/server";
import { ensureAllTables } from "@/lib/db-tables";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureAllTables();
    return NextResponse.json({
      success: true,
      message: "Database tables verified and synchronized successfully.",
    });
  } catch (error: any) {
    console.error("DB sync error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to sync database tables." },
      { status: 500 }
    );
  }
}
