import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloating from "@/components/layout/WhatsAppFloating";
import CartDrawer from "@/components/layout/CartDrawer";
import ProductCard from "@/components/products/ProductCard";
import OffersClient from "./OffersClient";

export const revalidate = 60;

export default async function OffersPage() {
  let offers: any[] = [];
  let gamingDeals: any[] = [];
  let laptopsOnSale: any[] = [];

  try {
    const res = await Promise.all([
      prisma.offer.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { isGamingDeal: true, inStock: true },
        include: { category: true, brand: true, images: { orderBy: { order: "asc" } } },
      }),
      prisma.product.findMany({
        where: { category: { slug: "laptops" }, inStock: true },
        take: 4,
        include: { category: true, brand: true, images: { orderBy: { order: "asc" } } },
      }),
    ]);
    offers = res[0] || [];
    gamingDeals = res[1] || [];
    laptopsOnSale = res[2] || [];
  } catch (err) {
    console.error("Offers page fetch error:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      <CartDrawer />
      <WhatsAppFloating />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-600 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-500/30">
            <span>Exclusive Savings & Promo Coupons</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Special Offers & Festival Deals
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Enjoy instant discounts, combo upgrades, and seasonal coupons on laptops, custom gaming PCs, and hardware components.
          </p>
        </div>

        {/* Offers Cards with 1-Click Coupon Copy */}
        <OffersClient offers={offers as any} />

        {/* Flash Discount Hardware Grid */}
        <section className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                Highest Discount
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Featured Hardware & Laptop Deals
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Browse All Products
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {gamingDeals.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
