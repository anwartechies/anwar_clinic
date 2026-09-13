"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Phone, Mail, ChevronRight, ChevronLeft } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface ClinicBranchData {
  id: string;
  tabLabel: string;
  tabIcon: React.ReactNode;
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  images: {
    url: string;
    caption: string;
  }[];
}

const CLINIC_BRANCHES: ClinicBranchData[] = [
  {
    id: "patna",
    tabLabel: "Patna (Main Branch)",
    tabIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        {/* Clinic / Building */}
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h2M13 10h2M9 14h2M13 14h2M9 18h2M13 18h2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: `${COMPANY_NAME} — Patna (Main Branch)`,
    subtitle:
      `Our Patna flagship center features world-class sterile surgical suites, comprehensive trichoscopy diagnostics, and senior surgeon care.`,
    address:
      "Vishal Residency Wing-1, Pillar No-56, Raja Bazar, Patna, Bihar 800014",
    phone: "+91 9084726916",
    email: `care@${COMPANY_NAME.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    images: [
      {
        url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
        caption: "Main Reception & Consultation Hallway",
      },
      {
        url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        caption: "Sterile Procedure OT Room",
      },
      {
        url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
        caption: "Microscopic Graft Segregation Station",
      },
      {
        url: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=1200&q=80",
        caption: "Post-Operative Recovery Lounge",
      },
    ],
  },
  {
    id: "mumbai",
    tabLabel: "Mumbai (Second Branch)",
    tabIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        {/* Gateway / Metropolitan */}
        <path d="M4 21V6H20V21" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 6H22V4H2V6Z" />
        <path d="M8 21V11C8 9.5 16 9.5 16 11V21" strokeLinecap="round" />
      </svg>
    ),
    title: `${COMPANY_NAME} — Mumbai (Second Branch)`,
    subtitle:
      `Our Mumbai restoration center provides precision graft implantation, advanced scalp analysis, and personalized consultations.`,
    address:
      "Bandra West / Andheri, Mumbai, Maharashtra",
    phone: "+91 9084726916",
    email: `care@${COMPANY_NAME.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    images: [
      {
        url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        caption: "Mumbai Consultation Suite",
      },
      {
        url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
        caption: "Patient Care & Waiting Lounge",
      },
      {
        url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
        caption: "Sterile Procedure OT Room",
      },
      {
        url: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=1200&q=80",
        caption: "Trichoscopy & Scalp Diagnostics OT",
      },
    ],
  },
];

interface ClinicShowcaseSectionProps {
  onOpenConsultation?: () => void;
}

export default function ClinicShowcaseSection({
  onOpenConsultation,
}: ClinicShowcaseSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("patna");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const currentBranch =
    CLINIC_BRANCHES.find((b) => b.id === activeTab) || CLINIC_BRANCHES[0];

  // Auto slideshow every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % currentBranch.images.length);
    }, 10000); // 10s interval as requested

    return () => clearInterval(timer);
  }, [currentBranch.images.length, activeTab]);

  const handleTabChange = (branchId: string) => {
    setActiveTab(branchId);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentBranch.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? currentBranch.images.length - 1 : prev - 1
    );
  };

  const nextImageIndex = (currentImageIndex + 1) % currentBranch.images.length;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="qht-large-container">
        
        {/* Heading & Intro */}
        <div className="max-w-5xl mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-[#1b221d] tracking-tight leading-[1.14] mb-4">
            We have state of the art hair transplant <br />
            clinic across in india.
          </h2>
          <p className="text-xs sm:text-sm text-[#5c685f] leading-relaxed font-normal max-w-4xl">
            We have state-of-the-art hair transplant clinics across India, offering advanced treatments with the latest technology and highly experienced surgeons. Our clinics are equipped to provide safe, effective, and natural-looking results. Whether you're dealing with hair loss or looking for hair restoration, {COMPANY_NAME} Clinic ensures personalized care and exceptional outcomes in every major city across India.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10 sm:mb-12">
          {CLINIC_BRANCHES.map((branch) => {
            const isActive = activeTab === branch.id;
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => handleTabChange(branch.id)}
                className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#52664d] text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300/80 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <span className={isActive ? "text-white" : "text-[#52664d]"}>
                  {branch.tabIcon}
                </span>
                <span>{branch.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Grid: Left Details Sidebar + Right Image Gallery Slideshow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Contact Card + Get An Expert Assistance */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Contact Card */}
            <div className="bg-[#eff5f1] rounded-3xl p-6 sm:p-7 space-y-4 border border-gray-200/50 shadow-2xs">
              
              {/* Address */}
              <div className="flex items-start gap-3.5 pb-3.5 border-b border-gray-300/40">
                <div className="w-8 h-8 rounded-full bg-[#52664d] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-[13px] text-gray-800 leading-snug font-medium">
                  {currentBranch.address}
                </p>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3.5 pb-3.5 border-b border-gray-300/40">
                <div className="w-8 h-8 rounded-full bg-[#52664d] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <a
                  href={`tel:${currentBranch.phone.replace(/[^0-9+]/g, "")}`}
                  className="text-xs sm:text-[13px] text-gray-800 font-semibold hover:text-[#52664d] transition-colors"
                >
                  {currentBranch.phone}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#52664d] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <a
                  href={`mailto:${currentBranch.email}`}
                  className="text-xs sm:text-[13px] text-gray-800 font-semibold hover:text-[#52664d] transition-colors"
                >
                  {currentBranch.email}
                </a>
              </div>

            </div>

            {/* "Get An Expert Assistance." Card */}
            <div className="bg-gradient-to-br from-[#121c13] via-[#1b2b1d] to-[#2c3d2a] rounded-3xl p-7 sm:p-8 text-white relative overflow-hidden shadow-xl border border-[#344b38]">
              {/* Subtle ambient light glow */}
              <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#b1fc85]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-2xl sm:text-[26px] font-[500] text-white leading-tight mb-2 tracking-tight">
                  Get An Expert <br />
                  Assistance.
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mb-6 font-normal leading-relaxed">
                  Get expert assistance for safe, effective hair restoration.
                </p>

                <button
                  type="button"
                  onClick={onOpenConsultation}
                  className="bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md transition-all active:scale-95 duration-150 cursor-pointer"
                >
                  Consult Us
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Branch Title + 10s Automatic Image Slideshow */}
          <div className="lg:col-span-8 flex flex-col">
            
            {/* Branch Showcase Header */}
            <div className="mb-6">
              <h3 className="text-2xl sm:text-3xl font-[500] text-[#1b221d] mb-2 tracking-tight">
                {currentBranch.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#5c685f] leading-relaxed max-w-2xl">
                {currentBranch.subtitle}
              </p>
            </div>

            {/* Slideshow Container with peek next image */}
            <div className="relative flex items-center gap-4 sm:gap-6 overflow-hidden">
              
              {/* Main Active Slide */}
              <div className="relative flex-1 rounded-3xl overflow-hidden shadow-xl border border-gray-200/80 bg-gray-900 h-[360px] sm:h-[440px] group">
                <img
                  src={currentBranch.images[currentImageIndex].url}
                  alt={currentBranch.images[currentImageIndex].caption}
                  className="w-full h-full object-cover transition-all duration-700 ease-out"
                />
                
                {/* Gradient bottom overlay with caption */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-white drop-shadow">
                    {currentBranch.images[currentImageIndex].caption}
                  </span>

                  {/* 10s Timer Indicator Dots */}
                  <div className="flex items-center gap-1.5">
                    {currentBranch.images.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setCurrentImageIndex(dotIdx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentImageIndex === dotIdx
                            ? "w-6 bg-[#b1fc85]"
                            : "w-2 bg-white/50 hover:bg-white"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Left/Right Quick Controls */}
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Next Slide Peek Card */}
              <div
                onClick={nextImage}
                className="hidden sm:block w-20 md:w-28 lg:w-32 h-[360px] sm:h-[440px] rounded-3xl overflow-hidden shadow-lg border border-gray-200/80 cursor-pointer relative flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
              >
                <img
                  src={currentBranch.images[nextImageIndex].url}
                  alt="Next Slide"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors" />
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
