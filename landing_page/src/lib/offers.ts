import { OfferBannerConfig, STATIC_OFFER } from "@/config/offer";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:5050";

/**
 * Fetches the currently active promotional offer banner from the backend API.
 * Gracefully falls back to STATIC_OFFER if the backend is unreachable.
 */
export async function fetchActiveOffer(): Promise<OfferBannerConfig> {
  try {
    const res = await fetch(`${API_URL}/public/offers/active`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[offers] API responded with ${res.status}, falling back to static offer`);
      return STATIC_OFFER;
    }

    const data = await res.json();
    if (data && typeof data === "object") {
      // If no offer is currently active in the database
      if (data.isEnabled === false) {
        return {
          ...STATIC_OFFER,
          isEnabled: false,
        };
      }

      return {
        id: data.id,
        isEnabled: true,
        badge: data.badge ?? STATIC_OFFER.badge,
        title: data.title || STATIC_OFFER.title,
        highlightText: data.highlightText ?? STATIC_OFFER.highlightText,
        perks:
          Array.isArray(data.perks) && data.perks.length > 0 ? data.perks : STATIC_OFFER.perks,
        couponCode: data.couponCode ?? STATIC_OFFER.couponCode,
        ctaText: data.ctaText || STATIC_OFFER.ctaText,
        link: data.link || STATIC_OFFER.link || "/offer",
      };
    }

    return STATIC_OFFER;
  } catch {
    console.warn(`[offers] Could not reach ${API_URL}/public/offers/active, using static fallback`);
    return STATIC_OFFER;
  }
}
