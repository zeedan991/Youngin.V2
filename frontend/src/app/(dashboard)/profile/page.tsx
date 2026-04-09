"use client";

import { motion, type Transition } from "framer-motion";
import { Settings, CreditCard, Clock, Shirt, Edit3, LogOut, ChevronRight, Trophy, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/app/login/actions";
import { fetchLiveProfile, updateProfile } from "./actions";
import { ACHIEVEMENTS, computeUnlockedAchievements, RARITY_COLORS, RARITY_LABELS } from "@/lib/achievements";

const SP: Transition = { duration: 0.6, ease: "easeOut" };

const surf = "rgba(255,255,255,0.05)";
const border = "rgba(255,255,255,0.08)";
const textMain = "#F0EBE3";
const textMuted = "rgba(240,235,227,0.45)";
const accent = "#FF4D94";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"settings" | "history" | "achievements" | "designs">("settings");
  const [designs, setDesigns] = useState<any[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchLiveProfile()
      .then((res) => {
        if (res.success && res.data) {
          setProfile(res.data);
          setUnlockedIds(computeUnlockedAchievements({
            username: (res.data as any).username,
            designs_count: (res.data as any).designs_count,
            created_at: (res.data as any).created_at,
          }));
        } else {
          setProfile({ full_name: "Guest User", email: "No session" });
        }
      })
      .catch(() => setProfile({ full_name: "User", level: 1 }));
  }, []);

  useEffect(() => {
    if (activeTab === "designs") {
      setLoadingDesigns(true);
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from("designs")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .then(({ data }) => {
              setDesigns(data || []);
              setLoadingDesigns(false);
            });
        } else {
          setLoadingDesigns(false);
        }
      });
    }
  }, [activeTab]);

  const tabs = [
    { id: "settings", label: "Account Settings", icon: Settings },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "history", label: "Order History", icon: Clock },
    { id: "designs", label: "Saved Designs", icon: Shirt },
  ] as const;

  const initials = (profile?.username || profile?.full_name || "YU")
    .split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    const result = await updateProfile(formData);
    if (result.success) {
      setProfile((prev: any) => ({
        ...prev,
        full_name: formData.get("full_name") as string,
        username: formData.get("username") as string,
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert("Failed to save: " + result.error);
    }
    setIsSaving(false);
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* ── Profile Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SP}
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-[3px]" style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}>
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-2xl font-black overflow-hidden"
                style={{ background: "#1A1A1A", color: textMain }}
              >
                {(profile?.avatar_url && !imageError) ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  initials
                )}
              </div>
            </div>
            <button
              className="absolute bottom-0 right-0 p-2 rounded-full border"
              style={{ background: "#1A1A1A", borderColor: border }}
            >
              <Edit3 className="w-3.5 h-3.5" style={{ color: textMuted }} />
            </button>
          </div>

          {/* Name */}
          <div>
            <h1
              className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2"
              style={{ color: textMain, fontFamily: "var(--font-syne)" }}
            >
              {profile?.username || profile?.full_name || "Loading..."}
            </h1>
            <p className="text-sm flex items-center gap-2 flex-wrap" style={{ color: textMuted }}>
              {profile?.username && <span style={{ color: textMain }}>{profile?.full_name}</span>}
              {profile?.username && <span>•</span>}
              <span>Level {profile?.level || 1}</span>
              <span>•</span>
              <span style={{ color: accent }}>Member since {memberSince}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => signout()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
          style={{ background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.2)", color: "#FF6B6B" }}
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </motion.header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* ── Nav Tabs ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...SP, delay: 0.1 }}
          className="w-full md:w-56 shrink-0 flex flex-col gap-2"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center justify-between p-4 rounded-2xl border transition-all text-left"
                style={{
                  background: isActive ? "rgba(255,77,148,0.1)" : surf,
                  borderColor: isActive ? "rgba(255,77,148,0.3)" : border,
                  color: isActive ? textMain : textMuted,
                }}
              >
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <Icon className="w-4 h-4" style={{ color: isActive ? accent : "inherit" }} />
                  {tab.label}
                </div>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </button>
            );
          })}
        </motion.div>

        {/* ── Content Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SP, delay: 0.2 }}
          className="flex-1 rounded-3xl border p-8 min-h-[420px]"
          style={{ background: surf, borderColor: border }}
        >
          {/* Account Settings */}
          {activeTab === "settings" && (
            <form action={handleSave} className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-extrabold" style={{ color: textMain }}>Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest" style={{ color: textMuted }}>Username</label>
                  <input
                    type="text" name="username"
                    defaultValue={profile?.username || ""}
                    placeholder="your_username"
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${border}`, color: textMain }}
                    onFocus={(e) => (e.target.style.borderColor = accent)}
                    onBlur={(e) => (e.target.style.borderColor = border)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest" style={{ color: textMuted }}>Full Name</label>
                  <input
                    type="text" name="full_name"
                    defaultValue={profile?.full_name || ""}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${border}`, color: textMain }}
                    onFocus={(e) => (e.target.style.borderColor = accent)}
                    onBlur={(e) => (e.target.style.borderColor = border)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest" style={{ color: textMuted }}>Email Address</label>
                  <input
                    type="email" disabled
                    defaultValue={profile?.email || ""}
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium cursor-not-allowed"
                    style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${border}`, color: textMuted }}
                  />
                </div>
              </div>
              <div className="pt-6 flex items-center justify-between" style={{ borderTop: `1px solid ${border}` }}>
                <button
                  type="submit" disabled={isSaving}
                  className="px-7 py-3 rounded-2xl font-black text-sm text-white hover:scale-105 transition-transform disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                {saveSuccess && (
                  <span className="text-sm font-bold animate-in fade-in" style={{ color: "#4ade80" }}>
                    ✓ Changes saved!
                  </span>
                )}
              </div>
            </form>
          )}

          {/* Achievements */}
          {activeTab === "achievements" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold" style={{ color: textMain }}>Achievements</h2>
                <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: "rgba(255,77,148,0.1)", color: accent }}>
                  {unlockedIds.length} / {ACHIEVEMENTS.length} unlocked
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((achievement) => {
                  const isUnlocked = unlockedIds.includes(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border transition-all"
                      style={{
                        background: isUnlocked ? "rgba(255,77,148,0.06)" : "rgba(255,255,255,0.02)",
                        borderColor: isUnlocked ? "rgba(255,77,148,0.2)" : border,
                        opacity: isUnlocked ? 1 : 0.45,
                      }}
                    >
                      <div
                        className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-xl shadow-md ${isUnlocked ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}` : "bg-white/5"}`}
                      >
                        {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-white/30" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate" style={{ color: isUnlocked ? textMain : textMuted }}>
                          {achievement.title}
                        </h4>
                        <p className="text-xs mt-0.5 leading-snug" style={{ color: textMuted }}>
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className="text-[10px] font-black uppercase tracking-widest"
                            style={{ color: isUnlocked ? accent : textMuted }}
                          >
                            {RARITY_LABELS[achievement.rarity]}
                          </span>
                          {isUnlocked && (
                            <span className="text-[10px] font-bold" style={{ color: "#4ade80" }}>
                              +{achievement.xpReward} XP ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order History */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-extrabold" style={{ color: textMain }}>Order History</h2>
              <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: textMuted }}>
                <Clock className="w-12 h-12 opacity-20" />
                <p className="font-semibold">No orders yet</p>
                <p className="text-sm">Your order history will appear here once you start ordering.</p>
              </div>
            </div>
          )}

          {/* Saved Designs */}
          {activeTab === "designs" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold" style={{ color: textMain }}>Your Designs</h2>
                <a href="/studio" className="text-sm font-black uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: accent }}>
                  + New Design
                </a>
              </div>
              {loadingDesigns ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: accent, borderTopColor: "transparent" }} />
                </div>
              ) : designs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-dashed" style={{ borderColor: border, color: textMuted }}>
                  <Shirt className="w-12 h-12 opacity-20" />
                  <p className="font-semibold">No designs saved yet</p>
                  <p className="text-sm text-center max-w-xs">Head to the 3D Studio to create your first design and unlock your first achievement!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {designs.map((design) => (
                    <div
                      key={design.id}
                      className="group rounded-2xl overflow-hidden border"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: border }}
                    >
                      <div className="aspect-[4/5] relative overflow-hidden">
                        <img src={design.storage_url} alt={design.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider" style={{ background: "rgba(0,0,0,0.6)", color: textMuted }}>
                          {design.type}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-sm truncate" style={{ color: textMain }}>{design.title}</h4>
                        <p className="text-[10px] mt-1" style={{ color: textMuted }}>{new Date(design.created_at).toLocaleDateString()}</p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => alert("Routing to manufacturing pipeline...")}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-white hover:scale-105 transition-transform"
                            style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}
                          >
                            Order Print
                          </button>
                          <button
                            className="p-2 border rounded-xl transition-colors hover:opacity-80"
                            style={{ borderColor: border, color: textMuted }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
