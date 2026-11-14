'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin, Star, CheckCircle, Shield } from 'lucide-react';
import TutorCard from '../components/TutorCard';
import { SUBJECT_GROUPS } from '../lib/subject-catalog';

export default function TutorDirectoryView({ tutors: initialTutors = [], onSelectTutor, onViewTutor, initialSearchTerm = '', selectedTutorIds = [] }) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedMode, setSelectedMode] = useState('Online');
  const tutors = initialTutors;
  useEffect(() => { setSearchTerm(initialSearchTerm); }, [initialSearchTerm]);
  const filteredTutors = tutors.filter((tutor) => {
    const hourlyRate = tutor.hourlyRateETB == null ? null : Number(tutor.hourlyRateETB);
    if (hourlyRate !== null && (!Number.isFinite(hourlyRate) || hourlyRate < 0 || hourlyRate > maxPrice)) return false;
    // Subject filter
    if (selectedSubject !== 'All') {
      const matchSubject = (tutor.subjects || []).some(s => s.toLowerCase().includes(selectedSubject.toLowerCase()));
      if (!matchSubject) return false;
    }

    // Search term
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      const matchLocation = tutor.location.toLowerCase().includes(query);
      const matchName = tutor.name.toLowerCase().includes(query);
      const matchBio = tutor.bio.toLowerCase().includes(query);
      const matchSubjects = (tutor.subjects || []).some(s => s.toLowerCase().includes(query));
      if (!matchName && !matchBio && !matchSubjects && !matchLocation) return false;
    }

    // Price and mode filter
    if (selectedMode === 'Online' && (tutor.modes || []).length > 0 && !(tutor.modes || []).some((mode) => mode.toLowerCase() === 'online')){
      return false;
    }
    return true;
  });

  return (
    <div className="container py-8 md:py-12 space-y-8">
      
      {/* Directory Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E2D8] pb-6">
        <div>
          <span className="badge badge-coral mb-2">Addis Ababa & Online Tutors</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A1428]">Find Your Ideal Astegni Tutor</h1>
          <p className="text-xs md:text-sm text-[#64748B] mt-1">
            Compare verified tutor profiles, subjects, experience, and listed hourly rates.
          </p>
        </div>

        <div className="text-xs font-semibold text-[#64748B] bg-white px-3 py-1.5 rounded-xl border border-[#E8E2D8] self-start md:self-auto">
          Showing <strong className="text-[#0A1428] font-bold">{filteredTutors.length}</strong> available tutors
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-[#E8E2D8] shadow-sm space-y-4">
        
        {/* Top Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#E05A47]" />
          <input
            type="text"
            placeholder="Search tutor by name, subject (e.g. Calculus, Physics), or neighborhood..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#CBD5E1] text-sm font-medium text-[#0A1428] focus:outline-none focus:border-[#E05A47]"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Subject Filter Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1">Subject Focus</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#CBD5E1] text-xs font-semibold text-[#0A1428] focus:outline-none focus:border-[#E05A47]"
            >
              <option value="All">All Subjects</option>
      {SUBJECT_GROUPS.map(({ name, subjects }) => (
        <optgroup key={name} label={name}>
          {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
        </optgroup>
      ))}
            </select>
          </div>

          {/* Max Price Range */}
          <div>
            <div className="flex justify-between text-xs font-bold text-[#64748B] mb-1">
              <span>Max Hourly Rate:</span>
              <span className="text-[#E05A47] font-extrabold">{maxPrice} ETB</span>
            </div>
            <input
              aria-label="Maximum tutor hourly rate in ETB"
              type="range"
              min="0"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#E05A47]"
            />
            <input
              type="number"
              min="0"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (Number.isFinite(value)) setMaxPrice(Math.min(1000, Math.max(0, value)));
              }}
              aria-label="Enter maximum tutor hourly rate in ETB"
              className="mt-2 w-full rounded-lg border border-[#CBD5E1] bg-white px-2 py-1.5 text-xs font-semibold text-[#0A1428]"
            />
          </div>

          {/* Session Mode */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] mb-1">Tutoring Mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#CBD5E1] text-xs font-semibold text-[#0A1428] focus:outline-none focus:border-[#E05A47]"
            >
            <option value="Online">Online only</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSubject('All');
                setMaxPrice(1000);
                setSelectedMode('Online');
              }}
              className="w-full py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:text-[#E05A47] hover:border-[#E05A47] transition-colors"
            >
              Reset Filters
            </button>
          </div>

        </div>

      </div>

      {/* Tutor Grid List */}
      {filteredTutors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onSelectTutor={onSelectTutor}
              onViewTutor={onViewTutor}
              isSelected={selectedTutorIds.includes(tutor.id)}
              dark={false}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-[#E8E2D8] text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-[#0A1428]">
     {tutors.length === 0
    ? 'No tutors are available yet'
    : 'No tutors matched your filters'}
    </h3>
    <p className="text-xs text-[#64748B]">
  {tutors.length === 0
    ? 'Verified tutor profiles will appear here once added.'
    : 'Try raising the maximum price limit or clearing the subject search filter.'}
</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedMode('Online');
              setSelectedSubject('All');
              setMaxPrice(1000);
            }}
            className="btn btn-primary btn-sm font-bold"
          >
            Clear Search Filters

          </button>
        </div>
      )}

    </div>
  );
}
