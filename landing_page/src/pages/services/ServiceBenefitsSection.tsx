"use client";

import React from "react";
import { CheckCircle2, Sparkles, ShieldCheck, Clock, Star } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface BenefitItem {
  id?: number;
  icon?: string | React.ReactNode;
  title: string;
  desc: string;
}

interface ServiceBenefitsSectionProps {
  title?: string;
  subtitle?: string;
  benefits?: BenefitItem[];
  onOpenConsultation?: () => void;
}

const DEFAULT_BENEFITS: BenefitItem[] = [
  {
    id: 1,
    icon: <CheckCircle2 className="w-8 h-8 text-nexgen-brightGold" />,
    title: "Hairline Restoration",
    desc: "The unnatural hairlines are corrected, and a natural look is implemented.",
  },
  {
    id: 2,
    icon: <Sparkles className="w-8 h-8 text-nexgen-brightGold" />,
    title: "Permanent Results",
    desc: `The Corrective Hair Transplant procedures at ${COMPANY_NAME} Clinic ensure natural and long-lasting results.`,
  },
  {
    id: 3,
    icon: <ShieldCheck className="w-8 h-8 text-nexgen-brightGold" />,
    title: "Using Advanced techniques",
    desc: `The repair methods used by experts at ${COMPANY_NAME} Clinic are safe and leave negligible scars.`,
  },
  {
    id: 4,
    icon: <Clock className="w-8 h-8 text-nexgen-brightGold" />,
    title: "Quick Healing Process",
    desc: "New methods of Hair Transplant Repair are less invasive with less recovery time.",
  },
  {
    id: 5,
    icon: <Star className="w-8 h-8 text-nexgen-brightGold" />,
    title: "Customised Repair",
    desc: `${COMPANY_NAME} Clinic makes sure that the repair plan is tailored to the needs and satisfaction of the patient.`,
  },
];

export default function ServiceBenefitsSection({
  title = "Hair Transplant Repair",
  subtitle,
  benefits = DEFAULT_BENEFITS,
  onOpenConsultation,
}: ServiceBenefitsSectionProps) {
  const defaultSubtitle = `The ${title} fixes transplant mistakes and gives a natural look.\nWe at ${COMPANY_NAME} Clinic benefits patients in the following ways:`;

  const safeBenefits = (benefits && benefits.length > 0 ? benefits : DEFAULT_BENEFITS).map((b, idx) => {
    const isQht = typeof b.icon === "string" && b.icon.includes("qhtclinic.com");
    return {
      ...b,
      icon: isQht ? DEFAULT_BENEFITS[idx % DEFAULT_BENEFITS.length].icon : b.icon,
    };
  });

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-mainDarkBg text-white overflow-hidden">
      <div className="qht-large-container">

        {/* Section Heading & Subtitle */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-white tracking-tight leading-[1.18]">
            {title.toLowerCase().startsWith("benefits of") ||
              title.toLowerCase().startsWith("benefit of") ||
              title.toLowerCase().startsWith("benefits")
              ? title
              : `Benefits of ${title}`}
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mt-3.5 leading-relaxed font-normal whitespace-pre-line">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Benefits List with Dividers */}
        <div className="border-t border-white/20">
          {safeBenefits.map((item, index) => (
            <div
              key={item.id ?? index}
              className="py-7 sm:py-9 border-b border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 group"
            >
              {/* Left & Middle: Circular Outline Icon + Title */}
              <div className="flex items-center gap-5 sm:gap-7 md:w-1/2">
                {/* Circular Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-nexgen-primaryGold/60 bg-nexgen-cream flex items-center justify-center p-3 flex-shrink-0 group-hover:border-nexgen-brightGold group-hover:bg-nexgen-pageLightBg transition-all duration-300">
                  {typeof item.icon === "string" && (item.icon.startsWith("http") || item.icon.startsWith("/")) ? (
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    item.icon
                  )}
                </div>

                {/* Benefit Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {item.title}
                </h3>
              </div>

              {/* Right: Description */}
              <div className="md:w-1/2 md:pl-6">
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Centered Bottom CTA */}
        {onOpenConsultation && (
          <div className="mt-12 sm:mt-16 text-center">
            <button
              onClick={onOpenConsultation}
              className="bg-nexgen-brightGold hover:brightness-105 text-nexgen-veryDarkHeader font-bold text-sm sm:text-base py-3.5 px-9 rounded-full shadow-lg transition-all active:scale-95 duration-150"
            >
              Book an Appointment
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
