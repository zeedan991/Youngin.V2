"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, Fragment } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { fetchLiveProfile } from "@/app/(dashboard)/profile/actions";
import { searchCreators } from "@/app/(dashboard)/community/actions";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Sizing", href: "/scan", icon: Scan },
  { label: "3D Studio", href: "/studio", icon: Palette },
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
  
  // Use initialProfile if provided, otherwise fallback
  const [profile, setProfile] = useState(initialProfile || {
    name: "Creator",
    level: 1,
    avatar_url: null,
    role: "user",
  });

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
    // If the server didn't pass a profile (e.g. static export/fallback), fetch it.
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
            // Auto-redirect tailors who land on consumer pages to their portal
            const isTailorRoute = window.location.pathname.startsWith("/tailor");
            if ((res.data as any).role === "tailor" && !isTailorRoute && window.location.pathname === "/dashboard") {
              router.replace("/tailor/dashboard");
            }
          }
        })
        .catch(() => setProfile({ name: "Creator", level: 1, avatar_url: null, role: "user" }));
    } else {
        // Even if we got a profile server-side, check role routing client-side to ensure smooth navigation
        const isTailorRoute = window.location.pathname.startsWith("/tailor");
        if (initialProfile.role === "tailor" && !isTailorRoute && window.location.pathname === "/dashboard") {
            router.replace("/tailor/dashboard");
        }
    }
  }, [initialProfile, router]);

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "YU";

  const navbarBg = "#0A0909";
  const borderColor = "rgba(255,255,255,0.07)";
  const textMuted = "rgba(255,255,255,0.4)";
  const textActive = "#F0EBE3";
  const accentColor = "#4F46E5";

  return (
    <>
      {/* ════ DESKTOP TOP NAVBAR ════ */}
      <motion.header
        className="hidden lg:flex items-center justify-between sticky top-0 z-50 px-4 xl:px-6 h-[70px] shrink-0 select-none shadow-sm"
        style={{ background: navbarBg, borderBottom: `1px solid ${borderColor}` }}
      >
        {/* ── Brand Mark ── */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0 mr-3 xl:mr-8">
          <div className="relative h-12 w-12">
            <Image src="/youngin_blackbg.png" alt="YOUNGIN" fill className="object-contain" priority />
          </div>
          <span
            className="font-extrabold tracking-[2px] uppercase whitespace-nowrap hidden xl:block"
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontSize: "20px",
              color: textActive,
            }}
          >
            YOUNGIN
          </span>
        </Link>

        {/* ── Nav Items ── */}
        <nav className="flex-1 flex items-center justify-center lg:gap-0 xl:gap-1 overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <div
                  className="flex items-center gap-1.5 xl:gap-2 px-1.5 xl:px-2 py-1.5 xl:py-2 rounded-xl transition-all cursor-pointer group whitespace-nowrap relative"
                  style={{
                    color: isActive ? textActive : textMuted,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 transition-colors" style={{ color: isActive ? accentColor : "inherit" }} />
                  <span className="text-[10px] xl:text-[11px] font-bold tracking-wide hidden lg:block">
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="desktopTopNavActive"
                      className="absolute bottom-[-14px] xl:bottom-[-16px] left-0 right-0 h-[2px] rounded-full"
                      style={{ background: accentColor }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* ── Right Section (Search + Profile) ── */}
        <div className="flex items-center gap-3 xl:gap-4 shrink-0 ml-3 xl:ml-6 relative">
          <div className="relative hidden xl:block">
             <div className="relative px-1 w-[160px] xl:w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: textMuted }} />
                <input
                  type="text"
                  placeholder="Find creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-[12px] font-semibold outline-none transition-all focus:w-[200px] xl:focus:w-[240px]"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${borderColor}`, color: textActive }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; setIsSearching(true); }}
                  onBlur={(e) => { e.target.style.borderColor = borderColor; setTimeout(() => setIsSearching(false), 200); }}
                />
              </div>
              
              {isSearching && searchResults.length > 0 && (
                <div className="absolute right-0 mt-2 w-[260px] rounded-xl border overflow-hidden shadow-2xl" style={{ background: "rgba(15,15,15,0.98)", border: `1px solid ${borderColor}`, zIndex: 999 }}>
                  {searchResults.map((user: any) => (
                    <button
                      key={user.id}
                      onClick={() => { router.push(`/creator/${user.username}`); setIsSearching(false); setSearchQuery(''); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden" style={{ background: "#4F46E5" }}>
                        {user.avatar_url
                          ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                          : <span className="flex items-center justify-center w-full h-full text-[9px] font-black text-white">{(user.username || 'YU').substring(0,2).toUpperCase()}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate leading-none" style={{ color: textActive }}>{user.full_name || user.username}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] truncate" style={{ color: textMuted }}>@{user.username}</p>
                          {user.role === "tailor" && (
                            <span className="text-[8px] font-black text-[#4F46E5] bg-[#4F46E5]/15 px-1.5 py-0.5 rounded tracking-wider">🧵 TAILOR</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </div>
          
          <div className="h-6 w-px" style={{ background: borderColor }} />

          {profile.role === "tailor" && (
            <Link href="/tailor/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#4F46E5] border border-[#4F46E5]/20 hover:bg-[#4F46E5]/10 transition-all">
              🧵 Tailor Portal
            </Link>
          )}

          <Link href="/profile" className="flex items-center gap-3 group">
            <div className="flex flex-col text-right">
              <span className="text-[13px] font-bold truncate group-hover:opacity-80 transition-opacity" style={{ color: textActive }}>
                {profile.name}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-right" style={{ color: accentColor }}>
                Lv. {profile.level}
              </span>
            </div>
            <div
              className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 transition-transform group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #3730A3)",
                borderColor: pathname === "/profile" ? accentColor : "rgba(255,255,255,0.15)",
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
          </Link>
        </div>
      </motion.header>

      {/* ════ MOBILE TOP BAR (Brand + Profile) ════ */}
      <header
        className="lg:hidden flex items-center justify-between sticky top-0 z-50 px-4 h-[60px] shrink-0 select-none shadow-sm"
        style={{ background: navbarBg, borderBottom: `1px solid ${borderColor}` }}
      >
         <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="relative h-10 w-10">
            <Image src="/youngin_blackbg.png" alt="YOUNGIN" fill className="object-contain" priority />
          </div>
          <span
            className="font-extrabold tracking-[1px] uppercase whitespace-nowrap"
            style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: "16px", color: textActive }}
          >
            YOUNGIN
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
           <Link href="/profile">
            <div
              className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center overflow-hidden border"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #3730A3)",
                borderColor: pathname === "/profile" ? accentColor : "rgba(255,255,255,0.15)",
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
                <span className="text-[11px] font-black text-white">{initials}</span>
              )}
            </div>
          </Link>
        </div>
      </header>

      {/* ════ MOBILE BOTTOM BAR ════ */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] z-50 flex items-center justify-around px-1 pb-safe"
        style={{ background: navbarBg, borderTop: `1px solid ${borderColor}` }}
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 group py-2 relative">
              {isActive && (
                <motion.div
                  layoutId="mobileActiveNav"
                  className="absolute top-0 left-4 right-4 h-[2px] rounded-full"
                  style={{ background: accentColor }}
                />
              )}
              <Icon
                className="w-[22px] h-[22px] transition-colors mt-0.5"
                style={{ color: isActive ? accentColor : textMuted }}
              />
              <span
                className="text-[10px] font-semibold transition-colors"
                style={{ color: isActive ? textActive : textMuted }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

