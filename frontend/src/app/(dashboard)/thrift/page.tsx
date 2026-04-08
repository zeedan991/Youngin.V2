"use client";

import { motion, type Transition } from "framer-motion";
import { PackageSearch, Filter, Search, Heart, ShoppingCart, Star, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

const SP: Transition = { duration: 0.6, ease: "easeOut" };

const CATEGORIES = ["All", "Jackets", "Hoodies", "Denim", "Vintage Tees", "Trousers"];

const THRIFT_ITEMS = [
  { id: 1, title: "90s Levi's 501 Denim", era: "1992", price: "$38", condition: "Excellent", size: "Fits You", img: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=600&auto=format&fit=crop", liked: false },
  { id: 2, title: "Vintage Nike Windbreaker", era: "1998", price: "$52", condition: "Good", size: "Fits You", img: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?q=80&w=600&auto=format&fit=crop", liked: true },
  { id: 3, title: "Carhartt Work Jacket", era: "2001", price: "$65", condition: "Excellent", size: "Fits You", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop", liked: false },
  { id: 4, title: "Ralph Lauren Oxford", era: "2005", price: "$28", condition: "Like New", size: "Fits You", img: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600&auto=format&fit=crop", liked: false },
  { id: 5, title: "Champion Reverse Weave", era: "1996", price: "$42", condition: "Good", size: "Fits You", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop", liked: true },
  { id: 6, title: "Stüssy Graphic Tee", era: "2003", price: "$24", condition: "Excellent", size: "Fits You", img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop", liked: false },
];

export default function ThriftShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="w-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SP}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">
            <PackageSearch className="w-4 h-4" /> Curated Vintage
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">Thrift Shop</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            High-quality secondhand vintage pieces, curated by AI from your style quiz and body measurements. Every item is verified to fit your exact geometry.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={SP} className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF4D94] transition-colors" />
            <input
              type="text"
              placeholder="Search vintage pieces"
              className="bg-[#111116] border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#FF4D94]/50 transition-colors w-full md:w-64"
            />
          </div>
          <button className="h-10 w-10 rounded-full border border-white/10 bg-[#111116] flex items-center justify-center hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4 text-slate-300" />
          </button>
        </motion.div>
      </header>

      {/* Subscription Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.05 }}
        className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-[#FF4D94]/10 border border-white/10 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/20 shrink-0">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Monthly Thrift Box — $29/mo</h3>
            <p className="text-sm text-slate-400">Get 5 hand-picked vintage items delivered monthly, curated from your style quiz and AI sizing.</p>
          </div>
        </div>
        <button className="shrink-0 px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
          Subscribe <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Category Tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SP, delay: 0.1 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? "bg-white text-black" : "bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10"}`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Product Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {THRIFT_ITEMS.map((item) => (
          <Link href={`/product/${item.id}`} key={item.id} className="group cursor-pointer block">
            <div className="relative aspect-[3/4] rounded-2xl bg-[#111116] border border-white/5 overflow-hidden mb-4">
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end p-4">
                <button className="w-full py-3 bg-white text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-[#FF4D94] transition-colors shadow-xl">
                  <ShoppingCart className="w-4 h-4" /> View Details
                </button>
              </div>
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                unoptimized
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold text-[#FF4D94]">
                  {item.size}
                </span>
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  {item.era}
                </span>
              </div>
              {/* Heart */}
              <button className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                <Heart className={`w-4 h-4 ${item.liked ? "fill-red-400 text-red-400" : "text-white"}`} />
              </button>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white text-lg group-hover:text-[#FF4D94] transition-colors">{item.title}</h3>
                <span className="font-mono font-bold text-white">{item.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Condition: {item.condition}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-slate-400 font-medium">Verified</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
