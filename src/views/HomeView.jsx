'use client';

import React, { useState ,useEffect} from 'react';
import { Search, Sparkles, Star, CheckCircle, ShieldCheck, ArrowRight, BookOpen, GraduationCap, Users, Award, Zap, Heart, Check } from 'lucide-react';
import TutorCard from '../components/TutorCard';
import HomeFaq from '../components/HomeFaq';
import HomeImpactStats from '../components/HomeImpactStats';
import Image from 'next/image';
import { useApiResource } from '../lib/use-api-resource';

const selectPlatformStats = (result) => result;

export default function HomeView({ initialTutors = [], setActiveTab, onSelectTutor, onViewTutor, onOpenAuth, onSearchTutors, selectedTutorIds = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTutors] = useState(initialTutors);
  const tutorsLoading = false;
  const { data: platformStats, error: statsError, loading: statsLoading } = useApiResource('/api/public/stats', selectPlatformStats);

  const tutorRates = availableTutors
    .map((tutor) => Number(tutor.hourlyRateETB))
    .filter((rate) => Number.isFinite(rate) && rate > 0);
  const lowestTutorRate = tutorRates.length ? Math.min(...tutorRates) : null;
  const highestTutorRate = tutorRates.length ? Math.max(...tutorRates) : null;
  const averageTutorRate = tutorRates.length
    ? Math.round(tutorRates.reduce((total, rate) => total + rate, 0) / tutorRates.length)
    : null;


  const subjectStyles = [
    { icon: '📐', bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', border: 'border-[#BAE6FD]' },
    { icon: '🧪', bg: 'bg-[#FFE4E6]', text: 'text-[#BE123C]', border: 'border-[#FECDD3]' },
    { icon: '📚', bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', border: 'border-[#BBF7D0]' },
    { icon: '🎓', bg: 'bg-[#FEF9C3]', text: 'text-[#A16207]', border: 'border-[#FEF08A]' },
    { icon: '💻', bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]', border: 'border-[#E9D5FF]' },
    { icon: '🧬', bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]', border: 'border-[#FED7AA]' },
  ];
  const uniqueSubjects = [...new Map(
    availableTutors.flatMap((tutor) => tutor.subjects || []).map((name) => [name.trim().toLowerCase(), name.trim()])
  ).values()].filter(Boolean).slice(0, 6);
  const subjects = uniqueSubjects.map((name, index) => ({
    name,
    count: 'Browse tutors who teach this subject',
    ...subjectStyles[index % subjectStyles.length],
  }));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchTutors(searchQuery);
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION (Warm Cream Background) */}
      <section className="pt-8 md:pt-16 pb-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E05A47]/10 text-[#E05A47] font-bold text-xs border border-[#E05A47]/20">
                <Sparkles className="w-4 h-4" />
                <span>Verified tutor directory</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0A1428] leading-[1.1] tracking-tight">
                The right tutor can change everything.
              </h1>

              <p className="text-base md:text-lg text-[#64748B] leading-relaxed max-w-xl">
                Find verified tutors in Addis Ababa and compare profiles, subjects, experience, languages, and hourly rates.
              </p>

              {/* Search Bar Widget */}
              <form 
                onSubmit={handleSearchSubmit}
                className="bg-white p-3 rounded-2xl md:rounded-full shadow-lg border border-[#E8E2D8] flex flex-col md:flex-row items-center gap-3 max-w-2xl"
              >
                <div className="flex items-center gap-3 px-4 py-2 w-full md:w-auto flex-1">
                  <Search className="w-5 h-5 text-[#E05A47]" />
                  <input
                    type="text"
                    placeholder="Search by subject (Mathematics, Physics)…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm font-medium text-[#0A1428] placeholder:text-[#94A3B8] focus:outline-none bg-transparent"
                  />
                </div>

                <div className="h-8 w-px bg-[#E8E2D8] hidden md:block" />

                <select className="px-4 py-2 text-xs font-bold text-[#64748B] bg-transparent focus:outline-none w-full md:w-auto">
                  <option value="">All Grades</option>
                  <option value="g8">Grade 8 Exam</option>
                  <option value="g9-10">Grade 9-10</option>
                  <option value="g11-12">Grade 11-12 Prep</option>
                  <option value="uni">University</option>
                </select>

                <button 
                  type="submit"
                  className="btn btn-primary btn-md w-full md:w-auto px-6 font-bold shadow-md"
                >
                  Find Tutors
                </button>
              </form>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{platformStats ? `${platformStats.availableTutors} verified tutors accepting students` : 'Tutor availability from live profiles'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Profiles include listed subjects and rates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{platformStats?.averageTutorRating != null ? `${platformStats.averageTutorRating.toFixed(1)} average tutor rating` : 'Tutor ratings shown on profiles'}</span>
                </div>
              </div>

            </div>

            {/* Right Column Image & Floating Badge */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Background Accent Blob */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#E05A47]/20 to-amber-300/30 rounded-3xl blur-2xl -z-10" />

                {/* Main Hero Image */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <Image
                    src="/hero_tutor.jpg"
                    alt="Ethiopian student and tutor studying"
                    width={720}
                    height={960}
                    className="w-full h-[400px] md:h-[460px] object-cover hover:scale-102 transition-transform duration-500"
                  />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SUBJECT CATEGORIES SECTION */}
      <section className="py-8">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="badge badge-coral">Explore Subjects</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A1428]">
              Support for every subject — and every kind of learner.
            </h2>
            <p className="text-sm text-[#64748B]">
              From primary school fundamentals to Grade 12 National Matric prep and coding.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorsLoading && <p className="col-span-full text-center text-sm text-slate-500">Loading available subjects…</p>}
            {!tutorsLoading && subjects.length === 0 && <p className="col-span-full text-center text-sm text-slate-500">Subjects will appear here when verified tutor profiles are available.</p>}
            {subjects.map((sub, idx) => (
              <div 
                key={idx}
                role="button"
                tabIndex={0}
                aria-label={`Browse tutors for ${sub.name}`}
                onClick={() => setActiveTab('tutors')}
                onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveTab('tutors'); } }}
                className={`p-6 rounded-2xl bg-white border ${sub.border} shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex items-start justify-between`}
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${sub.bg} ${sub.text} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                    {sub.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#0A1428] group-hover:text-[#E05A47] transition-colors">
                      {sub.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#64748B] mt-0.5">{sub.count}</p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] group-hover:bg-[#E05A47] group-hover:text-white text-[#0A1428] flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
          {statsError && <p className="mt-3 text-center text-xs text-rose-700" role="status">Live statistics are unavailable right now.</p>}
        </div>
      </section>

      {/* 3. VALUE PROPOSITION SPOTLIGHT */}
      <section className="py-12 bg-white border-y border-[#E8E2D8]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5">
              {availableTutors[0] ? (
                <div className="rounded-3xl overflow-hidden shadow-xl border border-[#E8E2D8] relative bg-[#0A1428] min-h-[380px]">
                  {availableTutors[0].avatar ? <Image src={availableTutors[0].avatar} alt={availableTutors[0].name} width={600} height={600} className="w-full h-[380px] object-cover" /> : <div className="w-full h-[380px] flex items-center justify-center text-7xl font-bold text-white/80">{availableTutors[0].name?.charAt(0) || 'T'}</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end text-white">
                    <span className="badge badge-gold self-start text-[10px] mb-1">Verified tutor</span>
                    <h4 className="text-xl font-extrabold">{availableTutors[0].name}</h4>
                    <p className="text-xs text-gray-300">{availableTutors[0].title || (availableTutors[0].subjects || []).join(' · ')}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-[#E8E2D8] bg-white min-h-[380px] flex items-center justify-center p-8 text-center text-sm text-slate-500">
                  {tutorsLoading ? 'Loading tutor profiles…' : 'Verified tutor profiles will appear here when available.'}
                </div>
              )}
            </div>
            <div className="lg:col-span-7 space-y-6">
              <span className="badge badge-coral">Why Astegni</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A1428] leading-tight">
                Your first hello to a tutor who truly gets them.
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                We believe standard classrooms don&apos;t fit every learning pace. Astegni pairs your child with patient, inspiring tutors who turn frustrating homework sessions into confident breakthroughs.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center font-bold shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#0A1428]">Compare tutor profiles</h4>
                    <p className="text-xs text-[#64748B]">Review subjects, experience, languages, and listed hourly rates.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center font-bold shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#0A1428]">Ethiopian Matric & Curriculum Focus</h4>
                    <p className="text-xs text-[#64748B]">Search profiles for tutors who teach the subjects you need.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center font-bold shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#0A1428]">Lesson and assignment tracking</h4>
                    <p className="text-xs text-[#64748B]">Use your dashboard to view scheduled lessons and track assignments.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="btn btn-primary btn-md font-bold shadow-md"
                >
                  Browse tutor profiles
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FEATURED TUTORS SHOWCASE (DARK NAVY SECTION matching Figma) */}
      <section className="py-16 bg-[#0A1428] text-white">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3 max-w-xl">
              <span className="badge badge-coral">Verified Educators</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                Expert tutors. Encouraging matches.
              </h2>
              <p className="text-sm text-[#94A3B8]">
                Verified educators currently accepting students.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('tutors')}
              className="btn btn-outline text-white border-[#1E3352] hover:border-[#E05A47] hover:bg-[#E05A47] btn-md font-bold"
            >
              Browse All Tutors 
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTutors.length > 0 ? (
  availableTutors.slice(0, 3).map((tutor) => (
    <TutorCard
      key={tutor.id}
      tutor={tutor}
      onSelectTutor={onSelectTutor}
      onViewTutor={onViewTutor}
      isSelected={selectedTutorIds.includes(tutor.id)}
      dark={true}
    />
  ))
) : (
  <p className="col-span-full text-center text-sm text-[#CBD5E1]">
    Verified tutors will appear here as they join Astegni.
  </p>
)}
          </div>
        </div>
      </section>

      <HomeImpactStats stats={platformStats} loading={statsLoading} error={statsError} averageRate={averageTutorRate} />

      {/* 6. LIVE TUTOR RATES */}
      <section id="pricing-section" className="py-12">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="badge badge-coral">Current Tutor Rates</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A1428]">
              Choose the tutoring rate that works for you.
            </h2>
            <p className="text-sm text-[#64748B]">
              These rates come from verified tutors who are currently accepting students. Fixed monthly packages are not configured yet.
            </p>
          </div>

          {tutorsLoading ? (
            <p className="text-center text-sm text-slate-500" role="status">Loading current tutor rates…</p>
          ) : tutorRates.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-[#E8E2D8] bg-white p-8 text-center">
              <p className="font-semibold text-[#0A1428]">Tutor rates are not available yet.</p>
              <p className="mt-2 text-sm text-[#64748B]">Rates will appear here when verified tutors open their profiles to students.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
                {[
                  { label: 'Lowest listed rate', value: lowestTutorRate },
                  { label: 'Average listed rate', value: averageTutorRate },
                  { label: 'Highest listed rate', value: highestTutorRate },
                ].map((rate) => (
                  <div key={rate.label} className="bg-white p-7 rounded-3xl border border-[#E8E2D8] shadow-sm text-center">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">{rate.label}</p>
                    <p className="mt-3 text-3xl font-extrabold text-[#E05A47]">{rate.value.toLocaleString()} ETB</p>
                    <p className="mt-1 text-xs text-[#64748B]">per hour</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-[#64748B]">
                Based on {tutorRates.length} verified tutor {tutorRates.length === 1 ? 'profile' : 'profiles'} currently open to students.
              </p>
            </>
          )}

          <div className="mt-7 text-center">
            <button
              onClick={() => setActiveTab('tutors')}
              className="btn btn-primary btn-md font-bold"
            >
              Browse tutors and compare rates
            </button>
          </div>
        </div>
      </section>
      <HomeFaq />

      {/* 8. CALL TO ACTION BANNER (Figma Coral Section) */}
      <section className="container">
        <div className="bg-gradient-to-r from-[#E05A47] to-[#FF5A36] text-white p-10 md:p-14 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Let&apos;s find the tutor who changes their story.
            </h2>
            <p className="text-sm text-white/90">
              Compare verified tutor profiles and their current hourly rates.
            </p>
          </div>

          <div className="relative z-10 flex gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="btn btn-navy btn-lg font-bold shadow-lg"
            >
              Browse Tutors
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
