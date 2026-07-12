"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Search, ArrowRight, DollarSign, Calendar, AlertTriangle, 
  ChevronRight, Sparkles, Filter, RefreshCw, Layers 
} from 'lucide-react';
import PixelCard from '@/components/ui/PixelCard';
// Galaxy and ImageTrail removed to restore previous state

export default function ContractsCatalog() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchContracts = async (query = '') => {
    try {
      setLoading(true);
      const url = query.trim() !== '' 
        ? `/api/contracts?q=${encodeURIComponent(query)}`
        : '/api/contracts';
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setContracts(data.contracts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);
    fetchContracts(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchContracts('');
  };

  const contractTypes = ['All', 'Vendor Agreement', 'Client Service Contract', 'SaaS Subscription', 'Freelance/Consulting', 'Lease/Facilities'];
  const contractStatuses = ['All', 'active', 'needs_review', 'expired'];
  const statusVariantMap = {
    active: 'blue',
    needs_review: 'yellow',
    expired: 'pink',
  };
  const paletteByStatus = {
    active: 'from-[#dff5eb] via-[#e8faf0] to-[#f6fdf7]',
    needs_review: 'from-[#fff5e7] via-[#fff1dc] to-[#fff9f2]',
    expired: 'from-[#ffe4f0] via-[#ffe9f8] to-[#fff6fc]',
  };

  const filteredContracts = contracts.filter(c => {
    const typeMatch = selectedType === 'All' || c.type === selectedType;
    const statusMatch = selectedStatus === 'All' || c.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-[#FAF7F2]">
      {/* background visuals removed to restore original layout */}
      {/* Navigation */}
      <nav className="border-b border-[#EADFCF] bg-[#FAF7F2] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4B1218] flex items-center justify-center text-[#FAF7F2] font-serif font-bold text-lg">
                C
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#1E1C1B]">
                Clear<span className="text-[#8B2635]">Audit</span>
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-[#5C5651] hover:text-[#4B1218] hover:bg-[#F4EBE1]/50 rounded-lg transition-colors">
                Dashboard
              </Link>
              <Link href="/contracts" className="px-4 py-2 text-sm font-semibold text-[#4B1218] bg-[#F4EBE1] rounded-lg">
                Contracts
              </Link>
              <Link href="/upload" className="px-4 py-2 text-sm font-medium text-[#5C5651] hover:text-[#4B1218] hover:bg-[#F4EBE1]/50 rounded-lg transition-colors">
                Upload & Process
              </Link>
            </div>
          </div>
          
          <div className="text-xs text-[#A69C90] font-semibold uppercase tracking-wider">
            Semantic Vector Index Active
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-serif font-black text-[#1E1C1B]">Agreement Index</h1>
          <p className="text-sm text-[#5C5651] mt-1 font-sans">Query across contract text, metadata, and obligations using natural language.</p>
        </div>

        {/* Semantic Search Hub */}
        <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-3xl p-6 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="relative flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-4 text-[#A69C90]" size={18} />
              <input
                type="text"
                placeholder='Ask a natural question, e.g., "contracts with Net 90 payment terms" or "which subscriptions auto renew"...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#FAF7F2] border border-[#EADFCF] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#4B1218] text-[#1E1C1B] placeholder-[#A69C90]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-3.5 text-xs text-[#5C5651] hover:text-[#4B1218] px-2 py-1 bg-[#F4EBE1] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="flex items-center justify-center gap-2 bg-[#4B1218] hover:bg-[#8B2635] text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer shrink-0"
            >
              <Sparkles size={16} />
              <span>{isSearching ? 'Searching...' : 'Semantic Query'}</span>
            </button>
          </form>

          {/* Quick Filter Controls */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-[#FAF7F2] text-xs">
            <div className="flex items-center gap-1.5 text-[#5C5651] font-semibold">
              <Filter size={14} />
              <span>Filters:</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Type Select */}
              <div className="flex items-center gap-1">
                <span className="text-[#A69C90]">Category:</span>
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="bg-white border border-[#EADFCF] text-[#5C5651] px-2 py-1 rounded focus:outline-none font-medium cursor-pointer"
                >
                  {contractTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Status Select */}
              <div className="flex items-center gap-1">
                <span className="text-[#A69C90]">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="bg-white border border-[#EADFCF] text-[#5C5651] px-2 py-1 rounded focus:outline-none font-medium cursor-pointer"
                >
                  {contractStatuses.map(s => (
                    <option key={s} value={s}>
                      {s === 'All' ? 'All' : s === 'needs_review' ? 'Needs Review' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* small image trail removed to restore previous layout */}

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#4B1218] gap-2">
            <RefreshCw className="animate-spin" size={24} />
            <p className="text-xs font-semibold">Querying indexes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {filteredContracts.map((contract) => (
              <div 
                key={contract.id} 
                className={`group contract-card h-[310px] relative rounded-3xl overflow-hidden border border-[#EADFCF] shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br ${paletteByStatus[contract.status] || 'from-[#fffef7] via-[#fcf5e8] to-[#fffdf9]'}`}
              >
                <div className="absolute -left-12 top-6 h-36 w-36 rounded-full bg-[#F4EBE1]/80 blur-3xl animate-contract-float" />
                <div className="absolute right-6 bottom-8 h-24 w-24 rounded-full bg-[#F7D2E2]/70 blur-3xl animate-contract-wave" />
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_48%)] pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.32),transparent_50%)] pointer-events-none" />
                <PixelCard variant={statusVariantMap[contract.status] || 'default'} className="w-full h-full">
                  <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 text-left select-none">
                    
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FAF7F2] text-[#4B1218] border border-[#EADFCF] shrink-0">
                          {contract.type}
                        </span>
                        <div className="flex items-center gap-2">
                        {contract.similarityScore !== undefined && (
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-[0_10px_24px_rgba(34,197,94,0.12)]">
                            <Sparkles size={10} />
                            <span>{Math.round(contract.similarityScore * 100)}% Match</span>
                          </span>
                        )}
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold shrink-0 transition-all duration-200 ${
                          contract.status === 'active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-[0_8px_20px_rgba(16,185,129,0.1)]' :
                          contract.status === 'needs_review' ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-[0_8px_20px_rgba(245,158,11,0.1)]' :
                          'bg-rose-50 text-rose-800 border border-rose-200 shadow-[0_8px_20px_rgba(244,63,94,0.1)]'
                        }`}>
                          {contract.status === 'needs_review' ? 'Needs Review' : contract.status.toUpperCase()}
                        </span>
                      </div>
                      </div>

                      <h3 className="text-lg font-bold font-serif text-[#1E1C1B] mt-3 hover:text-[#8B2635] hover:underline transition-colors duration-200">
                        <Link href={`/contracts/${contract.id}`}>
                          {contract.title}
                        </Link>
                      </h3>
                      <p className="text-[10px] text-[#5C5651] mt-1 font-medium truncate">Parties: {contract.parties.join(', ')}</p>

                      {/* Similarity Highlights snippet */}
                      {contract.highlights && contract.highlights.length > 0 && (
                        <div className="mt-4 p-3 bg-[#FAF7F2] border border-[#EADFCF] rounded-xl text-[11px] text-[#5C5651] italic leading-relaxed">
                          {contract.highlights.map((snippet, sIdx) => (
                            <div key={sIdx} className="line-clamp-2 first:mb-1.5 last:mb-0">
                              "...{snippet}..."
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Details panel */}
                    <div className="border-t border-[#FAF7F2] pt-4 mt-5 flex justify-between items-center text-xs">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-[8px] text-[#A69C90] uppercase block font-bold">Value</span>
                          <span className="font-bold text-[#4B1218] mt-0.5 block">${contract.paymentAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-[#A69C90] uppercase block font-bold">Expires</span>
                          <span className="font-semibold text-[#1E1C1B] mt-0.5 block">{contract.expirationDate || 'N/A'}</span>
                        </div>
                      </div>

                      <Link 
                        href={`/contracts/${contract.id}`}
                        className="flex items-center gap-1 text-xs text-[#4B1218] hover:text-[#8B2635] font-bold"
                      >
                        <span>View Clauses</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>

                  </div>
                </PixelCard>
              </div>
            ))}

            {filteredContracts.length === 0 && (
              <div className="col-span-full bg-[#FFFDF9] border border-[#EADFCF] rounded-3xl p-12 text-center text-[#A69C90] space-y-3">
                <Layers size={32} className="mx-auto text-[#EADFCF]" />
                <h3 className="font-serif text-lg font-bold text-[#1E1C1B]">No agreements matched current filters</h3>
                <p className="text-xs max-w-sm mx-auto">Try clearing your semantic search query or selecting a different category/status filter.</p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
