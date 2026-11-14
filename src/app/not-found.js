import Link from 'next/link';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-[#E05A47]">404 · Not found</p>
      <h1 className="mt-3 text-3xl font-extrabold text-[#0A1428]">This page isn’t available</h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">The link may be old, or the tutor profile is no longer open to students.</p>
      <Link href="/tutors" className="btn btn-primary mt-6 rounded-xl px-5 py-3 font-bold">Browse tutors</Link>
    </div>
  );
}
