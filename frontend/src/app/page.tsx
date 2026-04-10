"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  useInView,
} from "framer-motion";

// ─── Spring presets ───────────────────────────────────────────────────────────
const SP = { type: "spring", stiffness: 80, damping: 18 } as const;
const SP_FAST = { type: "spring", stiffness: 130, damping: 22 } as const;

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Animation Variants ───────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const fadeUp  = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: SP } };
const fadeIn  = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6 } } };

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-bold tracking-[4px] uppercase text-slate-400">
      {children}
    </p>
  );
}


// ─── Full 33-point MediaPipe Pose Landmarks ───────────────────────────────────
const LM: [number, number][] = [
  [100,22],[94,17],[88,14],[82,16],[106,17],[112,14],[118,16],[77,24],[123,24],
  [95,28],[105,28],
  [62,70],[138,70],
  [44,132],[156,132],
  [34,196],[166,196],
  [27,213],[173,213],[26,206],[174,206],[29,209],[171,209],
  [78,212],[122,212],
  [68,302],[132,302],
  [63,382],[137,382],[59,394],[141,394],[54,405],[146,405],
];
const BONES: [number,number][] = [
  [0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],[9,10],
  [11,12],
  [11,13],[13,15],[15,17],[15,19],[17,19],
  [12,14],[14,16],[16,18],[16,20],[18,20],
  [11,23],[12,24],[23,24],
  [23,25],[25,27],[27,29],[27,31],
  [24,26],[26,28],[28,30],[28,32],
];

function BodyScanViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const measurements = [
    { key: "Chest",    val: "96.2 cm", pct: 98 },
    { key: "Waist",    val: "78.1 cm", pct: 99 },
    { key: "Inseam",   val: "82.4 cm", pct: 97 },
    { key: "Shoulder", val: "44.7 cm", pct: 99 },
    { key: "Neck",     val: "37.5 cm", pct: 96 },
    { key: "Hip",      val: "94.8 cm", pct: 98 },
  ];
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 50, scale: 0.96 }} animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ ...SP, delay: 0.3 }} className="relative mx-auto mt-12 max-w-3xl">
      <div className="absolute inset-x-20 -top-8 h-24 rounded-full bg-[#FF4D94]/8 blur-3xl pointer-events-none" />
      <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f0f14] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <motion.span animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="h-2.5 w-2.5 rounded-full bg-[#FF4D94]" />
            <span className="text-xs font-bold tracking-[3px] uppercase text-slate-400">Live Body Scan · AI Active</span>
          </div>
          <div className="flex items-center gap-3">
            {inView && (<motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.8 }} className="rounded-full bg-[#FF4D94]/15 px-3 py-1 text-[11px] font-extrabold text-[#FF4D94]">33 / 33 Landmarks ✓</motion.span>)}
            <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-bold text-slate-500">2.3s</span>
          </div>
        </div>
        <div className="grid md:grid-cols-[1fr_1fr] min-h-[300px]">
          <div className="relative flex items-center justify-center py-6 bg-[#0f0f14] border-r border-slate-800">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-24 h-64 rounded-full bg-[#FF4D94]/6 blur-[60px]" /></div>
            <svg viewBox="0 0 200 420" className="relative z-10 h-[220px] w-auto overflow-visible" fill="none">
              <defs>
                <filter id="lm-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="scan-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="transparent"/><stop offset="35%" stopColor="#FF4D94" stopOpacity="0.9"/><stop offset="65%" stopColor="#FF4D94" stopOpacity="0.9"/><stop offset="100%" stopColor="transparent"/></linearGradient>
              </defs>
              <circle cx="100" cy="25" r="19" fill="rgba(255,255,255,0.04)" stroke="rgba(255,77,148,0.18)" strokeWidth="1"/>
              <rect x="93" y="44" width="14" height="17" rx="4" fill="rgba(255,255,255,0.03)"/>
              <path d="M58,61 C52,68 48,85 50,108 L50,152 C50,164 64,172 75,177 L75,215 L125,215 L125,177 C136,172 150,164 150,152 L150,108 C152,85 148,68 142,61 C134,56 118,54 100,54 C82,54 66,56 58,61 Z" fill="rgba(255,255,255,0.035)" stroke="rgba(255,77,148,0.1)" strokeWidth="1"/>
              <ellipse cx="100" cy="116" rx="35" ry="44" fill="none" stroke="rgba(255,77,148,0.18)" strokeWidth="1" strokeDasharray="3,3"/>
              <ellipse cx="100" cy="210" rx="26" ry="13" fill="none" stroke="rgba(255,77,148,0.14)" strokeWidth="1" strokeDasharray="3,3"/>
              <line x1="100" y1="61" x2="100" y2="212" stroke="rgba(255,77,148,0.25)" strokeWidth="1.5" strokeDasharray="5,4"/>
              <path d="M100,62 C89,60 76,64 62,70" stroke="rgba(160,160,200,0.35)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M100,62 C111,60 124,64 138,70" stroke="rgba(160,160,200,0.35)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M62,70 C53,98 46,120 44,132 C42,148 37,172 34,196" stroke="rgba(255,255,255,0.04)" strokeWidth="16" strokeLinecap="round"/>
              <path d="M138,70 C147,98 154,120 156,132 C158,148 163,172 166,196" stroke="rgba(255,255,255,0.04)" strokeWidth="16" strokeLinecap="round"/>
              <path d="M78,212 C74,244 70,272 68,302 C66,332 64,358 63,382" stroke="rgba(255,255,255,0.05)" strokeWidth="22" strokeLinecap="round"/>
              <path d="M122,212 C126,244 130,272 132,302 C134,332 136,358 137,382" stroke="rgba(255,255,255,0.05)" strokeWidth="22" strokeLinecap="round"/>
              {BONES.map(([a, b], i) => (
                <motion.line key={i} x1={LM[a][0]} y1={LM[a][1]} x2={LM[b][0]} y2={LM[b][1]} stroke="rgba(255,77,148,0.55)" strokeWidth="1.8" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={inView ? { pathLength: 1, opacity: 1 } : {}} transition={{ delay: 0.5 + i * 0.04, duration: 0.5, ease: "easeOut" }} />
              ))}
              {LM.map(([cx, cy], i) => (
                <motion.circle key={i} cx={cx} cy={cy} r={i < 11 ? 2.5 : 3.8} fill={i < 11 ? "rgba(255,180,210,0.9)" : "#FF4D94"} filter="url(#lm-glow)" initial={{ scale: 0, opacity: 0 }} animate={inView ? { scale: 1, opacity: 1 } : {}} transition={{ delay: 1.3 + i * 0.06, type: "spring", stiffness: 300, damping: 12 }} />
              ))}
              {inView && (<motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}><line x1="62" y1="54" x2="138" y2="54" stroke="rgba(255,77,148,0.7)" strokeWidth="1" strokeDasharray="2,2"/><line x1="62" y1="50" x2="62" y2="58" stroke="rgba(255,77,148,0.9)" strokeWidth="1.5"/><line x1="138" y1="50" x2="138" y2="58" stroke="rgba(255,77,148,0.9)" strokeWidth="1.5"/><rect x="80" y="44" width="40" height="14" rx="4" fill="rgba(255,77,148,0.2)"/><text x="100" y="54.5" textAnchor="middle" fill="#FF4D94" fontSize="7.5" fontWeight="bold">44.7 cm</text></motion.g>)}
              {inView && (<motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.9 }}><line x1="10" y1="152" x2="51" y2="152" stroke="rgba(255,77,148,0.5)" strokeWidth="1" strokeDasharray="2,2"/><rect x="-16" y="144" width="26" height="14" rx="4" fill="rgba(255,77,148,0.2)"/><text x="-3" y="154" textAnchor="middle" fill="#FF4D94" fontSize="6.5" fontWeight="bold">78.1</text></motion.g>)}
              {inView && (<motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.1 }}><line x1="150" y1="212" x2="150" y2="382" stroke="rgba(255,77,148,0.4)" strokeWidth="1" strokeDasharray="2,2"/><line x1="146" y1="212" x2="154" y2="212" stroke="rgba(255,77,148,0.7)" strokeWidth="1.5"/><line x1="146" y1="382" x2="154" y2="382" stroke="rgba(255,77,148,0.7)" strokeWidth="1.5"/><rect x="152" y="282" width="34" height="14" rx="4" fill="rgba(255,77,148,0.2)"/><text x="169" y="292" textAnchor="middle" fill="#FF4D94" fontSize="6.5" fontWeight="bold">82.4 cm</text></motion.g>)}
              {inView && (<motion.rect x="15" width="170" height="3" rx="1.5" fill="url(#scan-sweep)" filter="url(#lm-glow)" initial={{ y: 10, opacity: 0 }} animate={{ y: [10, 408, 10], opacity: [0, 1, 1, 1, 0] }} transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8, opacity: { duration: 3.5, times: [0, 0.05, 0.5, 0.95, 1], repeat: Infinity, repeatDelay: 0.8 } }} />)}
            </svg>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} className="flex items-center gap-2 rounded-full bg-[#1a1a22] border border-slate-700 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D94] animate-pulse"/>
                <span className="text-[10px] font-bold tracking-[2px] uppercase text-slate-400">Mapping Geometry...</span>
              </motion.div>
            </div>
          </div>
          <div className="flex flex-col bg-white">
            <div className="flex-1 divide-y divide-slate-100">
              {measurements.map((m, i) => (
                <motion.div key={m.key} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors" initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ ...SP, delay: 1.5 + i * 0.15 }}>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-[2.5px] text-slate-400">{m.key}</span>
                    <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-[#FF4D94] to-[#ff79b0] rounded-full" initial={{ width: 0 }} animate={inView ? { width: `${m.pct}%` } : {}} transition={{ delay: 2.0 + i * 0.15, duration: 1.2, ease: "easeOut" }} />
                    </div>
                  </div>
                  <motion.span className="font-display text-xl font-black text-slate-900 tabular-nums" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 2.2 + i * 0.15 }}>{m.val}</motion.span>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 3.2, ...SP }} className="m-5 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#e0307a] p-5 text-white shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div><p className="text-[9px] font-bold tracking-[3px] uppercase mb-1 text-white/70">Fit Confidence</p><p className="font-display text-4xl font-black">98.4%</p></div>
                <div className="text-right"><p className="text-[9px] font-bold tracking-wider text-white/70 mb-1">LANDMARKS</p><p className="text-2xl font-black">33/33</p><p className="text-[9px] text-white/60 font-bold mt-0.5">±1mm accuracy</p></div>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div className="h-full bg-white rounded-full" initial={{ width: 0 }} animate={inView ? { width: "98.4%" } : {}} transition={{ delay: 3.5, duration: 1.4, ease: "easeOut" }} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Marquee Strip ────────────────────────────────────────────────────────────
