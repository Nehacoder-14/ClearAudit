'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl shadow-sm p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#1E1C1B] mb-2">Check your email</h1>
        <p className="text-sm text-[#5C5651] mb-6">
          We sent a verification link to <strong>{email}</strong>. Click the link to activate your account.
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl shadow-sm p-8">
      <h1 className="text-2xl font-serif font-bold text-[#1E1C1B] text-center mb-1">
        Create your account
      </h1>
      <p className="text-sm text-[#5C5651] text-center mb-6">
        Start auditing your contracts with AI
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#5C5651] uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[#EADFCF] bg-[#FAF7F2] text-[#1E1C1B] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1218]/30 focus:border-[#4B1218] transition-all"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#5C5651] uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[#EADFCF] bg-[#FAF7F2] text-[#1E1C1B] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1218]/30 focus:border-[#4B1218] transition-all"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#5C5651] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-3 rounded-xl border border-[#EADFCF] bg-[#FAF7F2] text-[#1E1C1B] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1218]/30 focus:border-[#4B1218] transition-all"
            placeholder="At least 8 characters"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#5C5651]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#4B1218] font-semibold hover:text-[#8B2635]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
