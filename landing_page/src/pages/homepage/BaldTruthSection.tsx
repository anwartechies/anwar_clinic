"use client";

import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BALD_TRUTH_ITEMS } from "@/data/qhtData";
import { COMPANY_NAME } from "@/config/constants";

const BASE_TRUTH_ITEMS = BALD_TRUTH_ITEMS;

// Duplicate items 4 times to allow seamless infinite circular scrolling
const LOOPED_ITEMS = [
  ...BASE_TRUTH_ITEMS,
  ...BASE_TRUTH_ITEMS,
  ...BASE_TRUTH_ITEMS,
  ...BASE_TRUTH_ITEMS,
];

export default function BaldTruthSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const scrollAmount = 400;

    if (direction === "right") {
      // If near the end, loop back by one batch width
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      if (slider.scrollLeft >= maxScroll - scrollAmount) {
        slider.scrollLeft = slider.scrollWidth / 4;
      }
      slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
    } else {
      // If at start, jump forward by one batch
      if (slider.scrollLeft <= 20) {
        slider.scrollLeft = slider.scrollWidth / 2;
      }
      slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  // 10-Second Auto-Move Timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      scroll("right");
    }, 10000);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="qht-large-container">
        {/* Dark Moss Green Rounded Card Container */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-nexgen-mainDarkBg text-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-20 shadow-xl relative overflow-hidden border border-nexgen-primaryGold/20"
        >
          {/* Section Header & Slider Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-[500] tracking-tight text-white">
                The Unfiltered Truth About Hair Restoration
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm md:text-[18px] text-white/90 font-normal max-w-4xl">
                What most commercial clinics avoid telling you: why surgical precision, honest diagnosis, and graft preservation matter above all else.
              </p>
            </div>

            {/* Slider Arrow Buttons */}
            <div className="flex items-center gap-2.5 flex-shrink-0 self-end sm:self-center">
              <button
                onClick={() => scroll("left")}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-nexgen-brightGold text-nexgen-veryDarkHeader flex items-center justify-center shadow-md transition-all active:scale-95 duration-150 cursor-pointer"
                aria-label="Previous Truth"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-nexgen-veryDarkHeader" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-nexgen-brightGold text-nexgen-veryDarkHeader flex items-center justify-center shadow-md transition-all active:scale-95 duration-150 cursor-pointer"
                aria-label="Next Truth"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-nexgen-veryDarkHeader" />
              </button>
            </div>
          </div>

          {/* Horizontal Infinite Items Carousel */}
          <div
            ref={sliderRef}
            className="flex gap-8 sm:gap-12 overflow-x-auto no-scrollbar scroll-smooth pb-2 snap-x snap-mandatory"
          >
            {LOOPED_ITEMS.map((item, idx) => {
              const isCircled = item.id === 6;

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex-shrink-0 w-[300px] sm:w-[360px] md:w-[400px] flex items-start gap-4 snap-start"
                >
                  {/* Item Number */}
                  {isCircled ? (
                    <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full border-[1.5px] border-nexgen-brightGold flex items-center justify-center flex-shrink-0 text-2xl sm:text-7xl font-light text-nexgen-brightGold leading-none">
                      {item.id}.
                    </div>
                  ) : (
                    <span className="text-3xl sm:text-4xl lg:text-7xl font-light text-nexgen-brightGold flex-shrink-0 leading-none pt-1">
                      {item.id}.
                    </span>
                  )}

                  {/* Title & Description */}
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg md:text-4xl font-[500] text-white leading-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-xl text-white/90 font-normal leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
