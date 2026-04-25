"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shirt } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TryOnPlaceholderPage() {
  const params = useParams();
  const id = params?.id || "unknown";

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-[#4F46E5]/5 group-hover:bg-[#4F46E5]/10 transition-colors" />
          <Shirt className="w-10 h-10 text-[#4F46E5] relative z-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-slate-900">
          Virtual Try-On #{id as string}
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          This is a placeholder for the 3D virtual try-on experience. Soon, you
          will be able to map this garment directly onto your
          MediaPipe-generated physics mesh and visualize fabric draping in
          real-time.
        </p>
        <Link href="/dashboard">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-900 font-semibold hover:bg-slate-50 transition-colors mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
