"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

export default function ClinicHero() {
  return (
    <section className="relative h-[70vh] min-h-[420px] max-h-[560px] flex items-center justify-center overflow-hidden bg-[#162418]">
      {/* Clinic Corridor Interior Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-14-at-2-25-24-pm-mu16ngv5sdupct.jpeg"
          alt={`${COMPANY_NAME} Clinic Interior Corridor`}
          className="w-full h-full object-cover object-center"
        />
        {/* Soft Warm/Dark Gradient Overlay for Optimal Text Readability */}
        <div className="absolute inset-0 bg-black/40 via-black/25 to-black/50" />
      </div>

      {/* Hero Content in Center */}
      <div className="relative z-10 qht-container text-center px-4 py-12 flex flex-col items-center">

        {/* Breadcrumb: Home > Our Clinic */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-white/90 font-medium">
            <li>
              <Link href="/" className="hover:text-white transition-colors underline-offset-2 hover:underline">
                Home
              </Link>
            </li>
            <li className="flex items-center text-white/70">
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </li>
            <li className="text-white font-semibold">
              Our Clinic
            </li>
          </ol>
        </nav>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[500] text-white tracking-tight leading-[1.12] drop-shadow-md max-w-4xl">
          State-of-the-Art Facilities & <br />
          Clinical Excellence
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-white/95 font-medium drop-shadow max-w-2xl">
          Explore {COMPANY_NAME}’s modern surgical suites, sterile operating theaters, and patient-first medical infrastructure across India.
        </p>

      </div>
    </section>
  );
}
