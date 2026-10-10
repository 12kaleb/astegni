'use client';

import React from 'react';
import { GraduationCap, Heart, Mail, Phone, MapPin, Globe, Share2, MessageCircle, Send } from 'lucide-react';

export default function Footer({ setActiveTab, onOpenAuth }) {
  return (
    <footer className="bg-[#0A1428] text-white pt-16 pb-12 border-t border-[#1E3352]">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1E3352]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E05A47] flex items-center justify-center text-white shadow-lg shadow-[#E05A47]/40">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white">Astegni</span>
                <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-[#E05A47]/20 text-[#E05A47]">አስተኚ</span>
              </div>
            </div>

            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-sm">
              Connecting students across Ethiopia with top 1% verified private tutors. Elevate grades, build confidence, and unlock lifelong potential.
            </p>

            <div className="flex items-center gap-3 text-sm text-[#94A3B8] pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E05A47]" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E05A47]" />
                <span>+251 911 000 000</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <a href="#" className="w-9 h-9 rounded-full bg-[#132238] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#E05A47] transition-all" title="Website">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#132238] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#E05A47] transition-all" title="Telegram Community">
                <Send className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#132238] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#E05A47] transition-all" title="Astegni Support">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#132238] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#E05A47] transition-all" title="Share">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>


          {/* Column 2: Subjects */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Popular Subjects</h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li><button onClick={() => setActiveTab('tutors')} className="hover:text-[#E05A47] transition-colors">Mathematics & Algebra</button></li>
              <li><button onClick={() => setActiveTab('tutors')} className="hover:text-[#E05A47] transition-colors">Physics & Chemistry</button></li>
              <li><button onClick={() => setActiveTab('tutors')} className="hover:text-[#E05A47] transition-colors">Amharic & English Languages</button></li>
              <li><button onClick={() => setActiveTab('tutors')} className="hover:text-[#E05A47] transition-colors">Grade 8 & 12 Exam Prep</button></li>
              <li><button onClick={() => setActiveTab('tutors')} className="hover:text-[#E05A47] transition-colors">Python Coding & ICT</button></li>
              <li><button onClick={() => setActiveTab('tutors')} className="hover:text-[#E05A47] transition-colors">Biology & Life Sciences</button></li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Explore Platform</h4>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li><button onClick={() => setActiveTab('tutors')} className="hover:text-[#E05A47] transition-colors">Browse Verified Tutors</button></li>
              <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-[#E05A47] transition-colors">Student Dashboard</button></li>
              <li><button onClick={() => onOpenAuth('register')} className="hover:text-[#E05A47] transition-colors">Become a Tutor</button></li>
              <li><button onClick={() => setActiveTab('home')} className="hover:text-[#E05A47] transition-colors">Parent Testimonials</button></li>
              <li><button onClick={() => setActiveTab('home')} className="hover:text-[#E05A47] transition-colors">Pricing & Subscriptions</button></li>
              <li><button onClick={() => onOpenAuth('signin')} className="hover:text-[#E05A47] transition-colors">Sign In / Register</button></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Stay Informed</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Get learning resources, study tips, and tutor discounts directly to your inbox.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3.5 py-2.5 rounded-xl bg-[#132238] border border-[#1E3352] text-white text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#E05A47]"
              />
              <button className="btn btn-primary btn-sm py-2.5 w-full font-bold text-xs">
                Subscribe Newsletter
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-[#64748B]">
          <p>© {new Date().getFullYear()} Astegni Technologies (አስተኚ). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Safety Guidelines</a>
            <a href="#" className="hover:text-white transition-colors">Support Center</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
