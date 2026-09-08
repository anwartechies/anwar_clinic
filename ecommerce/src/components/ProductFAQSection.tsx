"use client";

import React from "react";
import { ArrowDown } from "lucide-react";

export interface ProductFAQItem {
  id: string;
  question: string;
  answer: string;
}

export const PRODUCT_FAQ_LIST: ProductFAQItem[] = [
  {
    id: "faq-1",
    question: "When will I see results?",
    answer:
      "Hair growth is a gradual process and takes time. Consistent use is required to see a visible improvement over time. Most individuals notice a reduction in hair shedding within 2-3 months, and new, fine hair growth becomes noticeable around month 3. The density gradually improves over the period of 3-6 months. The results depend on the severity of hair loss, adherence to the routine and individual response to the treatment.",
  },
  {
    id: "faq-2",
    question: "Is daily use required?",
    answer:
      "For best results, consistency is important; except for Gemline D3, the rest of the products are to be used daily. You can consult a doctor for the exact usage instructions. Irregular or inconsistent use will reduce treatment effectiveness and delay the results.",
  },
  {
    id: "faq-3",
    question: "What happens if I stop the treatment?",
    answer:
      "Male pattern hair loss is a progressive disorder. Stopping the treatment gradually reverses the obtained results and may resume hair shedding. This kit is designed especially for genetic hair loss and combines topical scalp therapies, follicle serum, and nutritional support supplements for maximum results.",
  },
  {
    id: "faq-4",
    question: "What are the side effects of Finasteride?",
    answer:
      "Oral finasteride may cause loss of libido, sexual dysfunction and reduced ejaculatory volume in a small percentage of users. These effects usually resolve once the treatment is discontinued. To be used under a doctor’s guidance only.",
  },
  {
    id: "faq-5",
    question: "Is this routine suitable for everyone?",
    answer:
      "This kit is for adult men with male pattern hair loss and is generally safe. It may not be suitable for individuals with any underlying medical conditions, allergies to minoxidil, or those taking other medications. Consult a healthcare professional and disclose your complete medical history before starting treatment to determine whether this routine is suitable for you.",
  },
  {
    id: "faq-6",
    question: "What are the side effects of Minoxidil?",
    answer:
      "Topical minoxidil can cause temporary scalp irritation, dryness, itching or increased shedding during the initial weeks of the treatment (shock loss). This is an expected part of the treatment process, and the shedding usually resolves as healthy new hairs enter the anagen growth cycle.",
  },
];

interface ProductFAQSectionProps {
  items?: { id?: string; question: string; answer: string }[];
  title?: string;
  subtitle?: string;
}

export default function ProductFAQSection({
  items,
  title = "Frequently Asked Questions",
  subtitle = "EXPERT ANSWERS",
}: ProductFAQSectionProps = {}) {
  const faqsToRender = items && items.length > 0 ? items : PRODUCT_FAQ_LIST;

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
      <div className="qht-large-container">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
          
          {/* Left Column: Heading & Down Arrow Emblem */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5c685f] block mb-2">
                {subtitle}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1b221d] tracking-tight leading-tight">
                {title}
              </h2>
            </div>

            {/* Down Arrow Hexagonal / Rounded Card */}
            <div className="w-14 h-14 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-700 bg-white shadow-2xs">
              <ArrowDown className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>

          {/* Right Column: Clean Open Q&A List with Dividers */}
          <div className="lg:col-span-8 divide-y divide-gray-200 border-t border-b border-gray-200">
            {faqsToRender.map((faq, idx) => (
              <div key={faq.id || idx} className="py-6 sm:py-7 space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-[#1b221d] leading-snug">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-[13.5px] text-[#5c685f] leading-relaxed font-normal">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
