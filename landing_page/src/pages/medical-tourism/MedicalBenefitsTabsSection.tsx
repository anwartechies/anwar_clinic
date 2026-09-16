"use client";

import React, { useState } from "react";
import { CalendarCheck, Plane, Hotel, Languages, LucideIcon, Play } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  heading: string;
  points: {
    title?: string;
    description: string;
  }[];
}

const TABS: TabItem[] = [
  {
    id: "tab-1",
    label: "Before & After You Visit",
    icon: CalendarCheck,
    heading: "Comprehensive patient care, from your home country to lifelong regrowth:",
    points: [
      {
        title: "Virtual Pre-Arrival Assessment",
        description: "Review your hairline and graft density expectations with our surgeons before booking flights.",
      },
      {
        title: "Bespoke Treatment Architecture",
        description: "Receive a personalized graft distribution roadmap designed for your specific Norwood grade and facial symmetry.",
      },
      {
        title: "Advanced Micro-FUE & DHI Protocols",
        description: "Benefit from gentle, scarless follicular extraction and high-density direct implanter techniques.",
      },
      {
        title: "1-Year Remote Recovery Support",
        description: "Stay supported with structured video follow-ups, customized wash schedules, and growth check-ins after you return home.",
      },
    ],
  },
  {
    id: "tab-2",
    label: "Travel & Transit Logistics",
    icon: Plane,
    heading: "Effortless travel coordination from the moment your flight touches down:",
    points: [
      {
        title: "Private Airport Chauffeur",
        description: "Complimentary airport pick-up and drop-off service with private, comfortable transfers directly to your accommodation.",
      },
      {
        title: "Dedicated Clinic Transportation",
        description: "Seamless daily transport between your hotel and our surgical facility for all pre-op, surgical, and post-wash visits.",
      },
      {
        title: "Visa & Flight Documentation Support",
        description: "Official hospital invitation letters and visa facilitation assistance for rapid Indian Medical e-Visa processing.",
      },
    ],
  },
  {
    id: "tab-3",
    label: "Curated Stay & Hospitality",
    icon: Hotel,
    heading: "Restful, hygienic, and convenient accommodations tailored to your budget:",
    points: [
      {
        title: "Partnered 4-Star & 5-Star Accommodations",
        description: "Enjoy exclusive clinic corporate rates at verified premium hotels located within 10–15 minutes of our surgical facility.",
      },
      {
        title: "Flexible Stay Packages",
        description: "Customized lodging arrangements suited to your preference, from luxury executive suites to fully equipped serviced apartments.",
      },
      {
        title: "Post-Op Rest Support",
        description: "In-room recovery essentials including sterile neck pillows, gentle shampoo supplies, and customized dietary arrangements.",
      },
    ],
  },
  {
    id: "tab-4",
    label: "Multilingual & VIP Concierge",
    icon: Languages,
    heading: "Crystal-clear communication and personalized guidance every step of the way:",
    points: [
      {
        title: "Dedicated 1-on-1 Patient Coordinator",
        description: "A single, English-fluent patient manager assigned to assist you through every medical consultation, procedure, and inquiry.",
      },
      {
        title: "Personal Translator Assistance",
        description: "Native interpretation support for Arabic, Russian, French, and other non-English speaking international patients.",
      },
      {
        title: "24/7 Priority WhatsApp & Tele-Support",
        description: "Round-the-clock direct access to your care team for instant answers, prescription support, and complete peace of mind.",
      },
    ],
  },
];

export default function MedicalBenefitsTabsSection() {
  const [activeTabId, setActiveTabId] = useState("tab-1");

  const activeTab = TABS.find((t) => t.id === activeTabId) || TABS[0];

  return (
    <section className="py-20 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* ========================================================
            LEFT-ALIGNED HEADER (Matching Screenshot)
           ======================================================== */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-nexgen-veryDarkHeader tracking-tight leading-[1.2]">
            World-Class Medical Care & VIP Hospitality for Global Patients
          </h2>
          <p className="mt-3 text-xs sm:text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
            From chauffeured airport transfers and luxury hotel stays to expert surgeon-led restoration and dedicated aftercare, {COMPANY_NAME} ensures an effortless, stress-free medical journey.
          </p>
        </div>

        {/* ========================================================
            MAIN 2-COLUMN LAYOUT: Vertical Tab Menu + Content
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-16 border-b border-gray-100">
          
          {/* Left Column: Vertical Tab List Card (Matching Screenshot) */}
          <div className="lg:col-span-4 bg-nexgen-pageLightBg rounded-3xl p-3.5 sm:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col divide-y divide-gray-200/60">
              {TABS.map((tab) => {
                const isActive = tab.id === activeTabId;
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 sm:py-4.5 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-nexgen-mainDarkBg text-white shadow-lg my-1 border border-nexgen-primaryGold/30"
                        : "bg-transparent text-nexgen-veryDarkHeader hover:bg-white/50"
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <IconComp
                        className={`w-5 h-5 transition-colors ${
                          isActive ? "text-nexgen-brightGold" : "text-nexgen-veryDarkHeader"
                        }`}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={`text-sm sm:text-[15px] font-semibold tracking-tight leading-snug ${
                        isActive ? "text-white" : "text-nexgen-veryDarkHeader"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Tab Content Area (Matching Screenshot) */}
          <div className="lg:col-span-8 pt-2 sm:pt-4">
            
            {/* Dynamic Content Heading */}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-nexgen-veryDarkHeader tracking-tight leading-[1.25] mb-8 sm:mb-10 max-w-xl">
              {activeTab.heading}
            </h3>

            {/* Bullet Points with Triangular Arrow Markers */}
            <div className="space-y-4 sm:space-y-5">
              {activeTab.points.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  {/* Custom Arrow Icon */}
                  <span className="text-nexgen-primaryGold mt-1 flex-shrink-0">
                    <Play className="w-3.5 h-3.5 fill-nexgen-primaryGold stroke-nexgen-primaryGold" />
                  </span>

                  {/* Text Content */}
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                    {point.title ? (
                      <>
                        <strong className="font-bold text-nexgen-veryDarkHeader mr-1.5">
                          {point.title}:
                        </strong>
                        <span className="text-gray-700 font-normal">{point.description}</span>
                      </>
                    ) : (
                      <span className="text-gray-800 font-normal">{point.description}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
