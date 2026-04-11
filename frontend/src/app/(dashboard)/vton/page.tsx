"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Shirt, Sparkles, Image as ImageIcon, Loader2, RefreshCcw, CheckCircle2 } from "lucide-react";
import { processVirtualTryOn } from "./actions";
import Image from "next/image";

export default function VirtualTryOnPage() {
  const [humanImg, setHumanImg] = useState<string | null>(null);
  const [garmentImg, setGarmentImg] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resize and compress image client-side to prevent Next.js 1MB Server Action limits
  const processImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
             height *= MAX_DIM / width;
             width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
             width *= MAX_DIM / height;
             height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        // Compress to JPEG to save bandwidth drastically
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        callback(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = (type: "human" | "garment", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    processImage(file, (base64) => {
      if (type === "human") setHumanImg(base64);
      else setGarmentImg(base64);
    });
  };

  const handlePredict = async () => {
    if (!humanImg || !garmentImg || !description.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setResultImg(null);

    const res = await processVirtualTryOn(humanImg, garmentImg, description);
    
    if (res.success && res.imageUrl) {
      setResultImg(res.imageUrl);
    } else {
      setErrorMsg(res.error || "An unknown error occurred during generation.");
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8">
      {/* Header section */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-4 mb-4">
          <Shirt className="w-10 h-10 text-[#FF4D94]" />
          Virtual Try-On Studio
        </h1>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          Experience hyper-realistic AI fitting. Upload a photo of yourself, a photo of the garment you want to wear, and briefly describe it. We'll handle the rest.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Garment Description Input */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_4px_25px_rgb(0,0,0,0.03)]">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Describe the Garment
            </h3>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., A vintage black leather motorcycle jacket with silver hardware..."
              className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D94]/50 focus:border-[#FF4D94] resize-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Human Image Upload */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_4px_25px_rgb(0,0,0,0.03)] flex flex-col relative h-[250px]">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  1. You (Full / Half Body)
               </h3>
               <label className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center justify-center overflow-hidden relative group">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload("human", e)} />
                  {humanImg ? (
                    <>
                      <img src={humanImg} className="w-full h-full object-cover" alt="Human" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <RefreshCcw className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1"><CheckCircle2 className="w-4 h-4" /></div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 justify-center p-4 text-center">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                      <span className="text-xs font-semibold">Upload Photo</span>
                    </div>
                  )}
               </label>
            </div>

             {/* Garment Image Upload */}
             <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_4px_25px_rgb(0,0,0,0.03)] flex flex-col relative h-[250px]">
               <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  2. The Garment
               </h3>
               <label className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center justify-center overflow-hidden relative group">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload("garment", e)} />
                  {garmentImg ? (
                    <>
                      <img src={garmentImg} className="w-full h-full object-contain bg-slate-100" alt="Garment" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <RefreshCcw className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1"><CheckCircle2 className="w-4 h-4" /></div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 justify-center p-4 text-center">
                      <Shirt className="w-8 h-8 opacity-50" />
                      <span className="text-xs font-semibold">Upload Garment</span>
                    </div>
                  )}
               </label>
            </div>
          </div>

          <button
             onClick={handlePredict}
             disabled={loading || !humanImg || !garmentImg || !description.trim()}
             className="w-full py-5 rounded-2xl text-white font-black text-lg tracking-wider transition-all shadow-xl hover:shadow-[#FF4D94]/30 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3"
             style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}
          >
             {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
             {loading ? "Generating Magic..." : "Generate Magic Fit"}
          </button>
          
          {errorMsg && (
             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
                {errorMsg}
             </div>
          )}
        </div>

        {/* RIGHT COLUMN: OUTPUT */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl relative overflow-hidden h-[600px] lg:h-[800px] border-[8px] border-slate-100 flex flex-col items-center justify-center">
             
             {/* Studio Lighting Effects */}
             <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
             
             <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex flex-col items-center gap-6"
                  >
                     <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-slate-700/50 rounded-full animate-ping" />
                        <div className="absolute inset-2 border-4 border-[#FF4D94] rounded-full border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Shirt className="w-8 h-8 text-[#FF4D94]" />
                        </div>
                     </div>
                     <div className="text-center">
                        <h3 className="text-xl font-bold text-white tracking-wide mb-2">Analyzing Garment Physics</h3>
                        <p className="text-slate-400 text-sm">Hugging Face IDM-VTON is processing.<br/>Usually takes 20-30 seconds.</p>
                     </div>
                  </motion.div>
                ) : resultImg ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full relative rounded-[2rem] overflow-hidden group"
                  >
                     <img src={resultImg} className="w-full h-full object-cover" alt="Virtual Try On Result" />
                     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                        <button 
                           onClick={() => {
                              const a = document.createElement("a");
                              a.href = resultImg;
                              a.download = "YOUNGIN_VTON_Edit.png";
                              a.click();
                           }}
                           className="bg-white/90 backdrop-blur text-slate-900 px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest shadow-xl hover:bg-white hover:scale-105 transition-all"
                        >
                           Download Look
                        </button>
                     </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" className="text-center text-slate-500 px-8">
                     <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
                     <h3 className="text-2xl font-bold text-slate-300 mb-2">The Studio is Ready</h3>
                     <p className="max-w-md mx-auto">Upload yourself and a garment on the left, then click Generate to magically fuse them together using state-of-the-art diffusion modeling.</p>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
