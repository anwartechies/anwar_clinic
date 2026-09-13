"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface LegacyMilestone {
  id: number;
  title: string;
  desc: string;
  year?: string;
}

export default function AboutLegacySection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const LEGACY_MILESTONES: LegacyMilestone[] = [
    {
      id: 1,
      year: "Phase 01",
      title: "Founding Clinical Center in Patna",
      desc: "Established our initial center of excellence in Patna, building our clinical foundation on ethical diagnosis, patient transparency, and surgeon-led care.",
    },
    {
      id: 2,
      year: "Phase 02",
      title: "Advancement in Technique — Direct Micro-Implantation",
      desc: `Pioneered our direct micro-implantation protocol, reducing graft out-of-body time and utilizing precision implanter pens for maximum follicle survival.`,
    },
    {
      id: 3,
      year: "Phase 03",
      title: "Over 15,000+ Documented Patient Outcomes",
      desc: "Across our centers in Patna and Mumbai, delivering natural density, balanced hairline aesthetics, and lifelong follicular growth.",
    },
    {
      id: 4,
      year: "Phase 04",
      title: "Expansion to Mumbai (Second Branch)",
      desc: "Expanded ultra-sterile surgical suites and trichology consultation centers with our second branch in Mumbai to bring clinical hair restoration closer to patients.",
    },
    {
      id: 5,
      year: "Phase 05",
      title: "Global Recognition & International Patient Care",
      desc: "Established a dedicated international patient desk providing seamless airport concierge, hotel assistance, and surgeon-led care for patients from over 25+ countries.",
    },
  ];

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 380;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="qht-large-container">
        
        {/* Dark Olive Outer Container */}
        <div className="bg-[#4a5c45] rounded-2xl sm:rounded-3xl lg:rounded-[32px] p-6 sm:p-10 lg:p-14 text-white relative overflow-hidden shadow-xl">
          
          {/* Top Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
            
            {/* Title & Subtitle */}
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] tracking-tight text-white leading-tight mb-3">
                Our Legacy in Hair Restoration
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                From clinical inception to nationwide trust, {COMPANY_NAME} is dedicated to pioneering ethical, high-precision hair restoration with verified patient outcomes.
              </p>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-3 self-end md:self-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Previous milestone"
                className="w-10 h-10 rounded-full bg-white text-[#1b221d] flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Next milestone"
                className="w-10 h-10 rounded-full bg-white text-[#1b221d] flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Timeline & Carousel Cards Container */}
          <div className="relative pt-6">
            
            {/* Horizontal Timeline Track */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4 pt-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {LEGACY_MILESTONES.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[340px] snap-start flex flex-col relative"
                >
                  {/* Top Diamond Indicator & Vertical Guide */}
                  <div className="flex items-center mb-6">
                    <div className="w-2.5 h-2.5 rotate-45 bg-white/90 shadow-sm flex-shrink-0" />
                    <div className="h-[1px] bg-white/20 flex-grow ml-2" />
                  </div>

                  {/* Outlined Milestone Card */}
                  <div className="border border-white/50 hover:border-white rounded-2xl sm:rounded-[22px] p-6 sm:p-7 flex flex-col justify-between h-[280px] sm:h-[300px] bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300 backdrop-blur-xs">
                    
                    {/* Content */}
                    <div>
                      <h3 className="text-base sm:text-lg font-[500] text-[#bbf786] leading-snug mb-3">
                        {milestone.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-white/85 leading-relaxed font-normal line-clamp-6">
                        {milestone.desc}
                      </p>
                    </div>

                    {/* Footer Phase Indicator */}
                    {milestone.year && (
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-white/50 tracking-wider uppercase">
                        <span>{milestone.year}</span>
                      </div>
                    )}

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
