import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

export const FeatureCard = ({
  icon,
  title,
  description,
  className,
  delay = 0,
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "glass-panel rounded-2xl p-8 flex flex-col gap-4 relative overflow-hidden group transition-all duration-500",
        "hover:border-white/20 hover:neon-border",
        className,
      )}
    >
      {/* Hover glow effect (Neon Trace) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/0 to-[#00E5FF]/0 group-hover:from-[#00E5FF]/10 group-hover:to-transparent transition-all duration-700 pointer-events-none" />

      <div className="h-12 w-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#00E5FF] mb-2 group-hover:scale-110 group-hover:text-glow transition-transform duration-500">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      <p className="text-[#888888] leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
};
