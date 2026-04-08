"use client";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { login, signup } from "./actions";

const SP = { type: "spring", stiffness: 80, damping: 18 } as const;

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.3 } },
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);

    if (mode === "signin") {
      const res = await login(formData);
      if (res?.error) setErrorMsg(res.error);
    } else {
      const res = await signup(formData);
      if (res?.error) setErrorMsg(res.error);
      if (res?.success) setSuccessMsg(res.success);
    }
    
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center overflow-hidden bg-[#000] relative selection:bg-[#FF4D94] selection:text-white">
      {/* WOW FACTOR: Fashion Editorial Layout */}
      <div className="absolute inset-0 z-0 bg-[#000]">
        <motion.div animate={{ opacity: [0.4, 0, 0, 0.4] }} transition={{ duration: 20, times: [0, 0.33, 0.66, 1], repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop" unoptimized={true} alt="Tailoring studio" fill className="object-cover mix-blend-luminosity grayscale" priority />
        </motion.div>
        
        <motion.div animate={{ opacity: [0, 0.4, 0, 0] }} transition={{ duration: 20, times: [0, 0.33, 0.66, 1], repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=2000&auto=format&fit=crop" unoptimized={true} alt="Fashion Sketches" fill className="object-cover mix-blend-luminosity grayscale" />
        </motion.div>
        
        <motion.div animate={{ opacity: [0, 0, 0.4, 0] }} transition={{ duration: 20, times: [0, 0.33, 0.66, 1], repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1537832816519-689ad163238b?q=80&w=2000&auto=format&fit=crop" unoptimized={true} alt="Measuring Tape" fill className="object-cover mix-blend-luminosity grayscale" />
        </motion.div>

        {/* Deep cinematic gradients to ensure form remains readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-[#000]/60 to-[#000]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000]/80 via-transparent to-[#000]/80" />
        
        {/* Bold Modern Fashion Typography overlays (The "some text" requested) */}
        <div className="absolute bottom-12 left-12 max-w-sm sm:max-w-md hidden md:block opacity-60 mix-blend-screen">
          <h2 className="text-white font-display font-medium text-lg sm:text-xl tracking-[0.3em] mb-3 uppercase">Design · Scan · Own</h2>
          <p className="text-white/60 font-medium text-xs sm:text-sm leading-relaxed tracking-wide">
            Upload your specifications directly to our global network of master tailors.
            Experience the future of made-to-measure fashion architecture.
          </p>
        </div>
      </div>

      {/* Back button - Pulled to Root to fix overlapping issue */}
      <button onClick={() => router.push("/")}
        className="fixed top-6 left-6 sm:top-10 sm:left-10 z-50 flex items-center gap-2 text-sm font-bold text-[#555] hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Youngin
      </button>

      {/* Auth form centered container */}
      <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ ...SP, delay: 0.1 }} 
        className="relative z-10 w-full max-w-[460px] px-6 mt-12 sm:mt-0">
        
        {/* Cooler Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-black text-white tracking-[6px] uppercase mb-3 drop-shadow-lg">YOUNGIN</h1>
          <p className="text-[#888] text-sm font-medium">Access your 3D measurement profile</p>
        </div>

        {/* Glassmorphic Panel */}
        <div className="w-full bg-[#111]/30 backdrop-blur-2xl rounded-[2rem] border border-white/[0.06] p-6 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">

          {/* Mode toggle */}
          <div className="flex bg-[#111] rounded-2xl p-1 mb-8 border border-white/[0.06]">
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${
                  mode === m ? "bg-[#FF4D94] text-white shadow-lg" : "text-[#555] hover:text-white"
                }`}>
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} variants={cardVariants} initial="hidden" animate="show" exit="exit">
              {/* Google auth */}
              <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm font-bold hover:bg-white/[0.07] transition-all mb-6">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[#444] text-xs font-bold tracking-widest uppercase">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Status Messages */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
                  {successMsg}
                </div>
              )}

              {/* Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {mode === "signup" && (
                  <div>
                    <label htmlFor="fullname" className="block text-[10px] text-[#555] font-bold uppercase tracking-[3px] mb-2">Full Name</label>
                    <input id="fullname" type="text" name="name" placeholder="Your name" required autoComplete="name"
                      className="w-full bg-[#111] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-[#333] focus:outline-none focus:border-[#FF4D94]/40 transition-colors" />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-[10px] text-[#555] font-bold uppercase tracking-[3px] mb-2">Email</label>
                  <input id="email" type="email" name="email" placeholder="you@example.com" required autoComplete="email"
                    className="w-full bg-[#111] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-[#333] focus:outline-none focus:border-[#FF4D94]/40 transition-colors" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-[10px] text-[#555] font-bold uppercase tracking-[3px] mb-2">Password</label>
                  <div className="relative">
                    <input id="password" type={showPass ? "text" : "password"} name="password" placeholder="••••••••" required autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className="w-full bg-[#111] border border-white/[0.08] rounded-xl px-4 py-3.5 pr-12 text-white text-sm placeholder:text-[#333] focus:outline-none focus:border-[#FF4D94]/40 transition-colors" />
                    <button type="button" onClick={() => setShowPass(!showPass)} aria-label="Toggle password visibility"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === "signin" && (
                  <div className="text-right">
                    <a href="#" className="text-xs font-bold text-[#555] hover:text-[#FF4D94] transition-colors">Forgot password?</a>
                  </div>
                )}

                <motion.button type="submit" disabled={isLoading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-[#FF4D94] hover:bg-[#ff3382] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60">
                  {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>{mode === "signin" ? "Sign In" : "Create Account"}<ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>

              <p className="text-center text-[#444] text-xs mt-6 leading-relaxed">
                By continuing, you agree to our{" "}
                <Link href="#" className="text-[#FF4D94] hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link href="#" className="text-[#FF4D94] hover:underline">Privacy Policy</Link>.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
