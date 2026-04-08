"use client";

import { motion, type Transition } from "framer-motion";
import { Settings, CreditCard, Clock, Shirt, Edit3, LogOut, ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const SP: Transition = { duration: 0.6, ease: "easeOut" };

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"settings" | "history" | "payments" | "designs">("settings");

  const tabs = [
    { id: "settings", label: "Account Settings", icon: Settings },
    { id: "history", label: "Order History", icon: Clock },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "designs", label: "Saved Designs", icon: Shirt },
  ] as const;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SP} className="flex items-center gap-6">
          <div className="relative">
             <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF4D94] to-[#B8005C] shadow-inner flex items-center justify-center p-1">
               <div className="w-full h-full rounded-full bg-[#111116] border-4 border-black flex items-center justify-center text-3xl font-black text-white">
                 AR
               </div>
             </div>
             <button className="absolute bottom-0 right-0 p-2 bg-[#111116] border border-white/10 rounded-full hover:bg-white/10 transition-colors">
               <Edit3 className="w-4 h-4 text-slate-300" />
             </button>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">Alex Rivera</h1>
            <p className="text-slate-400 text-lg flex items-center gap-2">
              Level 12 &bull; <span className="text-[#FF4D94]">Premium Subscriber</span>
            </p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={SP}>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors font-bold text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SP, delay: 0.1 }}
          className="w-full md:w-64 shrink-0 flex flex-col gap-2"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isActive ? 'bg-white/10 border-white/20 text-white' : 'bg-[#111116] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF4D94]' : ''}`} /> {tab.label}
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )
          })}
        </motion.div>

        {/* Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.2 }}
          className="flex-1 rounded-3xl border border-white/10 bg-[#111116] p-8 min-h-[400px]"
        >
          {activeTab === "settings" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div>
                 <h2 className="text-xl font-bold mb-4">Personal Details</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                     <input type="text" defaultValue="Alex Rivera" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF4D94]/50 transition-colors" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                     <input type="email" defaultValue="alex.rivera@example.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF4D94]/50 transition-colors" />
                   </div>
                   <div className="space-y-1 md:col-span-2">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Shipping Address</label>
                     <input type="text" defaultValue="42 Couture Ave, DTLA, 90014" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF4D94]/50 transition-colors" />
                   </div>
                 </div>
               </div>
               
               <div className="pt-6 border-t border-white/5">
                 <button className="px-6 py-2.5 bg-[#FF4D94] text-black rounded-full font-bold text-sm hover:scale-105 transition-transform">Save Changes</button>
               </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-xl font-bold mb-4">Order History</h2>
              {[1,2].map(i => (
                <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                      <Shirt className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-bold">Utility Jacket &bull; Custom Fit</h4>
                      <p className="text-xs text-slate-400">Order #YGN-{9042 + i} &bull; Delivered Jan 24</p>
                    </div>
                  </div>
                  <button className="text-sm font-semibold text-[#FF4D94] hover:text-white transition-colors">View Receipt</button>
                </div>
              ))}
            </div>
          )}
          
          {(activeTab === "payments" || activeTab === "designs") && (
            <div className="flex-1 min-h-[300px] flex items-center justify-center text-slate-500 animate-in fade-in duration-500">
              Feature vault unlocking soon in v2.1
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
