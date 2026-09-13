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
    label: "Before & After You Visit Us",
    icon: CalendarCheck,
    heading: "What we provide when you pay us a visit:",
    points: [
      {
        title: "Pre-arrival Consultation",
        description: "Online consultations: Plan your procedure before you even land in India.",
      },
      {
        title: "Personalized Treatment Plans",
        description: "Customized solutions: Get a hair transplant tailored to your unique hair loss pattern.",
      },
      {
        title: "Advanced Techniques",
        description: "Modern procedures: Benefit from FUE and FUT methods with natural-looking results.",
      },
      {
        title: "Post-Procedure Support",
        description: "Continuous care: Receive follow-up guidance even after you return home.",
      },
    ],
  },
  {
    id: "tab-2",
    label: "Your Travel",
    icon: Plane,
    heading: "How we make your travelling very smooth and easy:",
    points: [
      {
        description: "Airport Pickup and drop-off via taxi/cabs.",
      },
      {
        description: "Fast and easy transfers to international clients.",
      },
    ],
  },
  {
    id: "tab-3",
    label: "Your Stay",
    icon: Hotel,
    heading: "This is how we make sure you have a peaceful stay when you come to visit us:",
    points: [
      {
        description: "Luxury Accommodation Help.",
      },
      {
        description: "Whether it is a low-budget hotel or the top of the top, it is personalized to your choice.",
      },
    ],
  },
  {
    id: "tab-4",
    label: "Communication",
    icon: Languages,
    heading: "For international clients, communication might be a problem, this how we help:",
    points: [
      {
        description: "Personal Translator Service.",
      },
      {
        description: "Assistance to non-English speaking patients.",
      },
    ],
  },
];

export default function MedicalBenefitsTabsSection() {
  const [activeTabId, setActiveTabId] = useState("tab-4");

  const activeTab = TABS.find((t) => t.id === activeTabId) || TABS[3];

  return (
    <section className="py-20 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* ========================================================
            LEFT-ALIGNED HEADER (Matching Screenshot)
           ======================================================== */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#162418] tracking-tight leading-[1.2]">
            Benefits You’ll Receive During Your Visit for a Seamless, Satisfying Experience
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-gray-500 font-normal">
            {COMPANY_NAME} ensures your medical tourism experience is both hassle-free and stress-free.
          </p>
        </div>

        {/* ========================================================
            MAIN 2-COLUMN LAYOUT: Vertical Tab Menu + Content
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-16 border-b border-gray-100">
          
          {/* Left Column: Vertical Tab List Card (Matching Screenshot) */}
          <div className="lg:col-span-4 bg-[#eff5f1] rounded-3xl p-3.5 sm:p-4 shadow-sm border border-[#e2ece4]">
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
                        ? "bg-[#52664d] text-white shadow-lg my-1"
                        : "bg-transparent text-[#162418] hover:bg-white/50"
                    }`}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <IconComp
                        className={`w-5 h-5 transition-colors ${
                          isActive ? "text-white" : "text-[#162418]"
                        }`}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={`text-sm sm:text-[15px] font-semibold tracking-tight leading-snug ${
                        isActive ? "text-white" : "text-[#162418]"
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
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#162418] tracking-tight leading-[1.25] mb-8 sm:mb-10 max-w-xl">
              {activeTab.heading}
            </h3>

            {/* Bullet Points with Triangular Arrow Markers */}
            <div className="space-y-4 sm:space-y-5">
              {activeTab.points.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  {/* Custom Arrow Icon */}
                  <span className="text-[#162418] mt-1 flex-shrink-0">
                    <Play className="w-3.5 h-3.5 fill-[#162418] stroke-[#162418]" />
                  </span>

                  {/* Text Content */}
                  <p className="text-sm sm:text-base text-[#162418] leading-relaxed">
                    {point.title ? (
                      <>
                        <strong className="font-bold text-[#162418] mr-1.5">
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
