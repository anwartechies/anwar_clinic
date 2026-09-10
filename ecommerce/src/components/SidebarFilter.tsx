"use client";

import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";

interface SidebarFilterProps {
  selectedCategories: string[];
  onToggleCategory: (cat: string) => void;
  selectedConcerns: string[];
  onToggleConcern: (concern: string) => void;
  categoryCounts: Record<string, number>;
  concernCounts: Record<string, number>;
}

export default function SidebarFilter({
  selectedCategories,
  onToggleCategory,
  selectedConcerns,
  onToggleConcern,
  categoryCounts,
  concernCounts,
}: SidebarFilterProps) {
  const [isTypeOpen, setIsTypeOpen] = useState(true);
  const [isConcernOpen, setIsConcernOpen] = useState(true);

  const categories = [
    { label: "Devices", count: categoryCounts["Devices"] || 0 },
    { label: "Kits & Combos", count: categoryCounts["Kits & Combos"] || 0 },
    { label: "Shampoos", count: categoryCounts["Shampoos"] || 0 },
    { label: "Tablets & Supplements", count: categoryCounts["Tablets & Supplements"] || 0 },
    { label: "Topical Solutions", count: categoryCounts["Topical Solutions"] || 0 },
  ];

  const concerns = [
    { label: "Hair Fall", count: concernCounts["Hair Fall"] || 0 },
    { label: "Post-Transplant Care", count: concernCounts["Post-Transplant Care"] || 0 },
    { label: "Dandruff", count: concernCounts["Dandruff"] || 0 },
    { label: "Regrowth", count: concernCounts["Regrowth"] || 0 },
    { label: "Daily Maintenance", count: concernCounts["Daily Maintenance"] || 0 },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Main Filter Card */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100/90">
        <h3 className="text-sm font-bold text-[#1b221d] mb-4">
          Filter:
        </h3>

        {/* Accordion Group 1: Product Type */}
        <div className="border-b border-gray-100 pb-5">
          <button
            type="button"
            onClick={() => setIsTypeOpen(!isTypeOpen)}
            className="w-full flex items-center justify-between text-left py-1 text-sm font-bold text-[#1b221d] hover:text-[#52664d] transition-colors"
          >
            <span>Product Type</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isTypeOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isTypeOpen && (
            <div className="mt-3 space-y-2.5">
              {categories.map((cat) => {
                const isChecked = selectedCategories.includes(cat.label);
                return (
                  <label
                    key={cat.label}
                    className="flex items-center gap-2.5 text-xs sm:text-[13px] text-[#4a554c] cursor-pointer hover:text-black select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleCategory(cat.label)}
                      className="w-4 h-4 rounded border-gray-300 text-[#52664d] focus:ring-[#52664d] rounded-xs cursor-pointer accent-[#52664d]"
                    />
                    <span>
                      {cat.label} ({cat.count})
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Accordion Group 2: Concern */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setIsConcernOpen(!isConcernOpen)}
            className="w-full flex items-center justify-between text-left py-1 text-sm font-bold text-[#1b221d] hover:text-[#52664d] transition-colors"
          >
            <span>Concern</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isConcernOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isConcernOpen && (
            <div className="mt-3 space-y-2.5">
              {concerns.map((con) => {
                const isChecked = selectedConcerns.includes(con.label);
                return (
                  <label
                    key={con.label}
                    className="flex items-center gap-2.5 text-xs sm:text-[13px] text-[#4a554c] cursor-pointer hover:text-black select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleConcern(con.label)}
                      className="w-4 h-4 rounded border-gray-300 text-[#52664d] focus:ring-[#52664d] rounded-xs cursor-pointer accent-[#52664d]"
                    />
                    <span>
                      {con.label} ({con.count})
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Hair Test Promo Card */}
      <div className="bg-[#e4f3d2] rounded-3xl p-6 border border-[#cbeaa0] relative overflow-hidden shadow-xs">
        
        {/* Subtle avatar illustration placeholder */}
        <div className="w-20 h-20 rounded-full bg-white/60 mx-auto mb-3 flex items-center justify-center border border-white/80 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-[#52664d]/10 flex items-center justify-center text-xl font-bold text-[#52664d]">
            👨‍⚕️
          </div>
        </div>

        <div className="text-center mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#52664d] block">
            Personalised & Expert-Backed
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#162418] mt-1 leading-snug">
            Take 2 minutes hair test.
          </h4>
        </div>

        <a
          href="#hair-test"
          className="w-full bg-[#b1fc85] hover:bg-[#a1f472] text-black font-bold text-xs py-3 px-4 rounded-2xl border border-black/80 flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 text-center"
        >
          <span>Start Assessment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
}
