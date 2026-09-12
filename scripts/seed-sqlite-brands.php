<?php
/**
 * Seed missing products for all 16 brands into SQLite database (jijau.db)
 */

$dbPath = __DIR__ . '/../php-jijaucomputers/database/jijau.db';
if (!file_exists($dbPath)) {
    die("Database not found at $dbPath\n");
}

$db = new PDO("sqlite:" . $dbPath);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

echo "Connected to SQLite database: $dbPath\n";

// Helper to get or create Category
function getCategoryId($db, $name, $slug, $desc, $icon, $order, $img) {
    $stmt = $db->prepare("SELECT id FROM Category WHERE slug = ? OR name = ?");
    $stmt->execute([$slug, $name]);
    $id = $stmt->fetchColumn();
    if ($id) return $id;

    $id = 'cat_' . bin2hex(random_bytes(6));
    $now = date('Y-m-d H:i:s');
    $ins = $db->prepare("INSERT INTO Category (id, name, slug, description, iconName, `order`, imageUrl, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)");
    $ins->execute([$id, $name, $slug, $desc, $icon, $order, $img, $now, $now]);
    return $id;
}

// Helper to get or create Brand
function getBrandId($db, $name, $slug) {
    $stmt = $db->prepare("SELECT id FROM Brand WHERE slug = ? OR name = ?");
    $stmt->execute([$slug, $name]);
    $id = $stmt->fetchColumn();
    if ($id) return $id;

    $id = 'brd_' . bin2hex(random_bytes(6));
    $now = date('Y-m-d H:i:s');
    $ins = $db->prepare("INSERT INTO Brand (id, name, slug, isActive, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?)");
    $ins->execute([$id, $name, $slug, $now, $now]);
    return $id;
}

