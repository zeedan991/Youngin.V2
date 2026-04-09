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
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

import { fetchLiveProfile } from "@/app/(dashboard)/profile/actions";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState<{name: string, level: number, avatar_url: string | null}>({ name: "Loading...", level: 1, avatar_url: null });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchLiveProfile();
        if (response.success && response.data) {
          setProfile({ 
            name: response.data.username || response.data.full_name || "User", 
            level: response.data.level || 1,
            avatar_url: response.data.avatar_url || null
          });
        } else {
          setProfile({ name: "Guest User", level: 1, avatar_url: null });
        }
      } catch (err) {
        setProfile({ name: "User", level: 1, avatar_url: null });
      }
    };
    fetchProfile();
  }, []);

  const initials = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "YU";

  return (
    <>
      {/* ════ DESKTOP SIDEBAR ════ */}
      <motion.aside 
        animate={{ width: isCollapsed ? "72px" : "260px" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="hidden md:flex flex-col h-screen sticky top-0 bg-white text-slate-500 z-50 shrink-0 select-none overflow-hidden border-r border-slate-200"
      >
        {/* ── Brand Mark ── */}
        <div className={cn("flex items-center", isCollapsed ? "justify-center px-0 pt-8 pb-6" : "px-6 pt-8 pb-6")}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className={cn("relative shrink-0 transition-all duration-300", isCollapsed ? "h-[3.25rem] w-[3.25rem] mx-auto" : "h-12 w-12")}>
              <Image src="/youngin_whitebg.png" alt="YOUNGIN" fill className="object-contain drop-shadow-sm" priority />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -8 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-slate-900 text-[24px] font-extrabold tracking-[2px] uppercase pt-1"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                YOUNGIN
              </motion.span>
            )}
          </Link>
        </div>

        {/* ── Divider ── */}
        <div className="mx-5 h-px bg-slate-200 mb-4" />

        {/* ── Nav Items ── */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <div className={cn(
                  "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group",
                  isActive 
                    ? "text-slate-900" 
                    : "hover:text-slate-900"
                )}>
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-slate-100 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <div className={cn(
                    "relative z-10 transition-colors",
                    isActive ? "text-[#FF4D94]" : "text-slate-500 group-hover:text-slate-600",
                    isCollapsed && "mx-auto"
                  )}>
                    <Icon className="w-[20px] h-[20px]" />
                  </div>
                  
                  {!isCollapsed && (
                    <span className={cn(
                      "relative z-10 text-[14px] font-bold tracking-wide transition-colors whitespace-nowrap",
                      isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900"
                    )}>
                      {item.label}
                    </span>
                  )}

                  {/* Collapsed tooltip */}
                  {isCollapsed && (
                    <div className="fixed left-[75px] bg-slate-900 text-white px-3 py-1.5 rounded-md text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none z-[100] whitespace-nowrap transition-opacity shadow-xl">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Section ── */}
        <div className="mt-auto px-3 pb-4 space-y-3">
          {/* Collapse toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold"
          >
            {isCollapsed 
              ? <ChevronRight className="w-5 h-5 mx-auto text-[#FF4D94]" /> 
              : (
                <>
                  <ChevronLeft className="w-5 h-5 text-[#FF4D94]" />
                  <span className="text-[13px]">Collapse</span>
                </>
              )
            }
          </button>

          {/* Divider */}
          <div className="mx-2 h-px bg-slate-200" />

          {/* Profile */}
          <Link href="/profile">
            <div className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group border border-transparent",
              pathname === "/profile" 
                ? "bg-slate-50 border-slate-200 text-slate-900" 
                : "hover:bg-slate-50 text-slate-500 hover:text-slate-900",
              isCollapsed && "justify-center px-0"
            )}>
              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#FF4D94] to-[#B8005C] flex items-center justify-center shadow-lg overflow-hidden border-2 border-white ring-2 ring-slate-100">
                {(profile.avatar_url && !imageError) ? (
                  <img 
                    src={profile.avatar_url} 
                    referrerPolicy="no-referrer" 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-[13px] font-bold text-white tracking-widest">{initials}</span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-bold text-slate-900 truncate">{profile.name}</span>
                  <span className="text-[11px] text-[#FF4D94] font-bold uppercase tracking-widest">Lv. {profile.level} VIP</span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </motion.aside>

      {/* ════ MOBILE BOTTOM BAR ════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] border-t border-slate-200 bg-white/95 backdrop-blur-xl z-50 flex items-center justify-around px-1">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-0.5 group py-2 relative">
              {isActive && (
                <motion.div layoutId="mobileActiveNav" className="absolute -top-px left-3 right-3 h-[2px] bg-[#FF4D94] rounded-full" />
              )}
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-[#FF4D94]" : "text-slate-600 group-hover:text-white")} />
              <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-slate-900" : "text-slate-500")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
