"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

interface ServiceTypeItem {
  title: string;
  desc: string;
  image: string;
  points: string[];
}

interface ServiceTypesSectionProps {
  title?: string;
  subtitle?: string;
  types?: ServiceTypeItem[];
}

const DEFAULT_TYPES: ServiceTypeItem[] = [
  {
    title: "Motorized FUE Hair Transplant",
    desc: "Follicles are individually harvested with precision micro-punches, offering minimal tissue trauma and rapid healing.",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80",
    points: [
      "Precise control over depth, angle, and natural direction of every follicle.",
      "Minimally invasive individual harvesting with zero linear donor scarring.",
      "Accelerated recovery with minimal post-procedural downtime.",
    ],
  },
  {
    title: `${COMPANY_NAME} Advanced Technique`,
    desc: "Direct micro-implantation protocol minimizing out-of-body holding time for maximum follicle viability and high density.",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80",
    points: [
      "Immediate implantation protecting delicate follicular dermal papilla.",
      "Ultra-fine implanter pens ensuring soft, natural hairline transitions.",
      "High graft survival rate (>95%) across all Norwood balding stages.",
      "Customized procedural planning based on your unique scalp elasticity.",
    ],
  },
];

export default function ServiceTypesSection({
  title = "Hair Transplant Repair",
  subtitle = "To choose the best Corrective Hair Transplant technique, it’s important to know the methods available for it. These are:",
  types = DEFAULT_TYPES,
}: ServiceTypesSectionProps) {
  const safeTypes = (types && types.length > 0 ? types : DEFAULT_TYPES).map((type, idx) => ({
    ...type,
    image: (!type.image || type.image.includes("nexgenhairtransplant.com"))
      ? DEFAULT_TYPES[idx % DEFAULT_TYPES.length].image
      : type.image,
  }));

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-pageLightBg overflow-hidden">
      <div className="qht-large-container">

        {/* Centered Heading & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.18]">
            {title.toLowerCase().startsWith("types of") ||
              title.toLowerCase().startsWith("type of") ||
              title.toLowerCase().startsWith("types")
              ? title
              : `Types of ${title}`}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3.5 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* 2-Column Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {safeTypes.map((type, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between h-full bg-transparent"
            >
              <div>
                {/* Type Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-nexgen-veryDarkHeader tracking-tight">
                  {type.title}
                </h3>

                {/* Type Description */}
                <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed font-normal min-h-[40px]">
                  {type.desc}
                </p>

                {/* Visual Diagram Image */}
                <div className="my-5 rounded-3xl overflow-hidden bg-white p-3 sm:p-4 shadow-sm border border-gray-200/80 aspect-[16/11] flex items-center justify-center">
                  <img
                    src={type.image}
                    alt={type.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Bullet Points List */}
              <ul className="space-y-2.5 pl-5 list-disc text-xs sm:text-sm text-gray-600 leading-relaxed font-normal marker:text-nexgen-primaryGold">
                {type.points.map((point, pIdx) => (
                  <li key={pIdx}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
