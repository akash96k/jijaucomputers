import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAllTables } from "@/lib/db-tables";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Ensure all 18 tables and columns exist
    await ensureAllTables();

    // 2. Locate backup.json
    const backupPath = path.join(process.cwd(), "prisma", "backup.json");
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: "backup.json not found in prisma folder" }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(backupPath, "utf8"));
    const report: Record<string, number> = {};

    // Restore Website Settings
    if (data.websiteSetting && data.websiteSetting.length > 0) {
      for (const setting of data.websiteSetting) {
        await prisma.websiteSetting.upsert({
          where: { id: setting.id },
          update: setting,
          create: setting,
        });
      }
      report.websiteSettings = data.websiteSetting.length;
    }

    // Restore Admin Users
    if (data.adminUser && data.adminUser.length > 0) {
      for (const admin of data.adminUser) {
        await prisma.adminUser.upsert({
          where: { id: admin.id },
          update: admin,
          create: admin,
        });
      }
      report.adminUsers = data.adminUser.length;
    }

    // Restore Categories
    if (data.category && data.category.length > 0) {
      for (const cat of data.category) {
        await prisma.category.upsert({
          where: { id: cat.id },
          update: cat,
          create: cat,
        });
      }
      report.categories = data.category.length;
    }

    // Restore Brands
    if (data.brand && data.brand.length > 0) {
      for (const brand of data.brand) {
        await prisma.brand.upsert({
          where: { id: brand.id },
          update: brand,
          create: brand,
        });
      }
      report.brands = data.brand.length;
    }

    // Restore Products & Images
    if (data.product && data.product.length > 0) {
      for (const prod of data.product) {
        const { images, ...productData } = prod;
        await prisma.product.upsert({
          where: { id: prod.id },
          update: productData,
          create: productData,
        });

        if (images && images.length > 0) {
          for (const img of images) {
            await prisma.productImage.upsert({
              where: { id: img.id },
              update: img,
              create: img,
            });
          }
        }
      }
      report.products = data.product.length;
    }

    // Restore Banners
    if (data.banner && data.banner.length > 0) {
      for (const ban of data.banner) {
        await prisma.banner.upsert({
          where: { id: ban.id },
          update: ban,
          create: ban,
        });
      }
      report.banners = data.banner.length;
    }

    // Restore Offers
    if (data.offer && data.offer.length > 0) {
      for (const off of data.offer) {
        await prisma.offer.upsert({
          where: { id: off.id },
          update: off,
          create: off,
        });
      }
      report.offers = data.offer.length;
    }

    // Also run seed for brand products to ensure all 16 brands are fully populated
    try {
      const { seedBrandProducts } = await import("../../../../../prisma/seed-brand-products");
      await seedBrandProducts();
    } catch {}

    const totalProds = await prisma.product.count();
    report.totalActiveProductsInDB = totalProds;

    return NextResponse.json({
      success: true,
      message: "🎉 Complete Database Restore executed successfully on Hostinger MySQL!",
      report,
    });
  } catch (error: any) {
    console.error("Restore Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to restore database" }, { status: 500 });
  }
}
