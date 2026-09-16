"use client";

import React from "react";
import { Calculator } from "lucide-react";
import { useConsultation } from "@/context/ConsultationContext";

interface CountryCostItem {
  country: string;
  flagIcon: string;
  price: string;
  badge?: string;
  description: string;
}

const COUNTRIES: CountryCostItem[] = [
  {
    country: "India",
    flagIcon: "https://flagcdn.com/w80/in.png",
    price: "$400",
    badge: "Best Value",
    description:
      "India delivers an unbeatable combination of clinical excellence and affordability. With internationally accredited surgeons, modern microscopic follicular techniques, and full concierge support, patients receive premium results at the lowest global cost.",
  },
  {
    country: "UAE",
    flagIcon: "https://flagcdn.com/w80/ae.png",
    price: "$3,500",
    description:
      "Clinics across Dubai and Abu Dhabi feature ultra-modern facilities and luxury patient accommodations. While surgical standards are high, substantial facility overhead and local operating costs make procedures significantly pricier.",
  },
  {
    country: "Turkey",
    flagIcon: "https://flagcdn.com/w80/tr.png",
    price: "$1,400",
    description:
      "Turkey is a globally recognized medical tourism hub with high-volume package pricing. While affordable, procedural consistency, technician reliance, and direct surgeon involvement can vary considerably between clinics.",
  },
  {
    country: "USA",
    flagIcon: "https://flagcdn.com/w80/us.png",
    price: "$7,500",
    description:
      "The United States provides advanced robotic technology and strict medical governance. However, steep surgeon fees, hospital charges, and post-op care expenses make it one of the most expensive destinations worldwide.",
  },
  {
    country: "China",
    flagIcon: "https://flagcdn.com/w80/cn.png",
    price: "$1,200",
    description:
      "China boasts a fast-growing hair transplant market driven by large domestic clinics and mechanized extraction tools. While rates are competitive, language barriers and limited international patient concierge services remain challenges.",
  },
];

export default function MedicalCostComparisonSection() {
  const { openConsultation } = useConsultation();

  return (
    <section className="py-20 lg:py-24 bg-nexgen-pageLightBg overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ========================================================
            LEFT-ALIGNED HEADER (Matching Screenshot)
           ======================================================== */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-nexgen-veryDarkHeader tracking-tight leading-[1.2]">
            Cost Comparison Between Hair Transplant
            in India, the UAE, Turkey, the USA, and China
          </h2>
        </div>

        {/* ========================================================
            5 COMPARISON CARDS
           ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-stretch">
          {COUNTRIES.map((item, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm border transition-all duration-300 hover:shadow-md ${item.badge
                  ? "border-nexgen-primaryGold/50 ring-1 ring-nexgen-primaryGold/20 shadow-md"
                  : "border-gray-200/70"
                }`}
            >
              <div>
                {/* Price Label & Value */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      Starts at
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-nexgen-brightGold/20 text-nexgen-veryDarkHeader border border-nexgen-primaryGold/40">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-nexgen-veryDarkHeader tracking-tight mt-2">
                    {item.price}
                  </div>
                </div>

                {/* Divider Line */}
                <div className="border-b border-gray-200/80 my-5" />

                {/* Flag + Country Name */}
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 shadow-xs">
                    <img
                      src={item.flagIcon}
                      alt={`${item.country} Flag`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-nexgen-veryDarkHeader">
                    {item.country}
                  </h3>
                </div>

                {/* Country Description */}
                <p className="text-xs sm:text-[13px] text-gray-500 font-normal leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
