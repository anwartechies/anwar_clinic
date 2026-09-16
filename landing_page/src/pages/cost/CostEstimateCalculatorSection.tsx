"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

interface CostEstimateCalculatorSectionProps {
  onOpenConsultation?: () => void;
}

const BALDNESS_LEVELS = [
  {
    id: "01",
    label: "01",
    grafts: "800 – 1,200",
    hairSvg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 object-contain">
        {/* Head Base */}
        <path d="M30 45 C30 25 70 25 70 45 C70 65 60 78 50 78 C40 78 30 65 30 45 Z" fill="#f8cbb0" />
        {/* Neck */}
        <path d="M42 75 L42 90 L58 90 L58 75 Z" fill="#e8b598" />
        {/* Ears */}
        <circle cx="28" cy="48" r="4" fill="#f8cbb0" />
        <circle cx="72" cy="48" r="4" fill="#f8cbb0" />
        {/* Full Hair Level 01 */}
        <path d="M28 42 C28 22 72 22 72 42 C72 38 68 34 50 36 C32 34 28 38 28 42 Z" fill="#2d3748" />
        <path d="M28 42 L28 50 L32 50 L32 40 Z" fill="#2d3748" />
        <path d="M72 42 L72 50 L68 50 L68 40 Z" fill="#2d3748" />
        {/* Eyes/Nose subtle hint */}
        <circle cx="43" cy="48" r="1.5" fill="#4a5568" />
        <circle cx="57" cy="48" r="1.5" fill="#4a5568" />
        <path d="M49 53 L50 56 L51 53" stroke="#d69e2e" strokeWidth="1" fill="none" />
      </svg>
    ),
  },
  {
    id: "02",
    label: "02",
    grafts: "1,200 – 1,800",
    hairSvg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 object-contain">
        <path d="M30 45 C30 25 70 25 70 45 C70 65 60 78 50 78 C40 78 30 65 30 45 Z" fill="#f8cbb0" />
        <path d="M42 75 L42 90 L58 90 L58 75 Z" fill="#e8b598" />
        <circle cx="28" cy="48" r="4" fill="#f8cbb0" />
        <circle cx="72" cy="48" r="4" fill="#f8cbb0" />
        {/* Hair Level 02 (M-Shaped Receding Temples) */}
        <path d="M28 42 C28 22 72 22 72 42 C70 34 62 30 50 36 C38 30 30 34 28 42 Z" fill="#2d3748" />
        <path d="M28 42 L28 50 L32 50 L32 40 Z" fill="#2d3748" />
        <path d="M72 42 L72 50 L68 50 L68 40 Z" fill="#2d3748" />
        <circle cx="43" cy="48" r="1.5" fill="#4a5568" />
        <circle cx="57" cy="48" r="1.5" fill="#4a5568" />
        <path d="M49 53 L50 56 L51 53" stroke="#d69e2e" strokeWidth="1" fill="none" />
      </svg>
    ),
  },
  {
    id: "03",
    label: "03",
    grafts: "1,800 – 2,500",
    hairSvg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 object-contain">
        <path d="M30 45 C30 25 70 25 70 45 C70 65 60 78 50 78 C40 78 30 65 30 45 Z" fill="#f8cbb0" />
        <path d="M42 75 L42 90 L58 90 L58 75 Z" fill="#e8b598" />
        <circle cx="28" cy="48" r="4" fill="#f8cbb0" />
        <circle cx="72" cy="48" r="4" fill="#f8cbb0" />
        {/* Hair Level 03 (Deeper Temples + Small Crown Thinning) */}
        <path d="M28 42 C28 22 72 22 72 42 C68 32 58 28 50 35 C42 28 32 32 28 42 Z" fill="#2d3748" />
        <circle cx="50" cy="27" r="4" fill="#f8cbb0" />
        <path d="M28 42 L28 50 L32 50 L32 40 Z" fill="#2d3748" />
        <path d="M72 42 L72 50 L68 50 L68 40 Z" fill="#2d3748" />
        <circle cx="43" cy="48" r="1.5" fill="#4a5568" />
        <circle cx="57" cy="48" r="1.5" fill="#4a5568" />
        <path d="M49 53 L50 56 L51 53" stroke="#d69e2e" strokeWidth="1" fill="none" />
      </svg>
    ),
  },
  {
    id: "04",
    label: "04",
    grafts: "2,500 – 3,200",
    hairSvg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 object-contain">
        <path d="M30 45 C30 25 70 25 70 45 C70 65 60 78 50 78 C40 78 30 65 30 45 Z" fill="#f8cbb0" />
        <path d="M42 75 L42 90 L58 90 L58 75 Z" fill="#e8b598" />
        <circle cx="28" cy="48" r="4" fill="#f8cbb0" />
        <circle cx="72" cy="48" r="4" fill="#f8cbb0" />
        {/* Hair Level 04 (Significant Crown Bald Spot + Forelock Island) */}
        <path d="M28 42 C28 25 72 25 72 42 C68 36 60 32 50 36 C40 32 32 36 28 42 Z" fill="#2d3748" />
        <circle cx="50" cy="28" r="6" fill="#f8cbb0" />
        <path d="M28 42 L28 50 L32 50 L32 40 Z" fill="#2d3748" />
        <path d="M72 42 L72 50 L68 50 L68 40 Z" fill="#2d3748" />
        <circle cx="43" cy="48" r="1.5" fill="#4a5568" />
        <circle cx="57" cy="48" r="1.5" fill="#4a5568" />
        <path d="M49 53 L50 56 L51 53" stroke="#d69e2e" strokeWidth="1" fill="none" />
      </svg>
    ),
  },
  {
    id: "05",
    label: "05",
    grafts: "3,200 – 4,000",
    hairSvg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 object-contain">
        <path d="M30 45 C30 25 70 25 70 45 C70 65 60 78 50 78 C40 78 30 65 30 45 Z" fill="#f8cbb0" />
        <path d="M42 75 L42 90 L58 90 L58 75 Z" fill="#e8b598" />
        <circle cx="28" cy="48" r="4" fill="#f8cbb0" />
        <circle cx="72" cy="48" r="4" fill="#f8cbb0" />
        {/* Hair Level 05 (Thin Sparse Bridge) */}
        <path d="M28 44 C28 32 72 32 72 44 L72 50 L68 50 L68 40 C64 35 36 35 32 40 L32 50 L28 50 Z" fill="#2d3748" />
        <circle cx="50" cy="30" r="9" fill="#f8cbb0" />
        <circle cx="43" cy="48" r="1.5" fill="#4a5568" />
        <circle cx="57" cy="48" r="1.5" fill="#4a5568" />
        <path d="M49 53 L50 56 L51 53" stroke="#d69e2e" strokeWidth="1" fill="none" />
      </svg>
    ),
  },
  {
    id: "06",
    label: "06",
    grafts: "4,000 – 5,000+",
    hairSvg: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 object-contain">
        <path d="M30 45 C30 25 70 25 70 45 C70 65 60 78 50 78 C40 78 30 65 30 45 Z" fill="#f8cbb0" />
        <path d="M42 75 L42 90 L58 90 L58 75 Z" fill="#e8b598" />
        <circle cx="28" cy="48" r="4" fill="#f8cbb0" />
        <circle cx="72" cy="48" r="4" fill="#f8cbb0" />
        {/* Hair Level 06 (Complete Vertex Baldness, Lateral Band Only) */}
        <path d="M28 45 L28 52 L32 52 L32 43 C32 40 34 38 36 36 L34 34 C30 38 28 41 28 45 Z" fill="#2d3748" />
        <path d="M72 45 L72 52 L68 52 L68 43 C68 40 66 38 64 36 L66 34 C70 38 72 41 72 45 Z" fill="#2d3748" />
        <circle cx="43" cy="48" r="1.5" fill="#4a5568" />
        <circle cx="57" cy="48" r="1.5" fill="#4a5568" />
        <path d="M49 53 L50 56 L51 53" stroke="#d69e2e" strokeWidth="1" fill="none" />
      </svg>
    ),
  },
];

