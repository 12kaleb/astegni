'use client';
import { createClient } from '../lib/supabase/client';
import React, { useState } from 'react';
import { X, GraduationCap, UserCheck, BookOpen, Sparkles, Check, ArrowRight, Lock, Mail, Phone, User } from 'lucide-react';

export default function AuthModal({ initialMode = 'signin', onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'signin' or 'register'
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('student'); // 'student' or 'tutor'
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Grade 11');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
  
    if (mode === 'register' && step < 3) {
      setStep(step + 1);
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const supabase = createClient();
  
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailOrPhone.trim(),
          password,
        });
  
        if (error) {
          setAuthError(error.message);
          return;
        }
  
        onLoginSuccess({
          name: data.user.user_metadata?.full_name || data.user.email,
          role: 'student',
        });
        onClose();
        return;
      }
  
      const { data, error } = await supabase.auth.signUp({
        email: emailOrPhone.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            full_name: fullName.trim(),
            requested_role: role,
            grade_level: selectedGrade,
          },
        },
      });
  
      if (error) {
        setAuthError(error.message);
        return;
      }
  
      if (data.session) {
        onLoginSuccess({ name: fullName.trim(), role });
        onClose();
        return;
      }
  
      setConfirmationPending(true);
      setSubmitted(true);
    } catch {
      setAuthError('Could not connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#E8E2D8] grid grid-cols-1 md:grid-cols-12 relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#0A1428] flex items-center justify-center transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Branded Dark Side (Figma Design Frame) */}
        <div className="md:col-span-5 bg-[#0A1428] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#E05A47]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#E05A47] flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">Astegni</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E05A47]/30 text-[#E05A47]">አስተኚ</span>
            </div>

            <div className="space-y-2 pt-4">
              <span className="badge badge-coral text-[10px]">
                {mode === 'signin' ? 'Welcome Back' : 'Join Astegni Community'}
              </span>
              <h2 className="text-2xl font-extrabold leading-tight text-white">
                {mode === 'signin'
                  ? 'Pick up where your learning left off.'
                  : 'The right support starts right here.'}
              </h2>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Connect with verified tutors in Addis Ababa & across Ethiopia. Guaranteed 1-on-1 progress and Grade 8 & 12 exam mastery.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 pt-2 text-xs text-[#CBD5E1]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E05A47]/20 text-[#E05A47] flex items-center justify-center text-[10px] font-bold">✓</div>
                <span>Top 1% Vetted & Background Checked Tutors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E05A47]/20 text-[#E05A47] flex items-center justify-center text-[10px] font-bold">✓</div>
                <span>Ethiopian National Curriculum Aligned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E05A47]/20 text-[#E05A47] flex items-center justify-center text-[10px] font-bold">✓</div>
                <span>Free 30-Minute Trial Session</span>
              </div>
            </div>
          </div>

          <div className="pt-8 text-[11px] text-[#64748B] border-t border-[#1E3352] relative z-10">
            Trusted by 15,000+ Ethiopian families
          </div>
        </div>

        {/* Right Form Side */}
        <div className="md:col-span-7 p-8 bg-[#FAF7F2] flex flex-col justify-between">
          <div>
            {/* Mode Switcher */}
            <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-4 mb-6">
              <div>
                <h3 className="font-extrabold text-xl text-[#0A1428]">
                  {mode === 'signin' ? 'Sign In to Account' : 'Create Your Account'}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {mode === 'signin' ? 'Access your dashboard & lessons' : `Step ${step} of 3 - ${step === 1 ? 'Select Role' : step === 2 ? 'Basic Info' : 'Preferences'}`}
                </p>
              </div>

              <div className="flex gap-1 bg-[#F3ECE0] p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => { setMode('signin'); setStep(1); }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === 'signin' ? 'bg-[#0A1428] text-white shadow-xs' : 'text-[#64748B]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('register'); setStep(1); }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === 'register' ? 'bg-[#0A1428] text-white shadow-xs' : 'text-[#64748B]'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-extrabold text-[#0A1428]">
  {confirmationPending ? 'Check your email' : 'Success! Logging you in...'}
</h4>
<p className="text-xs text-gray-500">
  {confirmationPending
    ? `We sent a confirmation link to ${emailOrPhone}. Open it to confirm your account.`
    : 'Redirecting to your Astegni Dashboard.'}
</p>
</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* SIGN IN FORM */}
                {mode === 'signin' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Email Or Phone No.</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. you@example.com"
                          value={emailOrPhone}
                          onChange={(e) => setEmailOrPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0A1428] focus:outline-none focus:border-[#E05A47]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-[#64748B]">Password</label>
                        <a href="#" className="text-[11px] font-bold text-[#E05A47] hover:underline">Forgot?</a>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0A1428] focus:outline-none focus:border-[#E05A47]"
                        />
                      </div>
                    </div>

                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full btn btn-primary py-3 rounded-xl font-bold shadow-md text-sm mt-2"
                    >
                      {isSubmitting ? 'Signing in…' : 'Sign In Now'}
                    </button>
                  </>
                )}

                {/* REGISTER MULTI-STEP FORM */}
                {mode === 'register' && step === 1 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-[#64748B]">Select Your Role:</label>
                    <div
                      onClick={() => setRole('student')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        role === 'student'
                          ? 'border-[#E05A47] bg-white shadow-md'
                          : 'border-[#CBD5E1] bg-[#FAF7F2] hover:border-[#94A3B8]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E05A47]/10 text-[#E05A47] flex items-center justify-center font-bold">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#0A1428]">I am a Student / Parent</h4>
                          <p className="text-[11px] text-[#64748B]">Looking for top private tutors for school subjects or matric prep.</p>
                        </div>
                      </div>
                      {role === 'student' && <div className="w-5 h-5 rounded-full bg-[#E05A47] text-white flex items-center justify-center text-xs">✓</div>}
                    </div>

                    <div
                      onClick={() => setRole('tutor')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        role === 'tutor'
                          ? 'border-[#E05A47] bg-white shadow-md'
                          : 'border-[#CBD5E1] bg-[#FAF7F2] hover:border-[#94A3B8]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0A1428]/10 text-[#0A1428] flex items-center justify-center font-bold">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#0A1428]">I Want to Teach (Tutor)</h4>
                          <p className="text-[11px] text-[#64748B]">Apply as a verified tutor, set your schedule & earn great income.</p>
                        </div>
                      </div>
                      {role === 'tutor' && <div className="w-5 h-5 rounded-full bg-[#E05A47] text-white flex items-center justify-center text-xs">✓</div>}
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full btn btn-primary py-3 rounded-xl font-bold shadow-md text-sm mt-4 flex items-center justify-center gap-2"
                    >
                      <span>Continue to Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {mode === 'register' && step === 2 && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Tadesse"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0A1428] focus:outline-none focus:border-[#E05A47]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1"> Email</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={emailOrPhone}
                          onChange={(e) => setEmailOrPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0A1428] focus:outline-none focus:border-[#E05A47]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#94A3B8]" />
                        <input
                          type="password"
                          required
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0A1428] focus:outline-none focus:border-[#E05A47]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-1/3 btn btn-outline py-2.5 rounded-xl font-bold text-xs"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="w-2/3 btn btn-primary py-2.5 rounded-xl font-bold text-xs"
                      >
                        Next: Preferences
                      </button>
                    </div>
                  </>
                )}

                {mode === 'register' && step === 3 && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#64748B] mb-1">Grade Level / Status</label>
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-medium text-[#0A1428] focus:outline-none focus:border-[#E05A47]"
                      >
                        <option value="Grade 8 Exam Prep">Grade 8 Ministry Exam</option>
                        <option value="Grade 9-10 Secondary">Grade 9 - 10 High School</option>
                        <option value="Grade 11 Prep">Grade 11 Preparatory</option>
                        <option value="Grade 12 National Exam">Grade 12 Ethiopian Matric Exam</option>
                        <option value="University / Adult">University / Adult Language</option>
                      </select>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                      <span className="font-bold block">✨ Free Gift Included:</span>
                      <p className="text-[11px]">Registering gets you 1 free 30-minute diagnostic session with top Astegni tutors.</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-1/3 btn btn-outline py-2.5 rounded-xl font-bold text-xs"
                      >
                        Back
                      </button>
                      <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-2/3 btn btn-primary py-2.5 rounded-xl font-bold text-xs shadow-md"
                      >
                        {isSubmitting ? 'Creating account…' : 'Complete Registration'}
                      </button>
                    </div>
                  </>
                )}

              </form>
            )}
          </div>

          {/* Bottom footnote */}
          <div className="pt-4 text-center border-t border-[#E8E2D8] mt-6">
            <p className="text-[11px] text-[#64748B]">
              By continuing, you agree to Astegni&apos;s <a href="#" className="underline font-semibold">Terms</a> and <a href="#" className="underline font-semibold">Privacy Policy</a>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}