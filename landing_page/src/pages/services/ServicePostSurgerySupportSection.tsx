"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface SupportItem {
  id?: number;
  title: string;
  desc: string;
}

interface ServicePostSurgerySupportSectionProps {
  title?: string;
  subtitle?: string;
  image?: string;
  supportItems?: SupportItem[];
}

const DEFAULT_SUPPORT_ITEMS: SupportItem[] = [
  {
    id: 1,
    title: "Regular Follow-ups",
    desc: `${COMPANY_NAME} Clinic ensures recovery with proper follow-ups.`,
  },
  {
    id: 2,
    title: "Medication",
    desc: "Experts prescribe medications to lower risks and improve recovery.",
  },
  {
    id: 3,
    title: "Personalized therapy",
    desc: "Therapies are planned to strengthen scalp health and improve graft survival.",
  },
];

export default function ServicePostSurgerySupportSection({
  title = "Hair Transplant Repair",
  subtitle = `${COMPANY_NAME} Clinic, with surgeons and methods, ensures natural graft growth and long-term Hair Transplant Repair. The support includes:`,
  image = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80",
  supportItems = DEFAULT_SUPPORT_ITEMS,
}: ServicePostSurgerySupportSectionProps) {
  const safeImage =
    !image || image.includes("nexgenhairtransplant.com") || image.includes("repair-img-3")
      ? "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80"
      : image;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">

        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-[1.18] max-w-xl">
            {title.toLowerCase().includes("post")
              ? title
              : `Post-Surgery Support for ${title}`}
          </h2>
          <p className="text-sm sm:text-base text-[#5c685f] max-w-md leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* 2-Column: Left Scalp Photo + Right Support List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Left Column: Post-Surgery Scalp Photo */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[420px] aspect-[4/4] rounded-3xl overflow-hidden shadow-md border border-gray-100">
              <img
                src={safeImage}
                alt={`Post Surgery Support for ${title}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Support Items with Dividers */}
          <div className="lg:col-span-7 flex flex-col divide-y divide-gray-200/90 border-y border-gray-200/90">
            {supportItems.map((item, idx) => (
              <div key={item.id ?? idx} className="py-6 sm:py-8 flex items-start gap-4 sm:gap-5 group">
                {/* Sage/Olive Circle Checkmark */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#596d53] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-bold text-[#1b221d] tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c685f] leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
