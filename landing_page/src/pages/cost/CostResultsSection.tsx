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
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-2-mtzv0lk8j638b7.png",
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
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-5-mtzurmt0h3tm7w.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/chatgpt-image-sep-13-2026-02-25-44-pm-mtzuuboggumj3g.png",
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
    <div className="bg-nexgen-navBg rounded-3xl overflow-hidden shadow-xl border border-nexgen-primaryGold/20 flex flex-col justify-between">

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
      <div className="p-4 sm:p-4.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-nexgen-veryDarkHeader text-sm sm:text-base tracking-tight truncate">
            {item.name}
          </span>
          <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-nexgen-mainDarkBg text-nexgen-brightGold shrink-0 border border-nexgen-brightGold/20">
            {item.grafts}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-black/50 font-medium">
          <span className="truncate pr-1" title={item.technique}>{item.technique}</span>
          <span className="shrink-0 text-nexgen-veryDarkHeader/65 font-medium">{item.months}</span>
        </div>
      </div>

    </div>
  );
}

export default function CostResultsSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-nexgen-mainDarkBg text-white overflow-hidden">
      <div className="qht-large-container relative z-10">

        {/* Header Row with Vector Motif */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 lg:mb-16">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-white tracking-tight leading-[1.15]">
              Verified Transformations & Regrowth Outcomes
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal">
              Witness real patient journeys restored through {COMPANY_NAME}’s precision surgical protocols. Each transformation demonstrates artistic hairline architecture, maximum follicular survival, and undetectable, natural-looking density tailored to the patient's facial profile.
            </p>
          </div>

          {/* QHT Circular Root Vector Motif */}

        </div>

        {/* 4 Cards 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {COST_RESULTS_CARDS.map((card) => (
            <InteractiveComparisonCard key={card.id} item={card} />
          ))}
        </div>

        {/* Explore More Results Button centered with horizontal line */}
        <div className="relative mt-14 sm:mt-16 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative z-10 bg-nexgen-mainDarkBg px-6">
            <Link
              href="/results"
              className="inline-flex items-center gap-1.5 bg-nexgen-brightGold hover:brightness-105 text-nexgen-veryDarkHeader font-bold text-xs sm:text-sm py-3 px-8 rounded-full shadow-lg transition-all active:scale-95 duration-150"
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
