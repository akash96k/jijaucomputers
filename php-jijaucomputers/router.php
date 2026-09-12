<?php
// Local Development Router for PHP Built-in Server (php -S)
// Matches Apache .htaccess rewrite rules locally

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $uri;

// 1. If static file exists (css, js, images, uploads), serve directly
if ($uri !== '/' && file_exists($file) && !is_dir($file)) {
    return false;
}

// 2. If clean URL matches a .php file (e.g. /products -> /products.php)
if ($uri !== '/' && file_exists(__DIR__ . $uri . '.php')) {
    require __DIR__ . $uri . '.php';
    exit;
}

// 3. Admin clean routes (e.g. /admin/login -> /admin/login.php)
if (str_starts_with($uri, '/admin/') && file_exists(__DIR__ . $uri . '.php')) {
    require __DIR__ . $uri . '.php';
    exit;
}

// 4. Fallback to index.php
require __DIR__ . '/index.php';
