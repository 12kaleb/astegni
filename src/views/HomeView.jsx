'use client';

import React, { useState ,useEffect} from 'react';
import { Search, Sparkles, Star, CheckCircle, ShieldCheck, ArrowRight, BookOpen, GraduationCap, ChevronDown, ChevronUp, Users, Award, Zap, Heart, Check } from 'lucide-react';
import TutorCard from '../components/TutorCard';

export default function HomeView({ setActiveTab, onSelectTutor, onOpenAuth, currency,onSearchTutors }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [featuredTutors, setFeaturedTutors] = useState([]);

useEffect(() => {
  let cancelled = false;

  async function loadFeaturedTutors() {
    try {
      const response = await fetch('/api/tutors');
      if (!response.ok) return;

      const tutors = await response.json();
      if (!cancelled) setFeaturedTutors(tutors.slice(0, 3));
    } catch {
      // Keep the featured section empty if the request fails.
    }
  }

  loadFeaturedTutors();

  return () => {
    cancelled = true;
  };
}, []);


  const subjects = [
    { name: 'Math & Calculus', count: '340+ Tutors', icon: '📐', bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', border: 'border-[#BAE6FD]' },
    { name: 'Physics & Chemistry', count: '280+ Tutors', icon: '🧪', bg: 'bg-[#FFE4E6]', text: 'text-[#BE123C]', border: 'border-[#FECDD3]' },
    { name: 'Amharic & English', count: '410+ Tutors', icon: '📚', bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', border: 'border-[#BBF7D0]' },
    { name: 'Grade 8 & 12 Prep', count: '520+ Tutors', icon: '🎓', bg: 'bg-[#FEF9C3]', text: 'text-[#A16207]', border: 'border-[#FEF08A]' },
    { name: 'Python & ICT', count: '190+ Tutors', icon: '💻', bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]', border: 'border-[#E9D5FF]' },
    { name: 'Biology & Civics', count: '210+ Tutors', icon: '🧬', bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]', border: 'border-[#FED7AA]' }
  ];

  const faqs = [
    {
      q: 'How does Astegni match my child with the right tutor?',
      a: 'We evaluate your child’s grade, subject needs, learning style, and location (or online preference). Our algorithm and team select top 1% verified tutors in Addis Ababa & across Ethiopia for a free 30-minute trial session.'
    },
    {
      q: 'Are all Astegni tutors background-checked and qualified?',
      a: 'Yes! Every educator undergoes rigorous university degree verification, subject competency examinations, background checks, and teaching methodology interviews before joining Astegni.'
    },
    {
      q: 'What is the cost of hiring a tutor on Astegni?',
      a: 'Tutor rates start from 350 ETB to 600 ETB per hour ($15 to $35 USD/hr) depending on tutor experience and subject complexity. We offer flexible pay-as-you-go sessions as well as discounted monthly packages.'
    },
    {
      q: 'Can we schedule in-person home visits in Addis Ababa?',
      a: 'Absolutely! Astegni supports both in-person home tutoring across Addis Ababa neighborhoods (Bole, Kazanchis, Old Airport, CMC, Sarbet, etc.) and live 1-on-1 online video tutoring.'
    }
  ];

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
                <span>#1 Tutor Matching Platform in Ethiopia</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0A1428] leading-[1.1] tracking-tight">
                The right tutor can change <span className="text-[#E05A47] underline decoration-[#E05A47]/30">everything.</span>
              </h1>

              <p className="text-base md:text-lg text-[#64748B] leading-relaxed max-w-xl">
                Empower your child with top 1% verified tutors in Addis Ababa. Personalized 1-on-1 learning for school subjects, Grade 8 & 12 national matric exams, and language mastery.
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
                    placeholder="Search subject (e.g. Mathematics, Physics, Amharic)..."
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
                  <span>100% Vetted Educators</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Free 30-Min Trial Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>4.95 Average Parent Rating</span>
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
                  <img
                    src="/hero_tutor.jpg"
                    alt="Ethiopian student and tutor studying"
                    className="w-full h-[400px] md:h-[460px] object-cover hover:scale-102 transition-transform duration-500"
                  />
                </div>

                {/* Floating Tutor Match Badge (Figma Style) */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-[#E8E2D8] flex items-center gap-3 animate-bounce-slow">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-extrabold text-lg shadow-inner">
                    98%
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#0A1428] block">Grade Improvement</span>
                    <span className="text-[11px] text-[#64748B]">Average after 8 sessions</span>
                  </div>
                </div>

                {/* Floating Rating Badge */}
                <div className="absolute top-6 -right-6 bg-[#0A1428] text-white p-3 px-4 rounded-2xl shadow-xl border border-[#1E3352] flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="text-xs">
                    <span className="font-extrabold block">1,240+ Active</span>
                    <span className="text-[10px] text-[#94A3B8]">Sessions This Week</span>
                  </div>
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
            {subjects.map((sub, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveTab('tutors')}
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
        </div>
      </section>

      {/* 3. VALUE PROPOSITION SPOTLIGHT */}
      <section className="py-12 bg-white border-y border-[#E8E2D8]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-[#E8E2D8] relative">
                <img 
                  src="/tutor_female_1.jpg" 
                  alt="Ethiopian Tutor Bethlehem"
                  className="w-full h-[380px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end text-white">
                  <span className="badge badge-gold self-start text-[10px] mb-1">Featured Tutor of the Month</span>
                  <h4 className="text-xl font-extrabold">Bethlehem Tassew</h4>
                  <p className="text-xs text-gray-300">B.Sc. Mathematics • 6 Years Teaching Experience</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="badge badge-coral">Why Astegni</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A1428] leading-tight">
                Your first hello to a tutor who truly gets them.
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                We believe standard classrooms don't fit every learning pace. Astegni pairs your child with patient, inspiring tutors who turn frustrating homework sessions into confident breakthroughs.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center font-bold shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#0A1428]">Tailored Diagnostic Assessment</h4>
                    <p className="text-xs text-[#64748B]">We pinpoint exact knowledge gaps in math, science, or language before starting.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center font-bold shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#0A1428]">Ethiopian Matric & Curriculum Focus</h4>
                    <p className="text-xs text-[#64748B]">Tutors follow the Ministry of Education syllabus and past entrance exam patterns.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center font-bold shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#0A1428]">Flexible In-Person or Online Classes</h4>
                    <p className="text-xs text-[#64748B]">Schedule home visits in Addis Ababa or join interactive video classes from anywhere.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="btn btn-primary btn-md font-bold shadow-md"
                >
                  Get Matched in 2 Minutes
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
              <span className="badge badge-coral">Top Rated Educators</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                Expert tutors. Encouraging matches.
              </h2>
              <p className="text-sm text-[#94A3B8]">
                Hand-picked top 1% educators ready for home visits or online tutoring.
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
          {featuredTutors.length > 0 ? (
  featuredTutors.map((tutor) => (
    <TutorCard
      key={tutor.id}
      tutor={tutor}
      onSelectTutor={onSelectTutor}
      dark={true}
      currency={currency}
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

      {/* 5. GOLD IMPACT BANNER (Figma Yellow Section) */}
      <section className="py-12 bg-[#E5A93C] text-[#0A1428]">
        <div className="container">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0A1428]/70">Astegni Impact</span>
            <h2 className="text-3xl font-extrabold text-[#0A1428]">
              Small wins become lasting confidence.
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
              <span className="text-4xl font-black block text-[#0A1428]">98%</span>
              <span className="text-xs font-bold text-[#0A1428]/80 mt-1 block">Matric Exam Pass Rate</span>
            </div>

            <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
              <span className="text-4xl font-black block text-[#0A1428]">15,000+</span>
              <span className="text-xs font-bold text-[#0A1428]/80 mt-1 block">Matched Students</span>
            </div>

            <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
              <span className="text-4xl font-black block text-[#0A1428]">450 ETB</span>
              <span className="text-xs font-bold text-[#0A1428]/80 mt-1 block">Avg Hourly Tutor Rate</span>
            </div>

            <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
              <span className="text-4xl font-black block text-[#0A1428]">4.95 ★</span>
              <span className="text-xs font-bold text-[#0A1428]/80 mt-1 block">Satisfaction Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING & SUBSCRIPTION SECTION */}
      <section id="pricing-section" className="py-12">
        <div className="container">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
            <span className="badge badge-coral">Flexible Pricing</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A1428]">
              Choose a plan that works for your family.
            </h2>
            <p className="text-sm text-[#64748B]">
              No hidden fees. Free trial session included with all plans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Pay As You Go */}
            <div className="bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <span className="badge badge-blue">Pay-As-You-Go</span>
                <h3 className="text-2xl font-extrabold text-[#0A1428]">Hourly Session</h3>
                <p className="text-xs text-[#64748B]">Ideal for quick homework assistance & exam review.</p>
                <div className="pt-2">
                  <span className="text-3xl font-extrabold text-[#E05A47]">
                    {currency === 'USD' ? '$12' : '350 ETB'}
                  </span>
                  <span className="text-xs text-[#64748B]"> / hour</span>
                </div>
                <ul className="space-y-2 text-xs text-[#475569] pt-4 border-t border-[#E8E2D8]">
                  <li className="flex items-center gap-2">✓ Book single hours as needed</li>
                  <li className="flex items-center gap-2">✓ Free 30-min trial session</li>
                  <li className="flex items-center gap-2">✓ Online or In-Person</li>
                  <li className="flex items-center gap-2">✓ Direct tutor chat</li>
                </ul>
              </div>

              <button
                onClick={() => onOpenAuth('register')}
                className="btn btn-outline btn-md w-full font-bold mt-8"
              >
                Choose Pay-As-You-Go
              </button>
            </div>

            {/* Popular Monthly Package */}
            <div className="bg-[#0A1428] text-white p-8 rounded-3xl border-2 border-[#E05A47] shadow-xl relative flex flex-col justify-between transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E05A47] text-white text-[10px] font-extrabold uppercase px-4 py-1 rounded-full tracking-wider shadow-md">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="badge badge-coral">Monthly Package</span>
                <h3 className="text-2xl font-extrabold text-white">12 Hours / Month</h3>
                <p className="text-xs text-[#94A3B8]">Consistent 3x weekly sessions for top academic improvement.</p>
                <div className="pt-2">
                  <span className="text-3xl font-extrabold text-[#E05A47]">
                    {currency === 'USD' ? '$110' : '3,600 ETB'}
                  </span>
                  <span className="text-xs text-[#94A3B8]"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-[#CBD5E1] pt-4 border-t border-[#1E3352]">
                  <li className="flex items-center gap-2 text-white font-semibold">✓ 12 hours dedicated 1-on-1 tutoring</li>
                  <li className="flex items-center gap-2 text-white font-semibold">✓ Priority tutor matching</li>
                  <li className="flex items-center gap-2">✓ Weekly parent progress report</li>
                  <li className="flex items-center gap-2">✓ Practice exams & study guides</li>
                </ul>
              </div>

              <button
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary btn-md w-full font-bold mt-8 shadow-md"
              >
                Start Monthly Plan
              </button>
            </div>

            {/* Intensive Prep */}
            <div className="bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <span className="badge badge-gold">Grade 8 & 12 Matric</span>
                <h3 className="text-2xl font-extrabold text-[#0A1428]">Intensive Matric Prep</h3>
                <p className="text-xs text-[#64748B]">Complete exam prep package leading up to national exams.</p>
                <div className="pt-2">
                  <span className="text-3xl font-extrabold text-[#E05A47]">
                    {currency === 'USD' ? '$220' : '6,800 ETB'}
                  </span>
                  <span className="text-xs text-[#64748B]"> / full prep</span>
                </div>
                <ul className="space-y-2 text-xs text-[#475569] pt-4 border-t border-[#E8E2D8]">
                  <li className="flex items-center gap-2">✓ 24 hours intensive tutoring</li>
                  <li className="flex items-center gap-2">✓ All matric subjects covered</li>
                  <li className="flex items-center gap-2">✓ Mock national exam simulations</li>
                  <li className="flex items-center gap-2">✓ Guaranteed grade boost</li>
                </ul>
              </div>

              <button
                onClick={() => onOpenAuth('register')}
                className="btn btn-outline btn-md w-full font-bold mt-8"
              >
                Choose Intensive Prep
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION */}
      <section className="py-8 bg-white border-t border-[#E8E2D8]">
        <div className="container max-w-3xl">
          <div className="text-center space-y-3 mb-10">
            <span className="badge badge-coral">Frequently Asked Questions</span>
            <h2 className="text-3xl font-extrabold text-[#0A1428]">Questions answered.</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-[#E8E2D8] rounded-2xl overflow-hidden bg-[#FAF7F2] transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                  className="w-full p-5 text-left font-bold text-base text-[#0A1428] flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-5 h-5 text-[#E05A47]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-[#64748B] leading-relaxed border-t border-[#E8E2D8]/60 pt-3 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER (Figma Coral Section) */}
      <section className="container">
        <div className="bg-gradient-to-r from-[#E05A47] to-[#FF5A36] text-white p-10 md:p-14 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Let's find the tutor who changes their story.
            </h2>
            <p className="text-sm text-white/90">
              Book a free 30-minute trial session today. No commitments.
            </p>
          </div>

          <div className="relative z-10 flex gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="btn btn-navy btn-lg font-bold shadow-lg"
            >
              Book Free Trial Now
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
