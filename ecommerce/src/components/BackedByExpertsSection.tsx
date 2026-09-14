"use client";

import React from "react";
import { ChevronRight, Award, GitBranch, Users, Stethoscope, Quote } from "lucide-react";

export default function BackedByExpertsSection() {
  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="qht-large-container">

        {/* Main Card Container */}
        <div className="bg-[#fbf9f4] rounded-2xl sm:rounded-[44px] p-6 sm:p-12 lg:p-16 border border-gray-200/70 shadow-sm max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-14">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#5c685f] block mb-2">
              POWERED BY NATURE
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#1b221d] tracking-tight leading-tight">
              Backed by experts
            </h2>
          </div>

          {/* Doctor + Quote 2-Column Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center mb-8 sm:mb-12">

            {/* Left: Doctor Circular Portal with Floating Badges */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative">

                {/* Circular Blue Stage */}
                <div className="w-52 h-52 sm:w-72 sm:h-72 rounded-full bg-[#1b56d8] overflow-hidden flex items-end justify-center shadow-lg relative">
                  <img
                    src="https://images.unsplash.com/photo-1594824813593-9c049b76c8c9?auto=format&fit=crop&w=800&q=80"
                    alt="Dr. Neha - Hair Transplant Surgeon"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Floating Badge 1: Top-Right NexGen Emblem */}
                <div className="absolute top-0 right-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center p-1.5 sm:p-2 z-10">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1b392b] text-white flex items-center justify-center font-serif text-[10px] sm:text-xs font-bold">
                    NexGen
                  </div>
                </div>

                {/* Floating Badge 2: Bottom-Left Surgery Counter */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:-left-6 bg-white rounded-2xl p-2 sm:p-3 shadow-xl border border-gray-100 flex items-center gap-2 sm:gap-2.5 z-20 whitespace-nowrap">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#e8f8e5] text-[#2d5236] flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <span className="bg-[#2d5236] text-white text-[8.5px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full block w-max uppercase tracking-wider">
                      BACKED BY NexGen CLINIC
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-[#1b221d] block mt-0.5">
                      15,000+ Hair Surgeries
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Endorsement Quote & Surgeon Profile */}
            <div className="lg:col-span-6 space-y-3 sm:space-y-4 text-center sm:text-left mt-4 sm:mt-0">

              {/* Quote Icon */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1b56d8]/10 text-[#1b56d8] flex items-center justify-center mx-auto sm:mx-0 mb-1">
                <Quote className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </div>

              {/* Quote Body */}
              <p className="text-base sm:text-2xl font-bold text-[#1b221d] leading-snug tracking-tight">
                &ldquo;Recommended by experts for stronger, healthier-looking hair with advanced scalp-supporting actives that help reduce hair fall effectively.&rdquo;
              </p>

              {/* Divider & Doctor Bio */}
              <div className="border-t border-gray-200/80 pt-3 sm:pt-4 space-y-0.5">
                <h3 className="text-sm sm:text-lg font-bold text-[#1b221d]">
                  Dr. Neha
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-[#5c685f]">
                  MDS (Oral & Maxillofacial Surgery)
                </p>
                <p className="text-[11px] sm:text-xs text-[#829180] font-normal">
                  Facial Aesthetic & Hair Transplant Surgeon
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-2 flex justify-center sm:justify-start">
                <a
                  href="#consultation"
                  className="inline-flex items-center gap-2 bg-[#b1fc85] hover:bg-[#9ef56e] text-black font-bold text-xs sm:text-sm px-6 sm:px-7 py-2.5 sm:py-3 rounded-full border border-black/85 shadow-xs transition-all active:scale-95"
                >
                  <span>Book Free Consultation</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

            </div>

          </div>

          {/* Bottom Floating Stats Bar */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4 items-center text-center sm:text-left">

            {/* Stat 1: Procedures */}
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 sm:pr-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#eff5f1] text-[#2d5236] flex items-center justify-center flex-shrink-0">
                <GitBranch className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left">
                <span className="text-lg sm:text-2xl font-bold text-[#1b221d] block">
                  12,000+
                </span>
                <span className="text-[11px] sm:text-xs text-[#5c685f] font-medium block">
                  Procedures
                </span>
              </div>
            </div>

            {/* Stat 2: Patients (with vertical borders on desktop) */}
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 sm:px-4 sm:border-x border-gray-100 py-2 sm:py-0 border-y sm:border-y-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#eff5f1] text-[#2d5236] flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left">
                <span className="text-lg sm:text-2xl font-bold text-[#1b221d] block">
                  15,000+
                </span>
                <span className="text-[11px] sm:text-xs text-[#5c685f] font-medium block">
                  Patients
                </span>
              </div>
            </div>

            {/* Stat 3: Years Experience */}
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 sm:pl-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#eff5f1] text-[#2d5236] flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left">
                <span className="text-lg sm:text-2xl font-bold text-[#1b221d] block">
                  10+
                </span>
                <span className="text-[11px] sm:text-xs text-[#5c685f] font-medium block">
                  Years Experience
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
