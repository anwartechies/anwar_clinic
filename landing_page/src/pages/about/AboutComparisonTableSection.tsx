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
      feature: "Technology",
      ourClinic: "Sapphire instruments, high magnification lenses",
      others: "Mixed/outdated instruments",
    },
    {
      feature: "Hygiene/ Safety",
      ourClinic: "Hospital-grade sterilization and safety practices throughout.",
      others: "Varies often inconsistent",
    },
    {
      feature: "Pricing",
      ourClinic: "All costs are clearly outlined in the quote- no hidden charges",
      others: "Additional add-ons not shown in the quote and unclear pricing",
    },
    {
      feature: "Hairline Design",
      ourClinic: "Face-fit, age-appropriate, and natural-looking hairline design",
      others: "All hairlines are uniform and occasionally pluggy",
    },
    {
      feature: "Treatment Planning",
      ourClinic: "Customized plan for each patient",
      others: "Standardized template approach",
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
            How {COMPANY_NAME} Differs from <br className="hidden sm:inline" />
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
