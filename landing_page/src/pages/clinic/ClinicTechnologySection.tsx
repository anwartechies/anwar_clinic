"use client";

import React from "react";
import Link from "next/link";
import { Cpu, Users, Building2, Puzzle } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

const CLINIC_FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-8 h-8">
        {/* Machinery / Surgical Laser System */}
        <path d="M4 18V6H20V18H4Z" strokeLinejoin="round" />
        <line x1="8" y1="18" x2="8" y2="21" />
        <line x1="16" y1="18" x2="16" y2="21" />
        <line x1="6" y1="21" x2="18" y2="21" strokeLinecap="round" />
        <circle cx="9" cy="12" r="2" />
        <line x1="13" y1="10" x2="17" y2="10" />
        <line x1="13" y1="14" x2="17" y2="14" />
      </svg>
    ),
    title: "Advanced Technology",
    desc: "Equipped with the latest hair transplant machinery for precise and effective treatments.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-8 h-8">
        {/* Expert Team / Surgeons */}
        <path d="M16 21V19C16 17.9 15.1 17 14 17H10C8.9 17 8 17.9 8 19V21" strokeLinecap="round" />
        <circle cx="12" cy="11" r="4" />
        <path d="M12 2V4M4.9 4.9L6.3 6.3M19.1 4.9L17.7 6.3" strokeLinecap="round" />
      </svg>
    ),
    title: "Expert Team",
    desc: "Highly trained and experienced surgeons and staff ensure top-quality care and results.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-8 h-8">
        {/* Nationwide Medical Clinic */}
        <path d="M3 21H21" strokeLinecap="round" />
        <path d="M5 21V7L12 3L19 7V21" strokeLinejoin="round" />
        <path d="M12 10V16M9 13H15" strokeLinecap="round" />
      </svg>
    ),
    title: "Nationwide Clinics",
    desc: "Consistent standards of excellence maintained across all locations in India.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-8 h-8">
        {/* Personalized Lightbulb Puzzle */}
        <path d="M9 18H15M10 22H14" strokeLinecap="round" />
        <path d="M12 2C7.6 2 4 5.6 4 10C4 12.8 5.5 15.2 7.7 16.5C8.4 16.9 8.8 17.6 9 18H15C15.2 17.6 15.6 16.9 16.3 16.5C18.5 15.2 20 12.8 20 10C20 5.6 16.4 2 12 2Z" strokeLinejoin="round" />
        <path d="M9 10C9 8.3 10.3 7 12 7" strokeLinecap="round" />
      </svg>
    ),
    title: "Personalized Solutions",
    desc: "Tailored treatment plans designed to meet individual hair restoration needs.",
  },
];

export default function ClinicTechnologySection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-mainDarkBg text-white overflow-hidden border-t border-nexgen-primaryGold/20">
      <div className="qht-large-container">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading, Description & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-white tracking-tight leading-[1.12]">
              All Our Clinics Feature <br />
              Cutting-Edge Technology & <br />
              Skilled Professionals
            </h2>

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal max-w-xl">
              Every {COMPANY_NAME} surgical suite is engineered to hospital-grade sterility standards, equipped with precision optical magnification and micro-instrumentation. By pairing clinical innovation with seasoned hair restoration surgeons, we deliver consistent, natural-looking density across our nationwide centers.
            </p>

            <div className="pt-2">
              <Link
                href="/about-us/"
                className="bg-nexgen-brightGold hover:bg-white text-nexgen-veryDarkHeader font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-md transition-all active:scale-95 duration-150 inline-block"
              >
                About Us
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Feature Rows */}
          <div className="lg:col-span-6 divide-y divide-white/15 border-t border-b border-white/15">
            {CLINIC_FEATURES.map((feature, idx) => (
              <div key={idx} className="py-6 flex items-start gap-5 group">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-nexgen-veryDarkHeader border border-nexgen-primaryGold/30 text-nexgen-brightGold flex items-center justify-center flex-shrink-0 group-hover:border-nexgen-primaryGold transition-colors">
                  {feature.icon}
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-base sm:text-lg font-[500] text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-white/80 leading-relaxed font-normal">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
