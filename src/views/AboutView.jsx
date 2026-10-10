'use client';

import React from 'react';
import { GraduationCap, Target, Heart, Award, ShieldCheck, Users, Sparkles, BookOpen, CheckCircle, MapPin, ArrowRight } from 'lucide-react';

export default function AboutView({ setActiveTab, onOpenAuth }) {
  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="pt-10 md:pt-16 pb-8">
        <div className="container text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E05A47]/10 text-[#E05A47] font-bold text-xs border border-[#E05A47]/20">
            <Sparkles className="w-4 h-4" />
            <span>Our Mission & Story</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A1428] leading-tight tracking-tight">
            Empowering the next generation of <span className="text-[#E05A47] underline decoration-[#E05A47]/30">Ethiopian leaders.</span>
          </h1>

          <p className="text-base text-[#64748B] leading-relaxed">
            Astegni (አስተኚ) was founded in Addis Ababa with a simple yet transformative vision: to pair every student with dedicated, top 1% verified tutors who inspire confidence and turn academic challenges into lifelong success.
          </p>
        </div>
      </section>

      {/* 2. OUR STORY & IMAGE SPOTLIGHT */}
      <section className="py-8 bg-white border-y border-[#E8E2D8]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src="/hero_tutor.jpg"
                  alt="Ethiopian Tutor & Student Learning"
                  className="w-full h-[400px] object-cover"
                />
              </div>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -right-4 bg-[#0A1428] text-white p-4 rounded-2xl shadow-xl border border-[#1E3352] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E05A47] text-white flex items-center justify-center font-extrabold text-lg">
                  15k+
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Matched Students</span>
                  <span className="text-[11px] text-[#94A3B8]">Across Addis Ababa & Ethiopia</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="badge badge-coral">Why We Started</span>
              <h2 className="text-3xl font-extrabold text-[#0A1428] leading-tight">
                Closing academic gaps through personalized 1-on-1 attention.
              </h2>

              <p className="text-sm text-[#64748B] leading-relaxed">
                Standard classroom sizes often make it difficult for teachers to cater to every student's unique learning pace. Grade 8 Ministry exams and Grade 12 National Matric exams carry high stakes for university placement and career trajectory.
              </p>

              <p className="text-sm text-[#64748B] leading-relaxed">
                Astegni solves this by vetting top university graduates and certified educators, matching them directly with families for safe in-person home tutoring or interactive online video classes.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8]">
                  <h4 className="font-extrabold text-2xl text-[#E05A47]">98%</h4>
                  <p className="text-xs font-semibold text-[#64748B] mt-0.5">Matric Pass Rate</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8]">
                  <h4 className="font-extrabold text-2xl text-[#0A1428]">100%</h4>
                  <p className="text-xs font-semibold text-[#64748B] mt-0.5">Vetted Educators</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. OUR CORE PILLARS */}
      <section className="py-8">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="badge badge-coral">Our Core Pillars</span>
            <h2 className="text-3xl font-extrabold text-[#0A1428]">What makes Astegni different</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-[#0A1428]">Rigorous 5-Step Vetting</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Every tutor undergoes university degree authentication, subject competency examinations, background checks, and teaching methodology interviews.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-[#0A1428]">Ethiopian Curriculum Aligned</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Lessons strictly follow the Ministry of Education syllabus, focusing on past entrance exam questions and critical problem-solving skills.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-[#0A1428]">Parent Progress Transparency</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Receive weekly progress reports, track completed study hours, and communicate directly with your child's tutor through our dashboard portal.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. MEET TOP TUTORS SPOTLIGHT */}
      <section className="py-12 bg-[#0A1428] text-white">
        <div className="container">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
            <span className="badge badge-coral">Top Educators</span>
            <h2 className="text-3xl font-extrabold text-white">Educators who inspire excellence.</h2>
            <p className="text-xs text-[#94A3B8]">
              Graduates from Addis Ababa University (AAU), AAiT, and top institutions across East Africa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#132238] p-6 rounded-2xl border border-[#1E3352] space-y-4">
              <img src="/tutor_female_1.jpg" alt="Bethlehem" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#E05A47]" />
              <div>
                <h4 className="font-extrabold text-lg text-white">Bethlehem Tassew</h4>
                <p className="text-xs font-semibold text-[#E05A47]">Mathematics & Calculus Lead</p>
                <p className="text-xs text-[#94A3B8] mt-2">AAU B.Sc. Mathematics • 6 Years Tutor Experience</p>
              </div>
            </div>

            <div className="bg-[#132238] p-6 rounded-2xl border border-[#1E3352] space-y-4">
              <img src="/tutor_male_1.jpg" alt="Abebe" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-400" />
              <div>
                <h4 className="font-extrabold text-lg text-white">Abebe Kebede</h4>
                <p className="text-xs font-semibold text-amber-400">Physics & STEM Mentor</p>
                <p className="text-xs text-[#94A3B8] mt-2">AAiT Mechanical Engineer • 5 Years Tutor Experience</p>
              </div>
            </div>

            <div className="bg-[#132238] p-6 rounded-2xl border border-[#1E3352] space-y-4">
              <img src="/tutor_female_2.jpg" alt="Hiwot" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-400" />
              <div>
                <h4 className="font-extrabold text-lg text-white">Hiwot Alemu</h4>
                <p className="text-xs font-semibold text-emerald-400">English Language Specialist</p>
                <p className="text-xs text-[#94A3B8] mt-2">Certified Educator • 7 Years Tutor Experience</p>
              </div>
            </div>

          </div>

          <div className="text-center pt-8">
            <button
              onClick={() => setActiveTab('tutors')}
              className="btn btn-primary btn-md font-bold"
            >
              Browse All Verified Tutors
            </button>
          </div>
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <section className="container">
        <div className="bg-gradient-to-r from-[#E05A47] to-[#FF5A36] text-white p-10 md:p-14 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2 max-w-lg">
            <h2 className="text-3xl font-extrabold text-white">Ready to boost your child's grades?</h2>
            <p className="text-xs text-white/90">Book a free 30-minute diagnostic session with an Astegni tutor today.</p>
          </div>

          <button
            onClick={() => onOpenAuth('register')}
            className="btn btn-navy btn-lg font-bold shadow-lg"
          >
            Start Free Trial
          </button>
        </div>
      </section>

    </div>
  );
}
