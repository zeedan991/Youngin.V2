"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import {
  Camera,
  ChevronRight,
  ChevronLeft,
  Upload,
  User,
  Ruler,
  RotateCcw,
  CheckCircle,
  Loader2,
  AlertCircle,
  Download,
  Share2,
  ArrowRight,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────
const SCAN_API = process.env.NEXT_PUBLIC_SCAN_API_URL || "http://localhost:5001";

const MEASUREMENT_META: Record<string, { label: string; color: string; icon: string }> = {
  height:           { label: "Height",           color: "#FF4D94", icon: "📏" },
  chest:            { label: "Chest",             color: "#60a5fa", icon: "🫁" },
  waist:            { label: "Waist",             color: "#a78bfa", icon: "⚡" },
  hip:              { label: "Hip",               color: "#34d399", icon: "🌀" },
  shoulder_width:   { label: "Shoulder Width",    color: "#fbbf24", icon: "↔️" },
  inseam:           { label: "Inseam",            color: "#f87171", icon: "🦵" },
  neck:             { label: "Neck",              color: "#818cf8", icon: "🔵" },
  thigh:            { label: "Thigh",             color: "#fb923c", icon: "💪" },
  arm_length:       { label: "Arm Length",        color: "#4ade80", icon: "💪" },
  knee:             { label: "Knee",              color: "#e879f9", icon: "🦿" },
  calf:             { label: "Calf",              color: "#38bdf8", icon: "🦵" },
  ankle:            { label: "Ankle",             color: "#a3e635", icon: "👟" },
  wrist:            { label: "Wrist",             color: "#f472b6", icon: "⌚" },
  bicep:            { label: "Bicep",             color: "#fb7185", icon: "💪" },
};

// ─── 3D OBJ Viewer ────────────────────────────────────────────────────────
function BodyMesh({ objString }: { objString: string }) {
  const meshRef = useRef<THREE.Group>(null);
  const [group, setGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (!objString) return;
    const { OBJLoader } = require("three/examples/jsm/loaders/OBJLoader.js");
    const loader = new OBJLoader();
    const obj = loader.parse(objString) as THREE.Group;

    obj.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#FF4D94"),
          roughness: 0.45,
          metalness: 0.05,
          transparent: true,
          opacity: 0.88,
        });
        child.geometry.computeVertexNormals();
      }
    });

    const box    = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    obj.position.sub(center);

    // Flip upright if needed
    const size = box.getSize(new THREE.Vector3());
    if (size.y < size.x) {
      obj.rotation.z = Math.PI / 2;
    }

    setGroup(obj);
  }, [objString]);

  if (!group) return null;
  return <primitive ref={meshRef} object={group} />;
}

function Scene3D({ objString }: { objString: string }) {
  return (
    <Canvas style={{ width: "100%", height: "100%" }} gl={{ antialias: true, alpha: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 2.8]} fov={45} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 3]}  intensity={1.4} />
      <directionalLight position={[-3, -2, -3]} intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={0.6} color="#FF4D94" />
      <Suspense fallback={null}>
        <BodyMesh objString={objString} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        autoRotate
        autoRotateSpeed={1.2}
        enableZoom
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
      />
    </Canvas>
  );
}

