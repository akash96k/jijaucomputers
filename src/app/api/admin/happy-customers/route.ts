import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureHappyCustomerTable } from "@/lib/db-tables";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { city: { contains: q } },
        { village: { contains: q } },
        { district: { contains: q } },
        { productName: { contains: q } },
      ];
    }

    try {
      const customers = await prisma.happyCustomer.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
      });
      return NextResponse.json({ success: true, customers }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    } catch (dbErr: any) {
      if (dbErr?.message?.includes("does not exist") || dbErr?.code === "P2021") {
        await ensureHappyCustomerTable();
        const customers = await prisma.happyCustomer.findMany({
          where,
          orderBy: [{ createdAt: "desc" }],
        });
        return NextResponse.json({ success: true, customers }, { headers: { "Cache-Control": "no-store, max-age=0" } });
      }
      throw dbErr;
    }
  } catch (error) {
    console.error("Admin fetch happy customers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      city,
      village,
      district,
      phone,
      productName,
      photoUrl,
      review,
      rating,
      purchaseDate,
      isFeatured,
      isActive,
      order,
    } = body;

    if (!name || !city || !productName || !photoUrl) {
      return NextResponse.json(
        { error: "Customer name, city, product name, and photo are required." },
        { status: 400 }
      );
    }

    const data = {
      name: name.trim(),
      city: city.trim(),
      village: village ? village.trim() : null,
      district: district ? district.trim() : "Jalna",
      phone: phone ? phone.trim() : null,
      productName: productName.trim(),
      photoUrl: photoUrl.trim(),
      review: review ? review.trim() : null,
      rating: typeof rating === "number" ? rating : 5,
      purchaseDate: purchaseDate ? purchaseDate.trim() : new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      isFeatured: isFeatured ?? true,
      isActive: isActive ?? true,
      order: typeof order === "number" ? order : 0,
    };

    try {
      const customer = await prisma.happyCustomer.create({ data });
      return NextResponse.json({ success: true, customer }, { status: 201 });
    } catch (dbErr: any) {
      if (dbErr?.message?.includes("does not exist") || dbErr?.code === "P2021") {
        await ensureHappyCustomerTable();
        const customer = await prisma.happyCustomer.create({ data });
        return NextResponse.json({ success: true, customer }, { status: 201 });
      }
      throw dbErr;
    }
  } catch (error: any) {
    console.error("Admin create happy customer error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
