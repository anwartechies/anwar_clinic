"use client";

import React from "react";
import {
  Check,
  ShieldCheck,
  Clock,
  HeartHandshake,
  UserCheck,
  Sparkles,
  Phone,
  MapPin,
  Award,
  Gem,
  FlaskConical,
  PenTool,
  CheckCircle2,
  Stethoscope,
  Microscope,
} from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface CostTechniquesSectionProps {
  onOpenConsultation?: () => void;
}

const PACKAGES = [
  {
    id: "fue",
    name: "FUE",
    grafts: "5000 - 6000 GRAFT REQUIRED",
    price: 10,
    headerBg: "bg-nexgen-mainDarkBg",
    headerText: "text-white",
    cardBorder: "border-nexgen-mainDarkBg/20",
    badge: null,
    highlightFeatures: [],
    inclusions: [
      "4 PRP FREE",
      "5 DAYS MED FREE",
      "BANDAGE REMOVAL FREE",
      "HEADWASH FREE",
      "BLOOD TEST FREE",
      "POST TRANSPLANT DOCTOR CONSULTATION FREE",
    ],
    checkColor: "bg-nexgen-mainDarkBg text-white",
    ctaBg: "bg-nexgen-mainDarkBg hover:brightness-110 text-white",
    needleType: "Micro-Punch Extraction",
  },
  {
    id: "bio-fue",
    name: "BIO FUE",
    grafts: "5000 - 6000 GRAFT REQUIRED",
    price: 15,
    headerBg: "bg-nexgen-servicesSection",
    headerText: "text-white",
    cardBorder: "border-nexgen-servicesSection/30 ring-2 ring-nexgen-servicesSection/20",
    badge: "INCLUDES DMEM MEDIUM",
    highlightFeatures: ["DMEM Enriched Medium", "Enhanced Follicle Vitality"],
    inclusions: [
      "5 GFC FREE",
      "5 DAYS MED FREE",
      "BANDAGE REMOVAL FREE",
      "HEADWASH FREE",
      "BLOOD TEST FREE",
      "POST TRANSPLANT DOCTOR CONSULTATION FREE",
    ],
    checkColor: "bg-nexgen-servicesSection text-white",
    ctaBg: "bg-nexgen-servicesSection hover:brightness-110 text-white",
    needleType: "Bio-Active Enriched Needle",
  },
  {
    id: "dhi",
    name: "DHI",
    grafts: "5000 - 6000 GRAFT REQUIRED",
    price: 20,
    headerBg: "bg-nexgen-veryDarkHeader",
    headerText: "text-white",
    cardBorder: "border-nexgen-veryDarkHeader/20",
    badge: null,
    highlightFeatures: ["Direct Hair Implantation", "No Channel Slit Trauma"],
    inclusions: [
      "3 GFC FREE",
      "5 DAYS MED FREE",
      "BANDAGE REMOVAL FREE",
      "HEADWASH FREE",
      "BLOOD TEST FREE",
      "POST TRANSPLANT DOCTOR CONSULTATION FREE",
    ],
    checkColor: "bg-nexgen-veryDarkHeader text-white",
    ctaBg: "bg-nexgen-veryDarkHeader hover:brightness-110 text-white",
    needleType: "Direct Micro Implanter Pen",
  },
  {
    id: "premium-dhi",
    name: "PREMIUM DHI",
    grafts: "5000 - 6000 GRAFT REQUIRED",
    price: 25,
    headerBg: "bg-nexgen-veryDarkHeader border-b border-nexgen-primaryGold/30",
    headerText: "text-nexgen-brightGold",
    cardBorder: "border-nexgen-brightGold/50 ring-2 ring-nexgen-brightGold/30 shadow-2xl",
    badge: "BEST CLINICAL GRADE",
    isFeatured: true,
    highlightFeatures: ["SAPPHIRE BLADE", "DHI PEN", "DMEM MEDIUM"],
    inclusions: [
      "6 GFC FREE",
      "5 DAYS MED FREE",
      "BANDAGE REMOVAL FREE",
      "HEADWASH FREE",
      "BLOOD TEST FREE",
      "POST TRANSPLANT DOCTOR CONSULTATION FREE",
    ],
    checkColor: "bg-nexgen-brightGold text-nexgen-veryDarkHeader",
    ctaBg: "bg-nexgen-brightGold hover:brightness-105 text-nexgen-veryDarkHeader font-bold",
    needleType: "Sapphire Blade + Direct Pen",
  },
];

