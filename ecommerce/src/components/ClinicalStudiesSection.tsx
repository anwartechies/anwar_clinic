"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function ClinicalStudiesSection() {
  const bars = [
    { period: "1-3 month", height: "h-[20%]", label: "1-3 month" },
    { period: "3-6 month", height: "h-[40%]", label: "3-6 month" },
    { period: "6-9 month", height: "h-[62%]", label: "6-9 month" },
    { period: "9-12 month", height: "h-[80%]", label: "9-12 month" },
    { period: "12-18 month", height: "h-[100%]", label: "12-18 month" },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#edf6eb] border-t border-gray-100/80">
      <div className="qht-large-container">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5c685f] block mb-2">
            CLINICAL STUDIES
          </span>

          <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#1b221d] tracking-tight leading-tight mb-3 sm:mb-4">
            How it Will Help You
          </h2>

          <p className="text-xs sm:text-sm text-[#5c685f] leading-relaxed font-normal">
            NexGen Complete Hair Care Routine Kit combines six products that work together to provide deep nourishment to the scalp and hair follicles. Instead of relying on a single product, this kit contains products formulated with clinically proven ingredients that support scalp health, nourish follicles, improve hair density, and reduce hair fall simultaneously.
          </p>
        </div>

        {/* 2-Card Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch max-w-5xl mx-auto">

          {/* Left Card: Hair Growth Timeline Bar Chart */}
          <div className="lg:col-span-6 bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between overflow-hidden">

            <div>
              {/* Card Top Title & Badge */}
              <div className="flex items-center justify-between gap-2 mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-[#1b221d]">
                  Your Growth
                </h3>
                <span className="bg-[#e4ebf8] text-[#335384] text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-xl whitespace-nowrap">
                  Your Hair Growth Journey
                </span>
              </div>

              {/* Chart Visual with Horizontal Scroll for Mobile */}
              <div className="overflow-x-auto no-scrollbar pb-2">
                <div className="min-w-[380px] sm:min-w-0">
                  <div className="flex items-end gap-3 sm:gap-4 h-56 sm:h-72 pt-4 pb-2 border-b border-gray-200 relative">

                    {/* Left Y-Axis Milestones */}
                    <div className="flex flex-col justify-between h-full text-[9.5px] sm:text-[11px] text-[#5c685f] w-32 sm:w-40 flex-shrink-0 pr-2 border-r border-gray-200/80 relative font-normal">
                      <div className="flex items-center gap-1.5 relative">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2d5236] absolute -right-[11px]" />
                        <span className="leading-tight">Maintain your gains. Full density</span>
                      </div>
                      <div className="flex items-center gap-1.5 relative">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2d5236] absolute -right-[11px]" />
                        <span className="leading-tight">Maximum density achieved</span>
                      </div>
                      <div className="flex items-center gap-1.5 relative">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2d5236] absolute -right-[11px]" />
                        <span className="leading-tight">Visible density improvement</span>
                      </div>
                      <div className="flex items-center gap-1.5 relative">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2d5236] absolute -right-[11px]" />
                        <span className="leading-tight">Hair fall reduces. New baby hair</span>
                      </div>
                      <div className="flex items-center gap-1.5 relative">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2d5236] absolute -right-[11px]" />
                        <span className="leading-tight">Adjustment - Shedding is normal</span>
                      </div>
                    </div>

                    {/* 5 Growth Progress Bars */}
                    <div className="flex-1 flex items-end justify-between h-full pl-2 gap-2 sm:gap-3">
                      {bars.map((b, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div
                            className={`w-full max-w-[28px] sm:max-w-[40px] bg-[#2d5236] rounded-t-lg transition-all duration-500 ${b.height}`}
                          />
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex justify-end pt-2">
                    <div className="flex-1 flex items-center justify-between pl-34 sm:pl-44 gap-1 text-[9.5px] sm:text-[11px] font-semibold text-[#1b221d] text-center">
                      <span className="w-7 sm:w-8 leading-tight">1-3<br />mo</span>
                      <span className="w-7 sm:w-8 leading-tight">3-6<br />mo</span>
                      <span className="w-7 sm:w-8 leading-tight">6-9<br />mo</span>
                      <span className="w-7 sm:w-8 leading-tight">9-12<br />mo</span>
                      <span className="w-7 sm:w-8 leading-tight">12-18<br />mo</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Disclaimer */}
            <p className="text-[9.5px] sm:text-[11px] text-[#5c685f]/80 mt-6 sm:mt-8 leading-relaxed font-normal">
              The graph is based on insights gained from over 10 years of research, 100,000+ patient evaluations, 15,000+ successful hair transplant surgeries and the clinical experience of NexGen Clinic.
            </p>

          </div>

          {/* Right Card: 94% Efficacy Result Highlight */}
          <div className="lg:col-span-6 bg-[#d9edd2] rounded-2xl sm:rounded-[32px] p-6 sm:p-12 border border-[#c1e2b7] flex flex-col items-center justify-center text-center shadow-xs">

            {/* Big Stat */}
            <span className="text-5xl sm:text-7xl lg:text-[84px] font-bold text-[#1b392b] font-serif leading-none tracking-tight mb-2 sm:mb-3">
              94%
            </span>

            {/* Stat Subtitle */}
            <h3 className="text-base sm:text-xl font-bold text-[#1b221d] mb-6 sm:mb-8 leading-snug">
              Users saw effective results <br className="hidden sm:block" />
              in 4–6 months
            </h3>

            {/* Emblem Circle */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-xs text-[#2d5236] mb-6 sm:mb-8 border border-white/80">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#2d5236]" />
            </div>

            {/* Summary Text */}
            <p className="text-xs sm:text-sm text-[#2b3a2a] leading-relaxed max-w-sm font-medium">
              NexGen Complete Hair Care Routine Kit combines products formulated with clinically proven ingredients to address hair fall from multiple angles for long-term hair care.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}
