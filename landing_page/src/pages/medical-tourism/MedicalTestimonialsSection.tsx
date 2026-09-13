"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  title: string;
  review: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "John M.",
    location: "New York",
    title: "World-Class Results at a Fraction of the Cost",
    review:
      "My hair transplant procedure in India cost me just a third of what I would have paid in the US, with equally excellent outcomes.",
  },
  {
    id: 2,
    name: "Ahmed R.",
    location: "Dubai",
    title: "Natural Look, Relaxing Experience",
    review:
      "The treatment gave me a natural appearance, and the whole process had a very relaxing feel.",
  },
  {
    id: 3,
    name: "Raj S.",
    location: "London (NRI)",
    title: "Professionalism Beyond Expectations",
    review:
      "The professionalism and hospitality at the clinic were far better than I expected. Truly world-class service.",
  },
  {
    id: 4,
    name: "Michael K.",
    location: "Sydney",
    title: "Smooth Flight, Zero Pain, Perfect Healing",
    review:
      "From airport pickup to the sterile surgical suites, every single detail was taken care of seamlessly. 4,200 grafts and zero pain.",
  },
  {
    id: 5,
    name: "David L.",
    location: "Toronto",
    title: "Flawless Hairline & Dense Crown Coverage",
    review:
      "The hairline design looks 100% natural. People can't even tell I had a transplant done. Best travel decision I made.",
  },
  {
    id: 6,
    name: "Carlos M.",
    location: "Madrid",
    title: "Exceptional Doctor Mastery & VIP Care",
    review:
      "The personal translator and doctor attention made me feel completely at home. Outstanding results and five-star hospitality.",
  },
];

export default function MedicalTestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Determine max slide index based on items per screen (1 on mobile, 2 on tablet, 3 on desktop)
  const totalItems = TESTIMONIALS.length;
  // Maximum step index so we never have blank space at end
  const maxIndex = totalItems - 3; // 6 - 3 = 3 (showing [0,1,2], [1,2,3], [2,3,4], [3,4,5])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-move cards every 10 seconds with slide animation
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 10000); // 10,000ms = 10 sec

    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  return (
    <section className="py-20 lg:py-28 bg-[#586b4e] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* ========================================================
            HEADER (Matching Screenshot)
           ======================================================== */}
        <div className="mb-10 sm:mb-12 pb-6 border-b border-white/20">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-[1.2] max-w-3xl">
            Hear from Our Satisfied International Clients <br className="hidden sm:inline" />
            Around the World
          </h2>
        </div>

        {/* ========================================================
            ANIMATED SLIDING CAROUSEL TRACK
           ======================================================== */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex gap-6 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              transform: `translateX(calc(-${currentIndex} * (100% / 3 + 8px)))`,
            }}
          >
            {TESTIMONIALS.map((item) => (
              <div
                key={item.id}
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.3333%-16px)] flex-shrink-0 bg-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-xl min-h-[350px] sm:min-h-[380px] transform transition-transform duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Top Row: 5 Green Stars + Outline Quote Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#586b4e]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#586b4e] text-[#586b4e]" />
                      ))}
                    </div>

                    {/* Outline Quote Symbol */}
                    <span className="text-[#8ba07f] font-serif text-3xl font-extrabold select-none leading-none">
                      ❞
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#162418] tracking-tight mt-5 mb-3 leading-snug">
                    {item.title}
                  </h3>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed">
                    {item.review}
                  </p>
                </div>

                {/* Bottom Section: Divider + Name & City */}
                <div>
                  <div className="border-t border-gray-200/80 my-5" />
                  <h4 className="text-sm sm:text-base font-bold text-[#162418]">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">
                    {item.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            BOTTOM CENTER CONTROLS WITH DIVIDER LINE (Matching Screenshot)
           ======================================================== */}
        <div className="mt-12 sm:mt-16 flex items-center justify-center relative">
          
          {/* Subtle Horizontal Background Lines */}
          <div className="w-full max-w-xl h-px bg-white/20 absolute left-1/2 -translate-x-1/2" />

          {/* Navigation Prev / Next Buttons */}
          <div className="relative z-10 flex items-center gap-3 bg-[#586b4e] px-4">
            <button
              onClick={prevSlide}
              aria-label="Previous testimonial (Slide Right)"
              className="w-11 h-11 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white hover:text-[#586b4e] active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next testimonial (Slide Left)"
              className="w-11 h-11 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-white hover:text-[#586b4e] active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
