'use client';

import React from 'react';
import Image from 'next/image';
import { X, Star, CheckCircle, BookOpen, Award, ShieldCheck } from 'lucide-react';

export default function TutorProfileModal({ tutor, onClose, onSelect, isSelected = false, isSelecting = false }) {
  if (!tutor) return null;

  const displayRate = tutor.hourlyRateETB != null ? `${tutor.hourlyRateETB.toLocaleString()} ETB` : 'Rate not listed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8E2D8] relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#F3ECE0] text-[#0A1428] flex items-center justify-center transition-colors border border-[#E8E2D8]"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
            {/* Header Cover Banner */}
            <div className="h-32 bg-gradient-to-r from-[#0A1428] to-[#1E3352] p-6 flex items-end justify-between relative rounded-t-3xl">
              <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#E05A47]" />
                <span>Verified Astegni Educator</span>
              </div>
            </div>

            {/* Profile Header Info */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
                <div className="flex items-end gap-4">
                  {tutor.avatar ? <Image src={tutor.avatar} alt={tutor.name} width={96} height={96} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl bg-white" /> : <div className="w-24 h-24 rounded-2xl ring-4 ring-white shadow-xl bg-[#0A1428] text-white flex items-center justify-center text-3xl font-bold">{tutor.name?.charAt(0) || 'T'}</div>}
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0A1428] flex items-center gap-2">
                      <span>{tutor.name}</span>
                      <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                    </h2>
                    <p className="text-xs font-semibold text-[#E05A47]">{tutor.title}</p>
                  </div>
                </div>

                <div className="bg-[#FAF7F2] px-4 py-2 rounded-2xl border border-[#E8E2D8] text-right">
                  <span className="text-[10px] font-bold text-gray-400 block">HOURLY RATE</span>
                  <span className="text-xl font-extrabold text-[#E05A47]">{displayRate}</span>
                </div>
              </div>

              {/* Badges & Rating */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-6 pb-4 border-b border-gray-100">
                {tutor.reviewsCount > 0 && <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg text-amber-700 font-bold border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{tutor.rating}</span>
                  <span className="text-gray-400 font-normal">({tutor.reviewsCount} reviews)</span>
                </div>}

                <div className="flex items-center gap-1.5 text-gray-600">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span>{tutor.university}</span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-600">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span>{tutor.experienceYears != null ? `${tutor.experienceYears} years experience` : 'Experience not provided'}</span>
                </div>
              </div>

              {/* Bio & Video Intro Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-[#0A1428] tracking-wider mb-1">About Educator</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{tutor.bio}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-[#0A1428] tracking-wider mb-2">Teaching Subjects</h4>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.map((sub, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-[#FAF7F2] text-[#0A1428] border border-[#E8E2D8] text-xs font-semibold">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-[#0A1428] tracking-wider mb-1">Languages</h4>
                    <p className="text-xs text-gray-600">{tutor.languages.join(' • ')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#E8E2D8] bg-[#FAF7F2] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-slate-600">Interested in learning with this tutor?</p>
                <button
                  onClick={() => onSelect?.(tutor)}
                  disabled={isSelected || isSelecting}
                  aria-pressed={isSelected}
                  className={`btn btn-sm px-5 py-2 font-bold ${isSelected ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'btn-primary'}`}
                >
                  {isSelected ? 'Selected' : isSelecting ? 'Selecting…' : 'Select this tutor'}
                </button>
              </div>

            </div>
          </div>
      </div>
    </div>
  );
}
