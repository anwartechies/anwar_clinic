"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowDown } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";
import { useConsultation } from "@/context/ConsultationContext";

export default function MedicalTourismHero() {
  const { openConsultation } = useConsultation();

  const handleScrollDown = () => {
    const nextSection = document.getElementById("why-india");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#162418]">
      {/* Background Hero Banner */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=2000&q=80"
          alt={`${COMPANY_NAME} Medical Tourism For International Patients`}
          className="w-full h-full object-cover object-center"
        />
        {/* Soft Radial & Linear Dark Gradient Overlay for Maximum Readability */}
        <div className="absolute inset-0 bg-black/45 via-black/35 to-black/60" />
      </div>

      {/* Hero Content in Center */}
      <div className="relative z-10 qht-container text-center px-4 pt-28 pb-16 flex flex-col items-center justify-center flex-1">
        
        {/* Breadcrumb: Home > Medical Tourism */}
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
          <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-white/90 font-medium">
            <li>
              <Link
                href="/"
                className="hover:text-white transition-colors underline-offset-2 hover:underline"
              >
                Home
              </Link>
            </li>
            <li className="flex items-center text-white/70">
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </li>
            <li className="text-white font-semibold">
              Medical Tourism
            </li>
          </ol>
        </nav>

        {/* Main Title Matching Screenshot */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-[600] text-white tracking-tight leading-[1.15] drop-shadow-lg max-w-4xl">
          Medical Tourism For <br className="hidden sm:inline" />
          International Patients
        </h1>

        {/* Subtitle Matching Screenshot */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-white/95 font-normal drop-shadow max-w-2xl leading-relaxed">
          Medical tourism for international patients offers access to world-class healthcare combined with the comfort of travel, making treatment both affordable and enriching.
        </p>

        {/* CTA Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={openConsultation}
            className="px-8 py-3.5 rounded-full bg-white text-[#1b392b] font-semibold text-sm sm:text-base shadow-lg hover:bg-[#eff5f1] transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            Book Free Video Consultation
          </button>
          <button
            onClick={handleScrollDown}
            className="px-7 py-3.5 rounded-full bg-transparent text-white border border-white/60 font-medium text-sm sm:text-base hover:bg-white/15 transition-all cursor-pointer"
          >
            Explore International Packages
          </button>
        </div>

        {/* Circular Down Arrow Button Matching Screenshot */}
        <button
          onClick={handleScrollDown}
          aria-label="Scroll to Why India section"
          className="mt-10 sm:mt-12 w-12 h-12 rounded-full border border-white/60 flex items-center justify-center text-white/90 hover:text-white hover:border-white hover:bg-white/10 transition-all transform hover:scale-110 cursor-pointer animate-pulse-subtle"
        >
          <ArrowDown className="w-5 h-5 stroke-[1.75]" />
        </button>

      </div>
    </section>
  );
}
