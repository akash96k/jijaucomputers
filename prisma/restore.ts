import { prisma } from "../src/lib/prisma";
import fs from "fs";
import path from "path";

async function restore() {
  const backupPath = path.join(process.cwd(), "prisma", "backup.json");
  if (!fs.existsSync(backupPath)) {
    console.error("Backup file not found at:", backupPath);
    process.exit(1);
  }

  console.log("Reading backup file...");
  const data = JSON.parse(fs.readFileSync(backupPath, "utf8"));

  console.log("Restoring authentic Jijau Computers data into database...");

  // 1. Website Settings
  if (data.websiteSetting && data.websiteSetting.length > 0) {
    for (const setting of data.websiteSetting) {
      const id = setting.id || "default";
      await prisma.websiteSetting.upsert({
        where: { id },
        update: setting,
        create: { ...setting, id },
      });
    }
    console.log("✓ Website Settings restored");
  }

  // 2. Admin Users
  if (data.adminUser && data.adminUser.length > 0) {
    for (const admin of data.adminUser) {
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
    }
    console.log("✓ Admin Users restored");
  }

  // 3. Categories & Map
  const categoryIdMap = new Map<string, string>();
  if (data.category && data.category.length > 0) {
    for (const cat of data.category) {
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
      }
    }
    console.log(`✓ Categories restored (${data.category.length})`);
  }

  // 4. Brands & Map
  const brandIdMap = new Map<string, string>();
  if (data.brand && data.brand.length > 0) {
    for (const brand of data.brand) {
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
      }
    }
    console.log(`✓ Brands restored (${data.brand.length})`);
  }

  // 5. Clean up any dummy/mock products
  const backupSlugs = new Set((data.product || []).map((p: any) => p.slug));
  try {
    const existingProducts = await prisma.product.findMany({ select: { id: true, slug: true } });
    for (const ep of existingProducts) {
      if (!backupSlugs.has(ep.slug)) {
        await prisma.productImage.deleteMany({ where: { productId: ep.id } }).catch(() => {});
        await prisma.product.delete({ where: { id: ep.id } }).catch(() => {});
      }
    }
  } catch {}

  // 6. Products & Product Images (All 36 Products)
  if (data.product && data.product.length > 0) {
    const fallbackCat = await prisma.category.findFirst();
    let restoredCount = 0;

    for (const prod of data.product) {
      const { images, createdAt, updatedAt, ...rawProductData } = prod;

      const resolvedCategoryId =
        (rawProductData.categoryId ? categoryIdMap.get(rawProductData.categoryId) : null) ||
        fallbackCat?.id;

      const resolvedBrandId = rawProductData.brandId
        ? brandIdMap.get(rawProductData.brandId) || null
        : null;

      if (!resolvedCategoryId) continue;

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
          } catch {
            await prisma.productImage.create({
              data: {
                url: img.url,
                isPrimary: Boolean(img.isPrimary),
                order: Number(img.order) || 0,
                productId: savedProd.id,
              },
            }).catch(() => {});
          }
        }
      }

      restoredCount++;
    }
    console.log(`✓ Products & Images restored (${restoredCount} products)`);
  }

  // 7. Banners
  if (data.banner && data.banner.length > 0) {
    for (const ban of data.banner) {
      const { createdAt, updatedAt, ...banData } = ban;
      await prisma.banner.upsert({
        where: { id: ban.id },
        update: banData,
        create: banData,
      });
    }
    console.log(`✓ Banners restored (${data.banner.length})`);
  }

  // 8. Offers
  if (data.offer && data.offer.length > 0) {
    for (const off of data.offer) {
      const { createdAt, updatedAt, ...offData } = off;
      await prisma.offer.upsert({
        where: { id: off.id },
        update: offData,
        create: offData,
      });
    }
    console.log(`✓ Offers restored (${data.offer.length})`);
  }

  // 9. Happy Customers
  if (data.happyCustomer && data.happyCustomer.length > 0) {
    for (const cust of data.happyCustomer) {
      const { createdAt, updatedAt, ...custData } = cust;
      await prisma.happyCustomer.upsert({
        where: { id: cust.id },
        update: custData,
        create: custData,
      });
    }
    console.log(`✓ Happy Customers restored (${data.happyCustomer.length})`);
  }

  // 10. Users
  if (data.user && data.user.length > 0) {
    for (const u of data.user) {
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
    }
    console.log(`✓ Users restored (${data.user.length})`);
  }

  // 11. Orders
  if (data.order && data.order.length > 0) {
    for (const ord of data.order) {
      const { items, createdAt, updatedAt, ...orderData } = ord;
      const createdOrder = await prisma.order.upsert({
        where: { orderNumber: ord.orderNumber },
        update: orderData,
        create: orderData,
      });

      if (items && items.length > 0) {
        for (const item of items) {
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
        }
      }
    }
    console.log(`✓ Orders restored (${data.order.length})`);
  }

  console.log("\n==========================================");
  console.log("🎉 AUTHENTIC JIJAU COMPUTERS DATABASE RESTORE COMPLETED!");
  console.log("==========================================");
}

restore()
  .catch((err) => {
    console.error("Restore error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

