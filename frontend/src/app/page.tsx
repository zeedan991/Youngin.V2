"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
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
interface StatCardProps { value: string; label: string; delta?: string; index?: number }
interface FeatureCardProps { icon: string; title: string; description: string; index?: number }

// ─── Animation Variants ───────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const fadeUp  = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: SP } };
const fadeIn  = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6 } } };

// ─── Glow Orb ─────────────────────────────────────────────────────────────────
function GlowOrb({ className }: { className?: string }) {
  return <div className={`pointer-events-none absolute rounded-full blur-[140px] opacity-[0.07] ${className}`} />;
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold tracking-[4px] uppercase text-white/30">
      {children}
    </p>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, delta, index = 0 }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...SP, delay: index * 0.08 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl cursor-default"
    >
      <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
      {delta && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: index * 0.08 + 0.3 }}
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/50"
        >
          ▲ {delta}
        </motion.span>
      )}
    </motion.div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, index = 0 }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...SP, delay: index * 0.07 }}
      whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.2)" }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 cursor-default"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <motion.div whileHover={{ scale: 1.12 }} transition={SP_FAST} className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
        {icon}
      </motion.div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{description}</p>
    </motion.div>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ num, title, desc, detail, index = 0 }: { num: string; title: string; desc: string; detail: string; index?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ ...SP, delay: index * 0.12 }}
      className="relative flex gap-6 group"
    >
      {/* Number */}
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.08 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-sm font-bold text-white/60"
        >
          {num}
        </motion.div>
        {index < 2 && <div className="mt-2 w-px flex-1 bg-gradient-to-b from-white/10 to-transparent" />}
      </div>
      {/* Content */}
      <div className="pb-12">
        <p className="mb-1 text-[10px] font-semibold tracking-[3px] uppercase text-white/30">{detail}</p>
        <h3 className="mb-2 text-xl font-bold text-white group-hover:text-white/90 transition-colors">{title}</h3>
        <p className="text-slate-400 leading-relaxed max-w-md">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker({ to, prefix = "", suffix = "", decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let s = 0; const step = to / 60;
    const t = setInterval(() => {
      s += step;
      if (s >= to) { setCount(to); clearInterval(t); }
      else setCount(parseFloat(s.toFixed(decimals)));
    }, 16);
    return () => clearInterval(t);
  }, [started, to, decimals]);
  return <span ref={ref}>{prefix}{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}{suffix}</span>;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function AccuracySparkline() {
  const points = [72, 78, 75, 84, 80, 88, 86, 91, 89, 94, 96, 98];
  const w = 260, h = 80;
  const min = Math.min(...points), max = Math.max(...points);
  const pts = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - ((v - min) / (max - min)) * (h - 10) - 5}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" fill="none">
      <defs>
        <linearGradient id="spark-y" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polyline points={pts} stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.6, ease: "easeInOut", delay: 0.9 }} />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#spark-y)" />
    </svg>
  );
}

// ─── Body Scan Visualization ──────────────────────────────────────────────────
const LANDMARKS = [
  { x: 100, y: 28,  label: "nose"           },
  { x: 87,  y: 26,  label: "left ear"       },
  { x: 113, y: 26,  label: "right ear"      },
  { x: 72,  y: 68,  label: "left shoulder"  },
  { x: 128, y: 68,  label: "right shoulder" },
  { x: 58,  y: 112, label: "left elbow"     },
  { x: 142, y: 112, label: "right elbow"    },
  { x: 52,  y: 154, label: "left wrist"     },
  { x: 148, y: 154, label: "right wrist"    },
  { x: 82,  y: 164, label: "left hip"       },
  { x: 118, y: 164, label: "right hip"      },
  { x: 80,  y: 218, label: "left knee"      },
  { x: 120, y: 218, label: "right knee"     },
  { x: 78,  y: 268, label: "left ankle"     },
  { x: 122, y: 268, label: "right ankle"    },
];
const EDGES = [
  [3,4],[0,3],[0,4],[3,5],[5,7],[4,6],[6,8],[3,9],[4,10],[9,10],[9,11],[11,13],[10,12],[12,14],
];

function BodyScanViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const measurements = [
    { key: "Chest",    val: "96.2 cm" },
    { key: "Waist",    val: "78.1 cm" },
    { key: "Inseam",   val: "82.4 cm" },
    { key: "Shoulder", val: "44.7 cm" },
    { key: "Neck",     val: "37.5 cm" },
    { key: "Hip",      val: "94.8 cm" },
  ];
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SP, delay: 0.65 }}
      className="relative mx-auto mt-20 max-w-4xl"
    >
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        <div className="absolute inset-x-10 -top-12 h-36 rounded-full bg-white/[0.04] blur-3xl" />
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c14]/95 shadow-2xl backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-semibold tracking-[3px] uppercase text-white/40">Live Body Scan</span>
            </div>
            <div className="flex items-center gap-2">
              {inView && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
                className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white">33 / 33 landmarks</motion.span>}
              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/30">2.3s</span>
            </div>
          </div>
          {/* Main content */}
          <div className="flex flex-col md:grid md:grid-cols-2">
            {/* SVG body */}
            <div className="relative flex items-center justify-center py-10 md:border-r border-b border-white/[0.06] md:border-b-0">
              <svg viewBox="0 0 200 310" width="180" height="310" fill="none" className="overflow-visible">
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="scan-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                {/* Skeleton edges */}
                {EDGES.map(([a, b], i) => (
                  <motion.line
                    key={i}
                    x1={LANDMARKS[a].x} y1={LANDMARKS[a].y}
                    x2={LANDMARKS[b].x} y2={LANDMARKS[b].y}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.8, ease: "easeInOut" }}
                  />
                ))}
                {/* Landmark dots */}
                {LANDMARKS.map((lm, i) => (
                  <motion.circle
                    key={i}
                    cx={lm.x} cy={lm.y} r="4"
                    fill="white"
                    filter="url(#glow)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 1.2 + i * 0.08, type: "spring", stiffness: 200, damping: 10 }}
                  />
                ))}
                {/* Continuous scanning line */}
                {inView && (
                  <motion.line
                    x1="20" x2="180"
                    stroke="url(#scan-grad)"
                    strokeWidth="1.5"
                    initial={{ y1: 10, y2: 10, opacity: 0 }}
                    animate={{ y1: [10, 300, 10], y2: [10, 300, 10], opacity: [0, 1, 1, 0, 0] }}
                    transition={{ duration: 3, ease: "linear", repeat: Infinity, opacity: { duration: 3, repeat: Infinity, times: [0, 0.1, 0.9, 1] } }}
                  />
                )}
                {/* Chest measurement line */}
                {inView && (
                  <>
                    <motion.line x1="66" y1="80" x2="134" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3,3"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} />
                    <motion.line x1="78" y1="177" x2="122" y2="177" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3,3"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} />
                  </>
                )}
              </svg>
            </div>
            {/* Measurements */}
            <div className="flex flex-col justify-center gap-0 py-6">
              {measurements.map((m, i) => (
                <motion.div key={m.key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ ...SP, delay: 1.2 + i * 0.15 }}
                  className="flex items-center justify-between border-b border-white/[0.05] px-6 py-3 last:border-0 group hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-xs font-medium uppercase tracking-[2px] text-white/30">{m.key}</span>
                  <motion.span
                    className="font-display text-lg font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 1.6 + i * 0.15 }}
                  >{m.val}</motion.span>
                </motion.div>
              ))}
              {/* Fit score */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 2.8 }}
                className="mx-6 mt-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 text-center"
              >
                <p className="text-[10px] tracking-[3px] uppercase text-white/30 mb-1">Overall fit confidence</p>
                <p className="font-display text-3xl font-bold text-white">98.4%</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    const initVanta = () => {
      // Safely initialize Vanta once scripts are loaded onto the window
      if (!vantaEffect && typeof window !== "undefined" && (window as any).VANTA && (window as any).VANTA.CLOUDS) {
        setVantaEffect(
          (window as any).VANTA.CLOUDS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            backgroundColor: 0x0a0a0a,
            skyColor: 0x1a1a2e,
            cloudColor: 0x1e1e3f,
            cloudShadowColor: 0x050510,
            sunColor: 0xc8f064,
            sunGlareColor: 0x9ab840,
            sunlightColor: 0x8aaa30,
            speed: 0.8
          })
        );
      }
    };
    initVanta();
    const intervalId = setInterval(initVanta, 500);

    return () => {
      clearInterval(intervalId);
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const rawY = useTransform(scrollYProgress, [0, 0.25], [0, -50]);
  const rawO = useTransform(scrollYProgress, [0, 0.25], [1, 0.4]);
  const heroY = useSpring(rawY, { stiffness: 60, damping: 20 });
  const heroO = useSpring(rawO, { stiffness: 60, damping: 20 });

  const [activeTab, setActiveTab] = useState<"scan" | "fit" | "wardrobe">("scan");
  const navLinks = ["3D Studio", "Marketplace", "Tailors", "Brands"];

  const features: FeatureCardProps[] = [
    { icon: "🔬", title: "AI Body Scanning",        description: "Two photos. 33 skeletal landmarks mapped in 2.3 seconds with ±1mm accuracy. No measuring tape, no appointments.",  index: 0 },
    { icon: "🧱", title: "3D Design Studio",         description: "Build garments on your parametric avatar in real time. Adjust cut, drape, and fabric weight before anything is made.", index: 1 },
    { icon: "🛍️", title: "Fit Marketplace",          description: "Browse 200+ partner brands with every listing pre-filtered to your exact proportions. No returns. No guessing.",        index: 2 },
    { icon: "📦", title: "Curated Thrift Box",       description: "Monthly vintage curation sourced by AI to match your body shape, style fingerprint, and sustainability preferences.",   index: 3 },
    { icon: "✂️", title: "Verified Tailor Network",  description: "Commission any design through our vetted global tailor network. Your 33-point measurement spec ships with every order.", index: 4 },
    { icon: "🪪", title: "Measurement Passport",     description: "One permanent profile synced across every brand, studio, and tailor on the platform. Your measurements travel with you.", index: 5 },
  ];

  const tabData = {
    scan:     { label: "Last scan",      value: "33 landmarks", change: "2.3s",            sub: "Scan duration" },
    fit:      { label: "Fit confidence", value: "98.4%",        change: "+4.2%",            sub: "vs. last session" },
    wardrobe: { label: "Matched items",  value: "847 items",    change: "from 200+ brands", sub: "fit your body today" },
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds.min.js" strategy="afterInteractive" />

      {/* Vanta Canvas Background */}
      <div ref={vantaRef} className="fixed inset-0 z-0 pointer-events-none" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Syne:wght@700;800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Overlay noise filter to make Vanta look premium and textured */}
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.025]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />

      {/* ════ FLOATING NAV ════ */}
      <div className="fixed top-6 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none">
        <motion.nav initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.05 }}
          className="pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-white/[0.08] bg-[#0c0c14]/70 px-6 py-2.5 backdrop-blur-xl shadow-2xl">
          <Link href="/" className="flex items-center pl-2">
            <motion.div whileHover={{ scale: 1.02 }} transition={SP_FAST} className="relative h-12 w-48 md:h-14 md:w-56">
              <Image src="/logo.png" alt="YOUNGIN" fill className="object-contain object-left scale-[1.8] md:scale-[2] origin-left" priority />
            </motion.div>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link, i) => (
              <motion.a key={link} href="#" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.1 + i * 0.05 }}
                className="text-sm font-medium tracking-wide text-slate-400 transition-colors hover:text-white">{link}</motion.a>
            ))}
          </div>
          <button className="flex flex-col items-end justify-center gap-1.5 p-2 md:hidden">
            <span className="h-0.5 w-6 rounded-full bg-white block" />
            <span className="h-0.5 w-6 rounded-full bg-white block" />
            <span className="h-0.5 w-4 rounded-full bg-white/60 block" />
          </button>
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SP, delay: 0.3 }} className="hidden items-center gap-4 md:flex">
            <Link href="/login" className="text-sm font-medium tracking-wide text-slate-400 hover:text-white transition-colors">Log in</Link>
            <Link href="/login">
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 24px rgba(255,255,255,0.12)" }} whileTap={{ scale: 0.96 }} transition={SP_FAST}
                className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black hover:bg-white/90">Get Started</motion.button>
            </Link>
          </motion.div>
        </motion.nav>
      </div>

      {/* ════ HERO ════ */}
      <motion.section style={{ y: heroY, opacity: heroO }} className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-32 md:pt-40 text-center">
        <motion.div initial={{ opacity: 0, y: -12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...SP, delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-1.5 text-xs font-medium text-white/60">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Now in private beta — join the waitlist
        </motion.div>

        <motion.h1 variants={stagger} initial="hidden" animate="show" className="font-display mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-[68px]">
          <motion.span variants={fadeUp} className="inline-block">Your body.</motion.span>
          <br />
          <motion.span variants={fadeUp} className="inline-block text-white/50 italic">Mapped exactly.</motion.span>
          <br />
          <motion.span variants={fadeUp} className="inline-block">Dressed perfectly.</motion.span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.55 }}
          className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">
          Every size M was designed for a body that doesn&apos;t exist. YOUNGIN maps your exact geometry — 33 landmarks, ±1mm precision — and builds a wardrobe that fits the body you actually have.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.7 }}
          className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Link href="/login" className="w-full sm:w-auto">
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 36px rgba(255,255,255,0.18)" }} whileTap={{ scale: 0.96 }} transition={SP_FAST}
              className="w-full sm:w-auto rounded-full bg-white px-8 py-3.5 text-base font-semibold text-black hover:bg-white/90">
              Scan your body free
            </motion.button>
          </Link>
          <Link href="/studio" className="w-full sm:w-auto">
            <motion.button whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.97 }} transition={SP_FAST}
              className="flex w-full justify-center sm:w-auto items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-base font-medium text-white backdrop-blur">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">▶</span>
              See the 3D Studio
            </motion.button>
          </Link>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.6 }} className="mt-5 text-xs text-slate-600">
          No credit card required · Two photos · 30 seconds
        </motion.p>

        {/* Body Scan Visualization */}
        <BodyScanViz />
      </motion.section>

      {/* ════ SOCIAL PROOF ════ */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeIn}
        className="relative z-10 border-y border-white/5 bg-white/[0.02] py-8">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            <motion.p variants={fadeUp} className="text-sm text-slate-600">Partner brands</motion.p>
            {["Nike", "Zara", "H&M", "Levi's", "Uniqlo", "ASOS"].map((b) => (
              <motion.span key={b} variants={fadeUp} whileHover={{ opacity: 1, y: -2 }}
                className="text-sm font-semibold text-slate-500 opacity-50 cursor-default">{b}</motion.span>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ════ THE PROBLEM ════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-32">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={SP} className="max-w-3xl">
          <SectionLabel>The Problem</SectionLabel>
          <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl mb-6">
            Clothing sizes were invented in the 1940s.<br />
            <span className="text-white/50 italic">Nothing has changed.</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            The average person wears a size that fits them in zero out of five key dimensions. Shoulders, chest, waist, inseam, and torso length are all different ratios — and &quot;size M&quot; satisfies none of them perfectly. The result? Billions of returns every year, tonnes of wasted fabric, and people who simply stop shopping because nothing fits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          {[
            { stat: "68%", label: "of online clothing is returned due to poor fit", icon: "↩" },
            { stat: "$760B", label: "in fashion returns annually, globally", icon: "💸" },
            { stat: "40%", label: "of returned items end up in landfill", icon: "🌍" },
          ].map((item, i) => (
            <motion.div key={item.stat} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...SP, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center backdrop-blur cursor-default">
              <p className="text-5xl mb-3">{item.icon}</p>
              <p className="text-3xl font-bold text-white mb-2">{item.stat}</p>
              <p className="text-sm text-slate-400 leading-snug">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════ STATS ════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard value="33"    label="Body landmarks mapped"  delta="±1mm accuracy"    index={0} />
          <StatCard value="2.3s"  label="Full body scan time"    delta="Industry fastest"  index={1} />
          <StatCard value="200+"  label="Partner brands"         delta="Growing monthly"   index={2} />
          <StatCard value="98.4%" label="Average fit confidence" delta="+4.2% this month"  index={3} />
        </div>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section className="relative z-10 border-t border-white/5 mx-auto max-w-6xl px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={SP} className="sticky top-24">
            <SectionLabel>How it Works</SectionLabel>
            <h2 className="font-display text-4xl font-bold md:text-5xl mb-4">Three steps to a wardrobe that fits</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              From two photos to a perfectly fitted, custom-made garment in your hands — YOUNGIN makes precision fit accessible to everyone, not just people with a personal tailor.
            </p>
          </motion.div>

          <div className="mt-4">
            <StepCard num="01" title="Scan — your body in 2.3 seconds"
              desc="Upload two photos: one from the front, one from the side. Our AI model built on MediaPipe maps 33 skeletal landmarks and derives your complete parametric measurement profile without a tape measure."
              detail="AI Body Scanning" index={0} />
            <StepCard num="02" title="Design or Discover"
              desc="Jump into the 3D Studio and build any garment on your avatar — or browse our Fit Marketplace where every item from 200+ brands is pre-filtered to only show pieces that match your exact shape. You see only clothes that actually fit."
              detail="3D Studio · Fit Marketplace" index={1} />
            <StepCard num="03" title="Source — tailor or brand"
              desc="Send your design to a verified tailor anywhere in the world with your full 33-point measurement spec attached automatically. Or order directly from a partner brand knowing every dimension is matched. No returns. No uncertainty."
              detail="Tailor Network · Direct Orders" index={2} />
          </div>
        </div>
      </section>

      {/* ════ TAILOR NETWORK ════ */}
      <section className="relative z-10 border-t border-b border-white/5 bg-white/[0.015] py-32">
        <GlowOrb className="h-[600px] w-[600px] bg-white right-0 top-0" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={SP}>
              <SectionLabel>The Tailor Network</SectionLabel>
              <h2 className="font-display text-4xl font-bold md:text-5xl mb-6">
                500+ verified tailors.<br />
                <span className="text-white/50 italic">Global reach. Local craft.</span>
              </h2>
              <p className="text-slate-400 leading-relaxed text-lg mb-8">
                We built YOUNGIN with independent tailors at the center — not as an afterthought. Every tailor on our platform is vetted for quality, speed, and reliability. When you commission a garment, your 33-point measurement brief is delivered to them instantly — no fitting appointments, no back-and-forth.
              </p>
              <p className="text-slate-400 leading-relaxed text-lg">
                Tailors get access to a global customer base they could never reach alone. Customers get bespoke quality without boutique prices. Everyone wins.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: "📐", title: "Measurement brief delivered instantly", desc: "Every order arrives with a complete 33-point spec sheet. No guesswork, no measuring appointments required." },
                { icon: "🌍", title: "Global customer base", desc: "Tailors in Lagos, Lahore, Lisbon, and everywhere in between reach customers they could never find on their own." },
                { icon: "⭐", title: "Quality-reviewed system", desc: "Every completed order is reviewed. Tailors build reputation. Customers get accountability. The network gets better over time." },
                { icon: "💰", title: "Fair, transparent pricing", desc: "Tailors set their own rates. We take a small platform fee. No hidden charges, no race to the bottom on price." },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ...SP, delay: i * 0.09 }}
                  whileHover={{ x: 4, borderColor: "rgba(255,255,255,0.2)" }}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 cursor-default group">
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">{item.title}</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ FEATURES ════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-32">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={SP} className="mb-14 text-center">
          <SectionLabel>Platform</SectionLabel>
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            One platform.{" "}
            <span className="text-white/50 italic">Every dimension of fit.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-400">
            YOUNGIN gives you the complete infrastructure to find, design, and commission clothing that fits your exact body — not a standardised size.
          </p>
        </motion.div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ════ FOR TAILORS CTA ════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={SP}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <SectionLabel>Are you a tailor?</SectionLabel>
            <h3 className="font-display text-3xl font-bold mb-3">Join as a verified tailor</h3>
            <p className="text-slate-400 max-w-lg leading-relaxed">
              Get access to a global client base with orders that arrive with complete measurement specs attached. No chasing customers for measurements — just craft the garment and ship.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SP_FAST} className="shrink-0">
            <Link href="/login">
              <button className="rounded-full border border-white/25 bg-white/[0.06] px-8 py-4 text-base font-semibold text-white hover:bg-white/[0.1] transition-colors whitespace-nowrap">
                Apply as a tailor →
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ════ FINAL CTA ════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={SP}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f1a] p-12 text-center shadow-2xl backdrop-blur">
          <GlowOrb className="h-80 w-80 bg-white -top-20 left-1/2 -translate-x-1/2 opacity-[0.05]" />
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...SP, delay: 0.1 }}
            className="font-display relative text-4xl font-bold md:text-5xl">
            Your body is the brief.<br />
            <span className="text-slate-400 text-3xl font-semibold">We build around it.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...SP, delay: 0.2 }}
            className="relative mx-auto mt-5 max-w-md text-slate-400">
            Join thousands of people who stopped compromising on fit. Two photos. 33 measurements. A wardrobe that actually works.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...SP, delay: 0.3 }}>
            <Link href="/login">
              <motion.button whileHover={{ scale: 1.06, boxShadow: "0 0 40px rgba(255,255,255,0.18)" }} whileTap={{ scale: 0.96 }} transition={SP_FAST}
                className="relative mt-8 rounded-full bg-white px-10 py-4 text-base font-bold text-black hover:bg-white/90">
                Start your body scan →
              </motion.button>
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
            className="relative mt-4 text-xs text-slate-600">
            No credit card required · Private beta access · Invite-only
          </motion.p>
        </motion.div>
      </section>

      {/* ════ CONNECT ════ */}
      <section className="relative z-10 border-t border-white/5 mx-auto max-w-6xl px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={SP} className="mb-14">
          <SectionLabel>Get in Touch</SectionLabel>
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Let&apos;s build something<br />
            <span className="text-white/50 italic">worth wearing.</span>
          </h2>
          <p className="mt-4 max-w-lg text-slate-400 leading-relaxed">
            Whether you&apos;re a brand, a tailor, an investor, or just someone who&apos;s sick of clothes that don&apos;t fit — we&apos;d love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "✉️", label: "Email us", value: "team@youngin.co", sub: "We reply within 24h", href: "mailto:team@youngin.co" },
            { icon: "📄", label: "Read the docs", value: "docs.youngin.co", sub: "API, SDK & guides", href: "#" },
            { icon: "𝕏", label: "Follow on X", value: "@younginapp", sub: "Updates & announcements", href: "#" },
            { icon: "💼", label: "Investor deck", value: "youngin.co/deck", sub: "Seed round open", href: "#" },
          ].map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("mailto") ? undefined : "_blank"}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...SP, delay: i * 0.09 }}
              whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.2)" }}
              className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur cursor-pointer no-underline"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-[10px] font-semibold tracking-[3px] uppercase text-white/30 mb-1">{item.label}</p>
                <p className="text-white font-semibold group-hover:text-white/90 transition-colors">{item.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <motion.footer initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeIn}
        className="relative z-10 border-t border-white/[0.06] bg-[#060608]">
        {/* Main footer row */}
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            {/* Brand */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="relative h-16 w-48 md:h-20 md:w-60">
                <Image src="/logo.png" alt="YOUNGIN" fill className="object-contain object-left scale-[1.5] origin-left" />
              </div>
              <p className="text-xs text-slate-600 mt-2 md:mt-3">Design. Fit. Wear.</p>
            </div>
            {/* Link columns */}
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-sm">
              {[
                { heading: "Platform",  links: ["Features", "How it Works", "3D Studio", "Fit Marketplace"] },
                { heading: "For Tailors", links: ["Join Network", "How it Works", "Pricing", "Verification"] },
                { heading: "Company",   links: ["About", "Blog", "Careers", "Press"] },
                { heading: "Legal",     links: ["Privacy", "Terms", "Cookies", "Security"] },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <p className="mb-3 text-[10px] font-semibold tracking-[3px] uppercase text-white/30">{heading}</p>
                  <ul className="space-y-2">
                    {links.map((l) => (
                      <li key={l}>
                        <motion.a href="#" whileHover={{ color: "#ffffff", x: 2 }} transition={{ duration: 0.15 }}
                          className="text-slate-500 hover:text-white transition-colors">{l}</motion.a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] px-6 py-5">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-xs text-slate-600">© 2026 Youngin Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-5 text-xs text-slate-600">
              {[
                { label: "X (Twitter)", href: "#" },
                { label: "Instagram",   href: "#" },
                { label: "LinkedIn",    href: "#" },
                { label: "team@youngin.co", href: "mailto:team@youngin.co" },
              ].map((s) => (
                <motion.a key={s.label} href={s.href} whileHover={{ color: "#ffffff" }} transition={{ duration: 0.15 }}
                  className="hover:text-white transition-colors">{s.label}</motion.a>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}