import { getPublicTutors } from '../lib/tutors';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const staticPages = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/tutors`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const tutors = await getPublicTutors();
  const tutorPages = tutors.map((tutor) => ({
    url: `${baseUrl}/tutors/${encodeURIComponent(tutor.id)}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...tutorPages];
}
