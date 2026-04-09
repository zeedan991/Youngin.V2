"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { type Achievement, RARITY_COLORS } from "@/lib/achievements";
import { X } from "lucide-react";

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 400);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {visible && achievement && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed bottom-8 right-6 z-[9999] w-[340px] select-none"
        >
          {/* Glow halo */}
          <div className="absolute -inset-1 rounded-3xl bg-[#FF4D94]/20 blur-lg" />

          <div className="relative rounded-3xl bg-[#0F0E0E] border border-[#FF4D94]/30 shadow-2xl overflow-hidden">
            {/* Top shimmer bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]}`} />

            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} flex items-center justify-center text-2xl shadow-lg`}>
                  {achievement.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[3px] text-[#FF4D94] mb-1">
                    Achievement Unlocked!
                  </p>
                  <h3 className="text-white font-extrabold text-base leading-tight mb-1">
                    {achievement.title}
                  </h3>
                  <p className="text-white/50 text-xs leading-relaxed">
                    {achievement.description}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-[#FF4D94]/10 border border-[#FF4D94]/20 rounded-full px-3 py-1">
                    <span className="text-[10px] font-black text-[#FF4D94]">+{achievement.xpReward} XP</span>
                  </div>
                </div>

                {/* Close */}
                <button onClick={() => { setVisible(false); setTimeout(onClose, 400); }} className="text-white/30 hover:text-white transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar auto-dismiss */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className={`mt-4 h-0.5 bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} rounded-full opacity-40`}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
