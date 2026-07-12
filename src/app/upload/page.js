"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  UploadCloud, FileText, CheckCircle, RefreshCw, X, AlertTriangle, 
  ArrowRight, ShieldAlert, BadgeCheck, FileCode, Check 
} from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  
  // File upload state
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  
  // Processing state
  const [processing, setProcessing] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null); // 'queued' | 'processing' | 'completed' | 'failed'
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  
  // Extracted Result Summary
  const [summary, setSummary] = useState(null);

  const fileInputRef = useRef(null);
  const pollingInterval = useRef(null);

  // Clean polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (selectedFile) => {
    setError(null);
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx') {
      setError("Unsupported file format. Please upload a PDF or DOCX file.");
      return;
    }
    setFile(selectedFile);
  };

  const handleUploadSubmit = async () => {
    if (!file || processing) return;

    setProcessing(true);
    setProgress(5);
    setStatusText('Uploading document to server...');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setJobId(data.jobId);
        setContractId(data.contractId);
        startPolling(data.jobId);
      } else {
        setError(data.error || 'Upload failed');
        setProcessing(false);
      }
    } catch (err) {
      setError('Network connection error during upload.');
      setProcessing(false);
    }
  };

  // Poll status endpoint
  const startPolling = (targetJobId) => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    pollingInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/upload/status?jobId=${targetJobId}`);
        const data = await res.json();

        if (data.success) {
          const job = data.job;
          setJobStatus(job.status);
          setProgress(job.progress);
          
          // Set human-readable messages for the status stages
          if (job.statusText === 'extracting_text') setStatusText('Extracting text content from document...');
          else if (job.statusText === 'ai_extraction') setStatusText('Analyzing with Anthropic Claude AI (Extracting obligations & clauses)...');
          else if (job.statusText === 'generating_embeddings') setStatusText('Generating local dense vector embeddings for semantic search...');
          else if (job.statusText === 'saving_to_db') setStatusText('Persisting metadata and indexing clauses...');
          else if (job.status === 'completed') {
            setStatusText('Verification complete. Terms indexed!');
            clearInterval(pollingInterval.current);
            fetchSummaryDetails(data.job.id);
          } else if (job.status === 'failed') {
            setError(job.error || 'Metadata extraction failed.');
            setProcessing(false);
            clearInterval(pollingInterval.current);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);
  };

  // Fetch summary after job completes
  const fetchSummaryDetails = async (jobId) => {
    try {
      // Find the contract in our catalog using the generated ID
      const res = await fetch(`/api/contracts/${contractId}`);
      const data = await res.json();
      if (data.success) {
        setSummary(data.contract);
        
        // Burst success confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4B1218', '#8B2635', '#EADFCF', '#C2B29F']
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJobId(null);
    setContractId(null);
    setJobStatus(null);
    setProgress(0);
    setStatusText('');
    setSummary(null);
    setError(null);
    setProcessing(false);
    if (pollingInterval.current) clearInterval(pollingInterval.current);
  };

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-[#FAF7F2]">
      
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
              <Link href="/contracts" className="px-4 py-2 text-sm font-medium text-[#5C5651] hover:text-[#4B1218] hover:bg-[#F4EBE1]/50 rounded-lg transition-colors">
                Contracts
              </Link>
              <Link href="/upload" className="px-4 py-2 text-sm font-semibold text-[#4B1218] bg-[#F4EBE1] rounded-lg">
                Upload & Process
              </Link>
            </div>
          </div>
          
          <div className="text-xs text-[#A69C90] font-semibold uppercase tracking-wider">
            Document Analyzer Sandbox
          </div>
        </div>
      </nav>

      {/* Main Area */}
      <div className="flex-grow max-w-3xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-black text-[#1E1C1B]">Audit Agreement Document</h1>
          <p className="text-sm text-[#5C5651] mt-1.5 max-w-lg mx-auto">
            Upload any legal contract, Master Services SOW, SaaS subscription schedule, or facilities lease (PDF or DOCX format) to extract clauses and schedule alert monitors.
          </p>
        </div>

        {/* STEP 1: Upload Drag Target */}
        {!file && !processing && !summary && (
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-[#4B1218] bg-[#F4EBE1]/30 shadow-inner' 
                : 'border-[#EADFCF] hover:border-[#4B1218] bg-[#FFFDF9] hover:shadow-md'
            }`}
          >
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleChange}
              accept=".pdf,.docx"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#4B1218] flex items-center justify-center shadow-xs">
              <UploadCloud size={28} />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1E1C1B] mt-5">Drag & drop your agreement file</h3>
            <p className="text-xs text-[#A69C90] mt-1.5">Only supports PDF and DOCX files up to 20MB</p>
            <button className="mt-6 border border-[#EADFCF] hover:border-[#4B1218] text-[#4B1218] font-semibold text-xs px-5 py-2.5 rounded-lg bg-white shadow-xs transition-colors">
              Choose File
            </button>
          </div>
        )}

        {/* File Selected Card */}
        {file && !processing && !summary && (
          <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-[#FAF7F2] pb-4">
              <div className="w-12 h-12 rounded-xl bg-[#F4EBE1] text-[#4B1218] flex items-center justify-center">
                <FileText size={22} />
              </div>
              <div className="min-w-0 flex-grow">
                <h4 className="font-semibold text-sm text-[#1E1C1B] truncate">{file.name}</h4>
                <p className="text-[10px] text-[#A69C90] mt-0.5 uppercase tracking-wider font-bold">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.name.split('.').pop().toUpperCase()} FILE
                </p>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="p-2 hover:bg-rose-50 text-rose-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <button 
                onClick={() => setFile(null)}
                className="px-5 py-3 border border-[#EADFCF] text-xs font-semibold text-[#5C5651] rounded-xl hover:bg-[#FAF7F2]/50 transition-colors cursor-pointer"
              >
                Choose Another File
              </button>
              <button 
                onClick={handleUploadSubmit}
                className="flex items-center gap-2 bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Process Document</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Processing state indicator */}
        {processing && (
          <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-3xl p-8 shadow-sm space-y-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-[#FAF7F2] text-[#4B1218] flex items-center justify-center animate-spin relative mb-4">
                <RefreshCw size={24} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1E1C1B]">Contract Intelligence Mining</h3>
              <p className="text-xs text-[#5C5651] mt-1">Please do not refresh or close this browser window.</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-[#FAF7F2] border border-[#EADFCF] h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#4B1218] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-[#A69C90]">
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Success Extraction Preview */}
        {summary && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-sm">
                <BadgeCheck size={20} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-emerald-900">Analysis SOW Successfully Extracted</h3>
                <p className="text-xs text-emerald-700 mt-0.5">Metadata mapped, search vectors registered, and deadline reminders scheduled.</p>
              </div>
            </div>

            {/* Structured Card Summary */}
            <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-3xl p-6 shadow-md space-y-6">
              <div className="flex justify-between items-start gap-4 border-b border-[#FAF7F2] pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FAF7F2] text-[#4B1218] border border-[#EADFCF]">
                    {summary.type}
                  </span>
                  <h2 className="text-xl font-serif font-black text-[#1E1C1B] mt-2">{summary.title}</h2>
                  <p className="text-xs text-[#5C5651] mt-1 font-medium">Parties: {summary.parties.join(' & ')}</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded font-bold ${
                  summary.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                  summary.status === 'needs_review' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {summary.status === 'needs_review' ? 'Needs Review' : summary.status.toUpperCase()}
                </span>
              </div>

              {/* Extraction Parameters Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs border-b border-[#FAF7F2] pb-6">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#A69C90] block">Effective Date</span>
                  <span className="font-semibold text-[#1E1C1B] block mt-0.5">{summary.effectiveDate || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#A69C90] block">Expiration Date</span>
                  <span className="font-semibold text-rose-800 block mt-0.5">{summary.expirationDate || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#A69C90] block">Renewal Date</span>
                  <span className="font-semibold text-[#4B1218] block mt-0.5">{summary.renewalDate || 'Manual renewal required'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#A69C90] block">Auto-Renewal</span>
                  <span className="font-semibold text-[#1E1C1B] block mt-0.5">{summary.autoRenewal ? `Yes (${summary.noticePeriodDays} days notice)` : 'No'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#A69C90] block">Payment Terms</span>
                  <span className="font-semibold text-[#1E1C1B] block mt-0.5">{summary.paymentTerms || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#A69C90] block">Value</span>
                  <span className="font-semibold text-[#4B1218] block mt-0.5">${summary.paymentAmount.toLocaleString()} ({summary.paymentFrequency})</span>
                </div>
              </div>

              {/* Action options */}
              <div className="flex gap-4 items-center justify-between pt-2">
                <button 
                  onClick={resetForm}
                  className="px-5 py-3 border border-[#EADFCF] text-xs font-semibold text-[#5C5651] rounded-xl hover:bg-[#FAF7F2]/50 transition-colors cursor-pointer"
                >
                  Upload Another Document
                </button>
                <div className="flex gap-3 items-center">
                  <Link 
                    href="/dashboard"
                    className="px-5 py-3 text-xs font-semibold text-[#4B1218] hover:text-[#8B2635] transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <Link 
                    href={`/contracts/${summary.id}`}
                    className="flex items-center gap-1.5 bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
                  >
                    <span>Open in Document Viewer</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mt-6 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex gap-3 items-center">
            <ShieldAlert size={18} className="shrink-0 text-rose-700" />
            <div className="flex-grow">
              <span className="font-bold">Execution Error: </span>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="p-1 hover:bg-rose-100 rounded cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
