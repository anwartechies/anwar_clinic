"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

const STRIP_ITEMS = [
  "Bespoke Hairline Architecture",
  "Surgeon-Led Clinical Protocols",
  "Comprehensive Post-Op Aftercare",
  "Ultra-Sterile Hospital Theaters",
  "95%+ Follicle Viability Rate",
  "Transparent All-Inclusive Pricing",
];

export default function AboutHero() {
  return (
    <section className="pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 bg-[#eff5f1] overflow-hidden">
      <div className="qht-large-container">

        {/* Title with Inline Rounded Pill Image Capsules */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-[500] text-[#1b221d] tracking-tight leading-[1.2] flex flex-col items-center justify-center">

            {/* Line 1: Redefining [pill 1] Hair */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <span>Redefining</span>
              <span className="inline-flex items-center justify-center w-16 sm:w-20 md:w-22 h-8 sm:h-9 md:h-10 rounded-full overflow-hidden border border-black/15 shadow-xs align-middle bg-white flex-shrink-0">
                <img
                  src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/photo-1579684385127-1ef15d508118-mtzmy1yvzj07fe.avif"
                  alt="Scalp Hair Assessment"
                  className="w-full h-full object-cover"
                />
              </span>
              <span>Hair</span>
            </div>

            {/* Line 2: Restoration in India [pill 2] */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mt-1">
              <span>Restoration in India</span>
              <span className="inline-flex items-center justify-center w-16 sm:w-20 md:w-22 h-8 sm:h-9 md:h-10 rounded-full overflow-hidden border border-black/15 shadow-xs align-middle bg-white flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=300&q=80"
                  alt="Precision Hair Restoration Surgery"
                  className="w-full h-full object-cover"
                />
              </span>
            </div>

          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-xs sm:text-[13.5px] text-[#5c685f] leading-relaxed max-w-2xl mx-auto font-normal text-center">
            At {COMPANY_NAME}, hair restoration is more than surgical coverage — it is an artistic discipline dedicated to restoring natural facial balance, density, and lasting confidence. By uniting board-certified surgical mastery with advanced micro-instrumentation, we set a higher standard of clinical care.
          </p>
        </div>

        {/* Big Medical Team Hospital Photo */}
        <div className="max-w-5xl mx-auto rounded-3xl sm:rounded-[36px] overflow-hidden shadow-xl border border-gray-200/80 bg-white relative aspect-[16/10] sm:aspect-[1.85/1]">
          <img
            src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/clinic-with-doc-mtzjmlrtcqfokt.jpeg"
            alt={`${COMPANY_NAME} Clinic Experienced Surgical Team and Doctors`}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Bottom Rounded Green Fixed-Width Stripe with Infinite Right-to-Left Marquee */}
        <div className="max-w-5xl mx-auto mt-6 rounded-2xl sm:rounded-full bg-[#52664d] text-white py-4 px-4 sm:px-6 shadow-md overflow-hidden relative">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap select-none text-xs sm:text-[13px] font-semibold">
            {/* First sequence */}
            {STRIP_ITEMS.map((item, idx) => (
              <div key={`seq1-${idx}`} className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[#b1fc85] text-sm">✦</span>
                <span>{item}</span>
              </div>
            ))}
            {/* Duplicated sequence for seamless infinite loop */}
            {STRIP_ITEMS.map((item, idx) => (
              <div key={`seq2-${idx}`} className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[#b1fc85] text-sm">✦</span>
                <span>{item}</span>
              </div>
            ))}
            {/* Triplicated sequence */}
            {STRIP_ITEMS.map((item, idx) => (
              <div key={`seq3-${idx}`} className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[#b1fc85] text-sm">✦</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
