"use client";

import React, { useState } from "react";
import { ZoomIn, X, Building, ShieldCheck, Sparkles } from "lucide-react";
import { COMPANY_NAME } from "@/config/constants";

interface GalleryItem {
  id: number;
  src: string;
  title: string;
  category: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
    title: "International Consultation Suite",
    category: "Consultation & Planning",
  },
  {
    id: 2,
    src: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-53-52-pm-mu46z5zwqbrtgd.jpeg",
    title: "Doctor-Led Hairline Architecture",
    category: "Surgeon Assessment",
  },
  {
    id: 3,
    src: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-53-08-pm-mu46xz28f0p1lx.jpeg",
    title: "Ultra-Sterile Operating Theaters",
    category: "HEPA Filtered Theaters",
  },
  {
    id: 4,
    src: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-55-37-pm-mu4713fhxp35ck.jpeg",
    title: "VIP Patient Lounge & Hospitality",
    category: "Surgical Procedures & Team",
  },
  {
    id: 5,
    src: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-8-03-52-pm-mu47c3sxpl41ro.jpeg",
    title: "Microscopic Graft Preservation",
    category: "High Viability Lab",
  },
  {
    id: 6,
    src: "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-8-06-05-pm-mu47enqn4f3okf.jpeg",
    title: "International Patient Experience",
    category: "Patient Delight",
  },
];

export default function MedicalInfrastructureSection() {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  return (
    <section className="py-20 lg:py-24 bg-nexgen-pageLightBg overflow-hidden">
      <div className="qht-container">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-nexgen-veryDarkHeader/10 text-nexgen-veryDarkHeader border border-nexgen-primaryGold/20 text-xs font-bold tracking-wider uppercase mb-3">
            Facility Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[600] text-nexgen-veryDarkHeader tracking-tight leading-tight">
            Glimpse of Our Infrastructure & Hospitality
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto font-normal">
            At {COMPANY_NAME}, exceptional clinical outcomes are matched by world-class hospitality. Equipped with ultra-sterile surgical theaters, private post-procedure recovery suites, and a dedicated international patient concierge, we ensure a seamless and tranquil healing journey.
          </p>
        </div>

        {/* Masonry / Grid Gallery Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative h-72 sm:h-80 rounded-3xl overflow-hidden shadow-md cursor-pointer border border-gray-200/90 bg-white transform hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image */}
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Zoom Icon Button */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <ZoomIn className="w-5 h-5" />
              </div>

              {/* Card Label Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-nexgen-brightGold block mb-1">
                  {item.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold leading-snug">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-nexgen-veryDarkHeader">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-gray-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-nexgen-primaryGold" />
            <span>NABH & International Sterility Protocols</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-gray-200 shadow-xs">
            <Building className="w-4 h-4 text-nexgen-veryDarkHeader" />
            <span>4 Prime Urban Centers across India</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-gray-200 shadow-xs">
            <Sparkles className="w-4 h-4 text-nexgen-brightGold" />
            <span>VIP Chauffeur & 5-Star Partner Hospitality</span>
          </div>
        </div>

        {/* Image Modal Lightbox */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            >
              <button
                onClick={() => setSelectedImage(null)}
                aria-label="Close modal"
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[16/10] bg-black">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 bg-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-nexgen-primaryGold">
                    {selectedImage.category}
                  </span>
                  <h3 className="text-lg font-bold text-nexgen-veryDarkHeader mt-0.5">
                    {selectedImage.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
