"use client";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GradientMesh } from "@/components/ui/GradientMesh";
import { Eye, EyeOff, ArrowRight, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPass, setShowPass] = useState(false);

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 relative overflow-hidden">
      <GradientMesh />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <Link href="/" className="text-white font-[900] text-2xl tracking-[6px]">YOUNGIN</Link>
          <p className="text-[#555] text-sm mt-2">Design. Fit. Wear.</p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="glass-panel rounded-2xl p-8"
        >
          {/* Mode toggle */}
          <div className="flex bg-[#0A0A0A] rounded-xl p-1 mb-8">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-bold transition-all capitalize",
                  mode === m
                    ? "bg-[#00E5FF] text-[#0A0A0A]"
                    : "text-[#666] hover:text-white"
                )}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Google auth */}
          <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-all mb-6">
            <Globe className="w-4 h-4" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[#444] text-xs font-medium">or with email</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Form */}
          <form className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs text-[#888] font-bold uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-[#888] font-bold uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-[#888] font-bold uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-[#111] border border-white/8 rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "signin" && (
              <div className="text-right">
                <a href="#" className="text-xs text-[#555] hover:text-[#00E5FF] transition-colors">
                  Forgot password?
                </a>
              </div>
            )}

            <Button variant="primary" size="lg" className="w-full mt-2">
              {mode === "signin" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </motion.div>

        <p className="text-center text-[#444] text-xs mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-[#00E5FF] hover:underline">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="text-[#00E5FF] hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}