export default function CostEstimateCalculatorSection({
  onOpenConsultation,
}: CostEstimateCalculatorSectionProps) {
  const [age, setAge] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hereditary, setHereditary] = useState("mother");
  const [selectedBaldness, setSelectedBaldness] = useState("03");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (onOpenConsultation) {
      onOpenConsultation();
    }
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">
        
        {/* Heading */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-semibold text-nexgen-primaryGold block mb-2 tracking-wide">
            Interactive Cost Estimator
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.12] mb-3">
            Calculate Your Estimated <br />
            Hair Restoration Cost
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal max-w-2xl">
            Select your closest pattern of thinning and submit your details to receive an instant, clinically accurate graft estimation and customized procedural quote from our senior trichology team.
          </p>
        </div>

        {/* 2-Column Form Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Personal Inputs & Questions */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Age Input */}
            <div>
              <label className="text-sm font-bold text-nexgen-veryDarkHeader block mb-2">
                Type Your Age?
              </label>
              <input
                type="number"
                placeholder="Eg. 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full border-b border-gray-300 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-nexgen-primaryGold bg-transparent transition-colors"
              />
            </div>

            {/* Personal Details */}
            <div className="space-y-6 pt-2">
              <label className="text-sm font-bold text-nexgen-veryDarkHeader block">
                Enter Your Personal Details
              </label>

              {/* Full Name */}
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full border-b border-gray-300 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-nexgen-primaryGold bg-transparent transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-b border-gray-300 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-nexgen-primaryGold bg-transparent transition-colors"
                />
              </div>

              {/* Phone Input with +91 IN */}
              <div className="flex items-center gap-3 border-b border-gray-300 py-2.5">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 select-none flex-shrink-0">
                  <span>+91 IN</span>
                  <span className="text-[10px] text-gray-400">▾</span>
                </div>
                <div className="w-px h-4 bg-gray-300" />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Hereditary Radio Options */}
            <div className="pt-2">
              <label className="text-sm font-bold text-nexgen-veryDarkHeader block mb-3">
                Is It Hereditary?
              </label>
              
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-[13px] text-gray-700">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="hereditary"
                    value="mother"
                    checked={hereditary === "mother"}
                    onChange={(e) => setHereditary(e.target.value)}
                    className="w-4 h-4 text-nexgen-primaryGold focus:ring-nexgen-primaryGold"
                  />
                  <span>Yes, From Mother's Side</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="hereditary"
                    value="father"
                    checked={hereditary === "father"}
                    onChange={(e) => setHereditary(e.target.value)}
                    className="w-4 h-4 text-nexgen-primaryGold focus:ring-nexgen-primaryGold"
                  />
                  <span>Yes, From Father's Side</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="hereditary"
                    value="no"
                    checked={hereditary === "no"}
                    onChange={(e) => setHereditary(e.target.value)}
                    className="w-4 h-4 text-nexgen-primaryGold focus:ring-nexgen-primaryGold"
                  />
                  <span>No, it isn't</span>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Baldness Level Selection & Submit CTA */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-8">
            <div>
              <label className="text-sm font-bold text-nexgen-veryDarkHeader block mb-4">
                Select Your Baldness Level
              </label>

              {/* 6 Baldness Cards Grid (3 columns x 2 rows) */}
              <div className="grid grid-cols-3 gap-3.5 sm:gap-4">
                {BALDNESS_LEVELS.map((level) => {
                  const isSelected = selectedBaldness === level.id;
                  return (
                    <button
                      type="button"
                      key={level.id}
                      onClick={() => setSelectedBaldness(level.id)}
                      className={`relative rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-nexgen-primaryGold bg-nexgen-pageLightBg shadow-md ring-2 ring-nexgen-primaryGold/20"
                          : "border-gray-200/90 bg-white hover:border-gray-300 hover:shadow-xs"
                      }`}
                    >
                      {/* Top Right Radio Circle */}
                      <div className="absolute top-2.5 right-2.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-nexgen-primaryGold bg-nexgen-primaryGold"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      {/* Head Vector Graphic */}
                      <div className="my-1 flex items-center justify-center">
                        {level.hairSvg}
                      </div>

                      {/* Number Label */}
                      <span className="text-xs sm:text-sm font-bold text-gray-800 mt-2">
                        {level.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-nexgen-brightGold hover:brightness-105 text-nexgen-veryDarkHeader font-bold text-sm sm:text-base py-3.5 px-10 rounded-full shadow-lg transition-all active:scale-95 duration-150 cursor-pointer"
              >
                Calculate My Estimate
              </button>
            </div>

          </div>

        </form>

      </div>
    </section>
  );
}
