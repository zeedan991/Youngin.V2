"use client";

import { useEffect, useState } from "react";
import { getTailorTransactions } from "@/app/(tailor)/tailor/actions";
import { DollarSign, Clock, TrendingUp, CreditCard, ArrowUpRight } from "lucide-react";

type TxnFilter = "All" | "Earnings" | "Payouts";

const statusBadge: Record<string, string> = {
  released: "bg-green-100 text-green-700 border-green-200",
  escrow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  payout: "bg-indigo-100 text-indigo-700 border-indigo-200",
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
    { label: "Available Balance", value: "$3,450.00", icon: DollarSign, change: "+12.5%", iconColor: "text-emerald-500" },
    { label: "In Escrow", value: `$${escrow.toLocaleString()}.00`, icon: Clock, change: `${transactions.filter((t) => t.status === "escrow").length} orders`, iconColor: "text-yellow-500" },
    { label: "Total Earnings", value: `$${totalEarnings.toLocaleString()}.00`, icon: TrendingUp, change: "+8.2%", iconColor: "text-blue-500" },
    { label: "Next Payout", value: "$850.00", icon: CreditCard, change: "Oct 15", iconColor: "text-purple-500" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6 min-h-screen bg-slate-50">
      <div>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Tailor Portal</p>
        <h1 className="text-3xl font-black text-slate-900" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Financials</h1>
        <p className="text-slate-400 text-sm mt-1">Track your earnings, escrow balances, and payouts.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl p-5 border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center ${s.iconColor}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.change}</span>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-slate-900 text-2xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-black text-slate-900 text-sm uppercase tracking-wider">Recent Activity</h2>
          <div className="flex gap-2">
            {(["All", "Earnings", "Payouts"] as TxnFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${
                  filter === f
                    ? "bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5]/30"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-[1.5fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50">
          {["Transaction ID", "Client / Origin", "Details", "Date", "Amount", "Status"].map((h) => (
            <span key={h} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((t) => (
            <div key={t.id} className="grid grid-cols-[1.5fr_2fr_2fr_1.5fr_1fr_1fr] gap-4 items-center px-6 py-4 hover:bg-slate-50 transition-colors">
              <span className="text-slate-400 text-xs font-mono">{t.id}</span>
              <span className="text-slate-900 font-bold text-sm">{t.client}</span>
              <span className="text-slate-500 text-xs">{t.details}</span>
              <span className="text-slate-400 text-xs">{t.date}</span>
              <span className={`font-black text-sm ${t.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString()}.00
              </span>
              <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider w-fit shadow-sm ${statusBadge[t.status]}`}>
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
