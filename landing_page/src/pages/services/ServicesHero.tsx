"use client";

import React from "react";

interface ServicesHeroProps {
  onOpenConsultation?: () => void;
}

export default function ServicesHero({ onOpenConsultation }: ServicesHeroProps) {
  return (
    <section className="relative w-full bg-nexgen-pageLightBg overflow-hidden flex items-center justify-center pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 lg:pb-24">
      <div className="qht-large-container relative z-10 w-full">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          {/* Main Hero Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.15]">
            Advanced{" "}
            <span className="text-nexgen-primaryGold font-[500]">
              Hair Restoration
            </span>
            <br className="hidden sm:inline" />{" "}
            & Aesthetic Excellence.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg lg:text-[19px] text-nexgen-serviceInnerCard font-normal leading-relaxed max-w-2xl mx-auto">
            Doctor-led surgical precision, bespoke hairline architecture, and permanent density with expert care.
          </p>
        </div>
      </div>
    </section>
  );
}
