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
  } catch {
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
      console.error("ensureHappyCustomerTable error:", pgErr);
    }
  }
}

export async function ensureAllTables() {
  const mysqlQueries = [
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
      \`upiId\` VARCHAR(191) NOT NULL DEFAULT 'jijaucomputers@upi',
      \`bankName\` VARCHAR(191) NOT NULL DEFAULT 'State Bank of India',
      \`accountNumber\` VARCHAR(191) NOT NULL DEFAULT '38920192831',
      \`ifscCode\` VARCHAR(191) NOT NULL DEFAULT 'SBIN0001234',
      \`accountHolder\` VARCHAR(191) NOT NULL DEFAULT 'Jijau Computers',
      \`deliveryInfo\` VARCHAR(191) NOT NULL DEFAULT 'Free local delivery in Jafrabad area. Standard courier delivery across Maharashtra within 2-4 days.',
      \`warrantyInfo\` VARCHAR(191) NOT NULL DEFAULT 'All products carry 100% official brand warranty. On-site service support available.',
      \`announcementText\` VARCHAR(191) NOT NULL DEFAULT 'Special festive discounts on custom Gaming PCs & Laptops! Visit our store or call now.',
      \`showAnnouncement\` BOOLEAN NOT NULL DEFAULT true,
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`Category\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`description\` TEXT NULL,
      \`imageUrl\` LONGTEXT NULL,
      \`icon\` VARCHAR(191) NULL,
      \`isFeatured\` BOOLEAN NOT NULL DEFAULT false,
      \`order\` INT NOT NULL DEFAULT 0,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`Category_name_key\` (\`name\`),
      UNIQUE KEY \`Category_slug_key\` (\`slug\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`Brand\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`logoUrl\` LONGTEXT NULL,
      \`description\` TEXT NULL,
      \`websiteUrl\` VARCHAR(191) NULL,
      \`isFeatured\` BOOLEAN NOT NULL DEFAULT false,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`Brand_name_key\` (\`name\`),
      UNIQUE KEY \`Brand_slug_key\` (\`slug\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`Product\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`sku\` VARCHAR(191) NULL,
      \`shortDesc\` TEXT NULL,
      \`description\` LONGTEXT NULL,
      \`price\` DOUBLE NOT NULL,
      \`comparePrice\` DOUBLE NULL,
      \`costPrice\` DOUBLE NULL,
      \`stock\` INT NOT NULL DEFAULT 0,
      \`lowStockAlert\` INT NOT NULL DEFAULT 3,
      \`images\` LONGTEXT NOT NULL,
      \`specs\` LONGTEXT NULL,
      \`isFeatured\` BOOLEAN NOT NULL DEFAULT false,
      \`isNew\` BOOLEAN NOT NULL DEFAULT false,
      \`isBestSeller\` BOOLEAN NOT NULL DEFAULT false,
      \`warranty\` VARCHAR(191) NULL DEFAULT '1 Year Official Warranty',
      \`condition\` VARCHAR(191) NOT NULL DEFAULT 'NEW',
      \`isActive\` BOOLEAN NOT NULL DEFAULT true,
      \`categoryId\` VARCHAR(191) NOT NULL,
      \`brandId\` VARCHAR(191) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      UNIQUE KEY \`Product_slug_key\` (\`slug\`),
      UNIQUE KEY \`Product_sku_key\` (\`sku\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`Banner\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`title\` VARCHAR(191) NOT NULL,
      \`subtitle\` VARCHAR(191) NULL,
      \`imageUrl\` LONGTEXT NOT NULL,
      \`ctaText\` VARCHAR(191) NULL DEFAULT 'Explore Now',
      \`ctaLink\` VARCHAR(191) NULL DEFAULT '/products',
      \`order\` INT NOT NULL DEFAULT 0,
      \`isActive\` BOOLEAN NOT NULL DEFAULT true,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

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

  for (const query of mysqlQueries) {
    try {
      await prisma.$executeRawUnsafe(query);
    } catch (e) {
      console.warn("Table sync error on raw query:", e);
    }
  }
}
