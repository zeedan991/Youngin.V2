"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Keep the loading screen active for 1.8 seconds to allow fonts and 3D scripts to instantiate
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-[#0a0a0a]"
        >
          {/* Logo preloads perfectly for the nav bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative h-24 w-72 md:h-28 md:w-80"
          >
            <Image src="/logo.png" alt="YOUNGIN" fill className="object-contain scale-[1.6] origin-center" priority />
          </motion.div>

          {/* Progress bar */}
          <div className="h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="h-full bg-white"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
