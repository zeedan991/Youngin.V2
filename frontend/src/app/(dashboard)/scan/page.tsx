"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import {
  Camera, ChevronLeft, Ruler, RotateCcw, CheckCircle,
  AlertCircle, Download, ArrowRight, Scan, Zap, ShieldCheck,
} from "lucide-react";
import Image from "next/image";

const SCAN_API = process.env.NEXT_PUBLIC_SCAN_API_URL || "http://localhost:5001";
const pink = "#FF4D94";

const MEASUREMENT_META: Record<string, { label: string; color: string; icon: string }> = {
  height:         { label: "Height",         color: "#FF4D94", icon: "📏" },
  chest:          { label: "Chest",           color: "#60a5fa", icon: "🫁" },
  waist:          { label: "Waist",           color: "#a78bfa", icon: "⚡" },
  hip:            { label: "Hip",             color: "#34d399", icon: "🌀" },
  shoulder_width: { label: "Shoulder Width",  color: "#fbbf24", icon: "↔️" },
  neck:           { label: "Neck",            color: "#818cf8", icon: "🔵" },
  thigh:          { label: "Thigh",           color: "#fb923c", icon: "💪" },
  knee:           { label: "Knee",            color: "#e879f9", icon: "🦿" },
  calf:           { label: "Calf",            color: "#38bdf8", icon: "🦵" },
  ankle:          { label: "Ankle",           color: "#a3e635", icon: "👟" },
  inseam:         { label: "Inseam",          color: "#f87171", icon: "📐" },
};
const MEASUREMENT_ORDER = ["height","chest","waist","hip","shoulder_width","neck","thigh","knee","calf","ankle","inseam"];
const SCAN_PHASES = ["Detecting body keypoints...","Mapping silhouette contours...","Building 3D mesh model...","Calculating measurements...","Finalising your profile..."];

// ─── 3D ────────────────────────────────────────────────────────────────────
function BodyMesh({ objString }: { objString: string }) {
  const [group, setGroup] = useState<THREE.Group | null>(null);
  
  useEffect(() => {
    if (!objString) return;
    const { OBJLoader } = require("three/examples/jsm/loaders/OBJLoader.js");
    const loader = new OBJLoader();
    const obj = loader.parse(objString) as THREE.Group;

    obj.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#C8A882"),  // Realistic skin tone
          roughness: 0.65,
          metalness: 0.0,
          transparent: false,
          opacity: 1.0,
        });
        child.geometry.computeVertexNormals();
      }
    });

    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    obj.position.sub(center);
    setGroup(obj);
  }, [objString]);

  return group ? <primitive object={group} /> : null;
}

function Scene3D({ objString }: { objString: string }) {
  return (
    <Canvas style={{ width: "100%", height: "100%" }} gl={{ antialias: true, alpha: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 2.6]} fov={40} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} />
      <directionalLight position={[-3, -2, -3]} intensity={0.5} />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#FFF0E0" />
      <Suspense fallback={null}>
        <BodyMesh objString={objString} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls autoRotate autoRotateSpeed={1.2} enableZoom enablePan={false} minPolarAngle={Math.PI / 8} maxPolarAngle={Math.PI - Math.PI / 8} />
    </Canvas>
  );
}

// ─── Photo Upload Box ───────────────────────────────────────────────────────
function PhotoBox({ label, hint, file, onChange }: { label: string; hint: string; file: File | null; onChange: (f: File) => void }) {
  const preview = file ? URL.createObjectURL(file) : null;
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-2 items-center w-full h-full justify-center">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 drop-shadow-md">{label}</span>
      <button type="button" onClick={() => ref.current?.click()}
        className="group relative w-full aspect-[3/4] max-w-[200px] rounded-[24px] overflow-hidden transition-all duration-400 flex-shrink-0 cursor-pointer"
        style={{ 
          background: file ? "transparent" : "rgba(10,10,13,0.4)", 
          border: `1.5px dashed ${file ? pink : "rgba(255,255,255,0.12)"}`, 
          boxShadow: file ? "0 0 25px rgba(255,77,148,0.15)" : "none" 
        }}>
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-xs font-bold tracking-wider">CHANGE</span>
            </div>
            <div className="absolute top-3 right-3 bg-[#FF4D94] rounded-full p-1.5 shadow-xl">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 h-full px-5">
            <div className="w-14 h-14 rounded-[18px] flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-translate-y-1 shadow-lg" 
              style={{ background: "rgba(255,77,148,0.08)", border: "1px solid rgba(255,77,148,0.25)" }}>
              <Camera className="w-6 h-6" style={{ color: pink }} />
            </div>
            <div className="text-center">
              <p className="text-white/80 text-sm font-black tracking-wide mb-1.5">Tap to Upload</p>
              <p className="text-white/30 text-[10px] leading-snug px-1">{hint}</p>
            </div>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])} />
      </button>
    </div>
  );
}

