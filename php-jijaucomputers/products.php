<?php
require_once __DIR__ . '/includes/functions.php';

$db = getDB();

// Get filters
$categorySlug = trim($_GET['category'] ?? '');
$brandSlug = trim($_GET['brand'] ?? '');
$searchQuery = trim($_GET['search'] ?? '');
$sort = trim($_GET['sort'] ?? 'featured');

// Base query
$sql = 'SELECT p.*, c.name as categoryName, c.slug as categorySlug, b.name as brandName, b.slug as brandSlug, 
        (SELECT url FROM "ProductImage" WHERE productId = p.id ORDER BY "order" ASC LIMIT 1) as mainImage,
        (SELECT COUNT(*) FROM "Review" WHERE productId = p.id AND isApproved = 1) as reviewCount,
        (SELECT AVG(rating) FROM "Review" WHERE productId = p.id AND isApproved = 1) as avgRating
        FROM "Product" p 
        JOIN "Category" c ON p.categoryId = c.id 
        LEFT JOIN "Brand" b ON p.brandId = b.id 
        WHERE 1=1';

$params = [];

if ($categorySlug) {
    $catSlugLower = strtolower($categorySlug);
    $catSingular = rtrim($catSlugLower, 's');
    $sql .= ' AND (lower(c.slug) = ? OR lower(c.slug) = ? OR lower(c.name) LIKE ?)';
    $params[] = $catSlugLower;
    $params[] = $catSingular;
    $params[] = '%' . $catSingular . '%';
}

if ($brandSlug) {
    $brandLower = strtolower($brandSlug);
    $sql .= ' AND (lower(b.slug) = ? OR lower(b.name) LIKE ?)';
    $params[] = $brandLower;
    $params[] = '%' . $brandLower . '%';
}

if ($searchQuery) {
    $sql .= ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
    $params[] = '%' . $searchQuery . '%';
    $params[] = '%' . $searchQuery . '%';
    $params[] = '%' . $searchQuery . '%';
}

// Sorting
if ($sort === 'price-low') {
    $sql .= ' ORDER BY p.price ASC';
} elseif ($sort === 'price-high') {
    $sql .= ' ORDER BY p.price DESC';
} elseif ($sort === 'newest') {
    $sql .= ' ORDER BY p.createdAt DESC';
} else {
    $sql .= ' ORDER BY p.isFeatured DESC, p.createdAt DESC';
}

$stmt = $db->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

// Categories & Brands for sidebar
$categories = $db->query('SELECT c.*, (SELECT COUNT(*) FROM "Product" WHERE categoryId = c.id) as productCount FROM "Category" c ORDER BY name ASC')->fetchAll();
$brands = $db->query('SELECT b.*, (SELECT COUNT(*) FROM "Product" WHERE brandId = b.id) as productCount FROM "Brand" b ORDER BY name ASC')->fetchAll();

$pageTitle = ($categorySlug ? ucfirst(str_replace('-', ' ', $categorySlug)) . ' - ' : '') . 'Hardware Catalog | ' . ($storeSettings['storeName'] ?? 'Jijau Computers');
require_once __DIR__ . '/includes/header.php';
?>

