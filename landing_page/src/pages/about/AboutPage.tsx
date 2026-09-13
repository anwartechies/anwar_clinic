"use client";

import React from "react";
import AboutHero from "./AboutHero";
import AboutJourneySection from "./AboutJourneySection";
import AboutLegacySection from "./AboutLegacySection";
import AboutClinicStandardsSection from "./AboutClinicStandardsSection";
import AboutMissionVisionSection from "./AboutMissionVisionSection";
import AboutCostCTASection from "./AboutCostCTASection";
import AboutExpertsPhilosophySection from "./AboutExpertsPhilosophySection";
import AboutCelebrityTrustSection from "./AboutCelebrityTrustSection";
import AboutComparisonTableSection from "./AboutComparisonTableSection";
import GoogleReviews from "@/pages/homepage/GoogleReviews";
import FAQSection from "@/pages/homepage/FAQSection";
import BottomBanner from "@/pages/homepage/BottomBanner";
import { useConsultation } from "@/context/ConsultationContext";
import OurServicesSection from "@/components/common/OurServicesSection";

export default function AboutPage() {
  const { openConsultation } = useConsultation();

  return (
    <div className="bg-white min-h-screen">
      {/* 1. About Us Hero Section */}
      <AboutHero />

      {/* 2. Our Journey - Transforming Hair Restoration in India */}
      <AboutJourneySection />

      {/* 3. Our Legacy in Hair Restoration */}
      <AboutLegacySection />

      {/* 4. International Standards, Local Care */}
      <AboutClinicStandardsSection />

      {/* 5. Mission & Vision */}
      {/* <AboutMissionVisionSection /> */}

      {/* 6. Interested in costs? CTA Banner */}
      <AboutCostCTASection onOpenConsultation={openConsultation} />

      {/* 7. Meet the Experts at QHT / Philosophy */}
      <AboutExpertsPhilosophySection onOpenConsultation={openConsultation} />

      {/* 8. Celebrities & Patients Who Trust QHT */}
      {/* <AboutCelebrityTrustSection /> */}

      {/* Google Reviews */}
      <GoogleReviews />

      {/* 9. How QHT Differs from Other Clinics */}
      <AboutComparisonTableSection />



      <OurServicesSection />
      {/* FAQs */}
      {/* <FAQSection /> */}

      {/* Bottom Banner */}
      <BottomBanner onOpenConsultation={openConsultation} />
    </div>
  );
}
