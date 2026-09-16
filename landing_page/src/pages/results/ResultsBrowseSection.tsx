"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { SlidersHorizontal, ChevronDown, ArrowRight } from "lucide-react";

export interface TransformationPatient {
  id: number;
  name: string;
  grafts: string;
  grade: string;
  area: string;
  resultsTimeline: string;
  patientType: string;
  ageGroup: string;
  beforeImg: string;
  afterImg: string;
}

interface ResultsBrowseSectionProps {
  onOpenConsultation?: () => void;
}

const PATIENTS_DATA: TransformationPatient[] = [
  {
    id: 1,
    name: "Devendra",
    grafts: "2100–3000",
    grade: "03",
    area: "Crown+Mid Scalp+Frontal Hairline",
    resultsTimeline: "11 Months",
    patientType: "Indian Patients",
    ageGroup: "30-40",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-mtzm9qege4m658.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/firefly-removebackground-mtzm64rwl6pkss.png",
  },
  {
    id: 2,
    name: "Harsh Sharma",
    grafts: "4100–5000",
    grade: "3A",
    area: "Frontal Hairline+Temples+Mid-Scalp+Crown",
    resultsTimeline: "9 Months",
    patientType: "Indian Patients",
    ageGroup: "20-30",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-1-mtzmbn4vqwbdn3.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-2-mtzv0lk8j638b7.png",
  },
  {
    id: 3,
    name: "Probir Das",
    grafts: "3100–4000",
    grade: "5A",
    area: "Frontal Hairline+Forelock Area & Vertex",
    resultsTimeline: "8 Months",
    patientType: "Indian Patients",
    ageGroup: "20-30",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-6-mtzmmfyjtmpxyz.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-4-mtzmgy4ufm739v.png",
  },
  {
    id: 4,
    name: "Ajay",
    grafts: "3100–4000",
    grade: "3A",
    area: "Frontal+Hairline+Mid-Scalp",
    resultsTimeline: "7 Months",
    patientType: "Indian Patients",
    ageGroup: "31-40",
    beforeImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/image-5-mtzurmt0h3tm7w.png",
    afterImg: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/chatgpt-image-sep-13-2026-02-25-44-pm-mtzuuboggumj3g.png",
  },

];

function InteractivePatientCard({
  patient,
  onOpenConsultation,
}: {
  patient: TransformationPatient;
  onOpenConsultation?: () => void;
}) {
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
    <div className="bg-nexgen-navBg rounded-3xl overflow-hidden border border-nexgen-serviceInnerCard/20 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">

      {/* Top: Interactive Before/After Split Comparison Box */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full aspect-[4/3.3] overflow-hidden select-none bg-gray-200 cursor-ew-resize touch-none"
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
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-black text-white flex items-center justify-center shadow-lg border border-white/20">
            <span className="text-[10px] font-bold tracking-tight">
              ‹›
            </span>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 pointer-events-none text-white/90 text-xs font-semibold drop-shadow-sm">
          Before
        </div>
        <div className="absolute top-3 right-3 pointer-events-none text-white/90 text-xs font-semibold drop-shadow-sm">
          After
        </div>
      </div>

      {/* Bottom Info Details */}
      <div className="p-5 sm:p-6 space-y-3.5 text-xs sm:text-[13px] text-gray-700 flex-1 flex flex-col justify-between">

        <div className="space-y-3">
          {/* Name */}
          <div className="flex items-center text-gray-900 font-semibold">
            <span className="text-gray-500 font-normal mr-2">Name :</span>
            <span className="text-sm font-bold">{patient.name}</span>
          </div>

          <div className="h-px bg-gray-200/90" />

          {/* Grafts + Grade */}
          <div className="flex items-center justify-between text-xs sm:text-[13px]">
            <div>
              <span className="text-gray-500 mr-1.5">Grafts :</span>
              <span className="font-semibold text-gray-900">{patient.grafts}</span>
            </div>
            <div className="w-px h-3.5 bg-gray-300" />
            <div>
              <span className="text-gray-500 mr-1.5">Grade :</span>
              <span className="font-semibold text-gray-900">{patient.grade}</span>
            </div>
          </div>

          <div className="h-px bg-gray-200/90" />

          {/* Area Treated */}
          <div>
            <span className="text-gray-500 mr-1.5">Area :</span>
            <span className="font-medium text-gray-900 leading-snug">{patient.area}</span>
          </div>

          <div className="h-px bg-gray-200/90" />

          {/* Results Timeline */}
          <div>
            <span className="text-gray-500 mr-1.5">Results :</span>
            <span className="font-semibold text-nexgen-primaryGold">{patient.resultsTimeline}</span>
          </div>
        </div>

        {/* CTA Button to /results/[slug] */}
        <div className="pt-2">
          <Link
            // href={`/results/${patient.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            href={"#"}
            className="w-full py-2.5 px-4 rounded-full border border-gray-300 hover:border-nexgen-primaryGold hover:bg-white text-nexgen-veryDarkHeader hover:text-nexgen-primaryGold transition-all flex items-center justify-center gap-2 text-xs font-semibold shadow-2xs group"
          >
            <span className="group-hover:translate-x-0.5 transition-transform">
              → &nbsp; View Complete Growth Timeline
            </span>
          </Link>
        </div>

      </div>

    </div>
  );
}

