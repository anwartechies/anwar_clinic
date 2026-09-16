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
    name: "Alistair Vance",
    location: "Edinburgh, UK",
    title: "Harley Street Quality at One-Fifth the Cost",
    review:
      "After consultations in central London quoting upwards of £11,000, choosing India was the smartest medical decision I’ve ever made. The surgical precision, sterile setup, and hairline design exceeded my expectations. At 9 months, the density is incredible.",
  },
  {
    id: 2,
    name: "Harrison Montgomery",
    location: "Melbourne, Australia",
    title: "Seamless VIP Logistics from Flight to Clinic",
    review:
      "Flying across from Melbourne felt daunting initially, but the international patient coordinator handled everything: priority airport chauffeur, luxury accommodation, and prompt hospital appointments. 4,200 grafts transplanted with zero complications.",
  },
  {
    id: 3,
    name: "Declan Gallagher",
    location: "Dublin, Ireland",
    title: "Genuine Doctor Mastery, Not Just Technicians",
    review:
      "Unlike European clinics where junior technicians do the bulk of the graft extraction, the senior surgeon here mapped my hairline and performed the critical stages himself. The post-operative healing was fast and virtually painless.",
  },
  {
    id: 4,
    name: "Julian Fletcher",
    location: "Vancouver, Canada",
    title: "Completely Undetectable, Natural Hairline",
    review:
      "My primary worry was looking unnatural. The medical team took their time measuring facial symmetry and implanting single-hair grafts along the front edge. Friends genuinely cannot tell I had a procedure done.",
  },
  {
    id: 5,
    name: "Callum Sterling",
    location: "Manchester, UK",
    title: "World-Class Hygiene & Attentive Medical Staff",
    review:
      "The cleanliness and clinical standards easily rival private hospitals in the UK. Every dressing change, PRP booster, and wash routine was handled with utmost care. The aftercare kit and routine instructions were comprehensive.",
  },
  {
    id: 6,
    name: "Lachlan Ross",
    location: "Auckland, New Zealand",
    title: "Remarkable Crown Restoration & Full Density",
    review:
      "Restoring crown thinning usually has unpredictable yields, but 10 months post-op the coverage looks thick and natural. Even after flying back to New Zealand, their medical team monitored my weekly photo updates without fail.",
  },
  {
    id: 7,
    name: "Oliver Sinclair",
    location: "Birmingham, UK",
    title: "Transparent Fixed Pricing with Zero Hidden Costs",
    review:
      "What struck me most was the absolute honesty throughout. No surprise medication fees, no upsells at reception—just transparent pricing that included airport rides, hotel nights, medications, and follow-ups.",
  },
  {
    id: 8,
    name: "Graham Holbrook",
    location: "Sydney, Australia",
    title: "Comfortable, Relaxed & Truly Painless Procedure",
    review:
      "I was extremely anxious about local anaesthesia needles, but the team’s needle-free numbing technique made the entire session completely tolerable. I watched movies and relaxed comfortably throughout.",
  },
  {
    id: 9,
    name: "Tristan Beaumont",
    location: "Bristol, UK",
    title: "12-Month Remote Follow-Up You Can Truly Rely On",
    review:
      "Most international medical clinics forget you once you leave the terminal. Anwar Clinic has stayed in regular touch every 60 days to review hair progression, donor zone recovery, and provide tailored maintenance advice.",
  },
  {
    id: 10,
    name: "Sebastian Thorne",
    location: "Toronto, Canada",
    title: "Gave Me Back My Confidence in My Thirties",
    review:
      "Male pattern baldness knocked my confidence for years. Traveling abroad for surgery felt like a bold step, but the professionalism, 5-star hotel stay, and flawless surgical craft made it an unforgettable, life-changing experience.",
  },
];

export default function MedicalTestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(3);

  const totalItems = TESTIMONIALS.length;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, totalItems - itemsPerView);

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
    }, 10000);

    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  const getTranslateValue = () => {
    if (itemsPerView === 1) return `translateX(calc(-${currentIndex} * (100% + 24px)))`;
    if (itemsPerView === 2) return `translateX(calc(-${currentIndex} * (50% + 12px)))`;
    return `translateX(calc(-${currentIndex} * (100% / 3 + 8px)))`;
  };

  return (
    <section className="py-20 lg:py-28 bg-nexgen-mainDarkBg text-white overflow-hidden border-t border-nexgen-primaryGold/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ========================================================
            HEADER (Matching Screenshot)
           ======================================================== */}
        <div className="mb-10 sm:mb-12 pb-6 border-b border-white/20">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-[1.2] max-w-3xl">
            Hear from Our Satisfied International Clients
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
              transform: getTranslateValue(),
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
                    <div className="flex items-center gap-1 text-nexgen-primaryGold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-nexgen-primaryGold text-nexgen-primaryGold" />
                      ))}
                    </div>

                    {/* Outline Quote Symbol */}
                    <span className="text-nexgen-brightGold font-serif text-3xl font-extrabold select-none leading-none">
                      ❞
                    </span>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-nexgen-veryDarkHeader tracking-tight mt-5 mb-3 leading-snug">
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
                  <h4 className="text-sm sm:text-base font-bold text-nexgen-veryDarkHeader">
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
          <div className="relative z-10 flex items-center gap-3 bg-nexgen-mainDarkBg px-4">
            <button
              onClick={prevSlide}
              aria-label="Previous testimonial (Slide Right)"
              className="w-11 h-11 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-nexgen-brightGold hover:text-nexgen-veryDarkHeader active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next testimonial (Slide Left)"
              className="w-11 h-11 rounded-full border border-white/50 flex items-center justify-center text-white hover:bg-nexgen-brightGold hover:text-nexgen-veryDarkHeader active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
