"use client";

import React from "react";
import Link from "next/link";

interface ClinicReviewsMapSectionProps {
  onOpenConsultation?: () => void;
}

export default function ClinicReviewsMapSection({
  onOpenConsultation,
}: ClinicReviewsMapSectionProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-pageLightBg overflow-hidden border-t border-gray-200/50">
      <div className="qht-large-container">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Heading, Subtitle & Action Buttons */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.14]">
              Verified Outcomes & <br />
              Patient Experiences
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-md">
              Discover authentic patient feedback and documented hair restoration journeys from clients across our nationwide centers.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Explore Reviews CTA */}
              <Link
                href="/results/"
                className="bg-nexgen-brightGold hover:bg-white text-nexgen-veryDarkHeader font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-md transition-all active:scale-95 duration-150 inline-block text-center"
              >
                Explore Reviews
              </Link>

              {/* Contact Us CTA */}
              <button
                type="button"
                onClick={onOpenConsultation}
                className="border border-nexgen-primaryGold/50 hover:bg-nexgen-brightGold/20 hover:text-nexgen-veryDarkHeader text-nexgen-veryDarkHeader font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-full transition-all duration-200 cursor-pointer text-center"
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Right Column: India Map with Patient Reviews */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[540px]">
              <img
                src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/chatgpt-image-sep-14-2026-05-44-12-pm-mu17gyqi7w8aer.png"
                alt="Reviews and Testimonials across India"
                className="w-full h-auto object-contain select-none drop-shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/Map.webp";
                }}
              />
            </div>
          </div>

        </div>

        {/* Interactive Google Map Directions to Clinic */}
        <div className="mt-14 sm:mt-16 bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 px-1">
            <div>
              <span className="text-xs font-bold text-nexgen-primaryGold uppercase tracking-wider block mb-1">
                Clinic Location & Directions
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                Visit NEXGEN HAIR TRANSPLANT
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Vishal Residency Wing-1, Pillar No-56, Raja Bazar, Patna, Bihar 800014
              </p>
            </div>
            <a
              href="https://www.google.com/maps/place/NEXGEN+HAIR+TRANSPLANT/@25.6044229,85.0827564,17z"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-nexgen-veryDarkHeader hover:bg-nexgen-mainDarkBg text-nexgen-brightGold border border-nexgen-primaryGold/30 text-xs sm:text-sm font-semibold rounded-full shadow-xs transition-colors self-start sm:self-auto"
            >
              <span>Open in Google Maps</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="w-full h-[360px] sm:h-[440px] rounded-2xl overflow-hidden border border-gray-200/70 relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2806.264183401463!2d85.0827563740967!3d25.604422915088595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed57924bf8c993%3A0xc9a79dda2a64c183!2sNEXGEN%20HAIR%20TRANSPLANT!5e1!3m2!1sen!2sin!4v1789286019174!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="NEXGEN HAIR TRANSPLANT Clinic Location"
              className="w-full h-full"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