function MarqueeStrip() {
  const tags = ["±1mm Accuracy", "33 Landmarks", "2.3s Scan", "Zero Equipment", "98.4% Confidence", "AI-Powered", "3D Body Map", "Global Tailors", "Zero Returns", "Your Exact Fit"];
  return (
    <div className="relative z-10 overflow-hidden border-y border-slate-200 bg-transparent py-5">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        className="flex gap-10 whitespace-nowrap w-max"
      >
        {[...tags, ...tags].map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-3 text-sm font-bold tracking-[2px] uppercase text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D94]" />
            {tag}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Bold Statement Banner ────────────────────────────────────────────────────
function StatementBanner() {
  return (
    <section className="relative z-10 overflow-hidden bg-transparent py-28 sm:py-40 border-t border-slate-200">
      {/* Glow orbs */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF4D94]/12 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={SP} viewport={{ once: true }}>
          <p className="text-[10px] font-bold uppercase tracking-[4px] text-[#FF4D94] mb-8">The New Standard</p>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
            Size&nbsp;S, M, L, XL<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D94] to-violet-400">were&nbsp;a&nbsp;lie.</span>
          </h2>
          <p className="mt-8 text-lg sm:text-xl text-slate-500 font-medium max-w-xl mx-auto">
            Invented for factories. Not for bodies. We map your exact geometry.
          </p>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ...SP }} viewport={{ once: true }} className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 12px 32px rgba(255,77,148,0.35)" }} whileTap={{ scale: 0.97 }} transition={SP_FAST} className="rounded-full bg-[#FF4D94] px-10 py-4 text-sm font-bold text-white hover:bg-[#ff3382] transition-colors">
                Start Your Scan →
              </motion.button>
            </Link>
            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
              <span className="h-px w-8 bg-slate-300" />
              No credit card required
              <span className="h-px w-8 bg-slate-300" />
            </div>
          </motion.div>
        </motion.div>

        {/* Floating data pills */}
        <div className="mt-20 flex flex-wrap justify-center gap-4">
          {[
            { val: "70+", label: "Micro-measurements" },
            { val: "2.3s", label: "Scan time" },
            { val: "±1mm", label: "Accuracy" },
            { val: "98%", label: "Fewer returns" },
          ].map((d, i) => (
            <motion.div key={d.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i, ...SP }} viewport={{ once: true }}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-sm px-6 py-4">
              <span className="font-display text-3xl font-black text-slate-900">{d.val}</span>
              <span className="text-sm text-slate-500 font-medium max-w-[80px] leading-snug">{d.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        setIsLoading(false);
      }
    };
    
    // We replace the hardcoded timeout with the auth check
    checkUserAndRedirect();
  }, [router]);

  function handleSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
  }

  const { scrollYProgress } = useScroll({ target: containerRef });
  const rawY = useTransform(scrollYProgress, [0, 0.25], [0, -50]);
  const rawO = useTransform(scrollYProgress, [0, 0.25], [1, 0.4]);
  const heroY = useSpring(rawY, { stiffness: 60, damping: 20 });
  const heroO = useSpring(rawO, { stiffness: 60, damping: 20 });

  const navLinks = ["3D Studio", "Marketplace", "Tailors", "Brands"];



  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-white text-slate-900">

      {/* ════ LOADING ════ */}
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
            <div className="relative h-[250px] w-[600px] sm:h-[300px] sm:w-[800px] mb-12 flex justify-center">
              <Image src="/youngin_whitebg.png?v=6" unoptimized={true} alt="YOUNGIN" fill className="object-contain" priority />
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-10 w-10 rounded-full border-[3px] border-slate-200 border-t-[#FF4D94]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] z-0"
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* ════ FLOATING NAV — wider + bigger logo ════ */}
      <div className="fixed top-5 left-0 right-0 z-50 px-4 sm:px-8 flex justify-center pointer-events-none">
        <motion.nav initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.05 }}
          className="pointer-events-auto flex w-full max-w-[1260px] items-center justify-between rounded-full border border-slate-700/60 bg-[#1a1a22]/95 px-6 py-3 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.25)]">

          {/* Logo — bare text */}
          <Link href="/" className="flex items-center shrink-0 relative">
            <span className="font-display text-xl sm:text-2xl font-black tracking-[8px] text-white uppercase mt-0.5 relative z-10 pointer-events-auto">YOUNGIN</span>
          </Link>

          {/* Nav links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link, i) => (
              <motion.a key={link} href="#" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.1 + i * 0.05 }}
                className="text-[13px] font-semibold tracking-wide text-white/80 transition-colors hover:text-[#FF4D94]">{link}</motion.a>
            ))}
          </div>

          {/* Hamburger */}
          <button className="flex flex-col items-end justify-center gap-1.5 p-2 md:hidden" aria-label="Open menu">
            <span className="h-0.5 w-6 rounded-full bg-white block" />
            <span className="h-0.5 w-6 rounded-full bg-white block" />
            <span className="h-0.5 w-4 rounded-full bg-white block" />
          </button>

          {/* CTA cluster */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SP, delay: 0.3 }} className="hidden items-center gap-5 md:flex">
            <Link href="/login" className="text-[13px] font-semibold tracking-wide text-white/80 hover:text-[#FF4D94] transition-colors">Sign In</Link>
            <Link href="/login">
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 4px 24px rgba(255,77,148,0.25)" }} whileTap={{ scale: 0.96 }} transition={SP_FAST}
                className="rounded-full bg-[#FF4D94] px-7 py-2.5 text-[13px] font-bold text-white hover:bg-white hover:text-black transition-colors">
                Get Started
              </motion.button>
            </Link>
          </motion.div>
        </motion.nav>
      </div>

      {/* ════ HERO ════ */}
      <motion.section aria-label="Hero section" style={{ y: heroY, opacity: heroO }}
        className="relative z-10 mx-auto max-w-[1300px] px-4 sm:px-6 pb-12 pt-28 sm:pt-32 md:pt-36 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 min-h-screen">

        {/* Left Text */}
        <div className="flex-1 text-left">
          <motion.div initial={{ opacity: 0, y: -12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...SP, delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF4D94]/20 bg-[#FF4D94]/5 px-4 py-1.5 text-xs font-bold text-[#FF4D94]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF4D94]" />
            Now in private beta
          </motion.div>

          <motion.h1 variants={stagger} initial="hidden" animate="show"
            className="font-display text-[52px] sm:text-[60px] md:text-[68px] font-black leading-[1.03] tracking-tight text-slate-900">
            <motion.span variants={fadeUp} className="inline-block">Your body.</motion.span>
            <br />
            <motion.span variants={fadeUp} className="inline-block text-slate-400 italic font-medium">Mapped exactly.</motion.span>
            <br />
            <motion.span variants={fadeUp} className="inline-block">Dressed perfectly.</motion.span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
            className="mt-6 max-w-lg text-base md:text-lg text-slate-500 font-medium leading-relaxed">
            Every size M was designed for a body that doesn&apos;t exist. YOUNGIN maps your exact geometry — 33 landmarks, ±1mm precision — and builds a wardrobe that fits the body you actually have.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, ...SP }}
            className="mt-8 flex flex-wrap gap-4">
            <Link href="/login">
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(255,77,148,0.25)" }} whileTap={{ scale: 0.97 }} transition={SP_FAST}
                className="rounded-full bg-[#FF4D94] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#ff3382] transition-colors">
                Start Free Scan →
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SP_FAST}
                className="rounded-full border-2 border-slate-200 px-8 py-3.5 text-sm font-bold text-slate-700 hover:border-[#FF4D94] hover:text-[#FF4D94] transition-colors">
                See How It Works
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            className="mt-10 flex items-center gap-6 text-xs font-medium text-slate-400">
            {["±1mm precision", "33 landmarks", "2.3s scan"].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#FF4D94]/60" />{t}</span>
            ))}
          </motion.div>
        </div>

        {/* Right — hero image */}
        <div className="flex-1 w-full relative flex items-center justify-center">
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SP, delay: 0.4 }}
            className="relative w-full max-w-[380px] h-[540px] rounded-3xl overflow-hidden shadow-2xl">
            <Image src="/try-on-phone.png" alt="AI-powered virtual try-on showing perfect fit detection" fill sizes="(max-width: 768px) 90vw, 380px" className="object-cover object-center" priority />
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0, type: "spring" }}
              className="absolute top-[30%] right-4 bg-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-[#FF4D94] animate-pulse" />
              <span className="font-bold text-slate-900 text-xs">Fits like M</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, type: "spring" }}
              className="absolute top-[44%] left-4 bg-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-slate-800 animate-pulse" />
              <span className="font-bold text-slate-900 text-xs">Waist: 31&quot;</span>
            </motion.div>
            {/* Gradient overlay bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
          </motion.div>

          {/* Side measurement pills */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30 hidden xl:flex">
            {[{ name: "Shoulder", val: "44.7 cm" }, { name: "Inseam", val: "82.4 cm" }].map((item, i) => (
              <motion.div key={item.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 + i * 0.1 }}
                className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 w-36">
                <p className="text-[9px] font-bold text-[#FF4D94] uppercase tracking-wider mb-1">{item.name}</p>
                <p className="font-display font-black text-base text-slate-900">{item.val}</p>
                <p className="text-slate-400 text-[9px] font-medium">AI Verified</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ════ MARQUEE STRIP ════ */}
      <MarqueeStrip />

      {/* ════ MEASURING SECTION ════ */}
      <section aria-label="AI measurement technology" className="relative z-10 py-20 sm:py-28 lg:py-36 bg-transparent overflow-hidden border-t border-slate-200">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[700px] h-[700px] bg-[#FF4D94]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="mx-auto max-w-[1400px] px-6 relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.1fr] items-center gap-12 lg:gap-20">

            {/* Left — image unchanged */}
            <div className="relative order-2 lg:order-1">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ ...SP }} viewport={{ once: true }}
                className="w-full aspect-[4/3] bg-[#f8f9fa] rounded-[2.5rem] p-6 sm:p-8 shadow-inner border border-slate-100 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF4D94]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Image src="/measuring.png" alt="AI-powered tailor measurement with millimeter precision" fill sizes="(max-width: 768px) 90vw, 50vw" className="object-contain p-8 sm:p-12 relative z-10 drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" />
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} viewport={{ once: true }}
                  className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/60 z-20">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4D94] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF4D94]"></span>
                    </span>
                    <p className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Live Calibration</p>
                  </div>
                  <p className="text-3xl font-black font-display text-slate-900 tracking-tight">±1mm</p>
                </motion.div>
              </motion.div>
            </div>

            {/* Right text — reduced */}
            <div className="order-1 lg:order-2">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[3px] text-slate-500 mb-5 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D94]" /> Frictionless Sizing
                </span>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-slate-900 mb-5">
                  Ditch the tape.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D94] to-[#ff79b0]">Know your exact fit.</span>
                </h2>
                <p className="text-base font-medium leading-relaxed text-slate-500 mb-8 max-w-md">
                  Two photos. 2.3 seconds. Your complete body blueprint — accurate to one millimeter.
                </p>
              </motion.div>
              <div className="space-y-3">
                {[
                  { icon: "📸", title: "Just two photos.", desc: "No gear. No tape. We do the math." },
                  { icon: "🧠", title: "33 landmarks mapped.", desc: "Every major measurement captured at ±1mm." },
                  { icon: "✅", title: "Shop everywhere.", desc: "One profile. Every brand on YOUNGIN." },
                ].map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1, ...SP }} viewport={{ once: true }}
                    className="group bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-[#FF4D94]/30 hover:shadow-md transition-all flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-[#FF4D94]/10 group-hover:border-[#FF4D94]/20 transition-colors text-lg">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-slate-500 text-xs font-medium mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ SCAN VIZ SECTION ════ */}
      <section aria-label="AI body scan engine" className="relative z-10 border-t border-slate-200 bg-transparent py-16 sm:py-24 lg:py-32 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 grid gap-10 md:grid-cols-2 md:items-end">
            <div className="max-w-xl">
              <SectionLabel>AI Mapping Technology</SectionLabel>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">Built for your unique proportions.</h2>
            </div>
            <div>
              <p className="border-l-[3px] border-[#FF4D94] pl-6 text-base font-medium leading-relaxed text-slate-500">
                Powered by a dual-model computer vision pipeline, our engine extracts <strong className="text-slate-700">33 distinct 3D landmarks</strong> and calculates your exact elliptical circumference geometry—eliminating sizing errors entirely.
              </p>
            </div>
          </div>
          <BodyScanViz />
        </div>
      </section>

      {/* ════ BOLD STATEMENT BANNER ════ */}
      <StatementBanner />

      {/* ════ TAILOR CTA ════ */}
      <section aria-label="Tailor CTA" className="relative z-10 py-24 sm:py-32 lg:py-40 bg-transparent border-t border-slate-200">
        <div className="mx-auto max-w-[1100px] px-6">
          <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} transition={SP} viewport={{ once: true }}
            className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 p-8 sm:p-14 lg:p-20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:border-[#FF4D94]/30 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-12">
            
            {/* Soft inner glow */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-[#FF4D94]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#FF4D94]/10 transition-colors duration-700" />
            
            <div className="max-w-2xl relative z-10 flex flex-col items-start text-left">
              <p className="text-[11px] font-bold uppercase tracking-[4px] text-slate-400 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF4D94] animate-pulse" /> Are you a tailor?
              </p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.05]">
                Join as a verified tailor
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed text-base sm:text-lg mb-8 max-w-xl">
                Get access to a global client base with orders that arrive with complete measurement specs attached. No chasing customers for measurements — just craft the garment and ship.
              </p>
            </div>
            
            <div className="relative z-10 shrink-0 self-start md:self-auto">
              <Link href="/login">
                <motion.button whileHover={{ scale: 1.05, boxShadow: "0 12px 32px rgba(255,77,148,0.3)" }} whileTap={{ scale: 0.97 }} transition={SP_FAST}
                  className="rounded-full bg-slate-900 px-10 py-5 text-sm font-bold text-white hover:bg-[#FF4D94] transition-all shadow-xl whitespace-nowrap flex items-center justify-center gap-2">
                  Apply as a tailor <span className="text-lg leading-none">→</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════ TAILOR NETWORK ════ */}
      <section aria-label="The Tailor Network" className="relative z-10 py-24 sm:py-32 lg:py-40 bg-transparent overflow-hidden text-slate-900 border-y border-slate-200">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#FF4D94]/5 blur-[120px] opacity-40 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute left-0 top-1/4 w-[500px] h-[500px] bg-[#FF4D94]/4 blur-[100px] rounded-full pointer-events-none"></div>
        </div>
        
        <div className="relative mx-auto max-w-[1300px] px-6 z-10">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-16 lg:gap-20 items-start">
            
            {/* Left Content */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={SP} viewport={{ once: true }}>
              <p className="text-[10px] font-bold uppercase tracking-[4px] text-slate-500 mb-6">The Tailor Network</p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 mb-8">
                500+ verified<br />tailors.<br />
                <span className="text-slate-500 italic">Global reach. Local craft.</span>
              </h2>
              
              <div className="space-y-6 text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
                <p>
                  We built YOUNGIN with independent tailors at the center — not as an afterthought. Every tailor on our platform is vetted for quality, speed, and reliability. When you commission a garment, your 33-point measurement brief is delivered to them instantly — no fitting appointments, no back-and-forth.
                </p>
                <p>
                  Tailors get access to a global customer base they could never reach alone. Customers get bespoke quality without boutique prices. Everyone wins.
                </p>
              </div>
            </motion.div>

            {/* Right Cards */}
            <div className="space-y-5">
              {[
                { icon: "📐", title: "Measurement brief delivered instantly", desc: "Every order arrives with a complete 33-point spec sheet. No guesswork, no measuring appointments required." },
                { icon: "🌍", title: "Global customer base", desc: "Tailors in Lagos, Lahore, Lisbon, and everywhere in between reach customers they could never find on their own." },
                { icon: "⭐", title: "Quality-reviewed system", desc: "Every completed order is reviewed. Tailors build reputation. Customers get accountability. The network gets better over time." },
                { icon: "💰", title: "Fair, transparent pricing", desc: "Tailors set their own rates. We take a small platform fee. No hidden charges, no race to the bottom on price." }
              ].map((card, i) => (
                <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: i * 0.1 }} viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 hover:border-[#FF4D94]/30 shadow-sm transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-xl shadow-inner text-slate-900 group-hover:scale-110 group-hover:bg-[#FF4D94]/10 group-hover:border-[#FF4D94]/20 group-hover:text-[#FF4D94] transition-all duration-300">
                      {card.icon}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-2">{card.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">{card.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <motion.footer initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeIn}
        aria-label="Site footer" className="relative z-10 bg-slate-950 py-16 sm:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between mb-16">
            <div className="flex flex-col gap-4 max-w-xs">
              {/* Bigger footer logo */}
              <div className="relative h-[160px] w-[350px] -my-4 -ml-4">
                <Image src="/youngin_blackbg.png?v=7" unoptimized={true} alt="YOUNGIN logo" fill sizes="400px" className="object-contain object-left" />
              </div>
              <p className="text-sm font-medium text-white/40 max-w-[240px] leading-relaxed">
                AI-powered fashion infrastructure. Design it. Scan it. Own it.
              </p>
              {subscribed ? (
                <p className="mt-2 text-sm font-bold text-[#FF4D94]">✓ You&apos;re on the list!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex bg-white/5 rounded-full border border-white/10 mt-2 overflow-hidden max-w-xs" aria-label="Email subscription form">
                  <label htmlFor="footer-email" className="sr-only">Email address</label>
                  <input id="footer-email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" required autoComplete="email"
                    className="bg-transparent border-none outline-none px-4 py-3 flex-1 text-xs font-medium text-white placeholder:text-white/30" />
                  <button type="submit" className="px-5 bg-white text-black font-bold text-xs hover:bg-[#FF4D94] hover:text-white transition-all">Join</button>
                </form>
              )}
            </div>
            <div className="grid grid-cols-2 gap-6 sm:gap-10 md:grid-cols-4 text-sm">
              {[
                { heading: "Product",   links: ["Virtual Fitting Room", "Automatic Sizing", "Personalization", "Extension"] },
                { heading: "Solutions", links: ["In-Store Experience", "Enterprise Plans", "Partners", "Developer API"] },
                { heading: "Company",   links: ["About Us", "Our Team", "Careers", "Contact Us"] },
                { heading: "Resources", links: ["FAQ", "Privacy", "Measurements Map", "Terms"] },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[3px] text-white">{heading}</p>
                  <ul className="space-y-3 font-medium text-white/40">
                    {links.map((l) => (<li key={l}><a href="#" aria-label={l} className="hover:text-[#FF4D94] transition-colors text-sm">{l}</a></li>))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-8 text-xs font-medium text-white/30">
            <p>© 2026 Youngin Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}