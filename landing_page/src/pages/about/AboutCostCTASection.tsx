"use client";

import React from "react";
import Link from "next/link";
import { COMPANY_NAME } from "@/config/constants";

interface AboutCostCTASectionProps {
  onOpenConsultation?: () => void;
}

export default function AboutCostCTASection({
  onOpenConsultation,
}: AboutCostCTASectionProps) {
  return (
    <section className="py-8 sm:py-10 bg-nexgen-mainDarkBg text-white relative overflow-hidden border-y border-nexgen-primaryGold/25">
      {/* Subtle background glow */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-96 h-96 bg-nexgen-primaryGold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="qht-large-container relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8 py-4 px-2 sm:px-4">
          
          {/* Left: Icon + Heading & Subtitle */}
          <div className="flex items-center gap-5 sm:gap-6">
            
            {/* Outlined Calculator & Invoice Icon */}
            <div className="w-12 sm:w-14 h-12 sm:h-14 flex-shrink-0 text-nexgen-brightGold">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full"
              >
                {/* Invoice Sheet */}
                <path d="M8 6C8 4.89543 8.89543 4 10 4H26L34 12V34C34 35.1046 33.1046 36 32 36H10C8.89543 36 8 35.1046 8 34V6Z" />
                <path d="M26 4V12H34" />
                {/* Currency Symbol & Lines on Invoice */}
                <path d="M15 13H21" />
                <path d="M18 10V18" />
                <path d="M15 22H27" />
                <path d="M15 27H23" />
                
                {/* Overlapping Calculator on Right */}
                <rect x="22" y="18" width="18" height="24" rx="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
                <rect x="26" y="22" width="10" height="4" rx="1" />
                <circle cx="27" cy="30" r="1" fill="currentColor" />
                <circle cx="31" cy="30" r="1" fill="currentColor" />
                <circle cx="35" cy="30" r="1" fill="currentColor" />
                <circle cx="27" cy="35" r="1" fill="currentColor" />
                <circle cx="31" cy="35" r="1" fill="currentColor" />
                <circle cx="35" cy="35" r="1" fill="currentColor" />

                {/* Coin Stacks on Left */}
                <ellipse cx="14" cy="39" rx="6" ry="2" />
                <ellipse cx="14" cy="42" rx="6" ry="2" />
                <ellipse cx="14" cy="45" rx="6" ry="2" />
              </svg>
            </div>

            {/* Text */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-[500] text-white tracking-tight leading-tight">
                Curious About Procedure Pricing?
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 font-normal mt-1 leading-normal">
                Explore transparent, itemized procedure costs and flexible financing options at {COMPANY_NAME}.
              </p>
            </div>

          </div>

          {/* Right: Contact Us CTA Button */}
          <div className="flex-shrink-0 self-start sm:self-center">
            {onOpenConsultation ? (
              <button
                type="button"
                onClick={onOpenConsultation}
                className="bg-nexgen-brightGold hover:bg-yellow-400 text-nexgen-veryDarkHeader font-bold text-xs sm:text-sm px-7 sm:px-8 py-3 rounded-full shadow-md transition-all active:scale-95 duration-150 inline-flex items-center justify-center cursor-pointer"
              >
                Contact Us
              </button>
            ) : (
              <Link
                href="/contact-us/"
                className="bg-nexgen-brightGold hover:bg-yellow-400 text-nexgen-veryDarkHeader font-bold text-xs sm:text-sm px-7 sm:px-8 py-3 rounded-full shadow-md transition-all active:scale-95 duration-150 inline-flex items-center justify-center"
              >
                Contact Us
              </Link>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
