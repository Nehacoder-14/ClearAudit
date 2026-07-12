"use client";

import React from 'react';
import Link from 'next/link';
import GridMotion from '@/components/ui/GridMotion';
import CardSwap, { Card } from '@/components/ui/CardSwap';
import AnimatedContent from '@/components/ui/AnimatedContent';
import GooeyNav from '@/components/ui/GooeyNav';
import Waves from '@/components/ui/Waves';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const gridItems = [
    "Contract Intelligence", "AI Parsing", "Legal Audit", "Revenue Rescue",
    "Net 30/90 Terms", "Auto-Renewal", "Key Obligations", "PDF Parser",
    "Vector Search", "Risk Highlights", "Alerting Engine", "RAG Agent",
    "Notice Windows", "Vanguard SOW", "AWS Addendum", "Avita Design",
    "Lease Tracking", "Compliance Check", "Frictionless UI", "Ramp Polish",
    "Cosine Similarity", "Dense Embeddings", "Database Sync", "Term Overrides",
    "SMTP Simulator", "Deadline Cal", "ClearAudit AI", "Contract Gravity"
  ];

  return (
    <main className="relative flex-grow flex flex-col min-h-screen overflow-x-hidden bg-[#FAF7F2]">
      
      {/* Editorial Grid Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
        <GridMotion items={gridItems} gradientColor="#4B1218" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#EADFCF] bg-[#FAF7F2]/80 blur-backdrop">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#4B1218] flex items-center justify-center text-[#FAF7F2] font-serif font-bold text-xl shadow-md transition-transform group-hover:scale-105">
              C
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1E1C1B]">
              Clear<span className="text-[#8B2635]">Audit</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center">
            <GooeyNav
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Contracts', href: '/contracts' },
              ]}
              particleCount={12}
              particleDistances={[70, 10]}
              animationTime={500}
              colors={[1, 2, 3, 1, 2]}
            />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[#4B1218] font-medium hover:text-[#8B2635] px-4 py-2 rounded-lg transition-colors hidden sm:block"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-medium px-5 py-2.5 rounded-lg shadow-sm transition-all hover:shadow-md"
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-grow max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-16 lg:py-24">
        
        {/* Animated Waves Background */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          <Waves
            color1="rgba(75, 18, 24, 0.08)"
            color2="rgba(139, 38, 53, 0.05)"
            speed={0.02}
            amplitude={50}
            frequency={0.012}
          />
        </div>
        
        {/* Left Side: Editorial Typography */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left">
          <AnimatedContent direction="vertical" distance={50} delay={0.1} duration={0.8}>
            <div className="inline-flex items-center gap-2 bg-[#F4EBE1] border border-[#EADFCF] text-[#4B1218] px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles size={12} className="animate-pulse" />
              <span>AI-Powered Contract Intelligence</span>
            </div>
          </AnimatedContent>

          <AnimatedContent direction="vertical" distance={50} delay={0.2} duration={0.9}>
            <h1 className="text-5xl md:text-6xl font-serif font-black text-[#1E1C1B] leading-[1.1] tracking-tight">
              Stop losing revenue to buried terms.
            </h1>
          </AnimatedContent>

          <AnimatedContent direction="vertical" distance={50} delay={0.3} duration={1.0}>
            <p className="mt-6 text-lg text-[#5C5651] max-w-2xl leading-relaxed font-sans">
              Contracts hold obligations, payment dates, and auto-renewals. Law firms, agencies, and consultants lose thousands in revenue when these details remain hidden in PDFs. ClearAudit extracts, schedules, and provides semantic search over your entire agreement history.
            </p>
          </AnimatedContent>

          <AnimatedContent direction="vertical" distance={50} delay={0.4} duration={1.1}>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-3 bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
              >
                Start Free
                <ArrowRight size={18} />
              </Link>
              
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 bg-[#FFFDF9] hover:bg-[#F4EBE1] text-[#4B1218] border border-[#EADFCF] font-semibold px-8 py-4 rounded-xl shadow-sm hover:shadow transition-all text-base"
              >
                View Pricing
              </Link>
            </div>
          </AnimatedContent>
        </div>

        {/* Right Side: GSAP CardSwap Presentation */}
        <div className="lg:col-span-5 relative w-full h-[450px] flex items-center justify-center lg:justify-end overflow-visible">
          <AnimatedContent direction="horizontal" distance={100} delay={0.3} duration={1.2}>
            <div className="w-[340px] h-[340px] md:w-[380px] md:h-[380px] relative">
              <CardSwap
                width="100%"
                height="100%"
                cardDistance={25}
                verticalDistance={30}
                delay={4000}
                pauseOnHover={true}
                skewAmount={3}
                easing="power"
              >
                <Card className="bg-[#FFFDF9] border border-[#EADFCF] p-6 shadow-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">SaaS Subscription</span>
                      <span className="text-xs text-[#8B2635] font-semibold">Active</span>
                    </div>
                    <h3 className="text-lg font-bold font-serif text-[#1E1C1B] mt-4">Salesforce Enterprise SOW</h3>
                    <p className="text-xs text-[#5C5651] mt-2 line-clamp-3">License agreement for sales tracking tools. Invoiced annually at flat billing rates.</p>
                  </div>
                  <div className="border-t border-[#F4EBE1] pt-4 mt-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#A69C90] uppercase block">VALUE</span>
                      <span className="font-semibold text-[#4B1218]">$124,000 / Year</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#A69C90] uppercase block">NOTICE WINDOW</span>
                      <span className="font-semibold text-rose-700">60 Days Prior</span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#FFFDF9] border border-[#EADFCF] p-6 shadow-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">Freelance Agreement</span>
                      <span className="text-xs text-rose-800 font-semibold">Expires in 2 days</span>
                    </div>
                    <h3 className="text-lg font-bold font-serif text-[#1E1C1B] mt-4">John Doe Senior Architect SOW</h3>
                    <p className="text-xs text-[#5C5651] mt-2 line-clamp-3">Providing technical migration oversight and software infrastructure engineering.</p>
                  </div>
                  <div className="border-t border-[#F4EBE1] pt-4 mt-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#A69C90] uppercase block">VALUE</span>
                      <span className="font-semibold text-[#4B1218]">$36,000</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#A69C90] uppercase block">AUTO-RENEW</span>
                      <span className="font-semibold text-[#5C5651]">Disabled</span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#FFFDF9] border border-[#EADFCF] p-6 shadow-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">Lease/Facilities</span>
                      <span className="text-xs text-emerald-800 font-semibold">Monitored</span>
                    </div>
                    <h3 className="text-lg font-bold font-serif text-[#1E1C1B] mt-4">Suite 400 Office Lease</h3>
                    <p className="text-xs text-[#5C5651] mt-2 line-clamp-3">Commercial lease for corporate headquarters. Expiration schedules mapped monthly.</p>
                  </div>
                  <div className="border-t border-[#F4EBE1] pt-4 mt-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#A69C90] uppercase block">VALUE</span>
                      <span className="font-semibold text-[#4B1218]">$15,000 / Month</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#A69C90] uppercase block">RENEGOTIATION</span>
                      <span className="font-semibold text-rose-700">90 Days Prior</span>
                    </div>
                  </div>
                </Card>
              </CardSwap>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#EADFCF] py-8 text-center text-xs text-[#A69C90] bg-[#FAF7F2]">
        <p>© 2026 ClearAudit. Designed for high-end contract RAG intelligence. Fully local sandbox active.</p>
      </footer>
    </main>
  );
}
