"use client";

import { motion, type Transition } from "framer-motion";
import { Filter, Search, ShoppingBag, ExternalLink, Sparkles, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const SP: Transition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };
const surf = "rgba(255,255,255,0.04)";
const border = "rgba(255,255,255,0.08)";
const textMain = "#F0EBE3";
const textMuted = "rgba(240,235,227,0.45)";
const accent = "#FF4D94";

const CATEGORIES = ["All", "Outerwear", "Tops", "Bottoms", "Streetwear", "Luxury"];

const INVENTORY = [
  { id: 1, brand: "Nike", title: "Tech Fleece Hoodie", price: "$120", fit: 98, tag: "Trending", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop" },
  { id: 2, brand: "Zara", title: "Oversized Wool Coat", price: "$189", fit: 96, tag: "New Drop", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop" },
  { id: 3, brand: "Carhartt WIP", title: "Detroit Jacket", price: "$235", fit: 99, tag: "Staff Pick", img: "https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=600&auto=format&fit=crop" },
  { id: 4, brand: "H&M", title: "Wide Leg Cargo", price: "$45", fit: 94, tag: null, img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop" },
  { id: 5, brand: "ASOS", title: "Knitted Sweater", price: "$65", fit: 97, tag: null, img: "https://images.unsplash.com/photo-1614786481741-998822992ef1?q=80&w=600&auto=format&fit=crop" },
  { id: 6, brand: "COS", title: "Poplin Shirt", price: "$99", fit: 95, tag: "Just In", img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop" },
];

const TAG_COLORS: Record<string, string> = {
  "Trending": "from-orange-500 to-red-600",
  "New Drop": "from-[#FF4D94] to-[#B8005C]",
  "Staff Pick": "from-purple-500 to-purple-700",
  "Just In": "from-emerald-500 to-teal-600",
};

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="w-full">
      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SP}
        className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase mb-4"
            style={{ background: surf, borderColor: border, color: textMuted }}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Global Feed
          </div>
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2"
            style={{ color: textMain, fontFamily: "var(--font-syne)" }}
          >
            Brand Aggregator
          </h1>
          <p className="text-base max-w-xl" style={{ color: textMuted }}>
            Millions of garments — your AI sizing profile automatically filters for a perfect fit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
            <input
              type="text"
              placeholder="Search drops…"
              className="rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium outline-none w-52 transition-all"
              style={{ background: surf, border: `1px solid ${border}`, color: textMain }}
              onFocus={(e) => (e.target.style.borderColor = accent)}
              onBlur={(e) => (e.target.style.borderColor = border)}
            />
          </div>
          <button
            className="h-10 w-10 rounded-2xl border flex items-center justify-center transition-all hover:scale-105"
            style={{ background: surf, borderColor: border }}
          >
            <Filter className="w-4 h-4" style={{ color: textMuted }} />
          </button>
        </div>
      </motion.header>

      {/* ── AI FIT Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SP, delay: 0.05 }}
        className="mb-6 flex items-center gap-4 px-5 py-4 rounded-2xl border"
        style={{ background: "rgba(255,77,148,0.06)", borderColor: "rgba(255,77,148,0.2)" }}
      >
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,77,148,0.15)" }}>
          <Sparkles className="w-5 h-5" style={{ color: accent }} />
        </div>
        <div>
          <p className="text-sm font-black" style={{ color: textMain }}>AI Fit Filter Active</p>
          <p className="text-xs" style={{ color: textMuted }}>All results are pre-filtered for your body measurements. Only items ≥90% fit match shown.</p>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <TrendingUp className="w-4 h-4" style={{ color: accent }} />
          <span className="text-xs font-black" style={{ color: accent }}>98% Avg Match</span>
        </div>
      </motion.div>

      {/* ── Category Tabs ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SP, delay: 0.1 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-1"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all hover:scale-105"
            style={{
              background: activeCategory === cat ? "linear-gradient(135deg, #FF4D94, #B8005C)" : surf,
              color: activeCategory === cat ? "white" : textMuted,
              border: `1px solid ${activeCategory === cat ? "transparent" : border}`,
            }}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* ── Product Grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SP, delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
      >
        {INVENTORY.map((item) => (
          <Link href={`/product/${item.id}`} key={item.id} className="group block">
            <div className="rounded-3xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl" style={{ background: surf, borderColor: border }}>
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  unoptimized
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Tag badge */}
                {item.tag && (
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${TAG_COLORS[item.tag]}`}>
                    {item.tag}
                  </div>
                )}

                {/* Fit score */}
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md"
                  style={{ background: "rgba(0,0,0,0.5)", borderColor: "rgba(255,77,148,0.4)", color: accent }}
                >
                  {item.fit}% Fit
                </div>

                {/* Hover CTA */}
                <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <button
                    className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white backdrop-blur-md"
                    style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}
                  >
                    Shop on {item.brand} <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base leading-tight" style={{ color: textMain }}>{item.title}</h3>
                    <p className="text-xs font-black uppercase tracking-widest mt-0.5" style={{ color: textMuted }}>{item.brand}</p>
                  </div>
                  <span className="font-black text-base shrink-0" style={{ color: accent }}>{item.price}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
