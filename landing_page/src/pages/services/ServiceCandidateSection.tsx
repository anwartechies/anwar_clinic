"use client";

import React from "react";
import { Check } from "lucide-react";

import { COMPANY_NAME } from "@/config/constants";

interface CandidatePoint {
  title: string;
  desc: string;
}

interface ServiceCandidateSectionProps {
  title?: string;
  subtitle?: string;
  points?: CandidatePoint[];
  onOpenConsultation?: () => void;
}

const DEFAULT_CANDIDATE_POINTS: CandidatePoint[] = [
  {
    title: "People with Unnatural Hairline",
    desc: "Those with a poorly designed and unnatural hairline opt for repair.",
  },
  {
    title: "Having Visible Scars",
    desc: "Patients with visible scars due to previous transplants.",
  },
  {
    title: "Low Hair Density",
    desc: "A patchy hair growth and improper coverage after a Hair Transplant",
  },
  {
    title: "Poorly placed Grafts",
    desc: "Those with misplaced grafts causing wrongly directed Hair Growth",
  },
];

export default function ServiceCandidateSection({
  title = "Hair Transplant Repair",
  subtitle = `Customers with poor and unnatural hair density and scars from past surgeries, consider ${COMPANY_NAME} Clinic for a Hair Transplant Repair.`,
  points = DEFAULT_CANDIDATE_POINTS,
  onOpenConsultation,
}: ServiceCandidateSectionProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="qht-large-container">

        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-[1.18] max-w-2xl">
            {title.toLowerCase().startsWith("who is") ? (
              title
            ) : (
              <>
                Who is an Ideal Candidate for
                <br />
                {title}?
              </>
            )}
          </h2>
          <p className="text-sm sm:text-lg text-[#5c685f] max-w-md leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Left Column: Silhouette Graphic */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start items-center">
            <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                alt="Ideal Candidate Illustration"
                className="w-full h-full object-cover rounded-2xl shadow-sm"
              />
            </div>
          </div>

          {/* Right Column: 2x2 Cards Grid + Still Confused Banner */}
          <div className="lg:col-span-8 space-y-6">

            {/* 2x2 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {points.map((point, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 sm:p-7 rounded-2xl sm:rounded-[24px] border border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#596d53]/40 transition-all duration-200"
                >
                  {/* Green Circular Badge Checkmark */}
                  <div className="w-6 h-6 rounded-full bg-[#596d53] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  <h3 className="text-lg font-bold text-[#1b221d] mt-3 leading-snug">
                    {point.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5c685f] mt-1.5 leading-relaxed font-normal">
                    {point.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom "Still Confused? Talk to our experts" Banner */}
            <div className="relative rounded-2xl sm:rounded-[24px] overflow-hidden bg-[#38493a] text-white p-6 sm:p-8 shadow-md">
              {/* Decorative Background Circles */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
                <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-[#596d53]" />
                <div className="absolute right-20 -bottom-10 w-36 h-36 rounded-full bg-[#6a8063]" />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div>
                  <span className="text-xs sm:text-sm font-medium text-gray-200">
                    Still Confused?
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-[500] text-white tracking-tight mt-0.5">
                    Talk to our experts
                  </h4>
                </div>

                <button
                  onClick={onOpenConsultation}
                  className="bg-white hover:bg-gray-100 text-[#1b221d] font-bold text-sm sm:text-base py-3 px-8 rounded-full shadow-md transition-all active:scale-95 whitespace-nowrap flex-shrink-0"
                >
                  Contact Us
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
