"use client";

import React, { useState } from "react";
import { COMPANY_NAME } from "@/config/constants";

interface CityGallery {
  id: string;
  name: string;
  icon: React.ReactNode;
  photos: {
    hero: string;
    heroAlt: string;
    office: string;
    officeAlt: string;
    otRoom: string;
    otRoomAlt: string;
    otLight: string;
    otLightAlt: string;
    lounge: string;
    loungeAlt: string;
    wallOfFame: string;
    wallOfFameAlt: string;
  };
}

const CITY_GALLERIES: CityGallery[] = [
  {
    id: "patna",
    name: "Patna (Main Branch)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        {/* Clinic / Building */}
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h2M13 10h2M9 14h2M13 14h2M9 18h2M13 18h2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    photos: {
      hero: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-53-08-pm-mu46xz28f0p1lx.jpeg",
      heroAlt: "Patna Main Clinic Entrance and Reception",
      office: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-55-37-pm-mu4713fhxp35ck.jpeg",
      officeAlt: "Doctor Consultation Suite Patna",
      otRoom: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-8-03-52-pm-mu47c3sxpl41ro.jpeg",
      otRoomAlt: "Advanced Sterile OT Room Patna",
      otLight: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-53-52-pm-mu46z5zwqbrtgd.jpeg",
      otLightAlt: "High Precision Surgical Shadowless Lamp",
      lounge: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-14-at-2-10-56-pm-mu16nggosuecep.jpeg",
      loungeAlt: "Patna Patient Lounge and Waiting Area",
      wallOfFame: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/doctor-mu16qkmeekqvfb.jpeg",
      wallOfFameAlt: "Wall of Patient Transformation Success Stories",
    },
  },
  {
    id: "mumbai",
    name: "Mumbai (Second Branch)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        {/* Gateway / Metropolitan */}
        <path d="M4 21V6H20V21" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 6H22V4H2V6Z" />
        <path d="M8 21V11C8 9.5 16 9.5 16 11V21" strokeLinecap="round" />
      </svg>
    ),
    photos: {
      hero: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-53-08-pm-mu46xz28f0p1lx.jpeg",
      heroAlt: "Mumbai Main Clinic Entrance and Reception",
      office: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-55-37-pm-mu4713fhxp35ck.jpeg",
      officeAlt: "Doctor Consultation Suite Mumbai",
      otRoom: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-8-03-52-pm-mu47c3sxpl41ro.jpeg",
      otRoomAlt: "Advanced Sterile OT Room Mumbai",
      otLight: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-53-52-pm-mu46z5zwqbrtgd.jpeg",
      otLightAlt: "High Precision Surgical Shadowless Lamp",
      lounge: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-14-at-2-10-56-pm-mu16nggosuecep.jpeg",
      loungeAlt: "Patna Patient Lounge and Waiting Area",
      wallOfFame: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/doctor-mu16qkmeekqvfb.jpeg",
      wallOfFameAlt: "Wall of Patient Transformation Success Stories",
    },
  },
];

export default function AboutClinicStandardsSection() {
  const [activeCityId, setActiveCityId] = useState("patna");

  const currentGallery =
    CITY_GALLERIES.find((g) => g.id === activeCityId) || CITY_GALLERIES[0];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">

        {/* Header Row: Title & Filter on Left, Description on Right */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">

          {/* Left Column: Heading & City Pills */}
          <div>
            <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold uppercase tracking-wider block mb-2">
              Clinical Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.12] mb-5">
              International Standards, <br />
              Local Care
            </h2>

            {/* City Filter Pills */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {CITY_GALLERIES.map((city) => {
                const isActive = activeCityId === city.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setActiveCityId(city.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${isActive
                      ? "bg-nexgen-veryDarkHeader text-white border border-nexgen-primaryGold shadow-md"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-nexgen-primaryGold/50 hover:bg-nexgen-pageLightBg"
                      }`}
                  >
                    <span className={isActive ? "text-nexgen-brightGold" : "text-nexgen-primaryGold"}>
                      {city.icon}
                    </span>
                    <span>{city.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Description */}
          <div className="max-w-md lg:pb-1">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
              With modern clinics across several cities in India, {COMPANY_NAME} continues to provide accessible, safe, and dependable hair restoration care.
            </p>
          </div>

        </div>

        {/* Dynamic Image Mosaic Grid */}
        <div className="space-y-4 sm:space-y-5">

          {/* Top Row: Big Hero (Left) + 2 Stacked Cards (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

            {/* Main Tall Hero Photo (Left 6 cols on LG) */}
            <div className="lg:col-span-6 rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 shadow-xs border border-gray-100 relative group aspect-[4/3] sm:aspect-[16/11] lg:aspect-auto lg:h-full min-h-[280px] sm:min-h-[380px]">
              <img
                src={currentGallery.photos.hero}
                alt={currentGallery.photos.heroAlt}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

            {/* Right 2 Stacked Photos (Right 6 cols on LG) */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">

              {/* Doctor Consultation Suite */}
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 shadow-xs border border-gray-100 aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/8.5] relative group">
                <img
                  src={currentGallery.photos.office}
                  alt={currentGallery.photos.officeAlt}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>

              {/* Sterile Surgical OT Room */}
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 shadow-xs border border-gray-100 aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/8.5] relative group">
                <img
                  src={currentGallery.photos.otRoom}
                  alt={currentGallery.photos.otRoomAlt}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>

            </div>

          </div>

          {/* Bottom Row: 3 Equal Photos Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">

            {/* 1. Surgical OT Lamp / Door */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 shadow-xs border border-gray-100 aspect-[4/3] relative group">
              <img
                src={currentGallery.photos.otLight}
                alt={currentGallery.photos.otLightAlt}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

            {/* 2. Lounge & Corridor */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 shadow-xs border border-gray-100 aspect-[4/3] relative group">
              <img
                src={currentGallery.photos.lounge}
                alt={currentGallery.photos.loungeAlt}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

            {/* 3. Wall of Fame / Transformations */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 shadow-xs border border-gray-100 aspect-[4/3] relative group">
              <img
                src={currentGallery.photos.wallOfFame}
                alt={currentGallery.photos.wallOfFameAlt}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
