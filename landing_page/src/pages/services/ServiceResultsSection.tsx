"use client";

import React, { useState, useRef, useCallback } from "react";
import { COMPANY_NAME } from "@/config/constants";

export interface ResultCardItem {
  id: number;
  name?: string;
  beforeImg: string;
  afterImg: string;
  grafts?: string;
  age?: string;
  technique?: string;
  sessions?: string;
  timeframe?: string;
}

export interface ServiceResultsSectionProps {
  title?: string;
  subtitle?: string;
  results?: ResultCardItem[];
  onOpenConsultation?: () => void;
}

const DEFAULT_RESULTS: ResultCardItem[] = [
  {
    id: 1,
    name: "Irfan",
    beforeImg: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Irfan-Uttar-Pradesh-Grade-5A-Pre.webp",
    afterImg: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Irfan-Uttar-Pradesh-Grade-5A-Post.webp",
    grafts: "2800 Grafts",
    age: "34 Years",
    technique: `${COMPANY_NAME} Method`,
    sessions: "1 Session",
    timeframe: "8 Months",
  },
  {
    id: 2,
    name: "Kshitij Ahuja",
    beforeImg: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Kshitij-Ahuja-Jabalpur-Grade-4-Pre.webp",
    afterImg: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Kshitij-Ahuja-Jabalpur-Grade-4-Post.webp",
    grafts: "3200 Grafts",
    age: "29 Years",
    technique: "FUE Repair",
    sessions: "1 Session",
    timeframe: "9 Months",
  },
  {
    id: 3,
    name: "Pranav Meshram",
    beforeImg: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Pranav-Meshram-Grade-6-Pre.webp",
    afterImg: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Pranav-Meshram-Grade-6-Post.webp",
    grafts: "2500 Grafts",
    age: "38 Years",
    technique: "Correction",
    sessions: "1 Session",
    timeframe: "6 Months",
  },
];

function ServiceComparisonCard({ item }: { item: ResultCardItem }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className="bg-[#2d3b2e] rounded-3xl overflow-hidden border border-white/10 shadow-lg flex flex-col justify-between">
      {/* Interactive Before/After Split Comparison View */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative aspect-[4/3] w-full cursor-ew-resize touch-none overflow-hidden select-none bg-black"
      >
        {/* AFTER IMAGE (Base Layer) */}
        <img
          src={item.afterImg}
          alt={item.name ? `${item.name} After` : "After Transformation"}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* BEFORE IMAGE (Clipped Layer) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src={item.beforeImg}
            alt={item.name ? `${item.name} Before` : "Before Transformation"}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Divider Handle */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none shadow-md"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-black/80 backdrop-blur-xs text-white flex items-center justify-center border border-white/40 shadow-lg text-[10px]">
            ‹›
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full pointer-events-none">
          Before
        </div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full pointer-events-none">
          After
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
          <span>{item.grafts || item.name || "Hair Restoration"}</span>
          {item.timeframe && <span className="text-emerald-400">{item.timeframe}</span>}
        </div>
        {(item.technique || item.age) && (
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>{item.technique}</span>
            <span>{item.age}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServiceResultsSection({
  title = "Hair Transplant Repair",
  subtitle = `Corrective Hair Transplant at ${COMPANY_NAME} Clinic focuses on hairline design, hair density, and no-scar growth, for long-term results in people with failed Hair Transplants.`,
  results = DEFAULT_RESULTS,
  onOpenConsultation,
}: ServiceResultsSectionProps) {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-[#38493a] text-white overflow-hidden">
      <div className="qht-large-container relative z-10">

        {/* Top Header Row with Vector Logo Motif */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 lg:mb-16 relative">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-white tracking-tight leading-[1.18]">
              {title.toLowerCase().startsWith("result of") ||
                title.toLowerCase().startsWith("results of") ||
                title.toLowerCase().startsWith("result")
                ? title
                : `Result of ${title}`}
            </h2>
            <p className="text-sm sm:text-lg text-gray-300 leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          {/* QHT Circular Vector Motif */}

        </div>

        {/* 3-Column Results Cards Grid using TransformationGallery component architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {results.map((item, index) => (
            <ServiceComparisonCard key={item.id ?? index} item={item} />
          ))}
        </div>

        {/* Bottom CTA Button */}
        {onOpenConsultation && (
          <div className="mt-12 text-center">
            <button
              onClick={onOpenConsultation}
              className="bg-[#596d53] hover:bg-[#495c44] text-white font-semibold text-sm sm:text-base py-3.5 px-9 rounded-full shadow-lg transition-all active:scale-95"
            >
              Book an Appointment
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
