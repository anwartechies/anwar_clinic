"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

const COST_FACTORS = [
  {
    num: "01",
    title: `Surgical Technique Selected\n(FUE / Bio FUE / DHI / Sapphire)`,
    desc: `The chosen surgical methodology dictates procedural duration, precision micro-instrumentation, and graft handling protocols. Standard motorized FUE provides a scarless, affordable baseline, whereas Bio FUE and Direct Hair Implantation (DHI) using specialized implanter pens and sapphire blades deliver superior root survival and peak visual density.`,
  },
  {
    num: "02",
    title: "Total Number of\nGrafts Required",
    desc: "Your overall investment is calculated transparently as: Total Grafts × Per-Graft Rate. Early hairline recession (Norwood 2–3) typically requires 800–1,800 grafts, whereas advanced baldness (Norwood 6–7) demands 4,000–6,000 grafts. Taking action at the first signs of thinning minimizes graft count and overall procedure expense.",
  },
  {
    num: "03",
    title: "Surgeon Credentials &\nDirect Doctor Involvement",
    desc: "Procedures at NexGen are executed directly by certified, experienced hair transplant surgeons — never delegated to inexperienced technicians. Expert surgical hands ensure natural artistic hairline curvature, correct follicular exit angles, and long-term donor bank conservation.",
  },
  {
    num: "04",
    title: "Follicular Holding Solution\n& Root Preservation",
    desc: "Extracted grafts are sensitive biological tissues. Using specialized, nutrient-dense holding solutions like DMEM (Dulbecco's Modified Eagle Medium) dramatically improves cellular respiration and prevents dehydration, ensuring graft survival rates exceeding 95%.",
  },
  {
    num: "05",
    title: "Operating Suite Sterility &\nHospital Infrastructure",
    desc: "Procedures performed in certified sterile surgical suites with hospital-grade laminar air sterilization and digital magnification systems safeguard against complications and infection, providing a seamless and painless patient experience.",
  },
  {
    num: "06",
    title: "All-Inclusive Post-Op Care &\nRegenerative Therapy",
    desc: "True cost transparency means no hidden bills. At NexGen, every procedure package includes complimentary regenerative GFC/PRP therapy, complete 5-day post-op recovery medicines, clinic headwashes, and scheduled doctor evaluations throughout your 12-month regrowth journey.",
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
              6 Critical Factors Influencing <br />
              Hair Transplant Cost in India
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              Hair restoration pricing is shaped by surgical technique, graft volume, clinical safety standards, and doctor expertise. Understanding these core factors empowers you to make an informed, confident choice rather than judging clinics on low headline figures alone.
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
