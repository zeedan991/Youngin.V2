"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Shirt,
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  Download,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { processVirtualTryOn } from "./actions";

type GarmentType = "shirt" | "pant" | null;

// ── Programmatic lower-body mask generator ──────────────────────
// For pants mode: we draw a white rectangle over the bottom 60% of the image.
// This signals to IDM-VTON "replace the clothing in this region".
async function generateLowerBodyMask(humanBase64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      // Black background (= keep this region)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // White region = lower 58% of image (legs/pants area)
      ctx.fillStyle = "#ffffff";
      const startY = Math.floor(canvas.height * 0.42);
      ctx.fillRect(0, startY, canvas.width, canvas.height - startY);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = humanBase64;
  });
}

// ── Client-side image resize & compress ─────────────────────────
function compressImage(
  file: File,
  maxDim = 1536,
  quality = 0.98,
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── Upload Zone Sub-component ────────────────────────────────────
function UploadZone({
  label,
  sublabel,
  icon: Icon,
  value,
  onChange,
  accent,
}: {
  label: string;
  sublabel: string;
  icon: any;
  value: string | null;
  onChange: (v: string) => void;
  accent: string;
}) {
  const id = `upload-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <label
        htmlFor={id}
        className="relative flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all overflow-hidden group"
        style={{
          height: 200,
          border: value
            ? `2px solid ${accent}`
            : "2px dashed rgba(255,255,255,0.12)",
          background: value ? "transparent" : "rgba(255,255,255,0.03)",
        }}
      >
        <input
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) onChange(await compressImage(f));
            e.target.value = ""; // reset so same file can be re-uploaded
          }}
        />
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
              <RefreshCcw className="w-6 h-6 text-white" />
              <span className="text-white text-xs font-bold">Change</span>
            </div>
            <div
              className="absolute top-2 right-2 rounded-full p-1"
              style={{ background: accent }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-500 px-4 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: accent + "18" }}
            >
              <Icon className="w-6 h-6" style={{ color: accent }} />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-300">{sublabel}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                JPG, PNG — Max 10MB
              </p>
            </div>
            <div
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: accent + "22", color: accent }}
            >
              Browse Files
            </div>
          </div>
        )}
      </label>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function VirtualTryOnPage() {
  const [humanImg, setHumanImg] = useState<string | null>(null);
  const [garmentImg, setGarmentImg] = useState<string | null>(null);
  const [garmentType, setGarmentType] = useState<GarmentType>(null);

  const [loading, setLoading] = useState(false);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = !!humanImg && !!garmentImg && !!garmentType && !loading;

  const handleGenerate = useCallback(async () => {
    if (!humanImg || !garmentImg || !garmentType) return;
    setLoading(true);
    setError(null);
    setResultImg(null);

    let maskBase64: string | undefined;
    if (garmentType === "pant") {
      maskBase64 = await generateLowerBodyMask(humanImg);
    }

    const res = await processVirtualTryOn(
      humanImg,
      garmentImg,
      garmentType,
      maskBase64,
    );

    if (res.success && res.imageUrl) {
      setResultImg(res.imageUrl);
    } else {
      setError(res.error || "An unknown error occurred.");
    }
    setLoading(false);
  }, [humanImg, garmentImg, garmentType]);

  const handleDownload = () => {
    if (!resultImg) return;
    const a = document.createElement("a");
    a.href = resultImg;
    a.download = `YOUNGIN_TryOn_${garmentType}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100">
      <div className="max-w-[1300px] mx-auto px-4 py-10">
        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4F46E5, #3730A3)",
              }}
            >
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Virtual Try-On
              </h1>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Powered by IDM-VTON · AI Diffusion
              </p>
            </div>
          </div>
          <p className="max-w-xl leading-relaxed text-slate-300">
            Upload your photo and a garment. Choose whether it's a shirt or
            pants, and watch AI seamlessly dress you in it.
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT: Inputs */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Step 1: Garment Type */}
            <div className="rounded-3xl p-6 bg-white shadow-xl text-slate-900">
              <p className="text-xs font-bold uppercase tracking-[0.12em] mb-4 text-slate-400">
                Step 1 — What are you trying on?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: "shirt",
                    label: "Shirt / Top",
                    emoji: "👕",
                    desc: "T-shirts, jackets, hoodies, tops",
                    accent: "#6366f1",
                  },
                  {
                    id: "pant",
                    label: "Pants / Bottoms",
                    emoji: "👖",
                    desc: "Jeans, trousers, shorts, skirts",
                    accent: "#4F46E5",
                  },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGarmentType(g.id as GarmentType)}
                    className="flex flex-col items-start p-4 rounded-2xl text-left transition-all"
                    style={{
                      background:
                        garmentType === g.id ? g.accent + "22" : "#f8fafc",
                      border:
                        garmentType === g.id
                          ? `2px solid ${g.accent}`
                          : `2px solid #e2e8f0`,
                      boxShadow:
                        garmentType === g.id
                          ? `0 0 20px ${g.accent}33`
                          : "none",
                    }}
                  >
                    <span className="text-2xl mb-2">{g.emoji}</span>
                    <p className="font-bold text-sm mb-0.5 text-slate-900">
                      {g.label}
                    </p>
                    <p className="text-xs leading-tight text-slate-500">
                      {g.desc}
                    </p>
                    {garmentType === g.id && (
                      <div
                        className="mt-2 flex items-center gap-1"
                        style={{ color: g.accent }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Upload Images */}
            <div className="rounded-3xl p-6 flex flex-col gap-5 bg-white shadow-xl text-slate-900">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Step 2 — Upload Photos
              </p>
              <UploadZone
                label="Your Photo"
                sublabel="Full or half body photo of you"
                icon={UploadCloud}
                value={humanImg}
                onChange={setHumanImg}
                accent="#6366f1"
              />
              <UploadZone
                label="The Garment"
                sublabel="Flat-lay or product shot of garment"
                icon={Shirt}
                value={garmentImg}
                onChange={setGarmentImg}
                accent="#4F46E5"
              />
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={canGenerate ? { scale: 1.02, y: -2 } : {}}
              whileTap={canGenerate ? { scale: 0.98 } : {}}
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full py-5 rounded-2xl text-white font-black text-base tracking-widest uppercase transition-all flex items-center justify-center gap-3 relative overflow-hidden"
              style={{
                background: canGenerate
                  ? "linear-gradient(135deg, #4F46E5, #3730A3)"
                  : "rgba(255,255,255,0.07)",
                color: canGenerate ? "white" : "rgba(255,255,255,0.25)",
                cursor: canGenerate ? "pointer" : "not-allowed",
                boxShadow: canGenerate
                  ? "0 8px 40px rgba(255,77,148,0.35)"
                  : "none",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate Try-On
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {error && (
              <div
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* RIGHT: Output Canvas */}
          <div className="lg:col-span-3">
            <div
              className="w-full relative rounded-[2rem] overflow-hidden flex items-center justify-center bg-white shadow-xl text-slate-900"
              style={{ minHeight: 620 }}
            >
              {/* Ambient glows */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full blur-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse, rgba(255,77,148,0.15), transparent 70%)",
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse, rgba(99,102,241,0.15), transparent 70%)",
                }}
              />

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-6 px-8 text-center z-10"
                  >
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-[3px] border-[#4F46E5]/20 rounded-full animate-ping" />
                      <div className="absolute inset-1 border-[3px] border-[#4F46E5] rounded-full border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Shirt className="w-7 h-7 text-[#4F46E5]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-slate-900">
                        AI is styling you…
                      </h3>
                      <p className="text-sm max-w-xs text-slate-500">
                        IDM-VTON is analyzing garment physics &amp; drape
                        mapping.
                        <br />
                        <span className="text-[#4F46E5] font-semibold">
                          Usually takes 20–40 seconds.
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-[#4F46E5]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.2,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : resultImg ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-full h-full absolute inset-0 flex flex-col"
                  >
                    {/* Full image — object-contain so nothing is cropped */}
                    <img
                      src={resultImg}
                      alt="Virtual Try-On Result"
                      className="w-full h-full object-contain"
                      style={{ minHeight: 620 }}
                    />

                    {/* Overlay badges */}
                    <div
                      className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(8px)",
                        color: "#4F46E5",
                        border: "1px solid rgba(255,77,148,0.3)",
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Try-On Complete
                    </div>

                    {/* Toolbar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider text-white transition-all hover:scale-105"
                        style={{
                          background:
                            "linear-gradient(135deg, #4F46E5, #3730A3)",
                          boxShadow: "0 8px 20px rgba(255,77,148,0.4)",
                        }}
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                      <button
                        onClick={() => {
                          setResultImg(null);
                          setHumanImg(null);
                          setGarmentImg(null);
                          setGarmentType(null);
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105"
                        style={{
                          background: "rgba(255,255,255,0.8)",
                          backdropFilter: "blur(8px)",
                          color: "#111827",
                          border: "1px solid rgba(0,0,0,0.1)",
                        }}
                      >
                        <RefreshCcw className="w-4 h-4" /> Try Another
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-5 text-center px-10 z-10"
                  >
                    <div
                      className="w-24 h-24 rounded-3xl flex items-center justify-center mb-2"
                      style={{
                        background: "rgba(255,77,148,0.1)",
                        border: "2px dashed rgba(255,77,148,0.25)",
                      }}
                    >
                      <Shirt className="w-10 h-10 text-[#4F46E5] opacity-60" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black mb-2 text-slate-900">
                        Your studio is ready
                      </h3>
                      <p className="text-sm max-w-xs leading-relaxed text-slate-500">
                        Choose a garment type, upload your photos, and hit
                        generate. The AI will dress you in seconds.
                      </p>
                    </div>
                    {/* Step indicators */}
                    {[
                      {
                        n: "1",
                        t: garmentType
                          ? `${garmentType === "shirt" ? "👕 Shirt" : "👖 Pants"} selected`
                          : "Choose garment type",
                        done: !!garmentType,
                      },
                      {
                        n: "2",
                        t: humanImg
                          ? "Your photo uploaded ✓"
                          : "Upload your photo",
                        done: !!humanImg,
                      },
                      {
                        n: "3",
                        t: garmentImg
                          ? "Garment photo uploaded ✓"
                          : "Upload garment photo",
                        done: !!garmentImg,
                      },
                    ].map((step) => (
                      <div
                        key={step.n}
                        className="flex items-center gap-3 mt-3"
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                          style={{
                            background: step.done
                              ? "linear-gradient(135deg, #4F46E5, #3730A3)"
                              : "#f8fafc",
                            border: `1px solid #e2e8f0`,
                            color: step.done ? "white" : "#94a3b8",
                          }}
                        >
                          {step.done ? "✓" : step.n}
                        </div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: step.done ? "#0f172a" : "#94a3b8" }}
                        >
                          {step.t}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
