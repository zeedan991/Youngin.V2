"use client";

import { useEffect, useState } from "react";
import { getTailorOrders } from "@/app/(tailor)/tailor/actions";
import { Scissors, Search, Clock, CheckCircle2, XCircle, Loader2, DollarSign } from "lucide-react";

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

type Filter = "all" | "pending" | "in_progress" | "completed" | "cancelled";

export default function TailorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTailorOrders().then((o) => { setOrders(o); setLoading(false); });
  }, []);

  const filtered = orders.filter((o) => {
    const matchesFilter = filter === "all" || o.status === filter;
    const matchesSearch = !search || o.client_name.toLowerCase().includes(search.toLowerCase()) || o.garment.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const FILTERS: { key: Filter; label: string; icon: any }[] = [
    { key: "all", label: "All", icon: null },
    { key: "pending", label: "Pending", icon: Clock },
    { key: "in_progress", label: "In Progress", icon: Loader2 },
    { key: "completed", label: "Completed", icon: CheckCircle2 },
    { key: "cancelled", label: "Cancelled", icon: XCircle },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6 min-h-screen" style={{ background: "#0D0D12" }}>
      <div>
        <p className="text-white/30 text-xs font-black uppercase tracking-widest mb-1">Tailor Portal</p>
        <h1 className="text-3xl font-black text-[#F0EBE3]" style={{ fontFamily: "var(--font-syne), sans-serif" }}>Order Pipeline</h1>
        <p className="text-white/40 text-sm mt-1">Manage every client request from quote to delivery.</p>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                filter === f.key
                  ? "bg-[#4F46E5]/15 text-[#4F46E5] border-[#4F46E5]/30"
                  : "text-white/30 border-white/10 hover:border-white/20 hover:text-white/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client or garment..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F0EBE3] font-bold placeholder:text-white/20 focus:outline-none focus:border-[#4F46E5] transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: "#111118" }}>
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-white/5">
          {["Client", "Garment", "Deadline", "Amount", "Status"].map((h) => (
            <span key={h} className="text-[9px] font-black text-white/30 uppercase tracking-widest">{h}</span>
          ))}
        </div>
        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-white/20 text-sm">No orders found.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((o) => (
              <div key={o.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F46E5]/30 to-[#3730A3]/30 flex items-center justify-center shrink-0 text-[#4F46E5] font-black text-xs">
                    {o.client_name[0]}
                  </div>
                  <span className="text-[#F0EBE3] font-bold text-sm truncate">{o.client_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scissors className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <span className="text-white/60 text-sm truncate">{o.garment}</span>
                </div>
                <span className="text-white/40 text-xs font-bold">{o.deadline}</span>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-green-400" />
                  <span className="text-[#F0EBE3] font-black text-sm">{o.amount}</span>
                </div>
                <span className={`inline-flex items-center text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider w-fit ${statusColor[o.status]}`}>
                  {statusLabel[o.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

