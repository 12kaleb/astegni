import { getPublicTutors } from '../../lib/tutors';
import TutorDirectoryPageClient from './tutor-directory-page-client';

export const metadata = {
  title: 'Find Tutors',
  description: 'Search verified tutors in Ethiopia by subject, experience, and hourly rate.',
};

export const dynamic = 'force-dynamic';

export default async function TutorsPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search;
  const initialSearchTerm = Array.isArray(search) ? search[0] : search || '';

  let tutors = [];
  try {
    tutors = await getPublicTutors();
  } catch (error) {
    console.error('Unable to load tutor directory:', error);
  }

  return <TutorDirectoryPageClient tutors={tutors} initialSearchTerm={initialSearchTerm} />;
}
