"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

const NORWOOD_PRICING_ROWS = [
  { stage: "Grade 1 (Minor Receding)", grafts: "500 - 1,000", cost: "₹5,000 - ₹10,000" },
  { stage: "Grade 2 (Receding Hairline)", grafts: "1,000 - 1,500", cost: "₹10,000 - ₹15,000" },
  { stage: "Grade 3 (Receding Temples + Crown)", grafts: "1,500 - 2,500", cost: "₹15,000 - ₹25,000" },
  { stage: "Grade 4 (Moderate Thinning / Crown)", grafts: "2,000 - 3,000", cost: "₹20,000 - ₹30,000" },
  { stage: "Grade 5 (Significant Loss)", grafts: "2,500 - 3,500", cost: "₹25,000 - ₹35,000" },
  { stage: "Grade 6 (Extensive Baldness)", grafts: "3,000 - 4,500", cost: "₹30,000 - ₹45,000" },
  { stage: "Grade 7 (Severe Hair Loss)", grafts: "4,000 - 5,500", cost: "₹40,000 - ₹55,000" },
  { stage: "Mega Session (Full Coverage)", grafts: "5,000 - 6,000", cost: "₹50,000 - ₹60,000" },
];

export default function CostNorwoodTableSection() {
  return (
    <section className="py-14 sm:py-18 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">
        
        {/* Header */}
        <div className="max-w-4xl mb-10">
          <span className="text-xs sm:text-sm font-semibold text-[#5c685f] block mb-2 tracking-wide">
            FUE Pricing Table
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-tight mb-4">
            FUE Hair Transplant Cost in India <br />
            by Norwood Stage
          </h2>
          <p className="text-xs sm:text-sm text-[#5c685f] leading-relaxed font-normal max-w-3xl">
            Follicular Unit Extraction is an advanced, minimally invasive technique with no linear scar. The FUE hair transplant cost at {COMPANY_NAME} Clinic starts from just ₹10 per graft. The number of grafts and therefore total cost is determined by your Norwood baldness grade, assessed during a scalp consultation.
          </p>
        </div>

        {/* Pricing Table Card - Full Width in Center */}
        <div className="w-full rounded-3xl overflow-hidden shadow-xl border border-gray-200/80 bg-white">
          
          {/* Table Header Row */}
          <div className="bg-[#243322] text-white py-4 sm:py-5 px-6 sm:px-10 grid grid-cols-12 font-bold text-xs sm:text-sm">
            <div className="col-span-4 sm:col-span-5">Norwood Stage</div>
            <div className="col-span-4 sm:col-span-4">Grafts Required</div>
            <div className="col-span-4 sm:col-span-3 text-left">FUE Cost ({COMPANY_NAME} Clinic)</div>
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
          Prices at {COMPANY_NAME} Clinic – FUE starts from ₹10/graft. Includes free PRP, medications, and consultations. Final cost confirmed after personalised scalp assessment.
        </p>

      </div>
    </section>
  );
}
