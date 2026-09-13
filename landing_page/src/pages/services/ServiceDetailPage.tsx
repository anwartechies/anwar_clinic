"use client";

import React from "react";
import { useConsultation } from "@/context/ConsultationContext";
import ServiceDetailHero from "./ServiceDetailHero";
import ServiceIntroSection from "./ServiceIntroSection";
import ServiceResultsSection from "./ServiceResultsSection";
import ServiceCandidateSection from "./ServiceCandidateSection";
import ServiceTypesSection from "./ServiceTypesSection";
import ServiceBenefitsSection from "./ServiceBenefitsSection";
import ServiceProcedureSection from "./ServiceProcedureSection";
import ServicePreProcedureSection from "./ServicePreProcedureSection";
import ServiceCostSection from "./ServiceCostSection";
import ServiceWhyUsSection from "./ServiceWhyUsSection";
import ServiceJourneySection from "./ServiceJourneySection";
import ServiceCausesSection from "./ServiceCausesSection";
import ServiceWhyChooseQHTSection from "./ServiceWhyChooseQHTSection";
import ServicePostSurgerySupportSection from "./ServicePostSurgerySupportSection";
import ServiceDosDontsSection from "./ServiceDosDontsSection";
import ServiceRecoveryTimelineSection from "./ServiceRecoveryTimelineSection";
import ServiceBookingBar from "./ServiceBookingBar";
import ServiceComparisonSection from "./ServiceComparisonSection";
import ServiceFAQSection from "./ServiceFAQSection";
import GoogleReviews from "@/pages/homepage/GoogleReviews";
import ContactSection from "@/components/common/ContactSection";
import { ALL_SERVICES_LIST } from "@/data/allServicesData";
import { COMPANY_NAME } from "@/config/constants";


interface ServiceContent {
  slug: string;
  title: string;
  cardDescription?: string;
  cardImage?: string | null;
  sections?: Record<string, Record<string, unknown>>;
  hiddenSections?: string[];
}

interface ServiceDetailPageProps {
  slug?: string;
  /** Content from the admin panel. Absent for the bundled fallback service. */
  service?: ServiceContent | null;
}

