"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-white"
        >
          {/* Ambient glow behind logo */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-[#FF4D94]/10 blur-[100px] pointer-events-none" />
          
          {/* Logo — enlarged and premium */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative h-32 w-80 md:h-36 md:w-96"
          >
            <Image src="/youngin_whitebg.png" alt="YOUNGIN" fill className="object-contain scale-[1.6] origin-center" priority />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-[11px] font-medium tracking-[4px] uppercase text-slate-500"
          >
            AI-Powered Fashion Infrastructure
          </motion.p>

          {/* Progress bar */}
          <div className="h-[2px] w-48 overflow-hidden rounded-full bg-white/10 mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-[#FF4D94] to-white"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
