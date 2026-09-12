import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureHappyCustomerTable } from "@/lib/db-tables";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district");
    const city = searchParams.get("city");
    const search = searchParams.get("search");

    const where: any = { isActive: true };

    if (district && district !== "All") {
      where.district = { contains: district };
    }

    if (city && city !== "All") {
      where.city = { contains: city };
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { city: { contains: q } },
        { village: { contains: q } },
        { district: { contains: q } },
        { productName: { contains: q } },
        { review: { contains: q } },
      ];
    }

    try {
      const customers = await prisma.happyCustomer.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      });

      const allActive = await prisma.happyCustomer.findMany({
        where: { isActive: true },
        select: { district: true, city: true, village: true },
      });

      const districts = Array.from(new Set(allActive.map((c) => c.district).filter(Boolean)));
      const cities = Array.from(new Set(allActive.map((c) => c.city).filter(Boolean)));

      return NextResponse.json(
        {
          success: true,
          customers,
          filters: { districts, cities },
        },
        {
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    } catch (dbErr: any) {
      if (dbErr?.message?.includes("does not exist") || dbErr?.code === "P2021") {
        await ensureHappyCustomerTable();
        return NextResponse.json(
          {
            success: true,
            customers: [],
            filters: { districts: [], cities: [] },
          },
          {
            headers: { "Cache-Control": "no-store, max-age=0" },
          }
        );
      }
      throw dbErr;
    }
  } catch (error) {
    console.error("Fetch happy customers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch happy customer stories" },
      { status: 500 }
    );
  }
}
