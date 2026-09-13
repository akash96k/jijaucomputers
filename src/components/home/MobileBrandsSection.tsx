"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, ArrowRight } from "lucide-react";
import { ProductItem } from "@/lib/types";

interface MobileBrand {
  id: string;
  name: string;
  query: string;
  href: string;
  logo: string;
  tagline: string;
  brandLogoText: string;
  badge: string;
}

const MOBILE_BRANDS: MobileBrand[] = [
  {
    id: "apple",
    name: "Apple iPhones",
    query: "apple",
    href: "/products?brand=apple&category=mobiles",
    tagline: "iPhone 15, 14 & 13 Pro",
    logo: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80",
    brandLogoText: "APPLE",
    badge: "IPHONE 15",
  },
  {
    id: "samsung",
    name: "Samsung Galaxy",
    query: "samsung",
    href: "/products?brand=samsung&category=mobiles",
    tagline: "S24 Ultra, Fold & S23",
    logo: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80",
    brandLogoText: "SAMSUNG",
    badge: "S24 ULTRA",
  },
  {
    id: "oneplus",
    name: "OnePlus",
    query: "oneplus",
    href: "/products?brand=oneplus&category=mobiles",
    tagline: "OnePlus 12 & Nord 5G",
    logo: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=80",
    brandLogoText: "ONEPLUS",
    badge: "FLAGSHIP",
  },
  {
    id: "pixel",
    name: "Google Pixel",
    query: "pixel",
    href: "/products?brand=pixel&category=mobiles",
    tagline: "Pixel 8 Pro & 8a 5G",
    logo: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80",
    brandLogoText: "GOOGLE",
    badge: "AI CAMERA",
  },
  {
    id: "xiaomi",
    name: "Xiaomi / Redmi",
    query: "xiaomi",
    href: "/products?brand=xiaomi&category=mobiles",
    tagline: "Redmi Note & Xiaomi 14",
    logo: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500&auto=format&fit=crop&q=80",
    brandLogoText: "XIAOMI",
    badge: "5G VALUE",
  },
  {
    id: "vivo",
    name: "Vivo & Realme",
    query: "vivo",
    href: "/products?brand=vivo&category=mobiles",
    tagline: "V30 Pro & Realme GT",
    logo: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500&auto=format&fit=crop&q=80",
    brandLogoText: "VIVO",
    badge: "CAMERA 5G",
  },
];

export default function MobileBrandsSection({ products = [] }: { products?: ProductItem[] }) {
  return (
    <section className="py-6 max-w-7xl mx-auto px-4">
      {/* 1. Header: Smartphone icon + Mobiles + View All Products */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
              <span>Mobiles</span>
            </h2>
          </div>
        </div>

        <Link
          href="/products?category=mobiles"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <span>View All Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. Full-Image Rich Cards Row */}
      <div className="flex items-stretch overflow-x-auto no-scrollbar gap-3 sm:gap-4 pb-2 snap-x">
        {MOBILE_BRANDS.map((b) => (
          <Link
            key={b.id}
            href={b.href}
            prefetch={true}
            className="w-[145px] sm:w-[170px] shrink-0 snap-start group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
          >
            {/* Full Space Image Container */}
            <div className="w-full h-32 sm:h-36 relative bg-slate-900 overflow-hidden flex items-center justify-center">
              <img
                src={b.logo}
                alt={b.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Brand Floating Pill */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-black tracking-widest text-white border border-white/20">
                {b.brandLogoText}
              </div>

              {/* Tagline over image bottom */}
              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-[10px] font-medium text-slate-200 line-clamp-1">
                  {b.tagline}
                </span>
              </div>
            </div>

            {/* Title Bar */}
            <div className="p-3 text-center bg-white border-t border-slate-100 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {b.name}
              </h3>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}


