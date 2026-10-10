'use client';

import React, { useState } from 'react';
import { X, Star, CheckCircle, Calendar, Clock, BookOpen, MapPin, Award, Video, ShieldCheck, Check } from 'lucide-react';

export default function TutorProfileModal({ tutor, onClose, currency = 'ETB' }) {
  const [selectedSlot, setSelectedSlot] = useState(tutor?.availableSlots?.[0] || '');
  const [selectedSubject, setSelectedSubject] = useState(tutor?.subjects?.[0] || '');
  const [sessionType, setSessionType] = useState('Online Video Class');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (!tutor) return null;

  const displayRate = currency === 'USD' ? `$${tutor.hourlyRateUSD}` : `${tutor.hourlyRateETB} ETB`;

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setBookingConfirmed(true);
  };

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

        {bookingConfirmed ? (
          /* Confirmation State */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <span className="badge badge-green mb-2">Free Trial Confirmed</span>
              <h2 className="text-2xl font-extrabold text-[#0A1428]">You're all set with {tutor.name}!</h2>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                We've reserved your trial session for <strong className="text-[#E05A47]">{selectedSubject}</strong> on <strong className="text-[#0A1428]">{selectedSlot}</strong> ({sessionType}).
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E2D8] max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E8E2D8]">
                <span className="text-gray-500">Tutor:</span>
                <span className="font-bold text-[#0A1428]">{tutor.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E2D8]">
                <span className="text-[#64748B]">Subject:</span>
                <span className="font-bold text-[#0A1428]">{selectedSubject}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E2D8]">
                <span className="text-[#64748B]">Time & Date:</span>
                <span className="font-bold text-[#0A1428]">{selectedSlot}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Trial Price:</span>
                <span className="font-bold text-emerald-600">FREE (0 ETB)</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="btn btn-primary btn-md font-bold px-8"
              >
                Done & Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Profile & Booking View */
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
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl bg-white"
                  />
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
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg text-amber-700 font-bold border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{tutor.rating}</span>
                  <span className="text-gray-400 font-normal">({tutor.reviewsCount} reviews)</span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-600">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span>{tutor.university}</span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-600">
                  <Award className="w-4 h-4 text-gray-400" />
                  <span>{tutor.experienceYears} Years Exp.</span>
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

                {/* Video Intro Badge Card */}
                <div className="bg-[#0A1428] rounded-2xl p-4 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-2 relative z-10">
                    <span className="badge badge-coral text-[10px]">Interactive Demo</span>
                    <h4 className="text-sm font-bold">Watch Intro Video</h4>
                    <p className="text-[11px] text-[#94A3B8]">See {tutor.name}'s teaching style & methodology.</p>
                  </div>

                  <button className="mt-4 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-sm transition-colors border border-white/20">
                    <Video className="w-4 h-4 text-[#E05A47]" />
                    <span>Play Intro (1:30)</span>
                  </button>
                </div>
              </div>

              {/* Booking Form Section */}
              <form onSubmit={handleConfirmBooking} className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8E2D8] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-[#0A1428] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#E05A47]" />
                    <span>Schedule Free 30-Min Trial Session</span>
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    No credit card needed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Subject */}
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] mb-1">Select Subject Focus</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0A1428] focus:outline-none focus:border-[#E05A47]"
                    >
                      {tutor.subjects.map((sub, idx) => (
                        <option key={idx} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Session Type */}
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] mb-1">Session Mode</label>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0A1428] focus:outline-none focus:border-[#E05A47]"
                    >
                      <option value="Online Video Class">Online Live Interactive Video</option>
                      <option value="In-Person Home Visit">In-Person Home Visit (Addis Ababa)</option>
                    </select>
                  </div>
                </div>

                {/* Available Time Slots Grid */}
                <div>
                  <label className="block text-xs font-bold text-[#64748B] mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#E05A47]" />
                    <span>Choose Available Slot:</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {tutor.availableSlots.map((slot, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center transition-all border ${
                          selectedSlot === slot
                            ? 'bg-[#E05A47] text-white border-[#E05A47] shadow-sm'
                            : 'bg-white text-[#0A1428] border-[#CBD5E1] hover:border-[#E05A47]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-[11px] text-gray-500">
                    Free trial includes learning diagnostic assessment.
                  </p>
                  <button
                    type="submit"
                    className="btn btn-primary btn-md font-bold px-6 shadow-md"
                  >
                    Confirm Free Trial
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
