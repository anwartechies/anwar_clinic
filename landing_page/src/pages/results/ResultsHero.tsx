"use client";

import React, { useState, useRef, useCallback } from "react";
import { COMPANY_NAME } from "@/config/constants";

interface ResultsHeroProps {
  videoSrc?: string;
  onScrollDown?: () => void;
}

export default function ResultsHero({
  videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  onScrollDown,
}: ResultsHeroProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handleScrollClick = () => {
    if (onScrollDown) {
      onScrollDown();
    } else {
      window.scrollTo({
        top: window.innerHeight * 0.9,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative pt-32 pb-24 sm:pt-36 sm:pb-32 lg:pt-40 lg:pb-36 bg-[#eff5f1] overflow-hidden min-h-[92vh] flex items-center">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full">

        {/* Main 3-Column Relative Layout */}
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-0">

          {/* 1. LEFT VIDEO CARD (Smaller, positioned downwards) */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-start lg:translate-y-16 z-10 flex-shrink-0">
            <div className="relative w-[230px] sm:w-[260px] lg:w-[270px] h-[340px] sm:h-[380px] lg:h-[400px] rounded-[28px] overflow-hidden shadow-xl bg-black border border-gray-200/60">

              {/* Video Element */}
              <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Bold Yellow Badge Text Overlay */}
              <div className="absolute inset-x-0 bottom-14 sm:bottom-16 px-3 text-center pointer-events-none">
                <span className="text-[#facc15] font-black text-lg sm:text-xl tracking-tight uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                  AFTER 9 MONTHS
                </span>
              </div>
            </div>
          </div>

          {/* 2. CENTER TYPOGRAPHY & SCROLL DOWN */}
          <div className="relative z-20 text-center flex flex-col items-center justify-center lg:-mr-24 lg:translate-x-4 max-w-sm sm:max-w-md pointer-events-auto">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[500] text-[#1b221d] tracking-tight leading-[1.04]">
              Proven Results <br />
              <span className="text-[#596d53]">Lasting</span> <br />
              <span className="text-[#596d53]">Confidence.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-[16px] text-[#5c685f] mt-4 max-w-[270px] mx-auto leading-relaxed font-normal">
              From receding temples to full crown restoration — discover what’s possible with {COMPANY_NAME}.
            </p>

            {/* Vertical Scroll Down Indicator */}
            <div className="pt-10 sm:pt-14 flex flex-col items-center">
              <button
                onClick={handleScrollClick}
                className="group flex flex-col items-center focus:outline-none cursor-pointer"
                aria-label="Scroll down"
              >
                <span
                  className="text-[10px] text-gray-400 group-hover:text-[#596d53] uppercase tracking-[0.25em] font-semibold mb-3 transition-colors"
                  style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                >
                  SCROLL DOWN
                </span>

                {/* Thin Vertical Arrow */}
                <div className="flex flex-col items-center">
                  <div className="w-[1px] h-12 bg-gray-300 group-hover:bg-[#596d53] transition-colors" />
                  <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400 group-hover:text-[#596d53] transition-colors"
                  >
                    <path
                      d="M1 1.5L6 6.5L11 1.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            </div>

          </div>

          {/* 3. RIGHT COMPARISON CARD (Noticeably Larger & Higher) */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-end z-10 flex-shrink-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[440px] lg:w-[540px] xl:w-[580px] h-[380px] sm:h-[450px] lg:h-[500px] rounded-[32px] overflow-hidden shadow-2xl bg-gray-200 border border-gray-200/80 select-none">

              {/* Interactive Drag Container */}
              <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-full h-full cursor-ew-resize touch-none overflow-hidden"
              >
                {/* AFTER IMAGE (Base Layer - Right Side) */}
                <img
                  src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-4-mtzmgy4ufm739v.png"
                  alt="Transformation After"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />

                {/* BEFORE IMAGE (Clipped Layer - Left Side) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-6-mtzmmfyjtmpxyz.png"
                    alt="Transformation Before"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none shadow-md"
                  style={{ left: `${sliderPos}%` }}
                >
                  {/* Central Slider Knob with < > */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shadow-lg border border-white/20">
                    <span className="text-[11px] font-bold tracking-tight">
                      ‹›
                    </span>
                  </div>
                </div>

                {/* "Before" Label */}
                <div className="absolute top-6 left-6 pointer-events-none text-white/90 text-xs sm:text-sm font-medium drop-shadow-sm">
                  Before
                </div>

                {/* "After" Label */}
                <div className="absolute top-6 right-6 pointer-events-none text-white/90 text-xs sm:text-sm font-medium drop-shadow-sm">
                  After
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
