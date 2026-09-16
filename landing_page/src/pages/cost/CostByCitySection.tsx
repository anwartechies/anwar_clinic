"use client";

import React, { useState } from "react";
import { COMPANY_NAME } from "@/config/constants";

interface CityItem {
  id: string;
  name: string;
  isFeatured?: boolean;
  svgIcon: React.ReactNode;
}

const CITIES_DATA: CityItem[] = [
  {
    id: "jaipur",
    name: "Jaipur",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Hawa Mahal - Iconic Detailed Facade */}
        <path d="M14 56V26L22 18L32 10L42 18L50 26V56H14Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 28H26M38 28H42M30 20H34M22 36H26M38 36H42M30 30H34M22 46H26M38 46H42M30 40H34" strokeLinecap="round" />
        <path d="M27 56V48C27 45.5 37 45.5 37 48V56" />
        <path d="M10 56H54" strokeLinecap="round" />
        <circle cx="32" cy="7" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "chandigarh",
    name: "Chandigarh",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Open Hand Monument */}
        <path d="M24 56V34L26 34L26 18C26 15 31 15 31 18L31 28L36 21C36 18 41 18 41 21L41 30L45 24C45 21 50 21 50 24L50 38L44 48L44 56" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="56" x2="52" y2="56" strokeLinecap="round" />
        <line x1="20" y1="56" x2="20" y2="44" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "lucknow",
    name: "Lucknow",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Rumi Darwaza Grand Gateway */}
        <path d="M12 56V32C12 18 32 12 32 12C32 12 52 18 52 32V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 56V38C22 30 32 26 32 26C32 26 42 30 42 38V56" strokeLinecap="round" />
        <circle cx="32" cy="20" r="2.5" />
        <line x1="8" y1="56" x2="56" y2="56" strokeLinecap="round" />
        <path d="M18 28H22M42 28H46" />
      </svg>
    ),
  },
  {
    id: "gurgaon",
    name: "Gurgaon",
    isFeatured: true,
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Cyber City Highrise Architecture */}
        <path d="M32 8L44 20V56H20V20L32 8Z" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="32" y1="8" x2="32" y2="56" strokeLinecap="round" />
        <line x1="12" y1="56" x2="52" y2="56" strokeLinecap="round" />
        <path d="M25 28H39M25 36H39M25 44H39M25 50H39" strokeLinecap="round" />
        <path d="M12 56V34L20 28M52 56V34L44 28" />
      </svg>
    ),
  },
  {
    id: "kochi",
    name: "Kochi",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Kathakali Art Form Face Mask */}
        <circle cx="32" cy="38" r="14" strokeLinecap="round" />
        <path d="M32 10L40 24H24L32 10Z" strokeLinejoin="round" />
        <path d="M22 24C22 24 32 18 42 24" strokeLinecap="round" />
        <circle cx="27" cy="36" r="1.5" fill="currentColor" />
        <circle cx="37" cy="36" r="1.5" fill="currentColor" />
        <path d="M28 44C30 47 34 47 36 44" strokeLinecap="round" />
        <path d="M18 36C18 36 20 48 32 52C44 48 46 36 46 36" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "nagpur",
    name: "Nagpur",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Deekshabhoomi Great Stupa */}
        <path d="M14 56C14 28 50 28 50 56" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="32" y1="14" x2="32" y2="28" strokeLinecap="round" strokeWidth="1.8" />
        <circle cx="32" cy="12" r="2.5" fill="currentColor" />
        <path d="M23 56V48C23 42 32 42 32 42C32 42 41 42 41 48V56" strokeLinecap="round" />
        <line x1="10" y1="56" x2="54" y2="56" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "haridwar",
    name: "Haridwar",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Har Ki Pauri / Temple Gateway */}
        <path d="M14 18H50V24H14V18Z" strokeLinejoin="round" />
        <path d="M20 24V56M44 24V56" strokeLinecap="round" />
        <path d="M10 14L32 6L54 14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 56H54" strokeLinecap="round" />
        <line x1="26" y1="36" x2="38" y2="36" />
      </svg>
    ),
  },
  {
    id: "guwahati",
    name: "Guwahati",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Sun / Kamakhya Sacred Wheel Motif */}
        <circle cx="32" cy="32" r="16" strokeLinecap="round" />
        <circle cx="32" cy="32" r="7" strokeLinecap="round" />
        <line x1="32" y1="16" x2="32" y2="25" strokeLinecap="round" />
        <line x1="32" y1="39" x2="32" y2="48" strokeLinecap="round" />
        <line x1="16" y1="32" x2="25" y2="32" strokeLinecap="round" />
        <line x1="39" y1="32" x2="48" y2="32" strokeLinecap="round" />
        <line x1="21" y1="21" x2="27" y2="27" strokeLinecap="round" />
        <line x1="37" y1="37" x2="43" y2="43" strokeLinecap="round" />
        <line x1="43" y1="21" x2="37" y2="27" strokeLinecap="round" />
        <line x1="27" y1="37" x2="21" y2="43" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "dehradun",
    name: "Dehradun",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Iconic Clock Tower of Dehradun */}
        <path d="M26 56V16L32 8L38 16V56H26Z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="24" r="3" strokeWidth="1.4" />
        <line x1="32" y1="24" x2="32" y2="22" strokeLinecap="round" />
        <line x1="32" y1="24" x2="34" y2="24" strokeLinecap="round" />
        <line x1="18" y1="56" x2="46" y2="56" strokeLinecap="round" />
        <line x1="26" y1="36" x2="38" y2="36" />
        <line x1="26" y1="46" x2="38" y2="46" />
      </svg>
    ),
  },
  {
    id: "bangalore",
    name: "Bangalore",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Vidhana Soudha Palace Architecture */}
        <path d="M12 56V30H52V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 12L42 24H22L32 12Z" strokeLinejoin="round" />
        <path d="M22 56V40H42V56" strokeLinecap="round" />
        <circle cx="32" cy="9" r="2" fill="currentColor" />
        <line x1="8" y1="56" x2="56" y2="56" strokeLinecap="round" />
        <line x1="18" y1="36" x2="22" y2="36" />
        <line x1="42" y1="36" x2="46" y2="36" />
      </svg>
    ),
  },
  {
    id: "chennai",
    name: "Chennai",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Chennai Central Station Facade */}
        <path d="M16 56V24L32 12L48 24V56" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="26" r="3.5" strokeWidth="1.4" />
        <path d="M24 56V42H40V56" strokeLinecap="round" />
        <line x1="10" y1="56" x2="54" y2="56" strokeLinecap="round" />
        <line x1="16" y1="34" x2="24" y2="34" />
        <line x1="40" y1="34" x2="48" y2="34" />
      </svg>
    ),
  },
  {
    id: "noida",
    name: "Noida",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Modern Twin Skyscraper Towers */}
        <path d="M14 56V20L28 14V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 56V26L48 18V56" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="10" y1="56" x2="54" y2="56" strokeLinecap="round" />
        <path d="M18 26H24M18 34H24M18 42H24M36 32H42M36 40H42M36 48H42" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "delhi",
    name: "Delhi",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* India Gate */}
        <path d="M16 56V16H48V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 16H52V12H12V16Z" strokeLinejoin="round" />
        <path d="M24 56V32C24 27 40 27 40 32V56" strokeLinecap="round" />
        <line x1="8" y1="56" x2="56" y2="56" strokeLinecap="round" />
        <line x1="20" y1="22" x2="44" y2="22" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "ghaziabad",
    name: "Ghaziabad",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Heritage Gateway Tower */}
        <path d="M18 56V20L32 10L46 20V56" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="28" r="4" strokeWidth="1.4" />
        <path d="M24 56V44H40V56" strokeLinecap="round" />
        <line x1="12" y1="56" x2="52" y2="56" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "mumbai",
    name: "Mumbai",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Gateway of India */}
        <path d="M12 56V22H52V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22L32 10L52 22" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 56V32C22 26 42 26 42 32V56" strokeLinecap="round" />
        <line x1="8" y1="56" x2="56" y2="56" strokeLinecap="round" />
        <line x1="16" y1="28" x2="22" y2="28" />
        <line x1="42" y1="28" x2="48" y2="28" />
      </svg>
    ),
  },
  {
    id: "indore",
    name: "Indore",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Rajwada 7-Story Palace */}
        <path d="M16 56V18L32 10L48 18V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 26H42M22 34H42M22 42H42" strokeLinecap="round" />
        <path d="M26 56V48H38V56" strokeLinecap="round" />
        <line x1="10" y1="56" x2="54" y2="56" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "surat",
    name: "Surat",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Surat Fort Castle */}
        <path d="M14 56V24H50V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 24L18 18H46L52 24" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 56V38H40V56" strokeLinecap="round" />
        <line x1="8" y1="56" x2="56" y2="56" strokeLinecap="round" />
        <circle cx="32" cy="30" r="2" />
      </svg>
    ),
  },
  {
    id: "pune",
    name: "Pune",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Shaniwar Wada Fort Gate */}
        <path d="M14 56V20H50V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 56V30C22 24 42 24 42 30V56" strokeLinecap="round" />
        <line x1="8" y1="56" x2="56" y2="56" strokeLinecap="round" />
        <path d="M18 14H46V20H18V14Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "kolkata",
    name: "Kolkata",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Victoria Memorial Palace Dome */}
        <path d="M12 56H52" strokeLinecap="round" />
        <path d="M18 56V32C18 20 46 20 46 32V56" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="14" r="3.5" strokeWidth="1.4" />
        <line x1="32" y1="6" x2="32" y2="10" strokeLinecap="round" />
        <path d="M24 56V42H40V56" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Sidi Saiyyed / Heritage Mosque Minaret */}
        <path d="M18 56V18L22 14V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M46 56V18L42 14V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 28C22 22 42 22 42 28V56H22V28Z" strokeLinecap="round" />
        <line x1="12" y1="56" x2="52" y2="56" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "patna",
    name: "Patna",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Golghar Monument Architecture */}
        <path d="M14 56C14 26 50 26 50 56" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="20" r="2.5" fill="currentColor" />
        <path d="M18 56L46 32" strokeDasharray="3 3" strokeLinecap="round" />
        <line x1="10" y1="56" x2="54" y2="56" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    svgIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-14 h-14 sm:w-16 sm:h-16">
        {/* Charminar 4 Pillars Grand Arch */}
        <path d="M14 56V16L18 10V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M50 56V16L46 10V56" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 30C18 20 46 20 46 30V56H18V30Z" strokeLinecap="round" />
        <path d="M24 56V38C24 34 40 34 40 38V56" strokeLinecap="round" />
        <line x1="10" y1="56" x2="54" y2="56" strokeLinecap="round" />
      </svg>
    ),
  },
];

