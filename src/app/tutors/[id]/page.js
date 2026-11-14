import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getPublicTutorById } from '../../../lib/tutors';
import TutorProfilePageClient from './tutor-profile-page-client';

const getTutor = cache(getPublicTutorById);

export async function generateMetadata({ params }) {
  const { id } = await params;
  const tutor = await getTutor(id);
  if (!tutor) return { title: 'Tutor not found' };

  const subjects = tutor.subjects.slice(0, 3).join(', ');
  return {
    title: `${tutor.name} · ${tutor.title || 'Verified Tutor'}`,
    description: tutor.bio || `${tutor.name} is a verified Astegni tutor${subjects ? ` teaching ${subjects}` : ''}. View their experience, languages, and hourly rate.`,
    openGraph: { title: `${tutor.name} | Astegni`, description: tutor.bio || `View ${tutor.name}'s verified tutor profile on Astegni.` },
  };
}

export default async function TutorProfilePage({ params }) {
  const { id } = await params;
  const tutor = await getTutor(id);
  if (!tutor) notFound();
  return <TutorProfilePageClient tutor={tutor} />;
}
