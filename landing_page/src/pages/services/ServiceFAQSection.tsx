"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface FAQItem {
  id?: number;
  question: string;
  answer: string;
}

interface ServiceFAQSectionProps {
  title?: string;
  faqs?: FAQItem[];
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 1,
    question: "Is Hair Transplant Repair painful?",
    answer: "Corrective Hair Transplants are painless as they are performed under local anesthesia.",
  },
  {
    id: 2,
    question: "How long does Hair Transplant Repair last?",
    answer: `The results are permanent when performed by expert surgeons like those at ${COMPANY_NAME} Clinic.`,
  },
  {
    id: 3,
    question: "Can failed hair transplants be corrected completely?",
    answer: `Yes, most of the failed procedures can be corrected at ${COMPANY_NAME} Clinic with our advanced microscopic techniques and patented SAVA implanters.`,
  },
  {
    id: 4,
    question: `How is ${COMPANY_NAME} better for corrective hair transplant?`,
    answer: `${COMPANY_NAME} has expert surgeons, advanced technology, minimal out-of-body graft time (<2 hours), and higher success rates exceeding 98%.`,
  },
];

export default function ServiceFAQSection({
  title = "Hair Transplant Repair",
  faqs = DEFAULT_FAQS,
}: ServiceFAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-200/80">
      <div className="qht-large-container">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Heading + Vector Logo Graphic */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.18]">
                {title.toLowerCase().includes("faq") || title.toLowerCase().includes("question")
                  ? title
                  : `FAQ on ${title}`}
              </h2>
            </div>

            {/* Circular Root Vector Graphic */}

          </div>

          {/* Right Column: Animated Accordion Items */}
          <div className="lg:col-span-7 divide-y divide-gray-200/90 border-t border-b border-gray-200/90">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;

              return (
                <div key={faq.id ?? idx} className="transition-colors">
                  {/* Accordion Trigger Head */}
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full py-5 sm:py-6 flex items-center justify-between text-left group focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-semibold text-nexgen-veryDarkHeader group-hover:text-nexgen-primaryGold transition-colors pr-4 leading-snug">
                      {faq.question}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-gray-500 group-hover:text-nexgen-primaryGold transition-transform duration-300 ${isOpen ? "rotate-180 text-nexgen-primaryGold" : "rotate-0"
                        }`}
                    >
                      <ChevronDown className="w-5 h-5 stroke-[2]" />
                    </div>
                  </button>

                  {/* Accordion Animated Body (CSS Grid Rows for fluid height transition) */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen
                      ? "grid-rows-[1fr] opacity-100 pb-5 sm:pb-6"
                      : "grid-rows-[0fr] opacity-0 pb-0"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal pr-8">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
