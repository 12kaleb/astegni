import { getPublicTutors } from '../lib/tutors';
import HomePageClient from './home-page-client';

export const metadata = {
  title: 'Find a Tutor',
  description: 'Discover verified tutors in Ethiopia and find support for the subjects you are learning.',
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  let tutors = [];
  try {
    tutors = await getPublicTutors();
  } catch (error) {
    console.error('Unable to load homepage tutors:', error);
  }

  return <HomePageClient tutors={tutors} />;
}
