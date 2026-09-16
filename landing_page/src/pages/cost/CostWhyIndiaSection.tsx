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
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.12] mb-4">
                Why India is the Smartest Choice <br />
                for Hair Transplant
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-xl">
                India has emerged as a top global destination for medical tourism, particularly hair restoration. International patients are choosing India for the combination of expert surgical care, world-class infrastructure, and consistently satisfactory results - at a fraction of the global cost.
              </p>
            </div>

            {/* 5 Distinct Benefit Rows */}
            <div className="divide-y divide-gray-100 pt-2">

              {/* Row 1: World-Class Surgical Infrastructure */}
              <div className="py-6 first:pt-0 flex items-start gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-xl bg-nexgen-primaryGold/10 text-nexgen-primaryGold flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-nexgen-veryDarkHeader mb-1">
                    World-Class Surgical Infrastructure
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    India's leading hair transplant clinics are equipped with modern surgical tools, digital scalp analysis systems, standardised hygiene protocols and dedicated operating theatres - matching or exceeding global standards.
                  </p>
                </div>
              </div>

              {/* Row 2: Internationally Trained Surgeons */}
              <div className="py-6 flex items-start gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-xl bg-nexgen-primaryGold/10 text-nexgen-primaryGold flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Stethoscope className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-nexgen-veryDarkHeader mb-1">
                    Internationally Trained Surgeons
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    Procedures at {COMPANY_NAME} are performed by experienced, certified hair restoration surgeons — never delegated to uncertified staff. With extensive cases completed at {COMPANY_NAME} across all Norwood grades, our medical team handles primary restorations as well as complex corrective and revision surgeries.
                  </p>
                </div>
              </div>

              {/* Row 3: Significant Cost Savings vs US & UK */}
              <div className="py-6 flex items-start gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-xl bg-nexgen-primaryGold/10 text-nexgen-primaryGold flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BadgePercent className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-nexgen-veryDarkHeader mb-1">
                    Up to 80% Cost Savings vs US, UK & UAE
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    The exact same precision restoration that commands ₹250–₹800 per graft in the UK, USA, or Canada starts from just ₹10–₹25 per graft at {COMPANY_NAME} in India — backed by certified surgical specialists, sterile procedural suites, and gold-standard follicular preservation.
                  </p>
                </div>
              </div>

              {/* Row 4: Personalised Pre & Post-Surgery Support */}
              <div className="py-6 flex items-start gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-xl bg-nexgen-primaryGold/10 text-nexgen-primaryGold flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-nexgen-veryDarkHeader mb-1">
                    Dedicated Pre & Post-Procedure Concierge
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    A dedicated medical coordinator supports each patient throughout their entire journey — from initial digital trichoscopy and travel scheduling to weekly post-op washes and long-term regrowth assessments.
                  </p>
                </div>
              </div>

              {/* Row 5: Multi-City Clinic Network */}
              <div className="py-6 last:pb-0 flex items-start gap-4 sm:gap-5">
                <div className="w-10 h-10 rounded-xl bg-nexgen-primaryGold/10 text-nexgen-primaryGold flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Plane className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-nexgen-veryDarkHeader mb-1">
                    Strategic Multi-City Surgical Centers
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    {COMPANY_NAME} operates modern restoration facilities across 2 strategic hubs — Patna (Flagship Center) and Mumbai (Second Center) — offering accessible consultation and procedural access for both domestic and international travelers.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: QHT Clinic By the Numbers Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[430px] rounded-3xl p-7 sm:p-9 bg-nexgen-mainDarkBg text-white shadow-2xl space-y-6 divide-y divide-white/15 border border-nexgen-primaryGold/30">

              <div className="pb-1">
                <span className="text-xs sm:text-[13px] font-bold text-white/90 tracking-wide uppercase block">
                  {COMPANY_NAME} By the Numbers
                </span>
              </div>

              {/* Stat 1 */}
              <div className="pt-6">
                <div className="text-4xl sm:text-5xl font-black text-nexgen-brightGold tracking-tight leading-none">
                  16,000+
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-2 leading-snug">
                  Successful hair restoration procedures completed
                </p>
              </div>

              {/* Stat 2 */}
              <div className="pt-6">
                <div className="text-4xl sm:text-5xl font-black text-nexgen-brightGold tracking-tight leading-none">
                  5.0★
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-2 leading-snug">
                  Google rating backed by 2,100+ verified patient reviews
                </p>
              </div>

              {/* Stat 3 */}
              <div className="pt-6">
                <div className="text-4xl sm:text-5xl font-black text-nexgen-brightGold tracking-tight leading-none">
                  10+
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-2 leading-snug">
                  Years of specialized surgical experience in trichology
                </p>
              </div>

              {/* Stat 4 */}
              <div className="pt-6">
                <div className="text-4xl sm:text-5xl font-black text-nexgen-brightGold tracking-tight leading-none">
                  ₹0
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-2 leading-snug">
                  Hidden expenses – 100% upfront, transparent pricing guarantee
                </p>
              </div>

              {/* Stat 5 */}
              <div className="pt-6">
                <div className="text-4xl sm:text-5xl font-black text-nexgen-brightGold tracking-tight leading-none">
                  02
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-2 leading-snug">
                  Specialized surgical hubs: Patna (Flagship) & Mumbai
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
