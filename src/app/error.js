'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[Astegni] Page error:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8E2D8] shadow-sm p-10 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0A1428]">Something went wrong</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 btn btn-primary px-6 py-2.5 rounded-xl font-bold text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
