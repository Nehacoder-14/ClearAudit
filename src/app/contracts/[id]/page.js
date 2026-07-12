"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
// Galaxy removed to restore previous state
import { useRouter } from 'next/navigation';
import { 
  FileText, ArrowLeft, Save, Trash2, Calendar, AlertTriangle, 
  CheckCircle, RefreshCw, Layers, Edit3, ShieldCheck, HelpCircle 
} from 'lucide-react';

export default function ContractDetail({ params }) {
  // Await params per Next.js 15+ route regulations
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();

  // Page States
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Form Editor States (for metadata overlays)
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Vendor Agreement');
  const [status, setStatus] = useState('needs_review');
  const [partiesStr, setPartiesStr] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentFrequency, setPaymentFrequency] = useState('Monthly');

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/contracts/${id}`);
      const data = await res.json();
      if (data.success) {
        const c = data.contract;
        setContract(c);
        
        // Feed form values
        setTitle(c.title);
        setType(c.type);
        setStatus(c.status);
        setPartiesStr(c.parties.join(', '));
        setEffectiveDate(c.effectiveDate || '');
        setExpirationDate(c.expirationDate || '');
        setRenewalDate(c.renewalDate || '');
        setAutoRenewal(c.autoRenewal || false);
        setNoticePeriodDays(c.noticePeriodDays || 30);
        setPaymentTerms(c.paymentTerms || 'Net 30');
        setPaymentAmount(c.paymentAmount || 0);
        setPaymentFrequency(c.paymentFrequency || 'Monthly');
      } else {
        setError(data.error || 'Failed to load contract details.');
      }
    } catch (e) {
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractDetails();
  }, [id]);

  // Form submit update API
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    const payload = {
      title,
      type,
      status,
      parties: partiesStr.split(',').map(s => s.trim()).filter(s => s.length > 0),
      effectiveDate: effectiveDate || null,
      expirationDate: expirationDate || null,
      renewalDate: renewalDate || null,
      autoRenewal: !!autoRenewal,
      noticePeriodDays: parseInt(noticePeriodDays) || 30,
      paymentTerms,
      paymentAmount: parseFloat(paymentAmount) || 0,
      paymentFrequency
    };

    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setContract(data.contract);
        setTimeout(() => setSaveSuccess(false), 2000);
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Network error updating parameters.');
    } finally {
      setSaving(false);
    }
  };

  // Delete SOW API
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contract? This action will also wipe all scheduled alarms.")) return;
    
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch (err) {
      setError('Network error deleting contract.');
    }
  };

  // Highlight key clauses in HTML text
  const getHighlightedHtml = () => {
    if (!contract || !contract.content) return '';
    
    let text = contract.content;
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, '<br />'); // preserve spacing

    // Key categories we want to highlight in the viewer
    const clausesToHighlight = [
      { key: 'payment', list: [paymentTerms, contract.keyClauses?.payment] },
      { key: 'renewal', list: [contract.keyClauses?.renewal] },
      { key: 'termination', list: [contract.keyClauses?.termination] }
    ];

    clausesToHighlight.forEach(({ key, list }) => {
      list.forEach(clauseText => {
        if (!clauseText || clauseText.length < 15) return;
        
        // Clean double spacing
        const cleanClause = clauseText.replace(/\s+/g, ' ').trim();
        const escapedClause = cleanClause.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const searchWords = escapedClause.split('\\s+');

        try {
          // Highlight match case-insensitive
          const regex = new RegExp(searchWords.join('\\s+'), 'gi');
          escaped = escaped.replace(regex, (match) => {
            const colorClass = 
              key === 'payment' ? 'bg-amber-200 border-amber-400' :
              key === 'renewal' ? 'bg-indigo-100 border-indigo-300' :
              'bg-rose-100 border-rose-300';
            return `<mark class="${colorClass} border-b px-1 py-0.5 rounded cursor-help font-semibold text-[#1E1C1B] relative group" title="${key.toUpperCase()} CLAUSE">${match}</mark>`;
          });
        } catch(e) {}
      });
    });

    return escaped;
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-4 text-[#4B1218]">
          <RefreshCw className="animate-spin" size={32} />
          <p className="font-serif text-lg">Loading Contract Details...</p>
        </div>
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-screen bg-[#FAF7F2] p-6 text-center space-y-4">
        <AlertTriangle size={48} className="text-rose-800" />
        <h2 className="font-serif text-xl font-bold">Error Accessing Document</h2>
        <p className="text-sm text-[#5C5651] max-w-sm">{error}</p>
        <Link href="/dashboard" className="text-[#4B1218] font-bold text-sm hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex-grow min-h-screen bg-[#F5EFE4] text-[#1E1C1B]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.75),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(139,38,53,0.08),_transparent_32%)]" />
      <div className="relative">
        {/* Dynamic Nav Header */}
      <nav className="relative border-b border-[#ECDCC7] bg-[#FEF8F1] sticky top-0 z-50 shadow-[0_18px_45px_rgba(39,35,30,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-[#F4EBE1]/80 rounded-lg text-[#5C5651] hover:text-[#4B1218] transition-all cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-6 w-px bg-[#EADFCF]" />
            <div className="min-w-0">
              <h1 className="font-serif text-base font-bold text-[#1E1C1B] truncate">{contract.title}</h1>
              <p className="text-[10px] text-[#A69C90] uppercase tracking-wider font-bold">
                {contract.type} • Status: {contract.status.replace('_', ' ')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 border border-[#F0D2DC] bg-[#FFF5F6] text-rose-700 text-xs font-semibold px-4.5 py-2.5 rounded-2xl shadow-sm hover:border-rose-400 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Delete SOW</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Grid workspace split: Viewer (left) & Form Editor (right) */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: In-App document paper viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center text-xs text-[#5C5651]">
            <span className="font-semibold flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>Contract Source Audit Sandbox</span>
            </span>
            <span className="text-[10px] text-[#A69C90] uppercase font-bold flex items-center gap-1">
              <HelpCircle size={12} />
              <span>Highlights: Yellow (Payment), Purple (Renewal)</span>
            </span>
          </div>

          <div className="relative overflow-hidden rounded-[40px] bg-[#FFFDF9] border border-[#EADCC9] p-8 md:p-12 shadow-[0_24px_90px_rgba(38,32,26,0.12)] min-h-[520px] max-h-[80vh] overflow-y-auto font-serif text-sm leading-relaxed text-[#1E1C1B] tracking-wide select-text">
            <div className="pointer-events-none absolute -left-10 top-10 h-36 w-36 rounded-full bg-[#FFE5E9]/80 blur-3xl" />
            <div className="pointer-events-none absolute right-10 top-24 h-28 w-28 rounded-full bg-[#EDE8FF]/70 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_45%)]" />
            <div className="absolute top-8 right-8 border-2 border-emerald-700/30 bg-white/90 text-emerald-800/60 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded rotate-12 select-none shadow-sm backdrop-blur-sm">
              ClearAudit Verified
            </div>

            {/* Document Render block */}
            <div 
              className="prose max-w-none text-justify whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: getHighlightedHtml() }}
            />

          </div>
        </div>

        {/* RIGHT COLUMN: Metadata parameters editor form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-[40px] bg-[#FFFDF9] border border-[#EADCC9] p-6 shadow-[0_22px_60px_rgba(43,37,31,0.08)] space-y-6">
            <div className="pointer-events-none absolute -right-10 top-8 h-36 w-36 rounded-full bg-[#F4EBE1]/80 blur-3xl" />
            <div className="pointer-events-none absolute left-8 bottom-8 h-24 w-24 rounded-full bg-[#F7D2E2]/70 blur-3xl" />
            
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1E1C1B] flex items-center gap-2">
                <Edit3 size={16} className="text-[#4B1218]" />
                <span>Extracted Terms Manager</span>
              </h2>
              <p className="text-[11px] text-[#A69C90] mt-0.5">Modify fields to update alerts, timelines, and search indexes instantly.</p>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
              
              {/* Title */}
              <div>
                <label className="block text-[#5C5651] font-bold mb-1.5 uppercase tracking-wide text-[10px]">Agreement Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EADFCF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4B1218] text-[#1E1C1B] font-medium"
                />
              </div>

              {/* Grid 2-col */}
              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-[#5C5651] font-bold mb-1.5 uppercase tracking-wide text-[10px]">Category</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full px-2.5 py-2 border border-[#EADFCF] rounded-lg focus:outline-none bg-white font-medium"
                  >
                    <option value="Vendor Agreement">Vendor Agreement</option>
                    <option value="Client Service Contract">Client Service Contract</option>
                    <option value="SaaS Subscription">SaaS Subscription</option>
                    <option value="Freelance/Consulting">Freelance/Consulting</option>
                    <option value="Lease/Facilities">Lease/Facilities</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[#5C5651] font-bold mb-1.5 uppercase tracking-wide text-[10px]">Audit Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-2.5 py-2 border border-[#EADFCF] rounded-lg focus:outline-none bg-white font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="needs_review">Needs Review</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              {/* Parties */}
              <div>
                <label className="block text-[#5C5651] font-bold mb-1.5 uppercase tracking-wide text-[10px]">Parties Involved (Comma Separated)</label>
                <input
                  type="text"
                  required
                  value={partiesStr}
                  onChange={e => setPartiesStr(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EADFCF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4B1218] text-[#1E1C1B] font-medium"
                />
              </div>

              {/* Dates grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Effective */}
                <div className="space-y-2">
                  <label className="block text-[#5C5651] font-bold mb-1.5 uppercase tracking-wide text-[9px]">Effective Date</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={e => setEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EADFCF] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4B1218]/40 text-[#1E1C1B] bg-[#FFFDF9]"
                  />
                </div>

                {/* Expiration */}
                <div className="space-y-2">
                  <label className="block text-[#5C5651] font-bold mb-1.5 uppercase tracking-wide text-[9px]">Expiration Date</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={e => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EADFCF] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8B2635]/30 text-rose-800 bg-[#FFF6F5]"
                  />
                </div>

                {/* Renewal Notice Date */}
                <div className="space-y-2">
                  <label className="block text-[#5C5651] font-bold mb-1.5 uppercase tracking-wide text-[9px]">Renewal Deadline</label>
                  <input
                    type="date"
                    value={renewalDate}
                    onChange={e => setRenewalDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EADFCF] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4B1218]/40 text-[#4B1218] bg-[#FFFDF9]"
                  />
                </div>
              </div>

              {/* Auto renewal & Notice */}
              <div className="grid grid-cols-2 gap-4 items-center border border-[#FAF7F2] p-3.5 rounded-xl bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoRenewal"
                    checked={autoRenewal}
                    onChange={e => setAutoRenewal(e.target.checked)}
                    className="w-4.5 h-4.5 text-[#4B1218] border-[#EADFCF] rounded focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="autoRenewal" className="font-bold text-[#5C5651] cursor-pointer">Auto Renewal</label>
                </div>
                <div>
                  <label className="block text-[#A69C90] font-bold mb-0.5 text-[9px]">Notice Window (Days)</label>
                  <input
                    type="number"
                    value={noticePeriodDays}
                    onChange={e => setNoticePeriodDays(e.target.value)}
                    className="w-full px-2.5 py-1 border border-[#EADFCF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4B1218]"
                  />
                </div>
              </div>

              {/* Financial block */}
              <div className="grid grid-cols-3 gap-3">
                {/* Term */}
                <div>
                  <label className="block text-[#5C5651] font-bold mb-1.5 uppercase tracking-wide text-[9px]">Payment Window</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#EADFCF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4B1218]"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[#5C5651] font-bold mb-1.5 uppercase tracking-wide text-[9px]">Payment Value ($)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#EADFCF] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4B1218] font-bold text-[#4B1218]"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-[#5C5651] font-bold mb-1.5 uppercase tracking-wide text-[9px]">Frequency</label>
                  <select
                    value={paymentFrequency}
                    onChange={e => setPaymentFrequency(e.target.value)}
                    className="w-full px-2 py-1.5 border border-[#EADFCF] rounded-lg focus:outline-none bg-white font-medium"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annually">Annually</option>
                    <option value="Milestone-based">Milestone-based</option>
                    <option value="One-time">One-time</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-[#FAF7F2]">
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {saveSuccess && (
                    <>
                      <CheckCircle size={14} />
                      <span>Updates Saved</span>
                    </>
                  )}
                </span>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#4B1218] hover:bg-[#8B2635] text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-[0_16px_30px_rgba(75,18,24,0.24)] transition-all duration-200 cursor-pointer"
                >
                  {saving ? (
                    <RefreshCw className="animate-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Save Audit Terms</span>
                </button>
              </div>

            </form>

            {/* Error notifications */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-[10px] flex items-center gap-2 shadow-sm">
                <AlertTriangle size={14} className="shrink-0 text-rose-700" />
                <span>{error}</span>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  </div>
  );
}
