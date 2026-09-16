"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, CheckCircle2 } from "lucide-react";
import { ALL_SERVICES_LIST, ServiceCardItem } from "@/data/allServicesData";
import type { ServiceCard } from "@/lib/services";
import { COMPANY_NAME } from "@/config/constants";

interface ServicesListingProps {
  services?: ServiceCard[] | null;
  onOpenConsultation?: () => void;
}

const CATEGORIES = [
  "All Procedures",
  "Most Requested",
  "Hairline & Crown",
  "Facial Hair Restoration",
  "Corrective & Specialized",
];

export default function ServicesListing({ services, onOpenConsultation }: ServicesListingProps) {
  const [activeFilter, setActiveFilter] = useState("All Procedures");

  // API content when available, otherwise fallback bundled list.
  const allServices: ServiceCardItem[] =
    services !== undefined && services !== null
      ? services.map((s) => ({
        id: s.slug,
        title: s.title,
        desc: s.cardDescription,
        image: s.cardImage || "",
        link: `/services/${s.slug}/`,
        badge: s.badge || undefined,
      }))
      : ALL_SERVICES_LIST;

  const filteredServices = allServices.filter((item) => {
    if (activeFilter === "All Procedures") return true;
    if (activeFilter === "Most Requested")
      return ["best-fue-hair-transplant-in-india", "quick-hair-transplant-in-india", "hair-transplant-for-men"].includes(item.id);
    if (activeFilter === "Hairline & Crown")
      return ["hairline-reconstruction", "custom-hairline-transplant", "natural-look-hair-restoration", "ultra-dense-hair-transplant", "temple-hair-transplant", "crown-hair-transplant"].includes(item.id);
    if (activeFilter === "Facial Hair Restoration")
      return ["beard-hair-transplant-in-india", "moustache-hair-transplant-in-india", "eyebrow-reconstruction-in-india"].includes(item.id);
    if (activeFilter === "Corrective & Specialized")
      return ["bad-hair-transplant-correction", "failed-hair-transplant-repair", "burn-hair-transplant", "afro-hair-transplant-in-india", "caucasian-patients-hair-transplant", "unshaven-hair-transplant", "female-hair-transplantation"].includes(item.id);
    return true;
  });

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-pageLightBg">
      <div className="qht-large-container">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-nexgen-brightGold/15 text-nexgen-veryDarkHeader border border-nexgen-primaryGold/30 text-xs font-bold px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-nexgen-primaryGold" /> Comprehensive Procedures
            </span>
            <h2 className="text-3xl sm:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight">
              Clinical Hair Restoration Procedures
            </h2>
          </div>
          <p className="max-w-xl text-sm sm:text-lg text-gray-600 leading-relaxed font-normal">
            At {COMPANY_NAME}, our specialized surgical and non-surgical procedures are engineered to deliver natural density, balanced facial framing, and permanent follicle growth.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shadow-sm cursor-pointer ${activeFilter === cat
                ? "bg-nexgen-mainDarkBg text-white border border-nexgen-primaryGold/30"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.badge && (
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-nexgen-veryDarkHeader text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-[500] text-nexgen-veryDarkHeader group-hover:text-nexgen-primaryGold transition-colors leading-snug mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={item.link}
                    className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader hover:text-nexgen-primaryGold flex items-center gap-1 group/link transition-colors"
                  >
                    <span>View Procedure</span>
                    <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </Link>

                  <button
                    onClick={onOpenConsultation}
                    className="w-8 h-8 rounded-full bg-nexgen-navBg group-hover:bg-nexgen-primaryGold group-hover:text-nexgen-veryDarkHeader text-gray-700 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                    aria-label="Book consultation"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
