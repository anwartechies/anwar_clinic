"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PatientResultDetail, PATIENT_RESULTS_LIST } from "@/data/patientResultsData";

interface ResultDetailHeroProps {
  patient?: PatientResultDetail;
  onOpenConsultation?: () => void;
}

export default function ResultDetailHero({
  patient = PATIENT_RESULTS_LIST[0],
  onOpenConsultation,
}: ResultDetailHeroProps) {
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
    <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 bg-nexgen-pageLightBg overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1. Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-normal mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href="/results" className="hover:text-black transition-colors">
            Results
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-800 font-medium">{patient.name}</span>
        </nav>

        {/* 2. Patient Header Title & Location */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight">
            {patient.name}
          </h1>
          <p className="text-xs sm:text-lg text-gray-600 font-normal">
            {patient.location}
          </p>
        </div>

        {/* 3. Four-Column Stats White Pill Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-200/60 max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-gray-100 text-left">

            {/* Col 1: Baldness Grade */}
            <div className="pt-3 md:pt-0 md:px-4 first:pt-0 first:pl-0">
              <span className="text-[11px] font-medium text-gray-400 block mb-1">
                Baldness Grade
              </span>
              <p className="text-sm sm:text-base font-bold text-gray-900 leading-none">
                {patient.grade}
              </p>
            </div>

            {/* Col 2: Graft Range */}
            <div className="pt-3 md:pt-0 md:px-4">
              <span className="text-[11px] font-medium text-gray-400 block mb-1">
                Graft Range
              </span>
              <p className="text-sm sm:text-base font-bold text-gray-900 leading-none">
                {patient.graftRange}
              </p>
            </div>

            {/* Col 3: Area Treated */}
            <div className="pt-3 md:pt-0 md:px-4">
              <span className="text-[11px] font-medium text-gray-400 block mb-1">
                Area Treated
              </span>
              <p className="text-sm sm:text-base font-bold text-gray-900 leading-none">
                {patient.areaTreated}
              </p>
            </div>

            {/* Col 4: Age Group */}
            <div className="pt-3 md:pt-0 md:px-4 last:pr-0">
              <span className="text-[11px] font-medium text-gray-400 block mb-1">
                Age Group
              </span>
              <p className="text-sm sm:text-base font-bold text-gray-900 leading-none">
                {patient.ageGroup}
              </p>
            </div>

          </div>
        </div>

        {/* 4. Two Large Side-by-Side Comparison Photos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch mb-12">

          {/* Left: Full Before Photo */}
          <div className="relative aspect-[4/3.2] rounded-3xl overflow-hidden bg-gray-200 shadow-sm border border-gray-200/80 group">
            <img
              src={patient.beforeImg}
              alt={`${patient.name} Before Hair Transplant`}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-gray-800 text-xs font-semibold px-3.5 py-1 rounded-full shadow-2xs">
              Before
            </div>
          </div>

          {/* Right: Full After Photo */}
          <div className="relative aspect-[4/3.2] rounded-3xl overflow-hidden bg-gray-200 shadow-sm border border-gray-200/80 group">
            <img
              src={patient.afterImg}
              alt={`${patient.name} After Hair Transplant`}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs text-gray-800 text-xs font-semibold px-3.5 py-1 rounded-full shadow-2xs">
              After
            </div>
          </div>

        </div>

        {/* 5. Treatment Snapshot (Dark Olive Green Card with Split Interactive Slider) */}
        <div className="bg-nexgen-mainDarkBg rounded-3xl p-7 sm:p-10 lg:p-12 text-white shadow-xl border border-nexgen-primaryGold/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Snapshot Stats */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-[500] text-white tracking-tight">
                Treatment Snapshot
              </h2>

              {/* Grafts Implanted */}
              <div>
                <span className="text-xs sm:text-sm font-medium text-white/85 block mb-1">
                  Grafts Implanted
                </span>
                <p className="text-5xl sm:text-6xl font-black text-nexgen-brightGold tracking-tight leading-none">
                  {patient.graftsImplanted}
                </p>
              </div>

              {/* Results Achieved In (Months) */}
              <div>
                <span className="text-xs sm:text-sm font-medium text-white/85 block mb-1">
                  Results Achieved In (Months)
                </span>
                <p className="text-5xl sm:text-6xl font-black text-nexgen-brightGold tracking-tight leading-none">
                  {patient.resultsMonths}
                </p>
              </div>
            </div>

            {/* Right Interactive Comparison Slider Box */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-900 shadow-lg border border-white/20 select-none">
                <div
                  ref={containerRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="relative w-full h-full cursor-ew-resize touch-none overflow-hidden"
                >
                  {/* AFTER IMAGE (Base Right) */}
                  <img
                    src={patient.afterImg}
                    alt={`${patient.name} After`}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />

                  {/* BEFORE IMAGE (Clipped Left) */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  >
                    <img
                      src={patient.beforeImg}
                      alt={`${patient.name} Before`}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      draggable={false}
                    />
                  </div>

                  {/* Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none shadow-md"
                    style={{ left: `${sliderPos}%` }}
                  >
                    {/* Central Knob with < > */}
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-md bg-black text-white flex items-center justify-center shadow-lg border border-white/20">
                      <span className="text-[10px] font-bold tracking-tight">
                        ‹›
                      </span>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-3.5 left-3.5 pointer-events-none text-white/90 text-xs font-semibold drop-shadow-sm">
                    Before
                  </div>
                  <div className="absolute top-3.5 right-3.5 pointer-events-none text-white/90 text-xs font-semibold drop-shadow-sm">
                    After
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
