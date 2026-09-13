"use client";

import React from "react";
import { Award, BadgePercent, Cpu, Globe2, LucideIcon } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface ReasonCard {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

const REASONS: ReasonCard[] = [
  {
    id: 1,
    icon: Award,
    title: "World-Class Expertise",
    description: "Highly skilled surgeons with years of experience in advanced techniques like FUE, FUT, and specialized restoration.",
  },
  {
    id: 2,
    icon: BadgePercent,
    title: "Affordable Treatment Costs",
    description: "India offers the same advanced treatments at a fraction of international prices — saving up to 80% with luxury hospitality.",
  },
  {
    id: 3,
    icon: Cpu,
    title: "Cutting-Edge Technology",
    description: "Use of the latest methods such as Sapphire FUE, advanced folicular extraction, and microscopic graft preservation.",
  },
  {
    id: 4,
    icon: Globe2,
    title: "Trusted Destination Worldwide",
    description: "India attracts thousands of medical tourists each year for premier hair restoration with exceptional safety records.",
  },
];

export default function MedicalWhyIndiaSection() {
  return (
    <section id="why-india" className="py-20 lg:py-24 bg-[#f8faf8] overflow-hidden">
      <div className="qht-container">

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#1b392b]/10 text-[#1b392b] text-xs font-bold tracking-wider uppercase mb-3">
              Destination Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[600] text-[#162418] tracking-tight leading-tight">
              Why India is the Top Choice for Hair Transplant
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-md lg:text-right leading-relaxed">
            India is the world’s top choice for hair transplants due to its world-class surgeons, advanced techniques, and affordable treatment costs.
          </p>
        </div>

        {/* Content Layout: 1 Featured Brand Card + 4 Grid USP Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

          {/* Left Side: Featured India Reason Card */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[#1b392b] to-[#12241b] rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-xl border border-[#284c3b]">
            {/* Background Decorative Graphic */}
            <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-[#b1fc85]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Stat typography */}
            <div className="relative z-10">
              <div className="flex items-baseline gap-1 text-white font-extrabold tracking-tight">
                <span className="text-6xl sm:text-7xl text-[#b1fc85]">0</span>
                <span className="text-6xl sm:text-7xl text-white">4</span>
              </div>
              <p className="text-xs uppercase tracking-widest text-[#b1fc85] font-semibold mt-1">
                Top Pillar Highlights
              </p>
            </div>

            {/* India Map Illustration */}
            <div className="my-8 relative z-10 flex items-center justify-center">
              <div className="relative w-52 sm:w-60 h-52 sm:h-60">
                <img
                  src="/images/Map.webp"
                  alt="India Medical Tourism Map"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Bottom Title */}
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                Reasons to Choose Hair Transplant in India
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-2">
                Uncompromising clinical safety, accredited surgical theaters, and personalized VIP international support.
              </p>
            </div>
          </div>

          {/* Right Side: 2x2 Grid of Feature Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {REASONS.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-200/80 shadow-sm hover:shadow-md hover:border-[#1b392b]/30 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-[#eff5f1] border border-[#d6e5d8] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#1b392b] transition-all duration-300">
                      <IconComp className="w-7 h-7 text-[#1b392b] group-hover:text-white transition-colors" />
                    </div>

                    {/* Title */}
                    <h4 className="text-xl font-bold text-[#162418] tracking-tight group-hover:text-[#1b392b] transition-colors">
                      {item.title}
                    </h4>

                    {/* Description */}
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#1b392b] font-semibold">
                    <span>Verified Standard</span>
                    <span className="text-[#1b392b]">✦ ✦ ✦</span>
                  </div>
                </div>
              )
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
