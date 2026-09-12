<?php
$pageTitle = 'Products Catalog Management';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';

$db = getDB();
$message = '';
$error = '';

// Handle Product Add / Edit / Delete
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'delete') {
        $id = $_POST['id'] ?? '';
        if ($id) {
            $stmt = $db->prepare('DELETE FROM "Product" WHERE id = ?');
            $stmt->execute([$id]);
            $message = 'Product deleted successfully.';
        }
    } else if ($action === 'save') {
        $id = trim($_POST['id'] ?? '');
        $name = trim($_POST['name'] ?? '');
        $slug = trim($_POST['slug'] ?? '') ?: strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name));
        $price = floatval($_POST['price'] ?? 0);
        $salePrice = !empty($_POST['salePrice']) ? floatval($_POST['salePrice']) : null;
        $stock = intval($_POST['stock'] ?? 10);
        $inStock = isset($_POST['inStock']) ? 1 : 0;
        $categoryId = trim($_POST['categoryId'] ?? '');
        $brandId = !empty($_POST['brandId']) ? trim($_POST['brandId']) : null;
        $description = trim($_POST['description'] ?? '');
        $shortDesc = trim($_POST['shortDesc'] ?? '');
        $warranty = trim($_POST['warranty'] ?? '1 Year Brand Warranty');
        $isFeatured = isset($_POST['isFeatured']) ? 1 : 0;
        $isBestseller = isset($_POST['isBestseller']) ? 1 : 0;
        $imageUrl = trim($_POST['imageUrl'] ?? '');
        $now = date('Y-m-d H:i:s');

        if (empty($name) || empty($price) || empty($categoryId)) {
            $error = 'Product name, price, and category are required.';
        } else {
            if ($id) {
                // Update
                $stmt = $db->prepare('UPDATE "Product" SET name = ?, slug = ?, price = ?, salePrice = ?, stock = ?, inStock = ?, categoryId = ?, brandId = ?, description = ?, shortDesc = ?, warranty = ?, isFeatured = ?, isBestseller = ?, updatedAt = ? WHERE id = ?');
                $stmt->execute([$name, $slug, $price, $salePrice, $stock, $inStock, $categoryId, $brandId, $description, $shortDesc, $warranty, $isFeatured, $isBestseller, $now, $id]);
                $message = 'Product updated successfully.';
            } else {
                // Insert
                $id = 'prd_' . bin2hex(random_bytes(8));
                $stmt = $db->prepare('INSERT INTO "Product" (id, name, slug, price, salePrice, stock, inStock, categoryId, brandId, description, shortDesc, warranty, isFeatured, isBestseller, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([$id, $name, $slug, $price, $salePrice, $stock, $inStock, $categoryId, $brandId, $description, $shortDesc, $warranty, $isFeatured, $isBestseller, $now, $now]);
                
                if ($imageUrl) {
                    $imgId = 'img_' . bin2hex(random_bytes(8));
                    $imgStmt = $db->prepare('INSERT INTO "ProductImage" (id, url, "order", productId) VALUES (?, ?, 0, ?)');
                    $imgStmt->execute([$imgId, $imageUrl, $id]);
                }
                $message = 'New product created successfully.';
            }
        }
    }
}

$categories = $db->query('SELECT * FROM "Category" ORDER BY name ASC')->fetchAll();
$brands = $db->query('SELECT * FROM "Brand" ORDER BY name ASC')->fetchAll();
$products = $db->query('SELECT p.*, c.name as categoryName, b.name as brandName, (SELECT url FROM "ProductImage" WHERE productId = p.id ORDER BY "order" ASC LIMIT 1) as mainImage FROM "Product" p JOIN "Category" c ON p.categoryId = c.id LEFT JOIN "Brand" b ON p.brandId = b.id ORDER BY p.createdAt DESC')->fetchAll();
?>

