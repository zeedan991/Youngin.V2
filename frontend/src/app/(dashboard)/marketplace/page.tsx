"use client";

import { motion, type Transition } from "framer-motion";
import { Filter, Search, ShoppingBag, ExternalLink, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SP: Transition = { duration: 0.6, ease: "easeOut" };

// Mock global inventory dataset
const INVENTORY = [
  { id: 1, brand: "Nike", title: "Tech Fleece Hoodie", price: "$120", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop" },
  { id: 2, brand: "Zara", title: "Oversized Wool Coat", price: "$189", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop" },
  { id: 3, brand: "Carhartt WIP", title: "Detroit Jacket", price: "$235", img: "https://images.unsplash.com/photo-1520975954732-57dd22299614?q=80&w=600&auto=format&fit=crop" },
  { id: 4, brand: "H&M", title: "Wide Leg Cargo", price: "$45", img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop" },
  { id: 5, brand: "ASOS", title: "Knitted Sweater", price: "$65", img: "https://images.unsplash.com/photo-1614786481741-998822992ef1?q=80&w=600&auto=format&fit=crop" },
  { id: 6, brand: "COS", title: "Poplin Shirt", price: "$99", img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop" },
];

export default function MarketplacePage() {
  return (
    <div className="w-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SP}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-bold tracking-widest uppercase mb-4">
            <ShoppingBag className="w-4 h-4" /> Global Feed
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">Brand Aggregator</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Millions of garments scanned globally. Your AI sizing profile is automatically applied to filter out clothes that won't fit perfectly.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={SP} className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF4D94] transition-colors" />
            <input 
              type="text" 
              placeholder="Search global drops"
              className="bg-[#111116] border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#FF4D94]/50 transition-colors w-full md:w-64"
            />
          </div>
          <button className="h-10 w-10 rounded-full border border-white/10 bg-[#111116] flex items-center justify-center hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4 text-slate-300" />
          </button>
        </motion.div>
      </header>

      {/* Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {INVENTORY.map((item, i) => (
          <Link href={`/product/${item.id}`} key={item.id} className="group cursor-pointer block">
            <div className="relative aspect-[3/4] rounded-2xl bg-[#111116] border border-white/5 overflow-hidden mb-4">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end p-4">
                <button className="w-full py-3 bg-white text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-[#FF4D94] transition-colors shadow-xl">
                  Shop direct on {item.brand} <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <Image 
                src={item.img} 
                alt={item.title} 
                fill 
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                unoptimized
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider text-white">
                  98% Fit Match
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white text-lg">{item.title}</h3>
                <span className="font-mono font-bold text-[#FF4D94]">{item.price}</span>
              </div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{item.brand}</p>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