<div class="products-catalog-page" style="padding: 32px 0 60px; background: #f8fafc; min-height: 80vh;">
  <div class="container" style="max-width: 1320px; margin: 0 auto; padding: 0 16px;">
    
    <!-- Top Breadcrumb & Header -->
    <div style="margin-bottom: 24px;">
      <div style="font-size: 13px; color: #64748b; margin-bottom: 6px;">
        <a href="/" style="color: #64748b; text-decoration: none;">Home</a> / <span style="color: #0f172a; font-weight: 700;">Products Catalog</span>
        <?php if ($categorySlug): ?> / <span style="color: #2563eb; font-weight: 700;"><?= htmlspecialchars(ucfirst(str_replace('-', ' ', $categorySlug))) ?></span><?php endif; ?>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0;">
          <?= $searchQuery ? 'Results for "' . htmlspecialchars($searchQuery) . '"' : ($categorySlug ? ucfirst(str_replace('-', ' ', $categorySlug)) : 'All Hardware & Components') ?>
          <span style="font-size: 16px; color: #64748b; font-weight: 600;">(<?= count($products) ?> items)</span>
        </h1>

        <!-- Sorting Selector -->
        <form method="GET" action="/products" style="display: flex; align-items: center; gap: 8px;">
          <?php if ($categorySlug): ?><input type="hidden" name="category" value="<?= htmlspecialchars($categorySlug) ?>"><?php endif; ?>
          <?php if ($brandSlug): ?><input type="hidden" name="brand" value="<?= htmlspecialchars($brandSlug) ?>"><?php endif; ?>
          <?php if ($searchQuery): ?><input type="hidden" name="search" value="<?= htmlspecialchars($searchQuery) ?>"><?php endif; ?>
          <label style="font-size: 13px; font-weight: 600; color: #475569;">Sort By:</label>
          <select name="sort" onchange="this.form.submit()" style="padding: 8px 12px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none; background: white;">
            <option value="featured" <?= $sort === 'featured' ? 'selected' : '' ?>>Featured First</option>
            <option value="price-low" <?= $sort === 'price-low' ? 'selected' : '' ?>>Price: Low to High</option>
            <option value="price-high" <?= $sort === 'price-high' ? 'selected' : '' ?>>Price: High to Low</option>
            <option value="newest" <?= $sort === 'newest' ? 'selected' : '' ?>>Newest Arrivals</option>
          </select>
        </form>
      </div>
    </div>

    <!-- Main Layout: Sidebar on Left, Products on Right -->
    <div style="display: grid; grid-template-columns: 260px 1fr; gap: 32px; align-items: start;">
      
      <!-- Filter Sidebar -->
      <aside style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
          <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0;">Filters</h2>
          <?php if ($categorySlug || $brandSlug || $searchQuery): ?>
            <a href="/products" style="font-size: 12px; color: #ef4444; font-weight: 700; text-decoration: none;">Clear All</a>
          <?php endif; ?>
        </div>

        <!-- Categories Filter -->
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase; margin: 0 0 12px; letter-spacing: 0.5px;">Categories</h3>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
            <a href="/products<?= $brandSlug ? '?brand=' . urlencode($brandSlug) : '' ?>" style="color: <?= empty($categorySlug) ? '#2563eb; font-weight: 700;' : '#334155;' ?> text-decoration: none; display: flex; justify-content: space-between;">
              <span>All Categories</span>
            </a>
            <?php foreach ($categories as $cat): ?>
              <a href="/products?category=<?= urlencode($cat['slug']) ?><?= $brandSlug ? '&brand=' . urlencode($brandSlug) : '' ?>" style="color: <?= ($categorySlug === $cat['slug']) ? '#2563eb; font-weight: 700;' : '#334155;' ?> text-decoration: none; display: flex; justify-content: space-between;">
                <span><?= htmlspecialchars($cat['name']) ?></span>
                <span style="color: #94a3b8; font-size: 12px;"><?= $cat['productCount'] ?></span>
              </a>
            <?php endforeach; ?>
          </div>
        </div>

        <!-- Brands Filter -->
        <div>
          <h3 style="font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase; margin: 0 0 12px; letter-spacing: 0.5px;">Brands</h3>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; max-height: 250px; overflow-y: auto;">
            <a href="/products<?= $categorySlug ? '?category=' . urlencode($categorySlug) : '' ?>" style="color: <?= empty($brandSlug) ? '#2563eb; font-weight: 700;' : '#334155;' ?> text-decoration: none;">
              All Brands
            </a>
            <?php foreach ($brands as $b): ?>
              <a href="/products?brand=<?= urlencode($b['slug']) ?><?= $categorySlug ? '&category=' . urlencode($categorySlug) : '' ?>" style="color: <?= ($brandSlug === $b['slug']) ? '#2563eb; font-weight: 700;' : '#334155;' ?> text-decoration: none; display: flex; justify-content: space-between;">
                <span><?= htmlspecialchars($b['name']) ?></span>
                <span style="color: #94a3b8; font-size: 12px;"><?= $b['productCount'] ?></span>
              </a>
            <?php endforeach; ?>
          </div>
        </div>

      </aside>

      <!-- Products Grid -->
      <div>
        <?php if (empty($products)): ?>
          <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 60px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
            <h3 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 8px;">No Products Found</h3>
            <p style="color: #64748b; font-size: 14px; margin: 0 0 20px;">We could not find any products matching your active filters. Try searching for another item or clear your filters.</p>
            <a href="/products" style="padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px;">View All Products</a>
          </div>
        <?php else: ?>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
            <?php foreach ($products as $p): ?>
              <div class="product-card" style="background: white; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 6px rgba(0,0,0,0.02); transition: transform 0.2s, box-shadow 0.2s;">
                <a href="/product-detail?slug=<?= urlencode($p['slug']) ?>" style="display: block; position: relative; padding: 24px 20px; text-align: center; background: #ffffff;">
                  <img src="<?= htmlspecialchars($p['mainImage'] ?: '/public/images/tech-sprout-logo.png') ?>" alt="<?= htmlspecialchars($p['name']) ?>" style="width: 100%; height: 180px; object-fit: contain;">
                  <?php if ($p['isBestseller']): ?>
                    <span style="position: absolute; top: 12px; left: 12px; background: #ea580c; color: white; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">Bestseller</span>
                  <?php endif; ?>
                </a>

                <div style="padding: 18px; display: flex; flex-direction: column; flex: 1;">
                  <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
                    <?= htmlspecialchars($p['brandName'] ?: $p['categoryName']) ?>
                  </div>
                  <a href="/product-detail?slug=<?= urlencode($p['slug']) ?>" style="font-size: 14px; font-weight: 700; color: #0f172a; text-decoration: none; line-height: 1.4; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    <?= htmlspecialchars($p['name']) ?>
                  </a>

                  <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <div style="font-size: 18px; font-weight: 900; color: #0f172a;"><?= formatPrice($p['price']) ?></div>
                      <?php if (!empty($p['salePrice']) && $p['salePrice'] > $p['price']): ?>
                        <div style="font-size: 11px; color: #94a3b8; text-decoration: line-through;"><?= formatPrice($p['salePrice']) ?></div>
                      <?php endif; ?>
                    </div>

                    <button onclick="addToCart('<?= $p['id'] ?>', '<?= addslashes($p['name']) ?>', <?= $p['price'] ?>, '<?= addslashes($p['mainImage'] ?? '') ?>')" style="padding: 8px 14px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                      <span>🛒 Add</span>
                    </button>
                  </div>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>

    </div>

  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
