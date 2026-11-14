'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, CheckCircle, MapPin, BookOpen } from 'lucide-react';

export default function TutorCard({ tutor, onSelectTutor, onViewTutor, isSelected = false, dark = false }) {
  const displayRate = tutor.hourlyRateETB != null ? `${tutor.hourlyRateETB.toLocaleString()} ETB` : 'Rate not listed';

  return (
    <div 
      className={`rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
        dark 
          ? 'bg-[#132238] border border-[#1E3352] hover:border-[#E05A47]/60 hover:shadow-xl hover:shadow-[#E05A47]/10 text-white' 
          : 'bg-white border border-[#E8E2D8] hover:border-[#E05A47]/40 hover:shadow-xl hover:shadow-slate-200/60 text-[#0A1428]'
      }`}
    >
      <div className="p-5 space-y-4">
        
        {/* Top Header: Avatar + Rating + Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            {tutor.avatar ? <Image
              src={tutor.avatar} 
              alt={tutor.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#E05A47]/30 shadow-md group-hover:scale-105 transition-transform"
            /> : <div aria-label={`${tutor.name} avatar`} className="w-16 h-16 rounded-2xl bg-[#0A1428] text-white flex items-center justify-center text-xl font-bold ring-2 ring-[#E05A47]/30">{tutor.name?.charAt(0) || 'T'}</div>}
            {tutor.verified && (
              <div className="absolute -bottom-1 -right-1 bg-[#22C55E] text-white p-0.5 rounded-full ring-2 ring-white">
                <CheckCircle className="w-3.5 h-3.5 fill-[#22C55E] text-white" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              dark ? 'bg-[#E05A47]/20 text-[#E05A47]' : 'bg-[#E05A47]/10 text-[#E05A47]'
            }`}>
              {tutor.badge || (tutor.verified ? 'Verified' : 'Tutor')}
            </span>

            {tutor.reviewsCount > 0 && tutor.rating != null && <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{tutor.rating}</span>
              <span className="text-[10px] text-gray-400 font-normal">({tutor.reviewsCount})</span>
            </div>}
          </div>
        </div>

        {/* Tutor Details */}
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-lg leading-tight group-hover:text-[#E05A47] transition-colors">
              <Link href={`/tutors/${encodeURIComponent(tutor.id)}`}>{tutor.name}</Link>
            </h3>
          </div>
          <p className={`text-xs font-medium mt-0.5 ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
              {tutor.title || 'Tutor'}
          </p>
        </div>

        {/* University & Location */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-gray-400">
            <BookOpen className="w-3.5 h-3.5 text-[#E05A47]" />
            <span className="truncate">{tutor.university || 'Education not provided'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-[#E05A47]" />
            <span className="truncate">{tutor.location || 'Location not provided'}</span>
          </div>
        </div>

        {/* Subject Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(tutor.subjects || []).slice(0, 3).map((subject, idx) => (
            <span 
              key={idx}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                dark 
                  ? 'bg-[#1E3352] text-[#CBD5E1]' 
                  : 'bg-[#F3ECE0] text-[#475569]'
              }`}
            >
              {subject}
            </span>
          ))}
          {(tutor.subjects || []).length > 3 && (
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
              dark ? 'bg-[#1E3352] text-[#94A3B8]' : 'bg-[#F3ECE0] text-[#64748B]'
            }`}>
              +{tutor.subjects.length - 3} more
            </span>
          )}
        </div>

        {/* Short Bio */}
        <p className={`text-xs leading-relaxed line-clamp-2 ${dark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
          {tutor.bio ? `“${tutor.bio}”` : 'No biography provided.'}
        </p>

      </div>

      {/* Footer / Price & Action */}
      <div className={`p-4 border-t flex items-center justify-between gap-2 ${
        dark ? 'border-[#1E3352] bg-[#0A1428]/40' : 'border-[#E8E2D8] bg-[#FAF7F2]/50'
      }`}>
        <div>
          <span className="text-[10px] font-semibold text-gray-400 block -mb-0.5">HOURLY RATE</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-[#E05A47]">{displayRate}</span>
            {tutor.hourlyRateETB != null && <span className="text-[11px] text-gray-400 font-medium">/ hr</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/tutors/${encodeURIComponent(tutor.id)}`} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:border-slate-400">
            Details
          </Link>
          <button
            onClick={() => onSelectTutor(tutor)}
            disabled={isSelected}
            aria-pressed={isSelected}
            className={`btn btn-sm text-xs py-2 px-4 shadow-sm ${isSelected ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'btn-primary'}`}
          >
            {isSelected ? 'Selected' : 'Select Tutor'}
          </button>
        </div>
      </div>
    </div>
  );
}
