"use client";

import { motion, type Transition } from "framer-motion";
import { 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Scissors, 
  Package, 
  LayoutTemplate,
  ArrowRight,
  Activity
} from "lucide-react";
import Link from "next/link";

const SP: Transition = { duration: 0.6, ease: "easeOut" };

export default function DashboardOverviewPage() {
  // Hardcoded UI demonstration data
  const user = { name: "Alex R.", level: 12, title: "Rising Icon", xp: 3450, xpNext: 5000 };
  const scan = { chest: "98.2", waist: "76.4", hips: "94.1", date: "Today, 10:42 AM" };
  const badges = [
    { title: "Precision Mapped", desc: "Completed 3D scan", icon: Activity, color: "text-[#FF4D94]" },
    { title: "Visionary", desc: "Designed 5 pieces", icon: LayoutTemplate, color: "text-purple-400" },
    { title: "Couture Node", desc: "First tailor order", icon: Scissors, color: "text-blue-400" },
  ];
  const projects = [
    { title: "Oversized Utility Jacket", status: "Pattern Cutting", meta: "Atelier Lisbon", tag: "Tailor" },
    { title: "Monthly Thrift Box", status: "Being Curated", meta: "Arriving May 12", tag: "Subscription" }
  ];

  const xpPercent = (user.xp / user.xpNext) * 100;

  return (
    <div className="w-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SP}>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">Welcome back.</h1>
          <p className="text-slate-500 text-lg">Here is your style command center, {user.name.split(" ")[0]}.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={SP} className="flex gap-4">
           {/* Primary action hooked up dynamically over time */}
           <Link href="/studio">
             <button className="rounded-full bg-[#FF4D94] text-white px-6 py-2.5 font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
               Enter 3D Studio <ArrowRight className="w-4 h-4"/>
             </button>
           </Link>
        </motion.div>
      </header>

      {/* ════ BENTO GRID LAYOUT ════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* 1. GAMIFICATION / PROFILE (Spans 2 columns on wide screens) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.1 }}
          className="md:col-span-2 lg:col-span-2 rounded-3xl border border-slate-200 bg-white shadow-sm p-8 relative overflow-hidden group"
        >
          {/* subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4D94]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[#FF4D94]/10 transition-colors duration-700" />
          
          <div className="flex items-center gap-6 mb-8 relative z-10">
            <div className="h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-[#FF4D94] to-[#B8005C] shadow-inner flex items-center justify-center border-4 border-white shadow-sm">
              <span className="text-white font-extrabold text-2xl tracking-tighter">LV.{user.level}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">{user.name}</h2>
              <div className="flex items-center gap-2 text-slate-400">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="font-medium text-sm text-yellow-500">{user.title}</span> &bull; 
                <span className="text-sm border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#FF4D94]" /> 99.8% Credibility
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              className="h-full bg-gradient-to-r from-[#FF4D94] to-[#B8005C] rounded-full"
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500 font-medium relative z-10">
            <span>{user.xp} XP</span>
            <span>{user.xpNext} XP for Next Rank</span>
          </div>
        </motion.div>

        {/* 2. LATEST SCAN METRICS */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.15 }}
          className="md:col-span-1 lg:col-span-1 rounded-3xl border border-slate-200 bg-white shadow-sm p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-700">Latest Scan</h3>
              <Activity className="w-5 h-5 text-[#FF4D94]" />
            </div>
            <div className="space-y-4 text-slate-900">
              <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <span className="text-sm text-slate-500">Chest</span>
                <span className="font-mono text-xl font-bold">{scan.chest}<span className="text-xs text-slate-500 ml-1">cm</span></span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <span className="text-sm text-slate-500">Waist</span>
                <span className="font-mono text-xl font-bold">{scan.waist}<span className="text-xs text-slate-500 ml-1">cm</span></span>
              </div>
              <div className="flex justify-between items-end pb-2">
                <span className="text-sm text-slate-500">Hips</span>
                <span className="font-mono text-xl font-bold">{scan.hips}<span className="text-xs text-slate-500 ml-1">cm</span></span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2">
            <span className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold flex items-center justify-between">
              Status <span className="text-[#FF4D94] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#FF4D94] animate-pulse"/> Verified</span>
            </span>
          </div>
        </motion.div>

        {/* 3. ACTIVE PROJECTS */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.2 }}
          className="md:col-span-3 lg:col-span-1 rounded-3xl border border-slate-200 bg-white shadow-sm p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-700">Active Pipelines</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {projects.map((proj, i) => (
              <div key={i} className="flex-1 rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col justify-between group hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 shrink-0">
                     {proj.tag === "Tailor" ? <Scissors className="w-4 h-4 text-white" /> : <Package className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm leading-tight text-slate-900 mb-1 group-hover:text-[#FF4D94] transition-colors">{proj.title}</h4>
                    <p className="text-xs text-slate-500">{proj.meta}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full w-[60%]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">{proj.status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 4. UNLOCKED BADGES (Spans full width bottom) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.25 }}
          className="md:col-span-3 lg:col-span-4 rounded-3xl border border-slate-200 bg-white shadow-sm p-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
             <div>
               <h3 className="font-bold text-lg mb-1 text-slate-900">Your Achievements</h3>
               <p className="text-sm text-slate-500">Unlock badges to increase your platform credibility.</p>
             </div>
             <button className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1 hover:text-[#FF4D94] transition-colors">
               View All <ArrowRight className="w-3 h-3"/>
             </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div key={i} className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 transition-all cursor-default shadow-sm">
                  <div className={`h-12 w-12 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-sm`}>
                    <Icon className={`w-6 h-6 ${badge.color}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 mb-0.5">{badge.title}</h4>
                    <p className="text-xs text-slate-500">{badge.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
