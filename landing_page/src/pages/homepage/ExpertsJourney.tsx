"use client";

import React, { useState } from "react";
import { EXPERT_STAGES } from "@/data/qhtData";
import { Users, CheckCircle2, Shield } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

export default function ExpertsJourney() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const currentStage = EXPERT_STAGES[activeStageIndex];

  return (
    <section className="py-20 bg-white">
      <div className="qht-container">
        {/* Heading */}
        <div className="text-center max-w-7xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-5xl font-[500] text-nexgen-veryDarkHeader">
            A Dedicated Medical Team at Every Step
          </h2>
          <p className="mt-2 text-sm sm:text-lg text-gray-600">
            At {COMPANY_NAME}, hair restoration{" "}
            <strong className="text-nexgen-veryDarkHeader">
              is a meticulous, multidisciplinary discipline.
            </strong>{" "}
            Our specialists collaborate to design a natural, safe, and enduring hairline with zero compromise on quality.
          </p>
        </div>

        {/* 4-Stage Stepper Header */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
            {EXPERT_STAGES.map((stage, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStageIndex(idx)}
                className={`flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl transition-all duration-300 relative cursor-pointer ${activeStageIndex === idx
                  ? "bg-nexgen-mainDarkBg text-white shadow-lg scale-105 z-10 border border-nexgen-primaryGold/30"
                  : "bg-nexgen-pageLightBg text-gray-700 hover:bg-nexgen-navBg"
                  }`}
              >
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full mb-1.5 ${activeStageIndex === idx
                    ? "bg-nexgen-brightGold text-nexgen-veryDarkHeader"
                    : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {stage.percentage}
                </span>
                <span className="text-xs sm:text-sm font-bold">
                  {stage.title}
                </span>
              </button>
            ))}
          </div>

          {/* Progress Line */}
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-6 overflow-hidden">
            <div
              className="bg-nexgen-primaryGold h-full transition-all duration-500 rounded-full"
              style={{
                width: `${activeStageIndex === 0
                  ? 25
                  : activeStageIndex === 1
                    ? 50
                    : activeStageIndex === 2
                      ? 75
                      : 100
                  }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Dual Panel Stage Content Card */}
        <div className="max-w-5xl mx-auto bg-nexgen-pageLightBg rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Panel 1: Who's With You */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nexgen-veryDarkHeader mb-4">
                <Users className="w-4 h-4 text-nexgen-primaryGold" />
                <span>Who’s With You in {currentStage.title}</span>
              </div>

              <ul className="space-y-3">
                {currentStage.whoWithYou.map((member, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-nexgen-navBg border border-gray-100"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
                      {member.role}
                    </span>
                    <img
                      src={member.icon}
                      alt={member.role}
                      className="w-7 h-7 object-contain rounded-full bg-white p-1 shadow-sm"
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Panel 2: How They Support You */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nexgen-veryDarkHeader mb-4">
                <Shield className="w-4 h-4 text-nexgen-primaryGold" />
                <span>How They Support You</span>
              </div>

              <ul className="space-y-3">
                {currentStage.howTheySupport.map((support, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-nexgen-primaryGold flex-shrink-0 mt-0.5" />
                    <span>{support}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
