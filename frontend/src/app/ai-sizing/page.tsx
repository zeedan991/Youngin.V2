"use client";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Upload, ScanFace, CheckCircle, Ruler, ArrowRight, Camera, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const MEASUREMENTS = [
  { label: "Chest", value: "96.2", unit: "cm" },
  { label: "Waist", value: "78.4", unit: "cm" },
  { label: "Hips", value: "98.1", unit: "cm" },
  { label: "Shoulder", value: "44.5", unit: "cm" },
  { label: "Inseam", value: "80.2", unit: "cm" },
  { label: "Neck", value: "37.0", unit: "cm" },
  { label: "Sleeve", value: "63.5", unit: "cm" },
  { label: "Thigh", value: "56.8", unit: "cm" },
];

const STEPS = [
  { id: 1, label: "Upload Photos", icon: Upload },
  { id: 2, label: "AI Analyzing", icon: ScanFace },
  { id: 3, label: "Results Ready", icon: CheckCircle },
];

export default function AISizingPage() {
  const [step, setStep] = useState(1);
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [sideUploaded, setSideUploaded] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const simulateAnalysis = () => {
    setStep(2);
    setTimeout(() => setStep(3), 2500);
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <TopNav />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/5 px-4 py-1.5 mb-6">
              <ScanFace className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-xs font-bold uppercase tracking-[3px] text-[#00E5FF]">AI Body Analysis</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-[900] text-white tracking-tight mb-4">
              33 Measurements.<br />
              <span className="text-[#00E5FF]">2 Photos.</span>
            </h1>
            <p className="text-[#888] text-lg max-w-xl mx-auto">
              Our AI extracts precise body landmarks using Google MediaPipe. No measuring tape, no guessing.
            </p>
          </motion.div>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-0 mb-14">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                    isDone ? "text-[#00E5FF] bg-[#00E5FF]/10" :
                    isActive ? "text-white bg-white/10" :
                    "text-[#444]"
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("w-8 h-px mx-1 transition-all", isDone ? "bg-[#00E5FF]" : "bg-white/10")} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: Upload */}
          {step === 1 && (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
              {/* Calibration tip */}
              <motion.div variants={itemVariants} className="glass-panel rounded-xl p-4 flex items-start gap-3 border-l-2 border-[#F5C842]">
                <Info className="w-4 h-4 text-[#F5C842] shrink-0 mt-0.5" />
                <p className="text-sm text-[#888]">
                  <span className="text-[#F5C842] font-bold">Calibration Tip:</span> Place an A4 paper (21×29.7cm) flat on the floor in front of you. Our AI uses it as a scale reference for millimeter accuracy.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Front View", desc: "Stand straight, arms slightly away from body", key: "front", state: frontUploaded, setter: setFrontUploaded },
                  { label: "Side View", desc: "Stand sideways, feet together, arms at sides", key: "side", state: sideUploaded, setter: setSideUploaded },
                ].map(({ label, desc, state, setter }) => (
                  <motion.div key={label} variants={itemVariants}>
                    <button
                      onClick={() => setter(true)}
                      className={cn(
                        "w-full h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all group",
                        state
                          ? "border-[#00E5FF] bg-[#00E5FF]/5"
                          : "border-white/10 bg-[#111] hover:border-white/30 hover:bg-white/5"
                      )}
                    >
                      {state ? (
                        <>
                          <CheckCircle className="w-12 h-12 text-[#00E5FF]" />
                          <p className="text-[#00E5FF] font-bold">{label} Uploaded</p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                            <Camera className="w-7 h-7 text-[#555]" />
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold">{label}</p>
                            <p className="text-[#555] text-sm mt-1">{desc}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#444]">
                            <Upload className="w-3.5 h-3.5" />
                            Click to upload or drag & drop
                          </div>
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={itemVariants} className="text-center pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-12"
                  disabled={!frontUploaded || !sideUploaded}
                  onClick={simulateAnalysis}
                >
                  Analyze My Body <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                {(!frontUploaded || !sideUploaded) && (
                  <p className="text-[#444] text-xs mt-3">Upload both photos to continue</p>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Analyzing */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-[#00E5FF]/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-4 border-[#00E5FF]/40 animate-ping" style={{ animationDelay: "0.3s" }} />
                <div className="relative w-full h-full rounded-full bg-[#00E5FF]/10 border-2 border-[#00E5FF] flex items-center justify-center">
                  <ScanFace className="w-10 h-10 text-[#00E5FF] animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Extracting Body Landmarks...</h3>
              <p className="text-[#555] text-sm">Using Google MediaPipe + MiDaS depth estimation</p>
              <div className="mt-8 max-w-xs mx-auto space-y-2">
                {["Detecting pose keypoints", "Estimating depth using MiDaS", "Calibrating with A4 reference", "Computing 33 measurements"].map((t, i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                    className="flex items-center gap-2 text-xs text-[#555]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                    {t}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="flex items-center gap-3 bg-[#00E5FF]/5 border border-[#00E5FF]/20 rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-[#00E5FF] shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">Analysis complete! 33 measurements captured.</p>
                  <p className="text-[#555] text-xs mt-0.5">Accuracy: ±2mm | Powered by MediaPipe + MiDaS</p>
                </div>
                <div className="ml-auto shrink-0">
                  <span className="text-[#00E5FF] font-[900] text-lg">98.7%</span>
                  <p className="text-[#444] text-xs text-right">confidence</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="w-4 h-4 text-[#F5C842]" />
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs">Your Measurements</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {MEASUREMENTS.map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-panel rounded-xl p-4 text-center"
                    >
                      <p className="text-[#555] text-xs uppercase tracking-widest mb-1">{m.label}</p>
                      <p className="text-white font-[900] text-2xl">{m.value}</p>
                      <p className="text-[#444] text-xs">{m.unit}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" size="lg" className="flex-1">
                  Shop With My Measurements <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  Save & Go to Dashboard
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
