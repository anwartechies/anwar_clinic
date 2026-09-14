"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Phone } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";


interface CostHeroProps {
  onOpenConsultation?: () => void;
}

export default function CostHero({ onOpenConsultation }: CostHeroProps) {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 bg-[#596d53] text-white overflow-hidden">
      <div className="qht-large-container">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-white/70 font-normal mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-white/50" />
          <span className="text-white/95 font-medium">
            Hair Transplant Cost in India
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left Column: Heading, Subtitle & CTAs */}
          <div className="lg:col-span-7 space-y-6">

            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1 rounded-full text-xs font-semibold text-white">
              <span>NATURAL HAIR. NEXT GEN YOU.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-[500] text-white tracking-tight leading-[1.12]">
              Hair Transplant Cost <br className="hidden sm:block" />
              <span className="text-[#b1fc85]">in India</span> | Transparent <br className="hidden sm:block" />
              Pricing, Natural Results.
            </h1>

            {/* Overview Paragraph */}
            <p className="text-xs sm:text-lg text-white/85 leading-relaxed font-normal max-w-xl">
              Hair transplant pricing at {COMPANY_NAME} is 100% transparent and starts from just ₹10/graft (FUE), ₹15/graft (Bio FUE & DHI), and ₹25/graft (Premium DHI with Sapphire Blade). Every package includes complimentary PRP/GFC sessions, 5 days medication, bandage removal, headwash, blood tests, and post-transplant doctor consultations.
            </p>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenConsultation}
                className="bg-white hover:bg-gray-100 text-[#1b221d] font-bold text-sm sm:text-base py-3.5 px-8 rounded-full shadow-lg transition-all active:scale-95 duration-150 cursor-pointer"
              >
                Book Free Consultation
              </button>

              <a
                href="tel:+918797363636"
                className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/80 font-semibold text-sm sm:text-base py-3.5 px-8 rounded-full transition-all active:scale-95 duration-150"
              >
                <Phone className="w-4 h-4" />
                <span>Call: 8797363636</span>
              </a>
            </div>

          </div>

          {/* Right Column: "At a glance - NexGen" Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[430px] rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100 text-gray-800">

              {/* Card Dark Header */}
              <div className="bg-[#243322] py-4 px-6 text-center">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  At a glance — {COMPANY_NAME}
                </h3>
              </div>

              {/* Card Body Rows */}
              <div className="p-6 sm:p-7 divide-y divide-gray-100 text-xs sm:text-[13px]">

                {/* Row 1: FUE */}
                <div className="pb-3.5 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">FUE Technique</span>
                  <span className="font-extrabold text-[#1b392b] text-sm">₹10 / graft</span>
                </div>

                {/* Row 2: Bio FUE */}
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Bio FUE (DMEM Medium)</span>
                  <span className="font-extrabold text-[#1b392b] text-sm">₹15 / graft</span>
                </div>

                {/* Row 3: DHI */}
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">DHI Technique</span>
                  <span className="font-extrabold text-[#1b392b] text-sm">₹15 / graft</span>
                </div>

                {/* Row 4: Premium DHI */}
                <div className="py-3.5 flex items-center justify-between bg-[#f4f7f4] -mx-6 sm:-mx-7 px-6 sm:px-7">
                  <span className="text-[#1b392b] font-bold">Premium DHI (Sapphire + DMEM)</span>
                  <span className="font-extrabold text-[#1b392b] text-sm">₹25 / graft</span>
                </div>

                {/* Row 5: Package Benefits */}
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Free Package Inclusions</span>
                  <span className="font-bold text-[#596d53]">PRP/GFC + Meds + Wash</span>
                </div>

                {/* Row 6: Location */}
                <div className="pt-3.5 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Main Clinic (Patna)</span>
                  <span className="font-bold text-gray-900">Pillar No-55, Razabazar</span>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
