"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

const FUT_PRICING_ROWS = [
  { stage: "Grade 1 (Minor Receding)", grafts: "500 - 1,000", cost: "₹25,000 - ₹50,000" },
  { stage: "Grade 2 (Receding Hairline)", grafts: "1,000 - 1,500", cost: "₹50,000 - ₹75,000" },
  { stage: "Grade 3 (Receding Temples + Crown)", grafts: "1,500 - 2,500", cost: "₹75,000 - ₹1,25,000" },
  { stage: "Grade 4 (Moderate Thinning / Crown)", grafts: "2,000 - 3,000", cost: "₹1,00,000 - ₹1,50,000" },
  { stage: "Grade 5 (Significant Loss)", grafts: "2,500 - 3,500", cost: "₹1,25,000 - ₹1,75,000" },
  { stage: "Grade 6 (Extensive Baldness)", grafts: "3,000 - 4,500", cost: "₹1,50,000 - ₹2,25,000" },
  { stage: "Grade 7 (Severe Hair Loss)", grafts: "4,000 - 5,500", cost: "₹2,00,000 - ₹2,75,000" },
];

export default function CostFUTTableSection() {
  return (
    <section className="py-14 sm:py-18 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">
        
        {/* Header */}
        <div className="max-w-4xl mb-10">
          <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold block mb-2 tracking-wide">
            FUT Strip Restoration Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight mb-4">
            FUT Hair Transplant Cost in India <br />
            by Norwood Stage
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-3xl">
            Follicular Unit Transplantation (FUT / Strip Method) is an established restorative technique where a discreet strip of hair-bearing scalp is harvested from the safe donor zone and microscopically dissected into individual follicular units. FUT is especially advantageous for patients with longer hair who prefer not to shave the donor area, as well as those with extensive baldness (Norwood 5–7) needing high graft yields in a single sitting. At {COMPANY_NAME}, specialized FUT procedures start from ₹50 per graft.
          </p>
        </div>

        {/* Pricing Table Card - Full Width in Center */}
        <div className="w-full rounded-3xl overflow-hidden shadow-xl border border-gray-200/80 bg-white">
          
          {/* Table Header Row */}
          <div className="bg-nexgen-veryDarkHeader text-white py-4 sm:py-5 px-6 sm:px-10 grid grid-cols-12 font-bold text-xs sm:text-sm border-b border-nexgen-primaryGold/20">
            <div className="col-span-4 sm:col-span-5">Norwood Stage</div>
            <div className="col-span-4 sm:col-span-4">Estimated Grafts</div>
            <div className="col-span-4 sm:col-span-3 text-left">FUT Investment ({COMPANY_NAME})</div>
          </div>

          {/* Table Body Rows */}
          <div className="divide-y divide-gray-100 text-xs sm:text-sm">
            {FUT_PRICING_ROWS.map((row, idx) => (
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
          * Specialized FUT procedures starting at ₹50/graft with advanced trichophytic closure, stereo-microscopic graft dissection, and inclusive post-operative care kits.
        </p>

      </div>
    </section>
  );
}