<div>
  <?php if ($message): ?>
    <div style="background: #dcfce7; border: 1px solid #86efac; color: #166534; padding: 12px 18px; border-radius: 8px; font-weight: 700; margin-bottom: 20px;">
      ✓ <?= $message ?>
    </div>
  <?php endif; ?>
  <?php if ($error): ?>
    <div style="background: #fef2f2; border: 1px solid #f87171; color: #991b1b; padding: 12px 18px; border-radius: 8px; font-weight: 700; margin-bottom: 20px;">
      ⚠️ <?= $error ?>
    </div>
  <?php endif; ?>

  <!-- Add / Edit Product Card -->
  <div id="productFormCard" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 32px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h3 id="formTitle" style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0;">➕ Add / Create New Product</h3>
      <button id="cancelEditBtn" type="button" onclick="resetProductForm()" style="display: none; padding: 6px 14px; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer;">
        ✕ Cancel Edit (New Product)
      </button>
    </div>

    <form id="productForm" method="POST" action="/admin/products.php" style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; align-items: start;">
      <input type="hidden" name="action" value="save">
      <input type="hidden" id="prodId" name="id" value="">
      <input type="hidden" id="prodSlug" name="slug" value="">
      
      <div>
        <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px;">Product Title *</label>
        <input type="text" id="prodName" name="name" required placeholder="e.g. ASUS ROG Strix GeForce RTX 4070 Ti 12GB" style="width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
      </div>

      <div>
        <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px;">Selling Price (₹) *</label>
        <input type="number" step="any" id="prodPrice" name="price" required placeholder="79999" style="width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
      </div>

      <div>
        <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px;">MRP / Strike Price (₹)</label>
        <input type="number" step="any" id="prodSalePrice" name="salePrice" placeholder="89999" style="width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
      </div>

      <div>
        <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px;">Category *</label>
        <select id="prodCategory" name="categoryId" required style="width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
          <?php foreach ($categories as $cat): ?>
            <option value="<?= htmlspecialchars($cat['id']) ?>"><?= htmlspecialchars($cat['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div>
        <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px;">Brand</label>
        <select id="prodBrand" name="brandId" style="width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
          <option value="">None / Generic</option>
          <?php foreach ($brands as $b): ?>
            <option value="<?= htmlspecialchars($b['id']) ?>"><?= htmlspecialchars($b['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div>
        <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px;">Stock Units</label>
        <input type="number" id="prodStock" name="stock" value="10" style="width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
      </div>

      <div style="grid-column: 1 / -1;">
        <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px;">Image URL / Path</label>
        <input type="text" id="prodImage" name="imageUrl" placeholder="https://images.unsplash.com/... or /public/images/..." style="width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
      </div>

      <div style="grid-column: 1 / -1;">
        <label style="display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 4px;">Description</label>
        <textarea id="prodDesc" name="description" rows="2" placeholder="Full product specifications and warranty details..." style="width: 100%; padding: 10px 12px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box;"></textarea>
      </div>

      <div style="grid-column: 1 / -1; display: flex; gap: 20px; align-items: center;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;">
          <input type="checkbox" id="prodInStock" name="inStock" checked> In Stock
        </label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;">
          <input type="checkbox" id="prodFeatured" name="isFeatured" checked> Featured on Home
        </label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;">
          <input type="checkbox" id="prodBestseller" name="isBestseller"> Bestseller Tag
        </label>

        <button id="submitBtn" type="submit" style="margin-left: auto; padding: 10px 24px; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer;">
          Save & Publish Product
        </button>
      </div>

    </form>
  </div>

  <!-- Products Table -->
  <div style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0;">Active Products Catalog (<?= count($products) ?>)</h2>
      <input type="text" id="tableSearch" placeholder="🔍 Search products by name, brand, category..." oninput="filterTable()" style="padding: 8px 14px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; width: 320px;">
    </div>

    <div style="overflow-x: auto;">
      <table id="productsTable" style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid #f1f5f9; color: #64748b;">
            <th style="padding: 12px 10px;">IMAGE</th>
            <th style="padding: 12px 10px;">PRODUCT NAME</th>
            <th style="padding: 12px 10px;">BRAND</th>
            <th style="padding: 12px 10px;">CATEGORY</th>
            <th style="padding: 12px 10px;">PRICE</th>
            <th style="padding: 12px 10px;">STOCK</th>
            <th style="padding: 12px 10px; text-align: right;">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($products as $p): ?>
            <tr class="product-row" style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px;">
                <img src="<?= htmlspecialchars($p['mainImage'] ?: '/public/images/tech-sprout-logo.png') ?>" alt="" style="width: 44px; height: 44px; object-fit: contain; border-radius: 6px; border: 1px solid #e2e8f0; background: white;">
              </td>
              <td style="padding: 10px;">
                <a href="/product-detail.php?slug=<?= urlencode($p['slug']) ?>" target="_blank" style="font-weight: 700; color: #0f172a; text-decoration: none;">
                  <?= htmlspecialchars($p['name']) ?> ↗
                </a>
                <div style="font-size: 11px; color: #94a3b8;">SKU: <?= htmlspecialchars($p['sku'] ?? 'N/A') ?></div>
              </td>
              <td style="padding: 10px;">
                <span style="font-weight: 700; color: #1e293b; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-size: 11px;">
                  <?= htmlspecialchars($p['brandName'] ?: 'Generic') ?>
                </span>
              </td>
              <td style="padding: 10px; color: #475569; font-weight: 600;"><?= htmlspecialchars($p['categoryName']) ?></td>
              <td style="padding: 10px; font-weight: 800; color: #0f172a;"><?= formatPrice($p['price']) ?></td>
              <td style="padding: 10px;">
                <span style="padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; background: <?= $p['inStock'] ? '#dcfce7; color: #16a34a;' : '#fee2e2; color: #dc2626;' ?>">
                  <?= $p['inStock'] ? ($p['stock'] . ' in stock') : 'Out of Stock' ?>
                </span>
              </td>
              <td style="padding: 10px; text-align: right; white-space: nowrap;">
                <button type="button" 
                  data-prod='<?= htmlspecialchars(json_encode([
                    'id' => $p['id'],
                    'name' => $p['name'],
                    'slug' => $p['slug'],
                    'price' => $p['price'],
                    'salePrice' => $p['salePrice'],
                    'stock' => $p['stock'],
                    'inStock' => (bool)$p['inStock'],
                    'categoryId' => $p['categoryId'],
                    'brandId' => $p['brandId'],
                    'description' => $p['description'],
                    'isFeatured' => (bool)$p['isFeatured'],
                    'isBestseller' => (bool)$p['isBestseller'],
                    'imageUrl' => $p['mainImage']
                  ]), ENT_QUOTES, 'UTF-8') ?>' 
                  onclick="editProduct(this)" 
                  style="padding: 6px 12px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 6px; font-weight: 700; font-size: 11px; cursor: pointer; margin-right: 6px;">
                  ✏️ Edit
                </button>
                <form method="POST" action="/admin/products.php" onsubmit="return confirm('Are you sure you want to delete <?= htmlspecialchars(addslashes($p['name'])) ?>?')" style="display: inline-block;">
                  <input type="hidden" name="action" value="delete">
                  <input type="hidden" name="id" value="<?= htmlspecialchars($p['id']) ?>">
                  <button type="submit" style="padding: 6px 12px; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; border-radius: 6px; font-weight: 700; font-size: 11px; cursor: pointer;">
                    🗑️ Delete
                  </button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script>
function editProduct(btn) {
  try {
    const data = JSON.parse(btn.getAttribute('data-prod'));
    document.getElementById('formTitle').innerHTML = '✏️ Edit Product: <span style="color: #2563eb;">' + data.name + '</span>';
    document.getElementById('prodId').value = data.id || '';
    document.getElementById('prodSlug').value = data.slug || '';
    document.getElementById('prodName').value = data.name || '';
    document.getElementById('prodPrice').value = data.price || '';
    document.getElementById('prodSalePrice').value = data.salePrice || '';
    document.getElementById('prodCategory').value = data.categoryId || '';
    document.getElementById('prodBrand').value = data.brandId || '';
    document.getElementById('prodStock').value = data.stock !== undefined ? data.stock : 10;
    document.getElementById('prodImage').value = data.imageUrl || '';
    document.getElementById('prodDesc').value = data.description || '';
    document.getElementById('prodInStock').checked = Boolean(data.inStock);
    document.getElementById('prodFeatured').checked = Boolean(data.isFeatured);
    document.getElementById('prodBestseller').checked = Boolean(data.isBestseller);
    document.getElementById('submitBtn').innerText = 'Update Product Details';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    
    // Smooth scroll to form
    document.getElementById('productFormCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    console.error("Error editing product:", e);
  }
}

function resetProductForm() {
  document.getElementById('formTitle').innerText = '➕ Add / Create New Product';
  document.getElementById('prodId').value = '';
  document.getElementById('prodSlug').value = '';
  document.getElementById('productForm').reset();
  document.getElementById('submitBtn').innerText = 'Save & Publish Product';
  document.getElementById('cancelEditBtn').style.display = 'none';
}

function filterTable() {
  const query = document.getElementById('tableSearch').value.toLowerCase().trim();
  const rows = document.querySelectorAll('.product-row');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
