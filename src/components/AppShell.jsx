'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal from './AuthModal';

const AppShellContext = createContext(null);

const ROLE_NAMES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
  SUPPORT_SPECIALIST: 'support_specialist',
  MANAGER: 'manager',
};

function pathForTab(tab) {
  return ({ home: '/', tutors: '/tutors', about: '/about', dashboard: '/dashboard' })[tab] || '/';
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) throw new Error('useAppShell must be used inside AppShell.');
  return context;
}

export default function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalMode, setAuthModalMode] = useState(null);
  const [authNotice, setAuthNotice] = useState('');
  const [selectedTutorIds, setSelectedTutorIds] = useState([]);
  const [selectionNotice, setSelectionNotice] = useState('');
  const [selectionNoticeType, setSelectionNoticeType] = useState('success');
  const [selectingTutorId, setSelectingTutorId] = useState(null);

  const setAuthQuery = useCallback((mode, navigation = 'replace') => {
    const params = new URLSearchParams(window.location.search);
    if (mode) params.set('auth', mode);
    else params.delete('auth');
    const query = params.toString();
    router[navigation](`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  }, [pathname, router]);

  const openAuth = useCallback((mode = 'signin') => {
    setAuthModalMode(mode);
    setAuthQuery(mode, 'push');
  }, [setAuthQuery]);

  const closeAuth = useCallback(() => {
    setAuthModalMode(null);
    setAuthQuery(null);
  }, [setAuthQuery]);

  const navigate = useCallback((tab) => router.push(pathForTab(tab)), [router]);

  const handleSelectTutor = useCallback(async (tutor) => {
    if (user?.role !== 'student') {
      setSelectionNoticeType('error');
      setSelectionNotice(user ? 'Only student accounts can select tutors.' : 'Sign in with a student account to select this tutor.');
      if (!user) openAuth('signin');
      return;
    }
    if (selectedTutorIds.includes(tutor.id)) {
      setSelectionNoticeType('success');
      setSelectionNotice(`${tutor.name} is already in your selected tutors.`);
      return;
    }

    setSelectingTutorId(tutor.id);
    setSelectionNotice('');
    try {
      const response = await fetch('/api/students/tutors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId: tutor.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not select this tutor.');
      setSelectedTutorIds((current) => current.includes(tutor.id) ? current : [...current, tutor.id]);
      setSelectionNoticeType('success');
      setSelectionNotice(`${tutor.name} selected. They can now see you in their student list.`);
    } catch (error) {
      setSelectionNoticeType('error');
      setSelectionNotice(error.message || 'Could not select this tutor. Please try again.');
    } finally {
      setSelectingTutorId(null);
    }
  }, [openAuth, selectedTutorIds, user]);

  const handleLoginSuccess = useCallback((userData) => {
    setUser(userData);
    closeAuth();
    router.push('/dashboard');
  }, [closeAuth, router]);

  const updateTimeZone = useCallback((timeZone) => {
    setUser((current) => current ? { ...current, timeZone } : current);
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out failed:', error.message);
      return;
    }
    setUser(null);
    setSelectedTutorIds([]);
    router.push('/');
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let latestRequest = 0;

    async function syncProfile(session) {
      const requestId = ++latestRequest;
      if (!session?.user) {
        if (active && requestId === latestRequest) {
          setUser(null);
          setAuthLoading(false);
        }
        return;
      }

      try {
        const response = await fetch('/api/auth/profile', { method: 'POST', cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load your profile.');
        if (active && requestId === latestRequest) {
          setUser({ name: result.profile.name, role: ROLE_NAMES[result.profile.role] || 'student', avatarUrl: result.profile.avatarUrl, timeZone: result.profile.timeZone });
          setAuthLoading(false);
        }
      } catch (error) {
        console.error('Profile sync failed:', error);
        if (active && requestId === latestRequest) {
          setUser(null);
          setAuthLoading(false);
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncProfile(session);
    });

    const syncAuthQuery = () => {
      const status = new URLSearchParams(window.location.search).get('auth');
      const mode = status;
      setAuthModalMode(mode === 'register' ? 'register' : mode === 'signin' ? 'signin' : null);
      setAuthNotice(status === 'confirmed' ? 'Email confirmed. Your profile is loading.'
        : status === 'confirmation-error' ? 'We could not confirm your email. Check that the link is complete and has not expired.' : '');
    };
    syncAuthQuery();
    window.addEventListener('popstate', syncAuthQuery);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener('popstate', syncAuthQuery);
    };
  }, []);

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('auth');
    const mode = status;
    if (mode !== 'signin' && mode !== 'register') setAuthModalMode(null);
    if (status !== 'confirmed' && status !== 'confirmation-error') setAuthNotice('');
  }, [pathname]);

  useEffect(() => {
    if (user?.role !== 'student') {
      setSelectedTutorIds([]);
      return;
    }
    let active = true;
    fetch('/api/students/tutors', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : { tutorIds: [] })
      .then((result) => {
        if (active) setSelectedTutorIds(Array.isArray(result.tutorIds) ? result.tutorIds : []);
      })
      .catch((error) => {
        console.error('[app shell] selected tutors failed to load:', error);
        if (active) setSelectedTutorIds([]);
      });
    return () => { active = false; };
  }, [user?.role]);

  const activeTab = pathname.startsWith('/tutors') ? 'tutors'
    : pathname === '/about' ? 'about'
      : pathname === '/dashboard' ? 'dashboard' : 'home';

  const contextValue = useMemo(() => ({
    user,
    updateTimeZone,
    authLoading,
    openAuth,
    navigate,
    selectedTutorIds,
    selectTutor: handleSelectTutor,
    selectingTutorId,
  }), [user, updateTimeZone, authLoading, openAuth, navigate, selectedTutorIds, handleSelectTutor, selectingTutorId]);

  return (
    <AppShellContext.Provider value={contextValue}>
      <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2] text-[#0A1428] font-sans selection:bg-[#E05A47] selection:text-white">
        <Navbar
          activeTab={activeTab}
          onOpenAuth={openAuth}
          onSignOut={handleSignOut}
          user={user}
          authLoading={authLoading}
        />
        {authNotice && <div role="status" className="mx-auto mt-4 max-w-7xl rounded-xl border border-[#E8E2D8] bg-white px-4 py-3 text-sm text-[#0A1428]">{authNotice}</div>}
        {selectionNotice && (
          <div role={selectionNoticeType === 'error' ? 'alert' : 'status'} aria-live="polite" className={`mx-auto mt-3 max-w-7xl rounded-xl border px-4 py-3 text-sm font-medium ${selectionNoticeType === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
            {selectionNotice}
          </div>
        )}
        <main className="flex-1">{children}</main>
        <Footer setActiveTab={navigate} onOpenAuth={openAuth} />
        {authModalMode && (
          <AuthModal
            initialMode={authModalMode}
            onClose={closeAuth}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </AppShellContext.Provider>
  );
}
