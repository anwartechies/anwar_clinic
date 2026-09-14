"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

const DHI_PRICING_ROWS = [
  {
    stage: "Norwood II–III (Hairline Restructuring)",
    grafts: "800 – 1,500",
    dhiCost: "₹12,000 – ₹22,500",
    premiumCost: "₹20,000 – ₹37,500",
  },
  {
    stage: "Norwood III (Temples + Vertex)",
    grafts: "1,200 – 1,800",
    dhiCost: "₹18,000 – ₹27,000",
    premiumCost: "₹30,000 – ₹45,000",
  },
  {
    stage: "Norwood IV (Crown & Mid-Scalp)",
    grafts: "2,000 – 2,500",
    dhiCost: "₹30,000 – ₹37,500",
    premiumCost: "₹50,000 – ₹62,500",
  },
  {
    stage: "Norwood V (Extensive Thinning)",
    grafts: "2,500 – 3,500",
    dhiCost: "₹37,500 – ₹52,500",
    premiumCost: "₹62,500 – ₹87,500",
  },
  {
    stage: "Norwood VI (Significant Bald Area)",
    grafts: "3,500 – 4,500",
    dhiCost: "₹52,500 – ₹67,500",
    premiumCost: "₹87,500 – ₹1,12,500",
  },
  {
    stage: "Norwood VII (Mega Session)",
    grafts: "5,000 – 6,000",
    dhiCost: "₹75,000 – ₹90,000",
    premiumCost: "₹1,25,000 – ₹1,50,000",
  },
];

export default function CostQHTTableSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">
        
        {/* Header */}
        <div className="max-w-4xl mb-10">
          <span className="text-xs sm:text-sm font-semibold text-[#5c685f] block mb-2 tracking-wide">
            Bio FUE & DHI Pricing Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-tight mb-4">
            Bio FUE & DHI Hair Transplant <br />
            Cost by Norwood Stage
          </h2>
          <p className="text-xs sm:text-sm text-[#5c685f] leading-relaxed font-normal max-w-3xl">
            {COMPANY_NAME} offers specialized Bio FUE (with DMEM medium preservation) and Direct Hair Implantation (DHI) starting from just ₹15 per graft, and Premium Sapphire DHI at ₹25 per graft. All procedures include complimentary GFC sessions, 5 days medication, and post-op care.
          </p>
        </div>

        {/* Pricing Table Card - Full Width in Center */}
        <div className="w-full rounded-3xl overflow-hidden shadow-xl border border-gray-200/80 bg-white">
          
          {/* Table Header Row */}
          <div className="bg-[#243322] text-white py-4 sm:py-5 px-6 sm:px-10 grid grid-cols-12 font-bold text-xs sm:text-sm">
            <div className="col-span-4 sm:col-span-4">Norwood Stage</div>
            <div className="col-span-3 sm:col-span-3">Grafts Required</div>
            <div className="col-span-3 sm:col-span-3 text-left">Bio FUE / DHI (₹15/graft)</div>
            <div className="col-span-2 sm:col-span-2 text-right">Premium DHI (₹25/graft)</div>
          </div>

          {/* Table Body Rows */}
          <div className="divide-y divide-gray-100 text-xs sm:text-sm">
            {DHI_PRICING_ROWS.map((row, idx) => (
              <div
                key={idx}
                className="py-4 sm:py-5 px-6 sm:px-10 grid grid-cols-12 items-center hover:bg-gray-50/80 transition-colors"
              >
                <div className="col-span-4 sm:col-span-4 font-bold text-gray-900">
                  {row.stage}
                </div>
                <div className="col-span-3 sm:col-span-3 text-gray-500 font-medium">
                  {row.grafts}
                </div>
                <div className="col-span-3 sm:col-span-3 font-bold text-[#0062b8]">
                  {row.dhiCost}
                </div>
                <div className="col-span-2 sm:col-span-2 font-bold text-[#b45309] text-right">
                  {row.premiumCost}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 font-normal mt-6">
          Includes free GFC/PRP, 5 days medications, headwash, blood test, and post-transplant doctor consultations at {COMPANY_NAME} Clinic.
        </p>

      </div>
    </section>
  );
}
