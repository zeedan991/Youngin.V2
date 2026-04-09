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

const SP: Transition = { duration: 0.7, ease: [0.22, 1, 0.36, 1] };

type ProfileData = {
  full_name?: string;
  username?: string;
  level?: number;
  xp?: number;
  designs_count?: number;
  created_at?: string;
  achievements?: string[];
};

export default function DashboardOverviewPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchLiveProfile();
        if (res.success && res.data) {
          setProfile(res.data as ProfileData);
          const unlocked = computeUnlockedAchievements({
            username: (res.data as ProfileData).username,
            designs_count: (res.data as ProfileData).designs_count,
            created_at: (res.data as ProfileData).created_at,
          });
          setUnlockedIds(unlocked);

          // Show toast for first_login on very first visit
          const shownKey = "youngin_shown_achievements";
          const shown = JSON.parse(localStorage.getItem(shownKey) || "[]") as string[];
          const newlyEarned = unlocked.filter((id) => !shown.includes(id));
          if (newlyEarned.length > 0) {
            const first = ACHIEVEMENTS.find((a) => a.id === newlyEarned[0]);
            if (first) setToastAchievement(first);
            localStorage.setItem(shownKey, JSON.stringify([...shown, ...newlyEarned]));
          }
        }
      } catch (e) {
        console.error("Dashboard profile load failed:", e);
      }
    };
    load();
  }, []);

  const displayName = profile?.username || profile?.full_name?.split(" ")[0] || "Creator";
  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const xpNext = level * 5000;
  const xpPercent = Math.min((xp / xpNext) * 100, 100);
  const designsCount = profile?.designs_count || 0;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id)).slice(0, 4);

  const quickActions = [
    {
      label: "Open 3D Studio",
      desc: "Design & create your next piece",
      href: "/studio",
      icon: Palette,
      gradient: "from-[#FF4D94] to-[#B8005C]",
    },
    {
      label: "AI Stylist",
      desc: "Get personalized style advice",
      href: "/ai-stylist",
      icon: Wand2,
      gradient: "from-purple-500 to-purple-800",
    },
    {
      label: "Style Quiz",
      desc: "Discover your fashion identity",
      href: "/style-quiz",
      icon: Sparkles,
      gradient: "from-amber-400 to-orange-600",
    },
  ];

  return (
    <div className="w-full space-y-10">
      {/* ── Achievement Toast ── */}
      <AchievementToast achievement={toastAchievement} onClose={() => setToastAchievement(null)} />

      {/* ── Hero Welcome Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SP}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[4px] mb-3" style={{ color: "var(--dash-accent)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1
            className="text-3xl md:text-4xl font-extrabold leading-tight mb-2 tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--dash-text)" }}
          >
            Welcome back,{" "}
            <span style={{ color: "var(--dash-accent)" }}>{displayName}</span>
          </h1>
          <p style={{ color: "var(--dash-muted)" }} className="text-base font-medium">
            Your fashion command center. Let&apos;s create something iconic.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
          >
            <ShieldCheck className="w-4 h-4" style={{ color: "var(--dash-accent)" }} />
            Level {level} Creator
          </div>
          <Link href="/studio">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}
            >
              Open Studio <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </motion.header>

      {/* ── XP Progress Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SP, delay: 0.1 }}
        className="rounded-3xl p-6 border"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-black uppercase tracking-widest" style={{ color: "var(--dash-muted)" }}>
              XP Progress
            </span>
            <p className="text-2xl font-extrabold mt-1" style={{ color: "var(--dash-text)" }}>
              {xp.toLocaleString()} <span className="text-base font-medium" style={{ color: "var(--dash-muted)" }}>/ {xpNext.toLocaleString()} XP</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--dash-muted)" }}>Next Rank</p>
            <span className="text-sm font-black" style={{ color: "var(--dash-accent)" }}>
              Level {level + 1}
            </span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #FF4D94, #B8005C)" }}
          />
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SP, delay: 0.1 + i * 0.07 }}
            >
              <Link href={action.href}>
                <div
                  className="group rounded-3xl p-6 border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl"
                  style={{
                    background: "var(--dash-surface)",
                    borderColor: "var(--dash-border)",
                  }}
                >
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-extrabold text-base mb-1" style={{ color: "var(--dash-text)" }}>
                    {action.label}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--dash-muted)" }}>
                    {action.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-black uppercase tracking-wider transition-colors" style={{ color: "var(--dash-accent)" }}>
                    Go <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SP, delay: 0.25 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Designs Created", value: designsCount, icon: LayoutTemplate, suffix: "" },
          { label: "Current Level", value: level, icon: TrendingUp, suffix: "" },
          { label: "Achievements", value: unlockedIds.length, icon: Sparkles, suffix: "" },
          { label: "Member Since", value: memberSince, icon: Calendar, suffix: "" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-3xl p-5 border flex flex-col gap-3"
              style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
            >
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center"
                style={{ background: "var(--dash-accent-dim)" }}
              >
                <Icon className="w-5 h-5" style={{ color: "var(--dash-accent)" }} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: "var(--dash-muted)" }}>
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold" style={{ color: "var(--dash-text)" }}>
                  {stat.value}
                  {stat.suffix}
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── My Designs ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SP, delay: 0.3 }}
        className="rounded-3xl border p-8"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold mb-1" style={{ color: "var(--dash-text)" }}>
              My Designs
            </h2>
            <p className="text-sm" style={{ color: "var(--dash-muted)" }}>
              Everything you&apos;ve created in the studio
            </p>
          </div>
          <Link href="/studio">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all hover:scale-105"
              style={{ borderColor: "var(--dash-accent)", color: "var(--dash-accent)", background: "var(--dash-accent-dim)" }}
            >
              + New Design
            </button>
          </Link>
        </div>

        {designsCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="h-20 w-20 rounded-3xl flex items-center justify-center text-4xl"
              style={{ background: "var(--dash-accent-dim)" }}
            >
              🎨
            </div>
            <h3 className="text-lg font-extrabold" style={{ color: "var(--dash-text)" }}>
              No designs yet
            </h3>
            <p className="text-sm text-center max-w-xs" style={{ color: "var(--dash-muted)" }}>
              Head to the 3D Studio and create your first masterpiece to unlock your first achievement!
            </p>
            <Link href="/studio">
              <button
                className="mt-2 px-6 py-3 rounded-2xl font-bold text-sm text-white hover:scale-105 transition-transform"
                style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}
              >
                Start Creating
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: Math.min(designsCount, 4) }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl border flex items-center justify-center text-3xl"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--dash-border)" }}
              >
                <ImageIcon className="w-8 h-8 opacity-20" />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Achievements ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SP, delay: 0.35 }}
        className="rounded-3xl border p-8"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold mb-1" style={{ color: "var(--dash-text)" }}>
              Achievements
            </h2>
            <p className="text-sm" style={{ color: "var(--dash-muted)" }}>
              {unlockedIds.length} of {ACHIEVEMENTS.length} unlocked
            </p>
          </div>
          <Link href="/profile">
            <button className="text-xs font-black uppercase tracking-wider flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: "var(--dash-accent)" }}>
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {unlockedAchievements.length > 0
            ? unlockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="rounded-2xl border p-4 flex items-center gap-3 transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--dash-border)" }}
                >
                  <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} flex items-center justify-center text-lg shadow-lg`}>
                    {achievement.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate" style={{ color: "var(--dash-text)" }}>
                      {achievement.title}
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--dash-accent)" }}>
                      +{achievement.xpReward} XP
                    </p>
                  </div>
                </div>
              ))
            : ACHIEVEMENTS.slice(0, 4).map((achievement) => (
                <div
                  key={achievement.id}
                  className="rounded-2xl border p-4 flex items-center gap-3 opacity-30 grayscale"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--dash-border)" }}
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                    {achievement.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate" style={{ color: "var(--dash-text)" }}>
                      {achievement.title}
                    </h4>
                    <p className="text-[10px]" style={{ color: "var(--dash-muted)" }}>
                      Locked
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </motion.div>
    </div>
  );
}
