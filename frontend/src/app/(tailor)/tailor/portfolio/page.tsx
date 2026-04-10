"use client";

import { useEffect, useState } from "react";
import { getTailorDesigns } from "@/app/(tailor)/tailor/actions";
import Link from "next/link";
import { Plus, Shirt, ExternalLink } from "lucide-react";

export default function TailorPortfolioPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTailorDesigns().then((d) => { setDesigns(d); setLoading(false); });
  }, []);

  return (
    <div className="p-6 lg:p-10 space-y-6 min-h-screen" style={{ background: "#0D0D12" }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/30 text-xs font-black uppercase tracking-widest mb-1">Tailor Portal</p>
          <h1 className="text-3xl font-black text-[#F0EBE3]" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Portfolio</h1>
          <p className="text-white/40 text-sm mt-1">Showcase your craft to potential clients.</p>
        </div>
        <Link href="/studio" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}>
          <Plus className="w-3.5 h-3.5" /> Create New
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : designs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <Shirt className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="text-[#F0EBE3] font-black text-lg mb-2">No designs yet</h3>
          <p className="text-white/30 text-sm max-w-sm mb-6">Create your first garment in the 2D Studio and it will appear here automatically.</p>
          <Link href="/studio" className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #FF4D94, #B8005C)" }}>
            <Plus className="w-4 h-4" /> Open Studio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {designs.map((d) => (
            <div key={d.id} className="group relative rounded-2xl overflow-hidden border border-white/5 hover:border-[#FF4D94]/40 transition-all cursor-pointer" style={{ background: "#111118" }}>
              <div className="aspect-square flex items-center justify-center overflow-hidden bg-white/3">
                {d.storage_url ? (
                  <img src={d.storage_url} alt={d.title} className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <Shirt className="w-12 h-12 text-white/10" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <p className="text-[#F0EBE3] font-black text-sm truncate">{d.title || "Untitled"}</p>
                <p className="text-white/50 text-[10px] uppercase tracking-wider">{d.type || "Garment"}</p>
              </div>
              <div className="p-4">
                <p className="text-[#F0EBE3] font-bold text-xs truncate">{d.title || "Untitled Collection"}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">{d.type || "tshirt"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
