"use client";

import React from "react";

interface ServiceBookingBarProps {
  title?: string;
  patientCountText?: string;
  onOpenConsultation?: () => void;
}

export default function ServiceBookingBar({
  title = "Trusted Hair Restoration Experts — Schedule Your Evaluation Today",
  patientCountText = "Over 4,500+ successful restorations performed",
  onOpenConsultation,
}: ServiceBookingBarProps) {
  return (
    <section className="py-8 sm:py-10 bg-nexgen-mainDarkBg text-white overflow-hidden border-y border-nexgen-primaryGold/30">
      <div className="qht-large-container">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">

          {/* Left Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-[500] text-white tracking-tight leading-tight text-center lg:text-left max-w-xl">
            {title}
          </h2>

          {/* Center Social Proof (Avatars + Count) */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:block w-px h-10 bg-white/30" />

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img
                  src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/testimonial-3-mu2jxhk9h6w4rt.jpg"
                  alt="Patient"
                  className="w-8 h-8 rounded-full border-2 border-nexgen-primaryGold object-cover"
                />
                <img
                  src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/testimonial-2-mu2jxhc5aa4czi.jpg"
                  alt="Patient"
                  className="w-8 h-8 rounded-full border-2 border-nexgen-primaryGold object-cover"
                />
                <img
                  src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/testimonial-1-mu2jxgr4xjdvq4.jpg"
                  alt="Patient"
                  className="w-8 h-8 rounded-full border-2 border-nexgen-primaryGold object-cover"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-white/95 whitespace-nowrap">
                {patientCountText}
              </span>
            </div>

            <div className="hidden lg:block w-px h-10 bg-white/30" />
          </div>

          {/* Right CTA Button */}
          <div className="flex-shrink-0">
            <button
              onClick={onOpenConsultation}
              className="bg-nexgen-brightGold hover:brightness-105 text-nexgen-veryDarkHeader font-bold text-sm sm:text-base py-3 px-8 sm:px-10 rounded-full shadow-md transition-all active:scale-95 duration-150"
            >
              Book Now
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
