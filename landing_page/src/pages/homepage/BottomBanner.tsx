"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface BottomBannerProps {
  onOpenConsultation: () => void;
}

export default function BottomBanner({ onOpenConsultation }: BottomBannerProps) {
  return (
    <section
      className="py-20 relative bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(var(--nexgen-very-dark-header-rgb), 0.90), rgba(var(--nexgen-main-dark-bg-rgb), 0.94)), url('https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/hp-bottom-banner-img-mtzluh7iln19oe.webp')",
      }}
    >
      <div className="qht-container text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-7xl font-[500] leading-tight tracking-tight">
          Ready to Restore Your Natural Hairline for Life?
        </h2>

        <p className="mt-4 text-sm sm:text-lg text-gray-200 leading-relaxed max-w-2xl mx-auto">
          Early action preserves more of your natural donor reserves. Book a confidential consultation with our senior restoration team today.
        </p>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onOpenConsultation}
            className="px-8 py-4 bg-nexgen-brightGold hover:bg-nexgen-primaryGold text-nexgen-veryDarkHeader font-bold text-sm sm:text-base rounded-full transition-all shadow-xl flex items-center gap-2 cursor-pointer"
          >
            <span>Book Your Consultation Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
