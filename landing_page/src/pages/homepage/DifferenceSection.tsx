"use client";

import React from "react";
import { Check, X, User, ShieldCheck, Sparkles, Infinity as InfinityIcon, Tag } from "lucide-react";
import { DIFFERENCE_ITEMS } from "@/data/qhtData";
import { COMPANY_NAME } from "@/config/constants";

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  "Natural Hairline": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
      <path d="M7 10c0 4 2.5 7 5 7s5-3 5-7" />
      <path d="M9 4.5c1.5-1 4.5-1 6 0" />
    </svg>
  ),
  "Safe Procedure": <ShieldCheck className="w-8 h-8 stroke-[1.8]" />,
  "Advanced Technique": <Sparkles className="w-8 h-8 stroke-[1.8]" />,
  "Life-Long Results": <InfinityIcon className="w-8 h-8 stroke-[1.8]" />,
  "Transparent Pricing": <Tag className="w-8 h-8 stroke-[1.8]" />,
};

export default function DifferenceSection() {
  return (
    <section className="py-20 sm:py-24 bg-nexgen-pageLightBg overflow-hidden">
      <div className="qht-container">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight">
            The Standard of Care That Sets Us Apart
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-nexgen-serviceInnerCard font-normal leading-relaxed">
            Comparing precision surgical artistry at {COMPANY_NAME} against standard commercial clinics.
          </p>
        </div>

        {/* Comparison Cards Stack */}
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {DIFFERENCE_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6 lg:gap-10 transition-shadow hover:shadow-[0_8px_36px_rgba(2,30,43,0.06)]"
            >
              {/* Left Column: Icon Badge & Title */}
              <div className="flex items-center gap-4 sm:gap-5 md:w-[36%] flex-shrink-0 md:pr-6 md:border-r border-gray-100">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-nexgen-mainDarkBg text-nexgen-brightGold border border-nexgen-primaryGold/30 flex items-center justify-center flex-shrink-0 shadow-xs">
                  {FEATURE_ICONS[item.title] || (
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="w-8 h-8 object-contain filter invert"
                    />
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-nexgen-veryDarkHeader tracking-tight leading-tight">
                  {item.title}
                </h3>
              </div>

              {/* Right Column: QHT Promise & Other Clinics */}
              <div className="flex-1 w-full space-y-4">
                {/* QHT PROMISE */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs sm:text-[18px] font-bold text-nexgen-veryDarkHeader tracking-wide">
                      {COMPANY_NAME} STANDARD
                    </span>
                    <span className="w-4 h-4 rounded-full bg-nexgen-primaryGold text-nexgen-veryDarkHeader flex items-center justify-center flex-shrink-0 shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  </div>
                  <p className="text-xs sm:text-[16.5px] text-gray-700 leading-relaxed font-normal">
                    {item.qhtPromise}
                  </p>
                </div>

                {/* Subtle Divider */}
                <div className="border-t border-gray-100 w-full" />

                {/* Other Clinics */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs sm:text-[18px] font-bold text-nexgen-serviceInnerCard tracking-wide">
                      Other Clinics
                    </span>
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                      <X className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  </div>
                  <p className="text-xs sm:text-[16.5px] text-gray-500 leading-relaxed font-normal">
                    {item.otherClinics}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
