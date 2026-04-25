"use client";

import { useState, useEffect } from "react";
import {
  fetchLiveProfile,
  updateProfile,
} from "@/app/(dashboard)/profile/actions";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, ShoppingBag, ArrowRight, Check } from "lucide-react";

type Step = "username" | "role";

export default function UsernameOnboarding() {
  const [step, setStep] = useState<Step>("username");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<"user" | "tailor" | null>(
    null,
  );
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await fetchLiveProfile();
        if (res.success && res.data) {
          const profile = res.data as any;
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

  const handleUsernameSubmit = async (e: React.FormEvent) => {
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
        setStep("role");
      } else {
        setError(res.error || "Failed to save username. It might be taken.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSubmit = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("role", selectedRole);
    try {
      await updateProfile(formData);
      setIsOpen(false);
      if (selectedRole === "tailor") {
        router.push("/tailor/dashboard");
      } else {
        router.refresh();
      }
    } catch {
      // continue anyway
      setIsOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl px-4">
      <AnimatePresence mode="wait">
        {step === "username" ? (
          <motion.div
            key="username"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-md bg-[#0F0F14] border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#3730A3] flex items-center justify-center text-3xl shadow-lg shadow-pink-500/20">
                👋
              </div>
            </div>
            <h2
              className="text-2xl font-extrabold text-[#F0EBE3] text-center mb-2"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              Welcome to YOUNGIN
            </h2>
            <p className="text-white/40 text-sm text-center mb-8 font-medium">
              Before you dive in, let&apos;s claim your unique creator username.
            </p>

            {/* Progress */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3730A3]" />
              <div className="flex-1 h-1 rounded-full bg-white/10" />
            </div>

            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">
                  Choose Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                    }
                    placeholder="creator_99"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-9 pr-4 text-[#F0EBE3] font-bold placeholder:text-white/20 focus:outline-none focus:border-[#4F46E5] transition-colors"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-[#4F46E5] text-xs font-bold mt-2 ml-1">
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl mt-4 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-bold text-sm text-white"
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #3730A3)",
                }}
              >
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="role"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-lg bg-[#0F0F14] border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            {/* Progress */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3730A3]" />
              <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#3730A3]" />
            </div>

            <h2
              className="text-2xl font-extrabold text-[#F0EBE3] text-center mb-2"
              style={{ fontFamily: "var(--font-syne), sans-serif" }}
            >
              How will you use YOUNGIN?
            </h2>
            <p className="text-white/40 text-sm text-center mb-8 font-medium">
              This helps us personalise your experience. You can always switch
              later.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Consumer Card */}
              <button
                onClick={() => setSelectedRole("user")}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all group ${
                  selectedRole === "user"
                    ? "border-[#4F46E5] bg-[#4F46E5]/10"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                {selectedRole === "user" && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#4F46E5] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-black text-[#F0EBE3] text-sm mb-1">
                  I&apos;m a Shopper
                </h3>
                <p className="text-white/40 text-[11px] leading-tight">
                  Discover fashion, try on clothes, and find tailors
                </p>
              </button>

              {/* Tailor Card */}
              <button
                onClick={() => setSelectedRole("tailor")}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all group ${
                  selectedRole === "tailor"
                    ? "border-[#4F46E5] bg-[#4F46E5]/10"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                {selectedRole === "tailor" && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#4F46E5] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F46E5]/20 to-[#3730A3]/20 border border-[#4F46E5]/20 flex items-center justify-center mb-4">
                  <Scissors className="w-6 h-6 text-[#4F46E5]" />
                </div>
                <h3 className="font-black text-[#F0EBE3] text-sm mb-1">
                  I&apos;m a Tailor
                </h3>
                <p className="text-white/40 text-[11px] leading-tight">
                  Showcase your work, get orders & manage clients
                </p>
              </button>
            </div>

            <button
              onClick={handleRoleSubmit}
              disabled={!selectedRole || isSubmitting}
              className="w-full py-4 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 font-bold text-sm text-white"
              style={{
                background: selectedRole
                  ? "linear-gradient(135deg, #4F46E5, #3730A3)"
                  : "rgba(255,255,255,0.1)",
              }}
            >
              {isSubmitting ? (
                "Setting up your workspace..."
              ) : (
                <>
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
