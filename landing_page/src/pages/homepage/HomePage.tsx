"use client";

import React from "react";
import { useConsultation } from "@/context/ConsultationContext";

import HeroSection from "./HeroSection";
import BaldTruthSection from "./BaldTruthSection";
import PromisesSection from "./PromisesSection";
import DifferenceSection from "./DifferenceSection";
import ExpertsJourney from "./ExpertsJourney";
import PricingTechniques from "./PricingTechniques";
import ImagePoster from "./ImagePoster";
import ServicesAccordion from "./ServicesAccordion";
import TransformationGallery from "./TransformationGallery";
import EbookCatalogueForm from "./EbookCatalogueForm";
import GoogleReviews from "./GoogleReviews";
import FAQSection from "./FAQSection";
import BottomBanner from "./BottomBanner";

export default function HomePage() {
  const { openConsultation } = useConsultation();

  return (
    <>
      {/* 1. Hero with Live Patient Carousel */}
      <HeroSection onOpenConsultation={openConsultation} />

      {/* 2. The Bald Truth (Dark Green 6-Card Slider) */}
      <BaldTruthSection />

      {/* 3. Our Promises (Section 1) + OT Gallery */}
      <PromisesSection />

      {/* 4. See the Difference that Matters (QHT vs Others) */}
      <DifferenceSection />

      {/* 5. Team of Experts (4-Stage Stepper: 0% to 100%) */}
      <ExpertsJourney />

      {/* 6. Hair Transplant Cost by Technique (FUT, FUE, QHT) */}
      <PricingTechniques onOpenConsultation={openConsultation} />

      {/* 7. Full-Width Clinic Banner Poster */}
      <ImagePoster />

      {/* 8. Our Services (Section 2) Accordion */}
      <ServicesAccordion onOpenConsultation={openConsultation} />

      {/* 9. Transformation Gallery (Section 3) Before/After Sliders */}
      <TransformationGallery onOpenConsultation={openConsultation} />

      {/* 10. Free E-Book Guide Lead Generation Form */}
      {/* <EbookCatalogueForm /> */}

      {/* 11. Verified Google Reviews Carousel */}
      <GoogleReviews />

      {/* 12. Frequently Asked Questions */}
      <FAQSection title={"Frequently Asked Questions"} />

      {/* 13. Bottom CTA Banner */}
      <BottomBanner onOpenConsultation={openConsultation} />
    </>
  );
}
