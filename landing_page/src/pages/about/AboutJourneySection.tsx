"use client";

import React from "react";
import { CheckCircle2, UserCheck } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface PillarItem {
  num: string;
  title: string;
  desc: string;
}

const JOURNEY_PILLARS: PillarItem[] = [
  {
    num: "01",
    title: "15,000+ Procedures Completed",
    desc: "A rich history of delivering exceptional results for patients across India and overseas.",
  },
  {
    num: "02",
    title: "Direct Micro-Implantation Protocol",
    desc: "Utilizing microscopic graft sorting and precision implanter pens for maximum follicle survival.",
  },
  {
    num: "03",
    title: "Multi-City Footprint",
    desc: "Clinics in Patna (Main Branch) and Mumbai (Second Branch) delivering uniform clinical excellence.",
  },
  {
    num: "04",
    title: "Strict Safety & Hygiene",
    desc: "Single-use disposable punches and hospital-grade sterile operation theatres.",
  },
];

export default function AboutJourneySection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">
        
        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Headline & Story */}
          <div className="lg:col-span-7 space-y-5">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-[1.14]">
              Our Journey — Transforming Hair <br />
              Restoration in India
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#5c685f] leading-relaxed font-normal max-w-2xl pt-2">
              <p>
                The founding vision of {COMPANY_NAME} was simple yet resolute: to make world-class, ethical hair restoration accessible and predictable. Over the years, that commitment has grown into a trusted medical practice with thousands of documented patient success stories.
              </p>
              <p>
                With every procedure, {COMPANY_NAME} advances clinical standards in natural hairline design, patient safety, and high graft viability — empowering patients with permanent density and lifelong confidence.
              </p>
            </div>
          </div>

          {/* Right Column: 4 Numbered Feature Rows */}
          <div className="lg:col-span-5 divide-y divide-gray-200 border-t border-b border-gray-200">
            {JOURNEY_PILLARS.map((pillar, idx) => (
              <div key={idx} className="py-5 sm:py-6 flex items-start gap-4">
                <span className="text-xs sm:text-sm font-bold text-[#5c685f] tracking-tight flex-shrink-0 pt-0.5 select-none">
                  {pillar.num}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-[500] text-[#1b221d] mb-1">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#5c685f] leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Section: Our Certifications */}
        <div className="mt-14 sm:mt-16 pt-8 border-t border-gray-100">
          <span className="text-xs font-semibold text-[#5c685f] block mb-4 tracking-wide">
            Our Certifications
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-3xl">
            
            {/* Card 1: US-FDA-approved technology */}
            <div className="rounded-2xl border border-gray-200/90 p-4 sm:p-5 flex items-center gap-3.5 bg-white shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-10 h-10 rounded-full border border-gray-300 flex flex-col items-center justify-center text-[9px] font-black text-gray-800 flex-shrink-0 relative">
                <span>FDA</span>
                <CheckCircle2 className="w-3 h-3 text-[#52664d] absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-bold text-[#1b221d] leading-snug">
                  US-FDA-approved <br />
                  technology
                </h4>
              </div>
            </div>

            {/* Card 2: Certified & trained transplant surgeons */}
            <div className="rounded-2xl border border-gray-200/90 p-4 sm:p-5 flex items-center gap-3.5 bg-white shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#eff5f1] text-[#52664d] flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-bold text-[#1b221d] leading-snug">
                  Certified & trained transplant <br />
                  surgeons
                </h4>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
