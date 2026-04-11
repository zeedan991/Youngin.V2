"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Scan,
  Palette,
  ShoppingBag,
  PackageSearch,
  Scissors,
  Sparkles,
  MessageCircle,
  Search,
  Shirt,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { fetchLiveProfile } from "@/app/(dashboard)/profile/actions";
import { searchCreators } from "@/app/(dashboard)/community/actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Enforcing the requested Sidebar Order
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "3D Studio", href: "/studio", icon: Palette },
  { label: "AI Sizing", href: "/scan", icon: Scan },
  { label: "Brands", href: "/marketplace", icon: ShoppingBag },
  { label: "Tailors", href: "/tailors", icon: Scissors },
  { label: "Thrift", href: "/thrift", icon: PackageSearch },
  { label: "Style Quiz", href: "/style-quiz", icon: Sparkles },
  { label: "AI Stylist", href: "/ai-stylist", icon: MessageCircle },
  { label: "Virtual Try-On", href: "/vton", icon: Shirt },
];

export default function Navbar({ initialProfile }: { initialProfile?: { name: string; level: number; avatar_url: string | null; role: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [profile, setProfile] = useState(initialProfile || {
    name: "Creator",
    level: 1,
    avatar_url: null,
    role: "user",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const delayFn = setTimeout(async () => {
        const res = await searchCreators(searchQuery);
        if (res.success && res.data) {
          setSearchResults(res.data);
        }
      }, 300);
      return () => clearTimeout(delayFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!initialProfile) {
      fetchLiveProfile()
        .then((res) => {
          if (res.success && res.data) {
            setProfile({
              name: (res.data as any).username || (res.data as any).full_name || "Creator",
              level: (res.data as any).level || 1,
              avatar_url: (res.data as any).avatar_url || null,
              role: (res.data as any).role || "user",
            });
            const isTailorRoute = window.location.pathname.startsWith("/tailor");
            if ((res.data as any).role === "tailor" && !isTailorRoute && window.location.pathname === "/dashboard") {
              router.replace("/tailor/dashboard");
            }
          }
        })
        .catch(() => setProfile({ name: "Creator", level: 1, avatar_url: null, role: "user" }));
    } else {
        const isTailorRoute = window.location.pathname.startsWith("/tailor");
        if (initialProfile.role === "tailor" && !isTailorRoute && window.location.pathname === "/dashboard") {
            router.replace("/tailor/dashboard");
        }
    }
  }, [initialProfile, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "YU";

  const accentColor = "#4F46E5";
  const sidebarBg = "#0A0909"; // Pure black menu exactly as requested
  const textActive = "#F9FAFB";
  const textMuted = "rgba(255,255,255,0.4)";
  const borderColor = "rgba(255,255,255,0.08)";

  // Ensure sidebar closes when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ════ FIXED HAMBURGER TOP LEFT ════ */}
      <div className="fixed top-4 left-4 xl:top-6 xl:left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95"
          style={{ background: "#0A0909", color: "#FFFFFF" }}
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ════ PAGE OVERLAY ════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* ════ SIDEBAR DRAWER ════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%", boxShadow: "none" }}
            animate={{ x: 0, boxShadow: "20px 0 60px rgba(0,0,0,0.5)" }}
            exit={{ x: "-100%", boxShadow: "none" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] xl:w-[320px] flex flex-col z-50 overflow-hidden"
            style={{ background: sidebarBg, borderRight: `1px solid ${borderColor}` }}
          >
            {/* 1. Header (Logo/Close) */}
            <div className="h-[80px] flex items-center justify-between px-6 border-b shrink-0" style={{ borderColor }}>
              <span className="font-extrabold tracking-[2px] uppercase text-white" style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: "16px" }}>
                YOUNGIN
              </span>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Global Search */}
            <div className="px-6 py-6 border-b shrink-0 relative" style={{ borderColor }}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Find creators, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none transition-all placeholder:text-white/30"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${borderColor}`, color: textActive }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; setIsSearching(true); }}
                  onBlur={(e) => { e.target.style.borderColor = borderColor; setTimeout(() => setIsSearching(false), 200); }}
                />
              </div>

              {/* Search Results Dropdown */}
              {isSearching && searchResults.length > 0 && (
                <div className="absolute left-6 right-6 top-[80px] mt-2 rounded-2xl border overflow-hidden shadow-2xl" style={{ background: "#0F0F12", border: `1px solid ${borderColor}`, zIndex: 60 }}>
                  {searchResults.map((user: any) => (
                    <button
                      key={user.id}
                      onClick={() => { router.push(`/creator/${user.username}`); setIsSearching(false); setSearchQuery(''); setIsOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: accentColor }}>
                        {user.avatar_url
                          ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                          : <span className="flex items-center justify-center w-full h-full text-[10px] font-black text-white">{(user.username || 'YU').substring(0,2).toUpperCase()}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate leading-none text-white">{user.full_name || user.username}</p>
                        <p className="text-[10px] truncate text-white/40 pt-1">@{user.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
              {profile.role === "tailor" && (
                <Link href="/tailor/dashboard" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-[#4F46E5] bg-[#4F46E5]/10 hover:bg-[#4F46E5]/20 transition-all mb-4">
                  <Scissors className="w-4 h-4" /> Tailor Portal
                </Link>
              )}

              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href}>
                    <div
                      className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all cursor-pointer group"
                      style={{
                        color: isActive ? textActive : textMuted,
                        background: isActive ? accentColor : "transparent",
                      }}
                    >
                      <Icon className="w-4 h-4 xl:w-5 xl:h-5 transition-colors" style={{ color: isActive ? "#FFFFFF" : textMuted }} />
                      <span className="text-xs xl:text-xs font-bold tracking-wide transition-colors" style={{ color: isActive ? "#FFFFFF" : textMuted }}>
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* 4. Very Bottom Left Profile */}
            <div className="px-4 pb-6 pt-2 border-t mt-auto" style={{ borderColor }}>
              <div className="flex gap-2 w-full mb-3">
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold tracking-widest uppercase transition-all bg-red-500/10 hover:bg-red-500/20 text-red-500"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>

              <Link href="/profile" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/10">
                <div
                  className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center overflow-hidden shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, #3730A3)`,
                  }}
                >
                  {profile.avatar_url && !imageError ? (
                    <img
                      src={profile.avatar_url}
                      referrerPolicy="no-referrer"
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-[13px] font-black text-white">{initials}</span>
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[12px] font-bold truncate text-white">
                    {profile.name}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: accentColor }}>
                    Level {profile.level} Creator
                  </span>
                </div>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
