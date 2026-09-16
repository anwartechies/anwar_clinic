"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface ComparisonRow {
  feature: string;
  ourClinic: string;
  others: string;
}

export default function AboutComparisonTableSection() {
  const COMPARISON_ROWS: ComparisonRow[] = [
    {
      feature: "Surgical Technology",
      ourClinic: "Sapphire micro-instruments & cold-chain storage ensuring 95%+ graft survival",
      others: "Standard steel blades with prolonged out-of-body holding times",
    },
    {
      feature: "Doctor Involvement",
      ourClinic: "Direct planning and surgical execution by certified senior surgeons",
      others: "Unsupervised procedures frequently delegated to technicians",
    },
    {
      feature: "Hairline Artistry",
      ourClinic: "Custom facial mapping with single-hair micro-feathering for natural density",
      others: "Generic, stencil-like hairlines that can appear unnatural or pluggy",
    },
    {
      feature: "Safety & Hygiene",
      ourClinic: "Hospital-grade sterile cleanroom suites with 100% single-use disposables",
      others: "Inconsistent sterilization practices in basic outpatient rooms",
    },
    {
      feature: "Pricing Transparency",
      ourClinic: "Clear, all-inclusive per-graft quotes with zero hidden or surprise costs",
      others: "Low initial quotes followed by unexpected post-procedure add-on fees",
    },
    {
      feature: "Donor Preservation",
      ourClinic: "Strategic micro-extraction preserving donor reserves for future needs",
      others: "Aggressive over-harvesting causing patchy or depleted donor zones",
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">

        {/* Centered Heading & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold uppercase tracking-wider block mb-2">
            Clear Standards. Clear Results.
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight mb-3">
            How {COMPANY_NAME} Differs from
            Other Clinics?
          </h2>
        </div>

        {/* Comparison Table Container */}
        <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-nexgen-primaryGold/25 overflow-hidden shadow-md bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[620px]">

              {/* Table Header */}
              <thead>
                <tr className="bg-nexgen-veryDarkHeader text-white border-b border-nexgen-primaryGold/20">
                  <th className="py-4 sm:py-5 px-6 sm:px-8 text-xs sm:text-sm font-bold text-white w-[26%]">
                    Features
                  </th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 text-xs sm:text-sm font-bold text-nexgen-brightGold bg-nexgen-servicesSection w-[42%] border-x border-nexgen-primaryGold/30">
                    {COMPANY_NAME}
                  </th>
                  <th className="py-4 sm:py-5 px-6 sm:px-8 text-xs sm:text-sm font-bold text-gray-300 w-[32%]">
                    Others
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-200">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">

                    {/* Feature Title */}
                    <td className="py-4 sm:py-5 px-6 sm:px-8 text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader align-middle">
                      {row.feature}
                    </td>

                    {/* Our Clinic Column (Highlighted with Soft Page Light Background) */}
                    <td className="py-4 sm:py-5 px-6 sm:px-8 text-xs sm:text-sm font-medium text-nexgen-veryDarkHeader bg-nexgen-pageLightBg/80 border-x border-nexgen-primaryGold/20 align-middle">
                      <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-nexgen-primaryGold flex-shrink-0 stroke-[2.5]" />
                        <span>{row.ourClinic}</span>
                      </div>
                    </td>

                    {/* Others Column */}
                    <td className="py-4 sm:py-5 px-6 sm:px-8 text-xs sm:text-sm font-normal text-gray-500 align-middle">
                      <div className="flex items-center gap-3">
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 stroke-[2.2]" />
                        <span>{row.others}</span>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
