"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { PRICING_PACKAGES } from "@/data/qhtData";

interface PricingTechniquesProps {
  onOpenConsultation?: () => void;
}

export default function PricingTechniques({
  onOpenConsultation,
}: PricingTechniquesProps) {
  return (
    <section className="py-20 sm:py-24 bg-[#f8faf8] overflow-hidden">
      <div className="qht-container">

        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-[500] text-[#162418] tracking-tight">
            Transparent Procedure Options & Pricing
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-[#5c685f] font-normal leading-relaxed">
            Explore proven, physician-administered restoration techniques tailored to your degree of hair loss, aesthetic vision, and budget.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto">
          {PRICING_PACKAGES.map((pkg, idx) => {
            const isFeatured = pkg.isFeatured;

            return (
              <div
                key={idx}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${isFeatured
                  ? "bg-[#52664d] text-white shadow-xl"
                  : "bg-white text-gray-900 border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
                  }`}
              >
                {/* Card Top: Technique Name, Full Title, Description */}
                <div>
                  <span
                    className={`text-xs font-semibold block mb-1.5 ${isFeatured ? "text-[#b1fc85]" : "text-[#5c685f]"
                      }`}
                  >
                    {pkg.technique}
                  </span>

                  <h3
                    className={`text-lg sm:text-xl font-[500] leading-snug mb-3 ${isFeatured ? "text-white" : "text-[#1b221d]"
                      }`}
                  >
                    {pkg.fullName}
                  </h3>

                  <p
                    className={`text-xs sm:text-[13px] leading-relaxed mb-6 font-normal ${isFeatured ? "text-white/85" : "text-[#5c685f]"
                      }`}
                  >
                    {pkg.desc}
                  </p>
                </div>

                {/* Middle: Pricing Row with Horizontal Border */}
                <div
                  className={`border-y py-4 my-2 flex items-center justify-between ${isFeatured ? "border-white/15" : "border-gray-100"
                    }`}
                >
                  <div>
                    <span
                      className={`text-xs font-bold block ${isFeatured ? "text-[#b1fc85]" : "text-[#1b221d]"
                        }`}
                    >
                      per graft onwards
                    </span>
                    <span
                      className={`text-xs font-normal mt-0.5 block ${isFeatured ? "text-white/80" : "text-[#5c685f]"
                        }`}
                    >
                      Total: {pkg.totalRange}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight ${isFeatured ? "text-[#b1fc85]" : "text-[#52664d]"
                        }`}
                    >
                      ₹{pkg.perGraft}
                    </span>
                  </div>
                </div>

                {/* Bottom: Feature Rows with Clean Hairline Dividers */}
                <div className="pt-2">
                  <ul
                    className={`divide-y ${isFeatured ? "divide-white/10" : "divide-gray-100"
                      }`}
                  >
                    {pkg.features.map((feature, fIdx) => (
                      <li
                        key={fIdx}
                        className={`py-3 flex items-center gap-2.5 text-xs sm:text-[13px] font-normal ${isFeatured ? "text-white" : "text-[#2b302c]"
                          }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 ${isFeatured ? "text-[#b1fc85]" : "text-[#52664d]"
                            }`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