// Map categories
$catLaptops = getCategoryId($db, "Laptop", "laptops", "Gaming, Ultrabooks, Business & Student Laptops", "Laptop", 1, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&auto=format&fit=crop&q=80");
$catMobiles = getCategoryId($db, "Mobile", "mobiles", "5G Smartphones, Flagships, Gaming Phones & Tablets", "Smartphone", 2, "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&auto=format&fit=crop&q=80");
$catPrinters = getCategoryId($db, "Printer", "printers", "Ink Tank, Laser, All-in-One Wireless Printers & Scanners", "Printer", 3, "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&auto=format&fit=crop&q=80");
$catCCTV = getCategoryId($db, "CCTV Camera", "cctv-camera", "HD IP Cameras, ColorVu Night Vision, WiFi PTZ & NVRs", "Camera", 4, "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&auto=format&fit=crop&q=80");
$catGamingPCs = getCategoryId($db, "Custom Gaming PCs", "custom-gaming-pcs", "Extreme Performance custom liquid-cooled RGB Battle-stations", "Cpu", 5, "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&auto=format&fit=crop&q=80");
$catDesktops = getCategoryId($db, "Desktop PC", "desktops", "All-in-One and Tower Desktop Computers", "Monitor", 6, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop&q=80");
$catCPUs = getCategoryId($db, "Processors (CPU)", "processors", "Intel Core & AMD Ryzen processors", "Cpu", 7, "https://images.unsplash.com/photo-1555618568-9a3d4608c0ff?w=400&auto=format&fit=crop&q=80");
$catGPUs = getCategoryId($db, "Graphics Cards (GPU)", "graphics-cards", "NVIDIA GeForce RTX & AMD Radeon RX series", "Tv", 8, "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&auto=format&fit=crop&q=80");
$catRAM = getCategoryId($db, "RAM & Memory", "ram", "DDR4 and DDR5 Gaming & Desktop RAM", "Cpu", 9, "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&auto=format&fit=crop&q=80");
$catStorage = getCategoryId($db, "Storage (SSD / HDD)", "storage", "NVMe M.2 Gen4 SSDs & High Capacity Hard Drives", "Database", 10, "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&auto=format&fit=crop&q=80");
$catMonitors = getCategoryId($db, "Monitors", "monitors", "Gaming and Professional IPS Monitors", "Monitor", 11, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80");
$catAccessories = getCategoryId($db, "Accessories", "accessories", "Mechanical Keyboards, Wireless Mice & Accessories", "Headphones", 12, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&auto=format&fit=crop&q=80");

// Map brands
$brands = [
    'amd' => getBrandId($db, "AMD", "amd"),
    'apple' => getBrandId($db, "Apple", "apple"),
    'asus' => getBrandId($db, "ASUS", "asus"),
    'corsair' => getBrandId($db, "Corsair", "corsair"),
    'cp-plus' => getBrandId($db, "CP PLUS", "cp-plus"),
    'dell' => getBrandId($db, "Dell", "dell"),
    'epson' => getBrandId($db, "Epson", "epson"),
    'google' => getBrandId($db, "Google", "google"),
    'hp' => getBrandId($db, "HP", "hp"),
    'intel' => getBrandId($db, "Intel", "intel"),
    'lenovo' => getBrandId($db, "Lenovo", "lenovo"),
    'logitech' => getBrandId($db, "Logitech", "logitech"),
    'msi' => getBrandId($db, "MSI", "msi"),
    'nvidia' => getBrandId($db, "NVIDIA", "nvidia"),
    'oneplus' => getBrandId($db, "OnePlus", "oneplus"),
    'samsung' => getBrandId($db, "Samsung", "samsung"),
];

$products = [
    // AMD
    [
        'name' => "AMD Ryzen 7 7800X3D Desktop Processor (8 Cores / 16 Threads, 3D V-Cache)",
        'slug' => "amd-ryzen-7-7800x3d-desktop-processor",
        'sku' => "JC-AMD-7800X3D",
        'cat' => $catCPUs,
        'brand' => $brands['amd'],
        'price' => 44990,
        'salePrice' => 38990,
        'stock' => 12,
        'warranty' => "3 Years AMD India Brand Warranty",
        'shortDesc' => "The undisputed king of gaming CPUs. 8 Cores, 16 Threads, 104MB Cache, 5.0 GHz Max Boost, AM5 Platform.",
        'description' => "Equipped with AMD 3D V-Cache technology, the Ryzen 7 7800X3D delivers incredible high-FPS smoothness in competitive gaming titles and simulations.",
        'img' => "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 1,
        'isBestseller' => 1,
        'isGamingDeal' => 1,
        'isNew' => 1,
        'specs' => json_encode(["Socket" => "AM5", "Cores / Threads" => "8 / 16", "Base Clock" => "4.2 GHz", "Boost Clock" => "Up to 5.0 GHz", "Total Cache" => "104 MB", "TDP" => "120W"])
    ],
    [
        'name' => "AMD Ryzen 5 7600X Desktop Processor (6 Cores / 12 Threads)",
        'slug' => "amd-ryzen-5-7600x-desktop-processor",
        'sku' => "JC-AMD-7600X",
        'cat' => $catCPUs,
        'brand' => $brands['amd'],
        'price' => 24990,
        'salePrice' => 20490,
        'stock' => 15,
        'warranty' => "3 Years AMD India Warranty",
        'shortDesc' => "Next-gen Zen 4 performance for mid-range gaming builds. Up to 5.3 GHz boost, DDR5 & PCIe 5.0 ready.",
        'description' => "Dominate your games and creative workflows with 6 high-speed Zen 4 cores built on energy-efficient 5nm architecture.",
        'img' => "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 0,
        'isGamingDeal' => 1,
        'isNew' => 0,
        'specs' => json_encode(["Socket" => "AM5", "Cores" => "6", "Threads" => "12", "Boost Clock" => "5.3 GHz", "Cache" => "38 MB", "TDP" => "105W"])
    ],

    // ASUS
    [
        'name' => "ASUS ROG Strix G16 (2024) Gaming Laptop (Core i7-13650HX, RTX 4060, 16GB, 1TB)",
        'slug' => "asus-rog-strix-g16-2024",
        'sku' => "JC-ROG-G16-01",
        'cat' => $catLaptops,
        'brand' => $brands['asus'],
        'price' => 154990,
        'salePrice' => 139990,
        'stock' => 6,
        'warranty' => "1 Year ASUS Brand Warranty",
        'shortDesc' => "Intel Core i7-13650HX, 16GB DDR5, 1TB SSD, NVIDIA GeForce RTX 4060 8GB, 165Hz FHD+ Display.",
        'description' => "Dominate the competition with the ROG Strix G16 featuring high-power Intel Core processors and NVIDIA RTX 40-Series graphics cooled by ROG Intelligent Cooling.",
        'img' => "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 1,
        'isBestseller' => 1,
        'isGamingDeal' => 1,
        'isNew' => 1,
        'specs' => json_encode(["CPU" => "Intel Core i7-13650HX", "GPU" => "NVIDIA GeForce RTX 4060 8GB (140W TGP)", "RAM" => "16GB DDR5 4800MHz", "Storage" => "1TB PCIe 4.0 SSD", "Display" => "16-inch 165Hz 100% sRGB"])
    ],
    [
        'name' => "ASUS ROG Swift OLED PG27AQDM 27-inch 240Hz Gaming Monitor",
        'slug' => "asus-rog-swift-oled-pg27aqdm-240hz",
        'sku' => "JC-MON-OLED-240",
        'cat' => $catMonitors,
        'brand' => $brands['asus'],
        'price' => 99990,
        'salePrice' => 89990,
        'stock' => 4,
        'warranty' => "3 Years ASUS Warranty with OLED Care",
        'shortDesc' => "27-inch QHD (2560 x 1440) OLED, 240Hz, 0.03ms Response Time, 99% DCI-P3, Custom Heatsink.",
        'description' => "Unrivaled OLED visuals with lightning 0.03ms response time, deep inky blacks, and custom heatsink design to prevent burn-in.",
        'img' => "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 0,
        'isGamingDeal' => 1,
        'isNew' => 0,
        'specs' => json_encode(["Panel" => "OLED 27-inch QHD", "Refresh Rate" => "240Hz", "Response Time" => "0.03ms (GTG)", "Color Gamut" => "99% DCI-P3", "HDR" => "HDR10"])
    ],

    // CORSAIR
    [
        'name' => "Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz CL30 RAM Kit",
        'slug' => "corsair-vengeance-rgb-32gb-ddr5",
        'sku' => "JC-RAM-DDR5-32",
        'cat' => $catRAM,
        'brand' => $brands['corsair'],
        'price' => 12490,
        'salePrice' => 10490,
        'stock' => 20,
        'warranty' => "10 Years / Lifetime Limited Warranty",
        'shortDesc' => "DDR5 6000MHz CL30, Intel XMP 3.0 & AMD EXPO Compatible, Ten-Zone RGB Lighting, Black Heatspreader.",
        'description' => "Deliver higher frequencies and greater capacities of DDR5 technology in a compact module with dynamic ten-zone RGB lighting.",
        'img' => "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 1,
        'isGamingDeal' => 1,
        'isNew' => 0,
        'specs' => json_encode(["Memory Size" => "32GB (2 x 16GB)", "Speed" => "DDR5-6000MHz", "Latency" => "CL30-36-36-76", "Voltage" => "1.35V", "Profiles" => "Intel XMP 3.0 & AMD EXPO"])
    ],
    [
        'name' => "Corsair RM850e 850W 80+ Gold Fully Modular ATX 3.0 Power Supply",
        'slug' => "corsair-rm850e-850w-gold-power-supply",
        'sku' => "JC-PSU-RM850E",
        'cat' => $catAccessories,
        'brand' => $brands['corsair'],
        'price' => 13990,
        'salePrice' => 11490,
        'stock' => 14,
        'warranty' => "7 Years Corsair Brand Warranty",
        'shortDesc' => "80 PLUS Gold Certified, PCIe 5.0 12VHPWR Native Cable, 120mm Rifle Bearing Fan, 105C Capacitors.",
        'description' => "Quiet, reliable power with 80 PLUS Gold efficiency, fully modular cables, and native ATX 3.0 & PCIe 5.0 compliance for latest RTX 40-Series GPUs.",
        'img' => "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 0,
        'isGamingDeal' => 0,
        'isNew' => 0,
        'specs' => json_encode(["Wattage" => "850W", "Efficiency" => "80 PLUS Gold", "Modularity" => "Full Modular", "Standard" => "ATX 3.0 / PCIe 5.0 12VHPWR", "Warranty" => "7 Years"])
    ],

    // CP PLUS
    [
        'name' => "CP PLUS 4MP Guard+ Smart Wi-Fi PT CCTV Security Camera (360° Pan-Tilt)",
        'slug' => "cp-plus-4mp-guard-plus-smart-wifi-cctv",
        'sku' => "JC-CCTV-4MP-CP",
        'cat' => $catCCTV,
        'brand' => $brands['cp-plus'],
        'price' => 3999,
        'salePrice' => 2499,
        'stock' => 25,
        'warranty' => "2 Years CP PLUS Brand Warranty",
        'shortDesc' => "4MP Ultra HD, 360-degree Pan/Tilt, Full Color Night Vision, Two-Way Audio, Motion Tracking.",
        'description' => "Protect your home, shop, or office with 360-degree coverage, crystal-clear 4MP resolution, AI human detection, and instant phone alerts.",
        'img' => "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 1,
        'isBestseller' => 1,
        'isGamingDeal' => 0,
        'isNew' => 0,
        'specs' => json_encode(["Resolution" => "4MP (2560 x 1440)", "Rotation" => "360° Pan, 90° Tilt", "Night Vision" => "Full Color Smart Night Vision", "Audio" => "2-Way Talkback", "Storage" => "MicroSD Up to 256GB / Cloud"])
    ],
    [
        'name' => "CP PLUS 8-Channel 5MP HD DVR Surveillance Kit (with 4 Night Vision Cameras)",
        'slug' => "cp-plus-8-channel-5mp-dvr-cctv-kit",
        'sku' => "JC-CCTV-8CH-KIT",
        'cat' => $catCCTV,
        'brand' => $brands['cp-plus'],
        'price' => 18990,
        'salePrice' => 14490,
        'stock' => 10,
        'warranty' => "2 Years CP PLUS Onsite Warranty",
        'shortDesc' => "Complete shop/farm surveillance kit: 8-CH 5MP DVR, 2 Bullet + 2 Dome Cameras, 1TB Surveillance HDD, Cables & SMPS.",
        'description' => "Heavy-duty outdoor and indoor security package. All-weather waterproof IP66 casing with 30m infrared illumination and remote mobile monitoring.",
        'img' => "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 1,
        'isGamingDeal' => 0,
        'isNew' => 1,
        'specs' => json_encode(["DVR Channels" => "8-Channel 5MP Support", "Cameras Included" => "4x 5MP IR Cameras", "Storage" => "1TB Surveillance Grade HDD", "Casing" => "IP66 Weatherproof", "Warranty" => "2 Years"])
    ],

    // EPSON
    [
        'name' => "Epson EcoTank L3250 Wi-Fi All-in-One Color Ink Tank Printer",
        'slug' => "epson-ecotank-l3250-wifi-printer",
        'sku' => "JC-PRN-L3250",
        'cat' => $catPrinters,
        'brand' => $brands['epson'],
        'price' => 16999,
        'salePrice' => 13999,
        'stock' => 12,
        'warranty' => "1 Year / 30,000 Pages Epson Onsite Warranty",
        'shortDesc' => "Print, Scan, Copy, Wi-Fi & Wi-Fi Direct, Ultra-low-cost printing (7 paise per page).",
        'description' => "Designed to improve business cost savings and print productivity with high page yield of up to 4,500 pages for black and 7,500 pages for color.",
        'img' => "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 1,
        'isBestseller' => 1,
        'isGamingDeal' => 0,
        'isNew' => 0,
        'specs' => json_encode(["Functions" => "Print, Scan, Copy", "Connectivity" => "Wi-Fi, Wi-Fi Direct, USB 2.0", "Cost Per Page" => "7 Paise (B/W), 18 Paise (Color)", "Page Yield" => "4,500 Black / 7,500 Color", "Print Speed" => "33 ppm (Black), 15 ppm (Color)"])
    ],
    [
        'name' => "Epson EcoTank L6270 Wi-Fi Duplex All-in-One Ink Tank Printer with ADF",
        'slug' => "epson-ecotank-l6270-duplex-printer",
        'sku' => "JC-PRN-L6270",
        'cat' => $catPrinters,
        'brand' => $brands['epson'],
        'price' => 28999,
        'salePrice' => 24999,
        'stock' => 6,
        'warranty' => "2 Years / 50,000 Pages Epson Warranty",
        'shortDesc' => "Auto-Duplex (2-sided) printing, 30-sheet Automatic Document Feeder (ADF), Ethernet & PrecisionCore Printhead.",
        'description' => "High-speed business powerhouse with automatic double-sided printing, ADF for bulk scanning, and smudge-resistant pigment black inks.",
        'img' => "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 0,
        'isGamingDeal' => 0,
        'isNew' => 1,
        'specs' => json_encode(["Special Features" => "Auto-Duplex Printing, 30-page ADF", "Printhead" => "PrecisionCore Heat-Free", "Network" => "Wi-Fi, Wi-Fi Direct, Ethernet", "Display" => "1.44-inch Color LCD"])
    ],

    // GOOGLE
    [
        'name' => "Google Pixel 8 Pro 5G (12GB RAM, 128GB, Obsidian Black)",
        'slug' => "google-pixel-8-pro-5g-128gb",
        'sku' => "JC-PIX-8P-01",
        'cat' => $catMobiles,
        'brand' => $brands['google'],
        'price' => 106999,
        'salePrice' => 97999,
        'stock' => 5,
        'warranty' => "1 Year Google India Warranty",
        'shortDesc' => "Google Tensor G3, Super Actua display, Pro triple camera with Best Take & Magic Editor.",
        'description' => "Pixel 8 Pro is the all-pro phone engineered by Google. It has the best Pixel Camera yet, all-day battery, and incredible Google AI features with 7 years of OS updates.",
        'img' => "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 0,
        'isGamingDeal' => 0,
        'isNew' => 1,
        'specs' => json_encode(["Processor" => "Google Tensor G3 + Titan M2", "Display" => "6.7-inch Super Actua LTPO 120Hz", "RAM / Storage" => "12GB LPDDR5X / 128GB UFS 3.1", "Cameras" => "50MP Main + 48MP Ultrawide + 48MP 5x Telephoto", "Updates" => "7 Years Android OS Support"])
    ],
    [
        'name' => "Google Pixel 8a 5G (8GB RAM, 128GB, Bay Blue)",
        'slug' => "google-pixel-8a-5g-128gb",
        'sku' => "JC-PIX-8A-01",
        'cat' => $catMobiles,
        'brand' => $brands['google'],
        'price' => 52999,
        'salePrice' => 47999,
        'stock' => 8,
        'warranty' => "1 Year Google India Warranty",
        'shortDesc' => "Google Tensor G3, 120Hz Actua OLED display, AI photography with Audio Magic Eraser & Circle to Search.",
        'description' => "The AI-packed phone that delivers flagship Pixel camera quality, all-day battery, and IP67 water resistance at an accessible price.",
        'img' => "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 1,
        'isGamingDeal' => 0,
        'isNew' => 1,
        'specs' => json_encode(["Display" => "6.1-inch Actua OLED 120Hz", "Processor" => "Google Tensor G3", "RAM" => "8GB", "Storage" => "128GB", "Camera" => "64MP Quad PD + 13MP Ultrawide"])
    ],

    // INTEL
    [
        'name' => "Intel Core i7-14700K Desktop Processor (20 Cores / 28 Threads, Up to 5.6 GHz)",
        'slug' => "intel-core-i7-14700k-desktop-processor",
        'sku' => "JC-CPU-14700K",
        'cat' => $catCPUs,
        'brand' => $brands['intel'],
        'price' => 39990,
        'salePrice' => 36490,
        'stock' => 15,
        'warranty' => "3 Years Intel Brand Warranty",
        'shortDesc' => "20 Cores (8 P-cores + 12 E-cores), Up to 5.6 GHz, LGA1700 Socket, PCIe 5.0 & DDR5 Support.",
        'description' => "14th Gen Intel Core i7 desktop processor designed for demanding creators, video editors, and high-FPS gaming enthusiasts.",
        'img' => "https://images.unsplash.com/photo-1555618568-9a3d4608c0ff?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 1,
        'isGamingDeal' => 1,
        'isNew' => 1,
        'specs' => json_encode(["Socket" => "LGA1700", "Total Cores" => "20 (8 Performance + 12 Efficient)", "Total Threads" => "28", "Max Turbo" => "5.60 GHz", "Intel Smart Cache" => "33 MB", "Memory" => "DDR5-5600 & DDR4-3200"])
    ],
    [
        'name' => "Intel Core i5-14400F Desktop Processor (10 Cores / 16 Threads)",
        'slug' => "intel-core-i5-14400f-desktop-processor",
        'sku' => "JC-CPU-14400F",
        'cat' => $catCPUs,
        'brand' => $brands['intel'],
        'price' => 19990,
        'salePrice' => 16990,
        'stock' => 18,
        'warranty' => "3 Years Intel Brand Warranty with Cooler",
        'shortDesc' => "10 Cores (6 P-cores + 4 E-cores), Up to 4.7 GHz, Intel Laminar RM1 Cooler Included.",
        'description' => "Best budget value gaming CPU. Exceptional multi-tasking and gaming performance for mainstream PC builds.",
        'img' => "https://images.unsplash.com/photo-1555618568-9a3d4608c0ff?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 1,
        'isGamingDeal' => 0,
        'isNew' => 0,
        'specs' => json_encode(["Socket" => "LGA1700", "Cores" => "10 (6P + 4E)", "Threads" => "16", "Max Turbo" => "4.70 GHz", "Included Cooler" => "Intel Laminar RM1", "TDP" => "65W"])
    ],

    // LOGITECH
    [
        'name' => "Logitech G502 X PLUS Wireless RGB Gaming Mouse (HERO 25K Sensor, LIGHTFORCE Switches)",
        'slug' => "logitech-g502-x-plus-wireless",
        'sku' => "JC-ACC-G502X",
        'cat' => $catAccessories,
        'brand' => $brands['logitech'],
        'price' => 15495,
        'salePrice' => 12995,
        'stock' => 18,
        'warranty' => "2 Years Logitech Brand Warranty",
        'shortDesc' => "LIGHTFORCE Hybrid Switches, HERO 25K Sensor, LIGHTSPEED Wireless, LIGHTSYNC 8-Zone RGB.",
        'description' => "The world's most popular gaming mouse, reimagined and redesigned with hybrid optical-mechanical switches for speed and reliability.",
        'img' => "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 1,
        'isBestseller' => 1,
        'isGamingDeal' => 1,
        'isNew' => 0,
        'specs' => json_encode(["Sensor" => "HERO 25K (100 – 25,600 DPI)", "Switches" => "LIGHTFORCE Optical-Mechanical", "Battery Life" => "Up to 120 hours (RGB off) / 37 hours (RGB on)", "Weight" => "106 grams", "Buttons" => "13 Programmable"])
    ],
    [
        'name' => "Logitech MX Master 3S Advanced Wireless Performance Mouse (Quiet Clicks, 8K DPI)",
        'slug' => "logitech-mx-master-3s-mouse",
        'sku' => "JC-ACC-MX3S",
        'cat' => $catAccessories,
        'brand' => $brands['logitech'],
        'price' => 10995,
        'salePrice' => 9495,
        'stock' => 15,
        'warranty' => "1 Year Logitech Brand Warranty",
        'shortDesc' => "MagSpeed Electromagnetic Scrolling, 8,000 DPI Any-Surface Tracking, Quiet Click Tech, Bluetooth & USB-C.",
        'description' => "An icon remastered for ultimate productivity. Features quiet clicks, 8K DPI glass tracking, and MagSpeed scroll wheel that scrolls 1,000 lines in 1 second.",
        'img' => "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 1,
        'isGamingDeal' => 0,
        'isNew' => 1,
        'specs' => json_encode(["Sensor" => "Darkfield High Precision (8,000 DPI)", "Scroll Wheel" => "MagSpeed Electromagnetic", "Multi-Device" => "Pair up to 3 computers with Logitech Flow", "Battery" => "Up to 70 days per charge"])
    ],

    // MSI
    [
        'name' => "MSI GeForce RTX 4070 Super 12GB Gaming X Slim GDDR6X Graphics Card",
        'slug' => "msi-geforce-rtx-4070-super-12gb",
        'sku' => "JC-GPU-4070S",
        'cat' => $catGPUs,
        'brand' => $brands['msi'],
        'price' => 68990,
        'salePrice' => 63990,
        'stock' => 8,
        'warranty' => "3 Years MSI Brand Warranty",
        'shortDesc' => "12GB GDDR6X, DLSS 3.5, Ada Lovelace Architecture, TRI FROZR 3 Thermal Design, RGB Mystic Light.",
        'description' => "Supercharged gaming and creative performance with full Ray Tracing, AI-accelerated rendering, and ultra-efficient TRI FROZR 3 cooling with TORX Fan 5.0.",
        'img' => "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 1,
        'isBestseller' => 1,
        'isGamingDeal' => 1,
        'isNew' => 0,
        'specs' => json_encode(["Memory" => "12GB GDDR6X (192-bit)", "CUDA Cores" => "7168", "Boost Clock" => "2640 MHz", "Power Connectors" => "1x 16-pin 12VHPWR", "Display Outputs" => "3x DisplayPort 1.4a, 1x HDMI 2.1a"])
    ],
    [
        'name' => "MSI MAG B650 TOMAHAWK WIFI AM5 Gaming Motherboard",
        'slug' => "msi-mag-b650-tomahawk-wifi-motherboard",
        'sku' => "JC-MB-B650-TOM",
        'cat' => $catAccessories,
        'brand' => $brands['msi'],
        'price' => 24990,
        'salePrice' => 21990,
        'stock' => 10,
        'warranty' => "3 Years MSI Brand Warranty",
        'shortDesc' => "Supports AMD Ryzen 7000/8000/9000 Series, 14+2+1 Duet Rail VRM Power, DDR5 7600+ MHz (OC), Wi-Fi 6E.",
        'description' => "Built for hardcore gamers with extended heatsink design, M.2 Shield Frozr, lightning PCIe 4.0 M.2 slots, and 2.5G LAN + Wi-Fi 6E.",
        'img' => "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 0,
        'isGamingDeal' => 0,
        'isNew' => 1,
        'specs' => json_encode(["Socket" => "AMD AM5", "VRM" => "14+2+1 Phase Direct Power", "RAM Slots" => "4x DDR5 Up to 192GB", "Networking" => "Wi-Fi 6E + Realtek 2.5G LAN", "Audio" => "Realtek ALC4080 Codec"])
    ],

    // NVIDIA
    [
        'name' => "NVIDIA GeForce RTX 4080 Super 16GB Founders Edition / Custom Graphics Card",
        'slug' => "nvidia-geforce-rtx-4080-super-16gb",
        'sku' => "JC-GPU-4080S",
        'cat' => $catGPUs,
        'brand' => $brands['nvidia'],
        'price' => 108990,
        'salePrice' => 99990,
        'stock' => 4,
        'warranty' => "3 Years Official Warranty",
        'shortDesc' => "16GB GDDR6X, 10,240 CUDA Cores, 4K High-FPS Ultra Gaming, 3rd Gen RT Cores, 4th Gen Tensor Cores with DLSS 3.5 Frame Gen.",
        'description' => "Bring your games and creative projects to life with supercharged ray tracing and AI graphics powered by NVIDIA Ada Lovelace architecture and 16GB of blazingly fast G6X memory.",
        'img' => "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 1,
        'isBestseller' => 1,
        'isGamingDeal' => 1,
        'isNew' => 1,
        'specs' => json_encode(["VRAM" => "16GB GDDR6X (256-bit)", "CUDA Cores" => "10,240", "Tensor Cores" => "4th Gen AI Acceleration", "Ray Tracing" => "3rd Gen RT Cores", "Recommended PSU" => "750W / 850W"])
    ],
    [
        'name' => "NVIDIA GeForce RTX 4060 Ti 8GB Dual-Fan Graphics Card",
        'slug' => "nvidia-geforce-rtx-4060-ti-8gb",
        'sku' => "JC-GPU-4060TI",
        'cat' => $catGPUs,
        'brand' => $brands['nvidia'],
        'price' => 43990,
        'salePrice' => 38990,
        'stock' => 10,
        'warranty' => "3 Years Official Warranty",
        'shortDesc' => "8GB GDDR6, 1080p / 1440p Max Settings Gaming, Full DLSS 3 AI Frame Generation, Low 160W Power Draw.",
        'description' => "Play latest blockbuster games with high frame rates and full Ray Tracing at 1080p and 1440p with extreme power efficiency.",
        'img' => "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 1,
        'isGamingDeal' => 1,
        'isNew' => 0,
        'specs' => json_encode(["VRAM" => "8GB GDDR6 (128-bit)", "CUDA Cores" => "4352", "TGP" => "160W", "Architecture" => "Ada Lovelace", "Outputs" => "DisplayPort 1.4a x 3, HDMI 2.1a x 1"])
    ],

    // ONEPLUS
    [
        'name' => "OnePlus 12 5G (16GB RAM, 512GB Storage, Silky Black)",
        'slug' => "oneplus-12-5g-16gb-512gb",
        'sku' => "JC-OP-12-512",
        'cat' => $catMobiles,
        'brand' => $brands['oneplus'],
        'price' => 69999,
        'salePrice' => 64999,
        'stock' => 7,
        'warranty' => "1 Year OnePlus India Warranty",
        'shortDesc' => "Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera, 2K 120Hz ProXDR Display, 100W SUPERVOOC Fast Charging.",
        'description' => "Experience smooth beyond belief with Snapdragon 8 Gen 3, custom Dual Cryo-velocity VC cooling, and revolutionary 4th Gen Hasselblad Camera System with 64MP periscope telephoto.",
        'img' => "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 1,
        'isBestseller' => 1,
        'isGamingDeal' => 0,
        'isNew' => 1,
        'specs' => json_encode(["Processor" => "Qualcomm Snapdragon 8 Gen 3", "Display" => "6.82-inch 2K 120Hz ProXDR AMOLED (4500 nits peak)", "RAM / ROM" => "16GB LPDDR5X / 512GB UFS 4.0", "Battery / Charging" => "5400 mAh with 100W Wired + 50W AIRVOOC", "Camera" => "50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultrawide"])
    ],
    [
        'name' => "OnePlus Nord 4 5G (12GB RAM, 256GB Storage, Mercurial Silver)",
        'slug' => "oneplus-nord-4-5g-256gb",
        'sku' => "JC-OP-NORD4",
        'cat' => $catMobiles,
        'brand' => $brands['oneplus'],
        'price' => 32999,
        'salePrice' => 29999,
        'stock' => 12,
        'warranty' => "1 Year OnePlus India Warranty",
        'shortDesc' => "Full Metal Unibody Design, Snapdragon 7+ Gen 3, 5500 mAh Battery with 100W SUPERVOOC, 6 Years Software Support.",
        'description' => "The only all-metal unibody 5G smartphone in the market with incredible battery life, ultra-fast 100W charging, and 6 years of guaranteed software updates.",
        'img' => "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
        'isFeatured' => 0,
        'isBestseller' => 1,
        'isGamingDeal' => 0,
        'isNew' => 1,
        'specs' => json_encode(["Design" => "All-Metal Unibody", "Processor" => "Snapdragon 7+ Gen 3", "Display" => "6.74-inch 1.5K 120Hz AMOLED", "Battery" => "5500 mAh (100W Flash Charge)", "OS Updates" => "4 Years Android + 6 Years Security"])
    ],
];

$inserted = 0;
$updated = 0;

$checkStmt = $db->prepare("SELECT id FROM Product WHERE slug = ?");
$updateStmt = $db->prepare("UPDATE Product SET name = ?, sku = ?, price = ?, salePrice = ?, stock = ?, inStock = 1, warranty = ?, shortDesc = ?, description = ?, categoryId = ?, brandId = ?, isFeatured = ?, isBestseller = ?, isNewArrival = ?, isGamingDeal = ?, specsJson = ?, updatedAt = ? WHERE id = ?");
$insertStmt = $db->prepare("INSERT INTO Product (id, name, slug, sku, price, salePrice, stock, inStock, warranty, shortDesc, description, categoryId, brandId, isFeatured, isBestseller, isNewArrival, isGamingDeal, specsJson, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$imgCheckStmt = $db->prepare("SELECT id FROM ProductImage WHERE productId = ?");
$imgInsertStmt = $db->prepare("INSERT INTO ProductImage (id, productId, url, isPrimary, `order`) VALUES (?, ?, ?, 1, 0)");

foreach ($products as $p) {
    $checkStmt->execute([$p['slug']]);
    $existingId = $checkStmt->fetchColumn();
    $now = date('Y-m-d H:i:s');

    if ($existingId) {
        $updateStmt->execute([
            $p['name'],
            $p['sku'],
            $p['price'],
            $p['salePrice'],
            $p['stock'],
            $p['warranty'],
            $p['shortDesc'],
            $p['description'],
            $p['cat'],
            $p['brand'],
            $p['isFeatured'],
            $p['isBestseller'],
            $p['isNew'],
            $p['isGamingDeal'],
            $p['specs'],
            $now,
            $existingId
        ]);
        $prodId = $existingId;
        $updated++;
    } else {
        $prodId = 'prod_' . bin2hex(random_bytes(6));
        $insertStmt->execute([
            $prodId,
            $p['name'],
            $p['slug'],
            $p['sku'],
            $p['price'],
            $p['salePrice'],
            $p['stock'],
            $p['warranty'],
            $p['shortDesc'],
            $p['description'],
            $p['cat'],
            $p['brand'],
            $p['isFeatured'],
            $p['isBestseller'],
            $p['isNew'],
            $p['isGamingDeal'],
            $p['specs'],
            $now,
            $now
        ]);
        $inserted++;
    }

    // Insert Image
    $imgCheckStmt->execute([$prodId]);
    if (!$imgCheckStmt->fetchColumn()) {
        $imgId = 'img_' . bin2hex(random_bytes(6));
        $imgInsertStmt->execute([$imgId, $prodId, $p['img']]);
    }
}

echo "✅ Seeding Complete!\n";
echo "📊 Newly Inserted: $inserted products\n";
echo "🔄 Updated Existing: $updated products\n";

// Show summary counts by brand
echo "\n--- Brand Product Counts ---\n";
$summary = $db->query("SELECT b.name as brand, COUNT(p.id) as count FROM Brand b LEFT JOIN Product p ON p.brandId = b.id GROUP BY b.id ORDER BY count DESC, b.name ASC")->fetchAll(PDO::FETCH_ASSOC);
foreach ($summary as $row) {
    echo "• " . str_pad($row['brand'], 15) . ": " . $row['count'] . " products\n";
}
