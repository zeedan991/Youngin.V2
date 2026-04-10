"use client";

import { useEffect, useState } from "react";
import { getTailorTransactions } from "@/app/(tailor)/tailor/actions";
import { DollarSign, Clock, TrendingUp, CreditCard, ArrowUpRight } from "lucide-react";

type TxnFilter = "All" | "Earnings" | "Payouts";

const statusBadge: Record<string, string> = {
  released: "bg-green-500/15 text-green-400 border-green-500/20",
  escrow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  payout: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const statusLabel: Record<string, string> = {
  released: "Released",
  escrow: "In Escrow",
  payout: "Payout",
};

export default function TailorFinancialsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState<TxnFilter>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTailorTransactions().then((t) => { setTransactions(t); setLoading(false); });
  }, []);

  const filtered = transactions.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Earnings") return t.status !== "payout";
    if (filter === "Payouts") return t.status === "payout";
    return true;
  });

  const totalEarnings = transactions.filter((t) => t.amount > 0 && t.status !== "payout").reduce((s, t) => s + t.amount, 0);
  const escrow = transactions.filter((t) => t.status === "escrow").reduce((s, t) => s + t.amount, 0);

  const STATS = [
    { label: "Available Balance", value: "$3,450.00", icon: DollarSign, change: "+12.5%", iconColor: "text-emerald-400" },
    { label: "In Escrow", value: `$${escrow.toLocaleString()}.00`, icon: Clock, change: `${transactions.filter((t) => t.status === "escrow").length} orders`, iconColor: "text-yellow-400" },
    { label: "Total Earnings", value: `$${totalEarnings.toLocaleString()}.00`, icon: TrendingUp, change: "+8.2%", iconColor: "text-blue-400" },
    { label: "Next Payout", value: "$850.00", icon: CreditCard, change: "Oct 15", iconColor: "text-purple-400" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6 min-h-screen" style={{ background: "#0D0D12" }}>
      <div>
        <p className="text-white/30 text-xs font-black uppercase tracking-widest mb-1">Tailor Portal</p>
        <h1 className="text-3xl font-black text-[#F0EBE3]" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Financials</h1>
        <p className="text-white/40 text-sm mt-1">Track your earnings, escrow balances, and payouts.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl p-5 border border-white/5" style={{ background: "#111118" }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${s.iconColor}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{s.change}</span>
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-[#F0EBE3] text-2xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: "#111118" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-black text-[#F0EBE3] text-sm uppercase tracking-wider">Recent Activity</h2>
          <div className="flex gap-2">
            {(["All", "Earnings", "Payouts"] as TxnFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  filter === f
                    ? "bg-[#FF4D94]/20 text-[#FF4D94] border border-[#FF4D94]/30"
                    : "text-white/30 hover:text-white/60 border border-transparent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-[1.5fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 px-6 py-3 border-b border-white/5">
          {["Transaction ID", "Client / Origin", "Details", "Date", "Amount", "Status"].map((h) => (
            <span key={h} className="text-[9px] font-black text-white/25 uppercase tracking-widest">{h}</span>
          ))}
        </div>

        <div className="divide-y divide-white/5">
          {filtered.map((t) => (
            <div key={t.id} className="grid grid-cols-[1.5fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 items-center px-6 py-4 hover:bg-white/3 transition-colors">
              <span className="text-white/40 text-xs font-mono">{t.id}</span>
              <span className="text-[#F0EBE3] font-bold text-sm">{t.client}</span>
              <span className="text-white/50 text-xs">{t.details}</span>
              <span className="text-white/40 text-xs">{t.date}</span>
              <span className={`font-black text-sm ${t.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString()}.00
              </span>
              <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider w-fit ${statusBadge[t.status]}`}>
                {t.status === "payout" && <ArrowUpRight className="w-2.5 h-2.5" />}
                {statusLabel[t.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
