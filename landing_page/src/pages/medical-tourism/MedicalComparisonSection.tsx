"use client";

import React from "react";
import { Star, Layers, Sparkles } from "lucide-react";
import { useConsultation } from "@/context/ConsultationContext";
import { COMPANY_NAME } from "@/config/constants";

interface ComparisonRow {
  feature: string;
  fue: string;
  qht: string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Graft Storage Time",
    fue: "30–90 mins",
    qht: "<30 mins",
  },
  {
    feature: "Graft Survival Rate",
    fue: "75–85%",
    qht: "95%+",
  },
  {
    feature: "Healing Time",
    fue: "7–10 days",
    qht: "3–5 days",
  },
  {
    feature: "Result Onset",
    fue: "8–12 months",
    qht: "6–9 months",
  },
  {
    feature: "Surgeon Involvement",
    fue: "Moderate",
    qht: "High – expert-led",
  },
];

export default function MedicalComparisonSection() {
  const { openConsultation } = useConsultation();

  return (
    <section className="py-20 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* ========================================================
            HEADER
           ======================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#162418] tracking-tight leading-tight">
            FUE vs Advanced Techniques: Clear Comparisons
          </h2>
          <div className="mt-4 text-xs sm:text-sm text-gray-500 leading-relaxed space-y-1">
            <p>At {COMPANY_NAME}, we’ve taken traditional FUE to the next level with precision graft handling and advanced protocols.</p>
            <p>How our technique delivers superior density and faster healing.</p>
          </div>
        </div>

        {/* ========================================================
            3 SEPARATE CARD COLUMNS
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Card 1: Feature Column */}
          <div className="bg-[#eff5f1] rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-[#e2ece4]">
            {/* Header */}
            <div className="pb-6 border-b border-gray-200/70 min-h-[64px] flex items-center">
              <h3 className="text-xl sm:text-2xl font-bold text-[#162418]">
                Feature
              </h3>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-200/70 flex-1 flex flex-col justify-around">
              {COMPARISON_ROWS.map((row, idx) => (
                <div
                  key={idx}
                  className="py-5 sm:py-6 text-sm sm:text-base font-semibold text-[#162418] flex items-center"
                >
                  {row.feature}
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: FUE Technique Column */}
          <div className="bg-[#eff5f1] rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-[#e2ece4]">
            {/* Header */}
            <div className="pb-6 border-b border-gray-200/70 min-h-[64px] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#d6e5d8] flex items-center justify-center flex-shrink-0 shadow-xs">
                <Layers className="w-5 h-5 text-[#1b392b]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#162418]">
                Standard FUE
              </h3>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-200/70 flex-1 flex flex-col justify-around">
              {COMPARISON_ROWS.map((row, idx) => (
                <div
                  key={idx}
                  className="py-5 sm:py-6 text-sm sm:text-base font-medium text-gray-700 flex items-center"
                >
                  {row.fue}
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Advanced Benefits Column */}
          <div className="bg-[#eff5f1] rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-[#e2ece4]">
            {/* Header */}
            <div className="pb-6 border-b border-gray-200/70 min-h-[64px] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1b392b] flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5 text-[#b1fc85]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#162418]">
                Our Advanced Protocol
              </h3>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-200/70 flex-1 flex flex-col justify-around">
              {COMPARISON_ROWS.map((row, idx) => (
                <div
                  key={idx}
                  className="py-5 sm:py-6 text-sm sm:text-base font-bold text-[#162418] flex items-center"
                >
                  {row.qht}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================
            BOTTOM CONNECT BANNER
           ======================================================== */}
        <div className="mt-10 bg-[#52664d] rounded-2xl sm:rounded-3xl p-6 sm:py-7 sm:px-10 text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          
          {/* Left: Google Rating Badge */}
          <div className="flex items-center gap-4 lg:pr-8 lg:border-r lg:border-white/30 w-full lg:w-auto justify-center lg:justify-start">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-2 shadow-xs flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1 text-white mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-white text-white" />
                ))}
              </div>
              <p className="text-xs sm:text-[13px] text-white/95 font-medium whitespace-nowrap">
                4.9 rating, 2,091 google reviews
              </p>
            </div>
          </div>

          {/* Center: Headline */}
          <div className="text-center lg:text-left flex-1">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              Connect with <br className="hidden sm:inline lg:hidden xl:inline" />
              hair transplant expert.
            </h3>
          </div>

          {/* Right: Consult Now Button */}
          <div className="flex-shrink-0">
            <button
              onClick={openConsultation}
              className="px-8 py-3.5 rounded-full bg-white text-[#162418] font-bold text-sm sm:text-base shadow-md hover:bg-[#eff5f1] transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              Consult Now
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
