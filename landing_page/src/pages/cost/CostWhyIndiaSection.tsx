"use client";

import React from "react";
import {
  Building2,
  Stethoscope,
  BadgePercent,
  MessageSquare,
  Plane,
} from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

export default function CostWhyIndiaSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Why India Benefits */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-[1.12] mb-4">
                Why India is the Smartest Choice <br />
                for Hair Transplant
              </h2>
              <p className="text-xs sm:text-sm text-[#5c685f] leading-relaxed font-normal max-w-xl">
                India has emerged as a top global destination for medical tourism, particularly hair restoration. International patients are choosing India for the combination of expert surgical care, world-class infrastructure, and consistently satisfactory results - at a fraction of the global cost.
              </p>
            </div>

            {/* 5 Distinct Benefit Rows */}
            <div className="divide-y divide-gray-100 pt-2">
              
              {/* Row 1: World-Class Surgical Infrastructure */}
              <div className="py-6 first:pt-0 flex items-start gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-xl bg-[#eff5f1] text-[#596d53] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1b221d] mb-1">
                    World-Class Surgical Infrastructure
                  </h3>
                  <p className="text-xs text-[#5c685f] leading-relaxed font-normal">
                    India's leading hair transplant clinics are equipped with modern surgical tools, digital scalp analysis systems, standardised hygiene protocols and dedicated operating theatres - matching or exceeding global standards.
                  </p>
                </div>
              </div>

              {/* Row 2: Internationally Trained Surgeons */}
              <div className="py-6 flex items-start gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-xl bg-[#eff5f1] text-[#596d53] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Stethoscope className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1b221d] mb-1">
                    Internationally Trained Surgeons
                  </h3>
                  <p className="text-xs text-[#5c685f] leading-relaxed font-normal">
                    Procedures at {COMPANY_NAME} are performed by experienced, certified hair restoration surgeons — never delegated to uncertified staff. With extensive cases completed at {COMPANY_NAME} across all Norwood grades, our medical team handles primary restorations as well as complex corrective and revision surgeries.
                  </p>
                </div>
              </div>

              {/* Row 3: Significant Cost Savings vs US & UK */}
              <div className="py-6 flex items-start gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-xl bg-[#eff5f1] text-[#596d53] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BadgePercent className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1b221d] mb-1">
                    Significant Cost Savings vs US & UK
                  </h3>
                  <p className="text-xs text-[#5c685f] leading-relaxed font-normal">
                    The same FUE procedure that costs ₹250–₹800 per graft in the UK or USA can be performed in India for ₹50–₹120 per graft - with expert surgical care, modern infrastructure, and globally aligned clinical protocols. World-class quality at a fraction of the global cost.
                  </p>
                </div>
              </div>

              {/* Row 4: Personalised Pre & Post-Surgery Support */}
              <div className="py-6 flex items-start gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-xl bg-[#eff5f1] text-[#596d53] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1b221d] mb-1">
                    Personalised Pre & Post-Surgery Support
                  </h3>
                  <p className="text-xs text-[#5c685f] leading-relaxed font-normal">
                    A dedicated team of experts assists international patients with pre- and post-surgical queries throughout the journey - from initial consultation to recovery. Personalised hair restoration plans are tailored to each patient's individual needs and expectations.
                  </p>
                </div>
              </div>

              {/* Row 5: Multi-City Clinic Network */}
              <div className="py-6 last:pb-0 flex items-start gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-xl bg-[#eff5f1] text-[#596d53] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Plane className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1b221d] mb-1">
                    Multi-City Clinic Network
                  </h3>
                  <p className="text-xs text-[#5c685f] leading-relaxed font-normal">
                    {COMPANY_NAME} operates centers across 2 strategic hubs — Patna (Main Branch) and Mumbai (Second Branch) — making it accessible for both domestic and international patients to plan their procedure and follow-up care.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: QHT Clinic By the Numbers Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[430px] rounded-3xl p-7 sm:p-9 bg-[#485942] text-white shadow-2xl space-y-6 divide-y divide-white/15 border border-white/10">
              
              <div className="pb-1">
                <span className="text-xs sm:text-[13px] font-bold text-white/90 tracking-wide uppercase block">
                  {COMPANY_NAME} By the Numbers
                </span>
              </div>

              {/* Stat 1 */}
              <div className="pt-6">
                <div className="text-4xl sm:text-5xl font-black text-[#b1fc85] tracking-tight leading-none">
                  15,000+
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-2 leading-snug">
                  Successful hair transplant procedures performed
                </p>
              </div>

              {/* Stat 2 */}
              <div className="pt-6">
                <div className="text-4xl sm:text-5xl font-black text-[#b1fc85] tracking-tight leading-none">
                  4.9★
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-2 leading-snug">
                  Average Google rating from 2,091+ verified patient reviews
                </p>
              </div>

              {/* Stat 3 */}
              <div className="pt-6">
                <div className="text-4xl sm:text-5xl font-black text-[#b1fc85] tracking-tight leading-none">
                  10+
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-2 leading-snug">
                  Years of clinical experience in advanced hair restoration
                </p>
              </div>

              {/* Stat 4 */}
              <div className="pt-6">
                <div className="text-4xl sm:text-5xl font-black text-[#b1fc85] tracking-tight leading-none">
                  ₹0
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-2 leading-snug">
                  Hidden charges – transparent, upfront pricing with no surprises
                </p>
              </div>

              {/* Stat 5 */}
              <div className="pt-6">
                <div className="text-4xl sm:text-5xl font-black text-[#b1fc85] tracking-tight leading-none">
                  02
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-2 leading-snug">
                  Clinic locations: Patna (Main Branch), Mumbai (Second Branch)
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
