"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const COST_FAQ_ITEMS: FAQItem[] = [
  {
    id: "01",
    question: "What is the expected hair transplant cost in India?",
    answer:
      `Hair restoration costs depend primarily on the number of grafts required and the surgical technique selected. At ${COMPANY_NAME}, procedure packages start from ₹50,000 for FUE (5,000–6,000 grafts), ₹75,000 for Bio-Enhanced FUE, ₹1,00,000 for DHI, and ₹1,25,000 for Premium Sapphire DHI, with transparent all-inclusive billing and zero hidden charges.`,
  },
  {
    id: "02",
    question: `How are per-graft prices determined at ${COMPANY_NAME}?`,
    answer:
      `Per-graft pricing reflects the precision instrumentation, specialized implanters, and surgeon involvement required. At ${COMPANY_NAME}, our transparent per-graft pricing starts from ₹10/graft for standard FUE, ₹15/graft for Bio-Enhanced FUE, ₹20/graft for DHI (Direct Hair Implantation), and ₹25/graft for Premium Sapphire DHI.`,
  },
  {
    id: "03",
    question: "Which hair restoration technique provides the most natural outcome?",
    answer:
      `Naturalness depends on surgeon artistry, hairline geometry, and follicle handling. Micro-FUE and Direct Implantation allow precise control over graft insertion angle, depth, and direction, delivering seamlessly blended, undetectable results.`,
  },
  {
    id: "04",
    question: "Are transplanted hair follicles truly permanent?",
    answer:
      "Yes. Follicles extracted from the safe occipital donor zone are biologically immune to DHT (the hormone responsible for genetic balding). Once implanted, they maintain their lifelong growth cycle.",
  },
  {
    id: "05",
    question: `Are flexible EMI payment options available at ${COMPANY_NAME}?`,
    answer:
      `Yes, ${COMPANY_NAME} provides 0% interest EMI financing plans across 3 to 24 months through partnered healthcare financial institutions to ensure smooth accessibility.`,
  },
];

interface FAQSectionProps {
  items?: FAQItem[];
  title?: string;
}

export default function FAQSection({
  items = COST_FAQ_ITEMS,
  title = "Frequently Asked Questions",
}: FAQSectionProps) {
  const [openId, setOpenId] = useState<string>("01");

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? "" : id);
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Section Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl  font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight">
            {title}
          </h2>
        </div>

        {/* Clean Accordion List */}
        <div className="divide-y divide-gray-200">
          {items.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div key={faq.id} className="py-5 sm:py-6 transition-colors">
                {/* Question Trigger */}
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer select-none focus:outline-none"
                >
                  <div className="flex items-baseline gap-5 sm:gap-7 pr-4">
                    {/* Number 01, 02, etc. */}
                    <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold tracking-tight flex-shrink-0">
                      {faq.id}
                    </span>

                    {/* Question Text */}
                    <span className="text-sm sm:text-2xl font-[500] text-nexgen-veryDarkHeader group-hover:text-nexgen-primaryGold transition-colors leading-snug">
                      {faq.question}
                    </span>
                  </div>

                  {/* Smooth Rotating Chevron */}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-300 ease-out ${isOpen ? "rotate-180 text-nexgen-primaryGold" : "text-gray-400 group-hover:text-gray-700"
                      }`}
                  />
                </button>

                {/* Smooth Animated Answer Container */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${isOpen
                    ? "grid-rows-[1fr] opacity-100 mt-3"
                    : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-[18.5px] text-nexgen-serviceInnerCard leading-relaxed pl-8 sm:pl-10 font-normal">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
