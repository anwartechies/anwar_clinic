"use client";

import React, { useState } from "react";
import { Download, CheckCircle } from "lucide-react";
import { COUNTRY_CODES } from "@/data/qhtData";
import { COMPANY_NAME } from "@/config/constants";

interface EbookCatalogueFormProps {
  onOpenConsultation?: () => void;
}

export default function EbookCatalogueForm({
  onOpenConsultation,
}: EbookCatalogueFormProps) {
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.length < 7) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setDownloadSuccess(true);
    }, 700);
  };

  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-nexgen-mainDarkBg text-white overflow-hidden relative">
      <div className="qht-large-container">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: 3D Dual Book Mockups */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[480px] flex items-center justify-center">
              {/* Dual Book Graphic Mockup */}
              <div className="relative flex items-center justify-center">
                {/* Book 1 (Left tilted) */}
                <div className="w-[180px] sm:w-[220px] md:w-[240px] rounded-2xl overflow-hidden shadow-2xl transform -rotate-12 hover:-rotate-6 transition-transform duration-500 z-10 border border-white/20 bg-white">
                  <div className="p-4 sm:p-5 bg-white text-nexgen-veryDarkHeader flex flex-col justify-between aspect-[3/4]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-[10px]">
                        {COMPANY_NAME}
                      </div>
                    </div>
                    <div className="my-auto py-2">
                      <h4 className="text-base sm:text-lg font-extrabold leading-tight text-nexgen-veryDarkHeader">
                        Hair Transplant <br />
                        <span className="text-nexgen-primaryGold">Techniques</span>
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 leading-snug">
                        The Consumer’s guide to hair transplant surgery
                      </p>
                    </div>
                    {/* Illustration preview */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1 opacity-80">
                      <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300"></div>
                      <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300"></div>
                      <div className="w-6 h-6 rounded-full bg-nexgen-mainDarkBg text-white text-[8px] flex items-center justify-center font-bold">{COMPANY_NAME}</div>
                    </div>
                  </div>
                </div>

                {/* Book 2 (Right upright) */}
                <div className="w-[180px] sm:w-[220px] md:w-[240px] rounded-2xl overflow-hidden shadow-2xl transform rotate-6 hover:rotate-3 transition-transform duration-500 -ml-12 sm:-ml-16 z-20 border border-white/20 bg-white">
                  <div className="p-4 sm:p-5 bg-white text-nexgen-veryDarkHeader flex flex-col justify-between aspect-[3/4]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center font-bold text-[10px]">
                        {COMPANY_NAME}
                      </div>
                    </div>
                    <div className="my-auto py-2">
                      <h4 className="text-base sm:text-lg font-extrabold leading-tight text-nexgen-veryDarkHeader">
                        Hair Transplant <br />
                        <span className="text-nexgen-primaryGold">Techniques</span>
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1 leading-snug">
                        Everything you wanted to know about hair transplant
                      </p>
                    </div>
                    {/* Illustration preview */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1 opacity-80">
                      <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300"></div>
                      <div className="w-6 h-6 rounded-full bg-nexgen-mainDarkBg text-white text-[8px] flex items-center justify-center font-bold">{COMPANY_NAME}</div>
                      <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Heading, Subtitle, Bullet Points & Clean Underlined Form */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-[500] text-white tracking-tight leading-[1.16]">
                Considering Hair Restoration? <br />
                Download the Essential Guide.
              </h2>

              <p className="mt-4 text-xs sm:text-[14.5px] text-white/90 leading-relaxed font-normal max-w-xl">
                A doctor-curated roadmap covering realistic graft calculations, healing timelines, pain management, and transparent pricing.
              </p>
            </div>

            {/* 3 Bullet Points */}
            <ul className="space-y-3 pt-2 text-xs sm:text-[14px] text-white font-normal">
              <li className="flex items-start gap-2.5">
                <span className="text-white text-base leading-none">•</span>
                <span>Understand realistic graft requirements for your Norwood stage</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-white text-base leading-none">•</span>
                <span>Step-by-step day-by-day healing and aftercare protocol</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-white text-base leading-none">•</span>
                <span>Critical quality standards to verify before choosing any clinic</span>
              </li>
            </ul>

            {/* Interactive Inline Underlined Form */}
            <div className="pt-6">
              {downloadSuccess ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-nexgen-brightGold mx-auto" />
                  <h4 className="text-base font-bold text-white">
                    Guide Ready For Download!
                  </h4>
                  <p className="text-xs text-white/90">
                    Thank you, <strong>{name}</strong>! Your comprehensive guide has been prepared.
                  </p>
                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading ${COMPANY_NAME}-Hair-Transplant-Guide.pdf`);
                    }}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-nexgen-brightGold hover:bg-nexgen-primaryGold text-nexgen-veryDarkHeader rounded-full text-xs font-bold transition-colors shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download PDF Now
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-6 sm:gap-8">
                  {/* Full Name Underlined Field */}
                  <div className="sm:w-[220px]">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent border-b border-white/70 focus:border-white pb-2.5 text-white placeholder-white/80 text-xs sm:text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Mobile Number Underlined Field with Country Prefix */}
                  <div className="flex-1 flex items-center gap-2 border-b border-white/70 focus-within:border-white pb-2.5 transition-colors">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-transparent text-white text-xs sm:text-sm focus:outline-none cursor-pointer pr-1"
                    >
                      {COUNTRY_CODES.map((c, idx) => (
                        <option key={idx} value={c.code} className="text-gray-900">
                          {c.code} {c.country}
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="Mobile Number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full bg-transparent text-white placeholder-white/80 text-xs sm:text-sm focus:outline-none"
                    />
                  </div>

                  {/* Download Now Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto bg-nexgen-brightGold hover:bg-nexgen-primaryGold text-nexgen-veryDarkHeader font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-lg transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      {isSubmitting ? "Processing..." : "Download Now"}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>

        {/* Floating Bottom Center Consultation Button */}
        {/* <div className="mt-14 sm:mt-16 flex justify-center">
          <button
            type="button"
            onClick={onOpenConsultation}
            className="bg-[#42523f] hover:bg-[#354332] text-white text-xs sm:text-sm font-semibold px-8 py-3 rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Book an Appointment
          </button>
        </div> */}

      </div>
    </section>
  );
}
