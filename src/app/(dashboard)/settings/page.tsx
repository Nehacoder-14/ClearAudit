"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import {
  User,
  CreditCard,
  LogOut,
  Shield,
  ExternalLink,
  ArrowRight,
  Settings as SettingsIcon,
} from "lucide-react";

export default function SettingsPage() {
  const [portalLoading, setPortalLoading] = useState(false);

  const handleBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-serif font-black text-[#1E1C1B]">
          Settings
        </h1>
        <p className="text-sm text-[#5C5651] mt-1">
          Manage your account, subscription, and preferences.
        </p>
      </div>

      <section className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-[#FAF7F2] pb-4">
          <User size={18} className="text-[#4B1218]" />
          <h2 className="font-serif text-lg font-bold text-[#1E1C1B]">
            Profile
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#A69C90] block mb-1.5">
              Name
            </label>
            <div className="px-4 py-2.5 bg-[#FAF7F2] border border-[#EADFCF] rounded-xl text-sm text-[#1E1C1B]">
              ClearAudit User
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#A69C90] block mb-1.5">
              Email
            </label>
            <div className="px-4 py-2.5 bg-[#FAF7F2] border border-[#EADFCF] rounded-xl text-sm text-[#1E1C1B]">
              user@clearaudit.app
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#A69C90] block mb-1.5">
              Current Plan
            </label>
            <div className="px-4 py-2.5 bg-[#FAF7F2] border border-[#EADFCF] rounded-xl text-sm font-semibold text-[#4B1218] flex items-center gap-2">
              <Shield size={14} />
              Free Tier
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#A69C90] block mb-1.5">
              Contract Limit
            </label>
            <div className="px-4 py-2.5 bg-[#FAF7F2] border border-[#EADFCF] rounded-xl text-sm text-[#1E1C1B]">
              5 contracts
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-[#FAF7F2] pb-4">
          <CreditCard size={18} className="text-[#4B1218]" />
          <h2 className="font-serif text-lg font-bold text-[#1E1C1B]">
            Subscription & Billing
          </h2>
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#EADFCF] rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1E1C1B]">
                Free Plan
              </p>
              <p className="text-xs text-[#5C5651] mt-0.5">
                5 contracts &middot; Basic AI extraction &middot; Email alerts
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#4B1218]/10 text-[#4B1218]">
              Active
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/pricing"
            className="flex items-center justify-center gap-2 bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            <ArrowRight size={14} />
            Upgrade Plan
          </a>
          <button
            onClick={handleBillingPortal}
            disabled={portalLoading}
            className="flex items-center justify-center gap-2 px-5 py-3 border border-[#EADFCF] text-sm font-semibold text-[#5C5651] rounded-xl hover:bg-[#FAF7F2] transition-colors disabled:opacity-50"
          >
            <ExternalLink size={14} />
            {portalLoading ? "Loading..." : "Manage Billing"}
          </button>
        </div>
      </section>

      <section className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 border-b border-[#FAF7F2] pb-4">
          <SettingsIcon size={18} className="text-[#4B1218]" />
          <h2 className="font-serif text-lg font-bold text-[#1E1C1B]">
            Account
          </h2>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <LogOut size={16} className="text-rose-800" />
            <h3 className="text-sm font-semibold text-rose-900">
              Sign Out
            </h3>
          </div>
          <p className="text-xs text-rose-700">
            You will be signed out of your ClearAudit session and redirected to
            the homepage.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg hover:bg-rose-50 transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}
