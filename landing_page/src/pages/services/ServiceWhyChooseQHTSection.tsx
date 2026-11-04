"use client";

import React from "react";
import { COMPANY_NAME } from "@/config/constants";

interface FeatureCard {
  id?: number;
  image: string;
  title: string;
  desc: string;
}

interface ServiceWhyChooseQHTSectionProps {
  title?: string;
  subtitle?: string;
  features?: FeatureCard[];
  onOpenConsultation?: () => void;
}

const DEFAULT_FEATURES: FeatureCard[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80",
    title: "Surgical Mastery",
    desc: `Surgeon-led procedures adhering to international medical protocols at ${COMPANY_NAME}.`,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
    title: "Artistic Hairline Geometry",
    desc: "Handcrafted angle and depth alignment ensuring soft, undetectable transitions.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80",
    title: "Maximum Follicle Viability",
    desc: "Ultra-fine micro-instrumentation designed to preserve 95%+ graft survival.",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    title: "Hospital-Grade Theaters",
    desc: `${COMPANY_NAME} operates in ultra-sterile surgical suites equipped with modern micro-restoration technology.`,
  },
];

const CLEAN_FEATURE_IMAGES: Record<string, string> = {
  "WORLD-CLASS TECHNIQUES": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
  "CELEBRITY TRUSTED": "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80",
  "AFFORDABILITY": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
  "PAN-INDIA CLINICS": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
  "PAN -INDIA CLINICS": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
  "EMI OPTIONS": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80",
};

const getCleanFeatureImage = (title: string, imgUrl?: string, idx = 0) => {
  if (imgUrl && !imgUrl.includes("nexgenhairtransplant.com") && !imgUrl.includes("transplant-img-")) {
    return imgUrl;
  }
  const upper = (title || "").toUpperCase().trim();
  for (const [key, cleanUrl] of Object.entries(CLEAN_FEATURE_IMAGES)) {
    if (upper.includes(key)) return cleanUrl;
  }
  const fallbackList = [
    "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-53-08-pm-mu46xz28f0p1lx.jpeg",
    "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-53-52-pm-mu46z5zwqbrtgd.jpeg",
    "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-7-55-37-pm-mu4713fhxp35ck.jpeg",
    "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-2-41-05-pm-mu3whz83hjbekh.jpeg",
    "https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/whatsapp-image-2026-09-16-at-8-03-52-pm-mu47c3sxpl41ro.jpeg",
  ];
  return fallbackList[idx % fallbackList.length];
};

export default function ServiceWhyChooseQHTSection({
  title = "Hair Restoration",
  subtitle = `At ${COMPANY_NAME}, our clinical protocols combine surgeon artistry, advanced micro-instruments, and structured aftercare for permanent, natural results.`,
  features = DEFAULT_FEATURES,
  onOpenConsultation,
}: ServiceWhyChooseQHTSectionProps) {
  const displayFeatures = (features && features.length > 0 ? features : DEFAULT_FEATURES).map(
    (item, idx) => ({
      ...item,
      image: getCleanFeatureImage(item.title, item.image, idx),
    })
  );

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-nexgen-mainDarkBg text-white overflow-hidden">
      <div className="qht-large-container">

        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[500] text-white tracking-tight leading-[1.18] max-w-xl">
            {title.toLowerCase().includes("why choose")
              ? title
              : `Why Choose ${COMPANY_NAME} for ${title}`}
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-md leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* 3-Column Card Grid (Photo Cards + Gold Review CTA Card) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">

          {/* Photo Cards */}
          {displayFeatures.map((item, idx) => (
            <div
              key={item.id ?? idx}
              className="relative aspect-[4/3.8] rounded-3xl overflow-hidden shadow-lg border border-white/10 group bg-black/20"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Dark Gradient Overlay for Title */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-7">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-md">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}

          {/* 5th Card: Gold Review & CTA Box */}
          <div className="aspect-[4/3.8] rounded-3xl p-7 sm:p-8 flex flex-col justify-between bg-nexgen-brightGold text-nexgen-veryDarkHeader shadow-xl">
            <div className="space-y-4">
              {/* Overlapping Patient Avatars */}
              <div className="flex -space-x-2">
                <img
                  src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/testimonial-3-mu2jxhk9h6w4rt.jpg"
                  alt="Patient avatar"
                  className="w-10 h-10 rounded-full border-2 border-nexgen-brightGold object-cover"
                />
                <img
                  src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/testimonial-2-mu2jxhc5aa4czi.jpg"
                  alt="Patient avatar"
                  className="w-10 h-10 rounded-full border-2 border-nexgen-brightGold object-cover"
                />
                <img
                  src="https://anwar-clinic-assets.s3.ap-south-1.amazonaws.com/media/testimonial-1-mu2jxgr4xjdvq4.jpg"
                  alt="Patient avatar"
                  className="w-10 h-10 rounded-full border-2 border-nexgen-brightGold object-cover"
                />
                <div className="w-10 h-10 rounded-full border-2 border-nexgen-brightGold bg-nexgen-veryDarkHeader text-nexgen-brightGold text-xs font-bold flex items-center justify-center">
                  +2.5k
                </div>
              </div>

              {/* Rating Text */}
              <p className="text-base sm:text-lg font-normal text-nexgen-veryDarkHeader leading-snug">
                <span className="font-bold text-nexgen-veryDarkHeader">2,500 satisfied patients</span>{" "}
                achieved lasting results with a 100% success rate.
              </p>
            </div>

            {/* CTA Button */}
            <div>
              <button
                onClick={onOpenConsultation}
                className="bg-nexgen-veryDarkHeader hover:brightness-125 text-white font-bold text-xs sm:text-sm py-3 px-8 rounded-full shadow-md transition-all active:scale-95 duration-150"
              >
                Book Now
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
