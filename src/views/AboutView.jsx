'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GraduationCap, Target, Heart, Award, ShieldCheck, Users, Sparkles, BookOpen, CheckCircle, MapPin, ArrowRight } from 'lucide-react';

export default function AboutView({ tutors = [], setActiveTab, onOpenAuth }) {
  const tutorsLoading = false;

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
            Astegni (አስተኚ) helps students discover verified tutors and manage lessons and assignments in one place.
          </p>
        </div>
      </section>

      {/* 2. OUR STORY & IMAGE SPOTLIGHT */}
      <section className="py-8 bg-white border-y border-[#E8E2D8]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <Image
                  src="/hero_tutor.jpg"
                  alt="Ethiopian Tutor & Student Learning"
                  width={720}
                  height={960}
                  className="w-full h-[400px] object-cover"
                />
              </div>

            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="badge badge-coral">Why We Started</span>
              <h2 className="text-3xl font-extrabold text-[#0A1428] leading-tight">
                Closing academic gaps through personalized 1-on-1 attention.
              </h2>

              <p className="text-sm text-[#64748B] leading-relaxed">
                Standard classroom sizes often make it difficult for teachers to cater to every student&apos;s unique learning pace. Grade 8 Ministry exams and Grade 12 National Matric exams carry high stakes for university placement and career trajectory.
              </p>

              <p className="text-sm text-[#64748B] leading-relaxed">
                The tutor directory shows profiles currently marked verified and open to students. Compare their subjects, experience, and listed rates before deciding who to contact.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8]">
                  <h4 className="font-extrabold text-lg text-[#E05A47]">Verified</h4>
                  <p className="text-xs font-semibold text-[#64748B] mt-0.5">Tutor profiles in directory</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8]">
                  <h4 className="font-extrabold text-lg text-[#0A1428]">Trackable</h4>
                  <p className="text-xs font-semibold text-[#64748B] mt-0.5">Lessons and assignments</p>
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
              <h3 className="font-extrabold text-xl text-[#0A1428]">Verified tutor listings</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                The public directory only displays tutor profiles marked verified and open for students.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-[#0A1428]">Find relevant subjects</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Tutor profiles list subjects and grade levels so students can compare available support.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8E2D8] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-[#0A1428]">Learning dashboard</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Students and tutors can view scheduled lessons and manage assignments from their dashboards.
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

          {tutorsLoading ? (
            <p className="text-center text-sm text-[#CBD5E1]" role="status">Loading tutor profiles…</p>
          ) : tutors.length === 0 ? (
            <p className="text-center text-sm text-[#CBD5E1]">No verified tutors are currently accepting students.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tutors.slice(0, 3).map((tutor) => (
                <div key={tutor.id} className="bg-[#132238] p-6 rounded-2xl border border-[#1E3352] space-y-4">
                  {tutor.avatar ? <Image src={tutor.avatar} alt={tutor.name} width={80} height={80} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#E05A47]" /> : <div className="w-20 h-20 rounded-2xl bg-[#E05A47]/20 text-white flex items-center justify-center text-3xl font-bold">{tutor.name?.charAt(0) || 'T'}</div>}
                  <div>
                    <h4 className="font-extrabold text-lg text-white"><Link href={`/tutors/${encodeURIComponent(tutor.id)}`} className="hover:text-[#E05A47]">{tutor.name}</Link></h4>
                    <p className="text-xs font-semibold text-[#E05A47]">{tutor.title || (tutor.subjects || []).join(' · ') || 'Tutor'}</p>
                    <p className="text-xs text-[#94A3B8] mt-2">{tutor.experienceYears != null ? `${tutor.experienceYears} years of experience` : 'Experience not provided'} · {tutor.hourlyRateETB != null ? `${Number(tutor.hourlyRateETB).toLocaleString()} ETB/hour` : 'Rate not listed'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <h2 className="text-3xl font-extrabold text-white">Ready to boost your child&apos;s grades?</h2>
            <p className="text-xs text-white/90">Explore verified tutor profiles and compare their current rates.</p>
          </div>

          <button
            onClick={() => onOpenAuth('register')}
            className="btn btn-navy btn-lg font-bold shadow-lg"
          >
            Create an Account
          </button>
        </div>
      </section>

    </div>
  );
}
