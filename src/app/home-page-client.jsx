'use client';

import { useRouter } from 'next/navigation';
import HomeView from '../views/HomeView';
import { useAppShell } from '../components/AppShell';

export default function HomePageClient({ tutors }) {
  const router = useRouter();
  const { navigate, openAuth, selectTutor, selectedTutorIds } = useAppShell();

  return (
    <HomeView
      initialTutors={tutors}
      setActiveTab={navigate}
      onSelectTutor={selectTutor}
      selectedTutorIds={selectedTutorIds}
      onOpenAuth={openAuth}
      onSearchTutors={(query) => {
        const params = new URLSearchParams();
        if (query.trim()) params.set('search', query.trim());
        const queryString = params.toString();
        router.push(`/tutors${queryString ? `?${queryString}` : ''}`);
      }}
    />
  );
}
