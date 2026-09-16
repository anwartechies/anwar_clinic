"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface ServiceAccordionItem {
  id: string;
  number: string;
  title: string;
  description: string;
  href: string;
}

const SERVICES_LIST: ServiceAccordionItem[] = [
  {
    id: "men",
    number: "01",
    title: "Hair Restoration for Men",
    description:
      "Advanced surgeon-led follicular transplantation designed to permanently reverse male pattern baldness, rebuild receding temples, and restore lifelong crown density with authentic hair flow.",
    href: "/services/hair-transplant-for-men/",
  },
  {
    id: "hairline",
    number: "02",
    title: "Artistic Hairline Reconstruction",
    description:
      "Custom-crafted hairline architecture tailored to your natural facial proportions, using single-hair micro-grafts placed at feather-soft angles for a virtually undetectable transition.",
    href: "/services/hairline-reconstruction/",
  },
  {
    id: "repair",
    number: "03",
    title: "Corrective & Revision Transplant",
    description:
      "Specialized reconstructive protocols to extract unnatural pluggy grafts, correct misaligned growth vectors, and repair donor scarring from substandard prior surgeries.",
    href: "/services/failed-hair-transplant-repair/",
  },
  {
    id: "body-hair",
    number: "04",
    title: "Body Hair Transplant (BHT)",
    description:
      "Strategic harvesting of robust donor follicles from the beard and chest to reconstruct dense coverage for patients with exhausted or compromised scalp donor reserves.",
    href: "/services/body-hair-transplant/",
  },
  {
    id: "beard",
    number: "05",
    title: "Beard & Mustache Restoration",
    description:
      "Precision facial transplantation to eliminate patchy areas, sculpt sharp jawlines, and enhance beard and mustache density with perfectly matched growth directions.",
    href: "/services/beard-hair-transplant-in-india/",
  },
  {
    id: "prp",
    number: "06",
    title: "PRP & GFC Regenerative Therapy",
    description:
      "Next-generation autologous therapies infusing concentrated growth factors to fortify thinning follicles, stimulate dormant roots, and accelerate post-procedural recovery.",
    href: "/services/prp-treatment/",
  },
];

interface OurServicesSectionProps {
  onOpenConsultation?: () => void;
}

export default function OurServicesSection({
  onOpenConsultation,
}: OurServicesSectionProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">
        
        {/* Section Title */}
        <div className="pb-6 border-b border-gray-200">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-nexgen-veryDarkHeader tracking-tight leading-tight">
            Our Services
          </h2>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-10 sm:pt-14 items-start">
          
          {/* Left Column: Introduction & Hair Follicles Image */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <span className="text-xs sm:text-[13px] font-semibold text-nexgen-primaryGold block mb-4 tracking-wide uppercase">
              Introduction
            </span>

            {/* Hair Strands Image from public folder */}
            <div className="py-2 flex justify-start">
              <img
                src="/images/service1.webp"
                alt="Hair Loss Introduction"
                className="w-56 sm:w-64 h-auto object-contain select-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/service1.webp";
                }}
              />
            </div>

            {/* Book Free Consultation Button immediately after image */}
            <div className="pt-6">
              <button
                type="button"
                onClick={onOpenConsultation}
                className="bg-nexgen-primaryGold hover:bg-nexgen-brightGold text-nexgen-veryDarkHeader font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 duration-150 cursor-pointer"
              >
                Book Free Consultation
              </button>
            </div>
          </div>

          {/* Right Column: Headline & 6-Item Accordion */}
          <div className="lg:col-span-7">
            <h3 className="text-2xl sm:text-3xl font-bold text-nexgen-veryDarkHeader tracking-tight leading-snug mb-8">
              Hair loss affects more than just your scalp — <br className="hidden sm:inline" />
              it touches your identity.
            </h3>

            {/* Accordion List */}
            <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {SERVICES_LIST.map((service, idx) => {
                const isOpen = openIndex === idx;

                return (
                  <div key={service.id} className="py-4 sm:py-5 transition-colors">
                    {/* Trigger Row */}
                    <button
                      type="button"
                      onClick={() => toggleAccordion(idx)}
                      className="w-full flex items-center justify-between text-left group cursor-pointer select-none focus:outline-none"
                    >
                      <div className="flex items-center gap-3.5 sm:gap-4">
                        {/* Number Badge (01, 02, etc.) */}
                        <div className="w-6 h-6 rounded-full bg-nexgen-mainDarkBg text-nexgen-brightGold text-[11px] font-bold flex items-center justify-center flex-shrink-0 shadow-2xs border border-nexgen-primaryGold/30">
                          {service.number}
                        </div>

                        {/* Title */}
                        <span className="text-sm sm:text-base font-bold text-nexgen-veryDarkHeader group-hover:text-nexgen-primaryGold transition-colors">
                          {service.title}
                        </span>
                      </div>

                      {/* Rotating Chevron */}
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform duration-300 ease-out ${
                          isOpen ? "rotate-180 text-nexgen-primaryGold" : "text-gray-400 group-hover:text-nexgen-primaryGold"
                        }`}
                      />
                    </button>

                    {/* Expandable Content Container */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100 mt-3"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden pl-9.5 sm:pl-10">
                        <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed mb-4 font-normal">
                          {service.description}
                        </p>

                        <Link
                          href={service.href}
                          className="inline-block border border-nexgen-primaryGold text-nexgen-veryDarkHeader hover:bg-nexgen-primaryGold hover:text-nexgen-veryDarkHeader font-semibold text-xs px-5 py-2 rounded-full transition-all duration-200"
                        >
                          Explore Service
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
