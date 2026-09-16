import { COMPANY_NAME } from "./constants";

export interface OfferBannerConfig {
  id?: string;
  isEnabled: boolean;
  badge?: string;
  title: string;
  highlightText?: string;
  /** Individual inclusions, listed on the /offer page. */
  perks?: string[];
  couponCode?: string;
  ctaText?: string;
  link?: string;
}

// Single source of truth for the current promotion — the top banner, the claim
// modal and the /offer page all read from here. Lives outside the banner's
// "use client" module so server components (the /offer page) can import it.
export const STATIC_OFFER: OfferBannerConfig = {
  isEnabled: true,
  badge: "Special Offer",
  title: `Book your ${COMPANY_NAME} Hair Transplant this month & get`,
  highlightText: "Free Scalp Diagnostics + 1 Year Post-Op Support",
  perks: ["Free Scalp Diagnostics", "1 Year Post-Op Support"],
  couponCode: "SAVE25",
  ctaText: "Claim Consultation",
};

/** Where a successful offer claim lands. */
export const OFFER_PAGE_PATH = "/offer";
