'use client';

import AboutView from '../../views/AboutView';
import { useAppShell } from '../../components/AppShell';

export default function AboutPageClient({ tutors }) {
  const { navigate, openAuth } = useAppShell();
  return <AboutView tutors={tutors} setActiveTab={navigate} onOpenAuth={openAuth} />;
}