interface CostByCitySectionProps {
  onOpenConsultation?: () => void;
}

export default function CostByCitySection({
  onOpenConsultation,
}: CostByCitySectionProps) {
  const [selectedCity, setSelectedCity] = useState("gurgaon");

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-pageLightBg overflow-hidden border-t border-nexgen-primaryGold/20">
      <div className="qht-large-container">
        
        {/* Header */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold uppercase tracking-wider block mb-2">
            By City
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight mb-4">
            Hair Transplant Cost by City in India
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-3xl">
            Explore city-specific hair transplant pricing across India. Metropolitan cities may carry a small premium due to advanced clinic infrastructure, while {COMPANY_NAME}&apos;s transparent pricing ensures no surprise charges nationwide.
          </p>
        </div>

        {/* 7-Columns City Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3.5 sm:gap-4">
          {CITIES_DATA.map((city) => {
            const isSelected = selectedCity === city.id;
            return (
              <button
                type="button"
                key={city.id}
                onClick={() => {
                  setSelectedCity(city.id);
                  if (onOpenConsultation) onOpenConsultation();
                }}
                className={`group rounded-[22px] p-4 sm:p-5 flex flex-col items-center justify-between aspect-square transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? "bg-nexgen-veryDarkHeader text-white shadow-lg border-nexgen-primaryGold scale-[1.02]"
                    : "bg-white text-gray-800 border-gray-200/80 hover:bg-nexgen-veryDarkHeader hover:text-white hover:border-nexgen-primaryGold hover:shadow-md hover:-translate-y-1"
                }`}
              >
                {/* SVG Icon - Large & Responsive */}
                <div className={`my-auto flex items-center justify-center transition-colors duration-300 ${
                  isSelected
                    ? "text-nexgen-brightGold"
                    : "text-nexgen-primaryGold group-hover:text-nexgen-brightGold"
                }`}>
                  {city.svgIcon}
                </div>

                {/* City Name */}
                <span className={`text-xs sm:text-sm font-bold tracking-tight mt-1 transition-colors duration-300 ${
                  isSelected
                    ? "text-white"
                    : "text-gray-900 group-hover:text-white"
                }`}>
                  {city.name}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
