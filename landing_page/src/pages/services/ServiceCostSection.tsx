"use client";

import React from "react";
import { ArrowDown, Activity, Layers, Sparkles, Award, Coins } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface CostFactor {
  id?: number;
  icon?: string | React.ReactNode;
  title: string;
  desc: string;
}

export interface CostTableRow {
  type: string;
  cost: string;
  badge?: string;
  isHighlight?: boolean;
}

interface ServiceCostSectionProps {
  title?: string;
  costOverview?: string[];
  tableRows?: CostTableRow[];
  factorsSubtitle?: string;
  factors?: CostFactor[];
}

const DEFAULT_COST_OVERVIEW = [
  `The cost of hair restoration in India varies depending on the degree of baldness, total graft count, technique chosen, and surgeon expertise. At ${COMPANY_NAME}, we prioritize upfront, transparent estimates tailored to your Norwood stage without hidden surgical fees.`,
  `Every procedure package includes comprehensive diagnostic evaluation, sterile surgical suite use, motorized micro-extraction, and dedicated post-op follow-up care.`,
];

const DEFAULT_FACTORS: CostFactor[] = [
  {
    id: 1,
    icon: <Activity className="w-8 h-8 text-[#596d53]" />,
    title: "Degree of Hair Loss",
    desc: "The total surface area requiring density determines the overall graft count and surgical duration.",
  },
  {
    id: 2,
    icon: <Layers className="w-8 h-8 text-[#596d53]" />,
    title: "Total Follicular Unit Count",
    desc: "Graft requirements directly impact procedural scale and microscopic follicular sorting complexity.",
  },
  {
    id: 3,
    icon: <Sparkles className="w-8 h-8 text-[#596d53]" />,
    title: "Surgical Technique Selected",
    desc: `Techniques such as Motorized FUE and ${COMPANY_NAME} Direct Implantation vary by instrumentation and precision requirements.`,
  },
  {
    id: 4,
    icon: <Award className="w-8 h-8 text-[#596d53]" />,
    title: `Surgeon Expertise at ${COMPANY_NAME}`,
    desc: `Senior surgeon-led design and implantation ensure natural angulation, soft transitions, and lasting follicle survival.`,
  },
  {
    id: 5,
    icon: <Coins className="w-8 h-8 text-[#596d53]" />,
    title: "Donor Reserve & Session Scale",
    desc: "Extensive Norwood cases requiring mega-sessions or staged procedures are structured for optimal donor preservation.",
  },
];

export default function ServiceCostSection({
  title = "Hair Restoration",
  costOverview = DEFAULT_COST_OVERVIEW,
  tableRows,
  factorsSubtitle = "Procedure pricing is determined by graft volume, technique selection, surgeon expertise, and personalized hairline design requirements.",
  factors = DEFAULT_FACTORS,
}: ServiceCostSectionProps) {
  const safeFactors = (factors && factors.length > 0 ? factors : DEFAULT_FACTORS).map((f, idx) => {
    const isQht = typeof f.icon === "string" && f.icon.includes("qhtclinic.com");
    return {
      ...f,
      icon: isQht ? DEFAULT_FACTORS[idx % DEFAULT_FACTORS.length].icon : f.icon,
    };
  });

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#fafcfa] overflow-hidden">
      <div className="qht-large-container">

        {/* 1. TOP PART: Title + Cost Overview Paragraphs + Pricing Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start pb-14 sm:pb-16 border-b border-gray-200/90">
          
          {/* Left Column: Heading + Descriptive Text */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-[1.18]">
              {title.toLowerCase().includes("cost") ? title : `${title} Cost in India`}
            </h2>
            <div className="space-y-3.5 text-sm sm:text-base text-[#5c685f] leading-relaxed font-normal">
              {costOverview.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
            {/* Gray scroll down indicator */}
            <div className="pt-2 hidden sm:block">
              <ArrowDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Right Column: Comparative Cost Table */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_6px_24px_rgba(0,0,0,0.05)] border border-gray-100/90">
            <div className="divide-y divide-gray-100">
              {tableRows && tableRows.length > 0 ? (
                tableRows.map((row, idx) => (
                  <div
                    key={idx}
                    className={`py-4 ${idx === 0 ? "first:pt-0" : ""} ${
                      idx === tableRows.length - 1 ? "last:pb-0" : ""
                    } flex items-center justify-between text-sm sm:text-base text-gray-600 font-normal`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          row.isHighlight ? "font-bold text-[#1b221d]" : "text-gray-800"
                        }`}
                      >
                        {row.type}
                      </span>
                      {row.badge && (
                        <span className="text-xs font-semibold text-[#596d53] bg-[#eef4ee] px-2.5 py-0.5 rounded-full">
                          {row.badge}
                        </span>
                      )}
                    </div>
                    <span className={row.isHighlight ? "font-bold text-[#1b221d]" : ""}>
                      {row.cost}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="py-4 first:pt-0 flex items-center justify-between">
                    <span className="font-bold text-[#1b221d] text-base sm:text-lg">{COMPANY_NAME}</span>
                    <span className="text-xs sm:text-sm font-semibold text-[#596d53] bg-[#eef4ee] px-3 py-1 rounded-full">
                      Highly Affordable, Mid-Ranged
                    </span>
                  </div>
                  <div className="py-4 flex items-center justify-between text-sm sm:text-base text-gray-600 font-normal">
                    <span className="font-medium text-gray-800">FUE</span>
                    <span>INR 60,000 – INR 2,00,000</span>
                  </div>
                  <div className="py-4 flex items-center justify-between text-sm sm:text-base text-gray-600 font-normal">
                    <span className="font-medium text-gray-800">FUT</span>
                    <span>INR 30,000 - INR 150,000</span>
                  </div>
                  <div className="py-4 last:pb-0 flex items-center justify-between text-sm sm:text-base text-gray-600 font-normal">
                    <span className="font-medium text-gray-800">{COMPANY_NAME}</span>
                    <span className="font-bold text-[#1b221d]">INR 1,00,000 – INR 2,00,000 +</span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* 2. BOTTOM PART: Factors Affecting Cost */}
        <div className="pt-12 sm:pt-16">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12">
            <h3 className="text-2xl sm:text-3xl font-[500] text-[#1b221d] tracking-tight leading-snug max-w-md">
              Factors affecting the cost of {title}
            </h3>
            <p className="text-sm sm:text-base text-[#5c685f] max-w-xl leading-relaxed font-normal">
              {factorsSubtitle}
            </p>
          </div>

          {/* Dynamic 4-Column Factors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {safeFactors.map((f, idx) => (
              <div
                key={f.id ?? idx}
                className="flex flex-col justify-start group bg-white lg:bg-transparent p-5 lg:p-0 rounded-2xl lg:rounded-none border border-gray-100 lg:border-none shadow-sm lg:shadow-none"
              >
                {/* Factor Icon */}
                <div className="w-12 h-12 flex items-center justify-start flex-shrink-0 group-hover:scale-110 transition-transform text-[#596d53]">
                  {typeof f.icon === "string" && (f.icon.startsWith("http") || f.icon.startsWith("/")) ? (
                    <img
                      src={f.icon}
                      alt={f.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    f.icon
                  )}
                </div>

                {/* Factor Title */}
                <h4 className="text-lg sm:text-xl font-bold text-[#1b221d] mt-5 leading-snug tracking-tight">
                  {f.title}
                </h4>

                {/* Factor Description */}
                <p className="text-xs sm:text-sm text-[#5c685f] mt-2 leading-relaxed font-normal">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
