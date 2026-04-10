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
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string; level: number; avatar_url: string | null }>({
    name: "",
    level: 1,
    avatar_url: null,
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
    fetchLiveProfile()
      .then((res) => {
        if (res.success && res.data) {
          setProfile({
            name: (res.data as any).username || (res.data as any).full_name || "Creator",
            level: (res.data as any).level || 1,
            avatar_url: (res.data as any).avatar_url || null,
          });
        }
      })
      .catch(() => setProfile({ name: "Creator", level: 1, avatar_url: null }));
  }, []);

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
  const accentColor = "#FF4D94";

  return (
    <>
      {/* ════ DESKTOP TOP NAVBAR ════ */}
      <motion.header
        className="hidden lg:flex items-center justify-between sticky top-0 z-50 px-4 xl:px-6 h-[70px] shrink-0 select-none shadow-sm"
        style={{ background: navbarBg, borderBottom: `1px solid ${borderColor}` }}
      >
        {/* ── Brand Mark ── */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0 mr-3 xl:mr-8">
          <div className="relative h-10 w-10">
            <Image src="/youngin_whitebg.png" alt="YOUNGIN" fill className="object-contain" priority />
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
        <nav className="flex-1 flex items-center justify-center gap-0.5 xl:gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <div
                  className="flex items-center gap-1.5 xl:gap-2 px-2 xl:px-3 py-1.5 xl:py-2 rounded-xl transition-all cursor-pointer group whitespace-nowrap relative"
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
                  <span className="text-[11px] xl:text-[12px] font-bold tracking-wide hidden lg:block">
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
                      <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden" style={{ background: "#FF4D94" }}>
                        {user.avatar_url
                          ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                          : <span className="flex items-center justify-center w-full h-full text-[9px] font-black text-white">{(user.username || 'YU').substring(0,2).toUpperCase()}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-none" style={{ color: textActive }}>{user.full_name || user.username}</p>
                        <p className="text-[10px] truncate mt-0.5" style={{ color: textMuted }}>@{user.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </div>
          
          <div className="h-6 w-px" style={{ background: borderColor }} />

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
                background: "linear-gradient(135deg, #FF4D94, #B8005C)",
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
          <div className="relative h-8 w-8">
            <Image src="/youngin_whitebg.png" alt="YOUNGIN" fill className="object-contain" priority />
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
                background: "linear-gradient(135deg, #FF4D94, #B8005C)",
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