export default function CostTechniquesSection({
  onOpenConsultation,
}: CostTechniquesSectionProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-pageLightBg overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1. Header with Badges */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-nexgen-primaryGold/10 text-nexgen-primaryGold px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>Natural Hair • Next Gen You</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight">
            Precision Hair Restoration Packages & Per-Graft Rates
          </h2>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore transparent surgical protocols engineered for optimal density and graft survival at {COMPANY_NAME}. Every treatment package is fully all-inclusive — featuring pre-op blood diagnostics, sterile procedural suites, post-op recovery kits, and complimentary regenerative GFC/PRP sessions.
          </p>

          {/* Top Trust Icons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-white rounded-xl shadow-xs border border-gray-100 text-xs font-semibold text-nexgen-veryDarkHeader">
              <Stethoscope className="w-4 h-4 text-nexgen-primaryGold" />
              <span>Expert Doctors</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-white rounded-xl shadow-xs border border-gray-100 text-xs font-semibold text-nexgen-veryDarkHeader">
              <Microscope className="w-4 h-4 text-nexgen-primaryGold" />
              <span>Advanced Technology</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-white rounded-xl shadow-xs border border-gray-100 text-xs font-semibold text-nexgen-veryDarkHeader">
              <ShieldCheck className="w-4 h-4 text-nexgen-primaryGold" />
              <span>Safe & Painless</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-white rounded-xl shadow-xs border border-gray-100 text-xs font-semibold text-nexgen-veryDarkHeader">
              <Sparkles className="w-4 h-4 text-nexgen-primaryGold" />
              <span>Natural Looking</span>
            </div>
          </div>
        </div>

        {/* 2. The 4 Technique Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-16">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-3xl overflow-hidden bg-white shadow-md border ${pkg.cardBorder} flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 relative`}
            >
              {/* Card Header */}
              <div className={`${pkg.headerBg} ${pkg.headerText} p-5 text-center relative`}>
                <h3 className="text-2xl font-extrabold tracking-wide uppercase">
                  {pkg.name}
                </h3>
                <p className="text-[11px] font-semibold opacity-90 tracking-wider mt-1">
                  {pkg.grafts}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                {/* Special Highlight Pills */}
                <div>




                  {/* Price Tag */}
                  <div className="text-center py-4 border-b border-gray-100 bg-nexgen-pageLightBg rounded-2xl">
                    <div className="flex items-baseline justify-center text-nexgen-veryDarkHeader">
                      <span className="text-2xl font-extrabold mr-1">₹</span>
                      <span className="text-5xl font-extrabold tracking-tight">{pkg.price}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mt-1">
                      Per Graft
                    </span>
                  </div>
                </div>

                {pkg.id === "bio-fue" && (
                  <div className="mb-3 py-1 px-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs">
                    <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                    <span>INCLUDES DMEM MEDIUM</span>
                  </div>
                )}

                {pkg.id === "premium-dhi" && (
                  <div className="space-y-1.5 mb-3">
                    <div className="py-1 px-2 rounded-md bg-nexgen-veryDarkHeader text-nexgen-brightGold border border-nexgen-primaryGold/30 text-[11px] font-bold flex items-center gap-1.5">
                      <Gem className="w-3.5 h-3.5" />
                      <span>SAPPHIRE BLADE</span>
                    </div>
                    <div className="py-1 px-2 rounded-md bg-nexgen-veryDarkHeader text-nexgen-brightGold border border-nexgen-primaryGold/30 text-[11px] font-bold flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5" />
                      <span>DHI PEN</span>
                    </div>
                    <div className="py-1 px-2 rounded-md bg-nexgen-veryDarkHeader text-nexgen-brightGold border border-nexgen-primaryGold/30 text-[11px] font-bold flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>DMEM MEDIUM</span>
                    </div>
                  </div>
                )}

                {/* Free Inclusions Checklist */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Complimentary Inclusions
                  </span>
                  <ul className="space-y-2.5 text-xs text-gray-800 font-semibold">
                    {pkg.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full ${pkg.checkColor} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <button
                    onClick={onOpenConsultation}
                    className={`w-full py-3 px-4 rounded-full text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 duration-150 cursor-pointer ${pkg.ctaBg}`}
                  >
                    Select {pkg.name} Package
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. "Why Choose NexGen Hair Transplant?" Banner */}
        <div className="bg-nexgen-mainDarkBg text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-nexgen-primaryGold/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left 5 Pillars */}
            <div className="lg:col-span-8 space-y-6">
              <div className="text-center sm:text-left">
                <span className="text-xs uppercase font-bold text-nexgen-brightGold tracking-widest block mb-1">
                  Excellence Guaranteed
                </span>
                <h3 className="text-2xl sm:text-3xl font-[500] text-white tracking-tight">
                  Why Choose NexGen Hair Transplant?
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <Sparkles className="w-7 h-7 text-nexgen-brightGold mb-2" />
                  <span className="text-xs font-bold leading-tight">NATURAL HAIRLINE</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <Clock className="w-7 h-7 text-nexgen-brightGold mb-2" />
                  <span className="text-xs font-bold leading-tight">MINIMAL DOWNTIME</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <ShieldCheck className="w-7 h-7 text-nexgen-brightGold mb-2" />
                  <span className="text-xs font-bold leading-tight">SAFE & PROVEN METHODS</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <UserCheck className="w-7 h-7 text-nexgen-brightGold mb-2" />
                  <span className="text-xs font-bold leading-tight">PERSONALIZED CARE</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors col-span-2 sm:col-span-1">
                  <HeartHandshake className="w-7 h-7 text-nexgen-brightGold mb-2" />
                  <span className="text-xs font-bold leading-tight">COMPLETE SUPPORT</span>
                </div>
              </div>
            </div>

            {/* Right Callout Box */}
            <div className="lg:col-span-4 bg-nexgen-veryDarkHeader rounded-2xl p-6 sm:p-7 border border-nexgen-primaryGold/30 text-center flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
                  YOUR HAIR. OUR EXPERTISE.
                </h4>
                <p className="text-sm text-nexgen-brightGold italic font-serif">
                  Perfect Combination for a Better You.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 text-xs text-gray-300 space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-nexgen-brightGold flex-shrink-0" />
                  <span className="font-semibold text-white">8797363636 / 9296993636</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-nexgen-brightGold flex-shrink-0 mt-0.5" />
                  <span>Pillar No-56, Raja Bazar, Patna</span>
                </div>
              </div>

              <button
                onClick={onOpenConsultation}
                className="w-full py-2.5 px-4 rounded-full bg-nexgen-brightGold hover:brightness-105 text-nexgen-veryDarkHeader font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 duration-150"
              >
                Book Your Consultation Today
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

