"use client";

import { useState, useEffect } from "react";
import { fetchLiveProfile, updateProfile } from "@/app/(dashboard)/profile/actions";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function UsernameOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await fetchLiveProfile();
        if (res.success && res.data) {
          const profile = res.data as any;
          // Trigger the onboarding UI if the core username field is missing
          if (!profile.username) {
            setIsOpen(true);
          }
        }
      } catch (e) {
        console.error("Failed to check profile for onboarding", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("username", username.toLowerCase().trim());

    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to save username. It might be taken.");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#0F0F14] border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#B8005C] flex items-center justify-center text-3xl shadow-lg shadow-pink-500/20">
            👋
          </div>
        </div>
        
        <h2 className="text-2xl font-extrabold text-[#F0EBE3] text-center mb-2" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
          Welcome to YOUNGIN
        </h2>
        <p className="text-white/40 text-sm text-center mb-8 font-medium">
          Before you dive in, let&apos;s claim your unique creator username.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">
              Choose Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">@</span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="creator_99"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-9 pr-4 text-[#F0EBE3] font-bold placeholder:text-white/20 focus:outline-none focus:border-[#FF4D94] transition-colors"
                autoFocus
              />
            </div>
            {error && <p className="text-[#FF4D94] text-xs font-bold mt-2 ml-1">{error}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl mt-4 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}
          >
            {isSubmitting ? "Saving..." : "Claim Username & Continue"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
