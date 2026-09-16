"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface CelebrityTestimonial {
  id: number;
  name: string;
  role: string;
  title: string;
  quote: string;
  rating: number;
  image: string;
}

export default function AboutCelebrityTrustSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const TESTIMONIALS: CelebrityTestimonial[] = [
    {
      id: 1,
      name: "Rajpal Yadav",
      role: "Indian actor and comedian",
      title: "Exceptional Experience",
      quote: `I am truly grateful to ${COMPANY_NAME} for their exceptional hair restoration procedure. The entire medical team was professional, attentive, and made the experience comfortable from start to finish.`,
      rating: 5,
      image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/testimonial-1-mu2jxgr4xjdvq4.jpg",
    },
    {
      id: 2,
      name: "Dayanand Shetty",
      role: "Indian actor (CID fame)",
      title: "Remarkable Density & Care",
      quote: `Choosing ${COMPANY_NAME} was one of the best decisions for my hair restoration. The surgical precision, sterile theaters, and doctor-led approach gave me a completely natural hairline.`,
      rating: 5,
      image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/testimonial-2-mu2jxhc5aa4czi.jpg",
    },
    {
      id: 3,
      name: "Armaan Malik",
      role: "Content Creator & Artist",
      title: "World-Class Technology",
      quote: `The direct micro-implantation protocol and minimal recovery downtime at ${COMPANY_NAME} exceeded all my expectations. Highly recommended to anyone seeking natural, permanent density.`,
      rating: 5,
      image: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/testimonial-3-mu2jxhk9h6w4rt.jpg",
    },
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-pageLightBg overflow-hidden">
      <div className="qht-large-container">

        {/* Centered Heading & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold uppercase tracking-wider block mb-2">
            Verified Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight mb-4">
            Celebrities & Patients Who Trust {COMPANY_NAME}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-2xl mx-auto">
            From familiar faces to everyday citizens, thousands of people have trusted {COMPANY_NAME} Hair Transplant Clinic for their hair restoration journey. Every case is unique, but the results remain constant: natural appearance, renewed confidence, and trusted excellence.
          </p>
        </div>

        {/* Testimonial Card with Sliding Track */}
        <div className="relative max-w-5xl mx-auto">

          {/* Card Outer Mask */}
          <div
            className="rounded-3xl sm:rounded-[36px] overflow-hidden shadow-2xl bg-nexgen-mainDarkBg border border-nexgen-primaryGold/30"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Sliding Flex Track */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {TESTIMONIALS.map((item) => (
                <div
                  key={item.id}
                  className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-12 min-h-[460px]"
                >
                  {/* Left Column: Quote & Testimonial Info */}
                  <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-between text-white relative">

                    <div className="space-y-4 sm:space-y-6">
                      {/* Double Quote Vector Icon */}
                      <div className="text-nexgen-brightGold">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 fill-none stroke-currentColor stroke-[1.5]" viewBox="0 0 48 48">
                          <path d="M12 28C16.4183 28 20 24.4183 20 20C20 15.5817 16.4183 12 12 12C7.58172 12 4 15.5817 4 20C4 28 10 36 20 36" strokeLinecap="round" />
                          <path d="M34 28C38.4183 28 42 24.4183 42 20C42 15.5817 38.4183 12 34 12C29.5817 12 26 15.5817 26 20C26 28 32 36 42 36" strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* Testimonial Heading */}
                      <h3 className="text-xl sm:text-2xl lg:text-[26px] font-[500] text-white tracking-tight">
                        {item.title}
                      </h3>

                      {/* Testimonial Body Paragraph */}
                      <p className="text-xs sm:text-[13.5px] text-gray-300 leading-relaxed font-normal">
                        {item.quote}
                      </p>
                    </div>

                    {/* Author & Rating */}
                    <div className="pt-6 sm:pt-8 mt-4 border-t border-nexgen-primaryGold/20">
                      {/* 5 Stars */}
                      <div className="flex items-center gap-1 text-nexgen-brightGold mb-2">
                        {[...Array(item.rating)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-nexgen-brightGold text-nexgen-brightGold" />
                        ))}
                      </div>

                      <div className="text-sm sm:text-base font-bold text-white">
                        - {item.name}
                      </div>
                      <div className="text-xs text-nexgen-primaryGold/80 font-normal mt-0.5">
                        {item.role}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Full-Height Celebrity Portrait */}
                  <div className="lg:col-span-6 bg-gray-900 relative min-h-[340px] sm:min-h-[420px] lg:min-h-full">
                    <img
                      src={item.image}
                      alt={`${item.name} - Hair Transplant Result`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Floating Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-nexgen-brightGold text-nexgen-veryDarkHeader flex items-center justify-center hover:bg-yellow-400 active:scale-90 transition-all shadow-lg border border-nexgen-primaryGold/30 cursor-pointer z-20"
          >
            <ChevronLeft className="w-5 h-5 text-nexgen-veryDarkHeader" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next testimonial"
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-nexgen-brightGold text-nexgen-veryDarkHeader flex items-center justify-center hover:bg-yellow-400 active:scale-90 transition-all shadow-lg border border-nexgen-primaryGold/30 cursor-pointer z-20"
          >
            <ChevronRight className="w-5 h-5 text-nexgen-veryDarkHeader" />
          </button>

          {/* Bottom Dot Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${currentIndex === idx
                  ? "w-8 h-2.5 bg-nexgen-brightGold"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                  }`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
