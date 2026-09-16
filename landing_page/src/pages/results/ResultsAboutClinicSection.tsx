"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

interface ResultsAboutClinicSectionProps {
  title?: string;
}

export default function ResultsAboutClinicSection({
  title = `Excellence in Hair Restoration at ${COMPANY_NAME}`,
}: ResultsAboutClinicSectionProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">

        <div className="max-w-4xl space-y-6">
          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight">
            {title}
          </h2>

          {/* Paragraph 1 */}
          <p className="text-xs sm:text-[18px] text-nexgen-serviceInnerCard leading-relaxed font-normal">
            When seeking genuine, transformative hair restoration, {COMPANY_NAME} delivers unmatched surgical precision and aesthetic excellence. Driven by doctor-led protocols, advanced micro-instrumentation, and high graft viability, our clinic is committed to natural, permanent results.
          </p>

          {/* Paragraph 2 */}
          <p className="text-xs sm:text-[18px] text-nexgen-serviceInnerCard leading-relaxed font-normal">
            Patients at {COMPANY_NAME} receive individualized treatment plans using advanced techniques including precision Micro-FUE and Direct Hair Implantation. Whether correcting early temple recession, addressing advanced vertex thinning, or performing beard and eyebrow reconstruction, our surgical team prioritizes soft, age-appropriate hairline architecture and lifelong permanence.
          </p>

          {/* Subheading & Bullet Points */}
          <div className="pt-3 space-y-3">
            <h3 className="text-sm sm:text-2xl font-[500] text-nexgen-veryDarkHeader">
              The {COMPANY_NAME} Standard of Excellence
            </h3>

            <ul className="space-y-2 text-xs sm:text-[18px] text-nexgen-serviceInnerCard list-disc list-inside marker:text-nexgen-primaryGold">
              <li>
                <span className="font-normal">Board-certified hair restoration surgeons leading every procedure</span>
              </li>
              <li>
                <span className="font-normal">High follicle survival rates with natural exit-angle alignment</span>
              </li>
              <li>
                <span className="font-normal">Extensive portfolio of verified patient outcomes across all Norwood grades</span>
              </li>
              <li>
                <span className="font-normal">Ultra-sterile, hospital-grade surgical suites</span>
              </li>
              <li>
                <span className="font-normal">Upfront, transparent per-graft pricing with zero hidden charges</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
