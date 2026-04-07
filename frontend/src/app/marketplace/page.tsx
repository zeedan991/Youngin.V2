"use client";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Search, SlidersHorizontal, Star, ExternalLink, ShoppingBag, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Streetwear", "Sneakers", "Hoodies", "Jackets", "Accessories"];

const PRODUCTS = [
  { id: 1, brand: "Nike", name: "Air Force 1 '07", price: 110, rating: 4.9, reviews: 2847, tag: "Most Popular", color: "#00E5FF" },
  { id: 2, brand: "Zara", name: "Oversized Track Jacket", price: 79, rating: 4.6, reviews: 831, tag: "AI Fit Match", color: "#F5C842" },
  { id: 3, brand: "H&M", name: "Relaxed Linen Shirt", price: 34, rating: 4.4, reviews: 1204, tag: "Best Value", color: "#00E5FF" },
  { id: 4, brand: "Off-White", name: "Diagonal Stripe Tee", price: 290, rating: 4.8, reviews: 412, tag: "Trending", color: "#F5C842" },
  { id: 5, brand: "Adidas", name: "Samba OG", price: 100, rating: 4.7, reviews: 3124, tag: "Fan Favourite", color: "#00E5FF" },
  { id: 6, brand: "STUSSY", name: "8 Ball Crewneck", price: 118, rating: 4.9, reviews: 764, tag: "Limited", color: "#F5C842" },
];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const heroVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <TopNav />

      {/* Hero banner */}
      <section className="relative pt-32 pb-16 px-6 bg-gradient-to-b from-[#0D1012] to-[#0A0A0A] border-b border-white/5">
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[#F5C842]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#F5C842]">AI-Powered Marketplace</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-[900] text-white tracking-tight mb-4">
            Every Brand. <span className="text-[#00E5FF]">Your Size.</span>
          </h1>
          <p className="text-[#888] text-lg mb-8 max-w-2xl">
            Nike, Zara, H&M and 200+ more — filtered by your AI body measurements so everything fits perfectly.
          </p>

          {/* Search bar */}
          <div className="flex gap-3 max-w-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Nike, Zara, hoodies..."
                className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              />
            </div>
            <Button variant="outline" size="md" className="shrink-0">
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
            </Button>
            <Button variant="primary" size="md" className="shrink-0">
              Search
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <div className="border-b border-white/5 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8 text-xs text-[#555] font-medium overflow-x-auto">
          {[
            { icon: ShoppingBag, label: "2M+ Products" },
            { icon: TrendingUp, label: "200+ Brands" },
            { icon: Star, label: "Affiliate Verified" },
            { icon: Zap, label: "AI Size Match" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <Icon className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Category pills */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all",
                  activeCategory === cat
                    ? "bg-[#00E5FF] text-[#0A0A0A]"
                    : "bg-[#111] text-[#666] hover:text-white border border-white/5 hover:border-white/20"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="glass-panel rounded-2xl overflow-hidden group cursor-pointer"
              >
                {/* Product image placeholder */}
                <div className="h-52 relative bg-[#111]" style={{ background: `radial-gradient(circle at 50% 50%, ${product.color}11 0%, #111 70%)` }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 opacity-10 text-white" />
                  </div>
                  {/* Tag */}
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style={{ backgroundColor: `${product.color}22`, color: product.color, border: `1px solid ${product.color}44` }}
                  >
                    {product.tag}
                  </div>
                  {/* Link overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <Button variant="primary" size="sm" className="opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                      <ExternalLink className="w-4 h-4 mr-2" /> View Deal
                    </Button>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-1">{product.brand}</p>
                  <h3 className="text-white font-bold text-base mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-[900] text-xl">${product.price}</span>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-[#F5C842] fill-[#F5C842]" />
                      <span className="text-white text-sm font-bold">{product.rating}</span>
                      <span className="text-[#444] text-xs">({product.reviews.toLocaleString()})</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
