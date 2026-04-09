"use client";

import { motion, type Transition } from "framer-motion";
import { PackageSearch, Heart, Star, ArrowRight, Gem, Clock, Leaf } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const SP: Transition = { duration: 0.7, ease: [0.22, 1, 0.36, 1] };
const surf = "rgba(255,255,255,0.04)";
const border = "rgba(255,255,255,0.08)";
const textMain = "#F0EBE3";
const textMuted = "rgba(240,235,227,0.45)";
const accent = "#FF4D94";

const CATEGORIES = ["All", "Jackets", "Hoodies", "Denim", "Vintage Tees", "Trousers"];

const THRIFT_ITEMS = [
  { id: 1, title: "90s Levi's 501 Denim", era: "1992", price: "$38", condition: "Excellent", rarity: "Archive", img: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=600&auto=format&fit=crop", liked: false },
  { id: 2, title: "Vintage Nike Windbreaker", era: "1998", price: "$52", condition: "Good", rarity: "Rare Find", img: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?q=80&w=600&auto=format&fit=crop", liked: true },
  { id: 3, title: "Carhartt Work Jacket", era: "2001", price: "$65", condition: "Excellent", rarity: "Collector", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop", liked: false },
  { id: 4, title: "Ralph Lauren Oxford", era: "2005", price: "$28", condition: "Like New", rarity: null, img: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600&auto=format&fit=crop", liked: false },
  { id: 5, title: "Champion Reverse Weave", era: "1996", price: "$42", condition: "Good", rarity: "Archive", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop", liked: true },
  { id: 6, title: "Stüssy Graphic Tee", era: "2003", price: "$24", condition: "Excellent", rarity: "Rare Find", img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop", liked: false },
];

const RARITY_STYLES: Record<string, { gradient: string; label: string }> = {
  "Archive": { gradient: "from-purple-500 to-purple-800", label: "Archive Piece" },
  "Rare Find": { gradient: "from-amber-500 to-orange-600", label: "Rare Find" },
  "Collector": { gradient: "from-[#FF4D94] to-[#B8005C]", label: "Collector's Item" },
};

export default function ThriftShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [liked, setLiked] = useState<Record<number, boolean>>({
    2: true, 5: true,
  });

  return (
    <div className="w-full">
      {/* Demo Mode Banner */}
      <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl border" style={{ background: "rgba(251,191,36,0.06)", borderColor: "rgba(251,191,36,0.15)" }}>
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#FBBF24" }}>⚠ Demo Mode</span>
        <span className="text-xs" style={{ color: "rgba(251,191,36,0.6)" }}>Sample inventory. Real curated drops coming soon.</span>
      </div>

      {/* ── Hero Header ── */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SP} className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase mb-5"
              style={{ background: "rgba(167,139,250,0.1)", borderColor: "rgba(167,139,250,0.25)", color: "#A78BFA" }}
            >
              <Gem className="w-3.5 h-3.5" /> Curated Vintage
            </div>
            <h1
              className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3"
              style={{ color: textMain, fontFamily: "var(--font-syne)" }}
            >
              Thrift Archive
            </h1>
            <p className="text-base max-w-xl" style={{ color: textMuted }}>
              Every piece is authenticated, graded, and verified to fit your exact body geometry. No mediocre finds — only archive-worthy vintage.
            </p>
          </div>

          {/* Subscription CTA */}
          <div
            className="shrink-0 flex flex-col gap-3 px-6 py-5 rounded-3xl border min-w-[260px]"
            style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(255,77,148,0.08))", borderColor: "rgba(167,139,250,0.2)" }}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.15)" }}>
                <PackageSearch className="w-5 h-5" style={{ color: "#A78BFA" }} />
              </div>
              <div>
                <p className="font-black text-sm" style={{ color: textMain }}>Monthly Thrift Box</p>
                <p className="text-xs font-bold" style={{ color: "#A78BFA" }}>$29 / month</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: textMuted }}>5 hand-picked pieces monthly, AI-curated from your style quiz and body scan.</p>
            <button
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #A78BFA, #7C3AED)" }}
            >
              Subscribe <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Trust Badges ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SP, delay: 0.05 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {[
          { icon: Star, label: "Authenticity Verified", desc: "Every item graded & certified" },
          { icon: Leaf, label: "Sustainable Fashion", desc: "Reducing textile waste globally" },
          { icon: Clock, label: "Era-Accurate Dating", desc: "Provenance traced to the year" },
        ].map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl border" style={{ background: surf, borderColor: border }}>
              <Icon className="w-4 h-4 shrink-0" style={{ color: "#A78BFA" }} />
              <div className="min-w-0">
                <p className="text-xs font-black truncate" style={{ color: textMain }}>{b.label}</p>
                <p className="text-[10px] truncate" style={{ color: textMuted }}>{b.desc}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── Category Tabs ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SP, delay: 0.1 }} className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all hover:scale-105"
            style={{
              background: activeCategory === cat ? "linear-gradient(135deg, #A78BFA, #7C3AED)" : surf,
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {THRIFT_ITEMS.map((item) => (
          <div key={item.id} className="group block">
            <Link href={`/product/${item.id}`}>
              <div className="rounded-3xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer" style={{ background: surf, borderColor: border }}>
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Rarity badge */}
                  {item.rarity && (
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${RARITY_STYLES[item.rarity].gradient}`}>
                      {RARITY_STYLES[item.rarity].label}
                    </div>
                  )}

                  {/* Heart */}
                  <button
                    onClick={(e) => { e.preventDefault(); setLiked((prev) => ({ ...prev, [item.id]: !prev[item.id] })); }}
                    className="absolute top-4 right-4 h-9 w-9 rounded-full flex items-center justify-center border backdrop-blur-md transition-all hover:scale-110"
                    style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(255,255,255,0.15)" }}
                  >
                    <Heart className={`w-4 h-4 transition-colors ${liked[item.id] ? "fill-[#FF4D94] text-[#FF4D94]" : "text-white/60"}`} />
                  </button>

                  {/* Era + condition */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "rgba(240,235,227,0.5)" }}>{item.era}</p>
                      <p className="text-xl font-black" style={{ color: textMain }}>{item.price}</p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md"
                      style={{ background: "rgba(0,0,0,0.4)", borderColor: "rgba(255,255,255,0.1)", color: item.condition === "Excellent" || item.condition === "Like New" ? "#4ade80" : "#FBBF24", border: "1px solid" }}
                    >
                      {item.condition}
                    </span>
                  </div>
                </div>

                {/* Info footer */}
                <div className="px-5 py-4">
                  <h3 className="font-bold text-sm" style={{ color: textMain }}>{item.title}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold" style={{ color: textMuted }}>Authenticated · Body Verified</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
