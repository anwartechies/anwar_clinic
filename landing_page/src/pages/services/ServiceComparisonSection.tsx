"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface ComparisonCard {
  id?: number;
  title: string;
  purpose: string;
  effectiveness: string;
  risk: string;
  cost: string;
}

interface ServiceComparisonSectionProps {
  title?: string;
  subtitle?: string;
  cards?: ComparisonCard[];
}

const DEFAULT_COMPARISON_CARDS: ComparisonCard[] = [
  {
    id: 1,
    title: "Scar Camouflage",
    purpose: "Mixes visible scars with natural hair",
    effectiveness: "Enhances appearance but doesn't fix grafts",
    risk: "Very low",
    cost: "Moderate",
  },
  {
    id: 2,
    title: "Graft Removal",
    purpose: "Eradicates misplaced grafts",
    effectiveness: "Provides a natural look.",
    risk: "Slight risk of scarring",
    cost: "High",
  },
  {
    id: 3,
    title: "Density Correction",
    purpose: "Adds grafts to patchy areas",
    effectiveness: "Provides a thicker, fuller appearance",
    risk: "Low",
    cost: "Moderate to high",
  },
  {
    id: 4,
    title: "Natural Hairline Restoration",
    purpose: "Redesigns unnatural hairline",
    effectiveness: "Gives a natural look",
    risk: "Low",
    cost: "High",
  },
  {
    id: 5,
    title: "Punch Removal Technique",
    purpose: "Extracts outdated pluggy large grafts",
    effectiveness: "Removes doll-like appearance permanently",
    risk: "Low (when done by experts)",
    cost: "Moderate",
  },
  {
    id: 6,
    title: "SAVA Pen Implantation",
    purpose: "Precision graft placement at natural 40° angles",
    effectiveness: "Undetectable depth and natural direction",
    risk: "Minimal",
    cost: "Moderate to high",
  },
  {
    id: 7,
    title: `${COMPANY_NAME} Advanced Protocol`,
    purpose: "Rapid micro-implantation with minimized out-of-body holding time",
    effectiveness: "95%+ graft viability & rapid tissue recovery",
    risk: "Very low",
    cost: "Value-driven package",
  },
  {
    id: 8,
    title: "Scalp Micro Pigmentation (SMP)",
    purpose: "Recreates follicle shadow on scarred donor areas",
    effectiveness: "Instant visual density and scar camouflage",
    risk: "Zero downtime",
    cost: "Budget friendly",
  },
];

export default function ServiceComparisonSection({
  title = "Hair Transplant Repair",
  subtitle = "This comparison provides a clear overview of the key features of each technique, helping you choose the best option for your specific needs and goals",
  cards = DEFAULT_COMPARISON_CARDS,
}: ServiceComparisonSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Scroll function
  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const cardWidth = 320;
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      
      if (direction === "right") {
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          // Loop back to start smoothly
          sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          sliderRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      } else {
        if (scrollLeft <= 10) {
          // Loop to end
          sliderRef.current.scrollTo({ left: scrollWidth, behavior: "smooth" });
        } else {
          sliderRef.current.scrollBy({ left: -cardWidth, behavior: "smooth" });
        }
      }
    }
  };

  // Auto-scroll every 10 seconds infinitely
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      scroll("right");
    }, 10000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">
        
        {/* Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight">
              {title.toLowerCase().includes("comparison")
                ? title
                : `Comparison of ${title} Techniques`}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          {/* Prev / Next Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-end">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-gray-200 hover:bg-nexgen-mainDarkBg hover:text-nexgen-brightGold flex items-center justify-center transition-colors shadow-xs"
              aria-label="Previous Technique"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-gray-200 hover:bg-nexgen-mainDarkBg hover:text-nexgen-brightGold flex items-center justify-center transition-colors shadow-xs"
              aria-label="Next Technique"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Full-width Carousel Track (Auto-sliding every 10s + Manual swipe/scroll) */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
        <div
          ref={sliderRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-6 overflow-x-auto no-scrollbar py-4 px-2 snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cards.map((card, idx) => (
            <div
              key={card.id ?? idx}
              className="flex-shrink-0 w-[275px] sm:w-[310px] md:w-[325px] bg-nexgen-pageLightBg rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 snap-start border border-gray-200/50"
            >
              {/* Header Title */}
              <div className="pb-4 border-b border-gray-200/80 min-h-[58px] flex items-center">
                <h3 className="text-lg sm:text-xl font-bold text-nexgen-veryDarkHeader tracking-tight leading-snug">
                  {card.title}
                </h3>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-200/80 flex-1 flex flex-col justify-between text-xs sm:text-[13px]">
                
                {/* Purpose */}
                <div className="py-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Purpose
                  </span>
                  <p className="font-normal text-gray-800 leading-relaxed min-h-[40px]">
                    {card.purpose}
                  </p>
                </div>

                {/* Effectiveness */}
                <div className="py-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Effectiveness
                  </span>
                  <p className="font-normal text-gray-800 leading-relaxed min-h-[40px]">
                    {card.effectiveness}
                  </p>
                </div>

                {/* Risk of Side Effects */}
                <div className="py-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Risk of Side Effects
                  </span>
                  <p className="font-semibold text-gray-900 leading-relaxed min-h-[22px]">
                    {card.risk}
                  </p>
                </div>

                {/* Cost */}
                <div className="pt-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Cost
                  </span>
                  <p className="font-bold text-nexgen-primaryGold leading-relaxed">
                    {card.cost}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
