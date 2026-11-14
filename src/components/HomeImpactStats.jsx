export default function HomeImpactStats({ stats, loading, error, averageRate }) {
  const items = [
    { label: 'Registered students', value: stats?.students },
    { label: 'Verified tutors accepting students', value: stats?.availableTutors },
    { label: 'Completed lessons', value: stats?.completedLessons },
    { label: 'Average listed hourly rate', value: averageRate != null ? `${averageRate.toLocaleString()} ETB` : null },
  ];
  return (
    <section className="py-12 bg-[#E5A93C] text-[#0A1428]">
      <div className="container">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#0A1428]/70">Astegni Impact</span>
          <h2 className="text-3xl font-extrabold text-[#0A1428]">Small wins become lasting confidence.</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {items.map((item) => <div key={item.label} className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
            <span className="text-3xl sm:text-4xl font-black block text-[#0A1428]">{error ? '—' : item.value ?? (loading ? '…' : '0')}</span>
            <span className="text-xs font-bold text-[#0A1428]/80 mt-1 block">{item.label}</span>
          </div>)}
        </div>
        {error && <p className="mt-3 text-center text-xs text-rose-900" role="status">Live statistics are unavailable right now.</p>}
      </div>
    </section>
  );
}
