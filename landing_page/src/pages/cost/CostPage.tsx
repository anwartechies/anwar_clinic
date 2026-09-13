"use client";

import React from "react";
import CostHero from "./CostHero";
import CostTechniquesSection from "./CostTechniquesSection";
import CostNorwoodTableSection from "./CostNorwoodTableSection";
import CostFUTTableSection from "./CostFUTTableSection";
import CostQHTTableSection from "./CostQHTTableSection";
import CostResultsSection from "./CostResultsSection";
import CostFactorsSection from "./CostFactorsSection";
import CostCountryComparisonSection from "./CostCountryComparisonSection";
import CostWhyIndiaSection from "./CostWhyIndiaSection";
import CostReferenceGuideSection from "./CostReferenceGuideSection";
import CostEstimateCalculatorSection from "./CostEstimateCalculatorSection";
import CostVideoJourneySection from "./CostVideoJourneySection";
import CostByCitySection from "./CostByCitySection";
import GoogleReviews from "@/pages/homepage/GoogleReviews";
import ContactSection from "@/components/common/ContactSection";
import FAQSection from "@/pages/homepage/FAQSection";
import BottomBanner from "@/pages/homepage/BottomBanner";
import { useConsultation } from "@/context/ConsultationContext";

export default function CostPage() {
  const { openConsultation } = useConsultation();

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero Section + At a glance Card */}
      <CostHero onOpenConsultation={openConsultation} />

      {/* 2. Technique-Wise Pricing Grid */}
      <CostTechniquesSection onOpenConsultation={openConsultation} />

      {/* 3. FUE Hair Transplant Cost by Norwood Stage Table */}
      <CostNorwoodTableSection />

      {/* 4. FUT Hair Transplant Cost by Norwood Stage Table */}
      <CostFUTTableSection />

      {/* 5. QHT (Quick Hair Transplant) Cost Table */}
      <CostQHTTableSection />

      {/* 6. Results of Hair Transplant (Interactive Before/After Grid) */}
      <CostResultsSection />

      {/* 7. 6 Key Factors That Affect Cost */}
      <CostFactorsSection />

      {/* 8. Hair Transplant Cost: India vs Other Countries Comparison Table */}
      <CostCountryComparisonSection />

      {/* 9. Why India is the Smartest Choice Section + Numbers Card */}
      <CostWhyIndiaSection />

      {/* 10. Complete Reference Guide (8 Knowledge Blocks + Medical Disclaimer) */}
      <CostReferenceGuideSection />

      {/* 11. Interactive Cost Estimate Calculator Form */}
      <CostEstimateCalculatorSection onOpenConsultation={openConsultation} />

      {/* 12. Watch The Incredible Journey & Transformation (YouTube Video Grid) */}
      {/* <CostVideoJourneySection /> */}

      {/* 13. Google Verified Reviews */}
      <GoogleReviews />

      {/* 14. Hair Transplant Cost by City in India (22 Cities Grid) */}
      <CostByCitySection onOpenConsultation={openConsultation} />

      {/* 15. Contact Us Section */}
      {/* <ContactSection showLocations={true} /> */}

      {/* 4. FAQs */}
      <FAQSection />

      {/* 5. Bottom Banner CTA */}
      {/* <BottomBanner onOpenConsultation={openConsultation} /> */}
    </div>
  );
}