function formatSlugToTitle(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ServiceDetailPage({ slug, service }: ServiceDetailPageProps) {
  const { openConsultation } = useConsultation();
  const normalizedSlug = (slug || "").replace(/\/$/, "");

  // Card data bundled with the site, used when the API has nothing for this slug.
  const matchedService = ALL_SERVICES_LIST.find(
    (item) => item.id === normalizedSlug || item.link.includes(normalizedSlug)
  );

  const title =
    service?.title || matchedService?.title || formatSlugToTitle(normalizedSlug);

  // Pulls a section's stored fields. Fields the editor left blank simply aren't
  // present, so each component falls back to its own DEFAULT_* constant.
  const sec = (key: string): Record<string, unknown> => service?.sections?.[key] ?? {};
  const hidden = (key: string) => service?.hiddenSections?.includes(key) ?? false;

  const heroFallbackImage =
    service?.cardImage && !service.cardImage.includes("qhtclinic.com")
      ? service.cardImage
      : matchedService?.image && !matchedService.image.includes("qhtclinic.com")
      ? matchedService.image
      : "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80";
  const heroFallbackSubtitle =
    service?.cardDescription ||
    matchedService?.desc ||
    `${title} solutions tailored by experts at ${COMPANY_NAME} Clinic.`;

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero */}
      {!hidden("hero") && (
        <ServiceDetailHero
          slug={normalizedSlug}
          title={title}
          subtitle={heroFallbackSubtitle}
          bannerImage={heroFallbackImage}
          pointerLabel="Precision treatment"
          onOpenConsultation={openConsultation}
          {...sec("hero")}
        />
      )}

      {/* 2. Intro — What is / In India */}
      {!hidden("intro") && (
        <ServiceIntroSection
          title={title}
          slug={normalizedSlug}
          onOpenConsultation={openConsultation}
          {...sec("intro")}
        />
      )}

      {/* 3. Results — Before / After */}
      {!hidden("results") && (
        <ServiceResultsSection
          title={title}
          subtitle={`Corrective Hair Transplant at ${COMPANY_NAME} Clinic focuses on hairline design, hair density, and no-scar growth, for long-term results in people with ${title}.`}
          onOpenConsultation={openConsultation}
          {...sec("results")}
        />
      )}

      {/* 4. Ideal Candidate */}
      {!hidden("candidate") && (
        <ServiceCandidateSection
          title={title}
          subtitle={`Customers with poor and unnatural hair density and scars from past surgeries, consider ${COMPANY_NAME} Clinic for a ${title}.`}
          onOpenConsultation={openConsultation}
          {...sec("candidate")}
        />
      )}

      {/* 5. Types of Procedure */}
      {!hidden("types") && (
        <ServiceTypesSection
          title={title}
          subtitle="To choose the best Corrective Hair Transplant technique, it’s important to know the methods available for it. These are:"
          {...sec("types")}
        />
      )}

      {/* 6. Benefits */}
      {!hidden("benefits") && (
        <ServiceBenefitsSection
          title={title}
          onOpenConsultation={openConsultation}
          {...sec("benefits")}
        />
      )}

      {/* 7. Procedure Steps */}
      {!hidden("procedure") && (
        <ServiceProcedureSection
          title={title}
          onOpenConsultation={openConsultation}
          {...sec("procedure")}
        />
      )}

      {/* 8. Pre-Procedure Tips */}
      {!hidden("preProcedure") && (
        <ServicePreProcedureSection title={title} {...sec("preProcedure")} />
      )}

      {/* 9. Cost in India */}
      {!hidden("cost") && <ServiceCostSection title={title} {...sec("cost")} />}

      {/* 10. Why Us */}
      {!hidden("whyUs") && (
        <ServiceWhyUsSection
          title={title}
          onOpenConsultation={openConsultation}
          {...sec("whyUs")}
        />
      )}

      {/* 11. Video Journey */}
      {!hidden("journey") && <ServiceJourneySection {...sec("journey")} />}

      {/* 12. Causes */}
      {!hidden("causes") && <ServiceCausesSection title={title} {...sec("causes")} />}

      {/* 13. Why Choose QHT */}
      {!hidden("whyChooseQHT") && (
        <ServiceWhyChooseQHTSection
          title={title}
          onOpenConsultation={openConsultation}
          {...sec("whyChooseQHT")}
        />
      )}

      {/* 14. Google Reviews — shared content, toggle only */}
      {!hidden("googleReviews") && <GoogleReviews />}

      {/* 15. Post-Surgery Support */}
      {!hidden("postSurgerySupport") && (
        <ServicePostSurgerySupportSection title={title} {...sec("postSurgerySupport")} />
      )}

      {/* 16. Do's and Don'ts */}
      {!hidden("dosDonts") && <ServiceDosDontsSection title={title} {...sec("dosDonts")} />}

      {/* 17. Recovery Timeline */}
      {!hidden("recoveryTimeline") && (
        <ServiceRecoveryTimelineSection title={title} {...sec("recoveryTimeline")} />
      )}

      {/* 18. Booking Bar */}
      {!hidden("bookingBar") && (
        <ServiceBookingBar onOpenConsultation={openConsultation} {...sec("bookingBar")} />
      )}

      {/* 19. Technique Comparison */}
      {!hidden("comparison") && (
        <ServiceComparisonSection title={title} {...sec("comparison")} />
      )}

      {/* 20. FAQ */}
      {!hidden("faq") && <ServiceFAQSection title={title} {...sec("faq")} />}

      {/* 21. Contact & Locations — shared content, toggle only */}
      {!hidden("contact") && <ContactSection showLocations={true} />}
    </div>
  );
}
