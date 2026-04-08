"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  return (
    <>
      {/* ════ DESKTOP SIDEBAR ════ */}
      <motion.aside 
        animate={{ width: isCollapsed ? "72px" : "240px" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="hidden md:flex flex-col h-screen sticky top-0 bg-white text-slate-500 z-50 shrink-0 select-none overflow-hidden"
      >
        {/* ── Brand Mark ── */}
        <div className={cn("flex items-center", isCollapsed ? "justify-center px-0 pt-6 pb-4" : "px-5 pt-6 pb-4")}>
          <Link href="/dashboard" className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className={cn("relative shrink-0 transition-all duration-300", isCollapsed ? "h-9 w-9" : "h-11 w-11")}>
              <Image src="/youngin_whitebg.png" alt="YOUNGIN" fill className="object-contain drop-shadow-sm" priority />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -8 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-slate-900 text-[19px] font-extrabold tracking-[3px] uppercase truncate"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                YOUNGIN
              </motion.span>
            )}
          </Link>
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 h-px bg-slate-200 mb-2" />

        {/* ── Nav Items ── */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <div className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group",
                  isActive 
                    ? "text-slate-900" 
                    : "hover:text-slate-900"
                )}>
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-slate-100 rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <div className={cn(
                    "relative z-10 p-1.5 rounded-md transition-colors",
                    isActive ? "text-[#FF4D94]" : "text-slate-500 group-hover:text-slate-600"
                  )}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  
                  {!isCollapsed && (
                    <span className={cn(
                      "relative z-10 text-[13px] font-medium tracking-wide transition-colors",
                      isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-900"
                    )}>
                      {item.label}
                    </span>
                  )}

                  {/* Collapsed tooltip */}
                  {isCollapsed && (
                    <div className="fixed left-[80px] bg-white border border-slate-200 text-slate-900 px-3 py-1.5 rounded-md text-xs font-semibold opacity-0 group-hover:opacity-100 pointer-events-none z-[100] whitespace-nowrap transition-opacity shadow-xl">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Section ── */}
        <div className="mt-auto px-2 pb-3 space-y-2">
          {/* Collapse toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            {isCollapsed 
              ? <ChevronRight className="w-[18px] h-[18px] mx-auto" /> 
              : (
                <>
                  <ChevronLeft className="w-[18px] h-[18px]" />
                  <span className="text-[13px] font-medium">Collapse</span>
                </>
              )
            }
          </button>

          {/* Divider */}
          <div className="mx-2 h-px bg-slate-200" />

          {/* Profile */}
          <Link href="/profile">
            <div className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group",
              pathname === "/profile" 
                ? "bg-slate-100 text-slate-900" 
                : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
            )}>
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#FF4D94] to-[#B8005C] flex items-center justify-center shadow-lg">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold text-slate-900 truncate">Alex R.</span>
                  <span className="text-[11px] text-slate-500">Lv. 12</span>
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
