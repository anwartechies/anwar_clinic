"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

interface WhyUsStat {
  title: string;
  desc: string;
}

interface ServiceWhyUsSectionProps {
  title?: string;
  subtitle?: string;
  stats?: WhyUsStat[];
  onOpenConsultation?: () => void;
}

const DEFAULT_WHY_US_STATS: WhyUsStat[] = [
  {
    title: "Natural, Undetectable Hairline Architecture",
    desc: "Crafted to complement your personal facial geometry and natural hair exit angles.",
  },
  {
    title: "Advanced Direct Implanter Technology",
    desc: "Ultra-fine direct implanter pens ensuring minimal root trauma and 95%+ follicle viability.",
  },
  {
    title: "Rapid Tissue Recovery with Minimal Downtime",
    desc: "Return to everyday activities within 5 to 7 days safely with structured healing care.",
  },
  {
    title: "Extensive Portfolio of Documented Success",
    desc: "Led by senior certified hair restoration surgeons with thousands of successful cases.",
  },
];

export default function ServiceWhyUsSection({
  title = "Hair Restoration",
  subtitle,
  stats = DEFAULT_WHY_US_STATS,
  onOpenConsultation,
}: ServiceWhyUsSectionProps) {
  const defaultSubtitle = `At ${COMPANY_NAME}, our clinical protocols combine surgical artistry, sterile theater standards, and dedicated patient care.\nKey clinical strengths:`;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-mainDarkBg text-white overflow-hidden border-t border-nexgen-primaryGold/25">
      <div className="qht-large-container">

        {/* Header Row */}
        <div className="max-w-3xl mb-12 sm:mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-white tracking-tight leading-[1.18]">
            {title.toLowerCase().includes("trusted") || title.toLowerCase().includes("why")
              ? title
              : `Why We Are Amongst the Most Trusted ${title} Clinics in India`}
          </h2>
          <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal whitespace-pre-line">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* 2-Column: Left Graphic + Right 2x2 Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Left Column: Graphic Illustration + CTA Button */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start justify-between">
            <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
              <img
                src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-53-08-pm-mu46xz28f0p1lx.jpeg"
                alt={`Why Choose ${COMPANY_NAME} Clinic`}
                className="w-full h-full object-cover rounded-2xl shadow-md"
              />
            </div>

            <div className="mt-8 sm:mt-10 w-full text-center lg:text-left">
              <button
                onClick={onOpenConsultation}
                className="bg-nexgen-brightGold hover:bg-nexgen-primaryGold text-nexgen-veryDarkHeader font-bold text-sm sm:text-base py-3 px-8 rounded-full shadow-md transition-all active:scale-95 duration-150 cursor-pointer"
              >
                Book Free Consultation
              </button>
            </div>
          </div>

          {/* Right Column: 2x2 Stats Grid with Divider Line */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`space-y-1.5 ${idx >= 2 ? "pt-0 sm:pt-6 sm:border-t sm:border-white/20" : ""
                    }`}
                >
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                    {stat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
