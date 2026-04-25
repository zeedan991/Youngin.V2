"use client";

import { motion } from "framer-motion";
import {
  Settings,
  CreditCard,
  Clock,
  Shirt,
  Camera,
  Edit3,
  LogOut,
  Trophy,
  Link as LinkIcon,
  AtSign,
  MapPin,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/app/login/actions";
import { fetchLiveProfile, updateProfile, deleteProfile } from "./actions";
import {
  ACHIEVEMENTS,
  computeUnlockedAchievements,
  RARITY_COLORS,
  RARITY_LABELS,
} from "@/lib/achievements";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "designs" | "achievements" | "history" | "settings"
  >("designs");
  const [designs, setDesigns] = useState<any[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  // Local form state
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    instagram: "",
    website: "",
  });

  useEffect(() => {
    fetchLiveProfile()
      .then((res) => {
        if (res.success && res.data) {
          setProfile(res.data);
          setFormData({
            full_name: res.data.full_name || "",
            username: res.data.username || "",
            bio: res.data.bio || "",
            instagram: res.data.instagram || "",
            website: res.data.website || "",
          });
          setUnlockedIds(
            computeUnlockedAchievements({
              username: (res.data as any).username,
              designs_count: (res.data as any).designs_count,
              created_at: (res.data as any).created_at,
            }),
          );
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

  const initials = (profile?.username || profile?.full_name || "YU")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append("avatar_url", profile.avatar_url || "");

    const result = await updateProfile(data);
    if (result.success) {
      setProfile((prev: any) => ({ ...prev, ...formData }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert("Failed to save: " + result.error);
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingAvatar(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const filename = `${user.id}-${Math.random().toString(36).substring(7)}`;
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filename, file, { upsert: true });
      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(data.path);

      const fData = new FormData();
      fData.append("avatar_url", publicUrl);
      Object.entries(formData).forEach(([key, value]) =>
        fData.append(key, value),
      );

      const res = await updateProfile(fData);
      if (res.success) {
        setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
        setImageError(false);
      }
    } catch (error: any) {
      alert("Failed to upload image.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  if (!profile) {
    return (
      <div className="w-full max-w-[1000px] mx-auto animate-pulse pb-20">
        <div className="h-48 md:h-64 rounded-b-3xl bg-white/5 w-full mb-20" />
        <div className="px-6 grid grid-cols-3 gap-6 opacity-30 mt-8">
          <div className="col-span-1 space-y-4">
            <div className="h-12 bg-white/10 rounded-xl" />
          </div>
          <div className="col-span-2 space-y-4">
            <div className="h-40 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto pb-20">
      {/* ── PROFILE HEADER & BANNER ── */}
      <div className="relative mb-6">
        {/* Banner */}
        <div
          className="h-40 md:h-56 w-full rounded-b-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(120deg, #1A1A24, #2D1A29)" }}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>

        {/* Avatar & Actions */}
        <div className="px-6 sm:px-10 relative flex justify-between items-end -mt-16 md:-mt-20">
          <div className="relative group cursor-pointer border-4 rounded-full border-[#0A0909]">
            <div
              className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-4xl font-black overflow-hidden relative z-10 transition-all ${uploadingAvatar ? "animate-pulse opacity-50" : "group-hover:opacity-90"}`}
              style={{ background: "#1F1F26", color: "var(--dash-text)" }}
            >
              {profile.avatar_url && !imageError ? (
                <img
                  src={profile.avatar_url}
                  referrerPolicy="no-referrer"
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                initials
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </div>

          <div className="flex gap-3 mb-2 md:mb-6">
            {activeTab !== "settings" && (
              <button
                onClick={() => setActiveTab("settings")}
                className="px-5 py-2 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5"
                style={{
                  borderColor: "var(--dash-border)",
                  color: "var(--dash-text)",
                }}
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={() => signout()}
              className="h-10 w-10 flex items-center justify-center rounded-xl border transition-colors hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
              style={{
                borderColor: "var(--dash-border)",
                color: "var(--dash-muted)",
              }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Block */}
        <div className="px-6 sm:px-10 mt-4">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-1 flex items-center gap-3"
            style={{ color: "var(--dash-text)" }}
          >
            {profile.full_name || profile.username}
            {profile.level >= 2 && (
              <CheckCircle2 className="w-6 h-6 text-blue-400 fill-blue-500/20" />
            )}
          </h1>
          <p
            className="text-sm font-medium mb-4"
            style={{ color: "var(--dash-muted)" }}
          >
            @{profile.username}
          </p>

          {profile.bio && (
            <p
              className="text-[15px] leading-relaxed max-w-2xl mb-4"
              style={{ color: "var(--dash-text)" }}
            >
              {profile.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
            <div
              className="flex items-center gap-1.5 text-sm"
              style={{ color: "var(--dash-muted)" }}
            >
              <Calendar className="w-4 h-4" /> Joined {memberSince}
            </div>
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm hover:underline"
                style={{ color: "var(--dash-accent)" }}
              >
                <LinkIcon className="w-4 h-4" />{" "}
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm hover:underline"
                style={{ color: "var(--dash-accent)" }}
              >
                <AtSign className="w-4 h-4" />{" "}
                {profile.instagram.replace("@", "")}
              </a>
            )}
          </div>

          <div className="flex gap-6">
            <div className="flex gap-1.5">
              <span
                className="font-bold text-[15px]"
                style={{ color: "var(--dash-text)" }}
              >
                {profile.following || 0}
              </span>
              <span
                className="text-[15px]"
                style={{ color: "var(--dash-muted)" }}
              >
                Following
              </span>
            </div>
            <div className="flex gap-1.5">
              <span
                className="font-bold text-[15px]"
                style={{ color: "var(--dash-text)" }}
              >
                {profile.followers || 0}
              </span>
              <span
                className="text-[15px]"
                style={{ color: "var(--dash-muted)" }}
              >
                Followers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div
        className="px-6 md:px-10 border-b mb-8 flex gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ borderColor: "var(--dash-border)" }}
      >
        {[
          { id: "designs", label: "Designs" },
          { id: "achievements", label: "Achievements" },
          { id: "history", label: "Order History" },
          { id: "settings", label: "Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap"
            style={{
              color:
                activeTab === tab.id ? "var(--dash-text)" : "var(--dash-muted)",
              borderColor:
                activeTab === tab.id ? "var(--dash-text)" : "transparent",
            }}
          >
            {tab.label}
            {tab.id === "designs" && (
              <span className="ml-2 bg-white/10 px-2 py-0.5 rounded-full text-xs">
                {designs.length || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="px-6 md:px-10 min-h-[400px]">
        {/* DESIGNS */}
        {activeTab === "designs" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {loadingDesigns ? (
              <div className="flex justify-center py-20">
                <div
                  className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                  style={{ borderColor: "var(--dash-accent)" }}
                />
              </div>
            ) : designs.length === 0 ? (
              <div
                className="py-20 flex flex-col items-center justify-center border border-dashed rounded-3xl"
                style={{ borderColor: "var(--dash-border)" }}
              >
                <Shirt
                  className="w-12 h-12 mb-4 opacity-20"
                  style={{ color: "var(--dash-text)" }}
                />
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--dash-text)" }}
                >
                  No designs yet
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--dash-muted)" }}
                >
                  Create your first 3D garment in the studio.
                </p>
                <Link href="/studio">
                  <button
                    className="px-6 py-2 rounded-xl text-sm font-bold text-white transition-transform hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #4F46E5, #3730A3)",
                    }}
                  >
                    Open Studio
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {designs.map((design: any) => (
                  <div
                    key={design.id}
                    className="group relative rounded-2xl overflow-hidden border flex flex-col"
                    style={{
                      borderColor: "var(--dash-border)",
                      background: "var(--dash-surface, rgba(255,255,255,0.04))",
                    }}
                  >
                    {/* Color & Image preview block */}
                    <div
                      className="aspect-square flex items-center justify-center relative overflow-hidden"
                      style={{ background: design.garment_color || "#F5F5F5" }}
                    >
                      {design.storage_url ? (
                        <img
                          src={design.storage_url}
                          alt="Design"
                          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-5xl">
                          {(
                            {
                              tshirt: "👕",
                              hoodie: "🧥",
                              jeans: "👖",
                              dress: "👗",
                              jacket: "🥼",
                              polo: "🎽",
                            } as any
                          )[design.type || (design.garment_type as string)] ||
                            "👕"}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <Link
                          href={`/studio`}
                          className="w-full py-1.5 bg-white text-black rounded-lg text-xs font-bold text-center hover:bg-gray-100 transition-colors"
                        >
                          Open in Studio
                        </Link>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <h4
                        className="font-bold text-sm truncate"
                        style={{ color: "var(--dash-text)" }}
                      >
                        {design.title || design.name}
                      </h4>
                      <p
                        className="text-[10px] uppercase tracking-wider mt-0.5 mb-1.5"
                        style={{ color: "var(--dash-muted)" }}
                      >
                        {design.type || design.garment_type || "tshirt"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[9px]"
                          style={{ color: "var(--dash-muted)" }}
                        ></span>
                        <span
                          className="text-[9px]"
                          style={{ color: "var(--dash-muted)" }}
                        >
                          {new Date(
                            design.updated_at ||
                              design.created_at ||
                              Date.now(),
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === "achievements" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = unlockedIds.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-2xl border flex gap-4"
                    style={{
                      borderColor: isUnlocked
                        ? "var(--dash-border)"
                        : "transparent",
                      background: isUnlocked
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(255,255,255,0.01)",
                      opacity: isUnlocked ? 1 : 0.4,
                    }}
                  >
                    <div
                      className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-xl shadow-sm ${isUnlocked ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}` : "bg-white/5"}`}
                    >
                      {achievement.icon}
                    </div>
                    <div>
                      <h4
                        className="font-bold text-sm"
                        style={{ color: "var(--dash-text)" }}
                      >
                        {achievement.title}
                      </h4>
                      <p
                        className="text-xs leading-snug mt-1 mb-2"
                        style={{ color: "var(--dash-muted)" }}
                      >
                        {achievement.description}
                      </p>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border"
                        style={{
                          color: isUnlocked
                            ? "var(--dash-accent)"
                            : "var(--dash-muted)",
                          borderColor: "var(--dash-border)",
                        }}
                      >
                        {RARITY_LABELS[achievement.rarity]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 flex flex-col items-center justify-center border border-dashed rounded-3xl"
            style={{ borderColor: "var(--dash-border)" }}
          >
            <Clock
              className="w-12 h-12 mb-4 opacity-20"
              style={{ color: "var(--dash-text)" }}
            />
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: "var(--dash-text)" }}
            >
              No past orders
            </h3>
            <p className="text-sm" style={{ color: "var(--dash-muted)" }}>
              Your purchase history will appear here.
            </p>
          </motion.div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <form onSubmit={handleSave} className="space-y-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3
                  className="font-bold text-lg"
                  style={{ color: "var(--dash-text)" }}
                >
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: "var(--dash-muted)" }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      className="w-full rounded-xl px-4 py-3 text-sm transition-colors border outline-none"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderColor: "var(--dash-border)",
                        color: "var(--dash-text)",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "var(--dash-text)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "var(--dash-border)")
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      className="text-xs font-semibold"
                      style={{ color: "var(--dash-muted)" }}
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          username: e.target.value.replace(
                            /[^a-zA-Z0-9_]/g,
                            "",
                          ),
                        })
                      }
                      className="w-full rounded-xl px-4 py-3 text-sm transition-colors border outline-none"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderColor: "var(--dash-border)",
                        color: "var(--dash-text)",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "var(--dash-text)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "var(--dash-border)")
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold"
                    style={{ color: "var(--dash-muted)" }}
                  >
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full rounded-xl px-4 py-3 text-sm transition-colors border outline-none resize-none min-h-[100px]"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      borderColor: "var(--dash-border)",
                      color: "var(--dash-text)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--dash-text)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--dash-border)")
                    }
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
              </div>

              <hr style={{ borderColor: "var(--dash-border)" }} />

              {/* Social Links */}
              <div className="space-y-4">
                <h3
                  className="font-bold text-lg"
                  style={{ color: "var(--dash-text)" }}
                >
                  Social Profiles
                </h3>

                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold"
                    style={{ color: "var(--dash-muted)" }}
                  >
                    Instagram
                  </label>
                  <div className="relative">
                    <AtSign
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "var(--dash-muted)" }}
                    />
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      placeholder="yourhandle"
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm transition-colors border outline-none"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderColor: "var(--dash-border)",
                        color: "var(--dash-text)",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "var(--dash-text)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "var(--dash-border)")
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold"
                    style={{ color: "var(--dash-muted)" }}
                  >
                    Website / Portfolio
                  </label>
                  <div className="relative">
                    <LinkIcon
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "var(--dash-muted)" }}
                    />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="https://example.com"
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm transition-colors border outline-none"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderColor: "var(--dash-border)",
                        color: "var(--dash-text)",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "var(--dash-text)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "var(--dash-border)")
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-black hover:bg-white/90 transition-colors disabled:opacity-50"
                  style={{ background: "var(--dash-text)" }}
                >
                  {isSaving ? "Saving..." : "Save Profile Information"}
                </button>
                {saveSuccess && (
                  <span className="text-sm font-bold text-green-500 animate-in fade-in">
                    ✓ Saved Successfully
                  </span>
                )}
              </div>
            </form>
            
            <hr style={{ borderColor: 'var(--dash-border)', marginTop: '40px', marginBottom: '40px' }} />
            
            {/* ── Danger Zone ── */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-red-500">Danger Zone</h3>
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-red-500">Delete Account</h4>
                  <p className="text-xs text-red-400/80 mt-1">
                    Once you delete your account, there is no going back. This will permanently delete your designs, achievements, and all associated data.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (confirm("Are you absolutely sure you want to delete your profile? This cannot be undone.")) {
                      const res = await deleteProfile();
                      if (res.success) {
                         window.location.href = "/";
                      } else {
                         alert("Failed to delete profile: " + res.error);
                      }
                    }
                  }}
                  className="shrink-0 px-6 py-2.5 rounded-lg border border-red-500/50 text-red-500 font-bold text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors"
                >
                  Delete Profile
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
