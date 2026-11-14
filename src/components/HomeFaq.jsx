'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: 'How does Astegni match my child with the right tutor?',
    a: 'Search the tutor directory by subject and review each tutor’s verified profile, experience, languages, and listed hourly rate.',
  },
  {
    q: 'Are all Astegni tutors background-checked and qualified?',
    a: 'Only tutors whose profiles have been marked verified are shown in the directory.',
  },
  {
    q: 'What is the cost of hiring a tutor on Astegni?',
    a: 'Hourly rates are shown from currently verified tutors who are open to students. Fixed monthly packages are not currently configured.',
  },
  {
    q: 'Can we schedule in-person home visits in Addis Ababa?',
    a: 'Tutors list the modes they offer in their profiles. Check an individual profile for current availability and session options.',
  },
];

export default function HomeFaq() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section className="py-8 bg-white border-t border-[#E8E2D8]">
      <div className="container max-w-3xl">
        <div className="text-center space-y-3 mb-10">
          <span className="badge badge-coral">Frequently Asked Questions</span>
          <h2 className="text-3xl font-extrabold text-[#0A1428]">Questions answered.</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.q} className="border border-[#E8E2D8] rounded-2xl overflow-hidden bg-[#FAF7F2] transition-colors">
              <button
                type="button"
                aria-expanded={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full p-5 text-left font-bold text-base text-[#0A1428] flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                {openIndex === index ? <ChevronUp aria-hidden="true" className="w-5 h-5 text-[#E05A47]" /> : <ChevronDown aria-hidden="true" className="w-5 h-5 text-gray-600" />}
              </button>
              {openIndex === index && <div className="px-5 pb-5 text-xs text-[#475569] leading-relaxed border-t border-[#E8E2D8]/60 pt-3">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
