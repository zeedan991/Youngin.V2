"use client";

import { useEffect, useState } from "react";
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
  Plus,
} from "lucide-react";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  in_progress: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  completed: "bg-green-500/15 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
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
    { label: "Available Balance", value: "$3,450", icon: DollarSign, change: "+12.5%", color: "from-emerald-500/20 to-emerald-600/10", iconColor: "text-emerald-400" },
    { label: "In Escrow (Pending)", value: `$${escrow}`, icon: Clock, change: `${pendingOrders + inProgressOrders} orders`, color: "from-yellow-500/20 to-yellow-600/10", iconColor: "text-yellow-400" },
    { label: "Total Earnings", value: `$${totalEarnings.toLocaleString()}`, icon: TrendingUp, change: "+8.2%", color: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-400" },
    { label: "Next Payout", value: "$850", icon: CreditCard, change: "Oct 15", color: "from-purple-500/20 to-purple-600/10", iconColor: "text-purple-400" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 min-h-screen" style={{ background: "#0D0D12" }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/30 text-xs font-black uppercase tracking-widest mb-1">Tailor Portal</p>
          <h1 className="text-3xl font-black text-[#F0EBE3]" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
            Welcome back, {profile?.full_name?.split(" ")[0] || "Tailor"} 🧵
          </h1>
          <p className="text-white/40 text-sm mt-1">Here&apos;s what&apos;s happening with your business today.</p>
        </div>
        <Link href="/studio" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #4F46E5, #3730A3)" }}>
          <Plus className="w-3.5 h-3.5" /> New Design
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className={`relative rounded-2xl p-5 border border-white/5 overflow-hidden bg-gradient-to-br ${s.color}`} style={{ background: "#111118" }}>
            <div className="absolute inset-0 bg-gradient-to-br opacity-40" style={{ background: `radial-gradient(circle at top right, ${s.iconColor.replace("text-", "").replace("-400", "")} 0%, transparent 70%)` }} />
            <div className="relative z-10">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-white/5`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-[#F0EBE3] text-2xl font-black">{s.value}</p>
              <p className="text-white/30 text-[10px] font-bold mt-1">{s.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-3 rounded-2xl border border-white/5 overflow-hidden" style={{ background: "#111118" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#4F46E5]" />
              <h2 className="font-black text-[#F0EBE3] text-sm uppercase tracking-wider">Recent Orders</h2>
            </div>
            <Link href="/tailor/orders" className="text-[10px] font-black text-white/30 hover:text-[#4F46E5] flex items-center gap-1 uppercase tracking-wider transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {orders.slice(0, 4).map((o) => (
              <div key={o.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5]/20 to-[#3730A3]/20 flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4 text-[#4F46E5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F0EBE3] font-bold text-sm truncate">{o.client_name}</p>
                  <p className="text-white/40 text-xs">{o.garment}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#F0EBE3] font-black text-sm">${o.amount}</p>
                  <span className={`inline-flex items-center text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider mt-1 ${statusColor[o.status]}`}>
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
          <div className="rounded-2xl border border-white/5 p-5" style={{ background: "#111118" }}>
            <h3 className="font-black text-[#F0EBE3] text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Users className="w-3.5 h-3.5 text-[#4F46E5]" /> Business Stats</h3>
            <div className="space-y-3">
              {[
                { label: "Total Orders", value: orders.length, suffix: "all time" },
                { label: "Pending", value: pendingOrders, suffix: "awaiting" },
                { label: "Portfolio Pieces", value: designs.length, suffix: "published" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-white/40 text-xs font-bold">{stat.label}</span>
                  <span className="text-[#F0EBE3] font-black text-sm">{stat.value} <span className="text-white/20 text-[10px] font-normal">{stat.suffix}</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-white/5 p-5" style={{ background: "#111118" }}>
            <h3 className="font-black text-[#F0EBE3] text-xs uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "View Portfolio", href: "/tailor/portfolio", icon: ImageIcon },
                { label: "Manage Orders", href: "/tailor/orders", icon: ClipboardList },
                { label: "Financial Report", href: "/tailor/financials", icon: DollarSign },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center justify-between px-3 py-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/15 hover:bg-white/7 transition-all group">
                  <div className="flex items-center gap-3">
                    <a.icon className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span className="text-white/60 group-hover:text-white/90 text-xs font-bold transition-colors">{a.label}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

