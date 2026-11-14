export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return <main className="container max-w-3xl py-12 text-slate-700">
    <h1 className="text-3xl font-extrabold text-[#0A1428]">Terms of Service</h1>
    <p className="mt-2 text-sm text-slate-500">Draft for legal review · Updated November 14, 2026</p>
    <div className="mt-8 space-y-6 text-sm leading-7">
      <p>Astegni helps students and tutors discover one another and organize learning. These terms are a working product draft and must be reviewed by qualified counsel before being treated as a final agreement.</p>
      <section><h2 className="font-bold text-[#0A1428]">Accounts and eligibility</h2><p>Provide accurate account information and keep your sign-in details secure. Tutors must submit accurate qualifications and may not claim verification before Astegni confirms their documents. Students under 18 must use the service with parent or guardian authorization.</p></section>
      <section id="safe-conduct"><h2 className="font-bold text-[#0A1428]">Safe conduct</h2><p>Use the service for learning. Do not harass, threaten, exploit, discriminate against, or attempt to defraud another user. Do not share another person’s private information or upload documents you are not authorized to provide. Use Report and Block to flag safety concerns.</p></section>
      <section><h2 className="font-bold text-[#0A1428]">Tutoring relationship</h2><p>Profiles and listed prices are supplied by tutors. Astegni does not currently process lesson payments or guarantee a particular learning outcome. Students and tutors should agree on lesson details before meeting.</p></section>
      <section><h2 className="font-bold text-[#0A1428]">Account action and contact</h2><p>We may review reports and take proportionate action for safety or misuse. Publish the operator’s verified support contact here before launch so users can ask about their account or these terms.</p></section>
    </div>
  </main>;
}
