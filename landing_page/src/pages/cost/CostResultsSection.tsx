"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface CostResultItem {
  id: number;
  name: string;
  beforeImg: string;
  afterImg: string;
  grafts: string;
  technique: string;
  months: string;
}

const COST_RESULTS_CARDS: CostResultItem[] = [
  {
    id: 1,
    name: "Irfan",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-mtzm9qege4m658.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/firefly-removebackground-mtzm64rwl6pkss.png",
    grafts: "3,200 Grafts",
    technique: `${COMPANY_NAME} Technique`,
    months: "9 Months Result",
  },
  {
    id: 2,
    name: "Kshitij Ahuja",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-1-mtzmbn4vqwbdn3.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-2-mtzmdijf5120tx.png",
    grafts: "2,800 Grafts",
    technique: `${COMPANY_NAME} Technique`,
    months: "8 Months Result",
  },
  {
    id: 3,
    name: "Puneet Chandra",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-6-mtzmmfyjtmpxyz.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-4-mtzmgy4ufm739v.png",
    grafts: "4,500 Grafts",
    technique: `FUE + ${COMPANY_NAME}`,
    months: "12 Months Result",
  },
  {
    id: 4,
    name: "Pranav Meshram",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-5-mtzmidwcu9uedr.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/chatgpt-image-sep-13-2026-02-25-44-pm-mtzkx8trmehq12.png",
    grafts: "4,000 Grafts",
    technique: "FUE Technique",
    months: "10 Months Result",
  },
  // {
  //   id: 5,
  //   name: "Praveen Kumar",
  //   beforeImg: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Praveen-Kumar-Grade-Bangalore-DHI-Pre.webp",
  //   afterImg: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Praveen-Kumar-Grade-Bangalore-DHI-Post.webp",
  //   grafts: "3,500 Grafts",
  //   technique: "DHI / FUE",
  //   months: "9 Months Result",
  // },
  // {
  //   id: 6,
  //   name: "Sagar Kumar",
  //   beforeImg: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Sagar-Kumar-Grade-4A-Pre.webp",
  //   afterImg: "https://www.qhtclinic.com/wp-content/uploads/2025/08/Copy-of-Sagar-Kumar-Grade-4A-Post.webp",
  //   grafts: "2,600 Grafts",
  //   technique: `${COMPANY_NAME} Technique`,
  //   months: "7 Months Result",
  // },
];

function InteractiveComparisonCard({ item }: { item: CostResultItem }) {
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
    <div className="bg-[#38493a] rounded-3xl overflow-hidden shadow-xl border border-white/10 flex flex-col justify-between">

      {/* Interactive Split Comparison Slider */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative aspect-[4/3] w-full cursor-ew-resize touch-none overflow-hidden select-none bg-white"
      >
        {/* AFTER IMAGE (Base Layer) */}
        <img
          src={item.afterImg}
          alt={`${item.name} After`}
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
            alt={`${item.name} Before`}
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
        <div className="flex items-center justify-between text-xs text-gray-200 font-medium">
          <span className="font-bold text-white">{item.name}</span>
          <span className="text-[#b1fc85] font-semibold">{item.grafts}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-300">
          <span>{item.technique}</span>
          <span>{item.months}</span>
        </div>
      </div>

    </div>
  );
}

export default function CostResultsSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-[#485942] text-white overflow-hidden">
      <div className="qht-large-container relative z-10">

        {/* Header Row with Vector Motif */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 lg:mb-16">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-white tracking-tight leading-[1.15]">
              Results of Hair Transplant
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal">
              See real transformations delivered through {COMPANY_NAME}’s proprietary technique. Every result reflects precision graft handling, optimal density, and natural-looking outcomes - designed by experienced surgeons with attention to detail.
            </p>
          </div>

          {/* QHT Circular Root Vector Motif */}
          <div className="flex-shrink-0">
            <img
              src="https://www.qhtclinic.com/wp-content/themes/qht/assets/img/sd-result-vector.webp"
              alt={`${COMPANY_NAME} Motif`}
              className="w-24 h-24 lg:w-32 lg:h-32 object-contain opacity-90"
            />
          </div>
        </div>

        {/* 6 Cards 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {COST_RESULTS_CARDS.map((card) => (
            <InteractiveComparisonCard key={card.id} item={card} />
          ))}
        </div>

        {/* Explore More Results Button centered with horizontal line */}
        <div className="relative mt-14 sm:mt-16 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative z-10 bg-[#485942] px-6">
            <Link
              href="/results"
              className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-[#1b221d] font-bold text-xs sm:text-sm py-3 px-8 rounded-full shadow-lg transition-all active:scale-95 duration-150"
            >
              <span>Explore More Results</span>
              <span className="text-sm font-black">+</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
