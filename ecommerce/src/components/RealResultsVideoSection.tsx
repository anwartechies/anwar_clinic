"use client";

import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Play, X } from "lucide-react";

export interface VideoTestimonial {
  id: string;
  name: string;
  quote: string;
  thumbnail: string;
  videoUrl?: string;
  watermark?: boolean;
}

export const TESTIMONIALS_DATA: VideoTestimonial[] = [
  {
    id: "sushant",
    name: "Sushant Gupta",
    quote:
      "I had my transplant at NexGen and used to collect my medicines from the clinic. Now I just order them on NexGen and they get delivered to my door.",
    thumbnail:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "sounu",
    name: "Sounu Kumar",
    quote:
      "Six months after my transplant, I'm still following my NexGen medicines. My results speak for themselves, and now I get everything on NexGen.",
    thumbnail:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "shivam",
    name: "Shivam Tyagi",
    quote:
      "I had my transplant in September 2025 and have followed my medicines ever since. Five months in, no side effects, and my PRP sessions have really cut down my hair fall.",
    thumbnail:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    watermark: true,
  },
];

export default function RealResultsVideoSection() {
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);

  return (
    <section className="py-20 sm:py-24 bg-[#f4faf2] relative overflow-hidden">

      {/* Decorative Top Wavy Edge */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-repeat-x opacity-20 pointer-events-none" />

      <div className="qht-large-container">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5c685f] block mb-2">
            TRUSTED BY REAL PATIENTS
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#1b221d] tracking-tight leading-tight">
            Our members get real results
          </h2>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm text-[#5c685f] font-medium flex-wrap">
            <span className="inline-flex items-center gap-1 font-bold text-[#1b221d]">
              <Star className="w-4 h-4 text-[#ffb400] fill-current" />
              4.9/5 on Google
            </span>
            <span className="text-gray-400">|</span>
            <span>Backed by 100,000+ hair loss evaluations</span>
          </div>
        </div>

        {/* Video Cards Grid with Navigation Arrows */}
        <div className="relative max-w-6xl mx-auto">

          {/* Left Arrow Button */}
          <button
            type="button"
            className="hidden md:flex absolute -left-6 lg:-left-12 top-1/3 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm items-center justify-center cursor-pointer transition-all active:scale-95"
            aria-label="Previous Testimonials"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* 3 Video Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {TESTIMONIALS_DATA.map((testimonial) => (
              <div key={testimonial.id} className="flex flex-col group">

                {/* 9:16 Portrait Video Thumbnail Card */}
                <div className="relative aspect-[9/14] w-full rounded-3xl sm:rounded-[32px] overflow-hidden bg-[#e8e2d8] shadow-md border border-gray-100/90 group">

                  {/* NexGen Meds Watermark for card 3 */}
                  {testimonial.watermark && (
                    <div className="absolute top-4 left-0 right-0 text-center z-10 select-none pointer-events-none">
                      <span className="text-xl font-bold font-serif tracking-tight text-[#1b221d]/90 block">
                        <span className="border-b-2 border-[#1b221d] pb-0.5">U.</span>Roots
                      </span>
                    </div>
                  )}

                  <img
                    src={testimonial.thumbnail}
                    alt={testimonial.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setActiveVideo(testimonial)}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#b1fc85] hover:bg-[#9ef56e] text-black flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      aria-label={`Play story by ${testimonial.name}`}
                    >
                      <Play className="w-6 h-6 fill-current ml-1 text-black" />
                    </button>
                  </div>
                </div>

                {/* Patient Name */}
                <h3 className="text-lg sm:text-xl font-bold text-[#1b221d] mt-4 mb-1.5 group-hover:text-[#52664d] transition-colors">
                  {testimonial.name}
                </h3>

                {/* Patient Quote */}
                <p className="text-xs sm:text-[13px] text-[#5c685f] leading-relaxed font-normal">
                  {testimonial.quote}
                </p>

              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            className="hidden md:flex absolute -right-6 lg:-right-12 top-1/3 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm items-center justify-center cursor-pointer transition-all active:scale-95"
            aria-label="Next Testimonials"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

        </div>

        {/* Bottom CTA Pill Button */}
        <div className="mt-14 sm:mt-16 text-center">
          <a
            href="#hair-test"
            className="inline-flex items-center gap-2 bg-[#b1fc85] hover:bg-[#9ef56e] text-black font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full border border-black/85 shadow-sm transition-all active:scale-95"
          >
            <span>Start Your Free Hair Assessment</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[9/16] max-h-[85vh]">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-full flex items-center justify-center text-white text-center p-6">
              <div>
                <Play className="w-16 h-16 text-[#b1fc85] mx-auto mb-4 animate-pulse" />
                <h4 className="text-xl font-bold mb-2">{activeVideo.name}&apos;s Transformation Journey</h4>
                <p className="text-xs text-white/80 max-w-xs mx-auto mb-4">{activeVideo.quote}</p>
                <span className="text-[11px] bg-[#b1fc85] text-black px-4 py-1.5 rounded-full font-bold">
                  Verified NexGen Patient Story
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
