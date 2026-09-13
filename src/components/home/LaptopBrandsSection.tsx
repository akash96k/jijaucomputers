"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { ProductItem } from "@/lib/types";

interface BrandCard {
  id: string;
  name: string;
  query: string;
  href: string;
  tagline: string;
  imageUrl: string;
  brandLogoText?: string;
  brandColor?: string;
  badge?: string;
}

const LAPTOP_BRANDS: BrandCard[] = [
  {
    id: "apple",
    name: "MacBook",
    query: "apple",
    href: "/products?brand=apple&category=laptops",
    tagline: "M2 & M3 Silicon",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    brandLogoText: "APPLE",
    brandColor: "bg-slate-900 text-white",
    badge: "M3 CHIP",
  },
  {
    id: "hp",
    name: "HP Laptops",
    query: "hp",
    href: "/products?brand=hp&category=laptops",
    tagline: "EliteBook, Pavilion & Victus",
    imageUrl: "https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?w=600&auto=format&fit=crop&q=80",
    brandLogoText: "HP",
    brandColor: "bg-blue-600 text-white",
    badge: "BESTSELLER",
  },
  {
    id: "dell",
    name: "Dell Laptops",
    query: "dell",
    href: "/products?brand=dell&category=laptops",
    tagline: "Latitude, XPS & Inspiron",
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
    brandLogoText: "DELL",
    brandColor: "bg-sky-600 text-white",
    badge: "DURABLE",
  },
  {
    id: "asus",
    name: "ASUS Laptops",
    query: "asus",
    href: "/products?brand=asus&category=laptops",
    tagline: "ROG Strix & TUF Gaming",
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
    brandLogoText: "ASUS",
    brandColor: "bg-red-600 text-white",
    badge: "RTX GAMING",
  },
  {
    id: "lenovo",
    name: "Lenovo Laptops",
    query: "lenovo",
    href: "/products?brand=lenovo&category=laptops",
    tagline: "ThinkPad, Legion & Yoga",
    imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
    brandLogoText: "LENOVO",
    brandColor: "bg-rose-600 text-white",
    badge: "AI READY",
  },
  {
    id: "acer",
    name: "Acer Laptops",
    query: "acer",
    href: "/products?brand=acer&category=laptops",
    tagline: "Nitro & Predator Gaming",
    imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80",
    brandLogoText: "ACER",
    brandColor: "bg-emerald-600 text-white",
    badge: "BUDGET RIG",
  },
];

export default function LaptopBrandsSection({ products = [] }: { products?: ProductItem[] }) {
  return (
    <section className="py-6 max-w-7xl mx-auto px-4">
      {/* 1. Header: Icon + LAPTOP Brands + View All */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>LAPTOP Brands</span>
            </h2>
          </div>
        </div>

        <Link
          href="/products?category=laptops"
          className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. Full-Image Rich Cards Row */}
      <div className="flex items-stretch overflow-x-auto no-scrollbar gap-3 sm:gap-4 pb-2 snap-x">
        {LAPTOP_BRANDS.map((b) => (
          <Link
            key={b.id}
            href={b.href}
            prefetch={true}
            className="w-[145px] sm:w-[170px] shrink-0 snap-start group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-400 transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
          >
            {/* Full Space Image Container */}
            <div className="w-full h-32 sm:h-36 relative bg-slate-900 overflow-hidden flex items-center justify-center">
              <img
                src={b.imageUrl}
                alt={b.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Brand Floating Pill */}
              {b.brandLogoText && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-black tracking-widest text-white border border-white/20">
                  {b.brandLogoText}
                </div>
              )}

              {/* Tagline over image bottom */}
              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-[10px] font-medium text-slate-200 line-clamp-1">
                  {b.tagline}
                </span>
              </div>
            </div>

            {/* Title Bar */}
            <div className="p-3 text-center bg-white border-t border-slate-100 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                {b.name}
              </h3>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}


