'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, User, Menu, X, GraduationCap, LayoutDashboard } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onSignOut,
  currency,
  setCurrency,
  user,
}) {
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8E2D8] transition-all">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-[#E05A47] flex items-center justify-center text-white shadow-md shadow-[#E05A47]/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-[#0A1428]">Astegni</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E05A47]/10 text-[#E05A47]">አስተኚ</span>
              </div>
              <p className="text-[11px] font-medium text-[#64748B] -mt-1">Empower Your Learning</p>
            </div>
          </div>

          {/* Desktop Navigation Links: Home, Find Tutors, About Us, Pricing */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F3ECE0] px-3 py-1.5 rounded-full border border-[#E3DACB]">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-[#0A1428] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0A1428]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setActiveTab('tutors')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'tutors'
                  ? 'bg-white text-[#0A1428] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0A1428]'
              }`}
            >
              Find Tutors
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'about'
                  ? 'bg-white text-[#0A1428] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0A1428]'
              }`}
            >
              About Us
            </button>

            <button
              onClick={() => {
                setActiveTab('home');
                setTimeout(() => {
                  document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-4 py-2 rounded-full text-sm font-semibold text-[#64748B] hover:text-[#0A1428] transition-all"
            >
              Pricing
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Currency Switcher ($ USD / ETB Birr) */}
            <div className="flex items-center bg-[#F3ECE0] p-1 rounded-full border border-[#E3DACB] text-xs font-bold">
              <button
                onClick={() => setCurrency('ETB')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  currency === 'ETB' ? 'bg-[#0A1428] text-white shadow-xs' : 'text-[#64748B]'
                }`}
              >
                ETB (ብር)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  currency === 'USD' ? 'bg-[#0A1428] text-white shadow-xs' : 'text-[#64748B]'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Portal Dashboard Quick Access */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 text-xs font-bold rounded-full border transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-[#0A1428] text-white border-[#0A1428]'
                  : 'bg-white border-[#E8E2D8] text-[#0A1428] hover:border-[#E05A47]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#E05A47]" />
              <span>Dashboard</span>
            </button>

            {/* Auth Buttons */}
            {user ? (
              <>
                <span className="max-w-40 truncate text-xs font-semibold text-[#0A1428]">
                  {user.name}
                </span>
                <button
                  onClick={onSignOut}
                  className="px-3 py-2 text-xs font-bold text-[#0A1428] hover:text-[#E05A47]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-3 py-2 text-xs font-bold text-[#0A1428] hover:text-[#E05A47] transition-colors"
                >
                  Sign In
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-md text-xs py-2 px-3.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Get Started</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#0A1428] hover:bg-[#F3ECE0] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="pt-2 flex flex-col gap-2">
          {user ? (
            <button
              onClick={() => {
                onSignOut();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl font-bold border border-[#CBD5E1] text-[#0A1428]"
            >
              Sign Out
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  onOpenAuth('signin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl font-bold border border-[#CBD5E1] text-[#0A1428]"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full btn btn-primary py-3 rounded-xl font-bold"
              >
                Get Started Free
              </button>
            </>
          )}
        </div>
        )}
      </div>
    </header>
  );
}