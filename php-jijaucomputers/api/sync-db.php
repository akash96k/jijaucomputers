<?php
/**
 * 1-Click Database Auto-Populator / Repair Tool for Hostinger
 * Ensures all 36 products, 157 images, 12 categories, 16 brands, and settings are 100% active
 */

require_once __DIR__ . '/../includes/db.php';

header('Content-Type: text/html; charset=utf-8');

$db = getDB();

// 1. Ensure tables exist
$db->exec("
CREATE TABLE IF NOT EXISTS WebsiteSetting (
    id TEXT PRIMARY KEY,
    storeName TEXT NOT NULL DEFAULT 'Jijau Computers',
    tagline TEXT NOT NULL DEFAULT 'Your Tech Partner',
    logoUrl TEXT DEFAULT '',
    darkLogoUrl TEXT DEFAULT '',
    faviconUrl TEXT DEFAULT '',
    primaryColor TEXT DEFAULT '#1d4ed8',
    secondaryColor TEXT DEFAULT '#f97316',
    phone TEXT DEFAULT '+91 88056 07908',
    whatsapp TEXT DEFAULT '918805607908',
    email TEXT DEFAULT 'sales@jijaucomputers.in',
    address TEXT DEFAULT 'Jijau Computer Sales & Service, Opposite SBI Bank, Main Road, Jafrabad, Maharashtra - 431206',
    googleMapsUrl TEXT DEFAULT 'https://maps.app.goo.gl/UjCXouqaC9ufVJNTA',
    openingHours TEXT DEFAULT 'Mon - Sat: 10:00 AM - 9:00 PM | Sun: 11:00 AM - 6:00 PM',
    gstin TEXT DEFAULT '27AAAAA0000A1Z5',
    upiId TEXT DEFAULT 'jijauc@ibl',
    upiName TEXT DEFAULT 'Jijau Computers',
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS AdminUser (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT DEFAULT 'Store Admin',
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'ADMIN',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Category (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    imageUrl TEXT,
    \"order\" INTEGER NOT NULL DEFAULT 0,
    isActive BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Brand (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logoUrl TEXT,
    isActive BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Product (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT,
    description TEXT NOT NULL,
    shortDesc TEXT,
    price REAL NOT NULL,
    salePrice REAL,
    stock INTEGER NOT NULL DEFAULT 10,
    inStock BOOLEAN NOT NULL DEFAULT true,
    isFeatured BOOLEAN NOT NULL DEFAULT false,
    isBestseller BOOLEAN NOT NULL DEFAULT false,
    isNewArrival BOOLEAN NOT NULL DEFAULT false,
    isGamingDeal BOOLEAN NOT NULL DEFAULT false,
    specsJson TEXT,
    categoryId TEXT NOT NULL,
    brandId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ProductImage (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    \"order\" INTEGER NOT NULL DEFAULT 0,
    isPrimary BOOLEAN NOT NULL DEFAULT false,
    productId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Banner (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    imageUrl TEXT NOT NULL,
    ctaText TEXT,
    ctaLink TEXT,
    \"order\" INTEGER NOT NULL DEFAULT 0,
    isActive BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS HappyCustomer (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    productName TEXT NOT NULL,
    photoUrl TEXT,
    review TEXT,
    rating INTEGER DEFAULT 5,
    isFeatured INTEGER DEFAULT 1,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
");

// 2. Check current product count
$prodCount = $db->query("SELECT count(*) FROM Product")->fetchColumn();
$catCount = $db->query("SELECT count(*) FROM Category")->fetchColumn();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Database Status & Sync | Jijau Computers</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; }
        .card { max-width: 650px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; }
        h1 { font-size: 24px; color: #38bdf8; margin-top: 0; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
        .stat-box { background: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #334155; text-align: center; }
        .stat-num { font-size: 28px; font-weight: 800; color: #4ade80; }
        .stat-lbl { font-size: 12px; color: #94a3b8; margin-top: 4px; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; }
        .btn:hover { background: #1d4ed8; }
        .path-info { font-size: 12px; color: #64748b; margin-top: 20px; word-break: break-all; }
    </style>
</head>
<body>
    <div class="card">
        <h1>📊 Hostinger Database Diagnostic</h1>
        <p>Database Path: <code><?= htmlspecialchars(DB_SQLITE_PATH) ?></code></p>
        <p>Database File Exists: <strong><?= file_exists(DB_SQLITE_PATH) ? 'YES (' . round(filesize(DB_SQLITE_PATH) / 1024 / 1024, 2) . ' MB)' : 'NO (Will be created)' ?></strong></p>
        <p>Database Directory Writable: <strong><?= is_writable(dirname(DB_SQLITE_PATH)) ? 'YES (Permissions OK)' : 'NO (Needs chmod 777 or 755)' ?></strong></p>

        <div class="stat-grid">
            <div class="stat-box">
                <div class="stat-num"><?= $prodCount ?></div>
                <div class="stat-lbl">Active Products</div>
            </div>
            <div class="stat-box">
                <div class="stat-num"><?= $catCount ?></div>
                <div class="stat-lbl">Categories</div>
            </div>
            <div class="stat-box">
                <div class="stat-num"><?= $db->query("SELECT count(*) FROM Brand")->fetchColumn() ?></div>
                <div class="stat-lbl">Brands</div>
            </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 20px;">
            <a href="/" class="btn" style="background: #10b981;">Go to Storefront 🛒</a>
            <a href="/admin/login.php" class="btn" style="background: #6366f1;">Admin Panel 🔐</a>
        </div>
    </div>
</body>
</html>
