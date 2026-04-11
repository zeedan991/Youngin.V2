"use client";

import { motion, type Transition } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Palette,
  Wand2,
  LayoutTemplate,
  ShieldCheck,
  Calendar,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchLiveProfile } from "@/app/(dashboard)/profile/actions";
import { ACHIEVEMENTS, computeUnlockedAchievements, RARITY_COLORS, type Achievement } from "@/lib/achievements";
import AchievementToast from "@/components/dashboard/AchievementToast";

const SP: Transition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

type ProfileData = {
  full_name?: string;
  username?: string;
  level?: number;
  xp?: number;
  designs_count?: number;
  created_at?: string;
  achievements?: string[];
};

export default function DashboardClient({ initialProfile }: { initialProfile: ProfileData | null }) {
  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (initialProfile) {
      const unlocked = computeUnlockedAchievements({
        username: initialProfile.username,
        designs_count: initialProfile.designs_count,
        created_at: initialProfile.created_at,
      });
      setUnlockedIds(unlocked);

      const shownKey = "youngin_shown_achievements";
      const shown = JSON.parse(localStorage.getItem(shownKey) || "[]") as string[];
      const newlyEarned = unlocked.filter((id) => !shown.includes(id));
      if (newlyEarned.length > 0) {
        const first = ACHIEVEMENTS.find((a) => a.id === newlyEarned[0]);
        if (first) setToastAchievement(first);
        localStorage.setItem(shownKey, JSON.stringify([...shown, ...newlyEarned]));
      }
    }
  }, [initialProfile]);

  const displayName = profile?.username || profile?.full_name?.split(" ")[0] || "Creator";
  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const xpNext = level * 5000;
  const xpPercent = Math.min((xp / xpNext) * 100, 100);
  const designsCount = profile?.designs_count || 0;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id)).slice(0, 4);

  const quickActions = [
    {
      label: "Open 3D Studio",
      desc: "Design your next piece",
      href: "/studio",
      icon: Palette,
      gradient: "from-[#4F46E5] to-[#3730A3]",
    },
    {
      label: "AI Stylist",
      desc: "Personalized advice",
      href: "/ai-stylist",
      icon: Wand2,
      gradient: "from-purple-500 to-purple-800",
    },
    {
      label: "Style Quiz",
      desc: "Discover your identity",
      href: "/style-quiz",
      icon: Sparkles,
      gradient: "from-amber-400 to-orange-600",
    },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen">
      <AchievementToast achievement={toastAchievement} onClose={() => setToastAchievement(null)} />

      {/* ── BENTO GRID LAYOUT ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* ── ROW 1: HEADER (Col 1-8) & XP BAR (Col 9-12 or inline) ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SP}
          className="md:col-span-12 lg:col-span-8 flex flex-col justify-between rounded-[24px] p-6 border shadow-xl shadow-slate-200/50"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 w-full">
             <div>
                <p className="text-[10px] font-black uppercase tracking-[3px] mb-2" style={{ color: "var(--dash-accent)" }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight mb-1" style={{ color: "var(--dash-text)" }}>
                  Welcome play, <span style={{ color: "var(--dash-accent)" }}>{displayName}</span>
                </h1>
                <p style={{ color: "var(--dash-muted)" }} className="text-sm font-medium">
                  Your fashion command center. Let&apos;s create something iconic.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] uppercase tracking-wider font-bold" style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}>
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: "var(--dash-accent)" }} /> Level {level}
                </div>
                <Link href="/studio">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #4F46E5, #3730A3)" }}>
                    Open Studio <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
          </div>

          <div className="mt-6 pt-5 border-t w-full" style={{ borderColor: "var(--dash-border)" }}>
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--dash-muted)" }}>
                  XP Progress
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--dash-accent)" }}>
                  Next: Lvl {level + 1}
                </span>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #4F46E5, #3730A3)" }} />
                </div>
                <p className="text-xs font-extrabold shrink-0" style={{ color: "var(--dash-text)" }}>
                  {xp.toLocaleString()} <span style={{ color: "var(--dash-muted)" }}>/ {xpNext.toLocaleString()}</span>
                </p>
             </div>
          </div>
        </motion.div>

        {/* ── ROW 1/2: STATS (Col 9-12) ── */}
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ ...SP, delay: 0.1 }}
           className="md:col-span-12 lg:col-span-4 grid grid-cols-2 gap-4"
        >
          {[
            { label: "Designs", value: designsCount, icon: LayoutTemplate },
            { label: "Level", value: level, icon: TrendingUp },
            { label: "Awards", value: unlockedIds.length, icon: Sparkles },
            { label: "Since", value: memberSince, icon: Calendar },
          ].map((stat, i) => {
             return (
               <div key={stat.label} className="rounded-[24px] p-4 border flex flex-col justify-between shadow-xl shadow-slate-200/50" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                 <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-3" style={{ background: "var(--dash-accent-dim)" }}>
                    <stat.icon className="w-4 h-4" style={{ color: "var(--dash-accent)" }} />
                 </div>
                 <div>
                    <p className="text-[10px] uppercase tracking-widest font-extrabold" style={{ color: "var(--dash-muted)" }}>{stat.label}</p>
                    <p className="text-xl font-extrabold" style={{ color: "var(--dash-text)" }}>{stat.value}</p>
                 </div>
               </div>
             )
          })}
        </motion.div>

        {/* ── ROW 3: QUICK ACTIONS ── */}
        <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <motion.div key={action.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.15 + i * 0.05 }}>
              <Link href={action.href}>
                <div className="group rounded-[24px] p-5 border cursor-pointer border-transparent shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#4F46E5]/10 hover:border-[#4F46E5]/40 transition-all flex items-center gap-4" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                  <div className={`h-12 w-12 shrink-0 rounded-[14px] bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm mb-0.5" style={{ color: "var(--dash-text)" }}>{action.label}</h3>
                    <p className="text-[11px] leading-tight" style={{ color: "var(--dash-muted)" }}>{action.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── ROW 4: MY DESIGNS (Col 1-8) ── */}
        <motion.div
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ ...SP, delay: 0.2 }}
           className="md:col-span-12 lg:col-span-8 rounded-[24px] border p-6 flex flex-col shadow-xl shadow-slate-200/50"
           style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
        >
           <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold" style={{ color: "var(--dash-text)" }}>My Designs</h2>
                <p className="text-[11px]" style={{ color: "var(--dash-muted)" }}>Your latest studio creations</p>
              </div>
              <Link href="/studio">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all hover:scale-105" style={{ borderColor: "var(--dash-accent)", color: "var(--dash-accent)", background: "var(--dash-accent-dim)" }}>
                  + Design
                </button>
              </Link>
           </div>
           
           <div className="flex-1 flex flex-col justify-center">
             {designsCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-xl" style={{ background: "var(--dash-accent-dim)" }}>🎨</div>
                  <h3 className="text-sm font-extrabold" style={{ color: "var(--dash-text)" }}>No designs yet</h3>
                  <Link href="/studio">
                    <button className="mt-1 px-4 py-2 rounded-xl font-bold text-[11px] text-white hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, #4F46E5, #3730A3)" }}>Start Creating</button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: Math.min(designsCount, 4) }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl border flex items-center justify-center text-2xl" style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--dash-border)" }}>
                      <ImageIcon className="w-6 h-6 opacity-20" />
                    </div>
                  ))}
                </div>
              )}
           </div>
        </motion.div>

        {/* ── ROW 4: ACHIEVEMENTS (Col 9-12) ── */}
        <motion.div
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ ...SP, delay: 0.25 }}
           className="md:col-span-12 lg:col-span-4 rounded-[24px] border p-6 flex flex-col shadow-xl shadow-slate-200/50"
           style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
        >
          <div className="flex items-center justify-between mb-4 mt-[2px]">
             <div>
               <h2 className="text-lg font-extrabold" style={{ color: "var(--dash-text)" }}>Awards</h2>
               <p className="text-[11px]" style={{ color: "var(--dash-muted)" }}>{unlockedIds.length} unlocked</p>
             </div>
             <Link href="/profile">
               <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: "var(--dash-accent)" }}>
                 All <ArrowRight className="w-3 h-3" />
               </span>
             </Link>
          </div>

          <div className="flex flex-col gap-3 flex-1 justify-center">
             {unlockedAchievements.length > 0
                ? unlockedAchievements.map((achievement) => (
                    <div key={achievement.id} className="rounded-xl border p-3 flex items-center gap-3" style={{ background: "rgba(0,0,0,0.02)", borderColor: "var(--dash-border)" }}>
                      <div className={`h-8 w-8 shrink-0 rounded-[10px] bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} flex items-center justify-center text-sm shadow-md`}>
                        {achievement.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[12px] font-bold truncate leading-none mb-1" style={{ color: "var(--dash-text)" }}>{achievement.title}</h4>
                        <p className="text-[9px] font-black uppercase tracking-widest leading-none" style={{ color: "var(--dash-accent)" }}>+{achievement.xpReward} XP</p>
                      </div>
                    </div>
                  ))
                : ACHIEVEMENTS.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="rounded-xl border p-3 flex items-center gap-3 opacity-50 grayscale" style={{ borderColor: "var(--dash-border)", background: "var(--dash-surface-hover)" }}>
                      <div className="h-8 w-8 shrink-0 rounded-[10px] flex items-center justify-center text-sm" style={{ background: "rgba(0,0,0,0.05)" }}>
                        {achievement.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[12px] font-bold truncate leading-none mb-1" style={{ color: "var(--dash-text)" }}>{achievement.title}</h4>
                        <p className="text-[9px] leading-none" style={{ color: "var(--dash-muted)" }}>Locked</p>
                      </div>
                    </div>
                  ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

