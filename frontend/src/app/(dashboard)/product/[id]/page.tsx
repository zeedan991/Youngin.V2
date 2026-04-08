"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProductPlaceholderPage() {
  const params = useParams();
  const id = params?.id || "unknown";

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
        <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-slate-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-slate-900">Product #{id as string}</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          This is a placeholder for the product details page. In upcoming phases, this will fetch dynamic inventory data from our brand partners and thrift curation engine, showcasing exact geometry fit mapping to your body profile.
        </p>
        <Link href="/marketplace">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 transition-colors mx-auto shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
