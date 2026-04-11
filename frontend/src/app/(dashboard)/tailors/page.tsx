"use client";

import { motion, type Transition } from "framer-motion";
import { Scissors, MapPin, Star, Clock, CheckCircle2 } from "lucide-react";
import Image from "next/image";

const SP: Transition = { duration: 0.6, ease: "easeOut" };

const TAILORS = [
  { id: 1, name: "Atelier Lisbon", location: "Downtown District, 1.2 mi", rating: 4.9, jobs: 124, status: "Available", img: "https://images.unsplash.com/photo-1598522385911-3957eb6a617e?q=80&w=600&auto=format&fit=crop", tags: ["Bespoke", "Denim"] },
  { id: 2, name: "Stitch & Structure", location: "Westside Hub, 3.4 mi", rating: 4.7, jobs: 89, status: "Busy", img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop", tags: ["Alterations", "Leather"] },
  { id: 3, name: "Metro Couture", location: "North Ave, 5.0 mi", rating: 4.9, jobs: 312, status: "Available", img: "https://images.unsplash.com/photo-1505634599663-4c90ab0501de?q=80&w=600&auto=format&fit=crop", tags: ["3D Printing", "Oversized"] }
];

export default function TailorsPage() {
  return (
    <div className="w-full">
      {/* Demo Mode Banner */}
      <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl border bg-yellow-50 border-yellow-200">
        <span className="text-xs font-black uppercase tracking-widest text-yellow-600">⚠ Demo Mode</span>
        <span className="text-xs text-yellow-700">This page displays sample tailors. Real tailor network coming soon.</span>
      </div>

      <header className="mb-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SP}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-4 bg-indigo-50 border-indigo-200 text-indigo-600">
            <Scissors className="w-4 h-4" /> Node Network Active
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 text-slate-900">Tailor Network</h1>
          <p className="text-lg max-w-2xl text-slate-500">
            Push your customized 3D Studio designs directly to a verified local tailor near you.
          </p>
        </motion.div>
      </header>

      {/* Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {TAILORS.map((tailor) => (
          <div key={tailor.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden group cursor-pointer hover:border-slate-300 hover:shadow-md transition-all flex flex-col">
            <div className="relative h-48 w-full bg-slate-100">
              <Image src={tailor.img} alt={tailor.name} fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" unoptimized />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${tailor.status === "Available" ? "bg-green-50 text-green-600 border-green-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}>
                  {tailor.status}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{tailor.name}</h3>
                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                   <Star className="w-4 h-4 fill-yellow-500" /> {tailor.rating}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                <MapPin className="w-4 h-4" /> {tailor.location}
              </div>

              <div className="flex gap-2 mb-6">
                {tailor.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-slate-400" /> {tailor.jobs} successful jobs</span>
                <button className="text-xs font-bold tracking-widest uppercase text-slate-900 hover:text-indigo-600 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
