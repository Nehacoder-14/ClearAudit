"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  X,
  Send,
} from "lucide-react";

interface Alert {
  id: string;
  contractId: string;
  contractTitle: string;
  message: string;
  type: string;
  status: "upcoming" | "sent" | "overdue";
  dueDate: string;
  sentAt?: string;
}

const STATUS_CONFIG = {
  upcoming: {
    label: "Upcoming",
    color: "bg-amber-50 text-amber-800 border border-amber-200",
    icon: Clock,
  },
  sent: {
    label: "Sent",
    color: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    icon: CheckCircle,
  },
  overdue: {
    label: "Overdue",
    color: "bg-rose-50 text-rose-800 border border-rose-200",
    icon: AlertTriangle,
  },
} as const;

function SkeletonCard() {
  return (
    <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl p-5 animate-pulse">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-2/3 bg-[#EADFCF] rounded" />
          <div className="h-3 w-1/3 bg-[#EADFCF] rounded" />
        </div>
        <div className="h-5 w-16 bg-[#EADFCF] rounded-full" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full bg-[#FAF7F2] rounded" />
        <div className="h-3 w-4/5 bg-[#FAF7F2] rounded" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-7 w-20 bg-[#EADFCF] rounded-lg" />
        <div className="h-7 w-20 bg-[#EADFCF] rounded-lg" />
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "sent" | "overdue">("all");

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.success) setAlerts(data.alerts);
    } catch (e) {
      console.error("Failed to fetch alerts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (alert: Alert) => {
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...alert,
          status: "sent",
          sentAt: new Date().toISOString(),
        }),
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismiss = async (alert: Alert) => {
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...alert, status: "sent" }),
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = alerts.filter(
    (a) => filter === "all" || a.status === filter
  );

  const counts = {
    all: alerts.length,
    upcoming: alerts.filter((a) => a.status === "upcoming").length,
    sent: alerts.filter((a) => a.status === "sent").length,
    overdue: alerts.filter((a) => a.status === "overdue").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-[#1E1C1B]">
            Alerts
          </h1>
          <p className="text-sm text-[#5C5651] mt-1">
            Monitor contract deadlines, renewals, and obligation reminders.
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-4 py-2 border border-[#EADFCF] bg-[#FFFDF9] text-xs font-semibold text-[#4B1218] rounded-lg hover:bg-[#F4EBE1] transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter size={14} className="text-[#A69C90] shrink-0" />
        {(["all", "upcoming", "sent", "overdue"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
              filter === s
                ? "bg-[#4B1218] text-[#FAF7F2]"
                : "bg-[#FAF7F2] text-[#5C5651] border border-[#EADFCF] hover:border-[#4B1218] hover:text-[#4B1218]"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1 text-[10px] opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.map((alert) => {
              const cfg = STATUS_CONFIG[alert.status];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={alert.id}
                  className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#1E1C1B] truncate">
                        {alert.contractTitle}
                      </h3>
                      <p className="text-xs text-[#A69C90] mt-0.5 font-medium uppercase tracking-wider">
                        {alert.type.replace(/_/g, " ")} &middot; Due{" "}
                        {alert.dueDate}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${cfg.color}`}
                    >
                      <StatusIcon size={12} />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5651] mt-3 leading-relaxed">
                    {alert.message}
                  </p>
                  {alert.sentAt && (
                    <p className="text-[10px] text-[#A69C90] mt-2">
                      Dispatched: {new Date(alert.sentAt).toLocaleString()}
                    </p>
                  )}
                  {alert.status !== "sent" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleResolve(alert)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] text-[11px] font-semibold rounded-lg transition-colors"
                      >
                        <Send size={12} />
                        Mark Sent
                      </button>
                      <button
                        onClick={() => handleDismiss(alert)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#EADFCF] text-[#5C5651] text-[11px] font-semibold rounded-lg hover:bg-[#FAF7F2] transition-colors"
                      >
                        <X size={12} />
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Bell size={32} className="mx-auto text-[#EADFCF] mb-3" />
            <p className="text-sm font-semibold text-[#1E1C1B]">
              No alerts found
            </p>
            <p className="text-xs text-[#A69C90] mt-1">
              {filter === "all"
                ? "All caught up. No alerts in your portfolio."
                : `No ${filter} alerts at this time.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
