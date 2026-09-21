"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export interface RoutineStep {
  title: string;
  instruction: string;
}

export interface RoutineItem {
  id: string;
  timeSlot: string;
  steps: RoutineStep[];
}

export const DEFAULT_ROUTINES: RoutineItem[] = [
  {
    id: "morning",
    timeSlot: "Morning",
    steps: [
      {
        title: "Wash with NexGen Daily Hydrating Shampoo",
        instruction:
          "Use a gentle cleanser, NexGen daily hydrating shampoo, to wash your scalp and hair before applying any hair care products.",
      },
      {
        title: "Apply Topical Solutions",
        instruction:
          "Apply NexGen Minoxidil 5% and NexGen hair serum to a clean, dry scalp. Use it twice daily and avoid washing your hair for at least 4 hours after application.",
      },
      {
        title: "Take Oral supplements",
        instruction:
          "Take one NexGen hair supplement tablet and NexGen Finasteride tablets daily after breakfast or lunch, for the time recommended by your doctor.",
      },
    ],
  },
  {
    id: "evening",
    timeSlot: "Evening",
    steps: [
      {
        title: "Apply Night Restorative Hair Serum",
        instruction:
          "Apply 1ml of NexGen cyclical restorative serum directly onto thinning scalp areas. Gently massage with fingertips for 2 minutes to boost micro-circulation.",
      },
      {
        title: "Overnight Scalp Recovery",
        instruction:
          "Allow the serum to absorb overnight. Avoid heavy friction or tight headwear while sleeping.",
      },
    ],
  },
  {
    id: "once-weekly",
    timeSlot: "Once Weekly",
    steps: [
      {
        title: "Micro-Needling Scalp Activation",
        instruction:
          "Gently roll the 0.5mm titanium derma roller over target zones 4-5 times in vertical, horizontal, and diagonal motions on clean dry scalp.",
      },
      {
        title: "Nourishing Botanical Oil Treatment",
        instruction:
          "Follow up with NexGen botanical growth oil. Leave on for 2-4 hours before washing with mild shampoo.",
      },
    ],
  },
];

interface HowToUseSectionProps {
  routines?: RoutineItem[];
  image?: string;
}

export default function HowToUseSection({
  routines = DEFAULT_ROUTINES,
  image = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
}: HowToUseSectionProps) {
  const [openRoutineId, setOpenRoutineId] = useState<string>("morning");

  const toggleRoutine = (id: string) => {
    setOpenRoutineId(openRoutineId === id ? "" : id);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#fbf9f4] border-t border-gray-100/90">
      <div className="qht-large-container">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Hands Holding Supplement Pill & Bottle */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div className="w-full max-w-[460px] rounded-3xl sm:rounded-[36px] overflow-hidden aspect-[4/5] shadow-lg border border-gray-200/60 bg-[#eadecc] relative">
              <img
                src={image}
                alt="Hands holding supplement pills bottle"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Routine Instructions Accordion */}
          <div className="lg:col-span-6 space-y-6">
            
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5c685f] block mb-2">
                INSTRUCTIONS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1b221d] tracking-tight leading-tight">
                How To Use
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#5c685f] leading-relaxed font-normal">
                To be used as directed by the doctor.
              </p>
            </div>

            {/* Accordion List for Routines */}
            <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {routines.map((routine) => {
                const isOpen = openRoutineId === routine.id;

                return (
                  <div key={routine.id} className="py-4 sm:py-5 transition-colors">
                    
                    {/* Routine Header Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleRoutine(routine.id)}
                      className="w-full flex items-center justify-between text-left group cursor-pointer select-none focus:outline-none"
                    >
                      <span
                        className={`text-lg sm:text-xl font-bold leading-snug transition-colors pr-4 ${
                          isOpen ? "text-[#2e7d32]" : "text-[#1b221d] group-hover:text-[#2e7d32]"
                        }`}
                      >
                        {routine.timeSlot}
                      </span>

                      <div className="text-gray-600 flex-shrink-0">
                        {isOpen ? (
                          <Minus className="w-4 h-4 text-[#2e7d32]" />
                        ) : (
                          <Plus className="w-4 h-4 text-gray-500 group-hover:text-[#1b221d]" />
                        )}
                      </div>
                    </button>

                    {/* Routine Steps Body */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100 mt-3"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-3.5 pt-1 pb-2">
                          {routine.steps.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              className={`${
                                sIdx !== routine.steps.length - 1
                                  ? "border-b border-gray-200/80 pb-3"
                                  : ""
                              }`}
                            >
                              <h4 className="text-xs sm:text-[13px] font-bold text-[#1b221d] leading-snug mb-1">
                                {step.title}
                              </h4>
                              <p className="text-xs text-[#5c685f] leading-relaxed font-normal">
                                {step.instruction}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
