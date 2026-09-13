"use client";

import React, { useState, useEffect } from "react";
import { PROMISES_LIST, PROMISE_GALLERY_IMAGES } from "@/data/qhtData";

export default function PromisesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance photos every 10 seconds infinitely
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMISE_GALLERY_IMAGES.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  // Triple images for seamless infinite continuous scroll
  const galleryItems = [
    ...PROMISE_GALLERY_IMAGES,
    ...PROMISE_GALLERY_IMAGES,
    ...PROMISE_GALLERY_IMAGES,
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="qht-container">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-black/50">
          <h2 className="text-3xl sm:text-6xl font-[500] text-[#162418]">
            Our Clinical Commitments
          </h2>
          <span className="w-10 h-10 rounded-lg border-[0.1px] border-black font-bold flex items-center justify-center text-base">
            1
          </span>
        </div>

        {/* 2 Column Layout: Hero Visual & 5 Promises */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          {/* Left Column: Promise Statement & Image */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
              <img
                src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/clinic-with-doc-mtzjmlrtcqfokt.jpeg"
                alt="Our Clinical Commitments"
                className="w-full h-auto object-cover"
              />
            </div>
            <h3 className="text-xl sm:text-3xl font-[400] text-[#162418] leading-snug">
              Artistic Hairline Architecture. Zero-Compromise Safety. Permanent Follicular Vitality.
            </h3>
          </div>

          {/* Right Column: 5 Numbered Promises */}
          <div className="lg:col-span-7 space-y-4">
            {PROMISES_LIST.map((promise) => (
              <div
                key={promise.id}
                className="flex items-start gap-4 p-5 rounded-2xl"
              >
                <span className="w-7 h-7 flex-shrink-0 rounded-full bg-[#1b392b] text-white font-bold flex items-center justify-center text-xs">
                  {promise.id}
                </span>
                <div>
                  <h4 className="text-xl sm:text-2xl font-[300] text-[#162418]">
                    {promise.title}
                  </h4>
                  <p className="mt-1 text-xs sm:text-lg text-gray-600 leading-relaxed">
                    {promise.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-Width Automatic 10-Second Infinite Slideshow */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16 overflow-hidden">
        <div
          className="flex gap-5 sm:gap-6 transition-transform duration-1000 ease-in-out pl-6 sm:pl-10"
          style={{
            transform: `translateX(-${currentIndex * 360}px)`,
          }}
        >
          {galleryItems.map((imgUrl, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[300px] sm:w-[420px] md:w-[420px] h-[220px] sm:h-[300px] md:h-[390px] rounded-3xl overflow-hidden shadow-sm border border-gray-100/80 group bg-gray-50"
            >
              <img
                src={imgUrl}
                alt={`Surgical Facility ${(idx % PROMISE_GALLERY_IMAGES.length) + 1}`}
                className="w-full h-full object-fit group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
