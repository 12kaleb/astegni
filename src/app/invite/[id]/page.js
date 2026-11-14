import InvitationPageClient from './invitation-page-client';

export const metadata = {
  title: 'Accept invitation',
  description: 'Accept an invitation to join Astegni.',
  robots: { index: false, follow: false },
};

export default async function InvitationPage({ params }) {
  const { id } = await params;
  return <InvitationPageClient invitationId={id} />;
}
