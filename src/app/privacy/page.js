export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return <main className="container max-w-3xl py-12 text-slate-700">
    <h1 className="text-3xl font-extrabold text-[#0A1428]">Privacy Policy</h1>
    <p className="mt-2 text-sm text-slate-500">Draft for legal review · Updated November 14, 2026</p>
    <div className="mt-8 space-y-6 text-sm leading-7">
      <p>This draft describes the current Astegni product data flows. The operator’s legal name, verified contact details, retention periods, international transfer arrangements, and final lawful bases must be completed and reviewed before launch.</p>
      <section><h2 className="font-bold text-[#0A1428]">Information used</h2><p>Astegni stores account and profile details, lesson and assignment records, support requests, safety reports, and security logs. Tutors may submit national ID and degree evidence for verification. Those documents are private and accessible to authorized reviewers only.</p></section>
      <section><h2 className="font-bold text-[#0A1428]">Why information is used</h2><p>Information supports account access, tutor discovery, learning coordination, safety review, fraud prevention, and platform operation. We do not currently sell user data or process lesson payments.</p></section>
      <section><h2 className="font-bold text-[#0A1428]">Retention and choices</h2><p>Set and publish a documented retention schedule before launch. You may contact Astegni to request access, correction, or deletion, subject to legal and safety obligations. Verification documents should be deleted when no longer needed for the review purpose.</p></section>
      <section><h2 className="font-bold text-[#0A1428]">Children and guardians</h2><p>For students who are minors, parent or guardian authorization and age-aware safeguards are required. Astegni must verify that authorization before enabling tutoring interactions. Contact support to arrange consent review.</p></section>
      <section><h2 className="font-bold text-[#0A1428]">Legal reference</h2><p>For users in Ethiopia, review the <a className="underline" href="https://justice.gov.et/en/law/personal-data-protection-proclamation/" target="_blank" rel="noreferrer">Personal Data Protection Proclamation No. 1321/2024</a> with qualified local counsel.</p></section>
    </div>
  </main>;
}
