"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

const COST_FACTORS = [
  {
    num: "01",
    title: `Surgical Technique Selected\n(FUT / FUE / ${COMPANY_NAME} Protocol)`,
    desc: `Different techniques vary in surgical instrumentation and procedural duration. Strip FUT is the most economical; Motorized FUE and ${COMPANY_NAME} Direct Implantation provide scarless healing and higher follicle survival rates.`,
  },
  {
    num: "02",
    title: "Number of\nGrafts Required",
    desc: "Total cost is calculated as grafts × per-graft rate. Norwood Stage 2 may need 800–1,200 grafts while Norwood 7 may require 5,000–6,000 grafts. Higher Norwood grades directly increase overall cost – early intervention is always the most cost-effective approach.",
  },
  {
    num: "03",
    title: "Surgeon's Expertise\nand Credentials",
    desc: "Experienced surgeons ensure accurate hairline design and precise graft placement, eliminating the need for corrective procedures commonly required when treatments are led by technicians or underqualified professionals. Cutting corners here can be far costlier in the long run.",
  },
  {
    num: "04",
    title: "Clinic Infrastructure\nand Location",
    desc: "Clinics with modern surgical tools, digital scalp analysis systems and dedicated operating theatres deliver better outcomes and patient safety. Metropolitan cities like Delhi, Mumbai and Bangalore typically charge more than Tier 2 cities due to advanced infrastructure and premium services.",
  },
  {
    num: "05",
    title: "Post-Operative Care and\nAdjunctive Treatments",
    desc: "Structured follow-up care is essential for optimal results and comfortable recovery. Adjunctive treatments like PRP, laser therapy and prescription medications may be bundled into all-inclusive packages at some clinics or charged separately – verify what's included to compare costs accurately.",
  },
  {
    num: "06",
    title: "Graft Survival Rate\nand Technology",
    desc: "Clinics utilizing precision micro-punches, direct implanter pens, and minimal out-of-body holding protocols achieve superior follicle survival — preserving your finite donor bank and delivering maximum visual density.",
  },
];

export default function CostFactorsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">
        
        {/* Top Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-12 sm:mb-16">
          <div className="lg:col-span-7">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.12]">
              6 Key Factors That Affect Hair <br />
              Transplant Cost in India
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              Hair transplant pricing varies based on multiple clinical, technical and geographic factors. While cost is often the first thing patients consider when comparing clinics, it should not be the sole deciding factor - understanding what shapes the final price helps you make a truly informed decision.
            </p>
          </div>
        </div>

        {/* 6 Factors Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {COST_FACTORS.map((factor, idx) => (
            <div
              key={idx}
              className="bg-nexgen-pageLightBg rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden border border-gray-200/50 shadow-2xs hover:shadow-xs transition-shadow min-h-[260px]"
            >
              <div>
                <h3 className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader mb-3 leading-snug whitespace-pre-line">
                  {factor.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {factor.desc}
                </p>
              </div>

              {/* Large Watermark Number in bottom right */}
              <div className="flex justify-end pt-4 select-none pointer-events-none">
                <span className="text-5xl sm:text-6xl font-black text-nexgen-primaryGold/20 tracking-tighter leading-none">
                  {factor.num}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
