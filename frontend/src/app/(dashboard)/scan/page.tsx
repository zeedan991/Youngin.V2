"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { 
  UploadCloud, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ScanLine,
  ArrowRight,
  Info
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SP: Transition = { duration: 0.6, ease: "easeOut" };

export default function AIBodyScanPage() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // Mock function to simulate secure upload
  const simulateUpload = (type: "front" | "side") => {
    // In production, this proxies to your secure AWS S3 bucket
    if (type === "front") setFrontImage("loaded");
    if (type === "side") setSideImage("loaded");
  };

  const handleStartScan = () => {
    if (!frontImage || !sideImage) return;
    setScanning(true);
    // Simulate FastAPI machine learning processing time
    setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
    }, 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <header className="mb-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SP}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-[#FF4D94] text-xs font-bold tracking-widest uppercase mb-4">
            <ScanLine className="w-4 h-4" /> Neural Engine Active
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 text-slate-900">AI Body Sizing</h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Upload two photos. Our MediaPipe engine extracts 33 discrete 3D landmarks and calculates exact depth circumference with ±1mm accuracy without a tape measure.
          </p>
        </motion.div>
      </header>

      {/* Main Scanner Console */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.1 }}
        className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8 md:p-12 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!scanComplete ? (
            <motion.div key="upload" exit={{ opacity: 0 }} className="space-y-12">
              
              {/* Educational Warning */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  For flawless 3D physics rendering, wear tight-fitting clothing (like activewear). Ensure the camera is at waist-height and your full body is visible in the frame.
                </p>
              </div>

              {/* Upload Zones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Front Photo Zone */}
                <div onClick={() => simulateUpload("front")} className={`relative cursor-pointer transition-all border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center ${frontImage ? 'border-[#FF4D94] bg-[#FF4D94]/5' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'}`}>
                  {frontImage ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#FF4D94]/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-[#FF4D94]" />
                      </div>
                      <div>
                        <p className="text-[#FF4D94] font-bold text-lg mb-1">Front Profile Secured</p>
                        <p className="text-slate-500 text-xs">A-Pose mapped successfully.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-200 mb-6">
                        <Camera className="w-8 h-8 text-slate-500" />
                      </div>
                      <h3 className="text-slate-900 font-bold text-lg mb-2">Front Facing Photo</h3>
                      <p className="text-slate-500 text-sm mb-6 max-w-[200px]">Upload a standard front-facing photo in A-Pose.</p>
                      <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                        <UploadCloud className="w-4 h-4" /> Browse Files
                      </button>
                    </>
                  )}
                </div>

                {/* Side Photo Zone */}
                <div onClick={() => simulateUpload("side")} className={`relative cursor-pointer transition-all border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center ${sideImage ? 'border-[#FF4D94] bg-[#FF4D94]/5' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'}`}>
                   {sideImage ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#FF4D94]/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-[#FF4D94]" />
                      </div>
                      <div>
                        <p className="text-[#FF4D94] font-bold text-lg mb-1">Side Depth Secured</p>
                        <p className="text-slate-500 text-xs">Z-axis data captured.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-200 mb-6">
                        <ScanLine className="w-8 h-8 text-slate-500" />
                      </div>
                      <h3 className="text-slate-900 font-bold text-lg mb-2">Side Profile Photo</h3>
                      <p className="text-slate-500 text-sm mb-6 max-w-[200px]">Upload a 90-degree side profile photo for depth mapping.</p>
                      <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                        <UploadCloud className="w-4 h-4" /> Browse Files
                      </button>
                    </>
                  )}
                </div>

              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-slate-500 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Photos are end-to-end encrypted and deleted immediately after mapping.
                </p>
                <button 
                  onClick={handleStartScan}
                  disabled={!frontImage || !sideImage || scanning}
                  className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-3 shadow-sm ${frontImage && sideImage && !scanning ? 'bg-[#FF4D94] text-white hover:scale-105' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                  {scanning ? (
                    <>Processing Engine... <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></>
                  ) : (
                    <>Initialize 3D Sequence <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-12">
               <div className="w-24 h-24 rounded-full bg-[#FF4D94]/20 flex items-center justify-center mb-8 relative">
                 <div className="absolute inset-0 rounded-full border-4 border-[#FF4D94] animate-ping opacity-20" />
                 <CheckCircle2 className="w-12 h-12 text-[#FF4D94]" />
               </div>
               <h2 className="text-4xl font-black tracking-tight mb-4 text-slate-900">Body Mapped Successfully</h2>
               <p className="text-slate-500 max-w-lg mx-auto mb-8">
                 Your unique 3D geometrical mesh has been saved to your decentralized profile. All custom clothes, tailor metrics, and thrift box dimensions will automatically snap to your physique.
               </p>
               <div className="flex gap-4">
                 <button onClick={() => { setFrontImage(null); setSideImage(null); setScanComplete(false); }} className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-900 bg-white font-semibold hover:bg-slate-50 shadow-sm transition-colors">
                   Scan Again
                 </button>
                 <Link href="/studio">
                   <button className="px-6 py-2.5 rounded-full bg-[#FF4D94] text-white font-semibold hover:scale-105 shadow-sm transition-transform flex items-center gap-2">
                     Open Canvas Studio <ArrowRight className="w-4 h-4" />
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
