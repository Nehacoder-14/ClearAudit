"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, Sparkles, ArrowRight, RefreshCw } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  type: string;
  status: string;
  parties: string[];
  paymentAmount: number;
  paymentFrequency: string;
  expirationDate: string;
  similarityScore: number;
  highlights: string[];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/contracts?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (data.success) setResults(data.contracts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-serif font-black text-[#1E1C1B]">
          Semantic Search
        </h1>
        <p className="text-sm text-[#5C5651] max-w-lg mx-auto">
          Ask natural language questions about your contracts. The AI vector
          engine will find the most relevant agreements and clauses.
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        <div className="relative">
          <SearchIcon
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A69C90]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g. "contracts with Net 90 payment terms" or "which agreements auto-renew"...'
            className="w-full pl-14 pr-32 py-4 bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl text-sm text-[#1E1C1B] placeholder-[#A69C90] focus:outline-none focus:ring-2 focus:ring-[#4B1218]/30 focus:border-[#4B1218] shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            <Sparkles size={14} />
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl p-6 animate-pulse"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/2 bg-[#EADFCF] rounded" />
                    <div className="h-3 w-1/3 bg-[#EADFCF] rounded" />
                  </div>
                  <div className="h-6 w-20 bg-[#EADFCF] rounded-full" />
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="h-3 w-full bg-[#FAF7F2] rounded" />
                  <div className="h-3 w-3/4 bg-[#FAF7F2] rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && searched && results.length > 0 && (
          <>
            <p className="text-xs text-[#A69C90] font-semibold uppercase tracking-wider">
              {results.length} result{results.length !== 1 ? "s" : ""} found for
              &ldquo;{query}&rdquo;
            </p>
            {results.map((r) => (
              <div
                key={r.id}
                className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FAF7F2] text-[#4B1218] border border-[#EADFCF]">
                        {r.type}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          r.status === "active"
                            ? "bg-emerald-50 text-emerald-800"
                            : r.status === "needs_review"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-rose-50 text-rose-800"
                        }`}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#1E1C1B] hover:text-[#8B2635] transition-colors">
                      <Link href={`/contracts/${r.id}`}>{r.title}</Link>
                    </h3>
                    <p className="text-[11px] text-[#A69C90] mt-0.5">
                      {r.parties.join(" & ")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      <Sparkles size={10} />
                      {Math.round(r.similarityScore * 100)}% Match
                    </div>
                  </div>
                </div>

                {r.highlights && r.highlights.length > 0 && (
                  <div className="mt-4 p-3 bg-[#FAF7F2] border border-[#EADFCF] rounded-xl text-xs text-[#5C5651] italic leading-relaxed space-y-1">
                    {r.highlights.map((h, i) => (
                      <p key={i} className="line-clamp-2">
                        &ldquo;...{h}...&rdquo;
                      </p>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-[#FAF7F2] pt-3">
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-[8px] text-[#A69C90] uppercase font-bold block">
                        Value
                      </span>
                      <span className="font-bold text-[#4B1218]">
                        ${r.paymentAmount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-[#A69C90] uppercase font-bold block">
                        Expires
                      </span>
                      <span className="font-semibold text-[#1E1C1B]">
                        {r.expirationDate || "N/A"}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/contracts/${r.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-[#4B1218] hover:text-[#8B2635]"
                  >
                    View
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16">
            <SearchIcon size={32} className="mx-auto text-[#EADFCF] mb-3" />
            <p className="text-sm font-semibold text-[#1E1C1B]">
              No results found
            </p>
            <p className="text-xs text-[#A69C90] mt-1">
              Try rephrasing your query or use broader search terms.
            </p>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-20">
            <Sparkles
              size={32}
              className="mx-auto text-[#4B1218]/30 mb-3"
            />
            <p className="text-sm font-semibold text-[#1E1C1B]">
              Start a semantic search
            </p>
            <p className="text-xs text-[#A69C90] mt-1 max-w-xs mx-auto">
              Ask questions like &ldquo;which contracts have termination
              clauses?&rdquo; or &ldquo;find agreements with Uber&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
