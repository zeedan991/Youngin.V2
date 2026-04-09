"use client";

import { motion } from "framer-motion";
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageCircle,
  User,
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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const sidebarBg = "#0A0909";
  const borderColor = "rgba(255,255,255,0.07)";
  const textMuted = "rgba(255,255,255,0.4)";
  const textActive = "#F0EBE3";
  const accentColor = "#FF4D94";

  return (
    <>
      {/* ════ DESKTOP SIDEBAR ════ */}
      <motion.aside
        animate={{ width: isCollapsed ? "72px" : "280px" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="hidden md:flex flex-col h-screen sticky top-0 z-50 shrink-0 select-none overflow-hidden"
        style={{ background: sidebarBg, borderRight: `1px solid ${borderColor}` }}
      >
        {/* ── Brand Mark ── */}
        <div
          className={cn("flex items-center", isCollapsed ? "justify-center px-0 pt-8 pb-6" : "px-6 pt-8 pb-6")}
        >
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className={cn("relative shrink-0 transition-all duration-300", isCollapsed ? "h-12 w-12 mx-auto" : "h-12 w-12")}>
              <Image src="/youngin_whitebg.png" alt="YOUNGIN" fill className="object-contain" priority />
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="font-extrabold tracking-[2px] uppercase whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontSize: "22px",
                  color: textActive,
                }}
              >
                YOUNGIN
              </motion.span>
            )}
          </Link>
        </div>

        {/* ── Global Search ── */}
        {!isCollapsed && (
          <div className="px-4 mb-4 relative z-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textMuted }} />
              <input
                type="text"
                placeholder="Find creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${borderColor}`, color: textActive }}
                onFocus={(e) => { e.target.style.borderColor = accentColor; setIsSearching(true); }}
                onBlur={(e) => { e.target.style.borderColor = borderColor; setTimeout(() => setIsSearching(false), 200); }}
              />
            </div>
            
            {/* Search Dropdown */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full left-4 right-4 mt-2 rounded-xl border overflow-hidden shadow-2xl backdrop-blur-xl" style={{ background: "rgba(20,20,20,0.95)", border: `1px solid ${borderColor}` }}>
                {searchResults.map((user: any) => (
                  <button
                    key={user.id}
                    onClick={() => { router.push(`/creator/${user.username}`); setIsSearching(false); setSearchQuery(''); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-800 shrink-0 overflow-hidden">
                      {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="flex items-center justify-center w-full h-full text-[8px] font-bold text-white bg-[#FF4D94]">YU</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-white leading-none">{user.full_name || user.username}</p>
                      <p className="text-[10px] text-white/40 truncate mt-0.5">@{user.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full left-4 right-4 mt-2 px-3 py-3 rounded-xl border shadow-2xl backdrop-blur-xl text-xs text-white/50 text-center" style={{ background: "rgba(20,20,20,0.95)", border: `1px solid ${borderColor}` }}>
                No creators found
              </div>
            )}
          </div>
        )}

        {/* ── Divider ── */}
        <div className="mx-5 h-px mb-4" style={{ background: borderColor }} />

        {/* ── Nav Items ── */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <div
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group",
                  )}
                  style={{
                    background: isActive ? "rgba(255,77,148,0.12)" : "transparent",
                    color: isActive ? textActive : textMuted,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{ background: accentColor }}
                    />
                  )}

                  <div
                    className={cn("transition-colors", isCollapsed && "mx-auto")}
                    style={{ color: isActive ? accentColor : "inherit" }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {!isCollapsed && (
                    <span className="text-[14px] font-semibold tracking-wide whitespace-nowrap">
                      {item.label}
                    </span>
                  )}

                  {isCollapsed && (
                    <div
                      className="fixed left-[75px] px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none z-[100] whitespace-nowrap transition-opacity shadow-2xl"
                      style={{ background: "#1A1A1A", color: textActive, border: `1px solid ${borderColor}` }}
                    >
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Section ── */}
        <div className="mt-auto px-3 pb-5 space-y-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all"
            style={{ color: textMuted }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" style={{ color: accentColor }} />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" style={{ color: accentColor }} />
                <span className="text-[13px] font-semibold">Collapse</span>
              </>
            )}
          </button>

          <div className="h-px mx-2" style={{ background: borderColor }} />

          <Link href="/profile">
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer",
                isCollapsed && "justify-center px-0"
              )}
              style={{
                background: pathname === "/profile" ? "rgba(255,77,148,0.1)" : "transparent",
                border: pathname === "/profile" ? `1px solid rgba(255,77,148,0.2)` : "1px solid transparent",
              }}
            >
              <div
                className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2"
                style={{
                  background: "linear-gradient(135deg, #FF4D94, #B8005C)",
                  borderColor: "rgba(255,255,255,0.15)",
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
              {!isCollapsed && profile.name && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-bold truncate" style={{ color: textActive }}>
                    {profile.name}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: accentColor }}>
                    Lv. {profile.level} Creator
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </motion.aside>

      {/* ════ MOBILE BOTTOM BAR ════ */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] z-50 flex items-center justify-around px-1"
        style={{ background: sidebarBg, borderTop: `1px solid ${borderColor}` }}
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 group py-2 relative">
              {isActive && (
                <motion.div
                  layoutId="mobileActiveNav"
                  className="absolute -top-px left-3 right-3 h-[2px] rounded-full"
                  style={{ background: accentColor }}
                />
              )}
              <Icon
                className="w-5 h-5 transition-colors"
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
