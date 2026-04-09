"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import {
  UploadCloud,
  Camera,
  CheckCircle2,
  ScanLine,
  ArrowRight,
  Shield,
  Cpu,
  Ruler,
  Layers,
} from "lucide-react";
import Link from "next/link";

const SP: Transition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };
const surf = "rgba(255,255,255,0.04)";
const border = "rgba(255,255,255,0.08)";
const textMain = "#F0EBE3";
const textMuted = "rgba(240,235,227,0.45)";
const accent = "#FF4D94";

const STATS = [
  { label: "Landmarks Mapped", value: "33", icon: Cpu },
  { label: "Accuracy", value: "±1mm", icon: Ruler },
  { label: "Measurements", value: "12+", icon: Layers },
  { label: "Data Encrypted", value: "100%", icon: Shield },
];

export default function AIBodyScanPage() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const simulateUpload = (type: "front" | "side") => {
    if (type === "front") setFrontImage("loaded");
    if (type === "side") setSideImage("loaded");
  };

  const handleStartScan = () => {
    if (!frontImage || !sideImage) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
    }, 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* ── Header ── */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SP} className="mb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase mb-5"
          style={{ background: "rgba(255,77,148,0.1)", borderColor: "rgba(255,77,148,0.25)", color: accent }}
        >
          <ScanLine className="w-3.5 h-3.5" /> Neural Engine Active
        </div>
        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3"
          style={{ color: textMain, fontFamily: "var(--font-syne)" }}
        >
          AI Body Sizing
        </h1>
        <p className="text-lg max-w-2xl" style={{ color: textMuted }}>
          Upload two photos. Our MediaPipe engine extracts 33 discrete 3D landmarks and calculates exact measurements with ±1mm accuracy — no tape measure needed.
        </p>
      </motion.header>

      {/* ── Stats Strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SP, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
      >
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
              style={{ background: surf, borderColor: border }}
            >
              <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,77,148,0.1)" }}>
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <div>
                <p className="text-base font-black" style={{ color: textMain }}>{s.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest leading-none mt-0.5" style={{ color: textMuted }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── Main Console ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SP, delay: 0.1 }}
        className="rounded-3xl border p-8 md:p-10 relative overflow-hidden"
        style={{ background: surf, borderColor: border }}
      >
        {/* ambient glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: "rgba(255,77,148,0.06)" }} />

        <AnimatePresence mode="wait">
          {!scanComplete ? (
            <motion.div key="upload" exit={{ opacity: 0 }} className="space-y-8">
              {/* Tip */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-2xl border" style={{ background: "rgba(255,77,148,0.06)", borderColor: "rgba(255,77,148,0.15)" }}>
                <ScanLine className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                <p className="text-sm" style={{ color: textMuted }}>
                  <span className="font-bold" style={{ color: textMain }}>For best results:</span> wear tight-fitting clothing, stand in A-Pose, and ensure the camera is at waist height with your full body visible.
                </p>
              </div>

              {/* Upload Zones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Front */}
                <div
                  onClick={() => simulateUpload("front")}
                  className="relative cursor-pointer rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center min-h-[280px] text-center transition-all duration-300 group"
                  style={{
                    borderColor: frontImage ? accent : border,
                    background: frontImage ? "rgba(255,77,148,0.06)" : "rgba(255,255,255,0.02)",
                  }}
                  onMouseEnter={(e) => { if (!frontImage) (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,77,148,0.4)"; }}
                  onMouseLeave={(e) => { if (!frontImage) (e.currentTarget as HTMLElement).style.borderColor = border; }}
                >
                  {frontImage ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,77,148,0.15)" }}>
                        <CheckCircle2 className="w-8 h-8" style={{ color: accent }} />
                      </div>
                      <div>
                        <p className="font-black text-base mb-1" style={{ color: accent }}>Front Profile Loaded</p>
                        <p className="text-xs" style={{ color: textMuted }}>A-Pose captured successfully</p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border transition-colors" style={{ background: "rgba(255,255,255,0.05)", borderColor: border }}>
                        <Camera className="w-7 h-7" style={{ color: textMuted }} />
                      </div>
                      <h3 className="font-bold text-base mb-2" style={{ color: textMain }}>Front Facing Photo</h3>
                      <p className="text-sm mb-5 max-w-[180px]" style={{ color: textMuted }}>Upload a front-facing photo in A-Pose</p>
                      <button
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border transition-all"
                        style={{ background: "rgba(255,77,148,0.1)", borderColor: "rgba(255,77,148,0.25)", color: accent }}
                      >
                        <UploadCloud className="w-4 h-4" /> Browse Files
                      </button>
                    </>
                  )}
                </div>

                {/* Side */}
                <div
                  onClick={() => simulateUpload("side")}
                  className="relative cursor-pointer rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center min-h-[280px] text-center transition-all duration-300"
                  style={{
                    borderColor: sideImage ? accent : border,
                    background: sideImage ? "rgba(255,77,148,0.06)" : "rgba(255,255,255,0.02)",
                  }}
                  onMouseEnter={(e) => { if (!sideImage) (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,77,148,0.4)"; }}
                  onMouseLeave={(e) => { if (!sideImage) (e.currentTarget as HTMLElement).style.borderColor = border; }}
                >
                  {sideImage ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,77,148,0.15)" }}>
                        <CheckCircle2 className="w-8 h-8" style={{ color: accent }} />
                      </div>
                      <div>
                        <p className="font-black text-base mb-1" style={{ color: accent }}>Side Profile Loaded</p>
                        <p className="text-xs" style={{ color: textMuted }}>Z-axis depth captured</p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border" style={{ background: "rgba(255,255,255,0.05)", borderColor: border }}>
                        <ScanLine className="w-7 h-7" style={{ color: textMuted }} />
                      </div>
                      <h3 className="font-bold text-base mb-2" style={{ color: textMain }}>Side Profile Photo</h3>
                      <p className="text-sm mb-5 max-w-[180px]" style={{ color: textMuted }}>Upload a 90° side photo for depth mapping</p>
                      <button
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border transition-all"
                        style={{ background: "rgba(255,77,148,0.1)", borderColor: "rgba(255,77,148,0.25)", color: accent }}
                      >
                        <UploadCloud className="w-4 h-4" /> Browse Files
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${border}` }}>
                <p className="text-xs flex items-center gap-2" style={{ color: textMuted }}>
                  <Shield className="w-4 h-4" style={{ color: accent }} />
                  Photos are end-to-end encrypted and deleted immediately after mapping.
                </p>
                <button
                  onClick={handleStartScan}
                  disabled={!frontImage || !sideImage || scanning}
                  className="px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-3 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-white"
                  style={{ background: frontImage && sideImage && !scanning ? "linear-gradient(135deg, #FF4D94, #B8005C)" : "rgba(255,255,255,0.08)" }}
                >
                  {scanning ? (
                    <>Processing... <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></>
                  ) : (
                    <>Initialize 3D Sequence <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-12"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: accent }} />
                <div className="w-24 h-24 rounded-full flex items-center justify-center relative" style={{ background: "rgba(255,77,148,0.15)" }}>
                  <CheckCircle2 className="w-12 h-12" style={{ color: accent }} />
                </div>
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-4" style={{ color: textMain }}>Body Mapped Successfully</h2>
              <p className="max-w-lg mx-auto mb-8 text-base" style={{ color: textMuted }}>
                Your unique 3D geometrical mesh is saved to your profile. All clothes, tailor metrics, and thrift dimensions automatically snap to your physique.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => { setFrontImage(null); setSideImage(null); setScanComplete(false); }}
                  className="px-6 py-2.5 rounded-2xl font-bold text-sm border transition-all hover:scale-105"
                  style={{ borderColor: border, color: textMuted, background: surf }}
                >
                  Scan Again
                </button>
                <Link href="/studio">
                  <button className="px-6 py-2.5 rounded-2xl text-white font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2" style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}>
                    Open Studio <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
