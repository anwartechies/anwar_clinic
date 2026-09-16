"use client";

import React from "react";
import { AlertCircle, HeartPulse, ShieldAlert, Layers, Activity } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface CauseItem {
  id?: number;
  icon?: string | React.ReactNode;
  title: string;
  desc: string;
}

interface ServiceCausesSectionProps {
  title?: string;
  subtitle?: string;
  causes?: CauseItem[];
}

const DEFAULT_CAUSES: CauseItem[] = [
  {
    id: 1,
    icon: <AlertCircle className="w-8 h-8 text-nexgen-primaryGold" />,
    title: "Poor Hairline",
    desc: "An irregular hairline may need proper correction for the desired look.",
  },
  {
    id: 2,
    icon: <HeartPulse className="w-8 h-8 text-nexgen-primaryGold" />,
    title: "Graft Survival",
    desc: `Failed grafts make Hair Transplant Repair at ${COMPANY_NAME} Clinic essential.`,
  },
  {
    id: 3,
    icon: <ShieldAlert className="w-8 h-8 text-nexgen-primaryGold" />,
    title: "Visible Scars",
    desc: "The scars caused due to improper methods may need repair.",
  },
  {
    id: 4,
    icon: <Layers className="w-8 h-8 text-nexgen-primaryGold" />,
    title: "Poor Density",
    desc: "Patchy hair growth may lead to patients opting for full coverage.",
  },
  {
    id: 5,
    icon: <Activity className="w-8 h-8 text-nexgen-primaryGold" />,
    title: "Patient Personal Factors",
    desc: "Before a Hair Transplant Repair, if the patient consumes alcohol or smokes, then the healing is affected.",
  },
];

export default function ServiceCausesSection({
  title = "Hair Transplant Repair",
  subtitle = `People need early Hair Transplant Repair for proper treatment, and ${COMPANY_NAME} Clinic offers expert care for lasting results.`,
  causes = DEFAULT_CAUSES,
}: ServiceCausesSectionProps) {
  const safeCauses = (causes && causes.length > 0 ? causes : DEFAULT_CAUSES).map((cause, idx) => {
    const isQht = typeof cause.icon === "string" && cause.icon.includes("qhtclinic.com");
    return {
      ...cause,
      icon: isQht ? DEFAULT_CAUSES[idx % DEFAULT_CAUSES.length].icon : cause.icon,
    };
  });

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden border-t border-gray-100">
      <div className="qht-large-container">
        
        {/* 3-Column Grid: First Cell is Section Heading, other 5 are Cause Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* Cell 1: Section Heading & Subtitle */}
          <div className="flex flex-col justify-center space-y-4 pr-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-[1.18]">
              {title.toLowerCase().startsWith("cause") ? (
                title
              ) : (
                <>
                  Cause of Early
                  <br />
                  {title}
                  <br />
                  Loss
                </>
              )}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          {/* Cells 2 to 6: Light Rounded Cards */}
          {safeCauses.map((cause, idx) => (
            <div
              key={cause.id ?? idx}
              className="bg-nexgen-pageLightBg rounded-3xl p-7 sm:p-8 flex flex-col justify-start hover:shadow-md transition-shadow duration-200 group border border-gray-100/70"
            >
              <div className="w-12 h-12 flex items-center justify-start flex-shrink-0 group-hover:scale-110 transition-transform text-nexgen-primaryGold">
                {typeof cause.icon === "string" && (cause.icon.startsWith("http") || cause.icon.startsWith("/")) ? (
                  <img
                    src={cause.icon}
                    alt={cause.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  cause.icon
                )}
              </div>

              {/* Card Title */}
              <h3 className="text-lg sm:text-xl font-bold text-nexgen-veryDarkHeader mt-5 leading-snug tracking-tight">
                {cause.title}
              </h3>

              {/* Card Description */}
              <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed font-normal">
                {cause.desc}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
