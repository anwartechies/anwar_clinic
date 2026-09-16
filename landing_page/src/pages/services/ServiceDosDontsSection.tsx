"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { COMPANY_NAME } from "@/config/constants";

interface ServiceDosDontsSectionProps {
  title?: string;
  subtitle?: string;
  donts?: string[];
  dos?: string[];
}

const DEFAULT_DONTS = [
  "Do not scratch or rub the scalp",
  "Avoid strenuous exercise",
  "Avoid direct sun exposure",
  "Do not smoke or consume alcohol",
  "Avoid wearing tight caps/helmets",
];

const DEFAULT_DOS = [
  "Take prescribed medications",
  "Eat a balanced, nutritious diet",
  "Sleep with an elevated head",
  "Wash hair gently at the advised time",
  "Stay hydrated",
];

export default function ServiceDosDontsSection({
  title = "Hair Transplant Repair",
  subtitle = `After going through a hair transplant repair at ${COMPANY_NAME} Clinic, it is mandatory to follow these guidelines to ensure proper results and recovery. By following these, a person can maximize graft survival, reduce complications, and yield long-term results.`,
  donts = DEFAULT_DONTS,
  dos = DEFAULT_DOS,
}: ServiceDosDontsSectionProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-mainDarkBg text-white overflow-hidden border-y border-nexgen-primaryGold/20">
      <div className="qht-large-container">
        
        {/* Centered Heading & Subtitle */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-white tracking-tight leading-tight">
            {title.toLowerCase().includes("do") || title.toLowerCase().includes("don")
              ? title
              : `Do’s and Don’ts after ${title}`}
          </h2>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* 2-Column: Left Don'ts Card + Right Do's Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto items-stretch">
          
          {/* Left Card: Don'ts */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-xl flex flex-col justify-start">
            <h3 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader pb-4 border-b border-gray-200/80">
              Don’ts
            </h3>
            
            <div className="divide-y divide-gray-200/80 flex flex-col">
              {donts.map((item, idx) => (
                <div key={idx} className="py-4.5 sm:py-5 flex items-center gap-3.5 group">
                  <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    <XCircle className="w-3.5 h-3.5 fill-white text-red-500" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Do's */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-xl flex flex-col justify-start">
            <h3 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader pb-4 border-b border-gray-200/80">
              Do’s
            </h3>
            
            <div className="divide-y divide-gray-200/80 flex flex-col">
              {dos.map((item, idx) => (
                <div key={idx} className="py-4.5 sm:py-5 flex items-center gap-3.5 group">
                  <div className="w-5 h-5 rounded-full bg-nexgen-primaryGold text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-white text-nexgen-primaryGold" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
