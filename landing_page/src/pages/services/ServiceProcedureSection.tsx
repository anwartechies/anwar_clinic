"use client";

import React from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface ProcedureStep {
  stepNumber: string;
  title: string;
  desc: string;
}

interface ServiceProcedureSectionProps {
  title?: string;
  subtitle?: string;
  steps?: ProcedureStep[];
  onOpenConsultation?: () => void;
}

const DEFAULT_STEPS: ProcedureStep[] = [
  {
    stepNumber: "01",
    title: "Assessment",
    desc: `Evaluation of the previous transplant by the ${COMPANY_NAME} Clinic team of experts.`,
  },
  {
    stepNumber: "02",
    title: "Grafts Correction",
    desc: "The pluggy grafts are carefully extracted, and healthy new grafts are taken from the donor area.",
  },
  {
    stepNumber: "03",
    title: "Redesigning the Hairline",
    desc: `Experts at ${COMPANY_NAME} Clinic work on a customised natural hairline by implanting grafts for a natural look.`,
  },
  {
    stepNumber: "04",
    title: "Recovery and Care",
    desc: "Proper care after the surgery to reduce scars and for healthy regrowth through proper follow-ups.",
  },
];

export default function ServiceProcedureSection({
  title = "Hair Transplant Repair",
  subtitle,
  steps = DEFAULT_STEPS,
  onOpenConsultation,
}: ServiceProcedureSectionProps) {
  const defaultSubtitle = `The procedure for a Failed Hair Transplant Correction mainly includes removing misplaced grafts and their re-implantation more naturally by experts at ${COMPANY_NAME} Clinic.`;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="qht-large-container">

        {/* Top Header & Stat Boxes */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12 lg:mb-16">
          {/* Title & Subtitle */}
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.18]">
              {title.toLowerCase().startsWith("procedure")
                ? title
                : `Procedure used for ${title} in India`}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
              {subtitle || defaultSubtitle}
            </p>
          </div>

          {/* Top Right: Stat Cards (4 Week Recovery + Minimal Pain) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 flex-shrink-0">
            {/* Stat Card 1: 4 Week Recovery */}
            <div className="w-[140px] sm:w-[160px] aspect-square rounded-3xl border border-gray-200/90 bg-white p-5 sm:p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
              <span className="text-4xl sm:text-5xl font-light text-nexgen-primaryGold leading-none">
                4
              </span>
              <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold leading-tight">
                Week
                <br />
                Recovery
              </span>
            </div>

            {/* Stat Card 2: Minimal Pain */}
            <div className="w-[140px] sm:w-[160px] aspect-square rounded-3xl border border-gray-200/90 bg-white p-5 sm:p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-nexgen-primaryGold/10 flex items-center justify-center text-nexgen-primaryGold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold leading-tight">
                Minimal Pain
              </span>
            </div>
          </div>
        </div>

        {/* Main 2-Column: Diagram + Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* Left Column: Hairline Before/After Outline Vector + CTA Button */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start justify-between">
            <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
              <img
                src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-55-37-pm-mu4713fhxp35ck.jpeg"
                alt="Procedure Clinical Demonstration"
                className="w-full h-full object-cover rounded-2xl shadow-md"
              />
            </div>

            <div className="mt-8 sm:mt-10 w-full text-center lg:text-left">
              <button
                onClick={onOpenConsultation}
                className="bg-nexgen-brightGold hover:brightness-105 text-nexgen-veryDarkHeader font-bold text-sm sm:text-base py-3 px-8 rounded-full shadow-md transition-all active:scale-95 duration-150"
              >
                Book Free Consultation
              </button>
            </div>
          </div>

          {/* Right Column: Steps with Outlined Numbers */}
          <div className="lg:col-span-7">
            <div className="border-t border-gray-200/80">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="py-6 sm:py-8 border-b border-gray-200/80 flex items-start justify-between gap-6 group"
                >
                  {/* Step Text */}
                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-nexgen-veryDarkHeader tracking-tight leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-lg">
                      {step.desc}
                    </p>
                  </div>

                  {/* Outlined Stroke Number (01, 02, 03, 04) */}
                  <div className="flex-shrink-0 font-light text-3xl sm:text-4xl text-transparent [-webkit-text-stroke:1.5px_var(--nexgen-primary-gold)] select-none tracking-widest pt-1 group-hover:scale-105 transition-transform">
                    {step.stepNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
