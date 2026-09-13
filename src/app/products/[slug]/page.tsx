import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloating from "@/components/layout/WhatsAppFloating";
import CartDrawer from "@/components/layout/CartDrawer";
import ProductCard from "@/components/products/ProductCard";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true },
      take: 50,
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) return { title: "Product Not Found | Jijau Computers" };

  return {
    title: `${product.name} - Price & Specs | Jijau Computers`,
    description: product.shortDesc || product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (product) {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          inStock: true,
        },
        take: 4,
        include: {
          category: true,
          brand: true,
          images: { orderBy: { order: "asc" } },
        },
      });
    }
  } catch (err) {
    console.error("Product detail fetch error:", err);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      <CartDrawer />
      <WhatsAppFloating />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-6 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-blue-600 transition-colors shrink-0">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors shrink-0">
            Products
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-blue-600 transition-colors shrink-0"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Product Details Client Component */}
        <ProductDetailClient product={product as any} />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
                  Similar Hardware
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Related Products
                </h2>
              </div>
              <Link
                href={`/products?category=${product.category?.slug}`}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View Category
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel as any} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
