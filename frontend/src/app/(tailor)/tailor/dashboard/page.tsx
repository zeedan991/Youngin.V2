"use client";

import { useState, useEffect } from "react";
import { getTailorOrders, getTailorTransactions, getTailorDesigns } from "@/app/(tailor)/tailor/actions";
import { fetchLiveProfile } from "@/app/(dashboard)/profile/actions";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  TrendingUp,
  CreditCard,
  ArrowRight,
  ClipboardList,
  Image as ImageIcon,
  Users,
  Scissors,
} from "lucide-react";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function TailorDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);

  useEffect(() => {
    fetchLiveProfile().then((r) => { if (r.success) setProfile(r.data); });
    getTailorOrders().then(setOrders);
    getTailorTransactions().then(setTransactions);
    getTailorDesigns().then(setDesigns);
  }, []);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const inProgressOrders = orders.filter((o) => o.status === "in_progress").length;
  const totalEarnings = transactions.filter((t) => t.status !== "payout").reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0);
  const escrow = transactions.filter((t) => t.status === "escrow").reduce((s, t) => s + t.amount, 0);

  const STATS = [
    { label: "Available Balance", value: "$3,450", icon: DollarSign, change: "+12.5%", color: "from-emerald-500/10 to-emerald-600/5", iconColor: "text-emerald-500" },
    { label: "In Escrow (Pending)", value: `$${escrow}`, icon: Clock, change: `${pendingOrders + inProgressOrders} orders`, color: "from-yellow-500/10 to-yellow-600/5", iconColor: "text-yellow-500" },
    { label: "Total Earnings", value: `$${totalEarnings.toLocaleString()}`, icon: TrendingUp, change: "+8.2%", color: "from-blue-500/10 to-blue-600/5", iconColor: "text-blue-500" },
    { label: "Next Payout", value: "$850", icon: CreditCard, change: "Oct 15", color: "from-indigo-500/10 to-indigo-600/5", iconColor: "text-indigo-500" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Tailor Portal</p>
          <h1 className="text-3xl font-black text-slate-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
            Welcome back, {profile?.full_name?.split(" ")[0] || "Tailor"} 🧵
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here&apos;s what&apos;s happening with your business today.</p>
        </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className={`relative rounded-2xl p-5 border border-slate-200 overflow-hidden bg-white shadow-xl shadow-slate-200/50`}>
            <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${s.color}`} />
            <div className="relative z-10">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-white shadow-sm border border-slate-100`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-slate-900 text-2xl font-black">{s.value}</p>
              <p className="text-slate-500 text-[10px] font-bold mt-1">{s.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#4F46E5]" />
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Recent Orders</h2>
            </div>
            <Link href="/tailor/orders" className="text-[10px] font-black text-slate-400 hover:text-[#4F46E5] flex items-center gap-1 uppercase tracking-wider transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 4).map((o) => (
              <div key={o.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Scissors className="w-4 h-4 text-[#4F46E5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 font-bold text-sm truncate">{o.client_name}</p>
                  <p className="text-slate-500 text-xs">{o.garment}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-900 font-black text-sm">${o.amount}</p>
                  <span className={`inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider mt-1 shadow-sm ${statusColor[o.status]}`}>
                    {statusLabel[o.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Portfolio Preview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats */}
          <div className="rounded-2xl border border-slate-200 p-5 bg-white shadow-xl shadow-slate-200/50">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Users className="w-3.5 h-3.5 text-[#4F46E5]" /> Business Stats</h3>
            <div className="space-y-3">
              {[
                { label: "Total Orders", value: orders.length, suffix: "all time" },
                { label: "Pending", value: pendingOrders, suffix: "awaiting" },
                { label: "Portfolio Pieces", value: designs.length, suffix: "published" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-bold">{stat.label}</span>
                  <span className="text-slate-900 font-black text-sm">{stat.value} <span className="text-slate-400 text-[10px] font-normal">{stat.suffix}</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-200 p-5 bg-white shadow-xl shadow-slate-200/50">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "View Portfolio", href: "/tailor/portfolio", icon: ImageIcon },
                { label: "Manage Orders", href: "/tailor/orders", icon: ClipboardList },
                { label: "Financial Report", href: "/tailor/financials", icon: DollarSign },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center justify-between px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-slate-100 transition-all group shadow-sm">
                  <div className="flex items-center gap-3">
                    <a.icon className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span className="text-slate-600 group-hover:text-slate-900 text-xs font-bold transition-colors">{a.label}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#4F46E5] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
