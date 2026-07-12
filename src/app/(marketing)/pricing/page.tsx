"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, Sparkles, Building2, Zap } from "lucide-react";
import { PRICING_PLANS } from "@/lib/stripe/client";
import BorderGlow from "@/components/ui/BorderGlow";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (planId === "free") {
      router.push("/signup");
      return;
    }
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.success && data.redirect) {
        window.location.href = data.redirect;
      } else if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently handle
    } finally {
      setLoading(null);
    }
  };

  const planIcons: Record<string, React.ReactNode> = {
    free: <Zap size={20} />,
    pro: <Sparkles size={20} />,
    enterprise: <Building2 size={20} />,
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <nav className="border-b border-[#EADFCF] bg-[#FAF7F2] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4B1218] flex items-center justify-center text-[#FAF7F2] font-serif font-bold text-lg shadow-sm">
              C
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-[#1E1C1B]">
              Clear<span className="text-[#8B2635]">Audit</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#5C5651] hover:text-[#4B1218] px-4 py-2 rounded-lg transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#F4EBE1] border border-[#EADFCF] text-[#4B1218] px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles size={12} className="animate-pulse" />
            <span>Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-[#1E1C1B] leading-tight">
            Choose the plan that scales{" "}
            with you
          </h1>
          <p className="mt-5 text-[#5C5651] max-w-xl mx-auto leading-relaxed">
            Start free with up to 5 contracts. Upgrade to unlock unlimited
            audits, AI chat, and advanced scheduling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PRICING_PLANS.map((plan) => {
            const isPopular = "popular" in plan && plan.popular;
            return (
              <BorderGlow
                key={plan.id}
                className={`relative ${isPopular ? "md:-translate-y-2" : ""}`}
                glowColor="20 70 40"
                backgroundColor="#FFFDF9"
                borderRadius={24}
                glowRadius={30}
                glowIntensity={isPopular ? 0.8 : 0.4}
                animated={isPopular}
                colors={['#4B1218', '#8B2635', '#C4956A']}
              >
                <div
                  className={`bg-[#FFFDF9] border rounded-3xl p-8 transition-all duration-300 ${
                    isPopular
                      ? "border-[#4B1218] shadow-lg"
                      : "border-[#EADFCF] shadow-sm hover:shadow-md"
                  }`}
                >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#4B1218] text-[#FAF7F2] text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isPopular
                        ? "bg-[#4B1218] text-[#FAF7F2]"
                        : "bg-[#FAF7F2] text-[#4B1218] border border-[#EADFCF]"
                    }`}
                  >
                    {planIcons[plan.id] || <Zap size={20} />}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1E1C1B]">
                      {plan.name}
                    </h3>
                    <p className="text-[11px] text-[#A69C90] font-medium">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#FAF7F2] pt-6 mb-6">
                  <div className="flex items-baseline gap-1">
                    {plan.price !== null ? (
                      <>
                        <span className="text-4xl font-serif font-black text-[#1E1C1B]">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-[#A69C90] font-medium">
                          /mo
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-serif font-black text-[#1E1C1B]">
                        Custom
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#5C5651]">
                      <Check
                        size={16}
                        className={`mt-0.5 shrink-0 ${
                          isPopular ? "text-[#4B1218]" : "text-[#A69C90]"
                        }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-3.5 rounded-xl transition-all cursor-pointer ${
                    isPopular
                      ? "bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] shadow-md hover:shadow-lg"
                      : plan.id === "enterprise"
                        ? "bg-[#1E1C1B] hover:bg-[#2a2827] text-[#FAF7F2]"
                        : "bg-[#FAF7F2] hover:bg-[#F4EBE1] text-[#4B1218] border border-[#EADFCF]"
                  } disabled:opacity-60`}
                >
                  {loading === plan.id ? (
                    <span className="animate-pulse">Redirecting...</span>
                  ) : plan.id === "free" ? (
                    "Get Started Free"
                  ) : plan.id === "enterprise" ? (
                    "Contact Sales"
                  ) : (
                    <>
                      Upgrade to {plan.name}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
                </div>
              </BorderGlow>
            );
          })}
        </div>

        <div className="mt-20 text-center space-y-4">
          <p className="text-sm text-[#A69C90]">
            All plans include SSL encryption, daily backups, and 99.9% uptime.
          </p>
          <p className="text-xs text-[#A69C90]">
            Need a custom plan?{" "}
            <a
              href="mailto:sales@clearaudit.app"
              className="text-[#4B1218] font-semibold hover:underline"
            >
              Contact our sales team
            </a>
          </p>
        </div>
      </div>

      <footer className="border-t border-[#EADFCF] py-8 text-center text-xs text-[#A69C90]">
        <p>&copy; 2026 ClearAudit. All rights reserved.</p>
      </footer>
    </div>
  );
}
