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
          "linear-gradient(rgba(22, 36, 24, 0.88), rgba(27, 57, 43, 0.92)), url('https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/hp-bottom-banner-img-mtzluh7iln19oe.webp')",
      }}
    >
      <div className="qht-container text-center max-w-2xl mx-auto">
        {/* <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#b1fc85] text-[#162418] text-xs font-bold rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Start Today
        </span> */}

        <h2 className="text-3xl sm:text-7xl font-[500] leading-tight tracking-tight">
          Ready to Restore Your Natural Hairline for Life?
        </h2>

        <p className="mt-4 text-sm sm:text-lg text-gray-200 leading-relaxed max-w-2xl mx-auto">
          Early action preserves more of your natural donor reserves. Book a confidential consultation with our senior restoration team today.
        </p>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onOpenConsultation}
            className="px-8 py-4 bg-white text-[#1b392b] font-bold text-sm sm:text-base rounded-full hover:bg-[#b1fc85] hover:text-[#162418] transition-all shadow-xl flex items-center gap-2"
          >
            <span>Book Your Consultation Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
