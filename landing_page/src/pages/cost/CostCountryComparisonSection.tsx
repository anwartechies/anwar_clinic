"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

interface CountryComparisonRow {
  country: string;
  flag: string;
  isBestValue?: boolean;
  costPerGraft: string;
  avgCost: string;
  language: string;
  waitTime: string;
}

const COUNTRY_COMPARISON_DATA: CountryComparisonRow[] = [
  {
    country: "India (NexGen)",
    flag: "https://flagcdn.com/w40/in.png",
    isBestValue: true,
    costPerGraft: "₹10 – ₹25",
    avgCost: "₹50,000 – ₹1,50,000",
    language: "English / Hindi",
    waitTime: "1–3 Days",
  },
  {
    country: "Turkey",
    flag: "https://flagcdn.com/w40/tr.png",
    costPerGraft: "₹100 – ₹150",
    avgCost: "₹3,00,000 – ₹7,20,000",
    language: "Translator needed",
    waitTime: "1–2 Weeks",
  },
  {
    country: "UAE / Dubai",
    flag: "https://flagcdn.com/w40/ae.png",
    costPerGraft: "₹115 – ₹460",
    avgCost: "₹3,45,000 – ₹13,80,000",
    language: "English",
    waitTime: "1–2 Weeks",
  },
  {
    country: "United Kingdom",
    flag: "https://flagcdn.com/w40/gb.png",
    costPerGraft: "₹250 – ₹800",
    avgCost: "₹7,50,000 – ₹24,00,000",
    language: "English",
    waitTime: "4–8 Weeks",
  },
  {
    country: "United States",
    flag: "https://flagcdn.com/w40/us.png",
    costPerGraft: "₹250 – ₹800",
    avgCost: "₹7,50,000 – ₹24,00,000",
    language: "English",
    waitTime: "4–8 Weeks",
  },
];

export default function CostCountryComparisonSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-mainDarkBg text-white overflow-hidden border-t border-white/10">
      <div className="qht-large-container">
        
        {/* Header */}
        <div className="max-w-4xl mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-white tracking-tight leading-tight mb-4">
            Global Cost Comparison: India vs Other Leading Countries
          </h2>
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal max-w-3xl">
            India has established itself as the world’s leading hub for medical hair restoration, providing international-grade surgical precision at up to 80% lower cost than the United States, United Kingdom, and the UAE. Patients worldwide choose {COMPANY_NAME} for doctor-led procedures, hospital-standard sterility, and permanent natural density.
          </p>
        </div>

        {/* Comparison Table Card - Full Width in Center */}
        <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-nexgen-primaryGold/25 bg-nexgen-veryDarkHeader/80 backdrop-blur-xs">
          
          {/* Table Header Row */}
          <div className="py-4 sm:py-5 px-6 sm:px-8 grid grid-cols-12 font-bold text-xs sm:text-sm text-white border-b border-white/15">
            <div className="col-span-3 sm:col-span-3">Country</div>
            <div className="col-span-2 sm:col-span-2">Cost Per Graft (Inr)</div>
            <div className="col-span-3 sm:col-span-3">Avg. 3000 Graft Procedure</div>
            <div className="col-span-2 sm:col-span-2">Language</div>
            <div className="col-span-2 sm:col-span-2 text-right sm:text-left">Wait Time</div>
          </div>

          {/* Table Body Rows */}
          <div className="divide-y divide-white/10 text-xs sm:text-sm">
            {COUNTRY_COMPARISON_DATA.map((row, idx) => (
              <div
                key={idx}
                className={`py-4 sm:py-5 px-6 sm:px-8 grid grid-cols-12 items-center transition-colors ${
                  row.isBestValue
                    ? "bg-nexgen-brightGold text-nexgen-veryDarkHeader font-bold"
                    : "text-white/90 hover:bg-white/5"
                }`}
              >
                {/* Country with Flag & Best Value Badge */}
                <div className="col-span-3 sm:col-span-3 flex items-center gap-2.5">
                  <img
                    src={row.flag}
                    alt={row.country}
                    className="w-5 h-3.5 object-cover rounded-xs shadow-2xs flex-shrink-0"
                  />
                  <span className="font-bold text-xs sm:text-sm whitespace-nowrap">
                    {row.country}
                  </span>
                  {row.isBestValue && (
                    <span className="hidden sm:inline-block bg-nexgen-veryDarkHeader text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-sm tracking-wider">
                      BEST VALUE
                    </span>
                  )}
                </div>

                {/* Cost Per Graft */}
                <div className="col-span-2 sm:col-span-2 font-medium">
                  {row.costPerGraft}
                </div>

                {/* Avg 3000 Graft Procedure */}
                <div className="col-span-3 sm:col-span-3 font-semibold">
                  {row.avgCost}
                </div>

                {/* Language */}
                <div className="col-span-2 sm:col-span-2 font-medium opacity-90">
                  {row.language}
                </div>

                {/* Wait Time */}
                <div className="col-span-2 sm:col-span-2 font-medium opacity-90 text-right sm:text-left">
                  {row.waitTime}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-xs text-white/80 font-normal mt-6 max-w-4xl">
          India offers significant cost savings versus the UK and USA, with equivalent or superior clinical quality. Exchange rates approximate as of 2025.
        </p>

      </div>
    </section>
  );
}
