import DashboardPageClient from './dashboard-page-client';

export const metadata = {
  title: 'Dashboard',
  description: 'Manage your Astegni tutoring, lessons, and learning activity.',
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
