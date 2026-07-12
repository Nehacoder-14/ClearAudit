'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setMessage('Your email has been verified. You can now sign in.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [searchParams]);

  return (
    <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl shadow-sm p-8 text-center">
      {status === 'loading' && (
        <>
          <div className="w-14 h-14 rounded-full bg-[#F4EBE1] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-6 h-6 border-2 border-[#4B1218] border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1E1C1B]">Verifying...</h1>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1E1C1B] mb-2">Email Verified</h1>
          <p className="text-sm text-[#5C5651] mb-6">{message}</p>
          <Link
            href="/login"
            className="inline-block bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Sign In
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1E1C1B] mb-2">Verification Failed</h1>
          <p className="text-sm text-[#5C5651] mb-6">{message}</p>
          <Link
            href="/login"
            className="inline-block bg-[#4B1218] hover:bg-[#8B2635] text-[#FAF7F2] font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Back to Sign In
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#FFFDF9] border border-[#EADFCF] rounded-2xl shadow-sm p-8 text-center">
        <div className="w-8 h-8 border-2 border-[#4B1218] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