// ─── Steps ──────────────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ["Guide", "Photos", "Process", "Results"];
  return (
    <div className="flex justify-center items-center gap-1 mb-8 pt-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all duration-500"
            style={{
              background: i === current ? "rgba(255,77,148,0.15)" : i < current ? "rgba(74,222,128,0.08)" : "transparent",
              color: i < current ? "#4ade80" : i === current ? pink : "rgba(255,255,255,0.3)",
              border: `1px solid ${i === current ? "rgba(255,77,148,0.3)" : i < current ? "rgba(74,222,128,0.18)" : "rgba(255,255,255,0.05)"}`,
            }}>
            {i < current
              ? <CheckCircle className="w-3.5 h-3.5" />
              : <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
                  style={{ background: i === current ? pink : "rgba(255,255,255,0.06)", color: i === current ? "#fff" : "inherit" }}>{i + 1}</span>
            }
            <span className="hidden sm:inline">{s}</span>
          </div>
          {i < steps.length - 1 && <div className="w-8 h-px mx-1" style={{ background: i < current ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.05)" }} />}
        </div>
      ))}
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function AISizingPage() {
  const [step, setStep] = useState<"guide" | "upload" | "scanning" | "results">("guide");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [sideFile, setSideFile] = useState<File | null>(null);
  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState<"neutral" | "male" | "female">("neutral");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState(0);
  
  const stepIdx = { guide: 0, upload: 1, scanning: 2, results: 3 }[step];

  useEffect(() => {
    if (step !== "scanning") { setProgress(0); setScanPhase(0); return; }
    setProgress(5);
    const pts = [18, 45, 65, 82, 95];
    const timers = pts.map((p, i) => setTimeout(() => { setProgress(p); setScanPhase(i); }, (i + 1) * 6000));
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const handleScan = useCallback(async () => {
    if (!frontFile || !sideFile) return;
    setError(null); 
    setStep("scanning");
    
    const form = new FormData();
    form.append("front_image", frontFile); 
    form.append("side_image", sideFile);
    form.append("height_cm", String(height)); 
    form.append("gender", gender);
    
    try {
      const res = await fetch(`${SCAN_API}/api/scan`, { 
        method: "POST", 
        body: form, 
        headers: { "Bypass-Tunnel-Reminder": "true" }, 
        signal: AbortSignal.timeout(180_000) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setResult(data); 
      setStep("results");
    } catch (err: any) { 
      setError(err.message ?? "Could not connect to scan server"); 
      setStep("upload"); 
    }
  }, [frontFile, sideFile, height, gender]);

  const reset = () => { 
    setStep("guide"); 
    setFrontFile(null); 
    setSideFile(null); 
    setResult(null); 
    setError(null); 
  };
  
  const downloadMeasurements = () => {
    if (!result?.measurements) return;
    const lines = Object.entries(result.measurements).map(([k, v]: any) => `${MEASUREMENT_META[k]?.label ?? k}: ${Number(v).toFixed(1)} cm`).join("\n");
    const blob = new Blob([`YOUNGIN Body Measurements\n\n${lines}`], { type: "text/plain" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "youngin_measurements.txt" });
    a.click();
  };

  const bdr = "rgba(255,255,255,0.07)";
  const surf = "rgba(255,255,255,0.02)";

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[85vh] flex flex-col">
      <Steps current={stepIdx} />

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">

          {/* ─── GUIDE ─────────────────────────────────────────────────────── */}
          {step === "guide" && (
            <motion.div key="guide"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center"
            >
              {/* LEFT: Content */}
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-2" style={{ color: "#F0EBE3", fontFamily: "var(--font-syne)" }}>
                    AI Body <span style={{ color: pink }}>Scan</span>
                  </h1>
                  <p className="text-white/40 text-sm lg:text-base leading-relaxed max-w-lg">
                    Upload your front and side profile. Get 11 exact, tailor-ready measurements and a fully interactive 3D mesh model of your body in exactly 60 seconds.
                  </p>
                </div>

                {/* Instruction Cards (Horizontal Grid) */}
                <div className="grid grid-cols-3 gap-4 max-w-2xl">
                  {[
                    { n: "01", icon: "👕", title: "Tight Fit", desc: "Wear fitted clothing so contours are highly visible." },
                    { n: "02", icon: "💡", title: "Bright Light", desc: "Stand facing the light source against a totally plain background." },
                    { n: "03", icon: "🧍", title: "A-Pose", desc: "Stand 2 metres away. Arms slightly away from waist." },
                  ].map((card, i) => (
                    <motion.div key={card.n}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
                      className="rounded-2xl p-5 border flex flex-col items-center text-center"
                      style={{ background: surf, borderColor: bdr }}
                    >
                      <span className="text-3xl mb-3">{card.icon}</span>
                      <p className="text-white text-sm font-bold mb-1">{card.title}</p>
                      <p className="text-[10px] text-white/40 leading-relaxed">{card.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <button onClick={() => setStep("upload")}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white text-sm tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${pink}, #B8005C)`, boxShadow: "0 8px 30px rgba(255,77,148,0.25)" }}>
                    <Scan className="w-5 h-5" /> Proceed to Upload
                  </button>
                </div>
              </div>

              {/* RIGHT: Guide Images via SVG/CSS Composites */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                className="hidden lg:flex flex-col gap-5 w-[320px] shrink-0"
              >
                {/* DO */}
                <div className="relative rounded-3xl p-5 border overflow-hidden" style={{ borderColor: "rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.03)" }}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle className="w-24 h-24 text-green-400" />
                  </div>
                  <div className="flex items-start gap-4 reltive z-10">
                    <div className="w-12 h-16 rounded border-2 border-green-400/50 flex items-center justify-center bg-green-400/10 shrink-0">
                      {/* Simple strict pose icon */}
                      <svg width="24" height="32" viewBox="0 0 24 32" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="5" r="3"/>
                        <path d="M12 8v12M8 12l2 4M16 12l-2 4M9 20l1 8M15 20l-1 8"/>
                        <rect x="7" y="1" width="10" height="30" strokeDasharray="2 2" stroke="rgba(74,222,128,0.3)" strokeWidth="1" />
                      </svg>
                    </div>
                    <div>
                      <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-green-400 mb-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Correct Pose
                      </span>
                      <p className="text-[10px] py-0.5 text-white/50 leading-relaxed font-semibold">Wear figure-hugging clothes. Stand perfectly straight with arms slightly out.</p>
                    </div>
                  </div>
                </div>

                {/* DONT */}
                <div className="relative rounded-3xl p-5 border overflow-hidden" style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.03)" }}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <AlertCircle className="w-24 h-24 text-red-400" />
                  </div>
                  <div className="flex items-start gap-4 reltive z-10">
                    <div className="w-12 h-16 rounded border-2 border-red-400/50 flex items-center justify-center bg-red-400/10 shrink-0">
                      {/* Simple slouching/baggy icon */}
                      <svg width="24" height="32" viewBox="0 0 24 32" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="10" cy="6" r="3"/>
                        <path d="M10 9c2 4 4 8 2 12M5 11l4 2M15 10l-2 5M7 21l2 7M13 21l-1 7"/>
                        {/* Baggy clothes indicator */}
                        <path d="M6 10c-2 2-1 8 0 10c3 1 6 1 8 0c1-2 2-8 0-10C12 9 8 9 6 10z" stroke="rgba(239,68,68,0.4)" strokeWidth="1" strokeDasharray="1 2"/>
                      </svg>
                    </div>
                    <div>
                      <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-red-400 mb-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Wrong Pose
                      </span>
                      <p className="text-[10px] py-0.5 text-white/50 leading-relaxed font-semibold">Avoid baggy or loose clothing. Do not cross arms or stand at an angle.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ─── UPLOAD ────────────────────────────────────────────────────── */}
          {step === "upload" && (
            <motion.div key="upload"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center w-full max-w-4xl mx-auto"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "var(--font-syne)" }}>Upload Images</h2>
                <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">Provide clear, well-lit photos. The AI utilizes these to extract your exact dimensions.</p>
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 p-3.5 rounded-xl border mb-6 w-full max-w-lg" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-red-200 text-xs font-bold">{error}</p>
                </div>
              )}

              {/* Clean, perfectly aligned Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[800px] items-stretch">
                
                {/* 1. Front View */}
                <div className="flex flex-col h-full bg-[#08080A] border rounded-3xl p-5" style={{ borderColor: bdr }}>
                  <PhotoBox label="Front View" hint="Stand straight, arms slightly out" file={frontFile} onChange={setFrontFile} />
                </div>

                {/* 2. Side View */}
                <div className="flex flex-col h-full bg-[#08080A] border rounded-3xl p-5" style={{ borderColor: bdr }}>
                  <PhotoBox label="Side View" hint="Turn 90°, look perfectly straight" file={sideFile} onChange={setSideFile} />
                </div>

                {/* 3. Form Config Panel */}
                <div className="flex flex-col justify-between h-full bg-[#08080A] border rounded-3xl p-6" style={{ borderColor: bdr }}>
                  <div className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50 flex justify-between items-end">
                        <span>Height</span> <span className="text-white/30 text-[9px] lowercase opacity-60">in cm</span>
                      </label>
                      <input type="number" min={120} max={250} value={height} onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full rounded-2xl px-5 py-3.5 text-base font-bold outline-none transition-colors"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}
                        onFocus={(e) => (e.target.style.borderColor = pink)}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50">Baseline Shape</label>
                      <div className="relative">
                        <select value={gender} onChange={(e) => setGender(e.target.value as any)}
                          className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold outline-none cursor-pointer appearance-none"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}>
                          <option value="neutral">Neutral Average</option>
                          <option value="male">Masculine Frame</option>
                          <option value="female">Feminine Frame</option>
                        </select>
                        <ChevronLeft className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-white/40 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5">
                    <button onClick={handleScan} disabled={!frontFile || !sideFile}
                      className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl font-black text-white text-sm tracking-widest uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100"
                      style={{ background: `linear-gradient(135deg, ${pink}, #B8005C)`, boxShadow: !frontFile || !sideFile ? "none" : "0 8px 30px rgba(255,77,148,0.25)" }}>
                      <Scan className="w-4 h-4" /> Start Scan
                    </button>
                    <button onClick={() => setStep("guide")} className="w-full mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-white/30 hover:text-white/70 transition-colors py-1">
                       <ChevronLeft className="w-3 h-3" /> Back
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ─── SCANNING ──────────────────────────────────────────────────── */}
          {step === "scanning" && (
            <motion.div key="scanning"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="relative w-32 h-32 mb-8">
                <motion.div className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: "rgba(255,77,148,0.15)" }}
                  animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2.0, repeat: Infinity }} />
                <div className="absolute inset-3 rounded-full border-[3px] border-transparent animate-spin"
                  style={{ borderTopColor: pink, borderRightColor: "rgba(255,77,148,0.2)" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scan className="w-8 h-8" style={{ color: pink }} />
                </div>
              </div>
              <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>Processing Model</h2>
              <motion.p className="text-white/40 text-sm mb-8 h-4 font-mono uppercase tracking-widest text-[10px]" 
                key={scanPhase} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {SCAN_PHASES[scanPhase]}
              </motion.p>
              
              <div className="w-full max-w-sm space-y-2.5">
                <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                  <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${pink}, #B8005C)` }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 1.0, ease: "linear" }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  <span>Initialising</span><span>{progress}%</span><span>Complete</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── RESULTS ───────────────────────────────────────────────────── */}
          {step === "results" && result && (
            <motion.div key="results"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-5xl mx-auto"
            >
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3" /></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400/80">Scan Finished</span>
                  </div>
                  <h2 className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-syne)" }}>Your Body Profile</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={downloadMeasurements}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-white/90 border transition-all hover:bg-white/5"
                    style={{ borderColor: bdr }}>
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button onClick={reset}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                    style={{ background: "rgba(255,77,148,0.1)", border: "1px solid rgba(255,77,148,0.2)", color: pink }}>
                    <RotateCcw className="w-4 h-4" /> New Scan
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* 3D Model Area */}
                <div className="lg:w-[340px] shrink-0 rounded-3xl overflow-hidden border relative"
                  style={{ height: 480, background: "rgba(5,5,7,0.9)", borderColor: bdr }}>
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-white/40 uppercase tracking-widest border"
                      style={{ background: "rgba(0,0,0,0.4)", borderColor: bdr, backdropFilter: "blur(10px)" }}>Interactive 3D</span>
                  </div>
                  {result.obj
                    ? <Scene3D objString={result.obj} />
                    : <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
                        <AlertCircle className="w-8 h-8" /><p className="text-xs">3D mesh failed to generate</p>
                      </div>
                  }
                </div>

                {/* Measurements Area */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="rounded-3xl border p-6" style={{ background: surf, borderColor: bdr }}>
                    <div className="flex items-center gap-2 mb-5">
                      <Ruler className="w-4 h-4" style={{ color: pink }} />
                      <span className="text-sm font-bold text-white uppercase tracking-wider">Exact Measurements</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {MEASUREMENT_ORDER.filter((k) => result.measurements[k] != null).map((key, i) => {
                        const val = result.measurements[key] as number;
                        const meta = MEASUREMENT_META[key] ?? { label: key, color: "#fff", icon: "📐" };
                        return (
                          <motion.div key={key}
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.04 }}
                            className="rounded-2xl p-4 border transition-all hover:-translate-y-0.5"
                            style={{ background: `${meta.color}05`, borderColor: `${meta.color}15` }}>
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="text-sm opacity-80">{meta.icon}</span>
                              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{meta.label}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black tracking-tight" style={{ color: meta.color }}>{Number(val).toFixed(1)}</span>
                              <span className="text-[10px] font-bold text-white/20">cm</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
