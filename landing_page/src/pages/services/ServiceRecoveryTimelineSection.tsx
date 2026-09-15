"use client";

import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface TimelineWeek {
  id?: number;
  label: string;
  image: string;
  expectations: string[];
  careGuidelines: string[];
}

interface ServiceRecoveryTimelineSectionProps {
  title?: string;
  subtitle?: string;
  weeks?: TimelineWeek[];
}

const DEFAULT_WEEKS: TimelineWeek[] = [
  {
    id: 1,
    label: "WEEK 1",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
    expectations: ["Swelling", "Redness"],
    careGuidelines: [
      "Sleep with an elevated head",
      "Take the proper medicines as prescribed",
    ],
  },
  {
    id: 2,
    label: "WEEK 2",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    expectations: ["Falling of Scabs", "The scalp starts to heal"],
    careGuidelines: [
      "Avoid scratching head",
      "Protect the scalp from sunlight",
    ],
  },
  {
    id: 3,
    label: "WEEK 3",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    expectations: ["Temporary hair shedding begins"],
    careGuidelines: [
      "Stay patient and don’t panic",
      "Maintain hydration & nutrition",
    ],
  },
  {
    id: 4,
    label: "WEEK 4",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    expectations: ["Hair shedding continues", "Scalp looks clearer"],
    careGuidelines: ["Avoid heavy lifting exercises"],
  },
  {
    id: 5,
    label: "WEEK 5",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    expectations: ["Healing is complete, scalp is stable"],
    careGuidelines: ["Avoid harsh products"],
  },
];

export default function ServiceRecoveryTimelineSection({
  title = "Hair Transplant Repair",
  subtitle = "Understand the recovery timeline and essential aftercare tips for a quicker recovery after a crown hair transplant.",
  weeks = DEFAULT_WEEKS,
}: ServiceRecoveryTimelineSectionProps) {
  const safeWeeks = (weeks && weeks.length > 0 ? weeks : DEFAULT_WEEKS).map((w, idx) => ({
    ...w,
    image: (!w.image || w.image.includes("nexgenhairtransplant.com"))
      ? DEFAULT_WEEKS[idx % DEFAULT_WEEKS.length].image
      : w.image,
  }));
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const currentWeek = safeWeeks[activeWeekIndex] || safeWeeks[0];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#eff5f1] overflow-hidden">
      <div className="qht-large-container">

        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-[1.18]">
            {title.toLowerCase().includes("recovery")
              ? title
              : `Recovery Time and Aftercare of ${title}`}
          </h2>
          <p className="text-xs sm:text-sm text-[#5c685f] leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* 3-Column Content: Left Vertical Tabs + Center Photo + Right Expectation/Care Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* Column 1: Vertical Tabs (WEEK 1 to WEEK 5) */}
          <div className="lg:col-span-2 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {weeks.map((w, idx) => {
              const isActive = idx === activeWeekIndex;
              return (
                <button
                  key={w.id ?? idx}
                  onClick={() => setActiveWeekIndex(idx)}
                  className={`px-6 py-3 rounded-full text-xs font-bold transition-all text-center whitespace-nowrap ${isActive
                      ? "bg-[#596d53] text-white shadow-md"
                      : "bg-[#dce5de] hover:bg-[#cfded2] text-[#5c685f]"
                    }`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>

          {/* Column 2: Center Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[380px] aspect-[4/4] rounded-3xl overflow-hidden shadow-lg border border-white/60 bg-black/10 transition-all duration-300">
              <img
                src={currentWeek.image}
                alt={`${currentWeek.label} recovery after ${title}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
          </div>

          {/* Column 3: Right 2 Cards (WHAT TO EXPECT + HOW TO CARE) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Card 1: What to Expect */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#596d53] pb-3 border-b border-gray-100">
                WHAT TO EXPECT
              </h3>
              <div className="divide-y divide-gray-100 mt-2 flex flex-col">
                {currentWeek.expectations.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#596d53] fill-[#596d53]/15 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: How to Care */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#596d53] pb-3 border-b border-gray-100">
                HOW TO CARE
              </h3>
              <div className="divide-y divide-gray-100 mt-2 flex flex-col">
                {currentWeek.careGuidelines.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#596d53] fill-[#596d53]/15 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