export default function ResultsBrowseSection({
  onOpenConsultation,
}: ResultsBrowseSectionProps) {
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedGrafts, setSelectedGrafts] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");

  const filteredPatients = PATIENTS_DATA.filter((p) => {
    if (selectedGrade !== "all" && p.grade !== selectedGrade) return false;
    if (selectedType !== "all" && p.patientType !== selectedType) return false;
    if (selectedGrafts !== "all" && p.grafts !== selectedGrafts) return false;
    if (selectedAge !== "all" && p.ageGroup !== selectedAge) return false;
    return true;
  });

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="qht-large-container">

        {/* Header Title + Counter */}
        <div className="flex items-center justify-between gap-4 pb-6">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-[500] text-nexgen-veryDarkHeader tracking-tight leading-tight">
            Discover Transformations Tailored to Your Case
          </h2>
          <div className="hidden sm:flex w-8 h-8 rounded-lg border border-gray-200 items-center justify-center text-xs font-bold text-gray-500">
            {filteredPatients.length}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="border-b border-gray-200/90 pb-4 mb-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 sm:gap-6 min-w-max text-xs sm:text-sm text-gray-700">

            {/* Filters Label */}
            <div className="flex items-center gap-2 font-bold text-nexgen-veryDarkHeader pr-2">
              <SlidersHorizontal className="w-4 h-4 text-nexgen-primaryGold" />
              <span>Filters</span>
            </div>

            <div className="w-px h-5 bg-gray-200" />

            {/* Baldness Grade Filter */}
            <div className="relative">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="appearance-none bg-transparent pr-6 py-1 font-medium text-gray-700 hover:text-black focus:outline-none cursor-pointer"
              >
                <option value="all">Baldness Grade</option>
                <option value="02">Grade 02</option>
                <option value="2A">Grade 2A</option>
                <option value="03">Grade 03</option>
                <option value="3A">Grade 3A</option>
                <option value="04">Grade 04</option>
                <option value="05">Grade 05</option>
                <option value="5A">Grade 5A</option>
                <option value="6A">Grade 6A</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="w-px h-5 bg-gray-200" />

            {/* Patient Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none bg-transparent pr-6 py-1 font-medium text-gray-700 hover:text-black focus:outline-none cursor-pointer"
              >
                <option value="all">Patient Type</option>
                <option value="Celebrity Results">Celebrity Results</option>
                <option value="Indian Patients">Indian Patients</option>
                <option value="International Patients">International Patients</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="w-px h-5 bg-gray-200" />

            {/* Grafts Range Filter */}
            <div className="relative">
              <select
                value={selectedGrafts}
                onChange={(e) => setSelectedGrafts(e.target.value)}
                className="appearance-none bg-transparent pr-6 py-1 font-medium text-gray-700 hover:text-black focus:outline-none cursor-pointer"
              >
                <option value="all">Grafts Range</option>
                <option value="2100–3000">2100–3000 Grafts</option>
                <option value="3100–4000">3100–4000 Grafts</option>
                <option value="4100–5000">4100–5000 Grafts</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="w-px h-5 bg-gray-200" />

            {/* Area Treated Filter */}
            <div className="relative">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="appearance-none bg-transparent pr-6 py-1 font-medium text-gray-700 hover:text-black focus:outline-none cursor-pointer"
              >
                <option value="all">Area Treated</option>
                <option value="Frontal Hairline">Frontal Hairline</option>
                <option value="Crown">Crown Area</option>
                <option value="Temples">Temples</option>
                <option value="Mid-Scalp">Mid-Scalp</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="w-px h-5 bg-gray-200" />

            {/* Age Group Filter */}
            <div className="relative">
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="appearance-none bg-transparent pr-6 py-1 font-medium text-gray-700 hover:text-black focus:outline-none cursor-pointer"
              >
                <option value="all">Age Group</option>
                <option value="20-30">20 - 30 Years</option>
                <option value="31-40">31 - 40 Years</option>
                <option value="41-50">41 - 50 Years</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* 3-Column Patient Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredPatients.map((patient) => (
            <InteractivePatientCard
              key={patient.id}
              patient={patient}
              onOpenConsultation={onOpenConsultation}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
