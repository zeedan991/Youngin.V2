"use client";

import { motion } from "framer-motion";
import { Filter, Search, ChevronDown, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const CATEGORIES = [
  "All",
  "Outerwear",
  "Tops",
  "Bottoms",
  "Streetwear",
  "Luxury",
  "Accessories",
  "Footwear",
];

const INVENTORY: any[] = [];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="w-full max-w-[1600px] mx-auto pt-4 pb-12">
      {/* ── PROFESSIONAL E-COMMERCE HEADER ── */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--dash-text)" }}
          >
            Discover
          </h1>
          <div className="flex items-center gap-2 mt-1.5 opacity-60">
            <CheckCircle2
              className="w-3.5 h-3.5"
              style={{ color: "var(--dash-text)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--dash-text)" }}
            >
              Sizing pre-filtered to your exact measurements
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--dash-muted)" }}
            />
            <input
              type="text"
              placeholder="Search items..."
              className="rounded-lg py-2 pl-9 pr-3 text-xs font-medium outline-none w-48 transition-all border"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "var(--dash-border)",
                color: "var(--dash-text)",
              }}
            />
          </div>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: "var(--dash-border)",
              color: "var(--dash-text)",
            }}
          >
            Sort by: Relevance <ChevronDown className="w-3 h-3" />
          </button>
          <button
            className="h-8 w-8 flex items-center justify-center rounded-lg border"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: "var(--dash-border)",
              color: "var(--dash-text)",
            }}
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── CATEGORY PILLS ── */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
            style={{
              background:
                activeCategory === cat ? "var(--dash-text)" : "transparent",
              color:
                activeCategory === cat ? "var(--dash-bg)" : "var(--dash-muted)",
              border: `1px solid ${activeCategory === cat ? "transparent" : "var(--dash-border)"}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── HIGH DENSITY PRODUCT GRID ── */}
      {INVENTORY.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center border border-dashed rounded-3xl mt-8" style={{ borderColor: "var(--dash-border)" }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: "var(--dash-text)" }}>No items available</h3>
          <p className="text-sm" style={{ color: "var(--dash-muted)" }}>The marketplace is currently empty. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 mt-6">
          {INVENTORY.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={`/product/${item.id}`} className="group block">
                {/* ── Image Wrapper ── */}
                <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 mb-3">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-in-out"
                    unoptimized
                  />

                  {/* Subtle Top Tags */}
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                    {item.tag ? (
                      <span className="bg-white/90 text-black px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                        {item.tag}
                      </span>
                    ) : (
                      <span />
                    )}

                    <span
                      className="bg-black/70 text-white px-1.5 py-0.5 rounded text-[9px] font-bold backdrop-blur-sm shadow-sm border border-white/10"
                      style={{ color: "var(--dash-accent)" }}
                    >
                      {item.fit}% Match
                    </span>
                  </div>
                </div>

                {/* ── E-commerce Text ── */}
                <div className="px-0.5 flex flex-col">
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-widest leading-none mb-1.5"
                    style={{ color: "var(--dash-muted)" }}
                  >
                    {item.brand}
                  </span>
                  <h3
                    className="text-[12px] font-medium leading-snug mb-1.5 truncate"
                    style={{ color: "var(--dash-text)" }}
                  >
                    {item.title}
                  </h3>
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: "var(--dash-text)" }}
                  >
                    {item.price}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
