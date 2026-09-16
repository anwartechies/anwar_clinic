"use client";

import React, { useState, useRef, useCallback } from "react";
import { TRANSFORMATION_GALLERY } from "@/data/qhtData";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface TransformationGalleryProps {
  onOpenConsultation: () => void;
}

interface ComparisonCardProps {
  item: (typeof TRANSFORMATION_GALLERY)[0];
  onOpenConsultation: () => void;
}

function ComparisonCard({ item, onOpenConsultation }: ComparisonCardProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percentage);
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
    <div className="flex flex-col bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-gray-100 hover:shadow-md transition-shadow">
      {/* Before / After Interactive Comparison Box */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full aspect-square overflow-hidden select-none bg-gray-200 cursor-ew-resize touch-none rounded-2xl sm:rounded-3xl"
      >
        {/* After Image (Full Base - Right Side) */}
        <img
          src={item.afterImg}
          alt={`${item.patientName} After`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Before Image (Clipped with clip-path - Left Side, zero distortion) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={item.beforeImg}
            alt={`${item.patientName} Before`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Before & After Clean Labels */}
        <span className="absolute top-2.5 left-3 sm:top-3 sm:left-3.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-white z-20 pointer-events-none">
          Before
        </span>
        <span className="absolute top-2.5 right-3 sm:top-3 sm:right-3.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-white z-20 pointer-events-none">
          After
        </span>

        {/* Center Black Handle Button */}
        <div
          className="absolute top-0 bottom-0 z-30 pointer-events-none -translate-x-1/2 flex items-center justify-center"
          style={{ left: `${position}%` }}
        >
          {/* Black Rounded Handle Button */}
          <div className="relative z-40 w-8 h-8 sm:w-9 sm:h-9 bg-black rounded-xl text-white flex items-center justify-center shadow-xl transition-transform active:scale-95">
            <ChevronLeft className="w-3 h-3 -mr-0.5 text-white" />
            <ChevronRight className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      {/* Patient Meta & Quick Action */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-2.5">
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <h4 className="text-sm sm:text-[15px] font-bold text-nexgen-veryDarkHeader">
            {item.patientName}
          </h4>
          <span className="text-[11px] text-gray-500 font-medium px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md">
            {item.grade}
          </span>
        </div>
        <button
          onClick={onOpenConsultation}
          className="text-xs font-bold text-nexgen-primaryGold hover:text-nexgen-brightGold transition-colors flex items-center justify-between group pt-1.5 border-t border-gray-100 text-left cursor-pointer"
        >
          <span>Request Similar Plan</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 shrink-0" />
        </button>
      </div>
    </div>
  );
}

export default function TransformationGallery({
  onOpenConsultation,
}: TransformationGalleryProps) {
  return (
    <section className="py-12 sm:py-20 bg-nexgen-pageLightBg">
      <div className="qht-large-container">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-[500] text-nexgen-veryDarkHeader">
            Real Transformations, Undeniable Results
          </h2>
          <a
            href="/results/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-nexgen-primaryGold hover:text-nexgen-brightGold transition-colors"
          >
            <span>Explore All Patient Results</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <p className="text-xs sm:text-2xl max-w-2xl mb-8 sm:mb-10 text-gray-600">
          Explore verified patient outcomes. Slide the handle on any card to inspect graft density, natural hairline integration.
        </p>

        {/* Before / After Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRANSFORMATION_GALLERY.map((item) => (
            <ComparisonCard
              key={item.id}
              item={item}
              onOpenConsultation={onOpenConsultation}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
