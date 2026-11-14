import AboutPageClient from './about-page-client';
import { getPublicTutors } from '../../lib/tutors';

export const metadata = {
  title: 'About Astegni',
  description: 'Learn how Astegni helps students and families find verified tutors in Ethiopia.',
};

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  let tutors = [];
  try {
    tutors = await getPublicTutors();
  } catch (error) {
    console.error('Unable to load tutor highlights on About page:', error);
  }
  return <AboutPageClient tutors={tutors} />;
}
