'use client';

import React, { useState ,useEffect} from 'react';
import { createClient } from '../lib/supabase/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HomeView from '../views/HomeView';
import TutorDirectoryView from '../views/TutorDirectoryView';
import AboutView from '../views/AboutView';
import DashboardView from '../views/DashboardView';
import TutorProfileModal from '../components/TutorProfileModal';
import AuthModal from '../components/AuthModal';

export default function Page() {
  const [activeTab, setActiveTab] = useState('home');
  const [currency, setCurrency] = useState('ETB'); // 'ETB' or 'USD'
  const [directorySearchTerm, setDirectorySearchTerm] = useState('');
  // Modals
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [authModalMode, setAuthModalMode] = useState(null); // 'signin', 'register', or null
  const [user, setUser] = useState(null);
  const [authNotice, setAuthNotice] = useState('');

  const handleOpenAuth = (mode = 'signin') => {
    setAuthModalMode(mode);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
  
    if (error) {
      console.error('Sign out failed:', error.message);
      return;
    }
  
    setUser(null);
    setActiveTab('home');
  };

  const handleNavigate = (tab) => {
    if (tab === 'dashboard' && !user) {
      setAuthModalMode('signin');
      return;
    }
  
    setActiveTab(tab);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  useEffect(() => {
    
    const confirmationStatus = new URLSearchParams(
      window.location.search
    ).get('auth');
    
    const messages = {
      confirmed: 'Email confirmed. Your profile is loading.',
      'confirmation-error':
        'We could not confirm your email. Check that the link is complete and has not expired.',
    };
    
    const confirmationMessage = messages[confirmationStatus];
    const noticeTimer = confirmationMessage
      ? window.setTimeout(() => setAuthNotice(confirmationMessage), 0)
      : null;
    const supabase = createClient();
    let isMounted = true;
    let latestRequest = 0;
  
    const roleNames = {
      STUDENT: 'student',
      TUTOR: 'tutor',
      ADMIN: 'admin',
      SUPPORT_SPECIALIST: 'team',
      MANAGER: 'manager',
    };
  
    const syncProfile = async (session) => {
      const requestId = ++latestRequest;
  
      if (!session?.user) {
        setUser(null);
        return;
      }
  
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'POST',
          cache: 'no-store',
        });
        const { profile } = await response.json();
  
        if (!response.ok) {
          if (isMounted && requestId === latestRequest) setUser(null);
          return;
        }
  
        if (isMounted && requestId === latestRequest) {
          setUser({
            name: profile.name,
            role: roleNames[profile.role] || 'student',
          });
        }
      } catch {
        if (isMounted && requestId === latestRequest) setUser(null);
      }
    };
  
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncProfile(session);
    });
  
    return () => {
      if (noticeTimer !== null) {
        window.clearTimeout(noticeTimer);
      }
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2] text-[#0A1428] font-sans selection:bg-[#E05A47] selection:text-white">
      
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        currency={currency}
        setCurrency={setCurrency}
        user={user}
      />

{authNotice && (
  <div
    role="status"
    className="mx-auto mt-4 max-w-7xl rounded-xl border border-[#E8E2D8] bg-white px-4 py-3 text-sm text-[#0A1428]"
  >
    {authNotice}
  </div>
)}

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            setActiveTab={setActiveTab}
            onSelectTutor={(tutor) => setSelectedTutor(tutor)}
            onOpenAuth={handleOpenAuth}
            currency={currency}
            onSearchTutors={(query) => {
              setDirectorySearchTerm(query);
              setActiveTab('tutors');
           }}
          />
        )}

        {activeTab === 'tutors' && (
          <TutorDirectoryView
            onSelectTutor={(tutor) => setSelectedTutor(tutor)}
            currency={currency}
            initialSearchTerm={directorySearchTerm}
          />
        )}

        {activeTab === 'about' && (
          <AboutView
            setActiveTab={setActiveTab}
            onOpenAuth={handleOpenAuth}
          />
        )}

{activeTab === 'dashboard' && (
  user ? (
    <DashboardView
      user={user}
      currency={currency}
      onFindTutor={() => setActiveTab('tutors')}
      onJoinLesson={(lesson) =>
        window.open(lesson.meetingUrl, '_blank', 'noopener,noreferrer')
      }
    />
  ) : (
    <div className="max-w-xl mx-auto my-16 p-8 text-center bg-white rounded-2xl border border-[#E8E2D8]">
      <h2 className="text-xl font-bold text-[#0A1428]">
        Sign in to view your dashboard
      </h2>
      <button
        onClick={() => handleOpenAuth('signin')}
        className="btn btn-primary mt-5 px-6 py-3 rounded-xl font-bold"
      >
        Sign In
      </button>
    </div>
  )
)}
      </main>


      {/* Global Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
      />

      {/* Tutor Profile & Booking Modal */}
      {selectedTutor && (
        <TutorProfileModal
          tutor={selectedTutor}
          onClose={() => setSelectedTutor(null)}
          currency={currency}
        />
      )}

      {/* Sign In & Multi-step Onboarding Modal */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

    </div>
  );
}
