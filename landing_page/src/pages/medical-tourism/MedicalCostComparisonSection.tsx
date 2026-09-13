"use client";

import React from "react";
import { Calculator } from "lucide-react";
import { useConsultation } from "@/context/ConsultationContext";

interface CountryCostItem {
  country: string;
  flagIcon: string;
  price: string;
  description: string;
}

const COUNTRIES: CountryCostItem[] = [
  {
    country: "UAE",
    flagIcon: "https://flagcdn.com/w80/ae.png",
    price: "$4,000",
    description:
      "UAE clinics, especially in Dubai, provide premium services with modern infrastructure. While they ensure luxury care and advanced techniques, costs are higher compared to India and Turkey.",
  },
  {
    country: "USA",
    flagIcon: "https://flagcdn.com/w80/us.png",
    price: "$7,000",
    description:
      "In the USA, hair transplants are performed with state-of-the-art technology and expert surgeons. Results are excellent, but high surgeon fees and clinic expenses make it one of the costliest options.",
  },
  {
    country: "Turkey",
    flagIcon: "https://flagcdn.com/w80/tr.png",
    price: "$1,500",
    description:
      "Turkey is a popular hub for affordable hair restoration. Skilled surgeons, competitive pricing, and attractive medical tourism packages make it a top choice for international patients.",
  },
  {
    country: "India",
    flagIcon: "https://flagcdn.com/w80/in.png",
    price: "$800",
    description:
      "India offers a perfect balance of affordability and quality. With highly experienced doctors, advanced transplant techniques, and modern clinics, India provides world-class results at the lowest cost among these destinations.",
  },
];

export default function MedicalCostComparisonSection() {
  const { openConsultation } = useConsultation();

  return (
    <section className="py-20 lg:py-24 bg-[#f8faf8] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* ========================================================
            LEFT-ALIGNED HEADER (Matching Screenshot)
           ======================================================== */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#162418] tracking-tight leading-[1.2]">
            Cost Comparison Between Hair Transplant <br className="hidden sm:inline" />
            in the USA, India, Turkey, and the UAE
          </h2>
        </div>

        {/* ========================================================
            4 WHITE COMPARISON CARDS (Matching Screenshot)
           ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {COUNTRIES.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-sm border border-gray-200/70 hover:shadow-md transition-shadow"
            >
              <div>
                {/* Price Label & Value */}
                <div>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium block">
                    Starts at
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#162418] tracking-tight mt-2">
                    {item.price}
                  </div>
                </div>

                {/* Divider Line */}
                <div className="border-b border-gray-200/80 my-6" />

                {/* Flag + Country Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={item.flagIcon}
                      alt={`${item.country} Flag`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#162418]">
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

        {/* ========================================================
            BOTTOM BANNER (Matching Screenshot)
           ======================================================== */}
        <div className="mt-10 bg-gradient-to-r from-[#2c3d28] via-[#354830] to-[#243320] rounded-2xl sm:rounded-3xl p-6 sm:py-6 sm:px-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          
          {/* Left: Graphic + Title */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex-shrink-0 flex items-center justify-center text-[#b1fc85] shadow-xs">
              <Calculator className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white tracking-tight leading-tight">
              Get your hair transplant cost estimation.
            </h3>
          </div>

          {/* Right: Consult Now Button */}
          <div className="flex-shrink-0">
            <button
              onClick={openConsultation}
              className="px-8 py-3.5 rounded-full bg-white text-[#162418] font-bold text-sm sm:text-base shadow-md hover:bg-[#eff5f1] transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              Consult Now
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
