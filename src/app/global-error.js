'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error, reset }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-[#FAF7F2] p-6">
          <div className="max-w-md rounded-3xl border border-[#E8E2D8] bg-white p-10 text-center">
            <h1 className="text-xl font-bold text-[#0A1428]">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-700">An unexpected error occurred. Please try again.</p>
            <button onClick={reset} className="btn btn-primary mt-5 px-6 py-2.5">Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
