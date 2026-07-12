"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  FileText, Calendar, Bell, MessageSquare, Plus, Search, 
  AlertTriangle, DollarSign, Clock, CheckCircle, ArrowRight, 
  Send, RefreshCw, Sparkles, LogOut, ChevronRight
} from 'lucide-react';
import RotatingText from '@/components/ui/RotatingText';
import PixelCard from '@/components/ui/PixelCard';
import ASCIIText from '@/components/ui/ASCIIText';
// Galaxy and ImageTrail removed to restore previous state

export default function Dashboard() {
  // Data States
  const [contracts, setContracts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assistant'); // assistant | notifications

  // AI Chat States
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I am ClearAudit AI. Ask me anything about your contract portfolio, e.g., "Which contracts expire this month?" or "What are my total payment obligations?"' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractsRes, alertsRes] = await Promise.all([
        fetch('/api/contracts'),
        fetch('/api/alerts')
      ]);
      const contractsData = await contractsRes.json();
      const alertsData = await alertsRes.json();

      if (contractsData.success) setContracts(contractsData.contracts);
      if (alertsData.success) setAlerts(alertsData.alerts);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle chat submission
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || sendingChat) return;

    const userMsg = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setSendingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages.slice(1), userMsg], // skip welcome msg
          sessionId: 'default'
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Helper stats relative to simulated present: 2026-07-10
  const today = new Date('2026-07-10');
  
  const activeContracts = contracts.filter(c => c.status === 'active');
  const needsReview = contracts.filter(c => c.status === 'needs_review');
  
  const totalValue = activeContracts.reduce((sum, c) => {
    if (c.paymentFrequency === 'Monthly') return sum + (c.paymentAmount * 12);
    return sum + c.paymentAmount;
  }, 0);

  // Expiring in 30/60/90 days
  const expiringSoon = contracts.filter(c => {
    if (!c.expirationDate || c.status === 'expired') return false;
    const exp = new Date(c.expirationDate);
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90;
  });

  // Timeline events: sort alerts and upcoming expirations chronologically
  const timelineEvents = alerts
    .filter(a => a.status === 'upcoming' || a.status === 'overdue')
    .slice(0, 5);

  // Filtered contract list search
  const filteredContracts = contracts.filter(c => {
    const term = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(term) || 
           c.parties.some(p => p.toLowerCase().includes(term)) ||
           c.type.toLowerCase().includes(term);
  });

  // Resolve Alert Toggle
  const handleResolveAlert = async (alert) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...alert,
          status: 'sent', // Marks it as completed/dispatched
          sentAt: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchData(); // reload
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-4 text-[#4B1218]">
          <RefreshCw className="animate-spin" size={32} />
          <p className="font-serif text-lg">Retrieving Contract Portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-[#FAF7F2]">
      {/* background visuals removed to restore original layout */}

      {/* Top Navigation */}
      <nav className="border-b border-[#EADFCF] bg-[#FAF7F2] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4B1218] flex items-center justify-center text-[#FAF7F2] font-serif font-bold text-lg shadow-sm">
                C
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#1E1C1B]">
                Clear<span className="text-[#8B2635]">Audit</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-[#4B1218] bg-[#F4EBE1] rounded-lg">
                Dashboard
              </Link>
              <Link href="/contracts" className="px-4 py-2 text-sm font-medium text-[#5C5651] hover:text-[#4B1218] hover:bg-[#F4EBE1]/50 rounded-lg transition-colors">
                Contracts
              </Link>
              <Link href="/upload" className="px-4 py-2 text-sm font-medium text-[#5C5651] hover:text-[#4B1218] hover:bg-[#F4EBE1]/50 rounded-lg transition-colors">
                Upload & Process
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-[#F4EBE1] border border-[#EADFCF] text-[#4B1218] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Clock size={12} />
              <span>System Time: July 10, 2026</span>
            </div>
            <Link 
              href="/upload"
              className="flex items-center gap-1.5 bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Audit Document</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Layout Container */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Metrics and Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Dashboard Title & Quick Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 relative overflow-hidden rounded-[28px] border border-[#EADFCF]/60 bg-white/80 p-4 shadow-sm monitoring-glow">
              <div className="pointer-events-none absolute -left-10 top-2 h-20 w-20 rounded-full bg-[#F4EBE1]/90 blur-3xl" />
              <div className="pointer-events-none absolute right-4 top-1/2 h-24 w-24 rounded-full bg-[#E8D0FF]/80 blur-3xl" />
              <div className="flex items-center gap-2 text-3xl font-serif font-black text-[#1E1C1B] relative z-10">
                <span>Monitoring</span>
                <RotatingText
                  texts={['Vendor Agreements', 'SaaS Licenses', 'Facilities Leases', 'Consulting SOWs']}
                  mainClassName="px-3 bg-[#4B1218] text-[#FAF7F2] font-sans font-semibold rounded-lg text-lg py-1 justify-center inline-flex"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.015}
                  transition={{ type: "spring", damping: 25, stiffness: 350 }}
                  rotationInterval={2500}
                />
              </div>
              <p className="text-sm text-[#5C5651] font-sans relative z-10">Dynamic portfolio indexing, visual timeline tracking, and context-grounded AI search.</p>
            </div>
            <button 
              onClick={fetchData}
              className="relative overflow-hidden rounded-lg border border-[#EADFCF] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#4B1218] transition-all hover:text-[#8B2635] hover:shadow-lg"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-opacity duration-700 monitoring-shimmer" />
              <span className="relative inline-flex items-center gap-1.5">
                <RefreshCw size={12} />
                Reload Data
              </span>
            </button>
          </div>

          {/* Metrics Grid using PixelCard */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            <div className="h-[140px] relative rounded-2xl overflow-hidden border border-[#EADFCF]">
              <PixelCard variant="default">
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 select-none">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2]/90 text-[#4B1218] flex items-center justify-center shadow-xs">
                    <FileText size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#5C5651] uppercase font-bold tracking-wider block">Agreements</span>
                    <span className="text-2xl font-serif font-black text-[#1E1C1B] block">{contracts.length}</span>
                    <span className="text-[9px] text-[#A69C90] block">{activeContracts.length} Active</span>
                  </div>
                </div>
              </PixelCard>
            </div>

            <div className="h-[140px] relative rounded-2xl overflow-hidden border border-[#EADFCF]">
              <PixelCard variant="pink">
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 select-none">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2]/90 text-rose-800 flex items-center justify-center shadow-xs">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] text-rose-950 uppercase font-bold tracking-wider block">Expiring Soon</span>
                    <span className="text-2xl font-serif font-black text-rose-800 block">{expiringSoon.length}</span>
                    <span className="text-[9px] text-rose-900 block">Next 90 Days</span>
                  </div>
                </div>
              </PixelCard>
            </div>

            <div className="h-[140px] relative rounded-2xl overflow-hidden border border-[#EADFCF]">
              <PixelCard variant="yellow">
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 select-none">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2]/90 text-[#8B2635] flex items-center justify-center shadow-xs">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] text-yellow-950 uppercase font-bold tracking-wider block">Portfolio Value</span>
                    <span className="text-xl font-serif font-black text-[#1E1C1B] block">${(totalValue / 1000).toFixed(0)}k</span>
                    <span className="text-[9px] text-yellow-900 block">Annualized SOWs</span>
                  </div>
                </div>
              </PixelCard>
            </div>

            <div className="h-[140px] relative rounded-2xl overflow-hidden border border-[#EADFCF]">
              <PixelCard variant="default">
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 select-none">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7F2]/90 text-amber-800 flex items-center justify-center shadow-xs">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#5C5651] uppercase font-bold tracking-wider block">Needs Review</span>
                    <span className="text-2xl font-serif font-black text-amber-800 block">{needsReview.length}</span>
                    <span className="text-[9px] text-[#A69C90] block">Clause anomalies</span>
                  </div>
                </div>
              </PixelCard>
            </div>

            {/* AI Status ASCII canvas core */}
            <div className="h-[140px] relative rounded-2xl overflow-hidden border border-zinc-800 bg-black col-span-2 md:col-span-1">
              <ASCIIText text="AUDIT" asciiFontSize={5} textFontSize={150} enableWaves={true} textColor="#61dca3" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 select-none pointer-events-none text-left">
                <div className="w-8 h-8 rounded-lg bg-zinc-900/90 text-[#61dca3] flex items-center justify-center shadow-xs">
                  <Sparkles size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-[#61dca3] uppercase font-bold tracking-wider block">AI Core Status</span>
                  <span className="text-xs font-serif font-black text-white block">Active</span>
                </div>
              </div>
            </div>

          </div>

          {/* image trail removed to restore previous layout */}

          {/* Section: Audit Command Center */}
          <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-[32px] p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#FAF7F2] pb-4 mb-4">
              <Calendar className="text-[#4B1218]" size={18} />
              <h2 className="text-lg font-serif font-bold text-[#1E1C1B]">Audit Command Center</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#e3dcf7] via-[#d7cff3] to-[#f5effc] p-6 shadow-sm card-animate card-float transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/40 blur-3xl" />
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#4F3F9D]">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#4F3F9D] animate-pulse" />
                  Customization
                </span>
                <h3 className="mt-5 text-xl font-serif font-black text-[#1E1C1B]">Template Builder</h3>
                <p className="mt-3 text-sm text-[#5C4C72]">Standardize contract cards, clauses, and review flows with one-click templates.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#4F3F9D] shadow-sm">Design</span>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#4F3F9D] shadow-sm">Brand</span>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#ffe3e7] via-[#ffecee] to-[#fff5f8] p-6 shadow-sm card-animate card-float transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-white/40 blur-3xl" />
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#9E3453]">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#9E3453] animate-pulse" />
                  Scheduling
                </span>
                <h3 className="mt-5 text-xl font-serif font-black text-[#1E1C1B]">Next Review Window</h3>
                <p className="mt-3 text-sm text-[#6F515E]">{expiringSoon.length} agreements are due in the next 90 days. Keep reminders in sync.</p>
                <div className="mt-5 flex items-center gap-2 text-[11px] text-[#9E3453]">
                  <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">{expiringSoon.length} Due</span>
                  <span className="rounded-full bg-[#9E3453]/10 px-3 py-1">90 Days</span>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#dff5eb] via-[#e8faf0] to-[#f6fdf7] p-6 shadow-sm card-animate card-float transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute right-6 bottom-6 h-24 w-24 rounded-full bg-white/40 blur-3xl" />
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2A6B34]">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#2A6B34] animate-pulse" />
                  Wallet
                </span>
                <h3 className="mt-5 text-xl font-serif font-black text-[#1E1C1B]">Portfolio Value</h3>
                <p className="mt-3 text-sm text-[#4F6B4F]">${(totalValue / 1000).toFixed(0)}k annualized value across active agreements.</p>
                <div className="mt-5 flex items-center gap-2 text-[11px] text-[#2A6B34]">
                  <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">Annualized</span>
                  <span className="rounded-full bg-[#2A6B34]/10 px-3 py-1">Stable</span>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#fffbe2] via-[#fff2cc] to-[#fff9e6] p-6 shadow-sm card-animate card-float transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -right-10 bottom-6 h-32 w-32 rounded-full bg-white/40 blur-3xl" />
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B5E1D]">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#8B5E1D] animate-pulse" />
                  Inbox
                </span>
                <h3 className="mt-5 text-xl font-serif font-black text-[#1E1C1B]">Alert Center</h3>
                <p className="mt-3 text-sm text-[#6B5B3B]">{alerts.length} active notifications across contract renewals and obligations.</p>
                <div className="mt-5 flex items-center gap-2 text-[11px] text-[#8B5E1D]">
                  <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">Live</span>
                  <span className="rounded-full bg-[#8B5E1D]/10 px-3 py-1">Sync</span>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#ffe4c9] via-[#ffe7d7] to-[#fff3eb] p-6 shadow-sm card-animate card-float transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute left-6 bottom-6 h-24 w-24 rounded-full bg-white/40 blur-3xl" />
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#A75C2A]">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#A75C2A] animate-pulse" />
                  Actions
                </span>
                <h3 className="mt-5 text-xl font-serif font-black text-[#1E1C1B]">Send Review Tasks</h3>
                <p className="mt-3 text-sm text-[#6B553D]">Assign contract reviews, approvals, and reminders to your team with a fast handoff workflow.</p>
                <div className="mt-5 flex items-center gap-2 text-[11px] text-[#A75C2A]">
                  <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">Workflow</span>
                  <span className="rounded-full bg-[#A75C2A]/10 px-3 py-1">Assign</span>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#d6edff] via-[#e7f4ff] to-[#f3fbff] p-6 shadow-sm card-animate card-float transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-white/40 blur-3xl" />
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2B5D85]">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#2B5D85] animate-pulse" />
                  Reminders
                </span>
                <h3 className="mt-5 text-xl font-serif font-black text-[#1E1C1B]">Renewal Alerts</h3>
                <p className="mt-3 text-sm text-[#4C667F]">Never miss a renewal date again — keep your contract lifecycle notifications visible.</p>
                <div className="mt-5 flex items-center gap-2 text-[11px] text-[#2B5D85]">
                  <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">Alert</span>
                  <span className="rounded-full bg-[#2B5D85]/10 px-3 py-1">Watch</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-5">
              <Link href="/contracts" className="inline-flex items-center gap-2 rounded-full border border-[#EADFCF] bg-[#FAF7F2] px-4 py-2 text-xs font-semibold text-[#4B1218] hover:bg-[#F4EBE1] transition-colors">
                View Full Contract Portfolio
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Catalog Registry snippet with PixelCards */}
          <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF7F2] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="text-[#4B1218]" size={18} />
                <h2 className="text-lg font-serif font-bold text-[#1E1C1B]">Audit Registry Registry</h2>
              </div>
              <div className="relative max-w-xs w-full">
                <Search size={14} className="absolute left-3 top-2.5 text-[#A69C90]" />
                <input
                  type="text"
                  placeholder="Filter by title..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-1.5 bg-[#FAF7F2] border border-[#EADFCF] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#4B1218] text-[#1E1C1B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContracts.slice(0, 4).map((contract) => (
                <div key={contract.id} className="group relative h-[120px] overflow-hidden rounded-3xl border border-[#EADFCF]/50 bg-gradient-to-br from-[#fffef7] via-[#f8f2e9] to-[#fffdf9] shadow-sm card-animate-alt transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-6 top-3 h-20 w-20 rounded-full bg-[#F4EBE1]/80 blur-3xl" />
                  <div className="absolute left-4 bottom-3 h-12 w-12 rounded-full bg-[#FAF7F2]/90 blur-2xl" />
                  <PixelCard variant="default" className="h-full rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 text-left select-none">
                      <div className="min-w-0">
                        <Link href={`/contracts/${contract.id}`} className="text-xs font-semibold text-[#1E1C1B] hover:text-[#8B2635] block truncate hover:underline">
                          {contract.title}
                        </Link>
                        <span className="text-[9px] text-[#A69C90] mt-0.5 block truncate">
                          {contract.parties.join(' • ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <div>
                          <span className="font-bold text-[#4B1218] block">${contract.paymentAmount.toLocaleString()}</span>
                          <span className="text-[8px] text-[#A69C90] block">{contract.paymentFrequency}</span>
                        </div>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                          contract.status === 'active' ? 'bg-emerald-50 text-emerald-800' :
                          contract.status === 'needs_review' ? 'bg-amber-50 text-amber-800' :
                          'bg-rose-50 text-rose-800'
                        }`}>
                          {contract.status === 'needs_review' ? 'Review' : contract.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </PixelCard>
                </div>
              ))}
              {filteredContracts.length === 0 && (
                <p className="text-sm text-[#A69C90] py-6 text-center col-span-2">No contracts matching search criteria found.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Chat and Alert History (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-[calc(100vh-10rem)] sticky top-24 min-h-[500px]">
          
          <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-3xl flex flex-col h-full overflow-hidden shadow-sm">
            
            {/* Sidebar Tabs */}
            <div className="flex border-b border-[#EADFCF] bg-[#FAF7F2]/50">
              <button
                onClick={() => setActiveTab('assistant')}
                className={`flex-1 py-3.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'assistant' 
                    ? 'border-[#4B1218] text-[#4B1218] bg-[#FFFDF9]' 
                    : 'border-transparent text-[#A69C90] hover:text-[#4B1218]'
                }`}
              >
                <MessageSquare size={14} />
                <span>AI Assistant</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 py-3.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'notifications' 
                    ? 'border-[#4B1218] text-[#4B1218] bg-[#FFFDF9]' 
                    : 'border-transparent text-[#A69C90] hover:text-[#4B1218]'
                }`}
              >
                <Bell size={14} />
                <span>Alert Log</span>
              </button>
            </div>

            {/* TAB CONTENT: AI Assistant Chat */}
            {activeTab === 'assistant' && (
              <div className="flex flex-col flex-grow overflow-hidden bg-white shadow-[0_18px_70px_rgba(75,18,24,0.04)] rounded-[28px] chat-panel">
                
                {/* Chat Message Window */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 relative">
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'items-start'}`}
                    >
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed transition-all duration-300 ${
                        msg.role === 'user' 
                          ? 'bg-[#4B1218] text-[#FAF7F2] rounded-tr-none shadow-[0_18px_45px_rgba(75,18,24,0.22)] animate-chat-pop user-bubble' 
                          : 'bg-[#FAF7F2] text-[#1E1C1B] rounded-tl-none border border-[#EADFCF] shadow-[0_12px_36px_rgba(228,207,187,0.42)] animate-chat-pop assistant-bubble'
                      }`}>
                        {msg.content.split('\n').map((line, k) => (
                          <p key={k} className={k > 0 ? "mt-2" : ""}>{line}</p>
                        ))}
                      </div>
                      <span className="text-[9px] text-[#A69C90] mt-1 uppercase font-bold tracking-wider">
                        {msg.role === 'user' ? 'YOU' : 'CLEARAUDIT AI'}
                      </span>
                    </div>
                  ))}
                  {sendingChat && (
                    <div className="flex flex-col items-start max-w-[85%]">
                      <div className="p-3 bg-[#FAF7F2] border border-[#EADFCF] rounded-2xl rounded-tl-none text-xs text-[#A69C90] flex items-center gap-2 chat-loader">
                        <span className="w-2 h-2 rounded-full bg-[#4B1218]" />
                        <span className="w-2 h-2 rounded-full bg-[#4B1218]" />
                        <span className="w-2 h-2 rounded-full bg-[#4B1218]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChat} className="p-3 border-t border-[#EADFCF] bg-[#FAF7F2]/50 flex gap-2 items-center">
                  <input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder="Ask about your contracts..."
                    disabled={sendingChat}
                    className="flex-grow px-3 py-2 bg-white border border-[#EADFCF] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#4B1218]/40 text-[#1E1C1B] shadow-sm transition-shadow duration-200"
                  />
                  <button
                    type="submit"
                    disabled={!userInput.trim() || sendingChat}
                    className="relative overflow-hidden p-2.5 bg-[#4B1218] text-[#FAF7F2] rounded-xl transition-all duration-300 hover:bg-[#8B2635] hover:shadow-[0_16px_38px_rgba(75,18,24,0.24)] disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-700 hover:opacity-100" />
                    <span className="relative inline-flex items-center"><Send size={14} /></span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: Notification Log */}
            {activeTab === 'notifications' && (
              <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-[#FFFDF9]">
                <div className="text-[10px] font-semibold text-[#A69C90] uppercase tracking-wider mb-2 border-b border-[#FAF7F2] pb-1">
                  Sent / Logged Alerts
                </div>
                {alerts.filter(a => a.status === 'sent').map((alert) => (
                  <div key={alert.id} className="p-3.5 rounded-xl border border-[#FAF7F2] bg-white shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-semibold text-[#1E1C1B]">{alert.contractTitle}</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">dispatched</span>
                    </div>
                    <p className="text-xs text-[#5C5651] mt-1.5">{alert.message}</p>
                    <span className="text-[9px] text-[#A69C90] mt-2 block font-medium">Log Date: {alert.dueDate} • Email Delivery Simulated</span>
                  </div>
                ))}

                {alerts.filter(a => a.status === 'sent').length === 0 && (
                  <p className="text-xs text-[#A69C90] text-center py-8">No alerts have been dispatched yet. The dispatcher checks upcoming notice windows every 10 seconds.</p>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
