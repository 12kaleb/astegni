'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, GraduationCap, LayoutDashboard } from 'lucide-react';

const ROLE_LABELS = {
  student: { label: 'Student', color: 'bg-blue-100 text-blue-700' },
  tutor:   { label: 'Tutor',   color: 'bg-emerald-100 text-emerald-700' },
  admin:   { label: 'Admin',   color: 'bg-purple-100 text-purple-700' },
  manager: { label: 'Manager', color: 'bg-amber-100 text-amber-700' },
  support_specialist: { label: 'Support', color: 'bg-rose-100 text-rose-700' },
};

export default function Navbar({
  activeTab,
  onOpenAuth,
  onSignOut,
  user,
  authLoading = false,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'tutors', label: 'Find Tutors', href: '/tutors' },
    { id: 'about', label: 'About Us', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E2D8]">
      <div className="container">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-[#E05A47] flex items-center justify-center text-white shadow-md shadow-[#E05A47]/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-[#0A1428]">Astegni</span>
              </div>
              <p className="text-[11px] font-medium text-[#64748B] -mt-0.5">Empower Your Learning</p>
            </div>
          </Link>

          {!user && !authLoading && <nav className="hidden md:flex items-center gap-1 bg-[#F3ECE0] px-3 py-1.5 rounded-full border border-[#E3DACB]">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === link.id
                    ? 'bg-white text-[#0A1428] shadow-sm'
                    : 'text-[#64748B] hover:text-[#0A1428]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Pricing scrolls home */}
            <Link
              href="/#pricing-section"
              className="px-4 py-2 rounded-full text-sm font-semibold text-[#64748B] hover:text-[#0A1428] transition-all"
            >
              Pricing
            </Link>
          </nav>}

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dashboard button */}
            <Link
              href="/dashboard"
              className={`px-3.5 py-2 text-xs font-bold rounded-full border transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-[#0A1428] text-white border-[#0A1428]'
                  : 'bg-white border-[#E8E2D8] text-[#0A1428] hover:border-[#E05A47]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#E05A47]" />
              <span>Dashboard</span>
            </Link>

            {/* Auth */}
            {authLoading ? (
              <div className="w-20 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              <>
                <Link href="/account/privacy" className="text-xs font-semibold text-slate-700 hover:text-[#E05A47]">Account &amp; privacy</Link>
                <div className="flex items-center gap-2">
                  <span className="max-w-32 truncate text-xs font-semibold text-[#0A1428]">
                    {user.name}
                  </span>
                  {ROLE_LABELS[user.role] && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_LABELS[user.role].color}`}>
                      {ROLE_LABELS[user.role].label}
                    </span>
                  )}
                </div>
                <button
                  onClick={onSignOut}
                  className="px-3 py-2 text-xs font-bold text-[#0A1428] hover:text-[#E05A47] transition-colors"
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

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="md:hidden p-2 rounded-lg text-[#0A1428] hover:bg-[#F3ECE0] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-navigation" className="pb-4 flex flex-col gap-1 border-t border-[#E8E2D8] pt-3">
            {!user && !authLoading && navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === link.id
                    ? 'bg-[#0A1428] text-white'
                    : 'text-[#0A1428] hover:bg-[#F3ECE0]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!user && !authLoading && <Link
              href="/#pricing-section"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-[#0A1428] hover:bg-[#F3ECE0] transition-all"
            >
              Pricing
            </Link>}

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-[#0A1428] text-white'
                  : 'text-[#0A1428] hover:bg-[#F3ECE0]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#E05A47]" />
              Dashboard
            </Link>

            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/account/privacy" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 text-sm font-semibold text-[#0A1428]">Account &amp; privacy</Link>
                  <div className="flex items-center justify-between px-4 py-2 bg-[#FAF7F2] rounded-xl border border-[#E8E2D8]">
                    <span className="text-xs font-semibold text-[#0A1428] truncate">{user.name}</span>
                    {ROLE_LABELS[user.role] && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_LABELS[user.role].color}`}>
                        {ROLE_LABELS[user.role].label}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { onSignOut(); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 rounded-xl font-bold border border-[#CBD5E1] text-[#0A1428] text-sm"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onOpenAuth('signin'); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 rounded-xl font-bold border border-[#CBD5E1] text-[#0A1428] text-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                    className="w-full btn btn-primary py-3 rounded-xl font-bold text-sm"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
