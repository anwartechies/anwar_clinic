"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

const NORWOOD_PRICING_ROWS = [
  { stage: "Grade 1 (Minor Receding)", grafts: "500 - 1,000", cost: "₹15,000 - ₹25,000" },
  { stage: "Grade 2 (Receding Hairline)", grafts: "1,000 - 1,500", cost: "₹25,000 - ₹30,000" },
  { stage: "Grade 3 (Receding Temples + Crown)", grafts: "1,500 - 2,500", cost: "₹30,000 - ₹35,000" },
  { stage: "Grade 4 (Moderate Thinning / Crown)", grafts: "2,000 - 3,000", cost: "₹35,000 - ₹40,000" },
  { stage: "Grade 5 (Significant Loss)", grafts: "2,500 - 3,500", cost: "₹40,000 - ₹45,000" },
  { stage: "Grade 6 (Extensive Baldness)", grafts: "3,000 - 4,500", cost: "₹45,000 - ₹50,000" },
  { stage: "Grade 7 (Severe Hair Loss)", grafts: "4,000 - 5,500", cost: "₹50,000 - ₹55,000" },
  { stage: "Mega Session (Full Coverage)", grafts: "5,000 - 6,000", cost: "₹55,000 - ₹65,000" },
];

export default function CostNorwoodTableSection() {
  return (
    <section className="py-14 sm:py-18 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">

        {/* Header */}
        <div className="max-w-4xl mb-10">
          <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold block mb-2 tracking-wide">
            FUE Pricing Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight mb-4">
            FUE Hair Transplant Cost in India <br />
            by Norwood Stage
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-3xl">
            Follicular Unit Extraction (FUE) represents the gold standard in scarless, minimally invasive hair restoration. At {COMPANY_NAME}, our surgeon-led FUE procedures start from just ₹10 per graft. The total investment is determined by your Norwood hair loss classification, individual donor bank density, and aesthetic hairline goals determined during a comprehensive scalp evaluation.
          </p>
        </div>

        {/* Pricing Table Card - Full Width in Center */}
        <div className="w-full rounded-3xl overflow-hidden shadow-xl border border-gray-200/80 bg-white">

          {/* Table Header Row */}
          <div className="bg-nexgen-veryDarkHeader text-white py-4 sm:py-5 px-6 sm:px-10 grid grid-cols-12 font-bold text-xs sm:text-sm border-b border-nexgen-primaryGold/20">
            <div className="col-span-4 sm:col-span-5">Norwood Stage</div>
            <div className="col-span-4 sm:col-span-4">Estimated Grafts</div>
            <div className="col-span-4 sm:col-span-3 text-left">FUE Investment ({COMPANY_NAME})</div>
          </div>

          {/* Table Body Rows */}
          <div className="divide-y divide-gray-100 text-xs sm:text-sm">
            {NORWOOD_PRICING_ROWS.map((row, idx) => (
              <div
                key={idx}
                className="py-4 sm:py-5 px-6 sm:px-10 grid grid-cols-12 items-center hover:bg-gray-50/80 transition-colors"
              >
                <div className="col-span-4 sm:col-span-5 font-bold text-gray-900">
                  {row.stage}
                </div>
                <div className="col-span-4 sm:col-span-4 text-gray-500 font-medium">
                  {row.grafts}
                </div>
                <div className="col-span-4 sm:col-span-3 font-bold text-gray-900">
                  {row.cost}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 font-normal mt-6">
          * Transparent pricing starting at ₹10/graft. Every package includes complimentary GFC/PRP therapy, post-op medications, sterile headwashes, and scheduled doctor reviews. Final surgical plan confirmed following digital trichoscopy.
        </p>

      </div>
    </section>
  );
}
