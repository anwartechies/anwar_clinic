"use client";

import React from "react";
import Image from "next/image";

export default function AboutMissionVisionSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="qht-large-container">
        
        {/* Deep Dark Container */}
        <div className="bg-nexgen-mainDarkBg border border-nexgen-primaryGold/30 rounded-2xl sm:rounded-3xl lg:rounded-[36px] p-6 sm:p-10 lg:p-14 text-white relative overflow-hidden shadow-xl">
          
          {/* Top Row: Mission (Left) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-6 lg:mb-2">
            <div className="lg:col-span-6 max-w-lg space-y-2 sm:space-y-3">
              <span className="text-xs sm:text-sm font-semibold text-nexgen-brightGold tracking-wide uppercase">
                Mission
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-[28px] font-[500] text-white leading-snug tracking-tight">
                To provide safe, effective, and natural hair transplantation methods, creating a new industry standard nationally and internationally.
              </h3>
            </div>
          </div>

          {/* Center Image */}
          <div className="my-6 sm:my-8 lg:my-4 flex items-center justify-center">
            <div className="relative w-full max-w-[900px] flex items-center justify-center">
              <img
                src="/images/aboutImg1.webp"
                alt="Mission and Vision - Hair Restoration Excellence"
                className="w-full h-auto object-contain select-none"
              />
            </div>
          </div>

          {/* Bottom Row: Vision (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mt-6 lg:mt-2">
            <div className="lg:col-start-7 lg:col-span-6 lg:text-right max-w-lg lg:ml-auto space-y-2 sm:space-y-3">
              <span className="text-xs sm:text-sm font-semibold text-nexgen-brightGold tracking-wide uppercase">
                Vision
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-[28px] font-[500] text-white leading-snug tracking-tight">
                To be the most advanced hair transplant clinic in the world, where innovation and compassion go hand in hand.
              </h3>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
