import { prisma } from "./prisma";

export async function ensureHappyCustomerTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`HappyCustomer\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`city\` VARCHAR(191) NOT NULL DEFAULT 'Pune',
        \`village\` TEXT NULL,
        \`district\` VARCHAR(191) NULL DEFAULT 'Jalna',
        \`phone\` VARCHAR(191) NULL,
        \`productName\` VARCHAR(191) NOT NULL DEFAULT 'Custom PC',
        \`photoUrl\` LONGTEXT NULL,
        \`review\` TEXT NULL,
        \`rating\` INT NOT NULL DEFAULT 5,
        \`purchaseDate\` VARCHAR(191) NULL DEFAULT 'Sept 2026',
        \`isFeatured\` BOOLEAN NOT NULL DEFAULT true,
        \`isActive\` BOOLEAN NOT NULL DEFAULT true,
        \`order\` INT NOT NULL DEFAULT 0,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    // Ensure columns exist if table was previously created with fewer columns
    const columns = [
      "ALTER TABLE `HappyCustomer` ADD COLUMN IF NOT EXISTS `village` TEXT NULL;",
      "ALTER TABLE `HappyCustomer` ADD COLUMN IF NOT EXISTS `district` VARCHAR(191) NULL DEFAULT 'Jalna';",
      "ALTER TABLE `HappyCustomer` ADD COLUMN IF NOT EXISTS `phone` VARCHAR(191) NULL;",
    ];
    for (const colSql of columns) {
      try {
        await prisma.$executeRawUnsafe(colSql);
      } catch {}
    }
  } catch {
    // Postgres fallback
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "HappyCustomer" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "city" TEXT NOT NULL DEFAULT 'Pune',
          "village" TEXT,
          "district" TEXT DEFAULT 'Jalna',
          "phone" TEXT,
          "productName" TEXT NOT NULL DEFAULT 'Custom PC',
          "photoUrl" TEXT,
          "review" TEXT,
          "rating" INTEGER NOT NULL DEFAULT 5,
          "purchaseDate" TEXT DEFAULT 'Sept 2026',
          "isFeatured" BOOLEAN NOT NULL DEFAULT true,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "order" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (pgErr) {
      console.error("ensureHappyCustomerTable postgres error:", pgErr);
    }
  }
}

export async function ensureAllTables() {
  const tableDefinitions = [
    // 1. WebsiteSetting
    `CREATE TABLE IF NOT EXISTS \`WebsiteSetting\` (
      \`id\` VARCHAR(191) NOT NULL DEFAULT 'default',
      \`storeName\` VARCHAR(191) NOT NULL DEFAULT 'Jijau Computers',
      \`tagline\` VARCHAR(191) NOT NULL DEFAULT 'Your Tech Partner',
      \`logoUrl\` TEXT NOT NULL,
      \`darkLogoUrl\` TEXT NOT NULL,
      \`faviconUrl\` TEXT NOT NULL,
      \`primaryColor\` VARCHAR(191) NOT NULL DEFAULT '#1d4ed8',
      \`secondaryColor\` VARCHAR(191) NOT NULL DEFAULT '#f97316',
      \`phone\` VARCHAR(191) NOT NULL DEFAULT '+91 88056 07908',
      \`whatsapp\` VARCHAR(191) NOT NULL DEFAULT '918805607908',
      \`email\` VARCHAR(191) NOT NULL DEFAULT 'sales@jijaucomputers.in',
      \`address\` TEXT NOT NULL,
      \`googleMapsUrl\` TEXT NOT NULL,
      \`openingHours\` VARCHAR(191) NOT NULL DEFAULT 'Mon - Sat: 10:00 AM - 9:00 PM | Sun: 11:00 AM - 6:00 PM',
      \`gstin\` VARCHAR(191) NOT NULL DEFAULT '27AAAAA0000A1Z5',
      \`upiId\` VARCHAR(191) NOT NULL DEFAULT 'jijauc@ibl',
      \`upiName\` VARCHAR(191) NOT NULL DEFAULT 'Jijau Computers',
      \`facebookUrl\` TEXT NOT NULL,
      \`instagramUrl\` TEXT NOT NULL,
      \`youtubeUrl\` TEXT NOT NULL,
      \`linkedinUrl\` TEXT NOT NULL,
      \`metaTitle\` VARCHAR(191) NOT NULL DEFAULT 'Jijau Computers - Best Computer & Laptop Store',
      \`metaDescription\` TEXT NOT NULL,
      \`metaKeywords\` TEXT NOT NULL,
      \`sliderInterval\` INT NOT NULL DEFAULT 5,
      \`branchesJson\` TEXT NULL,
      \`invoiceTerms\` TEXT NOT NULL,
      \`invoiceBankDetails\` TEXT NOT NULL,
      \`invoiceHsnCode\` VARCHAR(191) NOT NULL DEFAULT '84713010',
      \`invoiceNotes\` TEXT NOT NULL,
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 2. AdminUser
    `CREATE TABLE IF NOT EXISTS \`AdminUser\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`username\` VARCHAR(191) NOT NULL,
      \`password\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL DEFAULT 'Store Admin',
      \`email\` VARCHAR(191) NOT NULL,
      \`role\` VARCHAR(191) NOT NULL DEFAULT 'ADMIN',
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`AdminUser_username_key\` (\`username\`),
      UNIQUE KEY \`AdminUser_email_key\` (\`email\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 3. Category
    `CREATE TABLE IF NOT EXISTS \`Category\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`description\` TEXT NULL,
      \`imageUrl\` TEXT NULL,
      \`iconName\` VARCHAR(191) NULL DEFAULT 'Monitor',
      \`order\` INT NOT NULL DEFAULT 0,
      \`isActive\` BOOLEAN NOT NULL DEFAULT true,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`Category_name_key\` (\`name\`),
      UNIQUE KEY \`Category_slug_key\` (\`slug\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 4. Brand
    `CREATE TABLE IF NOT EXISTS \`Brand\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`logoUrl\` TEXT NULL,
      \`isActive\` BOOLEAN NOT NULL DEFAULT true,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`Brand_name_key\` (\`name\`),
      UNIQUE KEY \`Brand_slug_key\` (\`slug\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 5. Product
    `CREATE TABLE IF NOT EXISTS \`Product\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`sku\` VARCHAR(191) NULL,
      \`description\` TEXT NOT NULL,
      \`shortDesc\` TEXT NULL,
      \`price\` DOUBLE NOT NULL,
      \`salePrice\` DOUBLE NULL,
      \`stock\` INT NOT NULL DEFAULT 10,
      \`inStock\` BOOLEAN NOT NULL DEFAULT true,
      \`warranty\` VARCHAR(191) NULL DEFAULT '1 Year Brand Warranty',
      \`isFeatured\` BOOLEAN NOT NULL DEFAULT false,
      \`isBestseller\` BOOLEAN NOT NULL DEFAULT false,
      \`isNewArrival\` BOOLEAN NOT NULL DEFAULT false,
      \`isTrending\` BOOLEAN NOT NULL DEFAULT false,
      \`isGamingDeal\` BOOLEAN NOT NULL DEFAULT false,
      \`videoUrl\` TEXT NULL,
      \`sliderSeconds\` INT NULL DEFAULT 5,
      \`specsJson\` TEXT NULL,
      \`categoryId\` VARCHAR(191) NOT NULL,
      \`brandId\` VARCHAR(191) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`Product_slug_key\` (\`slug\`),
      UNIQUE KEY \`Product_sku_key\` (\`sku\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 6. ProductImage
    `CREATE TABLE IF NOT EXISTS \`ProductImage\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`url\` LONGTEXT NOT NULL,
      \`isPrimary\` BOOLEAN NOT NULL DEFAULT false,
      \`order\` INT NOT NULL DEFAULT 0,
      \`productId\` VARCHAR(191) NOT NULL,
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 7. Offer
    `CREATE TABLE IF NOT EXISTS \`Offer\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`title\` VARCHAR(191) NOT NULL,
      \`badge\` VARCHAR(191) NULL DEFAULT 'FESTIVE DEAL',
      \`description\` TEXT NOT NULL,
      \`bannerUrl\` TEXT NULL,
      \`discountPct\` INT NULL DEFAULT 15,
      \`couponCode\` VARCHAR(191) NULL,
      \`startDate\` DATETIME(3) NULL,
      \`endDate\` DATETIME(3) NULL,
      \`isActive\` BOOLEAN NOT NULL DEFAULT true,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 8. Banner
    `CREATE TABLE IF NOT EXISTS \`Banner\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`title\` VARCHAR(191) NOT NULL,
      \`subtitle\` TEXT NULL,
      \`tag\` VARCHAR(191) NULL DEFAULT 'Special Promotion',
      \`imageUrl\` LONGTEXT NOT NULL,
      \`ctaText\` VARCHAR(191) NULL DEFAULT 'Explore Now',
      \`ctaLink\` VARCHAR(191) NULL DEFAULT '/products',
      \`order\` INT NOT NULL DEFAULT 0,
      \`isActive\` BOOLEAN NOT NULL DEFAULT true,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 9. CustomPcRequest
    `CREATE TABLE IF NOT EXISTS \`CustomPcRequest\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`reqNumber\` VARCHAR(191) NOT NULL,
      \`customerName\` VARCHAR(191) NOT NULL,
      \`phone\` VARCHAR(191) NOT NULL,
      \`email\` VARCHAR(191) NULL,
      \`budget\` VARCHAR(191) NOT NULL,
      \`purpose\` VARCHAR(191) NOT NULL,
      \`cpuPref\` VARCHAR(191) NULL,
      \`gpuPref\` VARCHAR(191) NULL,
      \`ramPref\` VARCHAR(191) NULL,
      \`storagePref\` VARCHAR(191) NULL,
      \`cabinetPref\` VARCHAR(191) NULL,
      \`notes\` TEXT NULL,
      \`status\` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
      \`adminNotes\` TEXT NULL,
      \`totalEst\` DOUBLE NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`CustomPcRequest_reqNumber_key\` (\`reqNumber\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 10. ServiceRequest
    `CREATE TABLE IF NOT EXISTS \`ServiceRequest\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`ticketId\` VARCHAR(191) NOT NULL,
      \`customerName\` VARCHAR(191) NOT NULL,
      \`phone\` VARCHAR(191) NOT NULL,
      \`email\` VARCHAR(191) NULL,
      \`deviceType\` VARCHAR(191) NOT NULL,
      \`brand\` VARCHAR(191) NOT NULL,
      \`model\` VARCHAR(191) NOT NULL,
      \`serialNo\` VARCHAR(191) NULL,
      \`issueDesc\` TEXT NOT NULL,
      \`status\` VARCHAR(191) NOT NULL DEFAULT 'Received',
      \`adminNotes\` TEXT NULL,
      \`estimatedCost\` DOUBLE NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`ServiceRequest_ticketId_key\` (\`ticketId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 11. QuotationRequest
    `CREATE TABLE IF NOT EXISTS \`QuotationRequest\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`quoteNumber\` VARCHAR(191) NOT NULL,
      \`customerName\` VARCHAR(191) NOT NULL,
      \`companyName\` VARCHAR(191) NULL,
      \`phone\` VARCHAR(191) NOT NULL,
      \`email\` VARCHAR(191) NOT NULL,
      \`type\` VARCHAR(191) NOT NULL DEFAULT 'Bulk Order',
      \`itemsSummary\` TEXT NOT NULL,
      \`message\` TEXT NULL,
      \`status\` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
      \`adminNotes\` TEXT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`QuotationRequest_quoteNumber_key\` (\`quoteNumber\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 12. Enquiry
    `CREATE TABLE IF NOT EXISTS \`Enquiry\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`phone\` VARCHAR(191) NOT NULL,
      \`email\` VARCHAR(191) NULL,
      \`subject\` VARCHAR(191) NOT NULL,
      \`message\` TEXT NOT NULL,
      \`productName\` VARCHAR(191) NULL,
      \`status\` VARCHAR(191) NOT NULL DEFAULT 'NEW',
      \`adminNotes\` TEXT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 13. User
    `CREATE TABLE IF NOT EXISTS \`User\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`email\` VARCHAR(191) NULL,
      \`phone\` VARCHAR(191) NULL,
      \`password\` VARCHAR(191) NULL,
      \`role\` VARCHAR(191) NOT NULL DEFAULT 'CUSTOMER',
      \`address\` TEXT NULL,
      \`city\` VARCHAR(191) NULL,
      \`pincode\` VARCHAR(191) NULL,
      \`state\` VARCHAR(191) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`User_email_key\` (\`email\`),
      UNIQUE KEY \`User_phone_key\` (\`phone\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 14. Order
    `CREATE TABLE IF NOT EXISTS \`Order\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`orderNumber\` VARCHAR(191) NOT NULL,
      \`customerName\` VARCHAR(191) NOT NULL,
      \`customerPhone\` VARCHAR(191) NOT NULL,
      \`customerEmail\` VARCHAR(191) NULL,
      \`shippingAddress\` TEXT NOT NULL,
      \`billingAddress\` TEXT NULL,
      \`city\` VARCHAR(191) NOT NULL DEFAULT 'Jafrabad',
      \`pincode\` VARCHAR(191) NOT NULL DEFAULT '431206',
      \`state\` VARCHAR(191) NOT NULL DEFAULT 'Maharashtra',
      \`subtotal\` DOUBLE NOT NULL,
      \`discount\` DOUBLE NOT NULL DEFAULT 0,
      \`deliveryCharge\` DOUBLE NOT NULL DEFAULT 0,
      \`totalAmount\` DOUBLE NOT NULL,
      \`paymentMethod\` VARCHAR(191) NOT NULL DEFAULT 'COD',
      \`paymentStatus\` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
      \`orderStatus\` VARCHAR(191) NOT NULL DEFAULT 'PROCESSING',
      \`trackingNumber\` VARCHAR(191) NULL,
      \`courierPartner\` VARCHAR(191) NULL,
      \`notes\` TEXT NULL,
      \`adminNotes\` TEXT NULL,
      \`gstDetails\` TEXT NULL,
      \`userId\` VARCHAR(191) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`Order_orderNumber_key\` (\`orderNumber\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 15. OrderItem
    `CREATE TABLE IF NOT EXISTS \`OrderItem\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`orderId\` VARCHAR(191) NOT NULL,
      \`productId\` VARCHAR(191) NOT NULL,
      \`productName\` VARCHAR(191) NOT NULL,
      \`price\` DOUBLE NOT NULL,
      \`quantity\` INT NOT NULL DEFAULT 1,
      \`total\` DOUBLE NOT NULL,
      \`specsJson\` TEXT NULL,
      \`warranty\` VARCHAR(191) NULL,
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 16. VisitorLog
    `CREATE TABLE IF NOT EXISTS \`VisitorLog\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`ip\` VARCHAR(191) NOT NULL,
      \`page\` VARCHAR(191) NOT NULL,
      \`referrer\` TEXT NULL,
      \`city\` VARCHAR(191) NULL,
      \`state\` VARCHAR(191) NULL,
      \`country\` VARCHAR(191) NULL DEFAULT 'India',
      \`device\` VARCHAR(191) NULL,
      \`browser\` VARCHAR(191) NULL,
      \`userAgent\` TEXT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 17. Review
    `CREATE TABLE IF NOT EXISTS \`Review\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`productId\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NULL,
      \`authorName\` VARCHAR(191) NOT NULL,
      \`rating\` INT NOT NULL DEFAULT 5,
      \`title\` VARCHAR(191) NULL,
      \`comment\` TEXT NOT NULL,
      \`isVerified\` BOOLEAN NOT NULL DEFAULT false,
      \`isApproved\` BOOLEAN NOT NULL DEFAULT true,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    // 18. HappyCustomer
    `CREATE TABLE IF NOT EXISTS \`HappyCustomer\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`city\` VARCHAR(191) NOT NULL DEFAULT 'Pune',
      \`village\` TEXT NULL,
      \`district\` VARCHAR(191) NULL DEFAULT 'Jalna',
      \`phone\` VARCHAR(191) NULL,
      \`productName\` VARCHAR(191) NOT NULL DEFAULT 'Custom PC',
      \`photoUrl\` LONGTEXT NULL,
      \`review\` TEXT NULL,
      \`rating\` INT NOT NULL DEFAULT 5,
      \`purchaseDate\` VARCHAR(191) NULL DEFAULT 'Sept 2026',
      \`isFeatured\` BOOLEAN NOT NULL DEFAULT true,
      \`isActive\` BOOLEAN NOT NULL DEFAULT true,
      \`order\` INT NOT NULL DEFAULT 0,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  ];

  const results: { table: string; status: string }[] = [];

  for (const query of tableDefinitions) {
    const match = query.match(/CREATE TABLE IF NOT EXISTS `(\w+)`/);
    const tableName = match ? match[1] : "Unknown";
    try {
      await prisma.$executeRawUnsafe(query);
      results.push({ table: tableName, status: "created_or_verified" });
    } catch (e: any) {
      console.warn(`Table sync error on ${tableName}:`, e?.message);
      results.push({ table: tableName, status: `error: ${e?.message}` });
    }
  }

  // Ensure default website setting exists
  try {
    const settingCount = await prisma.websiteSetting.count();
    if (settingCount === 0) {
      await prisma.websiteSetting.create({
        data: {
          id: "default",
          storeName: "Jijau Computers",
          tagline: "Your Tech Partner",
          phone: "+91 88056 07908",
          whatsapp: "918805607908",
          email: "sales@jijaucomputers.in",
          address: "Jijau Computer Sales & Service, Opposite SBI Bank, Main Road, Jafrabad, Maharashtra - 431206",
          googleMapsUrl: "https://maps.app.goo.gl/UjCXouqaC9ufVJNTA",
          openingHours: "Mon - Sat: 10:00 AM - 9:00 PM | Sun: 11:00 AM - 6:00 PM",
        },
      });
    }
  } catch {}

  return results;
}
