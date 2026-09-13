"use client";

import React from "react";
import { HERO_SLIDES } from "@/data/qhtData";
import { COMPANY_NAME } from "@/config/constants";

interface HeroSectionProps {
  onOpenConsultation: () => void;
}

export default function HeroSection({ onOpenConsultation }: HeroSectionProps) {
  const duplicatedSlides = [...HERO_SLIDES, ...HERO_SLIDES];

  return (
    <section className="pt-28 sm:pt-36 lg:pt-40 pb-16 bg-[#f4f7f4] overflow-hidden">
      <div className="qht-container text-center">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[58px] font-[500] text-[#181d19] tracking-tight leading-[1.18] max-w-7xl mx-auto">
          Pioneering Natural Hair Restoration & Artistic Precision,{" "}
          {/* <br /> */}
          <span className="text-[#52664d] font-[500] inline-block mt-1">
            at {COMPANY_NAME}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3.5 text-sm sm:text-[20px] text-[#5c685f] max-w-4xl mx-auto font-normal leading-relaxed">
          Clinically advanced, undetectable results tailored to your unique facial aesthetics — restoring lifelong density, youthful definition, and confidence.
        </p>

        {/* Primary CTA Button */}
        <div className="mt-6 sm:mt-7 flex justify-center">
          <button
            onClick={onOpenConsultation}
            className="bg-[#52664d] hover:bg-[#43543e] text-white font-medium text-sm sm:text-[15px] py-3.5 px-8 sm:px-9 rounded-full shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Schedule Your Free Scalp Evaluation
          </button>
        </div>
      </div>

      {/* Infinite Horizontal Showcase Carousel */}
      <div className="mt-10 sm:mt-12 relative w-full overflow-hidden">
        <div className="animate-marquee gap-4 sm:gap-5">
          {duplicatedSlides.map((slide, idx) => (
            <div
              key={idx}
              className="relative w-[280px] sm:w-[320px] md:w-[470px] rounded-[24px] overflow-hidden flex-shrink-0 shadow-sm"
            >
              {/* Card Top Label: Name + Location */}
              {/* <div className="px-3 pt-1 pb-2 flex items-baseline gap-1.5 text-white">
                <span className="font-bold text-sm sm:text-base tracking-tight">
                  {slide.name}
                </span>
                {slide.location && (
                  <span className="text-[11px] text-white/80 font-normal">
                    {slide.location.replace(", India", "")}
                  </span>
                )}
              </div> */}

              {/* Card Image */}
              <div className="relative w-full h-[240px] sm:h-[390px] rounded-[18px] overflow-hidden bg-white">
                <img
                  src={slide.image}
                  alt={slide.name}
                  className="w-full h-full object-fit object-center"
                  loading={idx < 4 ? "eager" : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
