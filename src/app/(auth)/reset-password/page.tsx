'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isResetMode = !!(token && email);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send reset email.');
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch {
      setError('Something went wrong.');
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
        <h1 className="text-2xl font-serif font-bold text-[#1E1C1B] mb-2">
          {isResetMode ? 'Password Reset' : 'Email Sent'}
        </h1>
        <p className="text-sm text-[#5C5651] mb-6">
          {isResetMode
            ? 'Your password has been reset. You can now sign in with your new password.'
            : 'If an account exists with that email, a reset link has been sent.'}
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl shadow-sm p-8">
      <h1 className="text-2xl font-serif font-bold text-[#1E1C1B] text-center mb-1">
        {isResetMode ? 'Set new password' : 'Reset your password'}
      </h1>
      <p className="text-sm text-[#5C5651] text-center mb-6">
        {isResetMode ? 'Enter your new password below' : 'Enter your email and we\'ll send a reset link'}
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {isResetMode ? (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5C5651] uppercase tracking-wider mb-1.5">
              New Password
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
          <div>
            <label className="block text-xs font-semibold text-[#5C5651] uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#EADFCF] bg-[#FAF7F2] text-[#1E1C1B] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1218]/30 focus:border-[#4B1218] transition-all"
              placeholder="Confirm your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5C5651] uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#EADFCF] bg-[#FAF7F2] text-[#1E1C1B] text-sm focus:outline-none focus:ring-2 focus:ring-[#4B1218]/30 focus:border-[#4B1218] transition-all"
              placeholder="you@company.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[#5C5651]">
        <Link href="/login" className="text-[#4B1218] font-semibold hover:text-[#8B2635]">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl shadow-sm p-8 text-center">
        <div className="w-8 h-8 border-2 border-[#4B1218] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
