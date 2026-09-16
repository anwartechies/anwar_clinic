"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

const DHI_PRICING_ROWS = [
  {
    stage: "Norwood II–III (Hairline Restructuring)",
    grafts: "800 – 1,500",
    bioFueCost: "₹30,000 – ₹40,000",
    dhiCost: "₹40,000 – ₹45,000",
    premiumCost: "₹45,000 – ₹50,000",
  },
  {
    stage: "Norwood III (Temples + Vertex)",
    grafts: "1,200 – 1,800",
    bioFueCost: "₹35,000 – ₹45,000",
    dhiCost: "₹45,000 – ₹50,000",
    premiumCost: "₹50,000 – ₹55,000",
  },
  {
    stage: "Norwood IV (Crown & Mid-Scalp)",
    grafts: "2,000 – 2,500",
    bioFueCost: "₹40,000 – ₹50,000",
    dhiCost: "₹50,000 – ₹55,000",
    premiumCost: "₹55,000 – ₹60,000",
  },
  {
    stage: "Norwood V (Extensive Thinning)",
    grafts: "2,500 – 3,500",
    bioFueCost: "₹45,000 – ₹55,000",
    dhiCost: "₹55,000 – ₹60,000",
    premiumCost: "₹60,000 – ₹65,500",
  },
  {
    stage: "Norwood VI (Significant Bald Area)",
    grafts: "3,500 – 4,500",
    bioFueCost: "₹50,000 – ₹60,000",
    dhiCost: "₹60,000 – ₹65,000",
    premiumCost: "₹65,000 – ₹70,000",
  },
  {
    stage: "Norwood VII (Mega Session)",
    grafts: "5,000 – 6,000",
    bioFueCost: "₹55,000 – ₹65,000",
    dhiCost: "₹65,000 – ₹70,000",
    premiumCost: "₹70,000 – ₹75,000",
  },
];

export default function CostQHTTableSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">

        {/* Header */}
        <div className="max-w-4xl mb-10">
          <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold block mb-2 tracking-wide">
            Bio FUE & DHI Pricing Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight mb-4">
            Bio FUE & DHI Hair Transplant <br />
            Cost by Norwood Stage
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-3xl">
            {COMPANY_NAME} delivers cutting-edge follicular preservation and implantation protocols. Choose between Bio FUE with DMEM nutrient medium (₹15/graft), Direct Hair Implantation (DHI) with micro-pen precision (₹20/graft), and Premium Sapphire DHI (₹25/graft) for ultra-refined graft density. All surgical tiers include complimentary regenerative GFC/PRP therapy, post-op medications, and dedicated surgeon reviews.
          </p>
        </div>

        {/* Pricing Table Card - Full Width in Center */}
        <div className="w-full rounded-3xl overflow-hidden shadow-xl border border-gray-200/80 bg-white">

          {/* Table Header Row */}
          <div className="bg-nexgen-veryDarkHeader text-white py-4 sm:py-5 px-6 sm:px-10 grid grid-cols-12 font-bold text-xs sm:text-sm border-b border-nexgen-primaryGold/20">
            <div className="col-span-4 sm:col-span-3">Norwood Stage</div>
            <div className="col-span-2 sm:col-span-3">Est. Grafts</div>
            <div className="col-span-2 sm:col-span-2 text-left">Bio FUE (₹15)</div>
            <div className="col-span-2 sm:col-span-2 text-left">DHI (₹20)</div>
            <div className="col-span-2 sm:col-span-2 text-right">Premium (₹25)</div>
          </div>

          {/* Table Body Rows */}
          <div className="divide-y divide-gray-100 text-xs sm:text-sm">
            {DHI_PRICING_ROWS.map((row, idx) => (
              <div
                key={idx}
                className="py-4 sm:py-5 px-6 sm:px-10 grid grid-cols-12 items-center hover:bg-gray-50/80 transition-colors"
              >
                <div className="col-span-4 sm:col-span-3 font-bold text-gray-900">
                  {row.stage}
                </div>
                <div className="col-span-2 sm:col-span-3 text-gray-500 font-medium">
                  {row.grafts}
                </div>
                <div className="col-span-2 sm:col-span-2 font-bold text-nexgen-veryDarkHeader">
                  {row.bioFueCost}
                </div>
                <div className="col-span-2 sm:col-span-2 font-bold text-nexgen-veryDarkHeader">
                  {row.dhiCost}
                </div>
                <div className="col-span-2 sm:col-span-2 font-bold text-nexgen-primaryGold text-right">
                  {row.premiumCost}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 font-normal mt-6">
          * Transparent pricing structure. Every package includes complimentary GFC/PRP sessions, 5 days medication, sterile headwashes, laboratory diagnostics, and scheduled surgeon follow-ups at {COMPANY_NAME}.
        </p>

      </div>
    </section>
  );
}
