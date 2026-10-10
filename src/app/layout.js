import "./globals.css";

export const metadata = {
  title: "Astegni | Find Expert Tutors & Empower Learning",
  description: "Astegni connects Ethiopian students and families with top-rated private tutors for personalized academic excellence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


