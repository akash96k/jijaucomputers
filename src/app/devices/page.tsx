import React from "react";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloating from "@/components/layout/WhatsAppFloating";
import CartDrawer from "@/components/layout/CartDrawer";
import DevicesClient from "./DevicesClient";

export const revalidate = 60;

export const metadata = {
  title: "Device & Brand Hub - Laptops, Mobiles, Printers & CCTV | Jijau Computers",
  description:
    "Explore Laptops (Dell, HP, ASUS, Lenovo, Apple), Mobiles (Apple, Samsung, OnePlus), Printers (HP, Epson, Canon, Brother), and CCTV Cameras (CP PLUS, Hikvision, TP-Link) at Jijau Computers.",
};

export default async function DevicesPage() {
  let categories: any[] = [];
  let products: any[] = [];
  let brands: any[] = [];

  try {
    const [fetchedCategories, fetchedProducts, fetchedBrands] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.product.findMany({
        include: {
          images: { orderBy: { order: "asc" } },
          category: true,
          brand: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);
    categories = fetchedCategories || [];
    products = fetchedProducts || [];
    brands = fetchedBrands || [];
  } catch (err) {
    console.error("Devices page fetch error:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      <CartDrawer />
      <WhatsAppFloating />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <DevicesClient
          initialCategories={categories}
          initialProducts={products}
          initialBrands={brands}
        />
      </main>

      <Footer />
    </div>
  );
}
