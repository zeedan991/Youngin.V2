"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Image as ImageIcon,
  DollarSign,
  User,
  Scissors,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const NAV = [
  { label: "Dashboard", href: "/tailor/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/tailor/orders", icon: ClipboardList },
  { label: "Portfolio", href: "/tailor/portfolio", icon: ImageIcon },
  { label: "Financials", href: "/tailor/financials", icon: DollarSign },
  { label: "Business Profile", href: "/tailor/profile", icon: User },
];

export default function TailorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string; username: string; level: number; avatar_url: string | null }>({
    full_name: "Tailor",
    username: "",
    level: 1,
    avatar_url: null,
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from("profiles").select("full_name, username, level, avatar_url").eq("id", user.id).single().then(({ data }) => {
          if (data) setProfile(data as any);
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className={`h-screen flex flex-col border-r border-white/5 transition-all duration-300 sticky top-0 shrink-0 z-30 ${collapsed ? "w-[72px]" : "w-[220px]"}`}
      style={{ background: "#0A0A0F" }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-[#FF4D94] to-[#B8005C] flex items-center justify-center">
          <Scissors className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-black text-[#F0EBE3] tracking-wider text-sm" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
            YOUNGIN
          </span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FF4D94] bg-[#FF4D94]/10 px-2 py-1 rounded-md">
            🧵 Tailor Portal
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                active
                  ? "bg-[#FF4D94]/15 text-[#FF4D94]"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="tracking-wider uppercase">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-2 border-t border-white/5">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wider ${collapsed ? "justify-center" : ""}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>

      {/* Logout button — always visible */}
      <div className="px-2 pb-2">
        <button
          onClick={handleLogout}
          title="Sign Out"
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold uppercase tracking-wider ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* User */}
      <div className={`flex items-center gap-3 px-3 py-4 border-t border-white/5 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[#FF4D94] to-[#B8005C] flex items-center justify-center text-white font-black text-sm overflow-hidden">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
          ) : (
            profile.full_name?.[0]?.toUpperCase() || "T"
          )}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-[#F0EBE3] font-black text-xs truncate">{profile.full_name}</p>
            <p className="text-[#FF4D94] text-[9px] font-black uppercase tracking-wider">LV. {profile.level || 1} CREATOR</p>
          </div>
        )}
      </div>
    </aside>
  );
}
