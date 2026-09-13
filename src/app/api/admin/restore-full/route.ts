import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAllTables } from "@/lib/db-tables";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Ensure all tables exist in Hostinger MySQL
    await ensureAllTables();

    // 2. Locate backup.json containing authentic Jijau Computers data
    const backupPath = path.join(process.cwd(), "prisma", "backup.json");
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: "backup.json not found in prisma folder" }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(backupPath, "utf8"));
    const report: Record<string, any> = {
      websiteSettings: 0,
      adminUsers: 0,
      categories: 0,
      brands: 0,
      products: 0,
      productImages: 0,
      banners: 0,
      offers: 0,
      happyCustomers: 0,
      users: 0,
      orders: 0,
      orderItems: 0,
      serviceRequests: 0,
      errors: [] as string[],
    };

    // 3. Restore Website Settings
    if (data.websiteSetting && data.websiteSetting.length > 0) {
      for (const setting of data.websiteSetting) {
        try {
          const id = setting.id || "default";
          await prisma.websiteSetting.upsert({
            where: { id },
            update: setting,
            create: { ...setting, id },
          });
          report.websiteSettings++;
        } catch (err: any) {
          report.errors.push(`WebsiteSetting error: ${err.message}`);
        }
      }
    }

    // 4. Restore Admin Users
    if (data.adminUser && data.adminUser.length > 0) {
      for (const admin of data.adminUser) {
        try {
          await prisma.adminUser.upsert({
            where: { username: admin.username },
            update: {
              name: admin.name,
              email: admin.email,
              role: admin.role,
              password: admin.password,
            },
            create: admin,
          });
          report.adminUsers++;
        } catch (err: any) {
          report.errors.push(`AdminUser (${admin.username}) error: ${err.message}`);
        }
      }
    }

    // 5. Restore Categories & Build ID Map
    const categoryIdMap = new Map<string, string>(); // oldId/slug -> newId
    if (data.category && data.category.length > 0) {
      for (const cat of data.category) {
        try {
          let savedCat = await prisma.category.findFirst({
            where: { OR: [{ id: cat.id }, { slug: cat.slug }] },
          });

          if (savedCat) {
            savedCat = await prisma.category.update({
              where: { id: savedCat.id },
              data: {
                name: cat.name,
                order: cat.order ?? 0,
                description: cat.description ?? "",
                iconName: cat.iconName ?? "Laptop",
                imageUrl: cat.imageUrl ?? "",
              },
            });
          } else {
            savedCat = await prisma.category.create({
              data: {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                order: cat.order ?? 0,
                description: cat.description ?? "",
                iconName: cat.iconName ?? "Laptop",
                imageUrl: cat.imageUrl ?? "",
              },
            });
          }

          if (savedCat) {
            categoryIdMap.set(cat.id, savedCat.id);
            categoryIdMap.set(cat.slug, savedCat.id);
            categoryIdMap.set(cat.name.toLowerCase(), savedCat.id);
            report.categories++;
          }
        } catch (err: any) {
          report.errors.push(`Category (${cat.name}) error: ${err.message}`);
        }
      }
    }

    // 6. Restore Brands & Build ID Map
    const brandIdMap = new Map<string, string>(); // oldId/slug -> newId
    if (data.brand && data.brand.length > 0) {
      for (const brand of data.brand) {
        try {
          let savedBrand = await prisma.brand.findFirst({
            where: { OR: [{ id: brand.id }, { slug: brand.slug }] },
          });

          if (savedBrand) {
            savedBrand = await prisma.brand.update({
              where: { id: savedBrand.id },
              data: {
                name: brand.name,
                logoUrl: brand.logoUrl ?? "",
                isActive: true,
              },
            });
          } else {
            savedBrand = await prisma.brand.create({
              data: {
                id: brand.id,
                name: brand.name,
                slug: brand.slug,
                logoUrl: brand.logoUrl ?? "",
                isActive: true,
              },
            });
          }

          if (savedBrand) {
            brandIdMap.set(brand.id, savedBrand.id);
            brandIdMap.set(brand.slug, savedBrand.id);
            brandIdMap.set(brand.name.toLowerCase(), savedBrand.id);
            report.brands++;
          }
        } catch (err: any) {
          report.errors.push(`Brand (${brand.name}) error: ${err.message}`);
        }
      }
    }

    // 7. Clean up any dummy/mock products before restoring authentic catalog
    const backupSlugs = new Set((data.product || []).map((p: any) => p.slug));
    try {
      // Remove products not in authentic backup to remove dummy mock seeds
      const existingProducts = await prisma.product.findMany({ select: { id: true, slug: true } });
      for (const ep of existingProducts) {
        if (!backupSlugs.has(ep.slug)) {
          await prisma.productImage.deleteMany({ where: { productId: ep.id } }).catch(() => {});
          await prisma.product.delete({ where: { id: ep.id } }).catch(() => {});
        }
      }
    } catch {}

    // 8. Restore Authentic Products & Images (All 36 Products)
    if (data.product && data.product.length > 0) {
      // Default fallback category if any product has unmatched category
      const fallbackCat = await prisma.category.findFirst();

      for (const prod of data.product) {
        try {
          const { images, createdAt, updatedAt, ...rawProductData } = prod;

          // Resolve foreign keys
          const resolvedCategoryId =
            (rawProductData.categoryId ? categoryIdMap.get(rawProductData.categoryId) : null) ||
            fallbackCat?.id;

          const resolvedBrandId = rawProductData.brandId
            ? brandIdMap.get(rawProductData.brandId) || null
            : null;

          if (!resolvedCategoryId) {
            report.errors.push(`Product (${prod.name}) skipped: No valid category found.`);
            continue;
          }

          const productPayload = {
            name: rawProductData.name,
            slug: rawProductData.slug,
            sku: rawProductData.sku ?? "",
            description: rawProductData.description ?? "",
            shortDesc: rawProductData.shortDesc ?? "",
            price: Number(rawProductData.price) || 0,
            salePrice: rawProductData.salePrice ? Number(rawProductData.salePrice) : null,
            stock: Number(rawProductData.stock) || 0,
            inStock: rawProductData.inStock !== false,
            warranty: rawProductData.warranty ?? "1 Year Brand Warranty",
            isFeatured: Boolean(rawProductData.isFeatured),
            isBestseller: Boolean(rawProductData.isBestseller),
            isNewArrival: Boolean(rawProductData.isNewArrival),
            isTrending: Boolean(rawProductData.isTrending),
            isGamingDeal: Boolean(rawProductData.isGamingDeal),
            videoUrl: rawProductData.videoUrl ?? "",
            sliderSeconds: Number(rawProductData.sliderSeconds) || 3,
            specsJson: rawProductData.specsJson ?? null,
            categoryId: resolvedCategoryId,
            brandId: resolvedBrandId,
          };

          // Find existing product by ID or Slug
          const existingProd = await prisma.product.findFirst({
            where: { OR: [{ id: prod.id }, { slug: prod.slug }] },
          });

          let savedProd;
          if (existingProd) {
            savedProd = await prisma.product.update({
              where: { id: existingProd.id },
              data: productPayload,
            });
          } else {
            savedProd = await prisma.product.create({
              data: {
                id: prod.id,
                ...productPayload,
              },
            });
          }

          // Restore Product Images
          if (images && images.length > 0 && savedProd) {
            for (const img of images) {
              try {
                await prisma.productImage.upsert({
                  where: { id: img.id },
                  update: {
                    url: img.url,
                    isPrimary: Boolean(img.isPrimary),
                    order: Number(img.order) || 0,
                    productId: savedProd.id,
                  },
                  create: {
                    id: img.id,
                    url: img.url,
                    isPrimary: Boolean(img.isPrimary),
                    order: Number(img.order) || 0,
                    productId: savedProd.id,
                  },
                });
                report.productImages++;
              } catch (imgErr: any) {
                // If ID collision, create without fixed ID
                await prisma.productImage.create({
                  data: {
                    url: img.url,
                    isPrimary: Boolean(img.isPrimary),
                    order: Number(img.order) || 0,
                    productId: savedProd.id,
                  },
                }).catch(() => {});
                report.productImages++;
              }
            }
          }

          report.products++;
        } catch (prodErr: any) {
          report.errors.push(`Product (${prod.name}) error: ${prodErr.message}`);
        }
      }
    }

    // 9. Restore Banners
    if (data.banner && data.banner.length > 0) {
      for (const ban of data.banner) {
        try {
          const { createdAt, updatedAt, ...banData } = ban;
          await prisma.banner.upsert({
            where: { id: ban.id },
            update: banData,
            create: banData,
          });
          report.banners++;
        } catch (err: any) {
          report.errors.push(`Banner error: ${err.message}`);
        }
      }
    }

    // 10. Restore Offers
    if (data.offer && data.offer.length > 0) {
      for (const off of data.offer) {
        try {
          const { createdAt, updatedAt, ...offData } = off;
          await prisma.offer.upsert({
            where: { id: off.id },
            update: offData,
            create: offData,
          });
          report.offers++;
        } catch (err: any) {
          report.errors.push(`Offer error: ${err.message}`);
        }
      }
    }

    // 11. Restore Happy Customers
    if (data.happyCustomer && data.happyCustomer.length > 0) {
      for (const cust of data.happyCustomer) {
        try {
          const { createdAt, updatedAt, ...custData } = cust;
          await prisma.happyCustomer.upsert({
            where: { id: cust.id },
            update: custData,
            create: custData,
          });
          report.happyCustomers++;
        } catch (err: any) {
          report.errors.push(`HappyCustomer error: ${err.message}`);
        }
      }
    }

    // 12. Restore Users
    if (data.user && data.user.length > 0) {
      for (const u of data.user) {
        try {
          await prisma.user.upsert({
            where: { email: u.email },
            update: {
              name: u.name,
              phone: u.phone,
              role: u.role,
              address: u.address,
              city: u.city,
              pincode: u.pincode,
              isVerified: u.isVerified ?? true,
            },
            create: {
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              password: u.password,
              role: u.role,
              address: u.address,
              city: u.city,
              pincode: u.pincode,
              isVerified: u.isVerified ?? true,
            },
          });
          report.users++;
        } catch (err: any) {
          report.errors.push(`User (${u.email}) error: ${err.message}`);
        }
      }
    }

    // 13. Restore Orders & Order Items
    if (data.order && data.order.length > 0) {
      for (const ord of data.order) {
        try {
          const { items, createdAt, updatedAt, ...orderData } = ord;
          const createdOrder = await prisma.order.upsert({
            where: { orderNumber: ord.orderNumber },
            update: orderData,
            create: orderData,
          });

          if (items && items.length > 0) {
            for (const item of items) {
              try {
                const { createdAt, updatedAt, ...itemData } = item;
                await prisma.orderItem.upsert({
                  where: { id: item.id },
                  update: {
                    price: itemData.price,
                    quantity: itemData.quantity,
                    total: itemData.total,
                    name: itemData.name || itemData.productName,
                  },
                  create: {
                    id: itemData.id,
                    orderId: createdOrder.id,
                    productId: itemData.productId,
                    price: itemData.price,
                    quantity: itemData.quantity,
                    total: itemData.total,
                    name: itemData.name || itemData.productName,
                  },
                });
                report.orderItems++;
              } catch {}
            }
          }
          report.orders++;
        } catch (err: any) {
          report.errors.push(`Order (${ord.orderNumber}) error: ${err.message}`);
        }
      }
    }

    // 14. Restore Service Requests
    if (data.serviceRequest && data.serviceRequest.length > 0) {
      for (const srv of data.serviceRequest) {
        try {
          const { createdAt, updatedAt, ...srvData } = srv;
          await prisma.serviceRequest.upsert({
            where: { ticketId: srv.ticketId },
            update: srvData,
            create: srvData,
          });
          report.serviceRequests++;
        } catch (err: any) {
          report.errors.push(`ServiceRequest error: ${err.message}`);
        }
      }
    }

    // Verify total authentic products now active in DB
    const totalActiveProductsInDB = await prisma.product.count();

    return NextResponse.json({
      success: true,
      message: "🎉 Authentic Jijau Computers Database Restored Successfully on Hostinger MySQL!",
      totalAuthenticProductsInDB: totalActiveProductsInDB,
      report,
    });
  } catch (error: any) {
    console.error("Restore Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to restore database" }, { status: 500 });
  }
}

