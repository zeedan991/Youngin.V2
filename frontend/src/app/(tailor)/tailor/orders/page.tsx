"use client";

import { useEffect, useState } from "react";
import { getTailorOrders } from "@/app/(tailor)/tailor/actions";
import {
  Scissors,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
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

type Filter = "all" | "pending" | "in_progress" | "completed" | "cancelled";

export default function TailorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTailorOrders().then((o) => {
      setOrders(o);
      setLoading(false);
    });
  }, []);

  const filtered = orders.filter((o) => {
    const matchesFilter = filter === "all" || o.status === filter;
    const matchesSearch =
      !search ||
      o.client_name.toLowerCase().includes(search.toLowerCase()) ||
      o.garment.toLowerCase().includes(search.toLowerCase());
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
    <div className="p-6 lg:p-10 space-y-6 min-h-screen bg-slate-50">
      <div>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">
          Tailor Portal
        </p>
        <h1
          className="text-3xl font-black text-slate-900"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Order Pipeline
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage every client request from quote to delivery.
        </p>
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
                  ? "bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/30 shadow-sm"
                  : "text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client or garment..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xl shadow-slate-200/50">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50">
          {["Client", "Garment", "Deadline", "Amount", "Status"].map((h) => (
            <span
              key={h}
              className="text-[9px] font-black text-slate-500 uppercase tracking-widest"
            >
              {h}
            </span>
          ))}
        </div>
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No orders found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((o) => (
              <div
                key={o.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-[#4F46E5] font-black text-xs">
                    {o.client_name[0]}
                  </div>
                  <span className="text-slate-900 font-bold text-sm truncate">
                    {o.client_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Scissors className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-600 text-sm truncate">
                    {o.garment}
                  </span>
                </div>
                <span className="text-slate-500 text-xs font-bold">
                  {o.deadline}
                </span>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-500" />
                  <span className="text-slate-900 font-black text-sm">
                    {o.amount}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider w-fit shadow-sm ${statusColor[o.status]}`}
                >
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
