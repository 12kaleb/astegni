import "./globals.css";
import AppShell from '../components/AppShell';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Astegni | Find Expert Tutors & Empower Learning',
    template: '%s | Astegni',
  },
  description: 'Find verified tutors in Ethiopia, compare subjects and rates, and manage lessons with Astegni.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}


