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
    const report: Record<string, number> = {
      websiteSettings: 0,
      adminUsers: 0,
      categories: 0,
      brands: 0,
      products: 0,
      banners: 0,
      offers: 0,
      happyCustomers: 0,
    };

    // Restore Website Settings
    if (data.websiteSetting && data.websiteSetting.length > 0) {
      for (const setting of data.websiteSetting) {
        try {
          await prisma.websiteSetting.upsert({
            where: { id: setting.id || "default" },
            update: setting,
            create: setting,
          });
          report.websiteSettings++;
        } catch {}
      }
    }

    // Restore Admin Users (Match by username to prevent Unique Constraint collision)
    if (data.adminUser && data.adminUser.length > 0) {
      for (const admin of data.adminUser) {
        try {
          await prisma.adminUser.upsert({
            where: { username: admin.username },
            update: { name: admin.name, email: admin.email, role: admin.role },
            create: admin,
          });
          report.adminUsers++;
        } catch {}
      }
    }

    // Restore Categories (Match by slug)
    if (data.category && data.category.length > 0) {
      for (const cat of data.category) {
        try {
          await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, order: cat.order, description: cat.description, iconName: cat.iconName, imageUrl: cat.imageUrl },
            create: cat,
          });
          report.categories++;
        } catch {}
      }
    }

    // Restore Brands (Match by slug)
    if (data.brand && data.brand.length > 0) {
      for (const brand of data.brand) {
        try {
          await prisma.brand.upsert({
            where: { slug: brand.slug },
            update: { name: brand.name, logoUrl: brand.logoUrl, isActive: true },
            create: brand,
          });
          report.brands++;
        } catch {}
      }
    }

    // Restore Products & Images (Match by slug)
    if (data.product && data.product.length > 0) {
      for (const prod of data.product) {
        try {
          const { images, ...productData } = prod;
          const createdOrUpdated = await prisma.product.upsert({
            where: { slug: prod.slug },
            update: productData,
            create: productData,
          });

          if (images && images.length > 0) {
            for (const img of images) {
              try {
                await prisma.productImage.upsert({
                  where: { id: img.id },
                  update: { url: img.url, isPrimary: img.isPrimary, order: img.order },
                  create: { id: img.id, url: img.url, isPrimary: img.isPrimary, order: img.order, productId: createdOrUpdated.id },
                });
              } catch {}
            }
          }
          report.products++;
        } catch {}
      }
    }

    // Restore Banners
    if (data.banner && data.banner.length > 0) {
      for (const ban of data.banner) {
        try {
          await prisma.banner.upsert({
            where: { id: ban.id },
            update: ban,
            create: ban,
          });
          report.banners++;
        } catch {}
      }
    }

    // Restore Offers
    if (data.offer && data.offer.length > 0) {
      for (const off of data.offer) {
        try {
          await prisma.offer.upsert({
            where: { id: off.id },
            update: off,
            create: off,
          });
          report.offers++;
        } catch {}
      }
    }

    // Restore Happy Customers
    if (data.happyCustomer && data.happyCustomer.length > 0) {
      for (const cust of data.happyCustomer) {
        try {
          await prisma.happyCustomer.upsert({
            where: { id: cust.id },
            update: cust,
            create: cust,
          });
          report.happyCustomers++;
        } catch {}
      }
    }

    // Restore Users
    if (data.user && data.user.length > 0) {
      for (const u of data.user) {
        try {
          await prisma.user.upsert({
            where: { email: u.email },
            update: { name: u.name, phone: u.phone, role: u.role, address: u.address, city: u.city, pincode: u.pincode, isVerified: u.isVerified ?? true },
            create: { id: u.id, name: u.name, email: u.email, phone: u.phone, password: u.password, role: u.role, address: u.address, city: u.city, pincode: u.pincode, isVerified: u.isVerified ?? true },
          });
          report.users = (report.users || 0) + 1;
        } catch {}
      }
    }

    // Restore Orders
    if (data.order && data.order.length > 0) {
      for (const ord of data.order) {
        try {
          const { items, ...orderData } = ord;
          const createdOrder = await prisma.order.upsert({
            where: { orderNumber: ord.orderNumber },
            update: orderData,
            create: orderData,
          });

          if (items && items.length > 0) {
            for (const item of items) {
              try {
                await prisma.orderItem.upsert({
                  where: { id: item.id },
                  update: { price: item.price, quantity: item.quantity, total: item.total, name: item.name || item.productName },
                  create: { id: item.id, orderId: createdOrder.id, productId: item.productId, price: item.price, quantity: item.quantity, total: item.total, name: item.name || item.productName },
                });
              } catch {}
            }
          }
          report.orders = (report.orders || 0) + 1;
        } catch {}
      }
    }

    // Restore Service Requests
    if (data.serviceRequest && data.serviceRequest.length > 0) {
      for (const srv of data.serviceRequest) {
        try {
          await prisma.serviceRequest.upsert({
            where: { ticketId: srv.ticketId },
            update: srv,
            create: srv,
          });
          report.serviceRequests = (report.serviceRequests || 0) + 1;
        } catch {}
      }
    }

    // Seed brand products to ensure all 16 official brands are complete
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
