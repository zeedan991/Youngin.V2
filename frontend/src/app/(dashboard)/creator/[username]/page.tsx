"use client";

import { motion, type Transition } from "framer-motion";
import { useEffect, useState } from "react";
import { use } from "react";
import { Trophy, AtSign, Globe, Shirt, UserPlus, UserCheck, Flame } from "lucide-react";
import { getUserProfile, toggleFollow } from "@/app/(dashboard)/community/actions";
import { RARITY_COLORS } from "@/lib/achievements";
import Image from "next/image";

const SP: Transition = { duration: 0.6, ease: "easeOut" };
const surf = "rgba(255,255,255,0.04)";
const border = "rgba(255,255,255,0.08)";
const textMain = "#F0EBE3";
const textMuted = "rgba(240,235,227,0.45)";
const accent = "#4F46E5";

export default function CreatorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    getUserProfile(username).then((res) => {
      if (res.success && res.data) {
        setData(res.data);
        setIsFollowing(res.data.isFollowing);
        setFollowerCount(res.data.followers);
        setImageError(false);
      } else {
        setError(res.error || "Creator not found");
      }
      setLoading(false);
    });
  }, [username]);

  const handleFollow = async () => {
    if (!data || data.data?.isSelf) return;
    setFollowLoading(true);
    // Optimistic UI updates
    setIsFollowing(!isFollowing);
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
    
    const res = await toggleFollow(data.profile.id);
    if (!res.success) {
      // Revert if failed
      setIsFollowing(isFollowing);
      setFollowerCount(prev => isFollowing ? prev + 1 : prev - 1);
      alert(res.error);
    }
    setFollowLoading(false);
  };

  if (loading) return (
    <div className="w-full flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: accent, borderTopColor: "transparent" }} />
    </div>
  );
  
  if (error || !data) return (
    <div className="w-full flex flex-col items-center justify-center py-20 gap-4">
      <h2 className="text-2xl font-black" style={{ color: textMain }}>{error}</h2>
      <a href="/dashboard" className="text-sm font-bold hover:opacity-80 transition-opacity" style={{ color: accent }}>← Back to Dashboard</a>
    </div>
  );

  const { profile, designs, following, isSelf } = data;
  const initials = (profile?.username || profile?.full_name || "YU")
    .split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

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
          <div className="relative">
            <div className="w-28 h-28 rounded-full p-[3px] shadow-2xl" style={{ background: "linear-gradient(135deg, #4F46E5, #3730A3)" }}>
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-3xl font-black overflow-hidden"
                style={{ background: "#1A1A1A", color: textMain }}
              >
                {(profile?.avatar_url && !imageError) ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                ) : (
                  initials
                )}
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2" style={{ color: textMain, fontFamily: "var(--font-syne)" }}>
              {profile?.full_name || `@${profile.username}`}
            </h1>
            
            <div className="flex items-center gap-4 mb-3">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: textMain, background: "rgba(255,255,255,0.05)", borderColor: border }}>
                @{profile.username}
              </span>
              {profile.instagram && (
                <a href={`https://instagram.com/${profile.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-105" style={{ color: accent }}>
                  <AtSign className="w-3.5 h-3.5" /> IG
                </a>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-105" style={{ color: accent }}>
                  <Globe className="w-3.5 h-3.5" /> Site
                </a>
              )}
            </div>
            
            {profile.bio && (
              <p className="max-w-xl text-sm mb-4 leading-relaxed" style={{ color: textMuted }}>
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-xl font-black" style={{ color: textMain }}>{followerCount}</span>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black" style={{ color: textMain }}>{following}</span>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>Following</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black" style={{ color: textMain }}>{designs.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>Designs</span>
              </div>
            </div>
          </div>
        </div>

        {!isSelf && (
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105"
            style={{ 
              background: isFollowing ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #4F46E5, #3730A3)",
              color: isFollowing ? textMain : "white",
              border: isFollowing ? `1px solid ${border}` : "none"
            }}
          >
            {isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
          </button>
        )}
      </motion.header>

      {/* ── Public Portfolio Grid ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.1 }}>
        <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2" style={{ color: textMain }}>
          <Flame className="w-5 h-5" style={{ color: accent }} /> Public Portfolio
        </h2>
        
        {designs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border" style={{ background: surf, borderColor: border, color: textMuted }}>
            <Shirt className="w-12 h-12 opacity-20 mb-3" />
            <p className="font-bold text-lg" style={{ color: textMain }}>No Designs Yet</p>
            <p className="text-sm">This creator hasn't published any designs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {designs.map((design: any) => (
              <div key={design.id} className="group rounded-3xl overflow-hidden border transition-all hover:scale-[1.02]" style={{ background: surf, borderColor: border }}>
                <div className="aspect-[4/5] relative bg-slate-900 overflow-hidden">
                  <img src={design.storage_url} alt={design.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md" style={{ background: "rgba(0,0,0,0.5)", color: textMain, border: `1px solid ${border}` }}>
                    {design.type}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="font-bold text-sm text-white truncate drop-shadow-md">{design.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