// ─── Photo Upload Box ─────────────────────────────────────────────────────
function PhotoBox({
  label,
  hint,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (f: File) => void;
}) {
  const preview = file ? URL.createObjectURL(file) : null;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-black uppercase tracking-widest text-white/50">{label}</span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed overflow-hidden transition-all hover:scale-[1.02]"
        style={{ borderColor: file ? "#FF4D94" : "rgba(255,255,255,0.12)" }}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-bold text-sm">Change Photo</span>
            </div>
            <div className="absolute top-3 right-3 bg-[#FF4D94] rounded-full p-1">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 h-full p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,77,148,0.15)" }}>
              <Camera className="w-7 h-7 text-[#FF4D94]" />
            </div>
            <div className="text-center">
              <p className="font-bold text-white/70 text-sm">Upload {label}</p>
              <p className="text-white/35 text-xs mt-1">{hint}</p>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
        />
      </button>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ["Guide", "Photos", "Process", "Results"];
  return (
    <div className="flex items-center gap-2 mb-10">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider transition-all"
            style={{
              background: i === current ? "rgba(255,77,148,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${i === current ? "rgba(255,77,148,0.5)" : "rgba(255,255,255,0.08)"}`,
              color: i < current ? "#4ade80" : i === current ? "#FF4D94" : "rgba(255,255,255,0.3)",
            }}
          >
            {i < current ? <CheckCircle className="w-3 h-3" /> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-6 h-px" style={{ background: i < current ? "#FF4D94" : "rgba(255,255,255,0.1)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function AISizingPage() {
  const [step, setStep] = useState<"guide" | "upload" | "scanning" | "results">("guide");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [sideFile,  setSideFile]  = useState<File | null>(null);
  const [height,    setHeight]    = useState(170);
  const [gender,    setGender]    = useState<"neutral" | "male" | "female">("neutral");
  const [result,    setResult]    = useState<any>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [progress,  setProgress]  = useState(0);

  const stepIdx = { guide: 0, upload: 1, scanning: 2, results: 3 }[step];

  // Fake progress bar during scan
  useEffect(() => {
    if (step !== "scanning") { setProgress(0); return; }
    setProgress(5);
    const msgs = [15, 35, 55, 72, 88];
    const timers = msgs.map((p, i) => setTimeout(() => setProgress(p), (i + 1) * 8000));
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const handleScan = useCallback(async () => {
    if (!frontFile || !sideFile) return;
    setError(null);
    setStep("scanning");

    const form = new FormData();
    form.append("front_image", frontFile);
    form.append("side_image",  sideFile);
    form.append("height_cm",   String(height));
    form.append("gender",      gender);

    try {
      const res = await fetch(`${SCAN_API}/api/scan`, {
        method: "POST",
        body:   form,
        headers: {
          "Bypass-Tunnel-Reminder": "true"
        },
        signal: AbortSignal.timeout(180_000),
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

  // ── Download measurements as text ──────────────────────────────────────
  const downloadMeasurements = () => {
    if (!result?.measurements) return;
    const lines = Object.entries(result.measurements)
      .map(([k, v]: any) => `${MEASUREMENT_META[k]?.label ?? k}: ${v} cm`)
      .join("\n");
    const blob = new Blob([`YOUNGIN Body Measurements\n\n${lines}`], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "youngin_measurements.txt"; a.click();
  };

  const bg    = "#0A0909";
  const surf  = "rgba(255,255,255,0.04)";
  const bdr   = "rgba(255,255,255,0.08)";
  const pink  = "#FF4D94";

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Steps current={stepIdx} />

      <AnimatePresence mode="wait">
        {/* ─── STEP 0: Guide ─────────────────────────────────────────── */}
        {step === "guide" && (
          <motion.div key="guide"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h1 className="text-5xl font-extrabold mb-3 tracking-tight" style={{ color: "#F0EBE3", fontFamily: "var(--font-syne)" }}>
                AI Body <span style={{ color: pink }}>Scan</span>
              </h1>
              <p className="text-white/50 text-lg max-w-xl">
                Upload two photos and get a personalised 3D body model with exact measurements in under 90 seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {[
                { n: "01", title: "Wear Tight Clothes", desc: "Fitted T-shirt + leggings/shorts. Loose clothes hide body contours and reduce accuracy.", icon: "👕" },
                { n: "02", title: "Good Lighting", desc: "Stand in bright, even light facing a plain wall. Avoid backlight and heavy shadows.", icon: "💡" },
                { n: "03", title: "A-pose, 2 Meters Away", desc: "Arms slightly away from body. Front & side photos from 2 metres with full body visible.", icon: "🧍" },
              ].map((tip) => (
                <div key={tip.n} className="rounded-3xl p-6 border" style={{ background: surf, borderColor: bdr }}>
                  <span className="text-4xl mb-4 block">{tip.icon}</span>
                  <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: pink }}>{tip.n}</div>
                  <h3 className="font-extrabold text-white mb-2">{tip.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>

            {/* Expected output preview */}
            <div className="rounded-3xl p-6 border mb-8" style={{ background: surf, borderColor: bdr }}>
              <h3 className="font-extrabold text-white mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5" style={{ color: pink }} />
                What you'll get
              </h3>
              <div className="flex flex-wrap gap-3">
                {Object.values(MEASUREMENT_META).slice(0, 10).map((m) => (
                  <div key={m.label} className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: bdr, color: m.color }}>
                    {m.icon} {m.label}
                  </div>
                ))}
                <div className="px-3 py-2 rounded-xl border text-xs font-bold text-white/30"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: bdr }}>
                  + rotating 3D body model
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("upload")}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white text-sm uppercase tracking-widest transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${pink}, #B8005C)` }}
            >
              Start My Scan <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* ─── STEP 1: Upload ─────────────────────────────────────────── */}
        {step === "upload" && (
          <motion.div key="upload"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-8"
          >
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-1">Upload Your Photos</h2>
              <p className="text-white/40 text-sm">Front and side view — in bright light, tight clothes, A-pose</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.25)" }}>
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <PhotoBox label="Front Photo" hint="Face the camera, arms slightly out" file={frontFile} onChange={setFrontFile} />
              <PhotoBox label="Side Photo"  hint="Turn 90°, look forward"             file={sideFile}  onChange={setSideFile}  />
            </div>

            {/* Height + gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/50">Your Height (cm)</label>
                <input
                  type="number" min={120} max={230} value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${bdr}`, color: "#F0EBE3" }}
                  onFocus={(e) => (e.target.style.borderColor = pink)}
                  onBlur={(e)  => (e.target.style.borderColor = bdr)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-white/50">Body Type</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${bdr}`, color: "#F0EBE3" }}
                >
                  <option value="neutral">Neutral</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setStep("guide")} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white/40 hover:text-white/70 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleScan}
                disabled={!frontFile || !sideFile}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white text-sm uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: `linear-gradient(135deg, ${pink}, #B8005C)` }}
              >
                <Camera className="w-5 h-5" /> Analyse My Body
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── STEP 2: Scanning ───────────────────────────────────────── */}
        {step === "scanning" && (
          <motion.div key="scanning"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-[#FF4D94]/20 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-t-transparent border-[#FF4D94] animate-spin" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🧠</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-2">Analysing Your Body</h2>
              <p className="text-white/40 max-w-sm">HMR 2.0 is mapping your body landmarks and building your SMPL 3D mesh…</p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-md">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${pink}, #B8005C)` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/25 font-bold">
                <span>Detecting keypoints</span>
                <span>Building 3D mesh</span>
                <span>Extracting measurements</span>
              </div>
            </div>

            <p className="text-sm text-white/25">This takes 30–90 seconds depending on server load</p>
          </motion.div>
        )}

        {/* ─── STEP 3: Results ────────────────────────────────────────── */}
        {step === "results" && result && (
          <motion.div key="results"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-1">Your Body Profile</h2>
                <p className="text-white/40 text-sm">Drag to rotate • Scroll to zoom</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={downloadMeasurements} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white/60 border border-white/10 hover:border-white/25 transition-colors">
                  <Download className="w-4 h-4" /> Export
                </button>
                <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:scale-105"
                  style={{ background: "rgba(255,77,148,0.1)", borderColor: "rgba(255,77,148,0.3)", color: pink }}>
                  <RotateCcw className="w-4 h-4" /> Scan Again
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* 3D Viewer */}
              <div className="lg:flex-1 rounded-3xl overflow-hidden border" style={{ height: 560, background: "rgba(10,9,9,0.8)", borderColor: bdr, minWidth: 0 }}>
                {result.obj ? (
                  <Scene3D objString={result.obj} />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/30">
                    <p>3D model unavailable</p>
                  </div>
                )}
              </div>

              {/* Measurements panel */}
              <div className="lg:w-80 flex flex-col gap-3">
                <div className="rounded-3xl border p-5" style={{ background: surf, borderColor: bdr }}>
                  <h3 className="font-extrabold text-white text-lg mb-4 flex items-center gap-2">
                    <Ruler className="w-5 h-5" style={{ color: pink }} /> Measurements
                  </h3>
                  <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
                    {Object.entries(result.measurements as Record<string,number>)
                      .sort(([a], [b]) => {
                        const order = ["height","chest","waist","hip","shoulder_width","inseam","thigh","arm_length","neck","bicep","knee","calf","ankle","wrist"];
                        return (order.indexOf(a) ?? 99) - (order.indexOf(b) ?? 99);
                      })
                      .map(([key, value]) => {
                        const meta = MEASUREMENT_META[key] ?? { label: key, color: "#ffffff", icon: "📐" };
                        return (
                          <div key={key} className="flex items-center justify-between py-3 px-4 rounded-2xl group hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{meta.icon}</span>
                              <span className="text-sm font-semibold text-white/70">{meta.label}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="font-black text-lg" style={{ color: meta.color }}>{value}</span>
                              <span className="text-xs font-bold text-white/30">cm</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Size guide hint */}
                <div className="rounded-3xl border p-5" style={{ background: "rgba(255,77,148,0.05)", borderColor: "rgba(255,77,148,0.15)" }}>
                  <p className="text-xs font-bold text-white/50 mb-1 uppercase tracking-widest">Accuracy</p>
                  <p className="text-sm text-white/70">±2–3 cm on chest/waist/hip with good photos. Better accuracy with tight clothes and even lighting.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
