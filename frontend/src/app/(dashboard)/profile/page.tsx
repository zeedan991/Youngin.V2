"use client";

import { motion, type Transition } from "framer-motion";
import { Settings, CreditCard, Clock, Shirt, Edit3, LogOut, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/app/login/actions";

const SP: Transition = { duration: 0.6, ease: "easeOut" };

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"settings" | "history" | "payments" | "designs">("settings");
  const [designs, setDesigns] = useState<any[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const initProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("User Auth Error:", userError);
          setProfile({ full_name: "Guest User", email: "No session active" });
          return;
        }

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        
        // Always try to pull from the DB first, but if it's null (like some Google profiles), fallback to raw user metadata
        const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User";
        const fallbackAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

        if (profileData) {
          setProfile({
            ...profileData,
            full_name: profileData.full_name || fallbackName,
            avatar_url: profileData.avatar_url || fallbackAvatar,
          });
        } else {
          setProfile({
            full_name: fallbackName,
            email: user.email,
            avatar_url: fallbackAvatar,
            level: 1
          });
        }
      } catch (err) {
        console.error("Critical Profile Error:", err);
        setProfile({ full_name: "User", email: "Data unretrievable", level: 1 });
      }
    };
    initProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "designs") {
      const fetchDesigns = async () => {
        setLoadingDesigns(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("designs").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
          if (data) setDesigns(data);
        }
        setLoadingDesigns(false);
      };
      fetchDesigns();
    }
  }, [activeTab]);

  const tabs = [
    { id: "settings", label: "Account Settings", icon: Settings },
    { id: "history", label: "Order History", icon: Clock },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "designs", label: "Saved Designs", icon: Shirt },
  ] as const;

  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "YU";

  return (
    <div className="w-full max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={SP} className="flex items-center gap-6">
          <div className="relative">
             <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF4D94] to-[#B8005C] shadow-inner flex items-center justify-center p-1">
               <div className="w-full h-full rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-3xl font-black text-slate-900 shadow-sm overflow-hidden">
                 {profile?.avatar_url ? (
                   <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                 ) : (
                   initials
                 )}
               </div>
             </div>
             <button className="absolute bottom-0 right-0 p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
               <Edit3 className="w-4 h-4 text-slate-500" />
             </button>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-slate-900">
              {profile?.full_name || "Loading..."}
            </h1>
            <p className="text-slate-500 text-lg flex items-center gap-2">
              Level {profile?.level || 1} &bull; <span className="text-[#FF4D94]">Premium Subscriber</span>
            </p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={SP}>
          <button onClick={() => signout()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-sm shadow-sm">
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
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all shadow-sm ${isActive ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3 font-semibold text-sm">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF4D94]' : ''}`} /> {tab.label}
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            )
          })}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SP, delay: 0.2 }}
          className="flex-1 rounded-3xl border border-slate-200 bg-white shadow-sm p-8 min-h-[400px]"
        >
          {activeTab === "settings" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div>
                 <h2 className="text-xl font-bold mb-4 text-slate-900">Personal Details</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                     <input type="text" defaultValue={profile?.full_name || ""} className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#FF4D94]/50 transition-colors" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                     <input type="email" defaultValue={profile?.email || ""} className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#FF4D94]/50 transition-colors" />
                   </div>
                   <div className="space-y-1 md:col-span-2">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Shipping Address</label>
                     <input type="text" defaultValue="Enter your shipping address" className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#FF4D94]/50 transition-colors" />
                   </div>
                 </div>
               </div>
               
               <div className="pt-6 border-t border-slate-200">
                 <button className="px-6 py-2.5 bg-[#FF4D94] text-white shadow-sm rounded-full font-bold text-sm hover:scale-105 transition-transform">Save Changes</button>
               </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-xl font-bold mb-4 text-slate-900">Order History</h2>
              {[1,2].map(i => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                      <Shirt className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Utility Jacket &bull; Custom Fit</h4>
                      <p className="text-xs text-slate-500">Order #YGN-{9042 + i} &bull; Delivered Jan 24</p>
                    </div>
                  </div>
                  <button className="text-sm font-semibold text-[#FF4D94] hover:text-pink-600 transition-colors">View Receipt</button>
                </div>
              ))}
            </div>
          )}
          
          {(activeTab === "payments") && (
            <div className="flex-1 min-h-[300px] flex items-center justify-center text-slate-500 animate-in fade-in duration-500">
              Payment integrations unlocking soon 
            </div>
          )}

          {activeTab === "designs" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Your Design Locker</h2>
                <button className="text-sm font-semibold text-[#FF4D94] hover:text-pink-600 transition-colors">Start New Design</button>
              </div>

              {loadingDesigns ? (
                <div className="flex items-center justify-center py-12">
                   <div className="w-8 h-8 rounded-full border-4 border-[#FF4D94] border-t-transparent animate-spin" />
                </div>
              ) : designs.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-500 py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Shirt className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-600">No designs saved yet.</p>
                  <p className="text-sm">Head over to the 3D Studio to create your first masterpiece.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {designs.map((design) => (
                    <div key={design.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                        <img 
                          src={design.storage_url} 
                          alt={design.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          {design.type}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 truncate">{design.title}</h4>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(design.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <button onClick={() => alert("Order placed! We are routing this to our manufacturing pipeline.")} className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                            Order Print
                          </button>
                          <button className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
