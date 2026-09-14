"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface ServiceIntroSectionProps {
  title?: string;
  slug?: string;
  block1Heading?: string;
  block1Lead?: string;
  block1Paragraphs?: string[];
  block1Image?: string;
  pointer1?: string;
  pointer2?: string;
  block1Pointers?: { title: string; desc: string }[];
  block2Heading?: string;
  block2Paragraphs?: string[];
  block2Image?: string;
  onOpenConsultation?: () => void;
}

const DEFAULT_BLOCK1_IMAGE =
  "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80";
const DEFAULT_BLOCK2_IMAGE =
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80";

export default function ServiceIntroSection({
  title = "Bad Hair Transplant Correction",
  slug = "bad-hair-transplant-correction",
  block1Heading,
  block1Lead,
  block1Paragraphs,
  block1Image = DEFAULT_BLOCK1_IMAGE,
  pointer1 = "Punch removal",
  pointer2 = "Graft correction",
  block1Pointers,
  block2Heading,
  block2Paragraphs,
  block2Image = DEFAULT_BLOCK2_IMAGE,
  onOpenConsultation,
}: ServiceIntroSectionProps) {
  const safeBlock1Image =
    !block1Image || block1Image.includes("qhtclinic.com") || block1Image.includes("sd-why-us-thumb")
      ? DEFAULT_BLOCK1_IMAGE
      : block1Image;
  const safeBlock2Image =
    !block2Image || block2Image.includes("qhtclinic.com") || block2Image.includes("sd-why-us-thumb")
      ? DEFAULT_BLOCK2_IMAGE
      : block2Image;

  const heading1 = block1Heading || `Understanding ${title}`;
  const lead1 = block1Lead || `Tailored clinical care designed for lasting aesthetic results.`;
  const paras1 =
    block1Paragraphs && block1Paragraphs.length > 0
      ? block1Paragraphs
      : [
        `${title} is a specialized clinical procedure designed to restore natural aesthetic balance, density, and facial framing.`,
        `At ${COMPANY_NAME}, our senior surgeons employ advanced micro-instrumentation and customized surgical plans to ensure high graft survival and undetectable results.`,
      ];
  const heading2 = block2Heading || `Advanced ${title} Protocols`;
  const paras2 =
    block2Paragraphs && block2Paragraphs.length > 0
      ? block2Paragraphs
      : [
        `High-quality hair restoration requires specialized surgical artistry, anatomical knowledge, and strict sterile protocols. At ${COMPANY_NAME}, procedures are surgeon-led in hospital-grade suites to deliver permanent, natural-looking density.`,
        `Choosing ${COMPANY_NAME} guarantees transparent guidance, individualized surgical care, and dedicated post-operative recovery support.`,
      ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="qht-large-container space-y-20 lg:space-y-28">

        {/* ========================================================================= */}
        {/* BLOCK 1: Text on Left, Image with pointer labels on Right */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-6 space-y-5">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-[1.18]">
              {heading1}
            </h2>

            <p className="text-base sm:text-lg text-[#202922] font-semibold leading-snug">
              {lead1}
            </p>

            {paras1.map((para, i) => (
              <p key={i} className="text-sm sm:text-base text-[#556358] leading-relaxed font-normal">
                {para}
              </p>
            ))}

            <div className="pt-3">
              <button
                onClick={onOpenConsultation}
                className="bg-[#596d53] hover:bg-[#495b44] text-white font-semibold text-sm sm:text-base py-3 px-8 rounded-full shadow-md transition-all active:scale-95 duration-150"
              >
                Book an Appointment
              </button>
            </div>
          </div>

          {/* Right Column: Image with Pointer Annotations */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-[#f4f7f4] aspect-[4/3] sm:aspect-[16/11]">
              <img
                src={safeBlock1Image}
                alt={heading1}
                className="w-full h-full object-cover object-center"
              />

              {/* Pointer Annotation 1: Punch Removal */}
              <div className="absolute top-[16%] left-[30%] sm:left-[35%] flex flex-col items-center pointer-events-none">
                <span className="text-xs sm:text-sm font-medium text-black/80 bg-white/60 px-2 py-0.5 rounded backdrop-blur-[2px] border-b border-black/60 shadow-xs mb-1">
                  {pointer1}
                </span>
                <div className="w-[1px] h-8 sm:h-12 bg-black/60 rotate-[25deg] origin-top"></div>
                <div className="w-2 h-2 rounded-full bg-black/80 -mt-1 ml-4"></div>
              </div>

              {/* Pointer Annotation 2: Graft Correction */}
              <div className="absolute top-[40%] right-[6%] sm:right-[10%] flex items-center gap-2 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-black/80"></div>
                <div className="w-10 sm:w-16 h-[1.5px] bg-black/60"></div>
                <span className="text-xs sm:text-sm font-medium text-black/80 bg-white/60 px-2 py-0.5 rounded backdrop-blur-[2px] border-b border-black/60 shadow-xs">
                  {pointer2}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BLOCK 2: Image on Left, Text on Right */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Combing Hair Close-Up Image */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-[#f4f7f4] aspect-[4/3] sm:aspect-[16/11]">
              <img
                src={safeBlock2Image}
                alt={heading2}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Right Column: Text Content */}
          <div className="lg:col-span-6 space-y-5 order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-[1.18]">
              {heading2}
            </h2>

            {paras2.map((para, i) => (
              <p key={i} className="text-sm sm:text-base text-[#556358] leading-relaxed font-normal">
                {para}
              </p>
            ))}

            <div className="pt-3">
              <button
                onClick={onOpenConsultation}
                className="bg-[#596d53] hover:bg-[#495b44] text-white font-semibold text-sm sm:text-base py-3 px-8 rounded-full shadow-md transition-all active:scale-95 duration-150"
              >
                Book an Appointment
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
