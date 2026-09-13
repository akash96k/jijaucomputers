import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MobileBannerSlider from "@/components/home/MobileBannerSlider";
import LaptopBrandsSection from "@/components/home/LaptopBrandsSection";
import MobileBrandsSection from "@/components/home/MobileBrandsSection";
import AssembleDesktopCard from "@/components/home/AssembleDesktopCard";
import HappyCustomersBanner from "@/components/home/HappyCustomersBanner";
import AllProductsLazySection from "@/components/home/AllProductsLazySection";
import CategoryGrid from "@/components/home/CategoryGrid";
import DealsSection from "@/components/home/DealsSection";
import BrandCarousel from "@/components/home/BrandCarousel";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloating from "@/components/layout/WhatsAppFloating";
import CartDrawer from "@/components/layout/CartDrawer";

export const revalidate = 60; // Cache and revalidate every 60 seconds

export default async function HomePage() {
  let banners: any[] = [];
  let categories: any[] = [];
  let brands: any[] = [];
  let allProducts: any[] = [];
  let happyCustomers: any[] = [];

  try {
    const res = await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: { _count: { select: { products: true } } },
      }),
      prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.product.findMany({
        where: { inStock: true },
        orderBy: { createdAt: "desc" },
        include: { category: true, brand: true, images: { orderBy: { order: "asc" } } },
      }),
      prisma.happyCustomer.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 8,
      }),
    ]);

    banners = res[0] || [];
    categories = res[1] || [];
    brands = res[2] || [];
    allProducts = res[3] || [];
    happyCustomers = res[4] || [];
  } catch (err) {
    console.error("Homepage data fetch error:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      <CartDrawer />
      <WhatsAppFloating />

      <main className="flex-1 space-y-2">
        {/* 1. HOMEPAGE BANNER SLIDER */}
        <MobileBannerSlider banners={banners} />

        {/* 2. LAPTOP BRANDS SHOWCASE */}
        <LaptopBrandsSection products={allProducts as any} />

        {/* 3. MOBILES SHOWCASE */}
        <MobileBrandsSection products={allProducts as any} />

        {/* 4. ASSEMBLE A DESKTOP / CUSTOM GAMING PC RIG BANNER */}
        <AssembleDesktopCard />

        {/* 5. HAPPY CUSTOMERS SOCIAL PROOF BANNER */}
        <HappyCustomersBanner customers={happyCustomers} />

        {/* 6. ALL HARDWARE CATEGORIES BROWSER */}
        <CategoryGrid categories={categories} />

        {/* 7. ALL PRODUCTS SECTION WITH LAZY LOADING & LIVE SEARCH/FILTERS */}
        <AllProductsLazySection initialProducts={allProducts as any} categories={categories} />

        {/* 8. OFFICIAL BRAND PARTNERS */}
        <BrandCarousel brands={brands} />
      </main>

      <Footer />
    </div>
  );
}
