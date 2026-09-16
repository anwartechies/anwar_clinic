"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SERVICES_ACCORDION } from "@/data/qhtData";
import { ChevronDown, ArrowRight } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface ServicesAccordionProps {
  onOpenConsultation: () => void;
}

export default function ServicesAccordion({
  onOpenConsultation,
}: ServicesAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-white">
      <div className="qht-container">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-black/50">
          <h2 className="text-3xl sm:text-6xl font-[500] text-nexgen-veryDarkHeader">
            Comprehensive Restoration Services
          </h2>
          <span className="w-10 h-10 rounded-lg border-[0.1px] border-black font-bold flex items-center justify-center text-base">
            2
          </span>
        </div>

        {/* Intro Text */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-10">
          <h3 className="md:col-span-6 text-xl sm:text-3xl font-[400] text-nexgen-veryDarkHeader leading-snug">
            Tailored Medical & Surgical Therapies for Every Stage of Hair Loss
          </h3>
          <p className="md:col-span-6 text-xs sm:text-lg text-gray-600 leading-relaxed">
            At {COMPANY_NAME}, our clinical offerings are designed to restore natural density, youthful framing, and lasting confidence through evidence-based surgical precision.
          </p>
        </div>

        {/* Clean Minimal Accordion List matching FAQ styling */}
        <div className="divide-y divide-gray-200 max-w-7xl mx-auto border-t border-b border-gray-200">
          {SERVICES_ACCORDION.map((service, idx) => {
            const isOpen = openIndex === idx;
            const formattedNum = service.id < 10 ? `0${service.id}` : `${service.id}`;

            return (
              <div key={service.id} className="py-5 sm:py-6 transition-colors">
                {/* Trigger Row */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer select-none focus:outline-none"
                >
                  <div className="flex items-center gap-4 sm:gap-6 pr-4">
                    {/* Number Badge */}
                    <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold tracking-tight flex-shrink-0">
                      {formattedNum}
                    </span>

                    {/* Service Title */}
                    <span className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader group-hover:text-nexgen-primaryGold transition-colors leading-snug">
                      {service.title}
                    </span>
                  </div>

                  {/* Smooth Rotating Chevron */}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-300 ease-out ${isOpen ? "rotate-180 text-nexgen-primaryGold" : "text-gray-400 group-hover:text-nexgen-primaryGold"
                      }`}
                  />
                </button>

                {/* Smooth Animated Body Container */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${isOpen
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden pl-7 sm:pl-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2 pb-3">
                      {/* Left: Subtitle, Paragraphs, Action Link */}
                      <div className="md:col-span-7 space-y-3">
                        <h4 className="text-sm sm:text-base font-bold text-nexgen-veryDarkHeader">
                          {service.subtitle}
                        </h4>
                        {service.paragraphs.map((p, pIdx) => (
                          <p
                            key={pIdx}
                            className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal"
                          >
                            {p}
                          </p>
                        ))}

                        <div className="pt-3 flex flex-wrap items-center gap-3">
                          <Link
                            href={service.link}
                            className="border border-nexgen-primaryGold text-nexgen-veryDarkHeader hover:bg-nexgen-primaryGold hover:text-nexgen-veryDarkHeader text-xs font-semibold px-5 py-2 rounded-full transition-all duration-200 inline-flex items-center gap-1.5"
                          >
                            <span>Explore Service</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={onOpenConsultation}
                            className="bg-nexgen-primaryGold hover:bg-nexgen-brightGold text-nexgen-veryDarkHeader text-xs font-bold px-5 py-2 rounded-full transition-all duration-200 cursor-pointer shadow-xs"
                          >
                            Book Consultation
                          </button>
                        </div>
                      </div>

                      {/* Right: Clean Image Preview */}
                      <div className="md:col-span-5">
                        <div className="rounded-2xl overflow-hidden shadow-xs border border-gray-200 aspect-[4/3] bg-gray-50">
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
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
