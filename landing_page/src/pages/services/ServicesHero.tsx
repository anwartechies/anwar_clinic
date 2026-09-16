"use client";

import React from "react";

interface ServicesHeroProps {
  onOpenConsultation?: () => void;
}

export default function ServicesHero({ onOpenConsultation }: ServicesHeroProps) {
  return (
    <section className="relative w-full bg-nexgen-pageLightBg bg-cover bg-right md:bg-center overflow-hidden min-h-[480px] sm:min-h-[540px] lg:min-h-[620px] flex items-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 35% center",
      }}
    >
      {/* Soft gradient overlay on mobile for optimal text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-nexgen-pageLightBg via-nexgen-pageLightBg/85 to-transparent md:hidden pointer-events-none" />

      <div className="qht-large-container relative z-10 w-full pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-2xl">
          {/* Main Hero Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.12]">
            Advanced{" "}
            <span className="text-nexgen-primaryGold font-[500]">
              Hair Restoration
            </span>
            <br />
            & Aesthetic Excellence.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg lg:text-[19px] text-nexgen-serviceInnerCard font-normal leading-relaxed max-w-xl">
            Doctor-led surgical precision, bespoke hairline architecture, and permanent density with expert care.
          </p>
        </div>
      </div>
    </section>
  );
}
