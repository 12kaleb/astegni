export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#E05A47]/20 border-t-[#E05A47] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading Astegni…</p>
      </div>
    </div>
  );
}
