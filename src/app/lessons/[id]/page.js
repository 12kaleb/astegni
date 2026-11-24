import LessonSessionClient from './lesson-session-client';

export const metadata = {
  title: 'Live Lesson',
  description: 'Your active tutoring session.',
  robots: { index: false, follow: false },
};

export default function LessonSessionPage() {
  return <LessonSessionClient />;
}
