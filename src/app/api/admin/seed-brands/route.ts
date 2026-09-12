import { NextResponse } from "next/server";
import { seedBrandProducts } from "../../../../../prisma/seed-brand-products";
import { ensureAllTables } from "@/lib/db-tables";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Ensure all 18 tables and columns exist
    await ensureAllTables();

    // 2. Seed all 16 official brand products
    const result = await seedBrandProducts();

    return NextResponse.json({
      success: true,
      message: `Successfully populated official products for all 16 brands into the database!`,
      productsSeeded: result.count,
      brands: [
        "AMD",
        "Apple",
        "ASUS",
        "Corsair",
        "CP PLUS",
        "Dell",
        "Epson",
        "Google",
        "HP",
        "Intel",
        "Lenovo",
        "Logitech",
        "MSI",
        "NVIDIA",
        "OnePlus",
        "Samsung",
      ],
    });
  } catch (error: any) {
    console.error("Seed brands error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to seed brand products" },
      { status: 500 }
    );
  }
}
